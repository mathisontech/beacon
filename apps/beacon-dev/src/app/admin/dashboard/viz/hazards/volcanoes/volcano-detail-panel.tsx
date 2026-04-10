"use client";

import type { Volcano } from "./types";
import { VOLCANO_DETAILS, DEFAULT_VOLCANO_DETAIL } from "./volcano-details";
import { VOLCANO_HISTORY } from "./volcano-history";
import { getCams } from "./volcano-cams";
import { useVolcanoQuakes } from "./use-volcano-quakes";
import { CapabilityChips } from "./detail-sections/capability-chips";
import { LocationDropdown } from "./detail-sections/location-dropdown";
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

  const { quakes, loading, error } = useVolcanoQuakes(
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

          <div className="vp-panel-body">
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
