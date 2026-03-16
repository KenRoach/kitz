/** Business context loader — injects relevant data into brain prompts. */

import { getSupabase } from "../db/client.js";

export async function getBusinessContext(profileId: string): Promise<string> {
  const db = getSupabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, recentExpenses, lowStock, pendingDrafts] = await Promise.all([
    db.from("kz_orders").select("description, amount, created_at")
      .eq("profile_id", profileId)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
      .limit(10),
    db.from("kz_expenses").select("description, amount, category")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(5),
    db.from("kz_inventory").select("item_name, quantity, unit")
      .eq("profile_id", profileId)
      .lte("quantity", 5),
    db.from("kz_drafts").select("channel, recipient, content")
      .eq("profile_id", profileId)
      .eq("status", "pending")
      .limit(5),
  ]);

  const parts: string[] = [];

  // Today's sales
  const orders = todayOrders.data ?? [];
  if (orders.length > 0) {
    const total = orders.reduce((s, o) => s + Number(o.amount || 0), 0);
    parts.push(`Ventas hoy: ${orders.length} pedidos, $${total.toFixed(2)} total`);
  }

  // Recent expenses
  const expenses = recentExpenses.data ?? [];
  if (expenses.length > 0) {
    parts.push(`Últimos gastos: ${expenses.map((e) => `${e.description} $${e.amount}`).join(", ")}`);
  }

  // Low stock alerts
  const low = lowStock.data ?? [];
  if (low.length > 0) {
    parts.push(`Stock bajo: ${low.map((i) => `${i.item_name} (${i.quantity} ${i.unit})`).join(", ")}`);
  }

  // Pending drafts
  const drafts = pendingDrafts.data ?? [];
  if (drafts.length > 0) {
    parts.push(`Borradores pendientes: ${drafts.length}`);
  }

  return parts.join("\n");
}
