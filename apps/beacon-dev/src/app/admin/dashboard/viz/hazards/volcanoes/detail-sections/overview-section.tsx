"use client";

import type { Volcano } from "../types";
import type { VolcanoDetail } from "../volcano-details";
import { LEVELS } from "../volcano-levels";

interface Props {
  volcano: Volcano;
  detail: VolcanoDetail | Omit<VolcanoDetail, "id">;
}

export function OverviewSection({ volcano, detail }: Props) {
  const lvl = LEVELS.find((l) => l.id === volcano.level) || LEVELS[4];
  return (
    <section className="vp-section">
      <p className="vp-overview">{detail.overview}</p>
      <dl className="vp-stats">
        <div>
          <dt>Alert level</dt>
          <dd>
            <span className={`vcard-chip level-${volcano.level}`}>
              {lvl.label}
            </span>
          </dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{volcano.region}</dd>
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
          <dt>Last eruption</dt>
          <dd>{volcano.last_eruption}</dd>
        </div>
        <div>
          <dt>Lat / Lng</dt>
          <dd>
            {volcano.lat.toFixed(3)}, {volcano.lng.toFixed(3)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
