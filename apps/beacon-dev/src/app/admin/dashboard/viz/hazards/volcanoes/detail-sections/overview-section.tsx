"use client";

import type { VolcanoDetail } from "../volcano-details";

interface Props {
  detail: VolcanoDetail | Omit<VolcanoDetail, "id">;
}

// Background paragraph only. Structured fields (region, obs,
// elevation, lat/lng) live in the header + LocationDropdown now.
export function OverviewSection({ detail }: Props) {
  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <h4>About</h4>
      </header>
      <p className="vp-overview">{detail.overview}</p>
    </section>
  );
}
