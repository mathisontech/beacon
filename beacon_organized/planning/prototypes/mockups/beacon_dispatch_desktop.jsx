import React, { useState, useEffect } from 'react';

const C = {
  bg: "#F5F5F7",
  card: "#FFFFFF",
  text: "#1A1A1A",
  sub: "#6B7280",
  muted: "#9CA3AF",
  orange: "#EA7928",
  purple: "#B829FC",
  blue: "#3881B8",
  deepPurple: "#50386A",
  green: "#2D8B4E",
  yellow: "#E8B84E",
  red: "#C0392B",
  border: "#E5E7EB",
  feedBg: "#F0F0F2"
};

// ============================================================================
// UNIT STATUS BOARD DATA
// ============================================================================
const unitsData = [
  { id: 'E-41', type: 'Engine', agency: 'Fire', status: 'ASSIGNED', assignment: 'Direct Attack - North Flank', timeInStatus: '34m' },
  { id: 'E-22', type: 'Engine', agency: 'Fire', status: 'ASSIGNED', assignment: 'Direct Attack - North Flank', timeInStatus: '34m' },
  { id: 'E-35', type: 'Engine', agency: 'Fire', status: 'EN ROUTE', assignment: 'Supply Point A', timeInStatus: '12m' },
  { id: 'E-18', type: 'Engine', agency: 'Fire', status: 'AVAILABLE', assignment: '—', timeInStatus: '8m' },
  { id: 'E-52', type: 'Engine', agency: 'Fire', status: 'OUT OF SERVICE', assignment: 'Refueling', timeInStatus: '5m' },
  { id: 'T-4', type: 'Tanker', agency: 'Fire', status: 'ASSIGNED', assignment: 'Water Shuttle - Staging', timeInStatus: '28m' },
  { id: 'T-7', type: 'Tanker', agency: 'Fire', status: 'ASSIGNED', assignment: 'Water Shuttle - Staging', timeInStatus: '28m' },
  { id: 'T-11', type: 'Tanker', agency: 'Fire', status: 'EN ROUTE', assignment: 'Water Shuttle - Staging', timeInStatus: '15m' },
  { id: 'BC-3', type: 'Brush', agency: 'Fire', status: 'ASSIGNED', assignment: 'Perimeter Control', timeInStatus: '42m' },
  { id: 'BC-8', type: 'Brush', agency: 'Fire', status: 'AVAILABLE', assignment: '—', timeInStatus: '6m' },
  { id: 'A-2', type: 'Ambulance', agency: 'EMS', status: 'ASSIGNED', assignment: 'Medical Standby - CP1', timeInStatus: '38m' },
  { id: 'A-6', type: 'Ambulance', agency: 'EMS', status: 'ASSIGNED', assignment: 'Medical Standby - CP1', timeInStatus: '38m' },
  { id: 'A-9', type: 'Ambulance', agency: 'EMS', status: 'EN ROUTE', assignment: 'Evacuee Support', timeInStatus: '9m' },
  { id: 'FT-1', type: 'Battalion Chief', agency: 'Fire', status: 'ASSIGNED', assignment: 'Incident Command - North', timeInStatus: '45m' },
  { id: 'BC-12', type: 'Battalion Chief', agency: 'Fire', status: 'ASSIGNED', assignment: 'Operations - South', timeInStatus: '40m' },
  { id: 'D-4', type: 'Deputy', agency: 'Law', status: 'ASSIGNED', assignment: 'Traffic Control - Hwy 50', timeInStatus: '25m' },
  { id: 'D-7', type: 'Deputy', agency: 'Law', status: 'ASSIGNED', assignment: 'Perimeter Security', timeInStatus: '31m' },
  { id: 'D-11', type: 'Deputy', agency: 'Law', status: 'EN ROUTE', assignment: 'Evacuation Support', timeInStatus: '7m' },
  { id: 'DOZER-1', type: 'Dozer', agency: 'Logistics', status: 'ASSIGNED', assignment: 'Firebreak - West', timeInStatus: '52m' },
  { id: 'WATER-5', type: 'Water Drop', agency: 'Fire', status: 'ASSIGNED', assignment: 'Aerial Ops - East Ridge', timeInStatus: '28m' },
  { id: 'VOL-12', type: 'Volunteer', agency: 'Volunteers', status: 'AVAILABLE', assignment: '—', timeInStatus: '3m' },
  { id: 'VOL-18', type: 'Volunteer', agency: 'Volunteers', status: 'AVAILABLE', assignment: '—', timeInStatus: '4m' },
];

