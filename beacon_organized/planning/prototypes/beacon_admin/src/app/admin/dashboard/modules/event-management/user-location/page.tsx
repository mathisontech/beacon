export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Event Management</p>
        <h1>User Location</h1>
        <p>Multi-source position fix: GPS, WiFi, cell, BLE mesh, UWB.</p>
      </div>
      <div className="content-card">
        <h2>Development Blocks</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Under development.</p>
      </div>
    </div>
  );
}
