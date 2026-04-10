"use client";

import type { Volcano } from "./types";
import { VOLCANO_DETAILS, DEFAULT_VOLCANO_DETAIL } from "./volcano-details";
import { useVolcanoQuakes } from "./use-volcano-quakes";
import { OverviewSection } from "./detail-sections/overview-section";
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
              <div className="vp-panel-sub">
                {volcano.region} · {volcano.obs}
              </div>
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

          <div className="vp-panel-body">
            <OverviewSection volcano={volcano} detail={detail} />
            <QuakesSection
              quakes={quakes}
              loading={loading}
              error={error}
              radiusKm={QUAKE_RADIUS_KM}
              days={QUAKE_DAYS}
            />
            <WebcamSection detail={detail} />
            <DeformationSection detail={detail} />
          </div>
        </>
      )}
    </aside>
  );
}
