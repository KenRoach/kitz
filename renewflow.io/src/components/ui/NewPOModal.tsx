"use client";

import { useState, type FC } from "react";
import { useTheme, MONO, FONT } from "@/theme";
import { Icon } from "@/components/icons";

interface LineItem {
  brand: string;
  model: string;
  serial: string;
  qty: number;
  price: number;
}

interface NewPOModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (po: {
    client: string;
    quoteRef: string;
    coverageType: "tpm" | "oem";
    items: LineItem[];
    notes: string;
  }) => void;
}

const EMPTY_ITEM: LineItem = { brand: "", model: "", serial: "", qty: 1, price: 0 };

export const NewPOModal: FC<NewPOModalProps> = ({ open, onClose, onSubmit }) => {
  const { colors } = useTheme();

  const [client, setClient] = useState("");
  const [quoteRef, setQuoteRef] = useState("");
  const [coverageType, setCoverageType] = useState<"tpm" | "oem">("tpm");
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }]);
  const [notes, setNotes] = useState("");

  const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  const resetForm = (): void => {
    setClient("");
    setQuoteRef("");
    setCoverageType("tpm");
    setItems([{ ...EMPTY_ITEM }]);
    setNotes("");
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const handleSubmit = (): void => {
    onSubmit({
      client,
      quoteRef,
      coverageType,
      items,
      notes,
    });
    resetForm();
    onClose();
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number): void => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  };

  const removeItem = (index: number): void => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const addItem = (): void => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    background: colors.inputBg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    fontSize: 12,
    fontFamily: FONT,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMid,
    marginBottom: 4,
    fontFamily: FONT,
  };

  const cellInputStyle: React.CSSProperties = {
    ...inputStyle,
    padding: "6px 8px",
    borderRadius: 6,
    fontSize: 11,
  };

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.card,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          width: 640,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: colors.shadowLg,
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 16px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>
              New Purchase Order
            </h2>
            <p style={{ fontSize: 12, color: colors.textMid, margin: "4px 0 0" }}>
              Create a PO from an approved quote
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="close" size={18} color={colors.textDim} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Client Name + Quote Reference row */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Client Name</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. Acme Corp"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quote Reference</label>
              <input
                type="text"
                value={quoteRef}
                onChange={(e) => setQuoteRef(e.target.value)}
                placeholder="e.g. Q-1234"
                style={{ ...inputStyle, fontFamily: MONO }}
              />
            </div>
          </div>

          {/* Coverage Type */}
          <div>
            <label style={labelStyle}>Coverage Type</label>
            <select
              value={coverageType}
              onChange={(e) => setCoverageType(e.target.value as "tpm" | "oem")}
              style={{
                ...inputStyle,
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='${encodeURIComponent(colors.textMid)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: 32,
              }}
            >
              <option value="tpm">TPM</option>
              <option value="oem">OEM</option>
            </select>
          </div>

          {/* Line Items */}
          <div>
            <label style={labelStyle}>Line Items</label>
            <div
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 60px 90px 32px",
                  gap: 8,
                  padding: "8px 12px",
                  background: colors.inputBg,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                {["Brand", "Model", "Serial", "Qty", "Price", ""].map((h) => (
                  <span
                    key={h || "__actions"}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: colors.textMid,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 60px 90px 32px",
                    gap: 8,
                    padding: "8px 12px",
                    borderBottom: idx < items.length - 1 ? `1px solid ${colors.border}` : "none",
                  }}
                >
                  <input
                    type="text"
                    value={item.brand}
                    onChange={(e) => updateItem(idx, "brand", e.target.value)}
                    placeholder="Dell"
                    style={cellInputStyle}
                  />
                  <input
                    type="text"
                    value={item.model}
                    onChange={(e) => updateItem(idx, "model", e.target.value)}
                    placeholder="Latitude 5540"
                    style={cellInputStyle}
                  />
                  <input
                    type="text"
                    value={item.serial}
                    onChange={(e) => updateItem(idx, "serial", e.target.value)}
                    placeholder="SN-001"
                    style={{ ...cellInputStyle, fontFamily: MONO }}
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => updateItem(idx, "qty", Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{ ...cellInputStyle, textAlign: "center" }}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.price || ""}
                    onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    style={{ ...cellInputStyle, fontFamily: MONO }}
                  />
                  <button
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    aria-label="Remove line item"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: items.length <= 1 ? "default" : "pointer",
                      opacity: items.length <= 1 ? 0.3 : 0.6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    <Icon name="close" size={14} color={colors.textDim} />
                  </button>
                </div>
              ))}

              {/* Add row button */}
              <div style={{ padding: "8px 12px", borderTop: `1px solid ${colors.border}` }}>
                <button
                  onClick={addItem}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: 0,
                    fontSize: 11,
                    fontWeight: 600,
                    color: colors.accent,
                    fontFamily: FONT,
                  }}
                >
                  <Icon name="plus" size={14} color={colors.accent} />
                  Add Line Item
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional instructions or references..."
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 60,
              }}
            />
          </div>

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
              padding: "8px 0 0",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.textMid }}>Total:</span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: colors.text,
                fontFamily: MONO,
              }}
            >
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: "transparent",
              color: colors.textMid,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: colors.accent,
              color: colors.onAccent,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
              boxShadow: `0 2px 8px ${colors.accent}40`,
            }}
          >
            Create PO
          </button>
        </div>
      </div>
    </div>
  );
};