const statusBadgeColor = (status) => {
  switch(status) {
    case 'ASSIGNED': return C.blue;
    case 'AVAILABLE': return C.green;
    case 'EN ROUTE': return C.yellow;
    case 'OUT OF SERVICE': return C.muted;
    default: return C.sub;
  }
};

const typeIcon = (type) => {
  const icons = {
    'Engine': '🚒',
    'Tanker': '💧',
    'Brush': '🌿',
    'Ambulance': '🚑',
    'Battalion Chief': '👨‍🚒',
    'Deputy': '👮',
    'Dozer': '⛏️',
    'Water Drop': '✈️',
    'Volunteer': '🙋',
  };
  return icons[type] || '📍';
};

// ============================================================================
// RESOURCE ORDERS & MUTUAL AID DATA
// ============================================================================
const resourceOrders = [
  { id: 'RO-001', requested: 'Strike Team (5 engines)', by: 'Incident Commander', time: '14:23', status: 'En Route', eta: '45 min' },
  { id: 'RO-002', requested: '2x Ambulances', by: 'Medical Officer', time: '14:51', status: 'Ordered', eta: '12 min' },
  { id: 'RO-003', requested: 'Bulldozer + Operator', by: 'Operations', time: '15:02', status: 'Pending', eta: 'TBD' },
  { id: 'RO-004', requested: 'Helicopter Support', by: 'IC North', time: '14:38', status: 'Confirmed', eta: '18 min' },
];

const mutualAidIncoming = [
  { agency: 'San Bernardino FD', units: 'Tanker 42 + 2 engines', eta: '25 min', contact: 'Dispatch: 42' },
  { agency: 'County Sheriff Air Support', units: '1x Helicopter', eta: '18 min', contact: 'Air 1' },
  { agency: 'County Public Works', units: '2x Dozers', eta: '35 min', contact: 'PW Dispatch' },
];

// ============================================================================
// COMMUNICATIONS DATA
// ============================================================================
const commChannels = ['Fire Dispatch', 'Law Dispatch', 'EMS Dispatch', 'Mutual Aid', 'Command'];

const messagesByChannel = {
  'Fire Dispatch': [
    { time: '15:18', unit: 'E-41', text: 'Direct attack team in position, beginning structure protection', isBridged: false },
    { time: '15:16', unit: 'T-4', text: 'Water shuttle established, supplying operations', isBridged: false },
    { time: '15:14', unit: 'BC-3', text: 'Perimeter secured. No new structures at risk in sector.', isBridged: true, relayTo: ['Command'] },
    { time: '15:12', unit: 'E-35', text: 'En route to supply point A, ETA 4 minutes', isBridged: false },
    { time: '15:08', unit: 'WATER-5', text: 'Drop complete. Reloading at base.', isBridged: false },
  ],
  'Law Dispatch': [
    { time: '15:17', unit: 'D-4', text: 'Traffic control established on Highway 50 northbound', isBridged: true, relayTo: ['Command'] },
    { time: '15:13', unit: 'D-7', text: 'Perimeter security holding. No unauthorized access.', isBridged: false },
    { time: '15:09', unit: 'D-11', text: 'Evacuation support enroute to Ash Lane area', isBridged: false },
  ],
  'EMS Dispatch': [
    { time: '15:15', unit: 'A-2', text: 'Medical standby active at Command Post 1', isBridged: false },
    { time: '15:10', unit: 'A-9', text: 'Assisting evacuees with medical screening', isBridged: false },
  ],
  'Mutual Aid': [
    { time: '15:19', unit: 'SBFD Dispatch', text: 'Tanker 42 departing station, ETA your location 25 minutes', isBridged: true, relayTo: ['Fire Dispatch', 'Command'] },
    { time: '15:11', unit: 'County Air 1', text: 'Helicopter ready for drops, standing by for coordinates', isBridged: true, relayTo: ['Fire Dispatch'] },
  ],
  'Command': [
    { time: '15:17', unit: 'Incident Commander', text: 'All sectors report. Begin status update.', isBridged: false },
    { time: '15:15', unit: 'Operations Chief', text: 'North flank secured. Redirecting resources to south sector.', isBridged: false },
    { time: '15:12', unit: 'Safety Officer', text: 'No injuries reported. All personnel accounted for.', isBridged: false },
  ],
};

