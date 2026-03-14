/** Built-in tools — echo, utc_now, sum. */

import type { ToolDef } from "./registry.js";

export const builtinTools: ToolDef[] = [
  {
    name: "echo",
    description: "Returns the provided message",
    handler: async (args) => ({ message: args.message ?? "" }),
  },
  {
    name: "utc_now",
    description: "Returns current UTC timestamp in ISO format",
    handler: async () => ({ utc: new Date().toISOString() }),
  },
  {
    name: "sum",
    description: "Sums a list of numeric values",
    handler: async (args) => {
      const values = args.values as number[];
      if (!Array.isArray(values)) throw new Error("values must be an array of numbers");
      return { total: values.reduce((a, b) => a + b, 0) };
    },
  },
];
