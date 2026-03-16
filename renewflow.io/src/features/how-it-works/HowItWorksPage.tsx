"use client";

import { useState, type FC } from "react";
import { useTheme, FONT } from "@/theme";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";

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

const STEP_TEXT: Record<string, Record<string, string>> = {
  en: {
    step1Title: "Import Your Assets",
    step1Desc:
      "Upload your installed base via Excel/CSV. RenewFlow maps serial numbers, warranty dates, and coverage details automatically.",
    step2Title: "AI-Powered Quotes",
    step2Desc:
      "Generate dual OEM + TPM quotes instantly. Our AI recommends the best coverage option based on device tier and criticality.",
    step3Title: "Submit Purchase Orders",
    step3Desc:
      "Convert approved quotes to POs with one click. RenewFlow routes them to verified delivery partners automatically.",
    step4Title: "Track & Fulfill",
    step4Desc:
      "Monitor the full lifecycle from quote to fulfillment. Get proactive alerts at 90, 60, 30, 14, and 7 days before expiry.",
    step5Title: "AI Assistant",
    step5Desc:
      "Ask RenewFlow AI anything about your portfolio \u2014 expiring devices, savings opportunities, or renewal recommendations.",
    pageTitle: "How RenewFlow Works",
    pageSubtitle: "Your end-to-end warranty renewal lifecycle in 5 steps",
  },
  es: {
    step1Title: "Importa tus Activos",
    step1Desc:
      "Sube tu base instalada v\u00eda Excel/CSV. RenewFlow mapea n\u00fameros de serie, fechas de garant\u00eda y detalles de cobertura autom\u00e1ticamente.",
    step2Title: "Cotizaciones con IA",
    step2Desc:
      "Genera cotizaciones duales OEM + TPM al instante. Nuestra IA recomienda la mejor opci\u00f3n seg\u00fan el nivel y criticidad del dispositivo.",
    step3Title: "Env\u00eda \u00d3rdenes de Compra",
    step3Desc:
      "Convierte cotizaciones aprobadas en OC con un clic. RenewFlow las env\u00eda a socios de entrega verificados autom\u00e1ticamente.",
    step4Title: "Rastrea y Cumple",
    step4Desc:
      "Monitorea el ciclo completo desde cotizaci\u00f3n hasta cumplimiento. Recibe alertas proactivas a 90, 60, 30, 14 y 7 d\u00edas antes del vencimiento.",
    step5Title: "Asistente IA",
    step5Desc:
      "Pregunta a RenewFlow IA cualquier cosa sobre tu portafolio \u2014 dispositivos por vencer, oportunidades de ahorro o recomendaciones de renovaci\u00f3n.",
    pageTitle: "C\u00f3mo funciona RenewFlow",
    pageSubtitle: "Tu ciclo completo de renovaci\u00f3n de garant\u00edas en 5 pasos",
  },
  pt: {
    step1Title: "Importe seus Ativos",
    step1Desc:
      "Carregue sua base instalada via Excel/CSV. O RenewFlow mapeia n\u00fameros de s\u00e9rie, datas de garantia e detalhes de cobertura automaticamente.",
    step2Title: "Cota\u00e7\u00f5es com IA",
    step2Desc:
      "Gere cota\u00e7\u00f5es duplas OEM + TPM instantaneamente. Nossa IA recomenda a melhor op\u00e7\u00e3o com base no n\u00edvel e criticidade do dispositivo.",
    step3Title: "Envie Pedidos de Compra",
    step3Desc:
      "Converta cota\u00e7\u00f5es aprovadas em PCs com um clique. O RenewFlow as encaminha para parceiros de entrega verificados automaticamente.",
    step4Title: "Rastreie e Entregue",
    step4Desc:
      "Monitore o ciclo completo desde cota\u00e7\u00e3o at\u00e9 entrega. Receba alertas proativos em 90, 60, 30, 14 e 7 dias antes do vencimento.",
    step5Title: "Assistente IA",
    step5Desc:
      "Pergunte ao RenewFlow IA qualquer coisa sobre seu portf\u00f3lio \u2014 dispositivos vencendo, oportunidades de economia ou recomenda\u00e7\u00f5es de renova\u00e7\u00e3o.",
    pageTitle: "Como o RenewFlow funciona",
    pageSubtitle: "Seu ciclo completo de renova\u00e7\u00e3o de garantias em 5 passos",
  },
};

export const HowItWorksPage: FC = () => {
  const { colors } = useTheme();
  const { locale, t } = useLocale();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const text = (STEP_TEXT[locale] ?? STEP_TEXT.en)!;

  const [suggestion, setSuggestion] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!suggestion.trim()) return;
    // In production this would call an API endpoint
    setSent(true);
    setSuggestion("");
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div>
      <PageHeader title={text.pageTitle ?? ""} subtitle={text.pageSubtitle ?? ""} />

      {/* Steps */}
      <Card style={{ marginTop: 0, padding: 0, overflow: "hidden" }}>
        {STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              padding: "20px 24px",
              borderBottom: i < STEPS.length - 1 ? `1px solid ${colors.border}` : "none",
            }}
          >
            {/* Step number + icon — no background */}
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

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {text[step.titleKey] ?? ""}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: colors.textMid,
                  lineHeight: 1.6,
                }}
              >
                {text[step.descKey] ?? ""}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Suggest an Improvement */}
      <Card style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Icon name="chat" size={18} color={colors.accent} />
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: colors.text,
              margin: 0,
            }}
          >
            {t.suggestImprovement}
          </h3>
        </div>

        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder={t.suggestionPlaceholder}
          rows={4}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            background: colors.bg,
            color: colors.text,
            fontSize: 13,
            fontFamily: FONT,
            resize: "vertical",
            outline: "none",
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.accent;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          {/* Sent confirmation */}
          <div
            style={{
              fontSize: 12,
              color: sent ? "#10b981" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.3s ease",
              fontWeight: 500,
            }}
          >
            <Icon name="check" size={14} color={sent ? "#10b981" : "transparent"} />
            {t.suggestionThanks}
          </div>

          <button
            onClick={handleSend}
            disabled={!suggestion.trim()}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: suggestion.trim() ? colors.accent : colors.border,
              color: suggestion.trim() ? "#fff" : colors.textDim,
              fontSize: 13,
              fontWeight: 600,
              cursor: suggestion.trim() ? "pointer" : "not-allowed",
              fontFamily: FONT,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease",
              boxShadow: suggestion.trim() ? `0 2px 8px ${colors.accent}40` : "none",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            {sent ? t.suggestionSent : t.sendSuggestion}
          </button>
        </div>
      </Card>
    </div>
  );
};
