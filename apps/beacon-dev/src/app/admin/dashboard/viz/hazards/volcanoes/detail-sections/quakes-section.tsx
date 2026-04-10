"use client";

import type { VolcanoQuake } from "../use-volcano-quakes";

interface Props {
  quakes: VolcanoQuake[];
  loading: boolean;
  error: string | null;
  radiusKm: number;
  days: number;
  baseline?: string;
}

function formatTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function magClass(mag: number | null): string {
  if (mag == null) return "mag-unk";
  if (mag >= 4) return "mag-high";
  if (mag >= 2) return "mag-mid";
  return "mag-low";
}

export function QuakesSection({ quakes, loading, error, radiusKm, days, baseline }: Props) {
  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <h4>Recent earthquakes</h4>
        <span className="vp-section-meta">
          {radiusKm} km · last {days}d
        </span>
      </header>
      {baseline && (
        <div className="vp-baseline">
          <div className="vp-baseline-label">What's normal</div>
          <div className="vp-baseline-text">{baseline}</div>
        </div>
      )}
      {loading && <div className="vp-note">Loading USGS feed…</div>}
      {error && <div className="vp-note vp-error">Error: {error}</div>}
      {!loading && !error && quakes.length === 0 && (
        <div className="vp-note">No quakes in range.</div>
      )}
      {!loading && !error && quakes.length > 0 && (
        <ul className="vp-quake-list">
          {quakes.slice(0, 20).map((q) => (
            <li key={q.id} className="vp-quake-row">
              <span className={`vp-quake-mag ${magClass(q.mag)}`}>
                {q.mag != null ? `M ${q.mag.toFixed(1)}` : "M —"}
              </span>
              <span className="vp-quake-place">{q.place || "—"}</span>
              <span className="vp-quake-depth">
                {q.depthKm.toFixed(1)} km
              </span>
              <span className="vp-quake-time">{formatTimeAgo(q.time)}</span>
            </li>
          ))}
        </ul>
      )}
      {quakes.length > 20 && (
        <div className="vp-note">+ {quakes.length - 20} more</div>
      )}
    </section>
  );
}
