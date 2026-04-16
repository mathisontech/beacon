import React, { useState } from 'react';

const BeaconFireCrewMobile = () => {
  const [activeTab, setActiveTab] = useState('fire');
  const [lineProgress, setLineProgress] = useState(65);
  const [crewOnBreak, setCrewOnBreak] = useState(['Lopez']);

  // Design system colors
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

  const fontFamily = '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  // ============ FIRE TAB ============
  const FireTab = () => (
    <div style={{ paddingBottom: 100 }}>
      {/* Division Header */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${C.border}`,
        marginBottom: '12px',
      }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '500' }}>DIVISION ASSIGNMENT</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: C.text, marginTop: '4px' }}>
          Division Alpha — Southern Flank
        </div>
        <div style={{ fontSize: '13px', color: C.sub, marginTop: '4px' }}>
          IC: Battalion Chief Morrison
        </div>
      </div>

      {/* Projection Alert */}
      <div style={{
        margin: '12px',
        padding: '14px',
        background: '#FFF3E6',
        border: `1px solid ${C.orange}`,
        borderRadius: '12px',
      }}>
        <div style={{ fontSize: '11px', color: C.orange, fontWeight: '700', textTransform: 'uppercase' }}>
          ⚠️ Projection Alert
        </div>
        <div style={{ fontSize: '14px', color: C.text, fontWeight: '600', marginTop: '6px' }}>
          Fire projected to reach your position in 47 min
        </div>
        <div style={{ fontSize: '12px', color: C.sub, marginTop: '4px' }}>
          At current advancement rate of 3.2 mph
        </div>
      </div>

      {/* Nearby Activity */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase' }}>
          Nearby Activity
        </div>

        <div style={{
          marginTop: '8px',
          padding: '12px',
          background: C.card,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '13px', color: C.text, fontWeight: '600' }}>Spot fire reported</div>
              <div style={{ fontSize: '12px', color: C.sub, marginTop: '2px' }}>Division Bravo</div>
            </div>
            <div style={{ fontSize: '12px', color: C.muted, fontWeight: '600' }}>0.8 mi NE</div>
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: C.card,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '13px', color: C.text, fontWeight: '600' }}>Tanker drop in progress</div>
              <div style={{ fontSize: '12px', color: C.sub, marginTop: '2px' }}>Division Charlie sector</div>
            </div>
            <div style={{ fontSize: '12px', color: C.muted, fontWeight: '600' }}>1.2 mi SE</div>
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: C.card,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '13px', color: C.text, fontWeight: '600' }}>Div Bravo on retreat</div>
              <div style={{ fontSize: '12px', color: C.sub, marginTop: '2px' }}>Moving to safety zone</div>
            </div>
            <div style={{ fontSize: '12px', color: C.red, fontWeight: '600' }}>0.5 mi N</div>
          </div>
        </div>
      </div>

    </div>
  );

  // ============ LINE TAB ============
  const LineTab = () => (
    <div style={{ paddingBottom: 100 }}>
      {/* Assignment Card */}
      <div style={{
        margin: '12px',
        padding: '16px',
        background: C.card,
        borderRadius: '14px',
        border: `1px solid ${C.border}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: '11px', color: C.sub, fontWeight: '600', textTransform: 'uppercase' }}>
          Current Assignment
        </div>
        <div style={{ fontSize: '16px', color: C.text, fontWeight: '700', marginTop: '8px' }}>
          Build handline from Ridge to CR-4
        </div>
        <div style={{ fontSize: '12px', color: C.sub, marginTop: '4px' }}>
          Length: 2.4 miles | Crew: 4 members
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', color: C.muted, fontWeight: '600' }}>COMPLETION</div>
            <div style={{ fontSize: '13px', color: C.text, fontWeight: '700' }}>{lineProgress}%</div>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: C.feedBg,
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${lineProgress}%`,
              height: '100%',
              background: C.green,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Line Segments */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
          Your Line Segments
        </div>

        <div style={{
          padding: '12px',
          background: C.card,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: C.green,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>Segment 1: Ridge to Miller's Oak</div>
              <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>0.8 mi — Complete</div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: C.card,
          borderRadius: '12px',
          border: `1px solid ${C.orange}`,
          marginBottom: '10px',
          borderWidth: '2px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: C.orange,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>Segment 2: Miller's Oak to Canyon Fork</div>
              <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>1.0 mi — In Progress (YOUR CREW)</div>
            </div>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: C.feedBg,
            borderRadius: '3px',
            overflow: 'hidden',
            marginTop: '8px',
          }}>
            <div style={{
              width: '58%',
              height: '100%',
              background: C.orange,
            }} />
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: C.card,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: C.muted,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>Segment 3: Canyon Fork to CR-4</div>
              <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>0.6 mi — Pending (Div Bravo)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Crew Status */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
          Crew Status
        </div>

        {[
          { name: 'You (Rodriguez)', position: 'Point, Segment 2', status: 'Working' },
          { name: 'Chen', position: 'Follow-up crew, Segment 2', status: 'Working' },
          { name: 'Lopez', position: 'Rest area', status: 'On Break' },
          { name: 'Martinez', position: 'Mop-up, Segment 1', status: 'Working' },
        ].map((member, i) => (
          <div key={i} style={{
            padding: '12px',
            background: C.card,
            borderRadius: '12px',
            border: `1px solid ${C.border}`,
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>{member.name}</div>
              <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>{member.position}</div>
            </div>
            <div style={{
              padding: '4px 8px',
              background: member.status === 'Working' ? C.green : C.yellow,
              color: member.status === 'Working' ? 'white' : '#1A1A1A',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '600',
            }}>
              {member.status}
            </div>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
          Resources
        </div>

        <div style={{
          padding: '12px',
          background: C.card,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>Water Supply</div>
              <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>Tankered cache 0.2 mi S</div>
            </div>
            <div style={{ fontSize: '12px', color: C.green, fontWeight: '700' }}>Good</div>
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: C.card,
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>Tool Inventory</div>
              <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>4 Pulaskis, 6 shovels, 2 McLeods</div>
            </div>
            <div style={{ fontSize: '12px', color: C.green, fontWeight: '700' }}>Full</div>
          </div>
        </div>

        <button style={{
          width: '100%',
          padding: '12px',
          marginTop: '8px',
          background: C.blue,
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          fontFamily,
        }}>
          Request Additional Resources
        </button>
      </div>
    </div>
  );

  // ============ MAP TAB ============
  const MapTab = () => (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: 'linear-gradient(135deg, #D4A574 0%, #A68B5B 50%, #5F6F47 100%)',
      paddingBottom: 100,
    }}>
      {/* Yarnell AZ Desert Terrain Map */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        overflow: 'hidden',
      }}>
        {/* Desert base gradient */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg, #A69878 0%, #8B7D5E 20%, #9A8C6C 40%, #8B7D5E 60%, #7A6D50 80%, #8B7D5E 100%)"}} />

        {/* Hill contours with radial gradients */}
        <div style={{position:"absolute",bottom:"10%",left:"5%",width:"45%",height:"45%",background:"radial-gradient(ellipse 60% 50% at 50% 100%, #6B5F45 0%, #7A6D50 25%, transparent 75%)",opacity:0.4}} />
        <div style={{position:"absolute",top:"8%",right:"10%",width:"40%",height:"50%",background:"radial-gradient(ellipse 55% 45% at 60% 80%, #5A4E38 0%, #6B5F45 30%, transparent 75%)",opacity:0.35}} />
        <div style={{position:"absolute",top:"20%",left:"25%",width:"35%",height:"40%",background:"radial-gradient(ellipse 50% 40% at 45% 100%, #7A6D50 0%, #8B7D5E 35%, transparent 70%)",opacity:0.3}} />

        {/* Scattered brush vegetation dots */}
        {[
          {t:"72%",l:"12%",s:16},{t:"58%",l:"42%",s:14},{t:"38%",l:"8%",s:15},{t:"22%",l:"68%",s:14},
          {t:"52%",l:"72%",s:12},{t:"78%",l:"58%",s:16},{t:"12%",l:"32%",s:13},{t:"32%",l:"52%",s:14},
          {t:"65%",l:"88%",s:15},{t:"18%",l:"78%",s:12},{t:"48%",l:"25%",s:13},{t:"75%",l:"38%",s:15},
          {t:"28%",l:"15%",s:12},{t:"62%",l:"28%",s:14}
        ].map((b,i) => (
          <div key={"brush"+i} style={{position:"absolute",top:b.t,left:b.l,width:b.s,height:b.s,background:"radial-gradient(circle, #556B42 0%, #4A5E38 50%, transparent 100%)",borderRadius:"50%",opacity:0.45}} />
        ))}

        {/* SR-89 Road Path (north-south) */}
        <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}>
          {/* Road shadow/edge */}
          <path d="M 75 20 Q 78 100, 75 200 Q 73 280, 75 380" stroke="#5A5A5A" strokeWidth="5" fill="none" opacity="0.4" />
          {/* Main road */}
          <path d="M 75 20 Q 78 100, 75 200 Q 73 280, 75 380" stroke="#C4B5A0" strokeWidth="3" fill="none" opacity="0.8" />
          {/* Road dashes */}
          <path d="M 75 20 Q 78 100, 75 200 Q 73 280, 75 380" stroke="#D4A574" strokeWidth="1" strokeDasharray="8,12" fill="none" opacity="0.6" />
        </svg>

        {/* Fire Line/Perimeter (red-orange gradient sweep from south-southwest) */}
        <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}>
          {/* Fire line using path */}
          <defs>
            <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#FF4500",stopOpacity:0.8}} />
              <stop offset="50%" style={{stopColor:"#FF6347",stopOpacity:0.7}} />
              <stop offset="100%" style={{stopColor:"#DC143C",stopOpacity:0.5}} />
            </linearGradient>
          </defs>
          {/* Fire perimeter arc from southwest */}
          <path d="M 60 380 Q 120 340, 160 260 Q 180 200, 200 120" stroke="url(#fireGrad)" strokeWidth="6" fill="none" opacity="0.9" />
          {/* Fire glow behind */}
          <path d="M 60 380 Q 120 340, 160 260 Q 180 200, 200 120" stroke="#FF4500" strokeWidth="12" fill="none" opacity="0.2" />
        </svg>

        {/* Burn area shading (triangular south-southwest) */}
        <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}>
          <polygon points="0,400 280,250 200,350" fill="#4A3C28" opacity="0.25" />
          <polygon points="0,400 260,280 180,380" fill="#5A4C38" opacity="0.15" />
        </svg>

        {/* Your position marker */}
        <div style={{
          position: 'absolute',
          top: '55%',
          left: '38%',
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          background: C.blue,
          border: '3px solid white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: '700',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 5,
        }}>
          📍
        </div>
        <div style={{
          position: 'absolute',
          top: 'calc(55% + 22px)',
          left: '38%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: 'white',
          fontWeight: '700',
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 6px',
          borderRadius: '4px',
          zIndex: 5,
        }}>
          You
        </div>

        {/* Crew position markers */}
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '55%',
          width: '20px',
          height: '20px',
          background: C.green,
          border: '2px solid white',
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          zIndex: 4,
        }} />
        <div style={{
          position: 'absolute',
          top: 'calc(45% + 10px)',
          left: 'calc(55% + 10px)',
          fontSize: '9px',
          color: C.green,
          fontWeight: '700',
          background: 'rgba(0,0,0,0.5)',
          padding: '1px 4px',
          borderRadius: '3px',
          zIndex: 4,
        }}>
          Beta-1
        </div>

        {/* Division boundary (north-south dashed line) */}
        <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="10,10" opacity="0.35" />
        </svg>

        {/* Division labels */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '22%',
          fontSize: '12px',
          color: 'white',
          fontWeight: '800',
          background: 'rgba(0,0,0,0.65)',
          padding: '4px 8px',
          borderRadius: '6px',
          zIndex: 3,
          letterSpacing: '1px',
        }}>
          ALPHA
        </div>
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '18%',
          fontSize: '12px',
          color: 'white',
          fontWeight: '800',
          background: 'rgba(0,0,0,0.65)',
          padding: '4px 8px',
          borderRadius: '6px',
          zIndex: 3,
          letterSpacing: '1px',
        }}>
          BRAVO
        </div>

        {/* Escape route (green dashed) */}
        <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}>
          <path d="M 38% 55% L 75% 20%" stroke={C.green} strokeWidth="3" strokeDasharray="8,6" fill="none" opacity="0.75" />
        </svg>
        <div style={{
          position: 'absolute',
          top: '12%',
          right: '8%',
          fontSize: '10px',
          color: C.green,
          fontWeight: '700',
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 8px',
          borderRadius: '6px',
          zIndex: 3,
        }}>
          🚪 Escape
        </div>

        {/* Safety zone (green box) */}
        <div style={{
          position: 'absolute',
          bottom: '8%',
          right: '12%',
          width: '50px',
          height: '50px',
          border: `3px solid ${C.green}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(45, 139, 78, 0.15)',
          fontSize: '12px',
          fontWeight: '700',
          color: C.green,
          zIndex: 3,
        }}>
          SZ
        </div>

        {/* Wind indicator */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.65)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: '700',
          zIndex: 3,
        }}>
          💨 NE 25mph
        </div>

        {/* In the Black zone indicator */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '140px',
          height: '100px',
          background: 'rgba(0, 0, 0, 0.75)',
          borderRadius: '20px',
          border: '3px solid #DC143C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC143C',
          fontSize: '11px',
          fontWeight: '700',
          textAlign: 'center',
          padding: '8px',
          zIndex: 3,
        }}>
          ⚠️ IN THE BLACK
        </div>
      </div>

      {/* Map Legend */}
      <div style={{
        margin: '12px',
        padding: '12px',
        background: C.card,
        borderRadius: '12px',
        border: `1px solid ${C.border}`,
      }}>
        <div style={{ fontSize: '11px', color: C.sub, fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px' }}>
          Legend
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '11px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: C.red, borderRadius: '50%' }} />
            <span style={{ color: C.text }}>Fire perimeter</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: C.blue, borderRadius: '50%' }} />
            <span style={{ color: C.text }}>Your position</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '2px', background: C.orange }} />
            <span style={{ color: C.text }}>30-min projection</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '2px', background: C.green }} />
            <span style={{ color: C.text }}>Escape route</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ============ COMMS TAB ============
  const CommsTab = () => (
    <div style={{ paddingBottom: 100 }}>
      {/* Channel selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px',
        overflowX: 'auto',
        borderBottom: `1px solid ${C.border}`,
      }}>
        {['Div Alpha Tac', 'Command', 'Air-to-Ground'].map((ch, i) => (
          <button key={i} style={{
            padding: '8px 14px',
            background: i === 0 ? C.orange : C.card,
            color: i === 0 ? 'white' : C.text,
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            fontFamily,
          }}>
            {ch}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { dir: 'in', msg: 'Div Alpha, this is Command. Spot fire reported 0.8 mi north of your position.', time: '9:38 AM' },
          { dir: 'out', msg: '10-4 Command. Moving to observe from high ground.', time: '9:39 AM' },
          { dir: 'in', msg: 'Roger. Wind shift expected in 15 minutes, shifting to ENE.', time: '9:40 AM' },
          { dir: 'out', msg: 'Copy wind shift to ENE. Will reposition handline.', time: '9:41 AM' },
        ].map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.dir === 'in' ? 'flex-start' : 'flex-end',
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '10px 12px',
              background: m.dir === 'in' ? C.feedBg : C.orange,
              color: m.dir === 'in' ? C.text : 'white',
              borderRadius: m.dir === 'in' ? '14px 14px 14px 0' : '14px 14px 0 14px',
              fontSize: '12px',
              lineHeight: '1.5',
            }}>
              {m.msg}
              <div style={{
                fontSize: '10px',
                opacity: 0.7,
                marginTop: '4px',
              }}>
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick response buttons */}
      <div style={{
        margin: '12px',
        marginTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ fontSize: '11px', color: C.sub, fontWeight: '600', textTransform: 'uppercase' }}>
          Quick Responses
        </div>
        {['Copy', '10-4', 'Negative', 'Send Units'].map((btn, i) => (
          <button key={i} style={{
            padding: '12px',
            background: C.card,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily,
          }}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );

  // ============ SAFETY TAB ============
  const SafetyTab = () => (
    <div style={{ paddingBottom: 100 }}>
      {/* Emergency Button */}
      <button style={{
        margin: '12px',
        width: 'calc(100% - 24px)',
        padding: '20px',
        background: C.red,
        color: 'white',
        border: 'none',
        borderRadius: '14px',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily,
        boxShadow: '0 8px 16px rgba(192, 57, 43, 0.3)',
      }}>
        🆘 MAYDAY — Activate Emergency Protocol
      </button>

      {/* LCES Checklist */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
          LCES Checklist
        </div>

        {[
          { label: 'Lookouts', desc: 'Observation posts established', status: true },
          { label: 'Communications', desc: 'Radio contact with Command', status: true },
          { label: 'Escape Routes', desc: '2 routes identified & cleared', status: true },
          { label: 'Safety Zones', desc: 'SZ verified & capacity known', status: false },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '12px',
            background: C.card,
            borderRadius: '12px',
            border: `1px solid ${C.border}`,
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: C.sub, marginTop: '2px' }}>{item.desc}</div>
            </div>
            <input type="checkbox" defaultChecked={item.status} style={{
              width: '24px',
              height: '24px',
              cursor: 'pointer',
            }} />
          </div>
        ))}
      </div>

      {/* Escape Routes */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
          Escape Routes
        </div>

        {[
          { name: 'Ridge Route (Primary)', dist: '0.4 mi', time: '6 min' },
          { name: 'Canyon Route (Secondary)', dist: '0.8 mi', time: '12 min' },
        ].map((route, i) => (
          <div key={i} style={{
            padding: '12px',
            background: C.card,
            borderRadius: '12px',
            border: `1px solid ${C.border}`,
            marginBottom: '8px',
          }}>
            <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>{route.name}</div>
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '8px',
              fontSize: '12px',
              color: C.sub,
            }}>
              <span>📍 {route.dist}</span>
              <span>⏱️ {route.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Safety Zones */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
          Safety Zones
        </div>

        {[
          { name: 'Meadow SZ (Primary)', cap: '50 people', dist: '0.4 mi', occ: '12/50' },
          { name: 'Quarry SZ (Secondary)', cap: '30 people', dist: '1.2 mi', occ: '28/30' },
        ].map((sz, i) => (
          <div key={i} style={{
            padding: '12px',
            background: C.card,
            borderRadius: '12px',
            border: `1px solid ${C.border}`,
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>{sz.name}</div>
                <div style={{ fontSize: '11px', color: C.sub, marginTop: '4px' }}>
                  {sz.cap} • {sz.dist}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: C.text, fontWeight: '700' }}>
                {sz.occ}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* In the Black */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
          In the Black
        </div>
        <div style={{
          padding: '14px',
          background: '#FFF3E6',
          border: `1px solid ${C.orange}`,
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>
            ✓ Safe shelter confirmed northeast of Saddle Ridge
          </div>
          <div style={{ fontSize: '11px', color: C.sub, marginTop: '6px' }}>
            Distance: 0.6 mi | Verified: 8:45 AM
          </div>
          <button style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: C.orange,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily,
            width: '100%',
          }}>
            📍 View on Map
          </button>
        </div>
      </div>

      {/* Weather Alerts */}
      <div style={{ margin: '12px', marginTop: '20px' }}>
        <div style={{ fontSize: '12px', color: C.sub, fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
          Active Alerts
        </div>
        <div style={{
          padding: '12px',
          background: '#FFF3E6',
          border: `1px solid ${C.orange}`,
          borderRadius: '12px',
          marginBottom: '8px',
        }}>
          <div style={{ fontSize: '12px', color: C.orange, fontWeight: '700' }}>⚠️ Wind Shift</div>
          <div style={{ fontSize: '11px', color: C.text, marginTop: '4px' }}>
            NE 25 mph shifting to ENE 30+ mph in approximately 13 min
          </div>
        </div>
      </div>
    </div>
  );

  // ============ RENDER ============
  return (
    <div style={{
      fontFamily,
      background: C.bg,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '20px 0',
    }}>
      {/* Mobile Frame */}
      <div style={{
        width: '375px',
        height: '812px',
        background: C.bg,
        borderRadius: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: '20px auto',
      }}>
        {/* Status Bar */}
        <div style={{
          height: '48px',
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingX: '16px',
          paddingTop: '8px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: C.text }}>9:41</div>
          <div style={{
            padding: '4px 10px',
            background: C.green,
            color: 'white',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '700',
          }}>
            🟢 ON DUTY
          </div>
          <div style={{ fontSize: '14px' }}>📶</div>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: C.bg,
        }}>
          {activeTab === 'fire' && <FireTab />}
          {activeTab === 'line' && <LineTab />}
          {activeTab === 'map' && <MapTab />}
          {activeTab === 'comms' && <CommsTab />}
          {activeTab === 'safety' && <SafetyTab />}
        </div>

        {/* Tab Bar */}
        <div style={{
          height: '68px',
          background: C.card,
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          paddingBottom: '8px',
        }}>
          {[
            { id: 'fire', label: 'Fire', icon: '🔥' },
            { id: 'line', label: 'Line', icon: '🔧' },
            { id: 'map', label: 'Map', icon: '🗺️' },
            { id: 'comms', label: 'Comms', icon: '📡' },
            { id: 'safety', label: 'Safety', icon: '🛡️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: '8px 0',
              }}
            >
              <div style={{ fontSize: '24px' }}>{tab.icon}</div>
              <div style={{
                fontSize: '10px',
                fontWeight: '600',
                color: activeTab === tab.id ? C.orange : C.muted,
              }}>
                {tab.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BeaconFireCrewMobile;
