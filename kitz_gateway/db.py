"""SQLite persistence layer for RenewFlow data (zero dependencies)."""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent.parent / "data" / "renewflo.db"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    serial TEXT NOT NULL,
    client TEXT NOT NULL,
    tier TEXT NOT NULL,
    days_left INTEGER NOT NULL,
    oem REAL,
    tpm REAL NOT NULL,
    status TEXT NOT NULL,
    warranty_end TEXT,
    device_type TEXT,
    purchase_date TEXT,
    quantity INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    client TEXT NOT NULL,
    quote_ref TEXT NOT NULL,
    status TEXT NOT NULL,
    total REAL NOT NULL,
    created TEXT NOT NULL,
    updated TEXT NOT NULL,
    vendor_po TEXT,
    delivery_partner TEXT,
    notes TEXT,
    items TEXT NOT NULL  -- JSON array of line items
);

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    client TEXT NOT NULL,
    device TEXT NOT NULL,
    issue TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    created TEXT NOT NULL,
    assignee TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inbox (
    id INTEGER PRIMARY KEY,
    sender TEXT NOT NULL,
    company TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview TEXT NOT NULL,
    time TEXT NOT NULL,
    unread INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    points INTEGER NOT NULL,
    level TEXT NOT NULL,
    next_level TEXT NOT NULL,
    next_at INTEGER NOT NULL,
    history TEXT NOT NULL  -- JSON array
);
"""

# ── Seed data matching renewflo/src/data/seeds.ts ──

_SEED_ASSETS = [
    ("A-1001", "Dell", "Latitude 5540", "DLTG7X3", "Grupo Alfa", "critical", 7, 289, 149, "alerted-7", None, None, None, 1),
    ("A-1002", "HP", "EliteBook 840 G10", "HP2K9M1", "Rex Distribution", "standard", 14, 245, 119, "alerted-14", None, None, None, 1),
    ("A-1003", "Lenovo", "ThinkPad T14 Gen 4", "LNV8R2P", "Café Central", "standard", 28, 199, 99, "alerted-30", None, None, None, 1),
    ("A-1004", "Dell", "OptiPlex 7010", "DLQW5N8", "Grupo Alfa", "low-use", 45, 159, 79, "alerted-90", None, None, None, 1),
    ("A-1005", "HP", "ProDesk 400 G9", "HP7T3K2", "Beta Investments", "standard", 60, 189, 95, "alerted-60", None, None, None, 1),
    ("A-1006", "Lenovo", "ThinkCentre M70q", "LNVP4X1", "TechSoluciones", "low-use", 88, 139, 69, "alerted-90", None, None, None, 1),
    ("A-1007", "Dell", "Precision 5680", "DLM2W9K", "Modern Arch", "critical", 22, 449, 229, "quoted", None, None, None, 1),
    ("A-1008", "HP", "EliteDesk 800 G9", "HP5N1R7", "Grupo Alfa", "standard", -15, None, 109, "lapsed", None, None, None, 1),
]

_SEED_ORDERS = [
    ("PO-3001", "Grupo Alfa", "Q-5001", "approved", 745, "Mar 11", "Mar 11", "GA-2026-0042", "Dell Direct", None,
     json.dumps([{"assetId": "A-1001", "brand": "Dell", "model": "Latitude 5540", "serial": "DLTG7X3", "coverageType": "tpm", "price": 149, "quantity": 5}])),
    ("PO-3002", "Rex Distribution", "Q-5002", "pending-approval", 119, "Mar 10", "Mar 10", None, None, None,
     json.dumps([{"assetId": "A-1002", "brand": "HP", "model": "EliteBook 840 G10", "serial": "HP2K9M1", "coverageType": "tpm", "price": 119, "quantity": 1}])),
    ("PO-3003", "Modern Arch", "Q-5003", "draft", 449, "Mar 9", "Mar 9", None, None, None,
     json.dumps([{"assetId": "A-1007", "brand": "Dell", "model": "Precision 5680", "serial": "DLM2W9K", "coverageType": "oem", "price": 449, "quantity": 1}])),
    ("PO-3004", "Café Central", "Q-5004", "fulfilled", 297, "Mar 3", "Mar 7", "CC-2026-0018", "ServiceNet LATAM", None,
     json.dumps([{"assetId": "A-1003", "brand": "Lenovo", "model": "ThinkPad T14 Gen 4", "serial": "LNV8R2P", "coverageType": "tpm", "price": 99, "quantity": 3}])),
]

_SEED_TICKETS = [
    ("T-2001", "Grupo Alfa", "Dell Latitude 5540", "No display output", "open", "high", "Mar 11", "TPM"),
    ("T-2002", "Café Central", "ThinkPad T14 Gen 4", "Battery not charging", "in-progress", "medium", "Mar 10", "Lenovo"),
    ("T-2003", "Rex Distribution", "HP EliteBook 840 G10", "Keyboard defective", "resolved", "low", "Mar 8", "HP"),
    ("T-2004", "Modern Arch", "Dell Precision 5680", "Intermittent GPU error", "escalated", "critical", "Mar 7", "Dell"),
]

_SEED_INBOX = [
    (1, "Carlos Méndez", "Grupo Alfa", "RE: TPM Quote — 5 Dell Units", "We approve the TPM quote for the 5 Dell units. Please send PO.", "10:32 AM", 1),
    (2, "Ana Rodríguez", "Rex Distribution", "Quote Request — HP EliteBook", "Can you send me the quote for the HP EliteBook 840 G10?", "9:15 AM", 1),
    (3, "Pedro Silva", "TechSoluciones", "OEM Warranty Pricing", "What's the OEM warranty cost for the Lenovo units?", "Yesterday", 0),
    (4, "María Torres", "Beta Investments", "Warranty Renewal — 12 HP Devices", "Need to renew warranty on 12 HP devices. Can you generate a PO?", "Yesterday", 0),
    (5, "Luis García", "Café Central", "ThinkPad Screen Issue", "The ThinkPad has a screen issue — is this covered under warranty?", "Mar 9", 0),
]

_SEED_REWARDS = (
    1, 4750, "Gold", "Platinum", 7500,
    json.dumps([
        {"action": "Renewal closed — Grupo Alfa (5 devices)", "pts": 250, "date": "Mar 10"},
        {"action": "Referral: TechSoluciones signed up", "pts": 500, "date": "Mar 8"},
        {"action": "Quote sent — Rex Distribution", "pts": 50, "date": "Mar 7"},
        {"action": "Onboarding complete — Modern Arch", "pts": 200, "date": "Mar 5"},
        {"action": "Renewal closed — Café Central (3 devices)", "pts": 150, "date": "Mar 3"},
        {"action": "7-day daily usage streak", "pts": 100, "date": "Mar 2"},
    ]),
)


def get_connection() -> sqlite3.Connection:
    """Return a connection, creating the DB + schema if needed."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.executescript(_SCHEMA)
    return conn


