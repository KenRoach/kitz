import type { Asset, AuthUser, ChatContext, PurchaseOrder } from "@/types";

interface BuildChatContextInput {
  user: AuthUser;
  assets: Asset[];
  orders: PurchaseOrder[];
  currentPage: string;
  locale: string;
}

export function buildChatContext(input: BuildChatContextInput): ChatContext {
  const { user, assets, orders, currentPage, locale } = input;

  // Portfolio metrics
  const totalOEM = assets.reduce((s, a) => s + (a.oem ?? 0), 0);
  const totalTPM = assets.reduce((s, a) => s + a.tpm, 0);
  const uniqueClients = new Set(assets.map((a) => a.client)).size;

  // Alert counts
  const expiring30 = assets.filter((a) => a.daysLeft >= 0 && a.daysLeft <= 30).length;
  const lapsed = assets.filter((a) => a.daysLeft < 0).length;
  const critical = assets.filter((a) => a.tier === "critical").length;

  // Pipeline breakdown
  const pipeline: Record<string, number> = {};
  for (const a of assets) {
    pipeline[a.status] = (pipeline[a.status] ?? 0) + 1;
  }

  // Order summary
  const pendingStatuses = new Set(["draft", "pending-approval", "approved"]);
  const pending = orders.filter((o) => pendingStatuses.has(o.status)).length;
  const fulfilled = orders.filter((o) => o.status === "fulfilled").length;
  const totalValue = orders.reduce((s, o) => s + o.total, 0);

  // Top 5 expiring assets (soonest first, only non-lapsed)
  const topExpiring = assets
    .filter((a) => a.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5)
    .map((a) => ({ brand: a.brand, model: a.model, client: a.client, daysLeft: a.daysLeft }));

  return {
    user: { name: user.name, role: user.role, orgId: user.orgId },
    portfolio: {
      totalDevices: assets.length,
      uniqueClients,
      totalOEM: Math.round(totalOEM),
      totalTPM: Math.round(totalTPM),
      savings: Math.round(totalOEM - totalTPM),
    },
    alerts: { expiring30, lapsed, critical },
    pipeline,
    orders: { total: orders.length, pending, fulfilled, totalValue: Math.round(totalValue) },
    topExpiring,
    currentPage,
    locale,
  };
}
