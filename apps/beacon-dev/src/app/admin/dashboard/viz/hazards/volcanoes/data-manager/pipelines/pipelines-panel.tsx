export function PipelinesPanel() {
  return (
    <div className="vdm-placeholder">
      <h2>Per-Volcano Pipelines</h2>
      <p>
        One aggregation pipeline per curated volcano. Mirrors the public
        sidebar but also exposes how each value was derived and how complete
        our coverage is. Scaffolding only.
      </p>
      <ul>
        <li>Outline polygon and pre-assigned evacuation zones</li>
        <li>Unrest hotspot polygons and satellite thermal anomalies</li>
        <li>Monitoring agency and official announcement log</li>
        <li>Activity types with warning-sign status feeds</li>
        <li>Deviation analysis (quakes, uplift, gas)</li>
        <li>Structural damage records</li>
        <li>Magma chamber simulations (link or embed)</li>
        <li>Live camera feeds</li>
        <li>Population totals and population inside evacuation zones</li>
        <li>Event history with per-event pages</li>
        <li>Data-coverage-depth indicator (have / partial / absent)</li>
      </ul>
      <span className="vdm-coming">C1.9f — scaffold next</span>
    </div>
  );
}
