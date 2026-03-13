"""CLI entrypoint for Kitz Tool Gateway."""

from __future__ import annotations

import argparse
import os

from .server import GatewayConfig, create_server
from .db import init_db


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Kitz Tool Gateway (v0.1).")
    parser.add_argument("--host", default=os.environ.get("HOST", "0.0.0.0"), help="Host interface (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8787")), help="Port (default: 8787)")
    parser.add_argument("--auth", action="store_true", default=os.environ.get("AUTH_ENABLED", "").lower() in ("1", "true"), help="Enable token authentication")
    parser.add_argument("--smtp-host", default=os.environ.get("SMTP_HOST", ""), help="SMTP server host")
    parser.add_argument("--smtp-port", type=int, default=int(os.environ.get("SMTP_PORT", "587")), help="SMTP server port")
    parser.add_argument("--smtp-user", default=os.environ.get("SMTP_USER", ""), help="SMTP username")
    parser.add_argument("--smtp-pass", default=os.environ.get("SMTP_PASS", ""), help="SMTP password")
    parser.add_argument("--smtp-from", default=os.environ.get("SMTP_FROM", "alerts@renewflow.com"), help="SMTP from address")
    parser.add_argument("--static", default=os.environ.get("STATIC_DIR", ""), help="Serve frontend static files from this directory")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    conn = init_db()

    # Store SMTP config on the module level for email tools
    if args.smtp_host:
        from . import email as email_mod
        email_mod.configure(
            host=args.smtp_host,
            port=args.smtp_port,
            user=args.smtp_user,
            password=args.smtp_pass,
            from_addr=args.smtp_from,
        )

    static_dir = args.static if args.static else None
    server = create_server(
        GatewayConfig(host=args.host, port=args.port, static_dir=static_dir),
        db_conn=conn,
        auth_enabled=args.auth,
    )
    auth_label = " [auth enabled]" if args.auth else ""
    smtp_label = f" [smtp: {args.smtp_host}]" if args.smtp_host else ""
    static_label = f" [static: {static_dir}]" if static_dir else ""
    print(f"Kitz Tool Gateway v0.1 listening on http://{args.host}:{args.port}{auth_label}{smtp_label}{static_label}")
    server.serve_forever()


if __name__ == "__main__":
    main()
