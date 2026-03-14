// ─── RenewFlow Branded Quote PDF Generator ───
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { QuoteResult } from "@/services/api";

// Brand colors
const ACCENT = "#2563EB";
const TEXT = "#1E293B";
const TEXT_MID = "#64748B";
const LIGHT_BG = "#F1F5F9";
const WHITE = "#FFFFFF";
const GREEN = "#16A34A";

/** Draw the RenewFlow wave logo onto the PDF */
function drawWaveLogo(doc: jsPDF, x: number, y: number, scale: number = 1) {
  const s = scale;
  doc.setLineCap("round");

  // Wave 1 (top, full opacity)
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(1.2 * s);
  // Approximate the SVG bezier "M4 15c2.5-3 5-5 8-5s5 2 8 2 5.5-2 8-5" as line segments
  const wave1: [number, number][] = [
    [0, 7.5], [2, 5.5], [4, 4], [6, 3], [8, 3.2], [10, 4.5],
    [12, 5.5], [14, 5.8], [16, 5], [18, 3.5], [20, 2], [22, 0],
  ];
  for (let i = 0; i < wave1.length - 1; i++) {
    const [x1, y1] = wave1[i]!;
    const [x2, y2] = wave1[i + 1]!;
    doc.line(x + x1 * s, y + y1 * s, x + x2 * s, y + y2 * s);
  }

  // Wave 2 (middle, 60% opacity)
  doc.setDrawColor(100, 149, 237); // lighter blue
  const wave2 = wave1.map(([wx, wy]): [number, number] => [wx, wy + 5]);
  for (let i = 0; i < wave2.length - 1; i++) {
    const [x1, y1] = wave2[i]!;
    const [x2, y2] = wave2[i + 1]!;
    doc.line(x + x1 * s, y + y1 * s, x + x2 * s, y + y2 * s);
  }

  // Wave 3 (bottom, 35% opacity)
  doc.setDrawColor(170, 196, 245); // even lighter
  const wave3 = wave1.map(([wx, wy]): [number, number] => [wx, wy + 10]);
  for (let i = 0; i < wave3.length - 1; i++) {
    const [x1, y1] = wave3[i]!;
    const [x2, y2] = wave3[i + 1]!;
    doc.line(x + x1 * s, y + y1 * s, x + x2 * s, y + y2 * s);
  }
}

export function generateQuotePdf(quote: QuoteResult): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  // ─── Header background bar ───
  doc.setFillColor(ACCENT);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Wave logo on header
  drawWaveLogo(doc, margin, 10, 0.9);

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(WHITE);
  doc.text("RenewFlow", margin + 24, 23);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(WHITE);
  doc.text("AI-Native Warranty Renewal Platform", margin + 24, 30);

  // Quote ID + date on right side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(quote.quoteId, pageWidth - margin, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(quote.date, pageWidth - margin, 27, { align: "right" });
  doc.text(`${quote.coverageType.toUpperCase()} Coverage`, pageWidth - margin, 33, { align: "right" });

  yPos = 50;

  // ─── Client Info ───
  doc.setTextColor(TEXT_MID);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("PREPARED FOR", margin, yPos);
  yPos += 6;
  doc.setTextColor(TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(quote.clients.join(", "), margin, yPos);
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MID);
  doc.text(`${quote.deviceCount} device(s) · ${quote.coverageType.toUpperCase()} coverage`, margin, yPos);
  yPos += 12;

  // ─── Summary Cards Row ───
  const cardW = (contentWidth - 9) / 4; // 3 gaps of 3mm
  const cardH = 22;
  const summaryCards = [
    { label: "Total TPM", value: `$${quote.summary.totalTPM.toLocaleString()}`, color: ACCENT },
    { label: "Total OEM", value: `$${quote.summary.totalOEM.toLocaleString()}`, color: TEXT },
    { label: "Savings", value: `$${quote.summary.savings.toLocaleString()}`, color: GREEN },
    { label: "Savings %", value: `${quote.summary.savingsPct}%`, color: GREEN },
  ];

  summaryCards.forEach((card, i) => {
    const cx = margin + i * (cardW + 3);

    // Card background
    doc.setFillColor(LIGHT_BG);
    doc.roundedRect(cx, yPos, cardW, cardH, 2, 2, "F");

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(TEXT_MID);
    doc.text(card.label.toUpperCase(), cx + 4, yPos + 7);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(card.color);
    doc.text(card.value, cx + 4, yPos + 17);
  });

  yPos += cardH + 10;

  // ─── Line Items Table ───
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(TEXT);
  doc.text("Line Items", margin, yPos);
  yPos += 4;

  const tableHeaders = ["#", "Device", "S/N", "Client", "Type", "Tier", "TPM", "OEM", "Selected"];
  const tableRows = quote.items.map((item, i) => [
    String(i + 1),
    `${item.brand} ${item.model}`,
    item.serial || "—",
    item.client,
    item.deviceType,
    item.tier,
    `$${item.tpmPrice.toLocaleString()}`,
    item.oemPrice ? `$${item.oemPrice.toLocaleString()}` : "N/A",
    `$${item.lineTotal.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [tableHeaders],
    body: tableRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      textColor: [30, 41, 59], // TEXT
      lineWidth: 0,
    },
    headStyles: {
      fillColor: [241, 245, 249], // LIGHT_BG
      textColor: [100, 116, 139], // TEXT_MID
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [248, 249, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", fontStyle: "bold", textColor: [37, 99, 235] },
      6: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235] },
      7: { halign: "right" },
      8: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235] },
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(ACCENT);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(TEXT_MID);
      doc.text("RenewFlow · AI-Native Warranty Renewal Platform · www.renewflow.io", margin, pageHeight - 10);
      doc.text(
        `Page ${data.pageNumber}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" },
      );
    },
  });

  // ─── Total row after table ───
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? yPos + 40;
  yPos = finalY + 4;

  // Total bar
  doc.setFillColor(ACCENT);
  doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(WHITE);
  doc.text(
    `Quote Total (${quote.coverageType.toUpperCase()})`,
    margin + 6,
    yPos + 8,
  );
  doc.text(
    `$${quote.summary.selectedTotal.toLocaleString()}`,
    pageWidth - margin - 6,
    yPos + 8,
    { align: "right" },
  );

  yPos += 22;

  // ─── Terms & Notes ───
  if (yPos < doc.internal.pageSize.getHeight() - 50) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(TEXT);
    doc.text("Terms & Conditions", margin, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(TEXT_MID);
    const terms = [
      "• This quote is valid for 30 days from the date of issue.",
      "• Pricing is subject to change based on OEM/TPM partner availability.",
      "• Coverage begins upon PO approval and partner acknowledgment.",
      "• All prices are in USD unless otherwise specified.",
    ];
    terms.forEach((line) => {
      doc.text(line, margin, yPos);
      yPos += 4;
    });
  }

  // ─── Download ───
  const filename = `${quote.quoteId}_${quote.clients[0]?.replace(/\s+/g, "_") ?? "quote"}_${quote.date.replace(/\//g, "-")}.pdf`;
  doc.save(filename);
}