// ============================================================================
// WEATHER & ALERTS DATA
// ============================================================================
const weatherData = {
  temp: 92,
  rh: 18,
  windSpeed: 22,
  windDir: 'WSW',
  fireWeatherStatus: 'RED FLAG WARNING',
  forecast: [
    { time: '16:00', temp: 91, wind: 23, rh: 17 },
    { time: '17:00', temp: 88, wind: 24, rh: 16 },
    { time: '18:00', temp: 85, wind: 19, rh: 22 },
    { time: '19:00', temp: 78, wind: 14, rh: 28 },
    { time: '20:00', temp: 72, wind: 8, rh: 35 },
  ],
  nwsAlerts: [
    { severity: 'CRITICAL', text: 'RED FLAG WARNING until 22:00. Extreme fire weather conditions.', time: '13:42' },
    { severity: 'HIGH', text: 'Heat Advisory. Temperature may exceed 95°F.', time: '11:15' },
    { severity: 'MEDIUM', text: 'Air Quality Alert. Smoke impact expected through evening.', time: '12:30' },
  ],
  barometerReadings: [
    { location: 'North Ridge', pressure: 29.82 },
    { location: 'IC Command Post', pressure: 29.81 },
    { location: 'South Sector', pressure: 29.79 },
  ],
  systemAlerts: [
    { time: '15:09', text: 'Unit E-18 GPS signal re-established', type: 'info' },
    { time: '14:56', text: 'New unit joined: County Air 1', type: 'info' },
  ],
};

