export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Base Map</p>
        <h1>User-Created Layers</h1>
        <p>Private and non-private layers: evacuation zones, utility zones, gate managers.</p>
      </div>
      <div className="content-card">
        <h2>Development Blocks</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Under development.</p>
      </div>
    </div>
  );
}
