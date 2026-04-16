import { useState } from "react";

const C = {
  bg: "#F5F5F7", card: "#FFFFFF", text: "#1A1A1A", sub: "#6B7280", muted: "#9CA3AF",
  orange: "#EA7928", purple: "#B829FC", blue: "#3881B8", deepPurple: "#50386A",
  green: "#2D8B4E", yellow: "#E8B84E", red: "#C0392B", border: "#E5E7EB", feedBg: "#F0F0F2",
};

/* ── SVG Icons ── */
const UnitsSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const SitRepSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const MapSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const CommsSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const TeamSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const CloseSvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusSvg = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const RadioSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;

/* ── Shared Components ── */
const Avatar = ({size=34,initials="MG",bg}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:bg||`linear-gradient(135deg,${C.deepPurple},${C.blue})`,flexShrink:0,border:"2px solid #FFF",boxShadow:"0 2px 8px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:size*0.38,fontWeight:700}}>{initials}</div>
);

const Badge = ({children, color=C.blue}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 7px",borderRadius:10,fontSize:10,fontWeight:600,color,background:`${color}15`,marginRight:3}}>{children}</span>
);

const UnreadDot = ({count, color=C.orange}) => count > 0 ? (
  <span style={{minWidth:18,height:18,borderRadius:9,background:color,color:"#FFF",fontSize:10,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{count}</span>
) : null;

const StatusPill = ({label, color, filled}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:12,fontSize:11,fontWeight:600,color:filled?"#FFF":color,background:filled?color:`${color}15`,marginRight:4}}>{label}</span>
);

/* ── Movement Indicator ── */
const MovementIndicator = ({moving}) => (
  <div style={{display:"flex",alignItems:"center",gap:4}}>
    <div style={{width:8,height:8,borderRadius:"50%",background:moving?C.blue:C.muted,boxShadow:moving?`0 0 6px ${C.blue}60`:"none",animation:moving?"pulse 2s infinite":"none"}} />
    <span style={{fontSize:10,fontWeight:600,color:moving?C.blue:C.muted}}>{moving?"Moving":"Static"}</span>
  </div>
);

/* ── Event Banner ── */
const EventBanner = ({event}) => (
  <div style={{background:`linear-gradient(135deg, ${C.red}12, ${C.orange}08)`,border:`1.5px solid ${C.red}30`,borderRadius:14,padding:"10px 12px",margin:"0 14px 8px",display:"flex",alignItems:"center",gap:10}}>
    <div style={{width:10,height:10,borderRadius:"50%",background:C.red,boxShadow:`0 0 8px ${C.red}60`,animation:"pulse 2s infinite"}} />
    <div style={{flex:1}}>
      <div style={{fontSize:12,fontWeight:700,color:C.red}}>{event.name}</div>
      <div style={{fontSize:11,color:C.sub}}>{event.status}</div>
    </div>
    <Badge color={C.red}>ACTIVE</Badge>
  </div>
);

