"""SMTP email module for warranty alert notifications (zero dependencies)."""

from __future__ import annotations

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

# Module-level SMTP config — set by cli.py at startup
_config: dict[str, Any] = {}


def configure(host: str, port: int, user: str, password: str, from_addr: str) -> None:
    """Set SMTP configuration at startup."""
    _config.update(host=host, port=port, user=user, password=password, from_addr=from_addr)


def is_configured() -> bool:
    return bool(_config.get("host"))


def send_email(to: str, subject: str, body: str, html_body: str = "") -> dict[str, Any]:
    """Send an email via SMTP."""
    if not is_configured():
        return {"sent": False, "error": "SMTP not configured"}

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = _config["from_addr"]
    msg["To"] = to

    msg.attach(MIMEText(body, "plain"))
    if html_body:
        msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(_config["host"], _config["port"]) as server:
            server.ehlo()
            if _config["port"] in (587, 465):
                server.starttls()
            if _config["user"]:
                server.login(_config["user"], _config["password"])
            server.sendmail(_config["from_addr"], [to], msg.as_string())
        return {"sent": True, "to": to, "subject": subject}
    except Exception as exc:
        return {"sent": False, "error": str(exc)}


# ── Warranty Alert Templates ──

_ALERT_SUBJECT = "⚠ Warranty Expiring: {brand} {model} ({days}d remaining)"

_ALERT_BODY = """Warranty Expiry Alert — RenewFlow

Device: {brand} {model} (S/N: {serial})
Client: {client}
Days Remaining: {days}
Tier: {tier}

Pricing:
  TPM: ${tpm}
  OEM: ${oem}
  Savings: ${savings} ({savings_pct}%)

Recommendation: {recommendation}

---
This is an automated alert from RenewFlow.
"""

_ALERT_HTML = """
<div style="font-family: 'DM Sans', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #00B894, #00A88A); padding: 16px 20px; border-radius: 12px 12px 0 0;">
    <h2 style="color: #fff; margin: 0; font-size: 16px;">Warranty Expiry Alert</h2>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
    <table style="width: 100%; font-size: 14px; color: #333;">
      <tr><td style="padding: 6px 0; color: #666;">Device</td><td style="font-weight: 600;">{brand} {model}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Serial</td><td>{serial}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Client</td><td>{client}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Days Left</td><td style="color: {urgency_color}; font-weight: 700;">{days} days</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">TPM Price</td><td style="color: #00B894; font-weight: 600;">${tpm}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">OEM Price</td><td>${oem}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Savings</td><td style="color: #00B894;">${savings} ({savings_pct}%)</td></tr>
    </table>
    <div style="margin-top: 16px; padding: 12px; background: #e8f8f5; border-radius: 8px; font-size: 13px;">
      <strong>Recommendation:</strong> {recommendation}
    </div>
  </div>
</div>
"""


def build_alert_for_asset(asset: dict[str, Any]) -> dict[str, str]:
    """Build email subject, body, and HTML for a warranty alert."""
    oem = asset.get("oem") or 0
    tpm = asset.get("tpm", 0)
    savings = oem - tpm
    savings_pct = round(savings / oem * 100) if oem > 0 else 0
    days = asset.get("daysLeft", 0)

    if asset.get("tier") == "critical":
        recommendation = "OEM coverage recommended for critical device."
    elif savings_pct >= 30:
        recommendation = f"TPM recommended — save {savings_pct}% (${savings})."
    else:
        recommendation = "Review both options with client."

    urgency_color = "#FF4757" if days <= 7 else "#FFA502" if days <= 30 else "#3742FA"

    ctx = {
        "brand": asset.get("brand", ""),
        "model": asset.get("model", ""),
        "serial": asset.get("serial", ""),
        "client": asset.get("client", ""),
        "tier": asset.get("tier", ""),
        "days": days,
        "tpm": tpm,
        "oem": oem,
        "savings": savings,
        "savings_pct": savings_pct,
        "recommendation": recommendation,
        "urgency_color": urgency_color,
    }

    return {
        "subject": _ALERT_SUBJECT.format(**ctx),
        "body": _ALERT_BODY.format(**ctx),
        "html": _ALERT_HTML.format(**ctx),
    }
