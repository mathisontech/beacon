import React, { useState } from 'react';

const IncidentCommanderDashboard = () => {
  const C = {
    bg: '#F5F5F7',
    card: '#FFFFFF',
    text: '#1A1A1A',
    sub: '#6B7280',
    muted: '#9CA3AF',
    orange: '#EA7928',
    purple: '#B829FC',
    blue: '#3881B8',
    deepPurple: '#50386A',
    green: '#2D8B4E',
    yellow: '#E8B84E',
    red: '#C0392B',
    border: '#E5E7EB',
    feedBg: '#F0F0F2',
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState({});
  const [activeLayers, setActiveLayers] = useState({
    projections: true,
    structures: true,
    units: true,
    evacZones: true,
  });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [rightPanelTab, setRightPanelTab] = useState('directives');

  const toggleSection = (section) => {
    setSidebarCollapsed(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  // Sample data
  const divisions = {
    Alpha: {
      units: [
        { id: 'E3', name: 'Engine 3', type: 'engine', status: 'active', activity: 'Structure protection' },
        { id: 'E7', name: 'Engine 7', type: 'engine', status: 'active', activity: 'Perimeter work' },
        { id: 'T1', name: 'Tractor 1', type: 'tractor', status: 'active', activity: 'Dozer line' },
      ],
    },
    Bravo: {
      units: [
        { id: 'E5', name: 'Engine 5', type: 'engine', status: 'active', activity: 'Evacuation support' },
        { id: 'E9', name: 'Engine 9', type: 'engine', status: 'reassigning', activity: 'En route to Div Charlie' },
        { id: 'T2', name: 'Tractor 2', type: 'tractor', status: 'active', activity: 'Perimeter extension' },
      ],
    },
    Charlie: {
      units: [
        { id: 'E2', name: 'Engine 2', type: 'engine', status: 'active', activity: 'Structure defense' },
        { id: 'E6', name: 'Engine 6', type: 'engine', status: 'active', activity: 'Mop-up' },
        { id: 'E11', name: 'Engine 11', type: 'engine', status: 'emergency', activity: 'Structural collapse reported' },
      ],
    },
    Delta: {
      units: [
        { id: 'E4', name: 'Engine 4', type: 'engine', status: 'active', activity: 'Evacuation route' },
        { id: 'E8', name: 'Engine 8', type: 'engine', status: 'active', activity: 'Road closure' },
        { id: 'L2', name: 'Law 2', type: 'law', status: 'active', activity: 'Traffic control' },
      ],
    },
  };

  const airOps = [
    { id: 'T21', name: 'Tanker 21', status: 'airborne', nextDrop: '18:42', activity: 'Drop on CR4 line' },
    { id: 'T22', name: 'Tanker 22', status: 'reloading', nextDrop: '18:38', activity: 'Staging at air base' },
    { id: 'H1', name: 'Helicopter 1', status: 'airborne', nextDrop: '18:50', activity: 'Recon NW flank' },
    { id: 'H2', name: 'Helicopter 2', status: 'grounded', nextDrop: 'N/A', activity: 'Maintenance' },
  ];

  const evacZones = [
    { zone: 'Zone A', complete: 92, deputies: 'Deputy Smith, Deputy Torres' },
    { zone: 'Zone B', complete: 78, deputies: 'Deputy Chen' },
    { zone: 'Zone C', complete: 45, deputies: 'Deputy Martinez, Deputy Patel' },
  ];

  const logistics = [
    { item: 'Staging Area 1', status: 'Operational', arrival: 'On-site', detail: '8 engines, fuel truck' },
    { item: 'Food Service', status: 'En route', arrival: '18:30', detail: 'Catering for 200+' },
    { item: 'Medical Unit', status: 'Active', arrival: 'On-site', detail: 'Helipad ready' },
  ];

  const activeDirectives = [
    { id: 1, text: 'Engine 9 relocate to Div Charlie', status: 'in-progress', time: '18:12' },
    { id: 2, text: 'Tanker 21 drop on CR4 line', status: 'in-progress', time: '18:05' },
    { id: 3, text: 'Order evacuation Zone C residential', status: 'pending', time: '18:18' },
    { id: 4, text: 'Request mutual aid from County 2', status: 'acknowledged', time: '18:22' },
  ];

  const sizeUps = [
    { type: 'fire', time: '18:24', division: 'Alpha', text: 'Fire behavior active on south flank. Spotting 200+ yards.' },
    { type: 'structure', time: '18:22', division: 'Charlie', text: '3 structures lost on Ridgeline Rd. 2 defended.' },
    { type: 'evac', time: '18:20', division: 'Delta', text: 'Zone B evacuation 78% complete. Road CR2 clear.' },
    { type: 'logistics', time: '18:18', division: 'HQ', text: 'Fuel truck en route. Staging area 1 resupply in progress.' },
  ];

  const radioFeed = [
    { time: '18:25', unit: 'Engine 3', msg: 'Engine 3 on scene Division Alpha. Establishing perimeter.' },
    { time: '18:23', unit: 'Tanker 21', msg: 'Tanker 21 completing drop. Returning to base for reload.' },
    { time: '18:20', unit: 'Deputy Smith', msg: 'Zone A evacuation complete. Road closed behind units.' },
    { time: '18:18', unit: 'Logistics', msg: 'Food service ETAssemble to staging area 1.' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return C.green;
      case 'reassigning': return C.yellow;
      case 'emergency': return C.red;
      case 'airborne': return C.blue;
      case 'reloading': return C.yellow;
      case 'grounded': return C.sub;
      default: return C.muted;
    }
  };

  const getSizeUpColor = (type) => {
    switch (type) {
      case 'fire': return C.red;
      case 'structure': return C.orange;
      case 'evac': return C.blue;
      case 'logistics': return C.purple;
      default: return C.muted;
    }
  };

  const getElapsedTime = () => {
    const startTime = new Date();
    startTime.setHours(14, 30);
    const now = new Date();
    now.setHours(18, 25);
    const ms = now - startTime;
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div style={{
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: C.bg,
      color: C.text,
    }}>
      {/* TOP BAR */}
      <div style={{
        backgroundColor: C.card,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        fontSize: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
          {/* Event name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: C.text,
            }}>
              NE Hills Brush Fire
            </h2>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: C.red,
              animation: 'pulse 2s infinite',
              boxShadow: `0 0 12px ${C.red}`,
            }} />
          </div>

          {/* Key stats */}
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: '13px',
            color: C.text,
          }}>
            <div><span style={{ fontWeight: 500 }}>Acreage:</span> <span style={{ fontWeight: 600, color: C.red }}>250 ac</span></div>
            <div><span style={{ fontWeight: 500 }}>Containment:</span> <span style={{ fontWeight: 600, color: C.orange }}>15%</span></div>
            <div><span style={{ fontWeight: 500 }}>Structures Lost:</span> <span style={{ fontWeight: 600, color: C.red }}>12</span></div>
            <div><span style={{ fontWeight: 500 }}>Defended:</span> <span style={{ fontWeight: 600, color: C.green }}>34</span></div>
            <div><span style={{ fontWeight: 500 }}>Personnel:</span> <span style={{ fontWeight: 600 }}>200+</span></div>
            <div><span style={{ fontWeight: 500 }}>Engines:</span> <span style={{ fontWeight: 600 }}>15</span></div>
            <div><span style={{ fontWeight: 500 }}>Aerial:</span> <span style={{ fontWeight: 600 }}>4</span></div>
          </div>
        </div>

        {/* Weather and IC info */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          fontSize: '13px',
          color: C.sub,
          borderLeft: `1px solid ${C.border}`,
          paddingLeft: '24px',
        }}>
          <div>
            <div style={{ fontWeight: 500, color: C.text }}>Wind</div>
            <div>NE 25 mph → ENE 18:00</div>
          </div>
          <div>
            <div style={{ fontWeight: 500, color: C.text }}>94°F • RH 12%</div>
          </div>
          <div style={{
            textAlign: 'right',
            borderLeft: `1px solid ${C.border}`,
            paddingLeft: '24px',
          }}>
            <div style={{ fontWeight: 500, color: C.text }}>Capt. M. Gonzalez</div>
            <div>Incident Commander</div>
          </div>
          <div style={{
            textAlign: 'right',
            borderLeft: `1px solid ${C.border}`,
            paddingLeft: '24px',
            minWidth: '60px',
          }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: C.text }}>
              {getElapsedTime()}
            </div>
            <div style={{ fontSize: '12px', color: C.muted }}>Elapsed</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* MAIN CONTENT AREA */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        gap: '0',
      }}>
        {/* LEFT SIDEBAR - RESOURCE BOARD */}
        <div style={{
          width: '280px',
          backgroundColor: C.card,
          borderRight: `1px solid ${C.border}`,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Operations Section */}
          <div style={{
            borderBottom: `1px solid ${C.border}`,
            padding: '16px',
          }}>
            <button onClick={() => toggleSection('operations')} style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '8px 0',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: 600,
              color: C.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'Poppins, -apple-system, sans-serif',
            }}>
              Operations
              <span style={{ fontSize: '16px' }}>{sidebarCollapsed.operations ? '▶' : '▼'}</span>
            </button>
            {!sidebarCollapsed.operations && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(divisions).map(([divName, divData]) => (
                  <div key={divName} style={{
                    padding: '10px',
                    backgroundColor: C.bg,
                    borderRadius: '8px',
                    borderLeft: `3px solid ${C.blue}`,
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '6px' }}>Division {divName}</div>
                    {divData.units.map(unit => (
                      <div
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit.id)}
                        style={{
                          padding: '6px 4px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          backgroundColor: selectedUnit === unit.id ? `${C.blue}15` : 'transparent',
                        }}
                      >
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(unit.status),
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: C.text }}>{unit.name}</div>
                          <div style={{ color: C.sub, fontSize: '10px' }}>{unit.activity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Air Ops Section */}
          <div style={{
            borderBottom: `1px solid ${C.border}`,
            padding: '16px',
          }}>
            <button onClick={() => toggleSection('airops')} style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '8px 0',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: 600,
              color: C.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'Poppins, -apple-system, sans-serif',
            }}>
              Air Ops
              <span style={{ fontSize: '16px' }}>{sidebarCollapsed.airops ? '▶' : '▼'}</span>
            </button>
            {!sidebarCollapsed.airops && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {airOps.map(aircraft => (
                  <div key={aircraft.id} style={{
                    padding: '10px',
                    backgroundColor: C.bg,
                    borderRadius: '8px',
                    borderLeft: `3px solid ${C.orange}`,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{aircraft.name}</div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(aircraft.status),
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: C.sub, marginBottom: '2px' }}>
                      {aircraft.activity}
                    </div>
                    <div style={{ fontSize: '10px', color: C.muted }}>
                      Drop ETA: {aircraft.nextDrop}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evacuation Section */}
          <div style={{
            borderBottom: `1px solid ${C.border}`,
            padding: '16px',
          }}>
            <button onClick={() => toggleSection('evac')} style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '8px 0',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: 600,
              color: C.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'Poppins, -apple-system, sans-serif',
            }}>
              Evacuation
              <span style={{ fontSize: '16px' }}>{sidebarCollapsed.evac ? '▶' : '▼'}</span>
            </button>
            {!sidebarCollapsed.evac && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {evacZones.map(zone => (
                  <div key={zone.zone} style={{
                    padding: '10px',
                    backgroundColor: C.bg,
                    borderRadius: '8px',
                    borderLeft: `3px solid ${C.blue}`,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{zone.zone}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: C.green }}>
                        {zone.complete}%
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: `${C.border}`,
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginBottom: '4px',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${zone.complete}%`,
                        backgroundColor: C.green,
                      }} />
                    </div>
                    <div style={{ fontSize: '9px', color: C.sub }}>
                      {zone.deputies}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logistics Section */}
          <div style={{
            padding: '16px',
          }}>
            <button onClick={() => toggleSection('logistics')} style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '8px 0',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: 600,
              color: C.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'Poppins, -apple-system, sans-serif',
            }}>
              Logistics
              <span style={{ fontSize: '16px' }}>{sidebarCollapsed.logistics ? '▶' : '▼'}</span>
            </button>
            {!sidebarCollapsed.logistics && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logistics.map(item => (
                  <div key={item.item} style={{
                    padding: '10px',
                    backgroundColor: C.bg,
                    borderRadius: '8px',
                    borderLeft: `3px solid ${C.purple}`,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '2px' }}>
                      {item.item}
                    </div>
                    <div style={{ fontSize: '10px', color: C.sub, marginBottom: '2px' }}>
                      {item.status}
                    </div>
                    <div style={{ fontSize: '9px', color: C.muted }}>
                      {item.arrival} • {item.detail}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER - MAP AREA */}
        <div style={{
          flex: 1,
          backgroundColor: '#1B2838',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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

          {/* Map legend (overlay) */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background:"rgba(0,0,0,0.7)",
            padding: '12px',
            borderRadius: '8px',
            fontSize: '11px',
            backdropFilter: 'blur(8px)',
            border: `1px solid rgba(255,255,255,0.1)`,
            color:"#E0E0E0",
            zIndex: 20,
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', color:"#E0E0E0" }}>Map Legend</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color:"#E0E0E0" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: C.red }} />
                Fire Perimeter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: C.blue }} />
                Engine
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: C.orange }} />
                Aerial
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: C.green }} />
                Defended
              </div>
            </div>
          </div>

          {/* Map controls */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background:"rgba(0,0,0,0.55)",
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            backdropFilter: 'blur(8px)',
            border: `1px solid rgba(255,255,255,0.1)`,
            color:"#FFF",
            zIndex: 20,
          }}>
            <div style={{ fontWeight: 600, color:"#FFF", marginBottom: '4px' }}>Map Layers</div>
            {['projections', 'structures', 'units', 'evacZones'].map(layer => (
              <label key={layer} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                color:"#FFF",
              }}>
                <input
                  type="checkbox"
                  checked={activeLayers[layer]}
                  onChange={() => toggleLayer(layer)}
                  style={{ cursor: 'pointer' }}
                />
                {layer === 'projections' ? 'Fire Projections' :
                 layer === 'structures' ? 'Structures' :
                 layer === 'units' ? 'Units & Divisions' :
                 'Evac Zones'}
              </label>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - DIRECTIVES & FEED */}
        <div style={{
          width: '320px',
          backgroundColor: C.card,
          borderLeft: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* Tab navigation */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${C.border}`,
            padding: '0 16px',
            gap: '0',
          }}>
            {['directives', 'sizeups', 'comms'].map(tab => (
              <button
                key={tab}
                onClick={() => setRightPanelTab(tab)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: rightPanelTab === tab ? `3px solid ${C.blue}` : 'none',
                  color: rightPanelTab === tab ? C.blue : C.sub,
                  fontSize: '12px',
                  fontWeight: rightPanelTab === tab ? 600 : 500,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, -apple-system, sans-serif',
                }}
              >
                {tab === 'directives' ? 'Directives' :
                 tab === 'sizeups' ? 'Size-Ups' :
                 'Communications'}
              </button>
            ))}
          </div>

          {/* Directives Tab */}
          {rightPanelTab === 'directives' && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>
                Active Directives
              </div>
              {activeDirectives.map(directive => (
                <div key={directive.id} style={{
                  padding: '10px',
                  backgroundColor: C.feedBg,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${
                    directive.status === 'in-progress' ? C.orange :
                    directive.status === 'pending' ? C.yellow :
                    C.green
                  }`,
                  fontSize: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 500, color: C.text, flex: 1 }}>
                      {directive.text}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: directive.status === 'in-progress' ? C.orange :
                             directive.status === 'pending' ? C.yellow :
                             C.green,
                      textTransform: 'capitalize',
                    }}>
                      {directive.status}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: C.muted }}>
                    {directive.time}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{
                  padding: '8px 12px',
                  backgroundColor: C.blue,
                  color: C.card,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, -apple-system, sans-serif',
                }}>
                  Reassign Unit
                </button>
                <button style={{
                  padding: '8px 12px',
                  backgroundColor: C.red,
                  color: C.card,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, -apple-system, sans-serif',
                }}>
                  Order Evacuation
                </button>
                <button style={{
                  padding: '8px 12px',
                  backgroundColor: C.purple,
                  color: C.card,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, -apple-system, sans-serif',
                }}>
                  Request Mutual Aid
                </button>
                <button style={{
                  padding: '8px 12px',
                  backgroundColor: C.orange,
                  color: C.card,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, -apple-system, sans-serif',
                }}>
                  Issue Advisory
                </button>
              </div>
            </div>
          )}

          {/* Size-Ups Tab */}
          {rightPanelTab === 'sizeups' && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>
                Incoming Size-Ups
              </div>
              {sizeUps.map((sizeUp, idx) => (
                <div key={idx} style={{
                  padding: '10px',
                  backgroundColor: C.feedBg,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${getSizeUpColor(sizeUp.type)}`,
                  fontSize: '12px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}>
                    <div style={{ fontWeight: 600, color: C.text, textTransform: 'uppercase' }}>
                      {sizeUp.division}
                    </div>
                    <div style={{ fontSize: '11px', color: C.muted }}>
                      {sizeUp.time}
                    </div>
                  </div>
                  <div style={{ color: C.text, lineHeight: '1.3' }}>
                    {sizeUp.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Communications Tab */}
          {rightPanelTab === 'comms' && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>
                Radio Relay Feed
              </div>
              {radioFeed.map((msg, idx) => (
                <div key={idx} style={{
                  padding: '10px',
                  backgroundColor: C.feedBg,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${C.sub}`,
                  fontSize: '12px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}>
                    <div style={{ fontWeight: 600, color: C.text }}>
                      {msg.unit}
                    </div>
                    <div style={{ fontSize: '11px', color: C.muted }}>
                      {msg.time}
                    </div>
                  </div>
                  <div style={{ color: C.sub, fontSize: '11px', lineHeight: '1.3' }}>
                    {msg.msg}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentCommanderDashboard;
