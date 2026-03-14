import { describe, it, expect } from "vitest";
import { buildAlertForAsset } from "../src/services/mailer.js";

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
});
