"use client";

import { useState, useEffect, type FC } from "react";
import { useTheme, MONO, FONT } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card, Pill, SectionHeader, NewPOModal, EmptyState } from "@/components/ui";
import { listOrders } from "@/services/api";
import { PURCHASE_ORDERS } from "@/data/seeds";
import { useLocale } from "@/i18n";
import type { PurchaseOrder, POStatus, UserRole } from "@/types";
import { useRewardsStore } from "@/stores";

interface OrdersPageProps {
  userRole?: UserRole;
}

export const OrdersPage: FC<OrdersPageProps> = ({ userRole = "var" }) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [filter, setFilter] = useState<"all" | POStatus>("all");
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPO, setShowNewPO] = useState(false);
  const addPoints = useRewardsStore((s) => s.addPoints);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listOrders()
      .then((data) => {
        if (!cancelled) {
          const apiOrders = (data.orders || []) as PurchaseOrder[];
          setOrders(apiOrders.length > 0 ? apiOrders : PURCHASE_ORDERS);
        }
      })
      .catch(() => { if (!cancelled) setOrders(PURCHASE_ORDERS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const statusColor = (s: POStatus) =>
    ({
      draft: colors.textMid,
      "pending-approval": colors.warn,
      approved: colors.accent,
      submitted: colors.blue,
      acknowledged: colors.blue,
      fulfilled: colors.accent,
      cancelled: colors.danger,
    })[s] ?? colors.textMid;

  const statusLabel = (s: POStatus) =>
    ({
      draft: "Draft",
      "pending-approval": "Pending Approval",
      approved: "Approved",
      submitted: "Submitted",
      acknowledged: "Acknowledged",
      fulfilled: "Fulfilled",
      cancelled: "Cancelled",
    })[s] ?? s;

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: colors.textMid, fontSize: 14 }}>
        {t.loadingPOs}
      </div>
    );
  }

  const filtered =
    filter === "all" ? orders : orders.filter((po) => po.status === filter);

  const totalValue = orders.reduce((s, po) => s + po.total, 0);
  const activeCount = orders.filter(
    (po) => po.status !== "fulfilled" && po.status !== "cancelled",
  ).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>
            {userRole === "delivery-partner" ? t.assignedPOsTitle : userRole === "support" ? t.purchaseOrders : t.purchaseOrders}
          </h2>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
            {activeCount} {t.active} &middot; ${totalValue.toLocaleString()} {t.totalValueLabel}
          </p>
        </div>
        {userRole === "var" && (
          <button
            onClick={() => setShowNewPO(true)}
            style={{
              background: colors.accent,
              color: colors.onAccent,
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 2px 8px ${colors.accent}40`,
            }}
          >
            <Icon name="plus" size={14} color={colors.onAccent} /> {t.newPO}
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="order"
          title={t.noOrdersTitle}
          description={t.noOrdersDesc}
        />
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["all", "draft", "pending-approval", "approved", "fulfilled"] as const).map((s) => (
              <Pill key={s} active={filter === s} onClick={() => setFilter(s)}>
                {s === "all"
                  ? "All"
                  : s === "pending-approval"
                    ? "Pending"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
              </Pill>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((po) => (
              <Card
                key={po.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                }}
              >
                <Icon name="order" size={18} color={statusColor(po.status)} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{po.id}</span>
                    <Badge color={statusColor(po.status)}>{statusLabel(po.status)}</Badge>
                    {po.vendorPO && (
                      <span style={{ fontSize: 11, color: colors.textMid, fontFamily: MONO }}>
                        Vendor: {po.vendorPO}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: colors.text }}>{po.client}</div>
                  <div style={{ fontSize: 12, color: colors.textMid, marginTop: 2 }}>
                    {po.items.length} line item{po.items.length !== 1 ? "s" : ""} &middot; Quote{" "}
                    {po.quoteRef} &middot;{" "}
                    {po.items.map((i) => `${i.brand} ${i.model}`).join(", ")}
                  </div>
                  {po.deliveryPartner && (
                    <div style={{ fontSize: 11, color: colors.accent, marginTop: 2, fontWeight: 500 }}>
                      Routed to: {po.deliveryPartner}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: MONO }}
                  >
                    ${po.total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMid }}>{po.updated}</div>
                </div>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <Icon name="order" size={32} color={colors.textDim} />
              <div style={{ fontSize: 14, color: colors.textMid, marginTop: 12 }}>
                {t.noOrdersMatch}
              </div>
            </Card>
          )}

          {/* Summary */}
          <Card style={{ marginTop: 16 }}>
            <SectionHeader title={t.poPipeline} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(
                [
                  { stage: "Draft", status: "draft" as POStatus, color: colors.textMid },
                  { stage: "Pending Approval", status: "pending-approval" as POStatus, color: colors.warn },
                  { stage: "Approved", status: "approved" as POStatus, color: colors.accent },
                  { stage: "Submitted to Vendor", status: "submitted" as POStatus, color: colors.blue },
                  { stage: "Fulfilled", status: "fulfilled" as POStatus, color: colors.accent },
                ] as const
              ).map((s, i) => {
                const count = orders.filter((po) => po.status === s.status).length;
                const value = orders.filter((po) => po.status === s.status).reduce(
                  (sum, po) => sum + po.total,
                  0,
                );
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 4, height: 32, borderRadius: 2, background: s.color }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: colors.text }}>
                      {s.stage}
                    </span>
                    <span style={{ fontSize: 12, color: colors.textMid, fontFamily: MONO }}>
                      {count} PO{count !== 1 ? "s" : ""}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: s.color,
                        fontFamily: MONO,
                        minWidth: 60,
                        textAlign: "right",
                      }}
                    >
                      ${value.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      <NewPOModal
        open={showNewPO}
        onClose={() => setShowNewPO(false)}
        onSubmit={() => { setShowNewPO(false); addPoints("New purchase order created", 50); }}
      />
    </div>
  );
};
