"use client";

import { useState } from "react";
import type {
  DangerChar,
  HazardCategory,
  HazardRisks,
} from "../volcano-history";
import { HAZARD_DEFINITIONS } from "./hazard-definitions";

interface Props {
  risks: HazardRisks;
}

const DANGER_LABEL: Record<DangerChar, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  extreme: "Extreme",
};

// Display order — most-studied / highest-killer categories first.
const HAZARD_ORDER: HazardCategory[] = [
  "pyroclastic",
  "ashfall",
  "lahar",
  "gas",
  "lava",
  "ballistic",
  "collapse",
  "tsunami",
  "flood",
];

export function HazardRisksSection({ risks }: Props) {
  const [open, setOpen] = useState<HazardCategory | null>(null);

  const rows = HAZARD_ORDER.filter((k) => risks[k] != null);
  if (rows.length === 0) return null;

  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <div className="vp-section-head-stack">
          <h4>Hazards to people</h4>
          <div className="vp-section-sub">
            What each eruption style actually does — tap a row for the
            definition
          </div>
        </div>
      </header>

      <div className="vp-hazard-list">
        {rows.map((k) => {
          const risk = risks[k]!;
          const def = HAZARD_DEFINITIONS[k];
          const isOpen = open === k;
          return (
            <button
              key={k}
              type="button"
              className={`vp-hazard-row${isOpen ? " open" : ""}`}
              onClick={() => setOpen(isOpen ? null : k)}
              aria-expanded={isOpen}
            >
              <div className="vp-hazard-head">
                <span className="vp-hazard-label">{def.label}</span>
                <span className={`vp-danger-chip danger-${risk.level}`}>
                  {DANGER_LABEL[risk.level]}
                </span>
              </div>
              <div className="vp-hazard-note">{risk.note}</div>
              {isOpen && (
                <div className="vp-hazard-def">{def.definition}</div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
