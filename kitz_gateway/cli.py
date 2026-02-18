"""CLI entrypoint for Kitz Tool Gateway."""

from __future__ import annotations

import argparse

from .server import GatewayConfig, create_server


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Kitz Tool Gateway (v0.1).")
    parser.add_argument("--host", default="0.0.0.0", help="Host interface (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8787, help="Port (default: 8787)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    server = create_server(GatewayConfig(host=args.host, port=args.port))
    print(f"Kitz Tool Gateway v0.1 listening on http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
