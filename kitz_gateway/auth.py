"""Authentication module for Kitz Gateway (zero dependencies, stdlib only)."""

from __future__ import annotations

import hashlib
import os
import secrets
import sqlite3
from typing import Any


def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()


def init_auth_tables(conn: sqlite3.Connection) -> None:
    """Create auth tables if they don't exist."""
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    # Seed a default admin user if none exists
    count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if count == 0:
        salt = secrets.token_hex(16)
        pwd_hash = _hash_password("admin", salt)
        conn.execute(
            "INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)",
            ("admin", pwd_hash, salt, "admin"),
        )
        conn.commit()


def login(conn: sqlite3.Connection, username: str, password: str) -> dict[str, Any] | None:
    """Authenticate user and return session token, or None if invalid."""
    row = conn.execute(
        "SELECT id, password_hash, salt, role FROM users WHERE username = ?",
        (username,),
    ).fetchone()
    if not row:
        return None

    user_id, stored_hash, salt, role = row
    if _hash_password(password, salt) != stored_hash:
        return None

    token = secrets.token_hex(32)
    conn.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
    conn.commit()
    return {"token": token, "username": username, "role": role}


def validate_token(conn: sqlite3.Connection, token: str) -> dict[str, Any] | None:
    """Validate a session token and return user info, or None."""
    row = conn.execute(
        """SELECT u.id, u.username, u.role FROM sessions s
           JOIN users u ON s.user_id = u.id WHERE s.token = ?""",
        (token,),
    ).fetchone()
    if not row:
        return None
    return {"id": row[0], "username": row[1], "role": row[2]}


def register_user(conn: sqlite3.Connection, username: str, password: str, role: str = "user") -> dict[str, Any]:
    """Register a new user."""
    salt = secrets.token_hex(16)
    pwd_hash = _hash_password(password, salt)
    conn.execute(
        "INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)",
        (username, pwd_hash, salt, role),
    )
    conn.commit()
    return {"username": username, "role": role}
