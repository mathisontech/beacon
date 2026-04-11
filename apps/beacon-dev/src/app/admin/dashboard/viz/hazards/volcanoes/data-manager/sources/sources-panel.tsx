export function SourcesPanel() {
  return (
    <div className="vdm-placeholder">
      <h2>Data Sources</h2>
      <p>
        Raw feed registry. One entry per upstream observatory or FDSN catalog
        that Beacon polls. Scaffolding only — fills in over the next commits.
      </p>
      <ul>
        <li>Polling limits and current rate</li>
        <li>Magnitude floor (e.g. M4.5+)</li>
        <li>Coverage polygon / sensor locations</li>
        <li>Commercial-use licensing</li>
        <li>Ingestion records and health triggers</li>
        <li>Long-term raw storage retention</li>
      </ul>
      <span className="vdm-coming">C1.9b — registry next</span>
    </div>
  );
}