def seed_if_empty(conn: sqlite3.Connection) -> None:
    """Populate tables with initial data when DB is fresh."""
    count = conn.execute("SELECT COUNT(*) FROM assets").fetchone()[0]
    if count > 0:
        return

    conn.executemany(
        "INSERT INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        _SEED_ASSETS,
    )
    conn.executemany(
        "INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        _SEED_ORDERS,
    )
    conn.executemany(
        "INSERT INTO tickets VALUES (?,?,?,?,?,?,?,?)",
        _SEED_TICKETS,
    )
    conn.executemany(
        "INSERT INTO inbox VALUES (?,?,?,?,?,?,?)",
        _SEED_INBOX,
    )
    conn.execute(
        "INSERT INTO rewards VALUES (?,?,?,?,?,?)",
        _SEED_REWARDS,
    )
    conn.commit()


def init_db() -> sqlite3.Connection:
    """Initialize DB, seed if empty, and return connection."""
    conn = get_connection()
    seed_if_empty(conn)
    return conn


# ── Query helpers ──

def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)


def query_assets(conn: sqlite3.Connection, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    sql = "SELECT * FROM assets"
    params: list[Any] = []
    clauses: list[str] = []

    if filters:
        if "client" in filters:
            clauses.append("client = ?")
            params.append(filters["client"])
        if "tier" in filters:
            clauses.append("tier = ?")
            params.append(filters["tier"])
        if "status" in filters:
            clauses.append("status = ?")
            params.append(filters["status"])
        if "brand" in filters:
            clauses.append("brand = ?")
            params.append(filters["brand"])
        if "max_days" in filters:
            clauses.append("days_left <= ?")
            params.append(filters["max_days"])

    if clauses:
        sql += " WHERE " + " AND ".join(clauses)

    rows = conn.execute(sql, params).fetchall()
    result = []
    for row in rows:
        d = _row_to_dict(row)
        # Convert snake_case DB columns → camelCase for frontend
        result.append({
            "id": d["id"],
            "brand": d["brand"],
            "model": d["model"],
            "serial": d["serial"],
            "client": d["client"],
            "tier": d["tier"],
            "daysLeft": d["days_left"],
            "oem": d["oem"],
            "tpm": d["tpm"],
            "status": d["status"],
            "warrantyEnd": d["warranty_end"],
            "deviceType": d["device_type"],
            "purchaseDate": d["purchase_date"],
            "quantity": d["quantity"],
        })
    return result


def insert_assets(conn: sqlite3.Connection, assets: list[dict[str, Any]]) -> int:
    inserted = 0
    for a in assets:
        conn.execute(
            "INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (
                a["id"], a["brand"], a["model"], a["serial"], a["client"],
                a["tier"], a.get("daysLeft", 0), a.get("oem"), a["tpm"],
                a.get("status", "discovered"),
                a.get("warrantyEnd"), a.get("deviceType"),
                a.get("purchaseDate"), a.get("quantity", 1),
            ),
        )
        inserted += 1
    conn.commit()
    return inserted


