/** Barrel export for all business tools. */

import type { ToolDef } from "../registry.js";
import { orderTools } from "./orders.js";
import { customerTools } from "./customers.js";
import { inventoryTools } from "./inventory.js";
import { expenseTools } from "./expenses.js";
import { insightTools } from "./insights.js";
import { invoiceTools } from "./invoices.js";

export const businessTools: ToolDef[] = [
  ...orderTools,
  ...customerTools,
  ...inventoryTools,
  ...expenseTools,
  ...insightTools,
  ...invoiceTools,
];
