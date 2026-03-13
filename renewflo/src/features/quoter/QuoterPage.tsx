import { useState, type FC } from "react";
import { useTheme, MONO, FONT } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card } from "@/components/ui";
import { tierColor, urgencyColor } from "@/utils";
import type { Asset } from "@/types";

interface QuoterPageProps {
  assets: Asset[];
}

export const QuoterPage: FC<QuoterPageProps> = ({ assets }) => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);

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
          <button
            style={{
              background: colors.accent,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
              boxShadow: `0 2px 8px ${colors.accent}40`,
            }}
          >
            Generate Quote ({picked.length})
          </button>
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
              ["Total TPM", `$${totalTPM.toLocaleString()}`, colors.accent],
              ["Total OEM", `$${totalOEM.toLocaleString()}`, colors.text],
              ["Savings", `$${(totalOEM - totalTPM).toLocaleString()}`, colors.accent],
            ].map(([label, value, color], i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: colors.textMid, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: MONO }}>{value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
