"use client";

import type { VolcanoDetail, ThreatRank } from "../volcano-details";

interface Props {
  detail: VolcanoDetail | Omit<VolcanoDetail, "id">;
  baseline?: string;
}

const THREAT_LABEL: Record<ThreatRank, string> = {
  "very-high": "Very High",
  high: "High",
  moderate: "Moderate",
  low: "Low",
};

export function DeformationSection({ detail, baseline }: Props) {
  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <h4>Ground deformation + threat</h4>
      </header>

      <div className="vp-threat-row">
        <span className="vp-threat-label">USGS threat rank</span>
        <span className={`vp-threat-chip threat-${detail.threatRank}`}>
          {THREAT_LABEL[detail.threatRank]}
        </span>
      </div>

      {baseline && (
        <div className="vp-baseline">
          <div className="vp-baseline-label">What's normal</div>
          <div className="vp-baseline-text">{baseline}</div>
        </div>
      )}

      <p className="vp-note">{detail.deformationNote}</p>
      <p className="vp-note">{detail.hazardZones}</p>

      <a
        className="vp-link"
        href={detail.deformationUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Observatory deformation page →
      </a>
    </section>
  );
}
