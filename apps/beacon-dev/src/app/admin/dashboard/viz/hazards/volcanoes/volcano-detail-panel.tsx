"use client";

import type { Volcano } from "./types";
import { VOLCANO_DETAILS, DEFAULT_VOLCANO_DETAIL } from "./volcano-details";
import { VOLCANO_HISTORY } from "./volcano-history";
import { getCams } from "./volcano-cams";
import { getMonitoring } from "./volcano-monitoring";
import { useVolcanoQuakes } from "./use-volcano-quakes";
import { CapabilityChips } from "./detail-sections/capability-chips";
import { LocationDropdown } from "./detail-sections/location-dropdown";
import { MonitoringSection } from "./detail-sections/monitoring-section";
import { OverviewSection } from "./detail-sections/overview-section";
import { EruptionStyleSection } from "./detail-sections/eruption-style-section";
import { EruptionHistorySection } from "./detail-sections/eruption-history-section";
import { QuakesSection } from "./detail-sections/quakes-section";
import { WebcamSection } from "./detail-sections/webcam-section";
import { DeformationSection } from "./detail-sections/deformation-section";

interface Props {
  volcano: Volcano | null;
  onClose: () => void;
}

const QUAKE_RADIUS_KM = 20;
const QUAKE_DAYS = 30;

export function VolcanoDetailPanel({ volcano, onClose }: Props) {
  const detail = volcano
    ? VOLCANO_DETAILS[volcano.id] || DEFAULT_VOLCANO_DETAIL
    : DEFAULT_VOLCANO_DETAIL;

  const history = volcano ? VOLCANO_HISTORY[volcano.id] : undefined;
  const cams = volcano ? getCams(volcano.id) : [];
  const monitoring = volcano ? getMonitoring(volcano.id) : undefined;
  const sparse = !history && !monitoring;

  const { quakes, loading, error, source: quakeSource } = useVolcanoQuakes(
    volcano?.lat ?? null,
    volcano?.lng ?? null,
    { radiusKm: QUAKE_RADIUS_KM, days: QUAKE_DAYS }
  );

  const open = volcano != null;

  return (
    <aside
      className={`vp-panel${open ? " open" : ""}`}
      aria-hidden={!open}
    >
      {volcano && (
        <>
          <header className="vp-panel-head">
            <div className="vp-panel-title">
              <div className="vp-panel-name">{volcano.name}</div>
              <div className="vp-panel-region">{volcano.region}</div>
            </div>
            <button
              type="button"
              className="vp-panel-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </header>

          {history?.capabilities && history.capabilities.length > 0 && (
            <CapabilityChips capabilities={history.capabilities} />
          )}

          <LocationDropdown volcano={volcano} />

          {sparse && (
            <div className="vp-sparse-banner">
              <div className="vp-sparse-title">
                Beacon hasn&apos;t curated this volcano yet
              </div>
              <div className="vp-sparse-body">
                The operating observatory almost certainly publishes
                real-time monitoring data and eruption history — Beacon
                just hasn&apos;t imported it into this panel yet.
                {quakeSource && quakeSource.id === "usgs" ? (
                  <> Quakes below are from the USGS global catalog
                  (M ~4.5+), which misses smaller volcanic earthquakes
                  that regional observatories track.</>
                ) : quakeSource ? (
                  <> Quakes below come from {quakeSource.name}, the
                  regional observatory.</>
                ) : null}
                {" "}Use the Smithsonian GVP page for authoritative
                eruption history and the operator link (under
                &quot;More location info&quot;) for live bulletins.
              </div>
              <a
                href={`https://volcano.si.edu/volcano.cfm?vn=${encodeURIComponent(volcano.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="vp-sparse-link"
              >
                Smithsonian GVP ↗
              </a>
            </div>
          )}

          <div className="vp-panel-body">
            {monitoring && <MonitoringSection monitoring={monitoring} />}
            {history && <EruptionHistorySection history={history} />}
            <WebcamSection cams={cams} />
            {history && <EruptionStyleSection history={history} />}
            <QuakesSection
              quakes={quakes}
              loading={loading}
              error={error}
              radiusKm={QUAKE_RADIUS_KM}
              days={QUAKE_DAYS}
              baseline={history?.quakeBaseline}
              source={quakeSource}
            />
            <DeformationSection
              detail={detail}
              baseline={history?.deformationBaseline}
            />
            <OverviewSection detail={detail} />
          </div>
        </>
      )}
    </aside>
  );
}
