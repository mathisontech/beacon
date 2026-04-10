"use client";

import type { VolcanoHistory, DangerChar } from "../volcano-history";

interface Props {
  history: VolcanoHistory;
}

const DANGER_LABEL: Record<DangerChar, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  extreme: "Extreme",
};

const STYLE_LABEL: Record<VolcanoHistory["style"], string> = {
  effusive: "Slow Lava Flows (Hawaiian)",
  mixed: "Mixed — Lava + Explosions",
  strombolian: "Fire Fountains + Ash",
  explosive: "Explosive / Plinian",
  dome: "Lava Dome Collapse",
  phreatic: "Steam Explosions",
};

export function EruptionStyleSection({ history }: Props) {
  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <h4>What to expect when it erupts</h4>
      </header>

      <div className="vp-style-card">
        <div className="vp-style-row">
          <span className="vp-style-tag">{STYLE_LABEL[history.style]}</span>
          <span className={`vp-danger-chip danger-${history.danger}`}>
            {DANGER_LABEL[history.danger]} danger
          </span>
        </div>
        <p className="vp-style-text">{history.styleDescription}</p>
        <p className="vp-style-danger">{history.dangerExplanation}</p>
      </div>
    </section>
  );
}
