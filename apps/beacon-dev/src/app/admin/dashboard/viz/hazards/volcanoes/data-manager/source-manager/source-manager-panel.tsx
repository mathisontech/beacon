export function SourceManagerPanel() {
  return (
    <div className="vdm-placeholder">
      <h2>Data Source Manager</h2>
      <p>
        Interactive world map. Polygons show volcanic regions colored by Beacon
        coverage depth: high / partial / low / not yet integrated. Click a
        region to drill into the data sources powering that coverage.
      </p>
      <ul>
        <li>Region polygon overlay with coverage color ramp</li>
        <li>Integrated vs pending-integration state per region</li>
        <li>Per-region drawer listing the data sources in use</li>
        <li>Per-source detail: polling limits, magnitude floor, sensor footprint, commercial-use license</li>
        <li>Ingestion health and stale-feed triggers surfaced at the region level</li>
      </ul>
      <span className="vdm-coming">C1.9b — region polygons + source registry next</span>
    </div>
  );
}
