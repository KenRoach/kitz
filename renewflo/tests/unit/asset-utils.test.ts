import { describe, it, expect } from "vitest";
import { tierColor, urgencyColor, statusLabel } from "../../src/utils/asset";
import { LIGHT } from "../../src/theme/tokens";

describe("tierColor", () => {
  it("returns danger for critical tier", () => {
    expect(tierColor(LIGHT, "critical")).toBe(LIGHT.danger);
  });

  it("returns blue for standard tier", () => {
    expect(tierColor(LIGHT, "standard")).toBe(LIGHT.blue);
  });

  it("returns textMid for low-use tier", () => {
    expect(tierColor(LIGHT, "low-use")).toBe(LIGHT.textMid);
  });

  it("returns textDim for eol tier", () => {
    expect(tierColor(LIGHT, "eol")).toBe(LIGHT.textDim);
  });
});

describe("urgencyColor", () => {
  it("returns danger for 7 days or less", () => {
    expect(urgencyColor(LIGHT, 7)).toBe(LIGHT.danger);
    expect(urgencyColor(LIGHT, 0)).toBe(LIGHT.danger);
    expect(urgencyColor(LIGHT, -5)).toBe(LIGHT.danger);
  });

  it("returns warn for 8-30 days", () => {
    expect(urgencyColor(LIGHT, 14)).toBe(LIGHT.warn);
    expect(urgencyColor(LIGHT, 30)).toBe(LIGHT.warn);
  });

  it("returns blue for 31-60 days", () => {
    expect(urgencyColor(LIGHT, 45)).toBe(LIGHT.blue);
    expect(urgencyColor(LIGHT, 60)).toBe(LIGHT.blue);
  });

  it("returns accent for 61+ days", () => {
    expect(urgencyColor(LIGHT, 90)).toBe(LIGHT.accent);
  });
});

describe("statusLabel", () => {
  it("maps known statuses", () => {
    expect(statusLabel("alerted-7")).toBe("7 days");
    expect(statusLabel("quoted")).toBe("Quoted");
    expect(statusLabel("lapsed")).toBe("Lapsed");
    expect(statusLabel("fulfilled")).toBe("Active");
  });

  it("returns raw status for unknown", () => {
    expect(statusLabel("unknown" as never)).toBe("unknown");
  });
});
