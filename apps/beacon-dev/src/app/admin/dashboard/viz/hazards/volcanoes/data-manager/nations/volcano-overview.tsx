import type { Volcano } from "../../types";

interface Props {
  volcano: Volcano;
}

export function VolcanoOverview({ volcano }: Props) {
  return (
    <div className="vdm-placeholder">
      <h2>{volcano.name} — Current Overview</h2>
      <p>
        Full internal overview of {volcano.name}. Superset of the sidebar
        view shown on the main map. The sidebar view will surface a curated
        subset of the sections below.
      </p>
      <ul>
        <li>Outline polygon and pre-assigned evacuation zones</li>
        <li>Population totals and population within each evacuation zone</li>
        <li>Monitoring agency and full announcement log</li>
        <li>Volcano type and eligible activity classes (geyser → VEI 8)</li>
        <li>Per-activity status feed with measurable warning signs</li>
        <li>Pattern-deviation analysis (quake rate, depth, uplift, gas, thermal)</li>
        <li>Unrest hotspot polygons and satellite thermal anomalies</li>
        <li>Structural damage records</li>
        <li>Magma chamber simulation (embed or link)</li>
        <li>Live camera feeds (embed or link)</li>
        <li>Event history with per-event pages (ashfall footprint, simulation if possible)</li>
        <li>Data-coverage-depth indicator per field (have / partial / absent)</li>
      </ul>
      <span className="vdm-coming">C1.9e — current overview</span>
    </div>
  );
}
