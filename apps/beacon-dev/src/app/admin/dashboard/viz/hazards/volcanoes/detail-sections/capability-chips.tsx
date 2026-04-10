"use client";

import { useState } from "react";
import type { Capability, ImminenceLevel } from "../volcano-history";

interface Props {
  capabilities: Capability[];
}

const IMMINENCE_LABEL: Record<ImminenceLevel, string> = {
  none: "No signs",
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

// Inline header widget: a row of chips (one per capability) + an
// expanded detail area showing the sign summary for whichever
// chip is currently selected. Defaults to the first chip.
export function CapabilityChips({ capabilities }: Props) {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  if (capabilities.length === 0) return null;
  const active = capabilities[activeIdx] ?? capabilities[0];

  return (
    <div className="vp-capabilities">
      <div className="vp-capabilities-row">
        {capabilities.map((c, i) => (
          <button
            key={`${c.label}-${i}`}
            type="button"
            className={`vp-cap-chip imminence-${c.imminence}${
              i === activeIdx ? " active" : ""
            }`}
            onClick={() => setActiveIdx(i)}
            title={c.signs}
          >
            <span className="vp-cap-dot" />
            <span className="vp-cap-label">{c.label}</span>
            <span className="vp-cap-immin">{IMMINENCE_LABEL[c.imminence]}</span>
          </button>
        ))}
      </div>
      <div className="vp-capabilities-detail">
        <div className="vp-cap-detail-label">
          {active.label} — {IMMINENCE_LABEL[active.imminence]} imminence
        </div>
        <div className="vp-cap-detail-signs">{active.signs}</div>
      </div>
    </div>
  );
}
