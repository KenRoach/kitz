# Kitz Tool Gateway (v0.1)

A lightweight HTTP gateway that exposes a tiny registry of callable tools.

## Features

- Versioned API (`/v0.1`)
- Built-in tools:
  - `echo`
  - `utc_now`
  - `sum`
- JSON request/response protocol
- Zero runtime dependencies (Python standard library only)

## Run

```bash
python -m kitz_gateway.cli --host 0.0.0.0 --port 8787
```

Or after install:

```bash
kitz-gateway --host 0.0.0.0 --port 8787
```

## API

### Health

```bash
curl -s http://127.0.0.1:8787/v0.1/health
```

### List tools

```bash
curl -s http://127.0.0.1:8787/v0.1/tools
```

### Invoke a tool

```bash
curl -s -X POST \
  http://127.0.0.1:8787/v0.1/tools/sum/invoke \
  -H 'content-type: application/json' \
  -d '{"args":{"numbers":[1,2,3.5]}}'
```

## Development

```bash
python -m pytest -q
```
