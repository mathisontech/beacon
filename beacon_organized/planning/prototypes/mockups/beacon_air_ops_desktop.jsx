import React, { useState, useEffect } from 'react';

export default function AirOpsDesktop() {
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

  // State for timers and interactions
  const [timers, setTimers] = useState({
    tanker21: 480,  // 8:00
    tanker42: 720,  // 12:00
    helicopter9: 0,
    lead47: 300     // 5:00
  });

  const [selectedAircraft, setSelectedAircraft] = useState('tanker21');
  const [selectedDrop, setSelectedDrop] = useState(0);
  const [commMessages, setCommMessages] = useState([
    { id: 1, aircraft: 'Tanker 21', msg: 'Tanker 21 inbound from south, 2 min to drop', time: '14:32' },
    { id: 2, aircraft: 'Lead 47', msg: 'Winds elevated but within limits, cleared hot', time: '14:31' },
    { id: 3, aircraft: 'Ground Crew', msg: 'Crew division south flank clear and confirmed', time: '14:30' },
    { id: 4, aircraft: 'Tanker 42', msg: 'Tanker 42 RTB from San Bernardino, 15 min ETA base', time: '14:29' },
    { id: 5, aircraft: 'Air Ops', msg: 'Next drop CR4 line, helicopter hold west of river', time: '14:28' }
  ]);

  // Countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => ({
        tanker21: Math.max(0, prev.tanker21 - 1),
        tanker42: Math.max(0, prev.tanker42 - 1),
        helicopter9: 0,
        lead47: Math.max(0, prev.lead47 - 1)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Aircraft data
  const aircraft = {
    tanker21: {
      callSign: 'Tanker 21',
      type: 'Air Tanker',
      status: 'AIRBORNE',
      heading: 145,
      altitude: 2400,
      speed: 140,
      payload: { type: 'Retardant', capacity: 4000, current: 3200 },
      pilot: 'J. Morrison',
      location: 'Inbound from south',
      rtb: '18:45'
    },
    tanker42: {
      callSign: 'Tanker 42',
      type: 'Air Tanker',
      status: 'IN_TRANSIT',
      heading: 210,
      altitude: 3100,
      speed: 160,
      payload: { type: 'Retardant', capacity: 4000, current: 4000 },
      pilot: 'R. Chen',
      location: 'From San Bernardino',
      rtb: '19:15'
    },
    helicopter9: {
      callSign: 'Helicopter 9',
      type: 'Helicopter',
      status: 'GROUNDED',
      heading: null,
      altitude: null,
      speed: null,
      payload: { type: 'Water', capacity: 500, current: 500 },
      pilot: 'M. Torres',
      location: 'Staging area',
      reason: 'Wind exceeding safety threshold',
      rtb: null
    },
    lead47: {
      callSign: 'Lead 47',
      type: 'Lead Plane',
      status: 'AIRBORNE',
      heading: 155,
      altitude: 3200,
      speed: 130,
      payload: { type: 'None', capacity: 0, current: 0 },
      pilot: 'K. Washington',
      location: 'Scouting northwest sector',
      rtb: '18:30'
    }
  };

  // Drop queue
  const dropQueue = [
    { id: 1, aircraft: 'Tanker 21', zone: 'CR4 line, southern flank', type: 'Retardant', eta: '14:35', clearance: true },
    { id: 2, aircraft: 'Lead 47', zone: 'Perimeter north ridge', type: 'Scout', eta: '14:37', clearance: true },
    { id: 3, aircraft: 'Tanker 42', zone: 'Eastern approach, structure protection', type: 'Retardant', eta: '14:52', clearance: false },
    { id: 4, aircraft: 'Helicopter 9', zone: 'Southeast flank detail', type: 'Water', eta: 'TBD', clearance: false }
  ];

  // Ground crews
  const groundCrews = [
    { id: 1, name: 'Division South Flank', distance: 800, cleared: true },
    { id: 2, name: 'Division Eastern Approach', distance: 1200, cleared: false },
    { id: 3, name: 'Structure Protection Team', distance: 600, cleared: false }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'AIRBORNE': return C.blue;
      case 'IN_TRANSIT': return C.yellow;
      case 'RELOADING': return C.orange;
      case 'GROUNDED': return C.red;
      default: return C.muted;
    }
  };

  const getStatusPulse = (status) => status === 'AIRBORNE' ? '1s infinite' : 'none';

  return (
    <div style={{
      fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      backgroundColor: C.bg,
      color: C.text,
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* TOP BAR */}
      <div style={{
        backgroundColor: C.deepPurple,
        color: '#FFFFFF',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `2px solid ${C.orange}`,
        fontSize: '13px',
        fontWeight: '500'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            ✈️ Air Operations — NE Hills Brush Fire
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: C.green,
            paddingLeft: '8px',
            paddingRight: '8px',
            paddingTop: '4px',
            paddingBottom: '4px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              animation: `pulse 2s infinite`,
              boxShadow: `0 0 8px ${C.green}`
            }} />
            ACTIVE
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>AIRCRAFT ACTIVE</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: C.orange }}>3</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>GROUNDED</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: C.red }}>1</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>DROPS TODAY</div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>12</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>RETARDANT USED</div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>24K gal</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }}>🌬️</span>
            <span>NE 25mph</span>
            <span style={{ color: '#FFB84D', fontWeight: '600' }}>CAUTION</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }}>👁️</span>
            <span>2 mi (smoke)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }}>☁️</span>
            <span>8000 ft</span>
          </div>
          <div style={{ borderLeft: `1px solid rgba(255,255,255,0.2)`, paddingLeft: '20px' }}>
            <strong>Air Ops Coordinator:</strong> K. Tanaka
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Three columns */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* LEFT COLUMN - Aircraft Status Board */}
        <div style={{
          width: '300px',
          backgroundColor: C.bg,
          borderRight: `1px solid ${C.border}`,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Aircraft Status
          </div>

          {Object.entries(aircraft).map(([key, ac]) => (
            <div
              key={key}
              onClick={() => setSelectedAircraft(key)}
              style={{
                backgroundColor: C.card,
                border: selectedAircraft === key ? `2px solid ${C.orange}` : `1px solid ${C.border}`,
                borderRadius: '14px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedAircraft === key ? `0 4px 12px rgba(234, 121, 40, 0.2)` : '0 1px 3px rgba(0,0,0,0.05)',
                fontSize: '11px'
              }}
            >
              {/* Header with callsign and type */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '12px', color: C.text }}>{ac.callSign}</div>
                  <div style={{ color: C.sub, fontSize: '10px' }}>{ac.type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: getStatusColor(ac.status),
                    color: '#FFFFFF',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    paddingTop: '3px',
                    paddingBottom: '3px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: getStatusPulse(ac.status) ? `pulse 1s infinite` : 'none'
                    }} />
                    {ac.status === 'IN_TRANSIT' ? 'IN TRANSIT' : ac.status}
                  </div>
                </div>
              </div>

              {/* Status-specific content */}
              {ac.status === 'GROUNDED' ? (
                <div style={{ backgroundColor: '#FFE8E8', border: `1px solid ${C.red}`, borderRadius: '8px', padding: '8px', marginBottom: '8px', color: C.red, fontSize: '10px', fontWeight: '500' }}>
                  ⚠️ {ac.reason}
                </div>
              ) : (
                <>
                  {(ac.status === 'AIRBORNE' || ac.status === 'IN_TRANSIT') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px', fontSize: '10px' }}>
                      <div>
                        <div style={{ color: C.muted }}>HDNG</div>
                        <div style={{ fontWeight: '600', color: C.text }}>{ac.heading}°</div>
                      </div>
                      <div>
                        <div style={{ color: C.muted }}>ALT</div>
                        <div style={{ fontWeight: '600', color: C.text }}>{ac.altitude} ft</div>
                      </div>
                      <div>
                        <div style={{ color: C.muted }}>SPD</div>
                        <div style={{ fontWeight: '600', color: C.text }}>{ac.speed} kts</div>
                      </div>
                      <div>
                        <div style={{ color: C.muted }}>RTB</div>
                        <div style={{ fontWeight: '600', color: C.text }}>{ac.rtb}</div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Pilot and Location */}
              <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ color: C.muted, marginBottom: '4px' }}>Pilot: <strong>{ac.pilot}</strong></div>
                <div style={{ color: C.muted, marginBottom: '4px' }}>Location: <strong>{ac.location}</strong></div>
              </div>

              {/* Payload Bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ color: C.muted, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{ac.payload.type}</span>
                  <span>{ac.payload.current}/{ac.payload.capacity}</span>
                </div>
                <div style={{ backgroundColor: C.feedBg, height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: ac.payload.current > 0 ? C.orange : C.muted,
                    width: `${ac.payload.capacity ? (ac.payload.current / ac.payload.capacity) * 100 : 0}%`,
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>

              {/* Reload Timer (if applicable) */}
              {ac.status === 'RELOADING' && (
                <div style={{
                  backgroundColor: '#FFF3E0',
                  border: `1px solid ${C.orange}`,
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: C.orange,
                  fontSize: '14px',
                  fontFamily: '"Courier New", monospace'
                }}>
                  ⏱ {formatTime(timers[key] || 0)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CENTER COLUMN - Airspace/Map View */}
        <div style={{
          flex: 1,
          backgroundColor: '#1B2838',
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Terrain base */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(175deg, #8B7D5E 0%, #9A8C6C 15%, #A69878 30%, #8B7D5E 45%, #7A6D50 55%, #8B7D5E 70%, #9A8C6C 85%, #A69878 100%)"}}>
            <div style={{position:"absolute",bottom:0,left:0,width:"70%",height:"30%",background:"radial-gradient(ellipse at 40% 90%, #6B5F45 0%, #7A6D50 30%, transparent 70%)",opacity:0.5}} />
            <div style={{position:"absolute",top:"10%",left:"-5%",width:"30%",height:"50%",background:"radial-gradient(ellipse at 70% 50%, #6B5F45 0%, transparent 60%)",opacity:0.3}} />
            <div style={{position:"absolute",top:"5%",right:0,width:"25%",height:"40%",background:"radial-gradient(ellipse at 30% 50%, #7A6D50 0%, transparent 60%)",opacity:0.25}} />
            {[{t:"70%",l:"15%",s:18},{t:"60%",l:"45%",s:14},{t:"40%",l:"10%",s:16},{t:"25%",l:"70%",s:15},{t:"55%",l:"75%",s:13},{t:"80%",l:"60%",s:17},{t:"15%",l:"35%",s:12},{t:"35%",l:"55%",s:14}].map((b,i) => (
              <div key={"brush"+i} style={{position:"absolute",top:b.t,left:b.l,width:b.s,height:b.s,background:"radial-gradient(circle, #6B7A52 0%, transparent 70%)",borderRadius:"50%",opacity:0.3}} />
            ))}
          </div>

          {/* Legend overlay */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background:"rgba(0,0,0,0.7)",
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '10px',
            minWidth: '120px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(4px)',
            color:"#E0E0E0",
            zIndex: 20,
          }}>
            <div style={{ fontWeight: '600', marginBottom: '6px', color:"#E0E0E0" }}>Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color:"#E0E0E0" }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#D32F2F' }} />
                <span>Fire perimeter</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: C.orange }} />
                <span>Drop zones</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '6px', borderTop: '2px solid #9B8860' }} />
                <span>Terrain</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Drop Queue + Comms */}
        <div style={{
          width: '300px',
          backgroundColor: C.bg,
          borderLeft: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Drop Queue Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderBottom: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.card }}>
              <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Drop Queue
              </div>
              <button style={{
                width: '100%',
                backgroundColor: C.orange,
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }} onMouseEnter={(e) => e.target.style.backgroundColor = '#D46820'} onMouseLeave={(e) => e.target.style.backgroundColor = C.orange}>
                + Add Drop
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {dropQueue.map((drop, idx) => (
                <div
                  key={drop.id}
                  onClick={() => setSelectedDrop(idx)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: `1px solid ${C.border}`,
                    cursor: 'pointer',
                    backgroundColor: selectedDrop === idx ? '#FFF3E0' : C.card,
                    borderLeft: selectedDrop === idx ? `4px solid ${C.orange}` : '4px solid transparent',
                    transition: 'all 0.2s',
                    fontSize: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontWeight: '600', color: C.text }}>{drop.aircraft}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: C.orange }}>{drop.eta}</div>
                  </div>
                  <div style={{ color: C.sub, marginBottom: '6px', fontSize: '9px' }}>{drop.zone}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ backgroundColor: '#F0F0F2', padding: '2px 6px', borderRadius: '4px', fontSize: '9px' }}>
                      {drop.type}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {drop.clearance ? (
                        <span style={{ color: C.green, fontSize: '12px' }}>✓</span>
                      ) : (
                        <span style={{ color: C.red, fontSize: '12px' }}>✗</span>
                      )}
                      <span style={{ color: drop.clearance ? C.green : C.red, fontSize: '9px', fontWeight: '500' }}>
                        {drop.clearance ? 'CLEAR' : 'NOT CLEAR'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ground Clearance Status */}
            <div style={{ padding: '10px 12px', backgroundColor: C.card, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ground Clearance
              </div>
              {groundCrews.map((crew) => (
                <div key={crew.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: `1px solid ${C.border}`, fontSize: '9px' }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{crew.name}</span>
                    <span style={{ color: crew.cleared ? C.green : C.red, fontWeight: '600' }}>
                      {crew.cleared ? '✓ CLEAR' : '✗ PENDING'}
                    </span>
                  </div>
                  <div style={{ color: C.muted }}>Distance: {crew.distance}m</div>
                </div>
              ))}
            </div>
          </div>

          {/* Communications Feed */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.card }}>
              <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📡 Air-Ground Comms
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: C.feedBg }}>
              {commMessages.map((msg) => (
                <div key={msg.id} style={{
                  padding: '10px 12px',
                  borderBottom: `1px solid ${C.border}`,
                  backgroundColor: C.card,
                  marginBottom: '4px',
                  marginLeft: '4px',
                  marginRight: '4px',
                  marginTop: '4px',
                  borderRadius: '6px',
                  fontSize: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: C.orange }}>{msg.aircraft}</span>
                    <span style={{ color: C.muted, fontSize: '9px' }}>{msg.time}</span>
                  </div>
                  <div style={{ color: C.sub, lineHeight: '1.3' }}>{msg.msg}</div>
                </div>
              ))}
            </div>

            {/* Quick Send Buttons */}
            <div style={{ padding: '10px', backgroundColor: C.card, borderTop: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Cleared Hot', color: C.green },
                { label: 'Hold', color: C.yellow },
                { label: 'Abort Drop', color: C.red },
                { label: 'All Clear', color: C.blue }
              ].map((btn) => (
                <button
                  key={btn.label}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: btn.color,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '9px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
