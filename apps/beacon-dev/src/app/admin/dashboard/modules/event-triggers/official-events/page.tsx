export default function Page() {
  return (
    <div>
      <div className="dashboard-welcome">
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Event Triggers</p>
        <h1>Official Source Events</h1>
        <p>NWS emergency, USGS ShakeAlert, NOAA tsunami warning broadcasts.</p>
      </div>
      <div className="content-card">
        <h2>Development Blocks</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Under development.</p>
      </div>
    </div>
  );
}
