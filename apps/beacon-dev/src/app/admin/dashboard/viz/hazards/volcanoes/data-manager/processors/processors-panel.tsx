export function ProcessorsPanel() {
  return (
    <div className="vdm-placeholder">
      <h2>Data Source Processors</h2>
      <p>
        Region → volcano tree. Each volcano is a leaf with its own processor
        pipeline. Click a volcano to open the full overview page — a superset
        of the sidebar view, with every derivation and coverage gap exposed.
      </p>
      <ul>
        <li>Region groups (Cascades, Aleutians, Central America, Indonesia, ...)</li>
        <li>Volcano leaves with status chips (normal / watch / advisory / warning)</li>
        <li>Click-through to full-screen volcano overview:</li>
        <li>— Outline polygon, evacuation zones, population in each zone</li>
        <li>— Monitoring agency and announcement log</li>
        <li>— Activity types with warning-sign status feeds</li>
        <li>— Deviation analysis (quakes, uplift, gas), structural damage, satellite hotspots</li>
        <li>— Live camera embeds, magma chamber sim links</li>
        <li>— Event history with per-event pages (ashfall, simulation if possible)</li>
        <li>— Data-coverage-depth indicator per field (have / partial / absent)</li>
      </ul>
      <span className="vdm-coming">C1.9d — region tree, C1.9e — full overview page</span>
    </div>
  );
}
