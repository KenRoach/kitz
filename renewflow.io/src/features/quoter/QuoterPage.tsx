"use client";

import { useState, type FC } from "react";
import { useTheme, MONO, FONT } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { tierColor, urgencyColor, generateQuotePdf } from "@/utils";
import { generateQuote, sendQuoteEmail, type QuoteResult } from "@/services/api";
import { useAuthStore, useRewardsStore } from "@/stores";
import type { Asset } from "@/types";

interface QuoterPageProps {
  assets: Asset[];
}

type CoverageType = "tpm" | "oem";
type QuoterMode = "assets" | "new";

// ─── Device Catalog with Pricing (mirrors gateway CATALOG) ───
interface CatalogEntry { type: string; oem: number; tpm: number }
const DEVICE_CATALOG: Record<string, Record<string, CatalogEntry>> = {
  Dell: {
    "PowerEdge R760": { type: "Server", oem: 4890, tpm: 2450 },
    "PowerEdge R660": { type: "Server", oem: 3600, tpm: 1800 },
    "PowerEdge R760xs": { type: "Server", oem: 4200, tpm: 2100 },
    "PowerStore 1200T": { type: "Storage", oem: 18500, tpm: 9250 },
    "PowerStore 500T": { type: "Storage", oem: 12000, tpm: 6000 },
    "PowerSwitch S5248F": { type: "Network", oem: 2800, tpm: 1400 },
    "Latitude 5540": { type: "Laptop", oem: 450, tpm: 225 },
    "OptiPlex 7010": { type: "Desktop", oem: 380, tpm: 190 },
    "Precision 7680": { type: "Workstation", oem: 890, tpm: 445 },
  },
  HPE: {
    "ProLiant DL380 Gen11": { type: "Server", oem: 5200, tpm: 2680 },
    "ProLiant DL360 Gen11": { type: "Server", oem: 4600, tpm: 2300 },
    "ProLiant DL380 Gen10 Plus": { type: "Server", oem: 3800, tpm: 1900 },
    "Nimble Storage HF40": { type: "Storage", oem: 22400, tpm: 11200 },
    "Nimble Storage HF20": { type: "Storage", oem: 14200, tpm: 7100 },
    "Aruba 6300F": { type: "Network", oem: 3100, tpm: 1550 },
    "Aruba CX 8360": { type: "Network", oem: 5400, tpm: 2700 },
  },
  Cisco: {
    "Catalyst 9300-48P": { type: "Network", oem: 1890, tpm: 945 },
    "Catalyst 9200-48P": { type: "Network", oem: 1400, tpm: 700 },
    "Catalyst 9500-32C": { type: "Network", oem: 6200, tpm: 3100 },
    "UCS C240 M7": { type: "Server", oem: 6800, tpm: 3400 },
    "UCS C220 M7": { type: "Server", oem: 5200, tpm: 2600 },
    "ISR 4461": { type: "Network", oem: 4200, tpm: 2100 },
    "Nexus 9336C-FX2": { type: "Network", oem: 8500, tpm: 4250 },
  },
  Lenovo: {
    "ThinkSystem SR650 V3": { type: "Server", oem: 3200, tpm: 1600 },
    "ThinkSystem SR630 V3": { type: "Server", oem: 2800, tpm: 1400 },
    "ThinkSystem DE6000H": { type: "Storage", oem: 16000, tpm: 8000 },
    "ThinkAgile MX1021": { type: "Server", oem: 9500, tpm: 4750 },
    "ThinkPad T14s Gen 4": { type: "Laptop", oem: 520, tpm: 260 },
  },
  NetApp: {
    "AFF A250": { type: "Storage", oem: 12800, tpm: 6400 },
    "AFF A400": { type: "Storage", oem: 22000, tpm: 11000 },
    "AFF C250": { type: "Storage", oem: 9800, tpm: 4900 },
    "FAS2820": { type: "Storage", oem: 7600, tpm: 3800 },
  },
  Fortinet: {
    "FortiGate 200F": { type: "Security", oem: 6400, tpm: 3200 },
    "FortiGate 100F": { type: "Security", oem: 3800, tpm: 1900 },
    "FortiGate 60F": { type: "Security", oem: 1200, tpm: 600 },
    "FortiSwitch 248E-FPOE": { type: "Network", oem: 2400, tpm: 1200 },
    "FortiAP 231G": { type: "Network", oem: 800, tpm: 400 },
  },
  "Palo Alto": {
    "PA-3260": { type: "Security", oem: 8900, tpm: 4450 },
    "PA-850": { type: "Security", oem: 5200, tpm: 2600 },
    "PA-460": { type: "Security", oem: 2800, tpm: 1400 },
    "PA-220": { type: "Security", oem: 1200, tpm: 600 },
  },
  "Pure Storage": {
    "FlashArray//X50 R4": { type: "Storage", oem: 28000, tpm: 14000 },
    "FlashArray//X20 R4": { type: "Storage", oem: 18000, tpm: 9000 },
    "FlashArray//C40": { type: "Storage", oem: 22000, tpm: 11000 },
    "FlashBlade//S200": { type: "Storage", oem: 35000, tpm: 17500 },
  },
  Juniper: {
    "EX4400-48T": { type: "Network", oem: 3200, tpm: 1600 },
    "SRX4600": { type: "Security", oem: 12000, tpm: 6000 },
    "QFX5120-48T": { type: "Network", oem: 7200, tpm: 3600 },
    "MX204": { type: "Network", oem: 9000, tpm: 4500 },
  },
  APC: {
    "Smart-UPS SRT 10kVA": { type: "UPS", oem: 4800, tpm: 2400 },
    "Smart-UPS SRT 5kVA": { type: "UPS", oem: 2600, tpm: 1300 },
    "Symmetra PX 40kW": { type: "UPS", oem: 12000, tpm: 6000 },
    "NetShelter SX 42U": { type: "Infrastructure", oem: 800, tpm: 400 },
  },
};

