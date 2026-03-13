"""Tool definitions and registry for Kitz Tool Gateway v0.1."""

from __future__ import annotations

import sqlite3
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


def _make_renewflo_tools(conn: sqlite3.Connection) -> list[Tool]:
    """Create RenewFlow domain tools backed by SQLite."""
    from .db import (
        query_assets, insert_assets, query_orders, insert_order,
        query_tickets, query_inbox, query_rewards,
    )

    def _list_assets(args: dict[str, Any]) -> dict[str, Any]:
        filters = {k: v for k, v in args.items() if k in ("client", "tier", "status", "brand", "max_days")}
        assets = query_assets(conn, filters if filters else None)
        return {"assets": assets, "count": len(assets)}

    def _add_assets(args: dict[str, Any]) -> dict[str, Any]:
        new_assets = args.get("assets", [])
        if not isinstance(new_assets, list):
            raise ValueError("'assets' must be a list")
        inserted = insert_assets(conn, new_assets)
        return {"inserted": inserted}

    def _get_asset_metrics(args: dict[str, Any]) -> dict[str, Any]:
        assets = query_assets(conn)
        total_oem = sum(a["oem"] or 0 for a in assets)
        total_tpm = sum(a["tpm"] for a in assets)
        clients = set(a["client"] for a in assets)
        return {
            "totalDevices": len(assets),
            "uniqueClients": len(clients),
            "totalOEM": total_oem,
            "totalTPM": total_tpm,
            "savings": total_oem - total_tpm,
            "alertCount": sum(1 for a in assets if 0 <= a["daysLeft"] <= 30),
            "lapsedCount": sum(1 for a in assets if a["daysLeft"] < 0),
            "quotedCount": sum(1 for a in assets if a["status"] == "quoted"),
        }

    def _generate_insights(args: dict[str, Any]) -> dict[str, Any]:
        assets = query_assets(conn)
        if not assets:
            return {"error": "No assets found"}

        # Client concentration
        client_counts: dict[str, int] = {}
        client_revenue: dict[str, float] = {}
        for a in assets:
            client_counts[a["client"]] = client_counts.get(a["client"], 0) + 1
            client_revenue[a["client"]] = client_revenue.get(a["client"], 0) + (a["oem"] or 0)

        total = len(assets)
        concentration = [
            {"client": c, "count": n, "pct": round(n / total * 100, 1)}
            for c, n in sorted(client_counts.items(), key=lambda x: -x[1])
        ]

        # Warranty expiry heatmap (buckets)
        buckets = {"critical_7d": 0, "urgent_14d": 0, "warning_30d": 0, "attention_60d": 0, "healthy_90d": 0, "lapsed": 0}
        for a in assets:
            d = a["daysLeft"]
            if d < 0:
                buckets["lapsed"] += 1
            elif d <= 7:
                buckets["critical_7d"] += 1
            elif d <= 14:
                buckets["urgent_14d"] += 1
            elif d <= 30:
                buckets["warning_30d"] += 1
            elif d <= 60:
                buckets["attention_60d"] += 1
            else:
                buckets["healthy_90d"] += 1

        # TPM vs OEM savings by brand
        brand_data: dict[str, dict[str, float]] = {}
        for a in assets:
            b = a["brand"]
            if b not in brand_data:
                brand_data[b] = {"oem": 0, "tpm": 0, "count": 0}
            brand_data[b]["oem"] += a["oem"] or 0
            brand_data[b]["tpm"] += a["tpm"]
            brand_data[b]["count"] += 1

        brand_savings = [
            {
                "brand": b,
                "oem": d["oem"],
                "tpm": d["tpm"],
                "savings": d["oem"] - d["tpm"],
                "savingsPct": round((d["oem"] - d["tpm"]) / d["oem"] * 100, 1) if d["oem"] > 0 else 0,
                "count": int(d["count"]),
            }
            for b, d in sorted(brand_data.items(), key=lambda x: -(x[1]["oem"] - x[1]["tpm"]))
        ]

        # Revenue at risk (assets expiring within 30 days)
        at_risk = [a for a in assets if 0 <= a["daysLeft"] <= 30]
        revenue_at_risk = sum(a["oem"] or 0 for a in at_risk)

        # Tier distribution
        tier_counts: dict[str, int] = {}
        for a in assets:
            tier_counts[a["tier"]] = tier_counts.get(a["tier"], 0) + 1

        tier_distribution = [
            {"tier": t, "count": n, "pct": round(n / total * 100, 1)}
            for t, n in sorted(tier_counts.items(), key=lambda x: -x[1])
        ]

        return {
            "clientConcentration": concentration,
            "expiryHeatmap": buckets,
            "brandSavings": brand_savings,
            "revenueAtRisk": revenue_at_risk,
            "atRiskDevices": len(at_risk),
            "tierDistribution": tier_distribution,
            "totalDevices": total,
        }

    def _list_orders(args: dict[str, Any]) -> dict[str, Any]:
        status = args.get("status")
        orders = query_orders(conn, status)
        return {"orders": orders, "count": len(orders)}

    def _create_order(args: dict[str, Any]) -> dict[str, Any]:
        required = ("id", "client", "quoteRef", "total", "items", "created", "updated")
        missing = [k for k in required if k not in args]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        order = insert_order(conn, args)
        return {"order": order}

    def _list_tickets(args: dict[str, Any]) -> dict[str, Any]:
        status = args.get("status")
        tickets = query_tickets(conn, status)
        return {"tickets": tickets, "count": len(tickets)}

    def _list_inbox(args: dict[str, Any]) -> dict[str, Any]:
        messages = query_inbox(conn)
        return {"messages": messages, "count": len(messages)}

    def _get_rewards(args: dict[str, Any]) -> dict[str, Any]:
        return query_rewards(conn)

    def _send_email(args: dict[str, Any]) -> dict[str, Any]:
        from .email import send_email, is_configured
        if not is_configured():
            return {"sent": False, "error": "SMTP not configured. Start gateway with --smtp-host."}
        to = args.get("to", "")
        subject = args.get("subject", "")
        body = args.get("body", "")
        html = args.get("html_body", "")
        if not to or not subject:
            raise ValueError("'to' and 'subject' are required")
        return send_email(to, subject, body, html)

    def _send_warranty_alerts(args: dict[str, Any]) -> dict[str, Any]:
        from .email import send_email, build_alert_for_asset, is_configured
        if not is_configured():
            return {"sent": 0, "error": "SMTP not configured"}
        max_days = args.get("max_days", 30)
        to_email = args.get("to", "")
        if not to_email:
            raise ValueError("'to' email address is required")
        assets = query_assets(conn, {"max_days": max_days})
        # Only alert for non-lapsed assets
        alertable = [a for a in assets if a["daysLeft"] >= 0]
        results = []
        for asset in alertable:
            alert = build_alert_for_asset(asset)
            result = send_email(to_email, alert["subject"], alert["body"], alert["html"])
            results.append({"asset": asset["id"], **result})
        return {"sent": len([r for r in results if r.get("sent")]), "total": len(alertable), "results": results}

    def _check_alerts(args: dict[str, Any]) -> dict[str, Any]:
        """Check which assets need warranty alerts (dry run, no emails sent)."""
        assets = query_assets(conn)
        schedule = [
            {"label": "7-day critical", "max": 7, "min": 0},
            {"label": "14-day urgent", "max": 14, "min": 8},
            {"label": "30-day warning", "max": 30, "min": 15},
            {"label": "60-day attention", "max": 60, "min": 31},
            {"label": "90-day awareness", "max": 90, "min": 61},
        ]
        alerts = []
        for bucket in schedule:
            matching = [a for a in assets if bucket["min"] <= a["daysLeft"] <= bucket["max"]]
            if matching:
                alerts.append({
                    "bucket": bucket["label"],
                    "count": len(matching),
                    "assets": [{"id": a["id"], "brand": a["brand"], "model": a["model"], "client": a["client"], "daysLeft": a["daysLeft"]} for a in matching],
                })
        lapsed = [a for a in assets if a["daysLeft"] < 0]
        return {"alertBuckets": alerts, "lapsedCount": len(lapsed), "totalAlertable": sum(b["count"] for b in alerts)}

    return [
        Tool(name="list_assets", description="List all assets with optional filtering.", func=_list_assets),
        Tool(name="add_assets", description="Bulk insert/update assets.", func=_add_assets),
        Tool(name="get_asset_metrics", description="Calculate asset portfolio metrics.", func=_get_asset_metrics),
        Tool(name="generate_insights", description="Deep analysis: concentration, heatmap, savings, risk.", func=_generate_insights),
        Tool(name="list_orders", description="List purchase orders with optional status filter.", func=_list_orders),
        Tool(name="create_order", description="Create a new purchase order.", func=_create_order),
        Tool(name="list_tickets", description="List support tickets with optional status filter.", func=_list_tickets),
        Tool(name="list_inbox", description="List inbox messages.", func=_list_inbox),
        Tool(name="get_rewards", description="Get rewards profile and history.", func=_get_rewards),
        Tool(name="send_email", description="Send an email via SMTP.", func=_send_email),
        Tool(name="send_warranty_alerts", description="Send warranty alert emails for expiring assets.", func=_send_warranty_alerts),
        Tool(name="check_alerts", description="Check which assets need warranty alerts (dry run).", func=_check_alerts),
    ]


def default_registry() -> ToolRegistry:
    """Factory for built-in v0.1 tools + RenewFlow domain tools."""
    from .db import init_db

    conn = init_db()

    builtin = [
        Tool(name="echo", description="Returns the provided message.", func=_echo),
        Tool(name="utc_now", description="Returns current UTC timestamp.", func=_utc_now),
        Tool(name="sum", description="Sums numeric values.", func=_sum_numbers),
    ]

    return ToolRegistry(tools=builtin + _make_renewflo_tools(conn))