def query_orders(conn: sqlite3.Connection, status: str | None = None) -> list[dict[str, Any]]:
    if status:
        rows = conn.execute("SELECT * FROM orders WHERE status = ?", (status,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM orders").fetchall()

    result = []
    for row in rows:
        d = _row_to_dict(row)
        result.append({
            "id": d["id"],
            "client": d["client"],
            "quoteRef": d["quote_ref"],
            "status": d["status"],
            "total": d["total"],
            "created": d["created"],
            "updated": d["updated"],
            "vendorPO": d["vendor_po"],
            "deliveryPartner": d["delivery_partner"],
            "notes": d["notes"],
            "items": json.loads(d["items"]),
        })
    return result


def insert_order(conn: sqlite3.Connection, order: dict[str, Any]) -> dict[str, Any]:
    conn.execute(
        "INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (
            order["id"], order["client"], order["quoteRef"],
            order.get("status", "draft"), order["total"],
            order["created"], order["updated"],
            order.get("vendorPO"), order.get("deliveryPartner"),
            order.get("notes"),
            json.dumps(order["items"]),
        ),
    )
    conn.commit()
    return order


def query_tickets(conn: sqlite3.Connection, status: str | None = None) -> list[dict[str, Any]]:
    if status:
        rows = conn.execute("SELECT * FROM tickets WHERE status = ?", (status,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM tickets").fetchall()
    return [_row_to_dict(row) for row in rows]


def query_inbox(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute("SELECT * FROM inbox ORDER BY id").fetchall()
    result = []
    for row in rows:
        d = _row_to_dict(row)
        result.append({
            "id": d["id"],
            "from": d["sender"],
            "company": d["company"],
            "subject": d["subject"],
            "preview": d["preview"],
            "time": d["time"],
            "unread": bool(d["unread"]),
        })
    return result


def query_rewards(conn: sqlite3.Connection) -> dict[str, Any]:
    row = conn.execute("SELECT * FROM rewards WHERE id = 1").fetchone()
    if not row:
        return {"points": 0, "level": "Bronze", "nextLevel": "Silver", "nextAt": 1000, "history": []}
    d = _row_to_dict(row)
    return {
        "points": d["points"],
        "level": d["level"],
        "nextLevel": d["next_level"],
        "nextAt": d["next_at"],
        "history": json.loads(d["history"]),
    }
