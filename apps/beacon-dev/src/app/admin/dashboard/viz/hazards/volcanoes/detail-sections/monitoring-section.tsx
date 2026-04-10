"use client";

import { useState } from "react";
import type { MonitoringInfo, SensorKind } from "../volcano-monitoring";
import {
  SENSOR_LABEL,
  SENSOR_EXPLAIN,
  DENSITY_LABEL,
  DENSITY_BLURB,
} from "../volcano-monitoring";

interface Props {
  monitoring: MonitoringInfo;
}

export function MonitoringSection({ monitoring }: Props) {
  const [activeSensor, setActiveSensor] = useState<SensorKind | null>(null);
  const [showDensity, setShowDensity] = useState(false);

  return (
    <section className="vp-section">
      <header className="vp-section-head">
        <div className="vp-section-head-stack">
          <h4>Monitoring</h4>
          <div className="vp-section-sub">
            Who watches it, with what sensors
          </div>
        </div>
      </header>

      <div className="vp-mon-operator">
        <div className="vp-mon-op-name">{monitoring.operator}</div>
        <div className="vp-mon-op-meta">
          <span
            className={`vp-mon-density d-${monitoring.density}`}
            onClick={() => setShowDensity((v) => !v)}
            title="Click for density definition"
          >
            {DENSITY_LABEL[monitoring.density]}
          </span>
          <span className="vp-mon-cadence">{monitoring.cadence}</span>
        </div>
        {showDensity && (
          <div className="vp-mon-density-blurb">
            {DENSITY_BLURB[monitoring.density]}
          </div>
        )}
      </div>

      {monitoring.sensors.length > 0 && (
        <div className="vp-mon-sensors">
          {monitoring.sensors.map((s) => {
            const active = activeSensor === s.kind;
            return (
              <button
                key={s.kind}
                type="button"
                className={`vp-mon-sensor${active ? " active" : ""}`}
                onClick={() =>
                  setActiveSensor(active ? null : s.kind)
                }
              >
                <div className="vp-mon-sensor-label">
                  {SENSOR_LABEL[s.kind]}
                  {s.count != null && (
                    <span className="vp-mon-sensor-count">×{s.count}</span>
                  )}
                </div>
                {s.note && <div className="vp-mon-sensor-note">{s.note}</div>}
              </button>
            );
          })}
        </div>
      )}

      {activeSensor && (
        <div className="vp-mon-explain">
          <div className="vp-mon-explain-label">
            {SENSOR_LABEL[activeSensor]}
          </div>
          <div className="vp-mon-explain-text">
            {SENSOR_EXPLAIN[activeSensor]}
          </div>
        </div>
      )}

      <div className="vp-mon-source">
        <a href={monitoring.statusUrl} target="_blank" rel="noreferrer">
          Official status page ↗
        </a>
        <span className="vp-mon-updated">
          Updated {monitoring.lastUpdated}
        </span>
      </div>
    </section>
  );
}
