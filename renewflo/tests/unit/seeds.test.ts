import { describe, it, expect } from "vitest";
import { INITIAL_ASSETS, INBOX_DATA, PURCHASE_ORDERS, SUPPORT_LOGS, REWARDS_DATA } from "../../src/data/seeds";

describe("seed data integrity", () => {
  it("has initial assets with required fields", () => {
    expect(INITIAL_ASSETS.length).toBeGreaterThan(0);
    for (const asset of INITIAL_ASSETS) {
      expect(asset.id).toBeTruthy();
      expect(asset.brand).toBeTruthy();
      expect(asset.model).toBeTruthy();
      expect(asset.serial).toBeTruthy();
      expect(asset.client).toBeTruthy();
      expect(typeof asset.tpm).toBe("number");
    }
  });

  it("has unique asset IDs", () => {
    const ids = INITIAL_ASSETS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has inbox messages with subjects", () => {
    expect(INBOX_DATA.length).toBeGreaterThan(0);
    expect(INBOX_DATA.some((m) => m.unread)).toBe(true);
    for (const msg of INBOX_DATA) {
      expect(msg.subject).toBeTruthy();
    }
  });

  it("has purchase orders with valid statuses", () => {
    const validStatuses = ["draft", "pending-approval", "approved", "submitted", "acknowledged", "fulfilled", "cancelled"];
    expect(PURCHASE_ORDERS.length).toBeGreaterThan(0);
    for (const po of PURCHASE_ORDERS) {
      expect(validStatuses).toContain(po.status);
      expect(po.items.length).toBeGreaterThan(0);
      expect(po.total).toBeGreaterThan(0);
    }
  });

  it("has support tickets with valid statuses", () => {
    const validStatuses = ["open", "in-progress", "escalated", "resolved"];
    for (const ticket of SUPPORT_LOGS) {
      expect(validStatuses).toContain(ticket.status);
    }
  });

  it("has rewards data with valid structure", () => {
    expect(REWARDS_DATA.points).toBeGreaterThan(0);
    expect(REWARDS_DATA.history.length).toBeGreaterThan(0);
    expect(REWARDS_DATA.nextAt).toBeGreaterThan(REWARDS_DATA.points);
  });
});
