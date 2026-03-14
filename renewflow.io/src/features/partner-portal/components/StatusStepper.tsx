"use client";


const PO_STEPS = ['submitted', 'under_review', 'approved', 'routed', 'acknowledged', 'entitlement_verified', 'completed'];

export function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const currentIndex = PO_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';
  return (
    <div className="status-stepper">
      {PO_STEPS.map((step, i) => {
        let state: 'done' | 'current' | 'upcoming' = 'upcoming';
        if (!isCancelled) { if (i < currentIndex) state = 'done'; else if (i === currentIndex) state = 'current'; }
        return (
          <div key={step} className={`step step--${state}`}>
            <div className="step__dot" />
            <span className="step__label">{step.replace(/_/g, ' ')}</span>
          </div>
        );
      })}
      {isCancelled && <div className="step step--cancelled"><div className="step__dot" /><span className="step__label">cancelled</span></div>}
    </div>
  );
}
