import { useState, type FC } from "react";
import { useTheme, MONO, FONT } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card } from "@/components/ui";
import { tierColor, urgencyColor } from "@/utils";
import { createOrder, generateQuote, type QuoteResult } from "@/services/gateway";
import type { Asset, PageId } from "@/types";

interface QuoterPageProps {
  assets: Asset[];
  onNavigate?: (page: PageId) => void;
}

export const QuoterPage: FC<QuoterPageProps> = ({ assets, onNavigate }) => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const picked = assets.filter((a) => selected.includes(a.id));
  const totalTPM = picked.reduce((s, a) => s + a.tpm, 0);
  const totalOEM = picked.reduce((s, a) => s + (a.oem ?? 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>Quote Generator</h2>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>Select devices to quote TPM + OEM</p>
        </div>
        {picked.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={quoting}
              onClick={async () => {
                setQuoting(true);
                try {
                  const result = await generateQuote(picked);
                  setQuote(result);
                } catch {
                  // Fallback to rule-based if AI unavailable
                  setQuote(null);
                } finally {
                  setQuoting(false);
                }
              }}
              style={{
                background: quoting ? colors.textDim : colors.purple,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: quoting ? "wait" : "pointer",
                fontFamily: FONT,
                boxShadow: `0 2px 8px ${colors.purple}40`,
              }}
            >
              {quoting ? "Kitz Analyzing..." : `Kitz Quote (${picked.length})`}
            </button>
            <button
              disabled={creating}
              onClick={async () => {
                setCreating(true);
                const now = new Date();
                const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const poId = `PO-${3000 + Math.floor(Math.random() * 7000)}`;
                const quoteRef = quote?.quoteId ?? `Q-${5000 + Math.floor(Math.random() * 5000)}`;
                const client = picked[0]?.client ?? "Unknown";
                const useAiRecs = quote?.recommendations;
                try {
                  await createOrder({
                    id: poId,
                    client,
                    quoteRef,
                    status: "draft",
                    total: quote?.totalTpm ?? totalTPM,
                    created: dateStr,
                    updated: dateStr,
                    items: picked.map((a) => {
                      const rec = useAiRecs?.find((r) => r.assetId === a.id);
                      const coverageType = rec?.coverageType ?? (a.tier === "critical" ? "oem" as const : "tpm" as const);
                      const price = rec?.price ?? (coverageType === "oem" ? (a.oem ?? a.tpm) : a.tpm);
                      return {
                        assetId: a.id,
                        brand: a.brand,
                        model: a.model,
                        serial: a.serial,
                        coverageType,
                        price,
                        quantity: a.quantity ?? 1,
                      };
                    }),
                  });
                  setSelected([]);
                  setQuote(null);
                  onNavigate?.("orders");
                } catch {
                  // Silently fail — order may still show on next load
                } finally {
                  setCreating(false);
                }
              }}
              style={{
                background: creating ? colors.textDim : colors.accent,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: creating ? "wait" : "pointer",
                fontFamily: FONT,
                boxShadow: `0 2px 8px ${colors.accent}40`,
              }}
            >
              {creating ? "Creating PO..." : "Create PO"}
            </button>
          </div>
        )}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                {["", "Device", "S/N", "Client", "Tier", "Expires", "TPM", "OEM", "Savings"].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      color: colors.textMid,
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: "uppercase",
                      background: colors.inputBg,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => {
                const on = selected.includes(a.id);
                const savings = a.oem ? Math.round((1 - a.tpm / a.oem) * 100) : null;
                return (
                  <tr
                    key={a.id}
                    onClick={() => toggle(a.id)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      background: on ? colors.accentDim : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          border: `2px solid ${on ? colors.accent : colors.textDim}`,
                          background: on ? colors.accent : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {on && <Icon name="check" size={12} color="#fff" />}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 500, color: colors.text }}>
                      {a.brand} {a.model}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 12, color: colors.textMid }}>
                      {a.serial}
                    </td>
                    <td style={{ padding: "10px 14px", color: colors.text }}>{a.client}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <Badge color={tierColor(colors, a.tier)}>{a.tier}</Badge>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <Badge color={urgencyColor(colors, a.daysLeft)}>
                        {a.daysLeft < 0 ? "Lapsed" : `${a.daysLeft}d`}
                      </Badge>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, fontWeight: 600, color: colors.accent }}>
                      ${a.tpm}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, color: a.oem ? colors.text : colors.textDim }}>
                      {a.oem ? `$${a.oem}` : "N/A"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {savings !== null && <Badge color={colors.accent}>{savings}%</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {picked.length > 0 && (
        <Card style={{ marginTop: 16, background: `${colors.accent}08`, border: `1px solid ${colors.accent}25` }}>
          <span style={{ fontSize: 13, color: colors.textMid }}>Quote Summary &middot; {picked.length} device(s)</span>
          <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
            {[
              ["Total TPM", `$${(quote?.totalTpm ?? totalTPM).toLocaleString()}`, colors.accent],
              ["Total OEM", `$${(quote?.totalOem ?? totalOEM).toLocaleString()}`, colors.text],
              ["Savings", `$${(quote?.savings ?? (totalOEM - totalTPM)).toLocaleString()}`, colors.accent],
            ].map(([label, value, color], i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: colors.textMid, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: MONO }}>{value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {quote && (
        <Card style={{ marginTop: 16, background: `${colors.purple}08`, border: `1px solid ${colors.purple}25` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Badge color={colors.purple}>Kitz OS</Badge>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
              Quote {quote.quoteId}
            </span>
            {quote.savingsPct > 0 && (
              <Badge color={colors.accent}>{quote.savingsPct}% savings</Badge>
            )}
          </div>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "0 0 12px", lineHeight: 1.5 }}>
            {quote.summary}
          </p>
          {quote.recommendations.map((rec) => (
            <div
              key={rec.assetId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderTop: `1px solid ${colors.border}`,
                fontSize: 13,
              }}
            >
              <Badge color={rec.coverageType === "oem" ? colors.blue : colors.accent}>
                {rec.coverageType.toUpperCase()}
              </Badge>
              <Badge color={
                rec.risk === "critical" ? colors.danger :
                rec.risk === "high" ? colors.warn :
                colors.textMid
              }>
                {rec.risk}
              </Badge>
              <span style={{ color: colors.text, fontWeight: 500 }}>${rec.price}</span>
              <span style={{ color: colors.textMid, flex: 1 }}>{rec.reason}</span>
            </div>
          ))}
          {quote.clientEmail && (
            <div style={{ marginTop: 12, padding: 12, background: colors.inputBg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: colors.textMid, textTransform: "uppercase", marginBottom: 4 }}>
                Suggested Client Email
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>{quote.clientEmail.subject}</div>
              <div style={{ fontSize: 12, color: colors.textMid, marginTop: 4, whiteSpace: "pre-wrap" }}>
                {quote.clientEmail.body}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
