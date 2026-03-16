"use client";

import { useState, useRef, useCallback, type FC } from "react";
import * as XLSX from "xlsx";
import { useTheme, MONO, FONT } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card, DownloadTemplateModal } from "@/components/ui";
import { IMPORT_FIELD_DEFINITIONS, SAMPLE_TEMPLATE_ROWS } from "@/data/seeds";
import type { Asset, ImportStep, ColumnMapping, AssetTier, AssetStatus } from "@/types";
import { useRewardsStore } from "@/stores";
import { useLocale } from "@/i18n";

interface ImportModuleProps {
  onImport: (assets: Asset[] | null) => void;
}

export const ImportModule: FC<ImportModuleProps> = ({ onImport }) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const addPoints = useRewardsStore((s) => s.addPoints);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>("upload");
  const [rawData, setRawData] = useState<unknown[][] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [parsedAssets, setParsedAssets] = useState<Asset[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const parseFile = useCallback((file: File) => {
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]!]!;
        const json = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
        if (json.length < 2) {
          setError("File needs at least a header row and one data row.");
          return;
        }
        const hdrs = (json[0] as unknown[]).map((h) => String(h).trim());
        const rows = json.slice(1).filter((r) => (r as unknown[]).some((c) => c !== ""));
        setHeaders(hdrs);
        setRawData(rows as unknown[][]);

        // Auto-map columns
        const autoMap: ColumnMapping = {};
        IMPORT_FIELD_DEFINITIONS.forEach((f) => {
          const idx = hdrs.findIndex((h) => {
            const hl = h.toLowerCase();
            if (f.key === "serial") return hl.includes("serial") || hl.includes("service tag") || hl.includes("s/n") || hl === "sn";
            if (f.key === "brand") return hl.includes("brand") || hl.includes("manufacturer") || hl.includes("make") || hl === "oem";
            if (f.key === "model") return hl.includes("model") || hl.includes("product");
            if (f.key === "client") return hl.includes("client") || hl.includes("account") || hl.includes("company") || hl.includes("customer");
            if (f.key === "warranty_end") return hl.includes("warranty") || hl.includes("expir") || hl.includes("end date") || hl.includes("coverage");
            if (f.key === "device_type") return hl.includes("type") || hl.includes("category") || hl.includes("device");
            if (f.key === "purchase_date") return hl.includes("purchase") || hl.includes("bought");
            if (f.key === "quantity") return hl.includes("qty") || hl.includes("quantity") || hl.includes("count") || hl.includes("units");
            return false;
          });
          if (idx >= 0) autoMap[f.key] = idx;
        });
        setMapping(autoMap);
        setStep("mapping");
      } catch {
        setError("Could not parse file. Make sure it's a valid .xlsx, .xls, or .csv.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet(SAMPLE_TEMPLATE_ROWS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets");
    ws["!cols"] = SAMPLE_TEMPLATE_ROWS[0]!.map((_, i) => ({ wch: i === 2 ? 24 : i === 3 ? 20 : 16 }));
    XLSX.writeFile(wb, "RenewFlow_Asset_Template.xlsx");
  };

  const processMappedData = () => {
    if (!rawData) return;
    const assets: Asset[] = rawData
      .map((row, idx): Asset | null => {
        const get = (key: string) =>
          mapping[key] !== undefined ? String(row[mapping[key]!] ?? "").trim() : "";
        const serial = get("serial");
        const brand = get("brand");
        const model = get("model");
        if (!serial && !brand && !model) return null;

        let daysLeft = 90;
        const wStr = get("warranty_end");
        if (wStr) {
          const d = new Date(wStr);
          if (!isNaN(d.getTime())) daysLeft = Math.round((d.getTime() - Date.now()) / 864e5);
        }

        const bNorm = brand ? brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase() : "Unknown";
        const mLow = model.toLowerCase();

        let tier: AssetTier = "standard";
        if (mLow.includes("precision") || mLow.includes("zbook") || mLow.includes("thinkstation")) tier = "critical";
        if (daysLeft < -730) tier = "low-use";

        let status: AssetStatus = "discovered";
        if (daysLeft < 0) status = "lapsed";
        else if (daysLeft <= 7) status = "alerted-7";
        else if (daysLeft <= 30) status = "alerted-30";
        else if (daysLeft <= 90) status = "alerted-90";

        return {
          id: `IMP-${1000 + idx}`,
          serial: serial || `UNK-${idx}`,
          brand: bNorm,
          model: model || "Unknown",
          client: get("client") || "Unassigned",
          tier,
          daysLeft,
          oem: Math.round(150 + Math.random() * 200),
          tpm: Math.round(70 + Math.random() * 100),
          status,
          warrantyEnd: wStr,
          deviceType: get("device_type") || "Laptop",
          purchaseDate: get("purchase_date"),
          quantity: parseInt(get("quantity")) || 1,
        };
      })
      .filter((a): a is Asset => a !== null);

    setParsedAssets(assets);
    setStep("preview");
  };

  const reset = () => {
    setStep("upload");
    setRawData(null);
    setHeaders([]);
    setMapping({});
    setParsedAssets([]);
    setFileName("");
    setError("");
  };

  // ── Upload Step ──
  if (step === "upload") {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>{t.importAssets}</h2>
            <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>{t.uploadSubtitle}</p>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
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
            <Icon name="download" size={14} color={colors.onAccent} /> {t.downloadTemplate}
          </button>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) parseFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? colors.accent : colors.border}`,
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
            background: dragOver ? `${colors.accent}08` : colors.card,
            cursor: "pointer",
            boxShadow: dragOver ? `0 0 0 4px ${colors.accent}15` : "none",
            transition: "all 0.2s",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => { if (e.target.files?.[0]) parseFile(e.target.files[0]); }}
            style={{ display: "none" }}
          />
          <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px", background: `${colors.accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="upload" size={28} color={colors.accent} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
            {dragOver ? t.dropFileHere : t.dragDropFile}
          </div>
          <div style={{ fontSize: 13, color: colors.textMid, marginBottom: 16 }}>
            {t.orClickBrowse} &middot; .xlsx, .xls, .csv
          </div>
          {error && <div style={{ fontSize: 13, color: colors.danger, marginTop: 8 }}>{error}</div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
          {[
            { icon: "file" as const, title: "Any spreadsheet", desc: "Excel or CSV — parsed automatically" },
            { icon: "mapping" as const, title: "Smart column mapping", desc: "Auto-detects serial, brand, model, warranty date" },
            { icon: "table" as const, title: "Fleet-friendly", desc: "Import hundreds of assets with quantity support" },
          ].map((f, i) => (
            <Card key={i} style={{ padding: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${colors.accent}10`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon name={f.icon} size={16} color={colors.accent} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: colors.textMid, lineHeight: 1.5 }}>{f.desc}</div>
            </Card>
          ))}
        </div>

        <DownloadTemplateModal
          open={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onDownload={() => { downloadTemplate(); setShowTemplateModal(false); }}
        />
      </div>
    );
  }

  // ── Mapping Step ──
  if (step === "mapping") {
    const requiredFields = IMPORT_FIELD_DEFINITIONS.filter((f) => f.required);
    const mapped = requiredFields.filter((f) => mapping[f.key] !== undefined).length;
    const total = requiredFields.length;
    const ok = mapped === total;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>{t.mapColumns}</h2>
            <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: colors.accent }}>{fileName}</span> &middot;{" "}
              {rawData?.length ?? 0} rows &middot; {t.matchColumns}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={reset}
              style={{
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
              }}
            >
              {t.back}
            </button>
            <button
              onClick={processMappedData}
              disabled={!ok}
              style={{
                background: ok ? colors.accent : colors.textDim,
                color: colors.onAccent,
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: ok ? "pointer" : "not-allowed",
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: ok ? 1 : 0.6,
                boxShadow: ok ? `0 2px 8px ${colors.accent}40` : "none",
              }}
            >
              Preview {rawData?.length ?? 0} Assets &rarr;
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: colors.border }}>
            <div style={{ width: `${(mapped / total) * 100}%`, height: "100%", borderRadius: 2, background: ok ? colors.accent : colors.warn, transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: ok ? colors.accent : colors.warn, fontFamily: MONO }}>
            {mapped}/{total} required
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {IMPORT_FIELD_DEFINITIONS.map((f) => (
            <Card
              key={f.key}
              style={{
                padding: 14,
                borderLeft: `3px solid ${f.required && mapping[f.key] === undefined ? colors.warn : mapping[f.key] !== undefined ? colors.accent : colors.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{f.label}</span>
                {f.required && <Badge color={colors.danger}>{t.required}</Badge>}
                {mapping[f.key] !== undefined && <Icon name="check" size={14} color={colors.accent} />}
              </div>
              <div style={{ fontSize: 11, color: colors.textMid, marginBottom: 8 }}>{f.hint}</div>
              <select
                value={mapping[f.key] !== undefined ? String(mapping[f.key]) : ""}
                onChange={(e) =>
                  setMapping((m) => {
                    const n = { ...m };
                    if (e.target.value === "") delete n[f.key];
                    else n[f.key] = parseInt(e.target.value);
                    return n;
                  })
                }
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 7,
                  background: colors.inputBg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: 12,
                  fontFamily: FONT,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">{t.selectColumn}</option>
                {headers.map((h, i) => (
                  <option key={i} value={i}>
                    {h} (col {i + 1})
                  </option>
                ))}
              </select>
              {mapping[f.key] !== undefined && rawData?.[0] && (
                <div style={{ marginTop: 6, fontSize: 11, color: colors.textMid, fontFamily: MONO }}>
                  Preview: <span style={{ color: colors.accent }}>{String(rawData[0]![mapping[f.key]!] ?? "—")}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Preview Step ──
  if (step === "preview") {
    const uc = (d: number) => (d <= 7 ? colors.danger : d <= 30 ? colors.warn : d <= 60 ? colors.blue : colors.accent);
    const tc = (t: string) => ({ critical: colors.danger, standard: colors.blue, "low-use": colors.textMid }[t] ?? colors.textMid);
    const totalUnits = parsedAssets.reduce((s, a) => s + (a.quantity ?? 1), 0);

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>{t.previewImport}</h2>
            <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
              {parsedAssets.length} assets ({totalUnits} units) ready
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setStep("mapping")}
              style={{
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
              }}
            >
              {t.back}
            </button>
            <button
              onClick={() => { onImport(parsedAssets); setStep("done"); addPoints(`Imported ${parsedAssets.length} assets`, 10); }}
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
              <Icon name="check" size={14} color={colors.onAccent} /> Import {parsedAssets.length} Assets
            </button>
          </div>
        </div>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {["Brand", "Model", "Serial", "Client", "Warranty End", "Days Left", "Tier", "Qty"].map((h, i) => (
                    <th key={i} style={{ padding: "11px 14px", textAlign: "left", color: colors.textMid, fontWeight: 600, fontSize: 11, textTransform: "uppercase", background: colors.inputBg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedAssets.map((a, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "10px 14px", fontWeight: 500, color: colors.text }}>{a.brand}</td>
                    <td style={{ padding: "10px 14px", color: colors.text }}>{a.model}</td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 12, color: colors.textMid }}>{a.serial}</td>
                    <td style={{ padding: "10px 14px", color: colors.text }}>{a.client}</td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 12, color: colors.textMid }}>{a.warrantyEnd ?? "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <Badge color={uc(a.daysLeft)}>
                        {a.daysLeft < 0 ? `Lapsed (${Math.abs(a.daysLeft)}d)` : `${a.daysLeft} days`}
                      </Badge>
                    </td>
                    <td style={{ padding: "10px 14px" }}><Badge color={tc(a.tier)}>{a.tier}</Badge></td>
                    <td style={{ padding: "10px 14px", fontFamily: MONO }}>{a.quantity ?? 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // ── Done Step ──
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 20px", background: `${colors.accent}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="check" size={32} color={colors.accent} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: "0 0 8px" }}>
        {parsedAssets.length} {t.assetsImported}
      </h2>
      <p style={{ fontSize: 14, color: colors.textMid, marginBottom: 24 }}>
        {t.trackingMessage}
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
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
          }}
        >
          {t.importMore}
        </button>
        <button
          onClick={() => onImport(null)}
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
          {t.goToDashboard}
        </button>
      </div>
    </div>
  );
};
