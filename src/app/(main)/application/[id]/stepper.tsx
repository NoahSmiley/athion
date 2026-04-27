type Step = { key: string; label: string };

export function Stepper({
  steps,
  current,
  approved,
  denied,
}: {
  steps: Step[];
  current: number;
  approved: boolean;
  denied: boolean;
}) {
  return (
    <div style={{ margin: "16px 0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {steps.map((step, i) => {
          const reached = i <= current;
          const isCurrent = i === current && !approved && !denied;
          const isDecision = i === steps.length - 1;
          const isFinalDecision = isDecision && (approved || denied);

          // Color rules — keep monochrome to match site
          const dotBorder = reached ? "#c8c8c8" : "#444";
          const dotBg = isCurrent || isFinalDecision ? "#c8c8c8" : "#060606";
          const dotText = isCurrent || isFinalDecision ? "#060606" : reached ? "#c8c8c8" : "#444";
          const labelColor = reached ? "#c8c8c8" : "#666";

          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i === steps.length - 1 ? "0 0 auto" : "1 1 0" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "0 0 auto", minWidth: 64 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `1px solid ${dotBorder}`,
                    background: dotBg,
                    color: dotText,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 500,
                    lineHeight: 1,
                    boxSizing: "border-box",
                  }}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span style={{ display: "block", lineHeight: 1, transform: "translateY(0.5px)" }}>
                    {isFinalDecision ? (denied ? "✕" : "✓") : i + 1}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: labelColor, whiteSpace: "nowrap" }}>
                  {isFinalDecision ? (denied ? "Denied" : "Approved") : step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: i < current ? "#c8c8c8" : "#2a2a2a",
                    margin: "0 4px",
                    marginBottom: 18,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