// ============================================================================
// TIMER COMPONENT
// ============================================================================
function EventTimer() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ============================================================================
// UNIT COUNT STATS
// ============================================================================
function getUnitCounts(units) {
  return {
    assigned: units.filter(u => u.status === 'ASSIGNED').length,
    available: units.filter(u => u.status === 'AVAILABLE').length,
    enRoute: units.filter(u => u.status === 'EN ROUTE').length,
    oos: units.filter(u => u.status === 'OUT OF SERVICE').length,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BeaconDispatchDesktop() {
  const [unitFilter, setUnitFilter] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState('Fire Dispatch');
  const [filteredUnits, setFilteredUnits] = useState(unitsData);

  useEffect(() => {
    if (unitFilter === 'All') {
      setFilteredUnits(unitsData);
    } else {
      setFilteredUnits(unitsData.filter(u => {
        if (unitFilter === 'Fire') return ['Engine', 'Tanker', 'Brush', 'Battalion Chief', 'Water Drop'].includes(u.type);
        if (unitFilter === 'Law') return u.type === 'Deputy';
        if (unitFilter === 'EMS') return u.type === 'Ambulance';
        if (unitFilter === 'Logistics') return u.type === 'Dozer';
        if (unitFilter === 'Volunteers') return u.type === 'Volunteer';
        return false;
      }));
    }
  }, [unitFilter]);

  const counts = getUnitCounts(filteredUnits);
  const totalUnits = 42;
  const activeChannels = 6;
  const pendingOrders = resourceOrders.filter(o => o.status === 'Pending').length;
  const mutualAidRequests = mutualAidIncoming.length;

  return (
    <div style={{ fontFamily: 'Poppins, -apple-system, sans-serif', backgroundColor: C.bg, margin: 0, padding: 0, minHeight: '100vh' }}>

      {/* ============================================================================ */}
      {/* TOP STATUS BAR */}
      {/* ============================================================================ */}
      <div style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}`, padding: '14px 20px' }}>
        {/* Event Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '18px' }}>🔥</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: C.text }}>NE Hills Brush Fire</div>
              <div style={{ fontSize: '12px', color: C.sub }}>Incident start 14:33 UTC</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'mono', color: C.orange, marginLeft: '20px', fontFamily: 'monospace' }}>
              <EventTimer />
            </div>
          </div>
          <div style={{ fontSize: '14px', color: C.sub, fontWeight: 500 }}>
            Dispatch — Central
          </div>
        </div>

        {/* System Stats Row */}
        <div style={{ display: 'flex', gap: '28px', paddingTop: '10px', borderTop: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: '11px', color: C.muted, fontWeight: 600 }}>UNITS TRACKED</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>{totalUnits}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: C.muted, fontWeight: 600 }}>CHANNELS ACTIVE</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>{activeChannels}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: C.muted, fontWeight: 600 }}>PENDING ORDERS</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>{pendingOrders}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: C.muted, fontWeight: 600 }}>MUTUAL AID</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>{mutualAidRequests}</div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* FOUR-COLUMN LAYOUT */}
      {/* ============================================================================ */}
      <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '12px', padding: '12px', overflow: 'hidden' }}>

        {/* ===================================================================== */}
        {/* COL 1: UNIT STATUS BOARD */}
        {/* ===================================================================== */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: C.card, borderRadius: '14px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: C.sub, marginBottom: '8px' }}>FILTER</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'Fire', 'Law', 'EMS', 'Logistics', 'Volunteers'].map(f => (
                <button
                  key={f}
                  onClick={() => setUnitFilter(f)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: unitFilter === f ? 700 : 500,
                    color: unitFilter === f ? C.card : C.text,
                    backgroundColor: unitFilter === f ? C.blue : C.border,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Count Summary */}
          <div style={{ backgroundColor: C.card, borderRadius: '14px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
              <div><span style={{ color: C.blue, fontWeight: 700 }}>{counts.assigned}</span> <span style={{ color: C.muted }}>Assigned</span></div>
              <div><span style={{ color: C.green, fontWeight: 700 }}>{counts.available}</span> <span style={{ color: C.muted }}>Available</span></div>
              <div><span style={{ color: C.yellow, fontWeight: 700 }}>{counts.enRoute}</span> <span style={{ color: C.muted }}>En Route</span></div>
              <div><span style={{ color: C.muted, fontWeight: 700 }}>{counts.oos}</span> <span style={{ color: C.muted }}>OOS</span></div>
            </div>
          </div>

          {/* Unit List */}
          <div style={{ flex: 1, backgroundColor: C.card, borderRadius: '14px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowY: 'auto' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: C.muted, marginBottom: '8px', display: 'flex', gap: '4px', paddingBottom: '6px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ flex: '0 0 50px' }}>UNIT</div>
              <div style={{ flex: 1 }}>STATUS</div>
              <div style={{ flex: '0 0 40px' }}>TIME</div>
            </div>
            {filteredUnits.map(unit => (
              <div key={unit.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: `1px solid ${C.border}`, fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px' }}>{typeIcon(unit.type)}</span>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace', color: C.text }}>{unit.id}</span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: statusBadgeColor(unit.status),
                    color: '#FFF',
                    fontSize: '9px',
                    fontWeight: 700,
                  }}>
                    {unit.status}
                  </span>
                </div>
                <div style={{ fontSize: '9px', color: C.sub, marginLeft: '20px', marginBottom: '2px' }}>{unit.assignment}</div>
                <div style={{ fontSize: '9px', color: C.muted, marginLeft: '20px', fontFamily: 'monospace' }}>{unit.timeInStatus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* COL 2: RESOURCE ORDERS & MUTUAL AID */}
        {/* ===================================================================== */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          {/* Resource Orders */}
          <div style={{ flex: 0.55, backgroundColor: C.card, borderRadius: '14px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: C.sub, marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>RESOURCE ORDERS</span>
              <button style={{
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 600,
                color: '#FFF',
                backgroundColor: C.blue,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}>
                + New
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {resourceOrders.map(order => (
                <div key={order.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}`, fontSize: '10px' }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: '4px' }}>{order.requested}</div>
                  <div style={{ fontSize: '9px', color: C.sub, marginBottom: '4px' }}>by {order.by}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.muted, fontFamily: 'monospace' }}>{order.time}</span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: order.status === 'Pending' ? C.orange : (order.status === 'En Route' ? C.yellow : C.green),
                      color: '#FFF',
                      fontSize: '8px',
                      fontWeight: 700,
                    }}>
                      {order.status}
                    </span>
                  </div>
                  {order.eta && <div style={{ fontSize: '9px', color: C.sub, marginTop: '3px' }}>{order.eta}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Mutual Aid */}
          <div style={{ flex: 0.45, backgroundColor: C.card, borderRadius: '14px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: C.sub, marginBottom: '10px' }}>MUTUAL AID INCOMING</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {mutualAidIncoming.map((aid, idx) => (
                <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}`, fontSize: '9px' }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: '3px' }}>{aid.agency}</div>
                  <div style={{ color: C.sub, marginBottom: '3px' }}>{aid.units}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
                    <span>ETA: {aid.eta}</span>
                    <span style={{ fontFamily: 'monospace' }}>{aid.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log Entry Button */}
          <button style={{
            padding: '10px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#FFF',
            backgroundColor: C.purple,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}>
            📝 Log Entry
          </button>
        </div>

        {/* ===================================================================== */}
        {/* COL 3: MULTI-AGENCY COMMS */}
        {/* ===================================================================== */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden', minWidth: '400px' }}>
          {/* Channel Tabs */}
          <div style={{ backgroundColor: C.card, borderRadius: '14px', padding: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', gap: '4px' }}>
            {commChannels.map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: selectedChannel === ch ? 700 : 500,
                  color: selectedChannel === ch ? C.card : C.text,
                  backgroundColor: selectedChannel === ch ? C.blue : C.border,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Message Feed */}
          <div style={{ flex: 1, backgroundColor: C.card, borderRadius: '14px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: C.muted, marginBottom: '8px' }}>CHANNEL: {selectedChannel}</div>
            {messagesByChannel[selectedChannel]?.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}`, fontSize: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace', color: C.text }}>{msg.unit}</span>
                  <span style={{ color: C.muted, fontSize: '9px' }}>{msg.time}</span>
                  {msg.isBridged && (
                    <span style={{ padding: '1px 4px', borderRadius: '3px', backgroundColor: C.purple, color: '#FFF', fontSize: '8px', fontWeight: 700 }}>
                      🔗 BRIDGED
                    </span>
                  )}
                </div>
                <div style={{ color: C.text, marginBottom: '4px', lineHeight: '1.4' }}>{msg.text}</div>
                {msg.relayTo && (
                  <button style={{
                    padding: '3px 8px',
                    fontSize: '9px',
                    fontWeight: 600,
                    color: C.card,
                    backgroundColor: C.orange,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}>
                    Relay to {msg.relayTo.join(', ')} →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div style={{ backgroundColor: C.card, borderRadius: '14px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <input
              type="text"
              placeholder="Type message..."
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '11px',
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                fontFamily: 'Poppins, -apple-system, sans-serif',
              }}
            />
          </div>
        </div>

        {/* ===================================================================== */}
        {/* COL 4: WEATHER & ALERTS */}
        {/* ===================================================================== */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          {/* Current Weather */}
          <div style={{ backgroundColor: C.card, borderRadius: '14px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: C.sub, marginBottom: '10px' }}>CURRENT</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: C.text, marginBottom: '8px', fontFamily: 'monospace' }}>
              {weatherData.temp}°F
            </div>
            <div style={{ fontSize: '10px', color: C.sub, marginBottom: '8px', lineHeight: '1.6' }}>
              <div>RH: {weatherData.rh}%</div>
              <div>Wind: {weatherData.windSpeed} mph {weatherData.windDir}</div>
              <div style={{ marginTop: '6px', padding: '6px', borderRadius: '6px', backgroundColor: C.red, color: '#FFF', fontWeight: 700 }}>
                {weatherData.fireWeatherStatus}
              </div>
            </div>
          </div>

          {/* Forecast Timeline */}
          <div style={{ backgroundColor: C.card, borderRadius: '14px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: C.sub, marginBottom: '8px' }}>6-HR FORECAST</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {weatherData.forecast.map((f, idx) => (
                <div key={idx} style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{f.time}</span>
                  <span style={{ color: C.sub }}>{f.temp}° {f.wind}mph {f.rh}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* NWS Alerts */}
          <div style={{ flex: 0.5, backgroundColor: C.card, borderRadius: '14px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: C.sub, marginBottom: '8px' }}>NWS ALERTS</div>
            {weatherData.nwsAlerts.map((alert, idx) => (
              <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{
                  padding: '3px 6px',
                  borderRadius: '3px',
                  backgroundColor: alert.severity === 'CRITICAL' ? C.red : (alert.severity === 'HIGH' ? C.orange : C.yellow),
                  color: '#FFF',
                  fontSize: '8px',
                  fontWeight: 700,
                  marginBottom: '4px',
                  display: 'inline-block',
                }}>
                  {alert.severity}
                </div>
                <div style={{ fontSize: '9px', color: C.text, lineHeight: '1.3', marginBottom: '2px' }}>{alert.text}</div>
                <div style={{ fontSize: '8px', color: C.muted }}>{alert.time}</div>
              </div>
            ))}
          </div>

          {/* Barometer Readings */}
          <div style={{ backgroundColor: C.card, borderRadius: '14px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: C.sub, marginBottom: '8px' }}>BAROMETER</div>
            {weatherData.barometerReadings.map((reading, idx) => (
              <div key={idx} style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: idx < weatherData.barometerReadings.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ color: C.sub }}>{reading.location}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: C.text }}>{reading.pressure}</span>
              </div>
            ))}
          </div>

          {/* System Alerts */}
          <div style={{ backgroundColor: C.card, borderRadius: '14px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: C.sub, marginBottom: '8px' }}>SYSTEM ALERTS</div>
            {weatherData.systemAlerts.map((alert, idx) => (
              <div key={idx} style={{ fontSize: '9px', marginBottom: '6px', paddingBottom: '6px', borderBottom: idx < weatherData.systemAlerts.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ color: C.muted, fontFamily: 'monospace', fontSize: '8px', marginBottom: '2px' }}>{alert.time}</div>
                <div style={{ color: C.text }}>{alert.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
