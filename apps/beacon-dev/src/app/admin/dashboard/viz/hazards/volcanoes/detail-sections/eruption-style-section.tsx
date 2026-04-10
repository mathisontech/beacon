"use client";

import type {
  AltStyle,
  DangerChar,
  EruptionStyle,
  StyleFrequency,
  VolcanoHistory,
} from "../volcano-history";

interface Props {
  history: VolcanoHistory;
}

const DANGER_LABEL: Record<DangerChar, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  extreme: "Extreme",
};

const STYLE_LABEL: Record<EruptionStyle, string> = {
  effusive: "Slow Lava Flows (Hawaiian)",
  mixed: "Mixed — Lava + Explosions",
  strombolian: "Fire Fountains + Ash",
  explosive: "Explosive / Plinian",
  dome: "Lava Dome Collapse",
  phreatic: "Steam Explosions",
  hydrothermal: "Hydrothermal (Steam + Gas)",
  caldera: "Caldera Collapse",
  lahar: "Lahar (Volcanic Mudflow)",
};

const FREQUENCY_LABEL: Record<StyleFrequency, string> = {
  usually: "Usually",
  sometimes: "Sometimes",
  rarely: "Rarely",
  historical: "Historical only",
};

function StyleCard({
  kind,
  danger,
  description,
  heading,
  extra,
}: {
  kind: EruptionStyle;
  danger: DangerChar;
  description: string;
  heading?: string;
  extra?: string;
}) {
  return (
    <div className="vp-style-card">
      <div className="vp-style-row">
        {heading && <span className="vp-style-freq">{heading}</span>}
        <span className="vp-style-tag">{STYLE_LABEL[kind]}</span>
        <span className={`vp-danger-chip danger-${danger}`}>
          {DANGER_LABEL[danger]} danger
        </span>
      </div>
      <p className="vp-style-text">{description}</p>
      {extra && <p className="vp-style-danger">{extra}</p>}
    </div>
  );
}

export function EruptionStyleSection({ history }: Props) {
  const hasAlts = history.altStyles && history.altStyles.length > 0;

  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <h4>What to expect when it erupts</h4>
        {hasAlts && (
          <span className="vp-section-meta">
            {1 + (history.altStyles?.length ?? 0)} modes
          </span>
        )}
      </header>

      <StyleCard
        kind={history.style}
        danger={history.danger}
        description={history.styleDescription}
        heading={hasAlts ? "Primary mode" : undefined}
        extra={history.dangerExplanation}
      />

      {history.altStyles?.map((a: AltStyle, i: number) => (
        <StyleCard
          key={`${a.kind}-${i}`}
          kind={a.kind}
          danger={a.danger}
          description={a.description}
          heading={FREQUENCY_LABEL[a.frequency]}
        />
      ))}
    </section>
  );
}
