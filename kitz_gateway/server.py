"""HTTP server implementation for Kitz Tool Gateway v0.1."""

from __future__ import annotations

import json
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse

from .tools import ToolRegistry, default_registry


API_PREFIX = "/v0.1"


@dataclass
class GatewayConfig:
    host: str = "0.0.0.0"
    port: int = 8787


class GatewayHandler(BaseHTTPRequestHandler):
    registry: ToolRegistry

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == f"{API_PREFIX}/health":
            self._send_json(HTTPStatus.OK, {"status": "ok", "version": "0.1"})
            return

        if path == f"{API_PREFIX}/tools":
            self._send_json(HTTPStatus.OK, {"tools": self.registry.list_tools()})
            return

        self._send_json(HTTPStatus.NOT_FOUND, {"error": "not found"})

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
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

    def log_message(self, fmt: str, *args: Any) -> None:
        return

    def _read_json_body(self) -> dict[str, Any] | None:
        content_len = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_len) if content_len else b"{}"
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid json body"})
            return None

    def _send_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def create_server(config: GatewayConfig | None = None, registry: ToolRegistry | None = None) -> ThreadingHTTPServer:
    cfg = config or GatewayConfig()
    reg = registry or default_registry()

    class BoundGatewayHandler(GatewayHandler):
        registry = reg

    return ThreadingHTTPServer((cfg.host, cfg.port), BoundGatewayHandler)
