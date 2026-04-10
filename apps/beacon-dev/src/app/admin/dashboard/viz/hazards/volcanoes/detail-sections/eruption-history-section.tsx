"use client";

import type { VolcanoHistory } from "../volcano-history";
import {
  yearsSinceLast,
  formatYearsSince,
  formatReturnInterval,
} from "../volcano-history";

interface Props {
  history: VolcanoHistory;
}

// Maps a VEI number to a color class + label.
function veiClass(vei: number | null): string {
  if (vei == null) return "vei-unk";
  if (vei <= 1) return "vei-0";
  if (vei === 2) return "vei-2";
  if (vei === 3) return "vei-3";
  if (vei === 4) return "vei-4";
  if (vei >= 5) return "vei-5";
  return "vei-unk";
}

function veiDescription(vei: number | null): string {
  if (vei == null) return "Unknown";
  if (vei === 0) return "Non-explosive";
  if (vei === 1) return "Gentle";
  if (vei === 2) return "Moderate";
  if (vei === 3) return "Severe";
  if (vei === 4) return "Cataclysmic";
  if (vei === 5) return "Paroxysmal";
  if (vei === 6) return "Colossal";
  if (vei === 7) return "Super-colossal";
  if (vei === 8) return "Mega-colossal";
  return "—";
}

export function EruptionHistorySection({ history }: Props) {
  const since = yearsSinceLast(history);

  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <h4>Eruption history</h4>
      </header>

      <div className="vp-tempo-row">
        <div className="vp-tempo-cell">
          <div className="vp-tempo-num">{formatYearsSince(since)}</div>
          <div className="vp-tempo-lbl">since last eruption</div>
        </div>
        <div className="vp-tempo-cell">
          <div className="vp-tempo-num">
            {formatReturnInterval(history.returnIntervalYears)}
          </div>
          <div className="vp-tempo-lbl">average interval</div>
        </div>
      </div>
      <p className="vp-note">{history.returnIntervalNote}</p>

      <ul className="vp-eruption-list">
        {history.eruptions.map((e, idx) => (
          <li key={`${e.year}-${idx}`} className="vp-eruption-row">
            <span className={`vp-vei ${veiClass(e.vei)}`}>
              {e.vei != null ? `VEI ${e.vei}` : "VEI ?"}
            </span>
            <div className="vp-eruption-meta">
              <div className="vp-eruption-when">{e.display}</div>
              {e.notes && (
                <div className="vp-eruption-notes">{e.notes}</div>
              )}
            </div>
            <span className="vp-eruption-desc" title="VEI category">
              {veiDescription(e.vei)}
            </span>
          </li>
        ))}
      </ul>

      <p className="vp-note vp-vei-legend">
        VEI = Volcanic Explosivity Index, 0 (non-explosive) to 8 (mega-colossal).
        Each step is roughly 10× more ejected material than the one below.
      </p>
    </section>
  );
}
