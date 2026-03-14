import { describe, it, expect } from "vitest";
import { ToolRegistry, ToolNotFoundError } from "../src/tools/registry.js";
import { builtinTools } from "../src/tools/builtin.js";

describe("ToolRegistry", () => {
  it("registers and lists tools", () => {
    const reg = new ToolRegistry();
    for (const t of builtinTools) reg.register(t);

    const list = reg.list();
    expect(list).toHaveLength(3);
    expect(list.map((t) => t.name)).toContain("echo");
    expect(list.map((t) => t.name)).toContain("utc_now");
    expect(list.map((t) => t.name)).toContain("sum");
  });

  it("invokes echo tool", async () => {
    const reg = new ToolRegistry();
    for (const t of builtinTools) reg.register(t);

    const result = await reg.invoke("echo", { message: "hello" });
    expect(result).toEqual({ message: "hello" });
  });

  it("invokes utc_now tool", async () => {
    const reg = new ToolRegistry();
    for (const t of builtinTools) reg.register(t);

    const result = (await reg.invoke("utc_now", {})) as { utc: string };
    expect(result.utc).toBeDefined();
    expect(new Date(result.utc).getTime()).toBeGreaterThan(0);
  });

  it("invokes sum tool", async () => {
    const reg = new ToolRegistry();
    for (const t of builtinTools) reg.register(t);

    const result = await reg.invoke("sum", { values: [1, 2, 3, 4, 5] });
    expect(result).toEqual({ total: 15 });
  });

  it("throws ToolNotFoundError for unknown tool", async () => {
    const reg = new ToolRegistry();
    await expect(reg.invoke("nonexistent", {})).rejects.toThrow(ToolNotFoundError);
  });

  it("has() returns correct values", () => {
    const reg = new ToolRegistry();
    for (const t of builtinTools) reg.register(t);

    expect(reg.has("echo")).toBe(true);
    expect(reg.has("nonexistent")).toBe(false);
  });
});
