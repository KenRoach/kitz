"use client";

import type { FC } from "react";
import { useTheme, FONT } from "@/theme";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/icons";

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

interface StepData {
  icon: "upload" | "quote" | "order" | "check" | "chat";
  titleKey: string;
  descKey: string;
}

const STEPS: StepData[] = [
  { icon: "upload", titleKey: "step1Title", descKey: "step1Desc" },
  { icon: "quote", titleKey: "step2Title", descKey: "step2Desc" },
  { icon: "order", titleKey: "step3Title", descKey: "step3Desc" },
  { icon: "check", titleKey: "step4Title", descKey: "step4Desc" },
  { icon: "chat", titleKey: "step5Title", descKey: "step5Desc" },
];

// Step-specific content keyed by locale
const STEP_TEXT: Record<string, Record<string, string>> = {
  en: {
    step1Title: "Import Your Assets",
    step1Desc: "Upload your installed base via Excel/CSV. RenewFlow maps serial numbers, warranty dates, and coverage details automatically.",
    step2Title: "AI-Powered Quotes",
    step2Desc: "Generate dual OEM + TPM quotes instantly. Our AI recommends the best coverage option based on device tier and criticality.",
    step3Title: "Submit Purchase Orders",
    step3Desc: "Convert approved quotes to POs with one click. RenewFlow routes them to verified delivery partners automatically.",
    step4Title: "Track & Fulfill",
    step4Desc: "Monitor the full lifecycle from quote to fulfillment. Get proactive alerts at 90, 60, 30, 14, and 7 days before expiry.",
    step5Title: "AI Assistant",
    step5Desc: "Ask RenewFlow AI anything about your portfolio — expiring devices, savings opportunities, or renewal recommendations.",
    modalTitle: "How RenewFlow Works",
    modalSubtitle: "Your end-to-end warranty renewal lifecycle in 5 steps",
    close: "Got it",
  },
  es: {
    step1Title: "Importa tus Activos",
    step1Desc: "Sube tu base instalada vía Excel/CSV. RenewFlow mapea números de serie, fechas de garantía y detalles de cobertura automáticamente.",
    step2Title: "Cotizaciones con IA",
    step2Desc: "Genera cotizaciones duales OEM + TPM al instante. Nuestra IA recomienda la mejor opción según el nivel y criticidad del dispositivo.",
    step3Title: "Envía Órdenes de Compra",
    step3Desc: "Convierte cotizaciones aprobadas en OC con un clic. RenewFlow las envía a socios de entrega verificados automáticamente.",
    step4Title: "Rastrea y Cumple",
    step4Desc: "Monitorea el ciclo completo desde cotización hasta cumplimiento. Recibe alertas proactivas a 90, 60, 30, 14 y 7 días antes del vencimiento.",
    step5Title: "Asistente IA",
    step5Desc: "Pregunta a RenewFlow IA cualquier cosa sobre tu portafolio — dispositivos por vencer, oportunidades de ahorro o recomendaciones de renovación.",
    modalTitle: "Cómo funciona RenewFlow",
    modalSubtitle: "Tu ciclo completo de renovación de garantías en 5 pasos",
    close: "Entendido",
  },
  pt: {
    step1Title: "Importe seus Ativos",
    step1Desc: "Carregue sua base instalada via Excel/CSV. O RenewFlow mapeia números de série, datas de garantia e detalhes de cobertura automaticamente.",
    step2Title: "Cotações com IA",
    step2Desc: "Gere cotações duplas OEM + TPM instantaneamente. Nossa IA recomenda a melhor opção com base no nível e criticidade do dispositivo.",
    step3Title: "Envie Pedidos de Compra",
    step3Desc: "Converta cotações aprovadas em PCs com um clique. O RenewFlow as encaminha para parceiros de entrega verificados automaticamente.",
    step4Title: "Rastreie e Entregue",
    step4Desc: "Monitore o ciclo completo desde cotação até entrega. Receba alertas proativos em 90, 60, 30, 14 e 7 dias antes do vencimento.",
    step5Title: "Assistente IA",
    step5Desc: "Pergunte ao RenewFlow IA qualquer coisa sobre seu portfólio — dispositivos vencendo, oportunidades de economia ou recomendações de renovação.",
    modalTitle: "Como o RenewFlow funciona",
    modalSubtitle: "Seu ciclo completo de renovação de garantias em 5 passos",
    close: "Entendi",
  },
};

export const HowItWorksModal: FC<HowItWorksModalProps> = ({ open, onClose }) => {
  const { colors } = useTheme();
  const { locale } = useLocale();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const text = (STEP_TEXT[locale] ?? STEP_TEXT.en)!;

  if (!open) return null;

  return (
    <div
      onClick={onClose}
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
          width: 520,
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
              {text.modalTitle}
            </h2>
            <p style={{ fontSize: 12, color: colors.textMid, margin: "4px 0 0" }}>
              {text.modalSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
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

        {/* Steps */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <Icon name={step.icon} size={18} color={colors.accent} />
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: colors.accent,
                    color: colors.onAccent,
                    fontSize: 9,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 2 }}>
                  {text[step.titleKey]}
                </div>
                <div style={{ fontSize: 12, color: colors.textMid, lineHeight: 1.5 }}>
                  {text[step.descKey]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${colors.border}` }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px 0",
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
            {text.close}
          </button>
        </div>
      </div>
    </div>
  );
};
