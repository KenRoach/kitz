import { describe, it, expect } from "vitest";
import { buildAlertForAsset, buildPasswordResetEmail } from "../src/services/mailer.js";

describe("buildAlertForAsset", () => {
  const baseAsset = {
    brand: "Dell",
    model: "Precision 5570",
    serial: "SN-001",
    client: "Grupo Alfa",
    days_left: 12,
    tier: "critical",
    oem: 489,
    tpm: 299,
  };

  it("generates correct subject line", () => {
    const { subject } = buildAlertForAsset(baseAsset);
    expect(subject).toContain("Dell Precision 5570");
    expect(subject).toContain("12d remaining");
  });

  it("recommends OEM for critical tier", () => {
    const { body } = buildAlertForAsset(baseAsset);
    expect(body).toContain("OEM coverage recommended");
  });

  it("recommends TPM when savings > 30%", () => {
    const standardAsset = { ...baseAsset, tier: "standard" };
    const { body } = buildAlertForAsset(standardAsset);
    expect(body).toContain("TPM recommended");
  });

  it("generates HTML with urgency color", () => {
    const urgentAsset = { ...baseAsset, days_left: 5 };
    const { html } = buildAlertForAsset(urgentAsset);
    expect(html).toContain("#dc2626"); // red for ≤7 days
  });

  it("uses orange for 8-30 day window", () => {
    const { html } = buildAlertForAsset(baseAsset); // 12 days
    expect(html).toContain("#f59e0b");
  });

  it("includes all asset fields in body", () => {
    const { body } = buildAlertForAsset(baseAsset);
    expect(body).toContain("Dell Precision 5570");
    expect(body).toContain("SN-001");
    expect(body).toContain("Grupo Alfa");
    expect(body).toContain("$489");
    expect(body).toContain("$299");
  });

  it("includes RenewFlow branding in HTML", () => {
    const { html } = buildAlertForAsset(baseAsset);
    expect(html).toContain("RenewFlow");
  });

  it("escapes HTML in asset fields", () => {
    const xssAsset = { ...baseAsset, client: '<script>alert("xss")</script>' };
    const { html } = buildAlertForAsset(xssAsset);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("buildPasswordResetEmail", () => {
  const resetUrl = "https://renewflow.io/reset-password?token=abc123";

  it("generates correct subject line", () => {
    const { subject } = buildPasswordResetEmail(resetUrl);
    expect(subject).toBe("Reset your RenewFlow password");
  });

  it("includes reset URL in plain text body", () => {
    const { body } = buildPasswordResetEmail(resetUrl);
    expect(body).toContain(resetUrl);
    expect(body).toContain("RenewFlow");
  });

  it("includes RenewFlow branding in HTML", () => {
    const { html } = buildPasswordResetEmail(resetUrl);
    expect(html).toContain("RenewFlow");
    expect(html).toContain("renewflow.io");
    expect(html).toContain("RF");
  });

  it("includes reset button with correct URL", () => {
    const { html } = buildPasswordResetEmail(resetUrl);
    expect(html).toContain(`href="${resetUrl}"`);
    expect(html).toContain("Reset Password");
  });

  it("includes fallback link for email clients that hide buttons", () => {
    const { html } = buildPasswordResetEmail(resetUrl);
    // Should have the URL mentioned twice — once in button, once as fallback text
    const matches = html.match(new RegExp(resetUrl.replace(/[?]/g, "\\?"), "g"));
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });

  it("includes expiry notice", () => {
    const { html } = buildPasswordResetEmail(resetUrl);
    expect(html).toContain("1 hour");
    const { body } = buildPasswordResetEmail(resetUrl);
    expect(body).toContain("1 hour");
  });

  it("includes copyright footer with renewflow.io", () => {
    const { html } = buildPasswordResetEmail(resetUrl);
    expect(html).toContain("renewflow.io");
    expect(html).toContain("LATAM IT channel partners");
  });

  it("escapes HTML in the reset URL", () => {
    const xssUrl = 'https://renewflow.io/reset?token="><script>alert(1)</script>';
    const { html } = buildPasswordResetEmail(xssUrl);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
