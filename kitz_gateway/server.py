"""HTTP server implementation for Kitz Tool Gateway v0.1."""

from __future__ import annotations

import json
import mimetypes
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from .tools import ToolRegistry, default_registry
from .auth import init_auth_tables, login as auth_login, validate_token, reset_password, register_user


API_PREFIX = "/v0.1"


@dataclass
class GatewayConfig:
    host: str = "0.0.0.0"
    port: int = 8787
    static_dir: str | None = None  # Path to frontend dist/ folder


class GatewayHandler(BaseHTTPRequestHandler):
    registry: ToolRegistry
    db_conn: object  # sqlite3.Connection, typed loosely to avoid import
    auth_enabled: bool
    static_dir: str | None

    def do_OPTIONS(self) -> None:  # noqa: N802
        """Handle CORS preflight requests."""
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == f"{API_PREFIX}/health":
            self._send_json(HTTPStatus.OK, {"status": "ok", "version": "0.1"})
            return

        if path == f"{API_PREFIX}/tools":
            self._send_json(HTTPStatus.OK, {"tools": self.registry.list_tools()})
            return

        # Serve static files if configured (SPA fallback)
        if self.static_dir:
            self._serve_static(path)
            return

        self._send_json(HTTPStatus.NOT_FOUND, {"error": "not found"})

    def _serve_static(self, path: str) -> None:
        """Serve static files from the frontend dist/ directory."""
        static = Path(self.static_dir).resolve()
        # Map URL path to file, preventing path traversal
        file_path = (static / path.lstrip("/")).resolve()
        if not str(file_path).startswith(str(static)):
            self._send_json(HTTPStatus.FORBIDDEN, {"error": "forbidden"})
            return
        if file_path.is_file():
            self._send_file(file_path)
        else:
            # SPA fallback: serve index.html for all unknown routes
            index = static / "index.html"
            if index.is_file():
                self._send_file(index)
            else:
                self._send_json(HTTPStatus.NOT_FOUND, {"error": "not found"})

    def _send_file(self, file_path: Path) -> None:
        content_type, _ = mimetypes.guess_type(str(file_path))
        data = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path

        # Login endpoint — always open
        if path == f"{API_PREFIX}/auth/login":
            body = self._read_json_body()
            if body is None:
                return
            username = body.get("username", "")
            password = body.get("password", "")
            result = auth_login(self.db_conn, username, password)
            if result:
                self._send_json(HTTPStatus.OK, result)
            else:
                self._send_json(HTTPStatus.UNAUTHORIZED, {"error": "Invalid credentials"})
            return

        # Registration endpoint
        if path == f"{API_PREFIX}/auth/register":
            body = self._read_json_body()
            if body is None:
                return
            username = body.get("username", "").strip()
            password = body.get("password", "")
            if not username or not password:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "username and password are required"})
                return
            if len(username) < 3:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "Username must be at least 3 characters"})
                return
            if len(password) < 4:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "Password must be at least 4 characters"})
                return
            try:
                result = register_user(self.db_conn, username, password)
                self._send_json(HTTPStatus.CREATED, {"message": "Account created", **result})
            except Exception:
                self._send_json(HTTPStatus.CONFLICT, {"error": "Username already taken"})
            return

        # Password reset endpoint — requires current password
        if path == f"{API_PREFIX}/auth/reset-password":
            body = self._read_json_body()
            if body is None:
                return
            username = body.get("username", "")
            current_password = body.get("currentPassword", "")
            new_password = body.get("newPassword", "")
            if not username or not current_password or not new_password:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "username, currentPassword, and newPassword are required"})
                return
            if len(new_password) < 4:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "New password must be at least 4 characters"})
                return
            result = reset_password(self.db_conn, username, current_password, new_password)
            if result:
                self._send_json(HTTPStatus.OK, {"message": "Password updated", **result})
            else:
                self._send_json(HTTPStatus.UNAUTHORIZED, {"error": "Invalid username or current password"})
            return

        # Auth check for tool invocations
        if self.auth_enabled and not self._check_auth():
            return

        prefix = f"{API_PREFIX}/tools/"
        suffix = "/invoke"
        if not (path.startswith(prefix) and path.endswith(suffix)):
            self._send_json(HTTPStatus.NOT_FOUND, {"error": "not found"})
            return

        tool_name = path[len(prefix) : -len(suffix)]
        body = self._read_json_body()
        if body is None:
            return

        args = body.get("args", {}) if isinstance(body, dict) else {}
        try:
            result = self.registry.invoke(tool_name, args)
        except KeyError as exc:
            self._send_json(HTTPStatus.NOT_FOUND, {"error": str(exc)})
            return
        except ValueError as exc:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return

        self._send_json(HTTPStatus.OK, {"tool": tool_name, "result": result})

    def _check_auth(self) -> bool:
        """Validate Bearer token. Returns True if valid, sends 401 and returns False otherwise."""
        auth_header = self.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            self._send_json(HTTPStatus.UNAUTHORIZED, {"error": "Missing or invalid Authorization header"})
            return False
        token = auth_header[7:]
        user = validate_token(self.db_conn, token)
        if not user:
            self._send_json(HTTPStatus.UNAUTHORIZED, {"error": "Invalid or expired token"})
            return False
        return True

    def log_message(self, fmt: str, *args: Any) -> None:
        return

    def _read_json_body(self) -> dict[str, Any] | None:
        max_body = 10 * 1024 * 1024  # 10 MB
        content_len = int(self.headers.get("Content-Length", "0"))
        if content_len < 0 or content_len > max_body:
            self._send_json(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, {"error": "request too large"})
            return None
        raw = self.rfile.read(content_len) if content_len else b"{}"
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid json body"})
            return None

    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(data)


def create_server(
    config: GatewayConfig | None = None,
    registry: ToolRegistry | None = None,
    db_conn: object | None = None,
    auth_enabled: bool = False,
) -> ThreadingHTTPServer:
    cfg = config or GatewayConfig()
    reg = registry or default_registry()

    if db_conn is not None:
        init_auth_tables(db_conn)

    class BoundGatewayHandler(GatewayHandler):
        pass

    BoundGatewayHandler.registry = reg
    BoundGatewayHandler.db_conn = db_conn
    BoundGatewayHandler.auth_enabled = auth_enabled
    BoundGatewayHandler.static_dir = cfg.static_dir

    return ThreadingHTTPServer((cfg.host, cfg.port), BoundGatewayHandler)
