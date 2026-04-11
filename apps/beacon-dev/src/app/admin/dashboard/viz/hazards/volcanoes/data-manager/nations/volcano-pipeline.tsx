import type { Volcano } from "../../types";

interface Props {
  volcano: Volcano;
}

export function VolcanoPipeline({ volcano }: Props) {
  return (
    <div className="vdm-placeholder">
      <h2>{volcano.name} — Data Pipeline</h2>
      <p>
        Processing chain for {volcano.name}. Shows which data sources feed
        this volcano, how raw values are normalized, which derivations run,
        and the health of each stage.
      </p>
      <ul>
        <li>Upstream feeds (quake catalog, InSAR, gas, cams) with last-poll timestamps</li>
        <li>Normalization steps and units applied</li>
        <li>Pattern-deviation detectors (quake rate, depth shift, uplift, gas ratio)</li>
        <li>Status-feed outputs per activity type (fed into the Current Overview tab)</li>
        <li>Coverage depth per field (have / partial / absent)</li>
        <li>Stale-feed triggers and open review items</li>
      </ul>
      <span className="vdm-coming">C1.9d — pipeline view</span>
    </div>
  );
}