/* ── Unit Activity Card ── */
const UnitCard = ({unit, isYou}) => {
  const typeColor = {engine:C.blue, aerial:C.orange, law:C.deepPurple, medical:C.red, logistics:C.green, volunteer:C.green}[unit.type] || C.muted;
  return (
    <div style={{background:isYou?`${C.blue}06`:C.card,borderRadius:14,padding:"11px 13px",marginBottom:6,borderLeft:`4px solid ${typeColor}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",border:isYou?`1.5px solid ${C.blue}20`:"1px solid transparent"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Avatar size={36} initials={unit.initials} bg={typeColor} />
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>{unit.name}{isYou && <span style={{fontSize:10,fontWeight:600,color:C.blue,marginLeft:5}}>YOU</span>}</span>
            <MovementIndicator moving={unit.moving} />
          </div>
          <div style={{fontSize:11,color:C.sub,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{unit.role}</div>
        </div>
      </div>
      {/* Current activity */}
      <div style={{marginTop:8,padding:"7px 10px",background:C.feedBg,borderRadius:10}}>
        <div style={{fontSize:12,color:C.text,lineHeight:1.35,fontWeight:500}}>{unit.activity}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:5}}>
          <span style={{fontSize:10,color:C.muted}}>{unit.location}</span>
          <span style={{fontSize:10,color:C.muted}}>Updated {unit.lastUpdate}</span>
        </div>
      </div>
    </div>
  );
};

/* ── Situation Report Card ── */
const SitRepCard = ({report}) => {
  const iconMap = { fire: "\u{1F525}", weather: "\u{1F32C}\uFE0F", resource: "\u{1F692}", evac: "\u{1F3E0}", structure: "\u{1F3DA}\uFE0F", info: "\u2139\uFE0F" };
  return (
    <div style={{background:C.card,borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <span style={{fontSize:20,lineHeight:1}}>{iconMap[report.type] || "\u{1F4CB}"}</span>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{report.title}</span>
            <span style={{fontSize:10,color:C.muted}}>{report.time}</span>
          </div>
          <div style={{fontSize:12,color:C.sub,marginTop:3,lineHeight:1.4}}>{report.body}</div>
          {report.source && <div style={{fontSize:10,color:C.muted,marginTop:4}}>Source: {report.source}</div>}
          {report.actionable && (
            <button style={{marginTop:8,padding:"5px 12px",borderRadius:10,background:`${C.orange}12`,border:`1px solid ${C.orange}40`,cursor:"pointer",fontSize:11,fontWeight:600,color:C.orange}}>
              {report.actionLabel || "Update Status"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Comms Message ── */
const CommsMsg = ({msg}) => (
  <div style={{display:"flex",gap:8,marginBottom:10,flexDirection:msg.self?"row-reverse":"row"}}>
    {!msg.self && <Avatar size={28} initials={msg.initials} bg={msg.bg} />}
    <div style={{maxWidth:"75%"}}>
      {!msg.self && <div style={{fontSize:10,fontWeight:600,color:C.sub,marginBottom:2}}>{msg.name} {msg.role && <Badge color={C.deepPurple}>{msg.role}</Badge>}</div>}
      <div style={{background:msg.self?C.orange:C.card,borderRadius:msg.self?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"8px 12px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
        {msg.radio && <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}><RadioSvg/><span style={{fontSize:10,fontWeight:600,color:msg.self?"#FFF":C.orange}}>Via Radio Relay</span></div>}
        <div style={{fontSize:12,color:msg.self?"#FFF":C.text,lineHeight:1.4}}>{msg.text}</div>
      </div>
      <div style={{fontSize:9,color:C.muted,marginTop:2,textAlign:msg.self?"right":"left"}}>{msg.time}</div>
    </div>
  </div>
);

/* ── Update Report Modal ── */
const UpdateModal = ({open, onClose}) => {
  const [selected, setSelected] = useState(null);
  if (!open) return null;
  const items = [
    {icon:"\u{1F525}",label:"Fire Perimeter Update",desc:"Redraw or adjust fire boundary"},
    {icon:"\u{1F3DA}\uFE0F",label:"Structure Status",desc:"Report damage or defense status"},
    {icon:"\u{1F4CD}",label:"Spot Fire",desc:"Drop pin for new fire location"},
    {icon:"\u2B1B",label:"In the Black",desc:"Confirm or draw burned safe zone"},
    {icon:"\u{1F32C}\uFE0F",label:"Weather / Wind",desc:"Update field weather conditions"},
    {icon:"\u{1F6A7}",label:"Road / Route",desc:"Report closure or hazard"},
    {icon:"\u2705",label:"Task Complete",desc:"Mark an assigned task as done"},
    {icon:"\u{1F198}",label:"Emergency",desc:"Report safety concern or mayday"},
  ];
  return (
    <>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",zIndex:90,borderRadius:40}} />
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.card,borderRadius:"24px 24px 0 0",zIndex:100,padding:"16px 16px 30px",maxHeight:"70%",overflow:"auto",boxShadow:"0 -4px 20px rgba(0,0,0,0.1)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontSize:16,fontWeight:700,color:C.text}}>Update Report</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><CloseSvg/></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {items.map(it => (
            <div key={it.label} onClick={()=>setSelected(it.label)} style={{background:selected===it.label?`${C.orange}12`:C.feedBg,borderRadius:14,padding:12,cursor:"pointer",border:selected===it.label?`1.5px solid ${C.orange}`:"1.5px solid transparent",transition:"all 0.15s"}}>
              <span style={{fontSize:22,display:"block",marginBottom:4}}>{it.icon}</span>
              <span style={{fontSize:12,fontWeight:600,color:C.text,display:"block"}}>{it.label}</span>
              <span style={{fontSize:10,color:C.sub,lineHeight:1.3}}>{it.desc}</span>
            </div>
          ))}
        </div>
        {selected && (
          <button style={{width:"100%",marginTop:14,padding:"12px 0",borderRadius:14,background:C.orange,border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:"#FFF",boxShadow:`0 4px 12px ${C.orange}40`}}>
            Continue &rarr;
          </button>
        )}
      </div>
    </>
  );
};

/* ══════════════════════════════════════════
   SAMPLE DATA
   ══════════════════════════════════════════ */

const ACTIVE_EVENT = {
  name: "NE Hills Brush Fire",
  status: "250 acres \u2022 15% contained \u2022 Wind NE 25 mph",
  ic: "Capt. M. Gonzalez",
  started: "14:22",
  role: "Engine 12 \u2014 Crew Leader",
  assignment: "Defend Oak St structures, west flank",
};

/* ── Unit type definitions ── */
const UNIT_TYPES = [
  { key: "all",       label: "All",         icon: null },
  { key: "engine",    label: "Engines",     icon: "\u{1F692}" },
  { key: "aerial",    label: "Aerial",      icon: "\u{1F681}" },
  { key: "law",       label: "Law Enf.",    icon: "\u{1F46E}" },
  { key: "medical",   label: "Medical",     icon: "\u{1F691}" },
  { key: "logistics", label: "Logistics",   icon: "\u{1F4E6}" },
  { key: "volunteer", label: "Volunteers",  icon: "\u{1F64B}" },
];

/* ── Active units (no completed/resolved items — only current activity) ── */
const UNITS = [
  { id: "e12", name: "Engine 12", initials: "E12", type: "engine", role: "Crew Leader", activity: "Defending structures at 2840\u20132860 Oak St. Active hose line on west exposure.", location: "Oak St, west of Cedar", moving: false, lastUpdate: "2 min ago", isYou: true },
  { id: "e15", name: "Engine 15", initials: "E15", type: "engine", role: "Structure Defense", activity: "Holding defensive position on Cedar Ave. Monitoring for ember ignitions on rooflines.", location: "Cedar Ave & 3rd", moving: false, lastUpdate: "5 min ago" },
  { id: "e7",  name: "Engine 7", initials: "E7", type: "engine", role: "Damage Assessment", activity: "Running structure damage survey on Pine St. 8 structures assessed so far.", location: "Pine St corridor", moving: true, lastUpdate: "3 min ago" },
  { id: "e9",  name: "Engine 9", initials: "E9", type: "engine", role: "Perimeter Patrol", activity: "Patrolling eastern fire line checking for spot fires and fence line ignitions.", location: "Eastern flank, CR4", moving: true, lastUpdate: "1 min ago" },
  { id: "e22", name: "Engine 22", initials: "E22", type: "engine", role: "Water Supply", activity: "Operating relay pump at Main & 4th hydrant. Supplying E12 and E15.", location: "Main St / 4th Ave", moving: false, lastUpdate: "8 min ago" },
  { id: "t21", name: "Tanker 21", initials: "T21", type: "aerial", role: "Air Tanker", activity: "Retardant drop completed on CR4 line. Returning to reload \u2014 12 min cycle.", location: "Airborne, heading to base", moving: true, lastUpdate: "1 min ago" },
  { id: "h9",  name: "Helicopter 9", initials: "H9", type: "aerial", role: "Helicopter", activity: "Grounded due to wind exceeding safety threshold. Standing by at helibase.", location: "Helibase \u2014 Municipal Airport", moving: false, lastUpdate: "20 min ago" },
  { id: "t42", name: "Tanker 42", initials: "T42", type: "aerial", role: "Air Tanker", activity: "En route from San Bernardino. ETA 25 minutes.", location: "In transit", moving: true, lastUpdate: "10 min ago" },
  { id: "d1",  name: "Deputy Torres", initials: "JT", type: "law", role: "Evac Group Supervisor", activity: "Zone 3 door-knock sweep \u2014 82% complete. Found 3 residents needing medical transport.", location: "Zone 3, Cedar neighborhood", moving: true, lastUpdate: "4 min ago" },
  { id: "d2",  name: "Deputy Kim", initials: "DK", type: "law", role: "Traffic Control", activity: "Controlling intersection at Highway 91 & Oak St. Diverting southbound traffic.", location: "Hwy 91 / Oak St", moving: false, lastUpdate: "6 min ago" },
  { id: "d3",  name: "Deputy Rodriguez", initials: "DR", type: "law", role: "Zone 3 Door-Knock", activity: "Clearing east side of Zone 3. Coordinating with Torres on remaining addresses.", location: "Zone 3 East", moving: true, lastUpdate: "3 min ago" },
  { id: "d4",  name: "Deputy Harris", initials: "DH", type: "law", role: "Perimeter Security", activity: "Stationed at Zone 3 entry point. Logging returning residents who were cleared by IC.", location: "Zone 3 checkpoint, Main St", moving: false, lastUpdate: "12 min ago" },
  { id: "m1",  name: "Paramedic Chen", initials: "AC", type: "medical", role: "Medical Unit Leader", activity: "Triage station operational at Convention Center. 4 patients treated, 1 transport to hospital.", location: "Convention Center", moving: false, lastUpdate: "7 min ago" },
  { id: "m2",  name: "Ambulance 3", initials: "A3", type: "medical", role: "Medical Transport", activity: "Transporting elderly resident from Cedar Ave to hospital. Smoke inhalation.", location: "En route to Regional Medical", moving: true, lastUpdate: "2 min ago" },
  { id: "l1",  name: "Lt. Park", initials: "TP", type: "logistics", role: "Logistics Section Chief", activity: "Staging Area B at Community Center is fully operational. Fuel and food resupply arriving.", location: "Community Center", moving: false, lastUpdate: "15 min ago" },
  { id: "l2",  name: "Karen M.", initials: "KM", type: "logistics", role: "Utility Representative", activity: "Zone 3 power lines de-energized. Coordinating with gas company on service shutoffs.", location: "Utility dispatch \u2014 remote", moving: false, lastUpdate: "22 min ago" },
  { id: "v1",  name: "Frank (Ret. PD)", initials: "FR", type: "volunteer", role: "Traffic Direction", activity: "Directing traffic at Main St & 2nd Ave. Routing evacuees toward Convention Center shelter.", location: "Main St / 2nd Ave", moving: false, lastUpdate: "9 min ago" },
  { id: "v2",  name: "Mary (Beacon Vol.)", initials: "MV", type: "volunteer", role: "Elderly Assistance", activity: "Helping 2 elderly residents on Elm St load vehicles. One needs wheelchair-accessible transport.", location: "Elm St", moving: false, lastUpdate: "5 min ago" },
];

const SIT_REPORTS = [
  { type:"fire", title:"Perimeter Update", body:"Fire at 250 acres. Eastern flank holding. Southern flank advancing toward Pine St. Spot fire confirmed east of Highway 91.", time:"16:45", source:"IC \u2014 Capt. Gonzalez", actionable:true, actionLabel:"View on Map" },
  { type:"weather", title:"Wind Shift Warning", body:"NWS reports wind shifting to ENE 30 mph gusting 45 by 18:00. Fire behavior expected to increase on southern flank.", time:"16:30", source:"Weather Service + Barometric sensors", actionable:true, actionLabel:"Acknowledge" },
  { type:"evac", title:"Evacuation Status", body:"Zone 3: 82% confirmed evacuated. 14 buildings yellow (unconfirmed). 3 buildings red (need assistance). Deputy Torres running door-knock sweep.", time:"16:20", source:"Sheriff \u2014 Deputy Torres" },
  { type:"resource", title:"Air Support Update", body:"Tanker 21 on 12-min reload cycle. Tanker 42 en route from San Bernardino, ETA 25 min. Helicopter 9 grounded due to wind.", time:"16:15", source:"Air Ops" },
  { type:"structure", title:"Structure Loss Confirmed", body:"12 structures destroyed on Cedar Ave and Pine St. 8 with major damage. 34 structures actively defended.", time:"15:50", source:"Damage Assessment \u2014 Engine 7" },
  { type:"info", title:"In the Black Update", body:"IC has confirmed burned safe zone from NE ridge to CR4. Updated on map. Safe for crew retreat if needed.", time:"15:30", source:"IC \u2014 Capt. Gonzalez" },
];

const COMMS = [
  { name:"Capt. Gonzalez", initials:"MG", bg:`linear-gradient(135deg,${C.deepPurple},${C.blue})`, role:"IC", text:"All engines: wind shift expected at 18:00. Be prepared to reposition. Monitor for spot fires on your east.", time:"16:32", radio:true },
  { name:"Deputy Torres", initials:"JT", bg:`linear-gradient(135deg,${C.blue},${C.green})`, role:"Evac Lead", text:"Zone 3 sweep 82% complete. Three residents need medical transport. Dispatching ambulance.", time:"16:28" },
  { self:true, text:"Engine 12 copy on wind shift. We're holding Oak St. Water supply established. Structure at 2847 Cedar looks defensible \u2014 requesting assessment task.", time:"16:30" },
  { name:"Air Ops", initials:"AO", bg:C.orange, role:"Air Ops", text:"Tanker 21 dropping retardant on CR4 line now. Ground crews clear the area. Next drop in 15 min.", time:"16:25", radio:true },
  { self:true, text:"Copy Air Ops. Oak St crew clear of drop zone.", time:"16:26" },
  { name:"Lt. Chen", initials:"LC", bg:`linear-gradient(135deg,${C.orange},${C.red})`, role:"Ops Chief", text:"Engine 12: nice work on water supply. Hold Oak St defensive position. Engine 15 will relieve you at 22:00.", time:"16:20" },
];

const TEAM_MEMBERS = [
  { name:"Capt. M. Gonzalez", role:"Incident Commander", status:"active", initials:"MG" },
  { name:"Lt. R. Chen", role:"Operations Section Chief", status:"active", initials:"LC" },
  { name:"Deputy J. Torres", role:"Evacuation Group Supervisor", status:"active", initials:"JT" },
  { name:"K. Tanaka", role:"Air Operations", status:"active", initials:"KT" },
  { name:"T. Park", role:"Logistics Section Chief", status:"active", initials:"TP" },
  { name:"Dr. A. Chen", role:"Medical Unit Leader", status:"active", initials:"AC" },
  { name:"Karen M.", role:"Utility Representative", status:"active", initials:"KM" },
  { name:"You \u2014 Engine 12", role:"Crew Leader \u2014 Oak St Defense", status:"active", initials:"E12" },
  { name:"Engine 15", role:"Crew Leader \u2014 Cedar Ave Defense", status:"active", initials:"E15" },
  { name:"Deputy Rodriguez", role:"Zone 3 Door-Knock", status:"active", initials:"DR" },
  { name:"Deputy Kim", role:"Highway 91 Traffic Control", status:"active", initials:"DK" },
  { name:"Frank (Retired PD)", role:"Main St Traffic Direction", status:"volunteer", initials:"FR" },
];


/* ══════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════ */
export default function BeaconEMS() {
  const [tab, setTab] = useState(0); // 0=Units, 1=SitRep, 2=Map, 3=Comms, 4=Team
  const [updateModal, setUpdateModal] = useState(false);
  const [unitFilter, setUnitFilter] = useState("all");

  const filteredUnits = unitFilter === "all" ? UNITS : UNITS.filter(u => u.type === unitFilter);
  const movingCount = UNITS.filter(u => u.moving).length;
  const staticCount = UNITS.filter(u => !u.moving).length;

  const tabs = [
    {icon:a=><UnitsSvg a={a}/>, label:"Units"},
    {icon:a=><SitRepSvg a={a}/>, label:"SitRep", badge:2},
    {icon:a=><MapSvg a={a}/>, label:"Map"},
    {icon:a=><CommsSvg a={a}/>, label:"Comms", badge:3},
    {icon:a=><TeamSvg a={a}/>, label:"Team"},
  ];

  return (
    <div style={{width:375,height:812,borderRadius:40,overflow:"hidden",background:C.bg,position:"relative",fontFamily:"'Poppins', -apple-system, sans-serif",boxShadow:"0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)",margin:"20px auto"}}>

      {/* ── Status bar ── */}
      <div style={{height:50,padding:"14px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between",background:tab===2?"transparent":C.bg,position:tab===2?"absolute":"relative",top:0,left:0,right:0,zIndex:10}}>
        <span style={{fontSize:14,fontWeight:600,color:tab===2?"#555":C.text}}>9:41</span>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <Badge color={C.red}>ON DUTY</Badge>
          <div style={{width:16,height:10,border:`1.5px solid ${tab===2?"#555":C.text}`,borderRadius:3,position:"relative"}}><div style={{position:"absolute",top:1.5,left:1.5,bottom:1.5,width:"70%",background:tab===2?"#555":C.text,borderRadius:1}} /></div>
        </div>
      </div>

      {/* ── Header ── */}
      {tab !== 2 && (
        <div style={{padding:"4px 16px 8px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Avatar size={34} initials="E12" />
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>
                {["Units","Situation","","Comms","Incident Team"][tab]}
              </div>
              <div style={{fontSize:10,color:C.sub}}>Engine 12 \u2014 Oak St Defense</div>
            </div>
          </div>
          <button onClick={()=>setUpdateModal(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:14,background:C.orange,border:"none",cursor:"pointer",boxShadow:`0 2px 8px ${C.orange}35`}}>
            <PlusSvg/>
            <span style={{fontSize:11,fontWeight:600,color:"#FFF"}}>Update</span>
          </button>
        </div>
      )}

      {/* ── Active Event Banner ── */}
      {tab !== 2 && <EventBanner event={ACTIVE_EVENT} />}

      {/* ── Content Area ── */}
      <div style={{position:"absolute",top:tab===2?0:130,bottom:68,left:0,right:0,overflow:"auto",background:tab===2?"transparent":C.feedBg}}>

        {/* ═══ UNITS TAB (Home) ═══ */}
        {tab === 0 && (
          <div style={{padding:"8px 14px"}}>
            {/* Quick stats bar */}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <div style={{flex:1,background:C.card,borderRadius:10,padding:"6px 10px",display:"flex",alignItems:"center",gap:6,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:C.blue,boxShadow:`0 0 6px ${C.blue}60`,animation:"pulse 2s infinite"}} />
                <span style={{fontSize:12,fontWeight:700,color:C.text}}>{movingCount}</span>
                <span style={{fontSize:10,color:C.sub}}>Moving</span>
              </div>
              <div style={{flex:1,background:C.card,borderRadius:10,padding:"6px 10px",display:"flex",alignItems:"center",gap:6,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:C.muted}} />
                <span style={{fontSize:12,fontWeight:700,color:C.text}}>{staticCount}</span>
                <span style={{fontSize:10,color:C.sub}}>Static</span>
              </div>
              <div style={{background:C.card,borderRadius:10,padding:"6px 10px",display:"flex",alignItems:"center",gap:6,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
                <span style={{fontSize:12,fontWeight:700,color:C.text}}>{UNITS.length}</span>
                <span style={{fontSize:10,color:C.sub}}>Total</span>
              </div>
            </div>

            {/* Unit type filter chips — scrollable row */}
            <div style={{display:"flex",gap:5,marginBottom:10,overflow:"auto",paddingBottom:2}}>
              {UNIT_TYPES.map(t => {
                const count = t.key === "all" ? UNITS.length : UNITS.filter(u => u.type === t.key).length;
                if (t.key !== "all" && count === 0) return null;
                return (
                  <button key={t.key} onClick={()=>setUnitFilter(t.key)} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 12px",borderRadius:20,fontSize:11,fontWeight:600,border:"none",cursor:"pointer",background:unitFilter===t.key?C.orange:`${C.border}`,color:unitFilter===t.key?"#FFF":C.sub,whiteSpace:"nowrap",flexShrink:0}}>
                    {t.icon && <span style={{fontSize:13}}>{t.icon}</span>}
                    <span>{t.label}</span>
                    <span style={{fontSize:10,opacity:0.8}}>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Unit list — live activity for each */}
            {filteredUnits.map(u => (
              <UnitCard key={u.id} unit={u} isYou={u.isYou} />
            ))}

            {filteredUnits.length === 0 && (
              <div style={{textAlign:"center",padding:"30px 20px",color:C.muted,fontSize:13}}>
                No units of this type on scene
              </div>
            )}
          </div>
        )}

        {/* ═══ SITREP TAB ═══ */}
        {tab === 1 && (
          <div style={{padding:"8px 14px"}}>
            {/* Quick status row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
              {[
                {label:"Fire",value:"250 ac",color:C.red},
                {label:"Contained",value:"15%",color:C.orange},
                {label:"Structures",value:"12 lost",color:C.red},
              ].map(s => (
                <div key={s.label} style={{background:C.card,borderRadius:12,padding:"10px 10px 8px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
              {[
                {label:"Wind",value:"NE 25 mph",sub:"Shifting ENE 18:00"},
                {label:"Evac",value:"82%",sub:"Zone 3 confirmed"},
                {label:"Engines",value:"15",sub:"4 aerial, 200+ ppl"},
                {label:"Air Support",value:"1 tanker",sub:"12 min reload cycle"},
              ].map(s => (
                <div key={s.label} style={{background:C.card,borderRadius:12,padding:"8px 10px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:10,color:C.sub}}>{s.label}</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{s.value}</div>
                  <div style={{fontSize:10,color:C.muted}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Situation reports feed */}
            <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>Latest Reports</div>
            {SIT_REPORTS.map((r,i) => <SitRepCard key={i} report={r} />)}
          </div>
        )}

        {/* ═══ MAP TAB ═══ */}
        {tab === 2 && (
          <div style={{position:"relative",width:"100%",height:"100%"}}>
            {/* Cesium 3D/2D Map Placeholder */}
            <div style={{width:"100%",height:"100%",background:"#1B2838",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {/* Terrain base */}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(175deg, #8B7D5E 0%, #9A8C6C 15%, #A69878 30%, #8B7D5E 45%, #7A6D50 55%, #8B7D5E 70%, #9A8C6C 85%, #A69878 100%)"}}>
                <div style={{position:"absolute",bottom:0,left:0,width:"70%",height:"30%",background:"radial-gradient(ellipse at 40% 90%, #6B5F45 0%, #7A6D50 30%, transparent 70%)",opacity:0.5}} />
                <div style={{position:"absolute",top:"10%",left:"-5%",width:"30%",height:"50%",background:"radial-gradient(ellipse at 70% 50%, #6B5F45 0%, transparent 60%)",opacity:0.3}} />
                <div style={{position:"absolute",top:"5%",right:0,width:"25%",height:"40%",background:"radial-gradient(ellipse at 30% 50%, #7A6D50 0%, transparent 60%)",opacity:0.25}} />
                {[{t:"70%",l:"15%",s:18},{t:"60%",l:"45%",s:14},{t:"40%",l:"10%",s:16},{t:"25%",l:"70%",s:15},{t:"55%",l:"75%",s:13},{t:"80%",l:"60%",s:17},{t:"15%",l:"35%",s:12},{t:"35%",l:"55%",s:14}].map((b,i) => (
                  <div key={"brush"+i} style={{position:"absolute",top:b.t,left:b.l,width:b.s,height:b.s,background:"radial-gradient(circle, #6B7A52 0%, transparent 70%)",borderRadius:"50%",opacity:0.3}} />
                ))}
              </div>
              {/* Road - SR-89 (north-south) */}
              <svg style={{position:"absolute",top:0,left:"45%",width:"8%",height:"100%",overflow:"visible"}}>
                <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#C4B59A" strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
                <circle cx="50%" cy="35%" r="2" fill="#FFD700" opacity="0.4" />
              </svg>
              {/* Fire perimeter with gradient effect */}
              <div style={{position:"absolute",top:"20%",left:"15%",width:"40%",height:"35%",border:`3px solid ${C.red}`,borderRadius:"40% 50% 45% 55%",background:`linear-gradient(135deg, ${C.red}25 0%, ${C.orange}15 50%, ${C.red}20 100%)`,boxShadow:`0 0 30px ${C.red}40, inset 0 0 15px ${C.orange}20`}} />
              {/* In the black zone */}
              <div style={{position:"absolute",top:"22%",left:"18%",width:"20%",height:"18%",background:"rgba(50,50,50,0.25)",borderRadius:"40% 50% 45% 55%"}}>
                <span style={{position:"absolute",bottom:-14,left:"50%",transform:"translateX(-50%)",fontSize:9,fontWeight:600,color:"#444",whiteSpace:"nowrap"}}>In the Black</span>
              </div>
              {/* 30-min projection line */}
              <div style={{position:"absolute",top:"16%",left:"10%",width:"50%",height:"43%",border:`2px dashed ${C.orange}`,borderRadius:"40% 50% 45% 55%",opacity:0.7}}>
                <span style={{position:"absolute",top:-14,right:0,fontSize:9,fontWeight:600,color:C.orange,background:"rgba(0,0,0,0.55)",color:"#FFF",padding:"1px 4px",borderRadius:4}}>30 min</span>
              </div>
              {/* 1-hr projection line */}
              <div style={{position:"absolute",top:"12%",left:"5%",width:"58%",height:"50%",border:`2px dashed ${C.yellow}`,borderRadius:"40% 50% 45% 55%",opacity:0.5}}>
                <span style={{position:"absolute",top:-14,right:0,fontSize:9,fontWeight:600,color:C.yellow,background:"rgba(0,0,0,0.55)",color:"#FFF",padding:"1px 4px",borderRadius:4}}>1 hr</span>
              </div>
              {/* Wind arrow */}
              <div style={{position:"absolute",top:70,right:20,background:"rgba(0,0,0,0.55)",borderRadius:10,padding:"6px 10px",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                <div style={{fontSize:10,fontWeight:600,color:"#FFF"}}>Wind</div>
                <div style={{fontSize:14,fontWeight:700,color:C.red}}>NE 25mph</div>
                <div style={{fontSize:18,textAlign:"center"}}>\u2197</div>
              </div>
              {/* Your position dot */}
              <div style={{position:"absolute",top:"55%",left:"50%",width:16,height:16,borderRadius:"50%",background:C.blue,border:"3px solid #FFF",boxShadow:"0 0 10px rgba(0,0,0,0.3)"}}>
                <span style={{position:"absolute",top:-16,left:"50%",transform:"translateX(-50%)",fontSize:8,fontWeight:700,color:"#FFF",whiteSpace:"nowrap",background:"rgba(0,0,0,0.55)",padding:"1px 4px",borderRadius:4}}>You</span>
              </div>
              {/* Other crew dots */}
              {[
                {top:"52%",left:"62%",label:"E15",color:C.blue},
                {top:"38%",left:"55%",label:"E7",color:C.blue},
                {top:"30%",left:"68%",label:"Air",color:C.orange},
                {top:"65%",left:"35%",label:"Torres",color:C.green},
              ].map((d,i) => (
                <div key={i} style={{position:"absolute",top:d.top,left:d.left}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:d.color,border:"2px solid #FFF",boxShadow:"0 0 6px rgba(0,0,0,0.2)"}} />
                  <span style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",fontSize:8,fontWeight:600,color:"#FFF",whiteSpace:"nowrap",background:"rgba(0,0,0,0.55)",padding:"1px 3px",borderRadius:3}}>{d.label}</span>
                </div>
              ))}
              {/* Structures */}
              {[
                {top:"60%",left:"44%",color:C.red,label:"2847"},
                {top:"58%",left:"48%",color:C.orange},
                {top:"62%",left:"46%",color:C.yellow},
                {top:"56%",left:"52%",color:C.green},
              ].map((s,i) => (
                <div key={i} style={{position:"absolute",top:s.top,left:s.left,width:8,height:8,background:s.color,borderRadius:2,border:"1px solid #FFF",boxShadow:"0 0 4px rgba(0,0,0,0.2)"}}>
                  {s.label && <span style={{position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",fontSize:7,fontWeight:600,color:s.color,whiteSpace:"nowrap"}}>{s.label}</span>}
                </div>
              ))}
              {/* Map legend */}
              <div style={{position:"absolute",bottom:80,left:10,background:"rgba(0,0,0,0.7)",borderRadius:10,padding:"8px 10px",boxShadow:"0 2px 8px rgba(0,0,0,0.12)",fontSize:9}}>
                <div style={{fontWeight:700,marginBottom:4,fontSize:10,color:"#E0E0E0"}}>Structures</div>
                {[
                  {color:C.red,label:"Fire < 30 min"},
                  {color:C.orange,label:"30\u201360 min"},
                  {color:C.yellow,label:"1\u20132 hr"},
                  {color:C.green,label:"> 2 hr"},
                ].map(l => (
                  <div key={l.label} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                    <div style={{width:8,height:8,background:l.color,borderRadius:2}} />
                    <span style={{color:"#E0E0E0"}}>{l.label}</span>
                  </div>
                ))}
              </div>
              {/* Update button on map */}
              <button onClick={()=>setUpdateModal(true)} style={{position:"absolute",bottom:80,right:10,display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:16,background:C.orange,border:"none",cursor:"pointer",boxShadow:`0 4px 12px ${C.orange}50`,zIndex:5}}>
                <PlusSvg/>
                <span style={{fontSize:12,fontWeight:600,color:"#FFF"}}>Update</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══ COMMS TAB ═══ */}
        {tab === 3 && (
          <div style={{padding:"8px 14px",display:"flex",flexDirection:"column",height:"100%"}}>
            {/* Channel selector */}
            <div style={{display:"flex",gap:6,marginBottom:10,flexShrink:0}}>
              {["Incident","Fire Ops","Evac"].map((ch,i) => (
                <button key={ch} style={{padding:"5px 12px",borderRadius:14,fontSize:11,fontWeight:600,border:"none",cursor:"pointer",background:i===0?C.deepPurple:`${C.border}`,color:i===0?"#FFF":C.sub}}>
                  {ch} {i===0 && <UnreadDot count={3}/>}
                </button>
              ))}
            </div>
            {/* Radio relay indicator */}
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:`${C.orange}10`,borderRadius:10,marginBottom:10,flexShrink:0}}>
              <RadioSvg/>
              <span style={{fontSize:11,color:C.orange,fontWeight:500}}>Radio relay messages are tagged</span>
            </div>
            {/* Messages */}
            <div style={{flex:1,overflow:"auto"}}>
              {COMMS.map((m,i) => <CommsMsg key={i} msg={m} />)}
            </div>
            {/* Input */}
            <div style={{display:"flex",gap:8,padding:"10px 0 0",flexShrink:0}}>
              <input placeholder="Message incident channel..." style={{flex:1,padding:"10px 14px",borderRadius:20,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",background:C.card}} />
              <button style={{width:38,height:38,borderRadius:19,background:C.orange,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══ TEAM TAB ═══ */}
        {tab === 4 && (
          <div style={{padding:"8px 14px"}}>
            {/* IC card */}
            <div style={{background:C.card,borderRadius:14,padding:"12px 14px",marginBottom:10,borderLeft:`4px solid ${C.deepPurple}`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5}}>Incident Commander</div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginTop:2}}>{ACTIVE_EVENT.ic}</div>
              <div style={{fontSize:11,color:C.sub,marginTop:2}}>Event created {ACTIVE_EVENT.started}</div>
            </div>

            {/* Role count */}
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              <Badge color={C.blue}>{"\u{1F692}"} 15 Engines</Badge>
              <Badge color={C.orange}>{"\u{1F681}"} 4 Aerial</Badge>
              <Badge color={C.green}>{"\u{1F46E}"} 4 Deputies</Badge>
              <Badge color={C.deepPurple}>{"\u{1F64B}"} 2 Volunteers</Badge>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>All Personnel ({TEAM_MEMBERS.length})</div>

            {TEAM_MEMBERS.map((m,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:m.initials==="E12"?`${C.blue}08`:C.card,borderRadius:12,marginBottom:6,border:m.initials==="E12"?`1.5px solid ${C.blue}25`:"1px solid transparent",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                <Avatar size={32} initials={m.initials} bg={m.status==="volunteer"?C.green:undefined} />
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{m.name}</div>
                  <div style={{fontSize:10,color:C.sub}}>{m.role}</div>
                </div>
                <div style={{width:8,height:8,borderRadius:"50%",background:C.green}} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Update Report Modal ── */}
      <UpdateModal open={updateModal} onClose={()=>setUpdateModal(false)} />

      {/* ── Tab Bar ── */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:68,background:C.card,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-around",paddingBottom:8,zIndex:50}}>
        {tabs.map((t,i) => (
          <button key={i} onClick={()=>setTab(i)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"6px 0",minWidth:56,position:"relative"}}>
            {t.icon(tab===i)}
            <span style={{fontSize:10,fontWeight:tab===i?700:500,color:tab===i?C.orange:C.muted}}>{t.label}</span>
            {t.badge && tab!==i && (
              <span style={{position:"absolute",top:0,right:8,minWidth:16,height:16,borderRadius:8,background:C.red,color:"#FFF",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Pulse animation */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
