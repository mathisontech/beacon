"use client";

import { useState } from "react";
import type { Volcano } from "../types";
import { LEVELS } from "../volcano-levels";

interface Props {
  volcano: Volcano;
}

// Secondary location + identity info, hidden by default. Click
// the summary row to expand. Keeps the main header compact.
export function LocationDropdown({ volcano }: Props) {
  const [open, setOpen] = useState(false);
  const lvl = LEVELS.find((l) => l.id === volcano.level) || LEVELS[4];

  return (
    <div className={`vp-loc-drop${open ? " open" : ""}`}>
      <button
        type="button"
        className="vp-loc-drop-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>More location info</span>
        <span className="vp-loc-drop-arrow">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <dl className="vp-loc-drop-grid">
          <div>
            <dt>Alert level</dt>
            <dd>
              <span className={`vcard-chip level-${volcano.level}`}>
                {lvl.label}
              </span>
            </dd>
          </div>
          <div>
            <dt>Observatory</dt>
            <dd>{volcano.obs}</dd>
          </div>
          <div>
            <dt>Elevation</dt>
            <dd>{volcano.elevation_m.toLocaleString()} m</dd>
          </div>
          <div>
            <dt>Coordinates</dt>
            <dd>
              {volcano.lat.toFixed(3)}, {volcano.lng.toFixed(3)}
            </dd>
          </div>
          <div>
            <dt>Last eruption</dt>
            <dd>{volcano.last_eruption}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