const BRANDS = Object.keys(DEVICE_CATALOG);
const TIERS = ["critical", "standard", "low-use"];

interface NewLineItem {
  brand: string;
  model: string;
  tier: string;
  coverage: CoverageType;
  quantity: number;
}

const emptyLine = (): NewLineItem => ({
  brand: BRANDS[0]!,
  model: Object.keys(DEVICE_CATALOG[BRANDS[0]!]!)[0]!,
  tier: "standard",
  coverage: "tpm",
  quantity: 1,
});

export const QuoterPage: FC<QuoterPageProps> = ({ assets }) => {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const addPoints = useRewardsStore((s) => s.addPoints);

  // ── Shared state ──
  const [mode, setMode] = useState<QuoterMode>("assets");
  const [generating, setGenerating] = useState(false);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Email state ──
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: string[]; failed: string[] } | null>(null);

  // ── From Assets state ──
  const [selected, setSelected] = useState<string[]>([]);
  const [coverage, setCoverage] = useState<CoverageType>("tpm");

  // ── New Quote state ──
  const [lineItems, setLineItems] = useState<NewLineItem[]>([emptyLine()]);
  const [clientName, setClientName] = useState("");

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const selectAll = () =>
    setSelected((s) => (s.length === assets.length ? [] : assets.map((a) => a.id)));

  const picked = assets.filter((a) => selected.includes(a.id));
  const totalTPM = picked.reduce((s, a) => s + a.tpm, 0);
  const totalOEM = picked.reduce((s, a) => s + (a.oem ?? 0), 0);

  // ── Button style helpers ──
  const primaryBtn: React.CSSProperties = {
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
  };

  const secondaryBtn: React.CSSProperties = {
    background: colors.card,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: FONT,
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: colors.shadow,
  };

  const disabledPrimaryBtn: React.CSSProperties = {
    ...primaryBtn,
    background: colors.textDim,
    cursor: "not-allowed",
    boxShadow: "none",
    opacity: 0.7,
  };

  const selectStyle: React.CSSProperties = {
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.text,
    fontSize: 12,
    fontFamily: FONT,
    outline: "none",
    cursor: "pointer",
    minWidth: 0,
    flex: 1,
  };

  // ── Generate handlers ──
  const handleGenerateFromAssets = async () => {
    if (selected.length === 0) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateQuote(selected, coverage);
      setQuote(result);
      generateQuotePdf(result);
    } catch {
      // Gateway unavailable — generate quote client-side from asset data
      const quoteId = `Q-${4000 + Math.floor(Math.random() * 1000)}`;
      const clients = [...new Set(picked.map((a) => a.client))];
      const quoteItems = picked.map((a) => ({
        assetId: a.id,
        brand: a.brand,
        model: a.model,
        serial: a.serial,
        client: a.client,
        deviceType: DEVICE_CATALOG[a.brand]?.[a.model]?.type ?? "Other",
        tier: a.tier,
        daysLeft: a.daysLeft,
        tpmPrice: a.tpm,
        oemPrice: a.oem,
        selectedCoverage: coverage,
        lineTotal: coverage === "oem" ? (a.oem ?? a.tpm) : a.tpm,
      }));
      const totalTPMVal = quoteItems.reduce((s, i) => s + i.tpmPrice, 0);
      const totalOEMVal = quoteItems.reduce((s, i) => s + (i.oemPrice ?? 0), 0);
      const selectedTotal = quoteItems.reduce((s, i) => s + i.lineTotal, 0);
      const savings = totalOEMVal - totalTPMVal;
      const savingsPct = totalOEMVal > 0 ? Math.round((savings / totalOEMVal) * 100) : 0;

      const result: QuoteResult = {
        quoteId,
        date: new Date().toISOString().slice(0, 10),
        coverageType: coverage,
        deviceCount: picked.length,
        clients,
        items: quoteItems,
        summary: { totalTPM: totalTPMVal, totalOEM: totalOEMVal, selectedTotal, savings, savingsPct },
        status: "generated",
      };
      setQuote(result);
      generateQuotePdf(result);
      addPoints(`Quote generated: ${result.deviceCount} device(s) — $${result.summary.selectedTotal.toLocaleString()}`, 25);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCustom = () => {
    if (lineItems.length === 0 || !clientName.trim()) return;
    setError(null);

    const client = clientName.trim();
    const quoteId = `Q-${5000 + Math.floor(Math.random() * 1000)}`;

    const quoteItems = lineItems.map((li, idx) => {
      const entry = DEVICE_CATALOG[li.brand]?.[li.model];
      const pricing = entry ?? { oem: 1000, tpm: 500, type: "Other" };
      const lineTotal = li.coverage === "oem"
        ? pricing.oem * li.quantity
        : pricing.tpm * li.quantity;

      return {
        assetId: `NEW-${idx + 1}`,
        brand: li.brand,
        model: li.model,
        serial: "TBD",
        client,
        deviceType: pricing.type,
        tier: li.tier,
        daysLeft: 0,
        tpmPrice: pricing.tpm * li.quantity,
        oemPrice: pricing.oem * li.quantity,
        selectedCoverage: li.coverage,
        lineTotal,
      };
    });

    const totalTPMVal = quoteItems.reduce((s, i) => s + i.tpmPrice, 0);
    const totalOEMVal = quoteItems.reduce((s, i) => s + i.oemPrice, 0);
    const selectedTotal = quoteItems.reduce((s, i) => s + i.lineTotal, 0);
    const savings = totalOEMVal - totalTPMVal;
    const savingsPct = totalOEMVal > 0 ? Math.round((savings / totalOEMVal) * 100) : 0;

    const result: QuoteResult = {
      quoteId,
      date: new Date().toISOString().slice(0, 10),
      coverageType: lineItems[0]?.coverage ?? "tpm",
      deviceCount: lineItems.reduce((s, li) => s + li.quantity, 0),
      clients: [client],
      items: quoteItems,
      summary: { totalTPM: totalTPMVal, totalOEM: totalOEMVal, selectedTotal, savings, savingsPct },
      status: "generated",
    };

    setQuote(result);
    // Auto-download the PDF
    generateQuotePdf(result);
  };

  const handleBack = () => {
    setQuote(null);
    setError(null);
    setShowEmailModal(false);
    setSendResult(null);
    setEmailList([]);
    setEmailInput("");
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !emailList.includes(email)) {
      setEmailList((prev) => [...prev, email]);
      setEmailInput("");
    }
  };

  const removeEmail = (email: string) =>
    setEmailList((prev) => prev.filter((e) => e !== email));

  const handleSendQuote = async () => {
    if (!quote || emailList.length === 0) return;
    setSending(true);
    setSendResult(null);
    try {
      const result = await sendQuoteEmail(
        emailList,
        quote,
        user?.name || "RenewFlow User",
        user?.email || "noreply@renewflow.io",
      );
      setSendResult({ sent: result.sent, failed: result.failed });
      if (result.sent.length > 0) {
        addPoints(`Quote emailed to ${result.sent.length} recipient(s)`, 15);
      }
    } catch {
      setSendResult({ sent: [], failed: emailList });
    } finally {
      setSending(false);
    }
  };

  const updateLine = (idx: number, patch: Partial<NewLineItem>) => {
    setLineItems((items) =>
      items.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, ...patch };
        // If brand changed, reset model to first available
        if (patch.brand && patch.brand !== item.brand) {
          const models = Object.keys(DEVICE_CATALOG[patch.brand] ?? {});
          updated.model = models[0] ?? "";
        }
        return updated;
      }),
    );
  };

  const removeLine = (idx: number) =>
    setLineItems((items) => (items.length <= 1 ? items : items.filter((_, i) => i !== idx)));

  const addLine = () => setLineItems((items) => [...items, emptyLine()]);

  // ─── Quote Result View ───
  if (quote) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>
              Quote {quote.quoteId}
            </h2>
            <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
              Generated {quote.date} &middot; {quote.deviceCount} device(s) &middot; {quote.coverageType.toUpperCase()} coverage
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => generateQuotePdf(quote)} style={primaryBtn}>
              <Icon name="download" size={14} color="#fff" /> Download PDF
            </button>
            <button onClick={() => { setShowEmailModal(true); setSendResult(null); }} style={primaryBtn}>
              <Icon name="inbox" size={14} color="#fff" /> Send Quote
            </button>
            <button onClick={handleBack} style={secondaryBtn}>
              <Icon name="refresh" size={14} color={colors.accent} /> New Quote
            </button>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <Card style={{ marginBottom: 16, border: `1px solid ${colors.accent}25`, background: `${colors.accent}04` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                <Icon name="inbox" size={14} color={colors.accent} /> Send Quote via Email
              </div>
              <button onClick={() => setShowEmailModal(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <Icon name="close" size={14} color={colors.textMid} />
              </button>
            </div>

            {/* Email chips */}
            {emailList.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {emailList.map((email) => (
                  <div
                    key={email}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: colors.accentDim,
                      border: `1px solid ${colors.accent}30`,
                      borderRadius: 20,
                      padding: "4px 10px",
                      fontSize: 12,
                      color: colors.accent,
                      fontWeight: 500,
                    }}
                  >
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                    >
                      <Icon name="close" size={10} color={colors.accent} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Email input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
                placeholder="Enter email address and press Enter"
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBg,
                  color: colors.text,
                  fontSize: 13,
                  fontFamily: FONT,
                  outline: "none",
                }}
              />
              <button onClick={addEmail} style={secondaryBtn}>
                Add
              </button>
            </div>

            <p style={{ fontSize: 11, color: colors.textMid, margin: "0 0 12px" }}>
              Add VAR and delivery partner email addresses. Quote details will be sent as a branded email.
            </p>

            {/* Send result */}
            {sendResult && (
              <div style={{ marginBottom: 12 }}>
                {sendResult.sent.length > 0 && (
                  <div style={{ fontSize: 12, color: colors.accent, fontWeight: 500, marginBottom: 4 }}>
                    ✓ Sent to: {sendResult.sent.join(", ")}
                  </div>
                )}
                {sendResult.failed.length > 0 && (
                  <div style={{ fontSize: 12, color: colors.danger, fontWeight: 500 }}>
                    ✗ Failed: {sendResult.failed.join(", ")}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSendQuote}
              disabled={sending || emailList.length === 0}
              style={sending || emailList.length === 0 ? disabledPrimaryBtn : primaryBtn}
            >
              <Icon name="inbox" size={14} color="#fff" />
              {sending ? "Sending..." : `Send to ${emailList.length} recipient${emailList.length !== 1 ? "s" : ""}`}
            </button>
          </Card>
        )}

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Total TPM", value: `$${quote.summary.totalTPM.toLocaleString()}`, color: colors.accent },
            { label: "Total OEM", value: `$${quote.summary.totalOEM.toLocaleString()}`, color: colors.text },
            { label: "Savings", value: `$${quote.summary.savings.toLocaleString()}`, color: colors.accent },
            { label: "Savings %", value: `${quote.summary.savingsPct}%`, color: colors.warn },
          ].map((m, i) => (
            <Card key={i}>
              <div style={{ fontSize: 11, color: colors.textMid, textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: m.color, fontFamily: MONO }}>{m.value}</div>
            </Card>
          ))}
        </div>

        {/* Clients */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {quote.clients.map((c) => (
              <Badge key={c} color={colors.accent}>{c}</Badge>
            ))}
          </div>
        </div>

        {/* Quote Line Items */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
            <SectionHeader title="Line Items" />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {["Device", "S/N", "Client", "Type", "Tier", "Expires", "TPM", "OEM", "Selected"].map((h, i) => (
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
                {quote.items.map((item) => (
                  <tr key={item.assetId} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "10px 14px", fontWeight: 500, color: colors.text }}>
                      {item.brand} {item.model}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 12, color: colors.textMid }}>
                      {item.serial}
                    </td>
                    <td style={{ padding: "10px 14px", color: colors.text }}>{item.client}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <Badge color={colors.blue}>{item.deviceType}</Badge>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <Badge color={tierColor(colors, item.tier as Asset["tier"])}>{item.tier}</Badge>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <Badge color={urgencyColor(colors, item.daysLeft)}>
                        {item.daysLeft < 0 ? "Lapsed" : item.daysLeft === 0 ? "New" : `${item.daysLeft}d`}
                      </Badge>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, color: colors.accent }}>
                      ${item.tpmPrice.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, color: item.oemPrice ? colors.text : colors.textDim }}>
                      {item.oemPrice ? `$${item.oemPrice.toLocaleString()}` : "N/A"}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, fontWeight: 700, color: colors.accent }}>
                      ${item.lineTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: colors.inputBg }}>
                  <td colSpan={8} style={{ padding: "12px 14px", fontWeight: 600, color: colors.text, textAlign: "right" }}>
                    Quote Total ({quote.coverageType.toUpperCase()})
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: MONO, fontWeight: 700, fontSize: 16, color: colors.accent }}>
                    ${quote.summary.selectedTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Selection View ───
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>Rapid Quote Generator</h2>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
            {mode === "assets"
              ? "Select devices from your installed base"
              : "Build a custom quote with brand and model selection"}
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          overflow: "hidden",
          marginBottom: 20,
          width: "fit-content",
        }}
      >
        {([["assets", "From Assets"], ["new", "New Quote"]] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: FONT,
              border: "none",
              cursor: "pointer",
              background: mode === m ? colors.accent : "transparent",
              color: mode === m ? "#fff" : colors.textMid,
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            fontSize: 13,
            color: colors.danger,
            background: colors.dangerDim,
            border: `1px solid ${colors.danger}25`,
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* ─── FROM ASSETS MODE ─── */}
      {mode === "assets" && (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            {/* Coverage Toggle */}
            <div
              style={{
                display: "flex",
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                overflow: "hidden",
              }}
            >
              {(["tpm", "oem"] as CoverageType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setCoverage(type)}
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: FONT,
                    border: "none",
                    cursor: "pointer",
                    background: coverage === type ? colors.accent : "transparent",
                    color: coverage === type ? "#fff" : colors.textMid,
                  }}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            {picked.length > 0 && (
              <button
                onClick={handleGenerateFromAssets}
                disabled={generating}
                style={generating ? disabledPrimaryBtn : primaryBtn}
              >
                <Icon name="quote" size={14} color="#fff" />
                {generating ? "Generating..." : `Generate Quote (${picked.length})`}
              </button>
            )}
          </div>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", background: colors.inputBg }}>
                      <div
                        onClick={selectAll}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          border: `2px solid ${selected.length === assets.length && assets.length > 0 ? colors.accent : colors.textDim}`,
                          background: selected.length === assets.length && assets.length > 0 ? colors.accent : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {selected.length === assets.length && assets.length > 0 && <Icon name="check" size={12} color="#fff" />}
                      </div>
                    </th>
                    {["Device", "S/N", "Client", "Tier", "Expires", "TPM", "OEM", "Savings"].map((h, i) => (
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
                          ${a.tpm.toLocaleString()}
                        </td>
                        <td style={{ padding: "10px 14px", fontFamily: MONO, color: a.oem ? colors.text : colors.textDim }}>
                          {a.oem ? `$${a.oem.toLocaleString()}` : "N/A"}
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
              <span style={{ fontSize: 13, color: colors.textMid }}>Quote Preview &middot; {picked.length} device(s) &middot; {coverage.toUpperCase()} coverage</span>
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
        </>
      )}

      {/* ─── NEW QUOTE MODE ─── */}
      {mode === "new" && (
        <>
          <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
            {/* Client + Actions bar */}
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", whiteSpace: "nowrap" }}>Client</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Grupo Alfa, Banco del Pacífico"
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  borderRadius: 7,
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBg,
                  color: colors.text,
                  fontSize: 12,
                  fontFamily: FONT,
                  outline: "none",
                }}
              />
              <button
                onClick={addLine}
                style={{
                  background: "none",
                  border: `1px solid ${colors.border}`,
                  borderRadius: 7,
                  padding: "6px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: colors.accent,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon name="plus" size={12} color={colors.accent} /> Add
              </button>
            </div>

            {/* Column Headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "22px 120px 1fr 62px 82px 68px 42px 20px",
                gap: 6,
                padding: "7px 14px 5px",
                background: colors.inputBg,
              }}
            >
              {["#", "Brand", "Model", "Type", "Tier", "Cover", "Qty", ""].map((h, i) => (
                <div key={i} style={{ fontSize: 9, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {lineItems.map((li, idx) => {
              const models = Object.keys(DEVICE_CATALOG[li.brand] ?? {});
              const deviceType = DEVICE_CATALOG[li.brand]?.[li.model]?.type ?? "Other";

              return (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "22px 120px 1fr 62px 82px 68px 42px 20px",
                    gap: 6,
                    alignItems: "center",
                    padding: "6px 14px",
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.accent }}>{idx + 1}</div>

                  <select value={li.brand} onChange={(e) => updateLine(idx, { brand: e.target.value })} style={selectStyle}>
                    {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>

                  <select value={li.model} onChange={(e) => updateLine(idx, { model: e.target.value })} style={selectStyle}>
                    {models.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>

                  <Badge color={colors.blue}>{deviceType}</Badge>

                  <select value={li.tier} onChange={(e) => updateLine(idx, { tier: e.target.value })} style={selectStyle}>
                    {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <div style={{ display: "flex", borderRadius: 4, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                    {(["tpm", "oem"] as CoverageType[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => updateLine(idx, { coverage: c })}
                        style={{
                          padding: "3px 7px",
                          fontSize: 10,
                          fontWeight: 600,
                          fontFamily: FONT,
                          border: "none",
                          cursor: "pointer",
                          background: li.coverage === c ? colors.accent : "transparent",
                          color: li.coverage === c ? "#fff" : colors.textMid,
                        }}
                      >
                        {c.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={li.quantity}
                    onChange={(e) => updateLine(idx, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    style={{ ...selectStyle, width: 38, textAlign: "center", fontFamily: MONO, padding: "5px 2px" }}
                  />

                  {lineItems.length > 1 ? (
                    <button
                      onClick={() => removeLine(idx)}
                      aria-label="Remove line"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Icon name="close" size={13} color={colors.danger} />
                    </button>
                  ) : <div />}
                </div>
              );
            })}
          </Card>

          {/* Generate */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleGenerateCustom}
              disabled={generating || !clientName.trim() || lineItems.length === 0}
              style={
                generating || !clientName.trim() || lineItems.length === 0
                  ? disabledPrimaryBtn
                  : primaryBtn
              }
            >
              <Icon name="quote" size={14} color="#fff" />
              {generating
                ? "Generating..."
                : `Generate Quote (${lineItems.reduce((s, li) => s + li.quantity, 0)} units)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
