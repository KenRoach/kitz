"""Tool definitions and registry for Kitz Tool Gateway v0.1."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable


ToolFunc = Callable[[dict[str, Any]], dict[str, Any]]


@dataclass(frozen=True)
class Tool:
    """Represents an invokable tool in the gateway."""

    name: str
    description: str
    func: ToolFunc

    def invoke(self, args: dict[str, Any] | None = None) -> dict[str, Any]:
        return self.func(args or {})


class ToolRegistry:
    """Stores and invokes tools by name."""

    def __init__(self, tools: list[Tool] | None = None) -> None:
        self._tools = {tool.name: tool for tool in (tools or [])}

    def list_tools(self) -> list[dict[str, str]]:
        return [
            {"name": tool.name, "description": tool.description}
            for tool in self._tools.values()
        ]

    def invoke(self, tool_name: str, args: dict[str, Any] | None = None) -> dict[str, Any]:
        if tool_name not in self._tools:
            raise KeyError(f"unknown tool: {tool_name}")
        return self._tools[tool_name].invoke(args)


def _echo(args: dict[str, Any]) -> dict[str, Any]:
    return {"echo": args.get("message", "")}


def _utc_now(_: dict[str, Any]) -> dict[str, Any]:
    return {"utc_iso": datetime.now(tz=timezone.utc).isoformat()}


def _sum_numbers(args: dict[str, Any]) -> dict[str, Any]:
    numbers = args.get("numbers", [])
    if not isinstance(numbers, list) or any(not isinstance(n, (int, float)) for n in numbers):
        raise ValueError("'numbers' must be a list of int/float values")
    return {"sum": sum(numbers), "count": len(numbers)}


def default_registry() -> ToolRegistry:
    """Factory for built-in v0.1 tools."""

    return ToolRegistry(
        tools=[
            Tool(name="echo", description="Returns the provided message.", func=_echo),
            Tool(name="utc_now", description="Returns current UTC timestamp.", func=_utc_now),
            Tool(name="sum", description="Sums numeric values.", func=_sum_numbers),
        ]
    )
