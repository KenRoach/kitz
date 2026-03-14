"use client";


interface PartnerKpiCardProps { title: string; value: string | number; subtitle?: string; variant?: 'default' | 'warning' | 'success'; }

export function PartnerKpiCard({ title, value, subtitle, variant = 'default' }: PartnerKpiCardProps) {
  return (
    <div className={`kpi-card kpi-card--${variant}`}>
      <p className="kpi-card__title">{title}</p>
      <p className="kpi-card__value">{value}</p>
      {subtitle && <p className="kpi-card__subtitle">{subtitle}</p>}
    </div>
  );
}
