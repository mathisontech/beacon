import { useState } from "react";

const C = {
  bg: "#F5F5F7", card: "#FFFFFF", text: "#1A1A1A", sub: "#6B7280", muted: "#9CA3AF",
  orange: "#EA7928", purple: "#B829FC", blue: "#3881B8", deepPurple: "#50386A",
  green: "#2D8B4E", yellow: "#E8B84E", red: "#C0392B", border: "#E5E7EB", feedBg: "#F0F0F2",
};

/*
  ── EVACUATION STATUS TIERS ──
  The key insight: "evacuated" is not binary. There are confidence levels.

  NOT EVACUATED:
    needsHelp  — Red.    Occupant is requesting assistance. Highest priority.
    notified   — Orange. Evac order received by occupant, not yet confirmed out.
    unknown    — Dark.   No Beacon user. Nobody has reported anything. Needs door-knock.

  EVACUATED (three tiers of confidence):
    selfReport — Gray.           Occupant says "I left" via Beacon. Unverified.
    unverified — Light teal.     Another Beacon user (neighbor, volunteer) confirms it looks empty.
    verified   — Darker teal.    Police officer or verified official confirmed on-site it's empty.
*/
const STATUS = {
  needsHelp:  { label: "Needs Assistance",       color: C.red,     mapColor: "#DC2626" },
  notified:   { label: "Evac Order Received",     color: C.orange,  mapColor: "#EA7928" },
  unknown:    { label: "Unknown \u2014 No Report",color: "#444444", mapColor: "#555555" },
  selfReport: { label: "Self-Reported Evacuated", color: "#9CA3AF", mapColor: "#B0B0B0" },
  unverified: { label: "Unverified Confirmation", color: "#6DAEAE", mapColor: "#7EC8C8" },
  verified:   { label: "Verified Empty",          color: "#2A8A8A", mapColor: "#2A8A8A" },
};

/* ── Vulnerability tags ── */
const VULN = {
  elderly:    { icon: "\u{1F9D3}", label: "Elderly" },
  children:   { icon: "\u{1F9D2}", label: "Children" },
  pets:       { icon: "\u{1F415}", label: "Pets" },
  disabled:   { icon: "\u267F",    label: "Mobility" },
  noVehicle:  { icon: "\u{1F6AB}", label: "No Vehicle" },
  medical:    { icon: "\u{1F48A}", label: "Medical Needs" },
};

/* ── Sample building data — Yarnell, AZ — sorted by fire contact time ──
   The 2013 Yarnell Hill Fire approached from the south/southwest.
   Yarnell's main road is SR-89 running north-south. Population ~650,
   median age 69.5. Most homes are along SR-89 and a few side roads:
   Shrine Rd, Model Creek Rd, Yarnell Hill Rd. Many properties are
   rural with no formal street address.
── */
const BUILDINGS = [
  { id:"B-01", address:"9100 SR-89 S",        occupants:"Dorothy (82), Harold (85)", fireContact:12, status:"needsHelp", vulns:["elderly","disabled","noVehicle"], note:"Wheelchair user. Closest to fire. Needs accessible transport.", helpRequest:"Need wheelchair-accessible ride", hasBeacon:true, reportedBy:null },
  { id:"B-02", address:"9050 SR-89 S",        occupants:"Margaret (76)",             fireContact:15, status:"needsHelp", vulns:["elderly","noVehicle","pets"], note:"No vehicle, has two cats. South end of town.", helpRequest:"Need a ride out \u2014 have 2 cats", hasBeacon:true, reportedBy:null },
  { id:"B-03", address:"22500 Shrine Rd",     occupants:"Jim & Linda",               fireContact:20, status:"notified",  vulns:[], note:"Near Shrine of St. Joseph. Received notification.", helpRequest:null, hasBeacon:true, reportedBy:null },
  { id:"B-04", address:"22510 Shrine Rd",     occupants:"Unknown",                   fireContact:22, status:"unknown",   vulns:[], note:"No Beacon user at this address", helpRequest:null, hasBeacon:false, reportedBy:null },
  { id:"B-05", address:"9020 SR-89",          occupants:"Robert Vance (71)",         fireContact:25, status:"notified",  vulns:["elderly"], note:"Mid-town on the highway. Packing now.", helpRequest:null, hasBeacon:true, reportedBy:null },
  { id:"B-06", address:"22600 Model Creek Rd",occupants:"The Petersons",             fireContact:28, status:"notified",  vulns:["children","pets"], note:"2 kids under 10, dog. Loading minivan.", helpRequest:null, hasBeacon:true, reportedBy:null },
  { id:"B-07", address:"8950 SR-89",          occupants:"Tom & Mary Wells",          fireContact:32, status:"selfReport",vulns:["pets"], note:"Tom marked 'evacuated' at 16:12. Heading N on 89.", helpRequest:null, hasBeacon:true, reportedBy:"Self (Tom Wells)" },
  { id:"B-08", address:"22650 Model Creek Rd",occupants:"Unknown",                   fireContact:34, status:"unknown",   vulns:[], note:"No Beacon user. Rural property.", helpRequest:null, hasBeacon:false, reportedBy:null },
  { id:"B-09", address:"8900 SR-89",          occupants:"Frank Miller (73)",         fireContact:36, status:"unverified",vulns:["elderly"], note:"Neighbor says Frank left with his son 30 min ago", helpRequest:null, hasBeacon:true, reportedBy:"Sarah K. (neighbor)" },
  { id:"B-10", address:"22700 Yarnell Hill Rd",occupants:"The Garcias",              fireContact:40, status:"verified",  vulns:["children"], note:"Deputy Torres confirmed empty on door-knock", helpRequest:null, hasBeacon:true, reportedBy:"Deputy Torres (verified)" },
  { id:"B-11", address:"8850 SR-89",          occupants:"Rev. James (77)",           fireContact:42, status:"notified",  vulns:["elderly","medical"], note:"On oxygen. Gathering valuables. North end of town.", helpRequest:null, hasBeacon:true, reportedBy:null },
  { id:"B-12", address:"22750 Yarnell Hill Rd",occupants:"Karen & Bill Adams",       fireContact:48, status:"selfReport",vulns:[], note:"Karen marked 'evacuated' at 16:05. Heading to Prescott.", helpRequest:null, hasBeacon:true, reportedBy:"Self (Karen Adams)" },
  { id:"B-13", address:"22800 Model Creek Rd",occupants:"Unknown",                   fireContact:52, status:"unknown",   vulns:[], note:"No Beacon user. Set back from road.", helpRequest:null, hasBeacon:false, reportedBy:null },
  { id:"B-14", address:"8800 SR-89 N",        occupants:"Nancy Liu (69)",            fireContact:55, status:"verified",  vulns:["elderly"], note:"Deputy Rodriguez confirmed empty at 15:58", helpRequest:null, hasBeacon:true, reportedBy:"Deputy Rodriguez (verified)" },
  { id:"B-15", address:"8780 SR-89 N",        occupants:"Ed Thompson (81)",          fireContact:58, status:"unverified",vulns:["elderly","medical"], note:"Mail carrier says Ed's son picked him up this morning", helpRequest:null, hasBeacon:false, reportedBy:"Dave M. (mail carrier, Beacon user)" },
  { id:"B-16", address:"22850 Yarnell Hill Rd",occupants:"The Nguyens",              fireContact:62, status:"verified",  vulns:["children","pets"], note:"Deputy Torres confirmed. Family + dog gone.", helpRequest:null, hasBeacon:true, reportedBy:"Deputy Torres (verified)" },
  { id:"B-17", address:"8750 SR-89 N",        occupants:"Retired couple",            fireContact:68, status:"selfReport",vulns:["elderly"], note:"Marked evacuated at 15:50. Furthest north.", helpRequest:null, hasBeacon:true, reportedBy:"Self" },
];

/* ── Assistance requests ── */
const HELP_REQUESTS = [
  { id:"H-01", address:"9100 SR-89 S", request:"Need wheelchair-accessible transport", who:"Dorothy (82)", fireContact:12, status:"open", vulns:["elderly","disabled","noVehicle"] },
  { id:"H-02", address:"9050 SR-89 S", request:"Need a ride out \u2014 have 2 cats", who:"Margaret (76)", fireContact:15, status:"open", vulns:["elderly","noVehicle","pets"] },
];

/* ── Volunteer offers ── */
const VOLUNTEER_OFFERS = [
  { id:"V-01", name:"Mike R.", type:"Has truck, can transport 4 people + pets", distance:"0.3 mi on SR-89", available:true },
  { id:"V-02", name:"Sarah K.", type:"Can help carry/load belongings", distance:"0.5 mi, Model Creek Rd", available:true },
  { id:"V-03", name:"Dave (Ret. PD)", type:"Has SUV, knows everyone in town", distance:"0.2 mi, Yarnell Hill Rd", available:true },
];

/* ── Role definitions ── */
const ROLES = [
  { key:"law",    label:"Law Enforcement",  desc:"Deputy Torres \u2014 Evac Lead" },
  { key:"public", label:"Public / Civilian", desc:"Mike R. \u2014 Yarnell Resident" },
  { key:"fire",   label:"Fire / EMS",        desc:"Engine 12 \u2014 Crew Leader" },
  { key:"ic",     label:"Incident Commander", desc:"Capt. Gonzalez \u2014 IC" },
];

/* ── Shared Components ── */

const FireContactBadge = ({ minutes }) => {
  const color = minutes < 25 ? C.red : minutes < 40 ? C.orange : minutes < 60 ? C.yellow : C.green;
  return (
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:minutes<25?`0 0 6px ${color}80`:"none",animation:minutes<25?"pulse 2s infinite":"none"}} />
      <span style={{fontSize:11,fontWeight:700,color,fontFamily:"monospace"}}>{minutes}m</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status];
  return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,color:s.color,background:`${s.color}15`}}>{s.label}</span>;
};

const VulnTags = ({ vulns }) => {
  if (!vulns || vulns.length === 0) return null;
  return (
    <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:4}}>
      {vulns.map(v => {
        const tag = VULN[v];
        return (
          <span key={v} style={{display:"inline-flex",alignItems:"center",gap:2,padding:"1px 6px",borderRadius:8,fontSize:9,fontWeight:600,color:C.red,background:`${C.red}10`,border:`1px solid ${C.red}20`}}>
            {tag.icon} {tag.label}
          </span>
        );
      })}
    </div>
  );
};

const ConfidenceLine = ({ b }) => {
  if (!b.reportedBy) return null;
  const isVerified = b.status === "verified";
  const isSelf = b.status === "selfReport";
  const color = isVerified ? "#2A8A8A" : isSelf ? C.muted : "#6DAEAE";
  return (
    <div style={{fontSize:10,color,marginTop:4,fontStyle:"italic"}}>
      {isVerified && "\u2705 "}{b.reportedBy}
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function BeaconEvacManager() {
  const [role, setRole] = useState("law");
  const [viewTab, setViewTab] = useState("map");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [mapFilter, setMapFilter] = useState("all"); // all, needsAttention, evacuated

  const currentRole = ROLES.find(r => r.key === role);

  /* Categorize buildings */
  const needsAttention = BUILDINGS.filter(b => ["needsHelp","notified","unknown"].includes(b.status));
  const evacuated = BUILDINGS.filter(b => ["selfReport","unverified","verified"].includes(b.status));
  const withVulns = BUILDINGS.filter(b => b.vulns && b.vulns.length > 0 && !["selfReport","unverified","verified"].includes(b.status));
  const openRequests = HELP_REQUESTS.filter(h => h.status === "open");

  const roleTabs = {
    law:    ["map","buildings","requests","volunteers"],
    public: ["map","buildings","requests","volunteers"],
    fire:   ["map","buildings"],
    ic:     ["map","buildings","requests","volunteers"],
  };
  const availableTabs = roleTabs[role];
  const tabLabels = { map:"Map", buildings:"List", requests:"Help Needed", volunteers:"Volunteers" };

  /* ── Building Card for list view ── */
  const BuildingCard = ({ b }) => (
    <div style={{background:C.card,borderRadius:14,padding:"11px 13px",marginBottom:6,borderLeft:`4px solid ${STATUS[b.status].color}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>{b.address}</span>
            {!b.hasBeacon && <span style={{fontSize:9,fontWeight:600,color:C.muted,background:`${C.muted}15`,padding:"1px 6px",borderRadius:8}}>No Beacon</span>}
          </div>
          <div style={{fontSize:11,color:C.sub,marginTop:1}}>{b.occupants}</div>
          <VulnTags vulns={b.status !== "verified" && b.status !== "selfReport" && b.status !== "unverified" ? b.vulns : []} />
        </div>
        <FireContactBadge minutes={b.fireContact} />
      </div>
      <div style={{fontSize:11,color:C.sub,marginTop:5}}>{b.note}</div>
      <ConfidenceLine b={b} />
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:7}}>
        <StatusBadge status={b.status} />
        <div style={{display:"flex",gap:5}}>
          {role === "law" && b.status === "unknown" && (
            <button style={{padding:"4px 9px",borderRadius:10,fontSize:10,fontWeight:600,background:C.blue,color:"#FFF",border:"none",cursor:"pointer"}}>Door Knock</button>
          )}
          {role === "law" && b.status === "needsHelp" && (
            <button style={{padding:"4px 9px",borderRadius:10,fontSize:10,fontWeight:600,background:C.orange,color:"#FFF",border:"none",cursor:"pointer"}}>Request Help</button>
          )}
          {role === "law" && (b.status === "selfReport" || b.status === "unverified") && (
            <button style={{padding:"4px 9px",borderRadius:10,fontSize:10,fontWeight:600,background:"#2A8A8A",color:"#FFF",border:"none",cursor:"pointer"}}>Verify Empty</button>
          )}
          {role === "law" && b.status === "notified" && (
            <button style={{padding:"4px 9px",borderRadius:10,fontSize:10,fontWeight:600,background:C.green,color:"#FFF",border:"none",cursor:"pointer"}}>Confirm Clear</button>
          )}
          {role === "public" && b.status === "needsHelp" && (
            <button style={{padding:"4px 9px",borderRadius:10,fontSize:10,fontWeight:600,background:C.green,color:"#FFF",border:"none",cursor:"pointer"}}>I Can Help</button>
          )}
          {role === "public" && (b.status === "notified" || b.status === "unknown") && (
            <button style={{padding:"4px 9px",borderRadius:10,fontSize:10,fontWeight:600,background:"#6DAEAE",color:"#FFF",border:"none",cursor:"pointer"}}>They Left</button>
          )}
        </div>
      </div>
    </div>
  );

  /* ── Help Request Card ── */
  const HelpRequestCard = ({ h }) => (
    <div style={{background:C.card,borderRadius:14,padding:"12px 14px",marginBottom:8,borderLeft:`4px solid ${C.red}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{h.address}</div>
          <div style={{fontSize:12,color:C.sub,marginTop:2}}>{h.who}</div>
          <VulnTags vulns={h.vulns} />
        </div>
        <FireContactBadge minutes={h.fireContact} />
      </div>
      <div style={{fontSize:12,color:C.text,marginTop:8,padding:"8px 10px",background:`${C.red}08`,borderRadius:10,fontWeight:500}}>{h.request}</div>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        {role === "public" && <button style={{flex:1,padding:"8px 0",borderRadius:12,fontSize:12,fontWeight:600,background:C.green,color:"#FFF",border:"none",cursor:"pointer"}}>I Can Help</button>}
        {role === "law" && (
          <>
            <button style={{flex:1,padding:"8px 0",borderRadius:12,fontSize:12,fontWeight:600,background:C.blue,color:"#FFF",border:"none",cursor:"pointer"}}>Assign Unit</button>
            <button style={{flex:1,padding:"8px 0",borderRadius:12,fontSize:12,fontWeight:600,background:C.orange,color:"#FFF",border:"none",cursor:"pointer"}}>Broadcast</button>
          </>
        )}
      </div>
    </div>
  );

  /* ── Volunteer Card ── */
  const VolunteerCard = ({ v }) => (
    <div style={{background:C.card,borderRadius:14,padding:"12px 14px",marginBottom:8,borderLeft:`4px solid ${C.green}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{v.name}</div>
          <div style={{fontSize:11,color:C.sub,marginTop:2}}>{v.distance}</div>
        </div>
        <span style={{padding:"3px 10px",borderRadius:12,fontSize:10,fontWeight:600,color:C.green,background:`${C.green}15`}}>Available</span>
      </div>
      <div style={{fontSize:12,color:C.text,marginTop:6,fontWeight:500}}>{v.type}</div>
      {role === "law" && (
        <div style={{display:"flex",gap:6,marginTop:8}}>
          <button style={{flex:1,padding:"7px 0",borderRadius:10,fontSize:11,fontWeight:600,background:C.blue,color:"#FFF",border:"none",cursor:"pointer"}}>Send to 9100 SR-89</button>
          <button style={{flex:1,padding:"7px 0",borderRadius:10,fontSize:11,fontWeight:600,background:C.border,color:C.sub,border:"none",cursor:"pointer"}}>Send to 9050 SR-89</button>
        </div>
      )}
    </div>
  );

  /* ── Offer Help Modal (Public) ── */
  const OfferModal = () => {
    if (!showOfferModal) return null;
    return (
      <>
        <div onClick={() => setShowOfferModal(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",zIndex:90,borderRadius:40}} />
        <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.card,borderRadius:"24px 24px 0 0",zIndex:100,padding:"16px 16px 30px",boxShadow:"0 -4px 20px rgba(0,0,0,0.1)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:16,fontWeight:700,color:C.text}}>Offer Assistance</span>
            <button onClick={() => setShowOfferModal(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.sub}}>&times;</button>
          </div>
          <div style={{fontSize:12,color:C.sub,marginBottom:14}}>Your location will be shared with evacuation coordinators.</div>
          {[
            {icon:"\u{1F69A}",label:"I have a vehicle",desc:"Can transport people + belongings"},
            {icon:"\u{1F4AA}",label:"I can help carry / load",desc:"Physical assistance"},
            {icon:"\u{1F3E0}",label:"I know my neighbors",desc:"Can check on and report for them"},
            {icon:"\u{1F415}",label:"I can transport animals",desc:"Have space for pets or livestock"},
          ].map(opt => (
            <div key={opt.label} style={{background:C.feedBg,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer",border:"1.5px solid transparent"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{opt.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{opt.label}</div>
                  <div style={{fontSize:11,color:C.sub}}>{opt.desc}</div>
                </div>
              </div>
            </div>
          ))}
          <button style={{width:"100%",marginTop:10,padding:"12px 0",borderRadius:14,background:C.green,border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:"#FFF"}}>Submit Offer</button>
        </div>
      </>
    );
  };

  /* ── Request Help Modal (Law) ── */
  const RequestModal = () => {
    if (!showRequestModal) return null;
    return (
      <>
        <div onClick={() => setShowRequestModal(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",zIndex:90,borderRadius:40}} />
        <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.card,borderRadius:"24px 24px 0 0",zIndex:100,padding:"16px 16px 30px",boxShadow:"0 -4px 20px rgba(0,0,0,0.1)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:16,fontWeight:700,color:C.text}}>Request Public Assistance</span>
            <button onClick={() => setShowRequestModal(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.sub}}>&times;</button>
          </div>
          <div style={{fontSize:12,color:C.sub,marginBottom:14}}>Visible to all Beacon users in the evacuation zone.</div>
          {[
            {icon:"\u{1F697}",label:"Vehicle needed",desc:"Resident has no way to leave"},
            {icon:"\u267F",label:"Accessible vehicle needed",desc:"Wheelchair or mobility impairment"},
            {icon:"\u{1F4AA}",label:"Physical help needed",desc:"Loading, carrying, moving"},
            {icon:"\u{1F415}",label:"Animal transport needed",desc:"Pets or livestock"},
          ].map(opt => (
            <div key={opt.label} style={{background:C.feedBg,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer",border:"1.5px solid transparent"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{opt.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{opt.label}</div>
                  <div style={{fontSize:11,color:C.sub}}>{opt.desc}</div>
                </div>
              </div>
            </div>
          ))}
          <button style={{width:"100%",marginTop:10,padding:"12px 0",borderRadius:14,background:C.orange,border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:"#FFF"}}>Broadcast Request</button>
        </div>
      </>
    );
  };

  /*
    ── Map building positions — Yarnell, AZ ──
    SR-89 runs roughly north-south through center of map.
    Fire approached from the south/southwest.
    South = bottom of screen = closest to fire.
    Shrine Rd branches east, Model Creek Rd branches west,
    Yarnell Hill Rd runs NE off SR-89 at the north end.
  */
  const mapBuildings = [
    /* SR-89 south (closest to fire, bottom of map) */
    { b: BUILDINGS[0],  top:"82%", left:"48%" }, // 9100 SR-89 S — Dorothy
    { b: BUILDINGS[1],  top:"76%", left:"46%" }, // 9050 SR-89 S — Margaret
    /* Shrine Rd (branches east off SR-89, south-center) */
    { b: BUILDINGS[2],  top:"68%", left:"60%" }, // 22500 Shrine Rd
    { b: BUILDINGS[3],  top:"66%", left:"68%" }, // 22510 Shrine Rd
    /* SR-89 mid-town */
    { b: BUILDINGS[4],  top:"62%", left:"47%" }, // 9020 SR-89
    { b: BUILDINGS[6],  top:"50%", left:"48%" }, // 8950 SR-89 — Wells
    { b: BUILDINGS[8],  top:"42%", left:"46%" }, // 8900 SR-89 — Frank
    /* Model Creek Rd (branches west off SR-89) */
    { b: BUILDINGS[5],  top:"58%", left:"32%" }, // 22600 Model Creek Rd — Petersons
    { b: BUILDINGS[7],  top:"54%", left:"25%" }, // 22650 Model Creek Rd
    { b: BUILDINGS[12], top:"46%", left:"28%" }, // 22800 Model Creek Rd
    /* Yarnell Hill Rd (branches NE, north end) */
    { b: BUILDINGS[9],  top:"36%", left:"58%" }, // 22700 Yarnell Hill Rd — Garcias
    { b: BUILDINGS[11], top:"30%", left:"64%" }, // 22750 Yarnell Hill Rd — Adams
    { b: BUILDINGS[15], top:"24%", left:"70%" }, // 22850 Yarnell Hill Rd — Nguyens
    /* SR-89 north (farthest from fire, top of map) */
    { b: BUILDINGS[10], top:"34%", left:"45%" }, // 8850 SR-89 — Rev. James
    { b: BUILDINGS[13], top:"26%", left:"44%" }, // 8800 SR-89 N — Nancy
    { b: BUILDINGS[14], top:"20%", left:"43%" }, // 8780 SR-89 N — Ed
    { b: BUILDINGS[16], top:"14%", left:"42%" }, // 8750 SR-89 N — retired couple
  ];

  return (
    <div style={{width:375,height:812,borderRadius:40,overflow:"hidden",background:C.bg,position:"relative",fontFamily:"'Poppins', -apple-system, sans-serif",boxShadow:"0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)",margin:"20px auto"}}>

      {/* ── Status Bar ── */}
      <div style={{height:50,padding:"14px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:14,fontWeight:600,color:C.text}}>9:41</span>
        <span style={{padding:"2px 7px",borderRadius:10,fontSize:10,fontWeight:600,color:C.red,background:`${C.red}15`}}>ACTIVE EVENT</span>
      </div>

      {/* ── Header ── */}
      <div style={{padding:"2px 16px 4px"}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Evacuation Manager</div>
        <div style={{fontSize:11,color:C.sub}}>{currentRole.desc}</div>
      </div>

      {/* ── Role Switcher (prototype toggle) ── */}
      <div style={{padding:"0 14px 4px",display:"flex",gap:4,overflow:"auto"}}>
        {ROLES.map(r => (
          <button key={r.key} onClick={() => {setRole(r.key); if (!roleTabs[r.key].includes(viewTab)) setViewTab("map");}} style={{padding:"4px 10px",borderRadius:16,fontSize:10,fontWeight:600,border:"none",cursor:"pointer",background:role===r.key?C.deepPurple:C.border,color:role===r.key?"#FFF":C.sub,whiteSpace:"nowrap",flexShrink:0}}>{r.label}</button>
        ))}
      </div>

      {/* ── Summary Strip ── */}
      <div style={{display:"flex",gap:3,padding:"4px 14px 6px"}}>
        {[
          {label:"Need Help", value:BUILDINGS.filter(b=>b.status==="needsHelp").length, color:C.red},
          {label:"No Report", value:BUILDINGS.filter(b=>b.status==="unknown").length, color:"#444"},
          {label:"Pending",   value:BUILDINGS.filter(b=>b.status==="notified").length, color:C.orange},
          {label:"Self-Rpt",  value:BUILDINGS.filter(b=>b.status==="selfReport").length, color:"#9CA3AF"},
          {label:"Unverified",value:BUILDINGS.filter(b=>b.status==="unverified").length, color:"#6DAEAE"},
          {label:"Verified",  value:BUILDINGS.filter(b=>b.status==="verified").length, color:"#2A8A8A"},
        ].map(s => (
          <div key={s.label} style={{flex:1,background:C.card,borderRadius:8,padding:"4px 2px",textAlign:"center",boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:15,fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{fontSize:7,color:C.sub,lineHeight:1.1}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── View Tabs ── */}
      <div style={{display:"flex",gap:4,padding:"0 14px 6px",borderBottom:`1px solid ${C.border}`}}>
        {availableTabs.map(t => (
          <button key={t} onClick={() => setViewTab(t)} style={{padding:"5px 12px",borderRadius:14,fontSize:11,fontWeight:600,border:"none",cursor:"pointer",background:viewTab===t?C.orange:"transparent",color:viewTab===t?"#FFF":C.sub}}>
            {tabLabels[t]}
            {t === "requests" && openRequests.length > 0 && (
              <span style={{marginLeft:4,minWidth:14,height:14,borderRadius:7,background:viewTab===t?"#FFF":C.red,color:viewTab===t?C.orange:"#FFF",fontSize:9,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{openRequests.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{position:"absolute",top:218,bottom:10,left:0,right:0,overflow:"auto"}}>

        {/* ═══ MAP VIEW ═══ */}
        {viewTab === "map" && (
          <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}>

            {/* ── Terrain base — simulated satellite view ── */}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(175deg, #8B7D5E 0%, #9A8C6C 15%, #A69878 30%, #8B7D5E 45%, #7A6D50 55%, #8B7D5E 70%, #9A8C6C 85%, #A69878 100%)"}}>
              {/* Ridge contours — chaparral hills */}
              <div style={{position:"absolute",bottom:0,left:0,width:"70%",height:"30%",background:"radial-gradient(ellipse at 40% 90%, #6B5F45 0%, #7A6D50 30%, transparent 70%)",opacity:0.6}} />
              <div style={{position:"absolute",top:"10%",left:"-5%",width:"30%",height:"50%",background:"radial-gradient(ellipse at 70% 50%, #6B5F45 0%, transparent 60%)",opacity:0.3}} />
              <div style={{position:"absolute",top:"5%",right:0,width:"25%",height:"40%",background:"radial-gradient(ellipse at 30% 50%, #7A6D50 0%, transparent 60%)",opacity:0.25}} />
              {/* Scattered brush */}
              {[{t:"72%",l:"12%",s:20},{t:"78%",l:"35%",s:16},{t:"65%",l:"55%",s:18},{t:"55%",l:"8%",s:14},{t:"35%",l:"15%",s:16},{t:"20%",l:"22%",s:12},{t:"12%",l:"65%",s:15},{t:"30%",l:"78%",s:18},{t:"50%",l:"82%",s:13},{t:"82%",l:"70%",s:17}].map((b,i) => (
                <div key={i} style={{position:"absolute",top:b.t,left:b.l,width:b.s,height:b.s,background:"radial-gradient(circle, #6B7A52 0%, transparent 70%)",borderRadius:"50%",opacity:0.3}} />
              ))}
              {/* SR-89 road */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 375 584">
                <path d="M 175 0 C 172 80, 178 160, 180 240 S 185 360, 182 440 S 178 500, 180 584" stroke="rgba(200,190,170,0.5)" strokeWidth="6" fill="none" />
                <path d="M 175 0 C 172 80, 178 160, 180 240 S 185 360, 182 440 S 178 500, 180 584" stroke="rgba(220,210,190,0.7)" strokeWidth="3" fill="none" />
                <path d="M 180 380 C 210 375, 250 365, 290 360" stroke="rgba(200,190,170,0.4)" strokeWidth="4" fill="none" />
                <path d="M 180 380 C 210 375, 250 365, 290 360" stroke="rgba(220,210,190,0.6)" strokeWidth="2" fill="none" />
                <path d="M 178 310 C 150 305, 120 295, 80 280" stroke="rgba(200,190,170,0.4)" strokeWidth="4" fill="none" />
                <path d="M 178 310 C 150 305, 120 295, 80 280" stroke="rgba(220,210,190,0.6)" strokeWidth="2" fill="none" />
                <path d="M 176 190 C 200 175, 230 155, 280 130" stroke="rgba(200,190,170,0.4)" strokeWidth="4" fill="none" />
                <path d="M 176 190 C 200 175, 230 155, 280 130" stroke="rgba(220,210,190,0.6)" strokeWidth="2" fill="none" />
              </svg>
              {/* Road labels */}
              <div style={{position:"absolute",top:"48%",left:"50%",fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.45)",letterSpacing:1,transform:"rotate(-3deg)",pointerEvents:"none"}}>SR-89</div>
              <div style={{position:"absolute",top:"63%",left:"58%",fontSize:7,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:1,transform:"rotate(-3deg)",pointerEvents:"none"}}>Shrine Rd</div>
              <div style={{position:"absolute",top:"50%",left:"12%",fontSize:7,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:1,transform:"rotate(-8deg)",pointerEvents:"none"}}>Model Creek Rd</div>
              <div style={{position:"absolute",top:"28%",left:"55%",fontSize:7,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:1,transform:"rotate(-15deg)",pointerEvents:"none"}}>Yarnell Hill Rd</div>
            </div>

            {/* Fire projection arcs — fire approaching from SOUTH/SOUTHWEST */}
            <div style={{position:"absolute",bottom:"-5%",left:"-10%",width:"80%",height:"30%",borderTop:`2.5px solid ${C.red}`,borderRight:`2.5px solid ${C.red}`,borderRadius:"0 50% 0 0",opacity:0.35}} />
            <div style={{position:"absolute",bottom:"-10%",left:"-15%",width:"90%",height:"42%",border:`2px dashed ${C.orange}`,borderRadius:"0 45% 0 0",opacity:0.5}}>
              <span style={{position:"absolute",top:5,right:10,fontSize:9,fontWeight:600,color:C.orange,background:"rgba(0,0,0,0.6)",padding:"1px 5px",borderRadius:4}}>30 min</span>
            </div>
            <div style={{position:"absolute",bottom:"-15%",left:"-20%",width:"100%",height:"55%",border:`2px dashed ${C.yellow}`,borderRadius:"0 40% 0 0",opacity:0.4}}>
              <span style={{position:"absolute",top:10,right:10,fontSize:9,fontWeight:600,color:C.yellow,background:"rgba(0,0,0,0.6)",padding:"1px 5px",borderRadius:4}}>1 hr</span>
            </div>

            {/* Fire direction + wind indicator */}
            <div style={{position:"absolute",top:10,right:10,background:"rgba(255,255,255,0.92)",borderRadius:8,padding:"5px 8px",boxShadow:"0 2px 6px rgba(0,0,0,0.15)",zIndex:3}}>
              <div style={{fontSize:9,fontWeight:600,color:C.sub}}>Fire from SW</div>
              <div style={{fontSize:16,textAlign:"center"}}>\u2197</div>
              <div style={{fontSize:10,fontWeight:700,color:C.red}}>SW 20\u201325 mph</div>
            </div>

            {/* Yarnell town label */}
            <div style={{position:"absolute",top:6,left:10,background:"rgba(255,255,255,0.92)",borderRadius:8,padding:"4px 8px",boxShadow:"0 2px 6px rgba(0,0,0,0.12)",zIndex:3}}>
              <div style={{fontSize:11,fontWeight:700,color:C.text}}>Yarnell, AZ</div>
              <div style={{fontSize:9,color:C.sub}}>Pop. ~650 \u2022 Median age 69.5</div>
            </div>

            {/* Building markers */}
            {mapBuildings.map((mb, i) => {
              const b = mb.b;
              const s = STATUS[b.status];
              const hasVulns = b.vulns && b.vulns.length > 0 && !["selfReport","unverified","verified"].includes(b.status);
              const isEvacuated = ["selfReport","unverified","verified"].includes(b.status);
              const size = isEvacuated ? 10 : (b.status === "needsHelp" ? 14 : 12);
              return (
                <div key={i} style={{position:"absolute",top:mb.top,left:mb.left,transform:"translate(-50%,-50%)"}}>
                  {/* Building square */}
                  <div style={{width:size,height:size,background:s.mapColor,borderRadius:b.status==="needsHelp"?3:2,border:"1.5px solid #FFF",boxShadow:b.status==="needsHelp"?`0 0 8px ${C.red}60`:"0 0 4px rgba(0,0,0,0.2)",animation:b.status==="needsHelp"?"pulse 2s infinite":"none",position:"relative"}}>
                    {/* Vulnerability indicator dot */}
                    {hasVulns && (
                      <div style={{position:"absolute",top:-4,right:-4,width:7,height:7,borderRadius:"50%",background:"#FFF",border:`1.5px solid ${C.red}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <div style={{width:3,height:3,borderRadius:"50%",background:C.red}} />
                      </div>
                    )}
                  </div>
                  {/* Address label — only show for non-evacuated or needsHelp */}
                  {!isEvacuated && (
                    <span style={{position:"absolute",top:size+2,left:"50%",transform:"translateX(-50%)",fontSize:7,fontWeight:600,color:"#FFF",whiteSpace:"nowrap",background:"rgba(0,0,0,0.55)",padding:"1px 4px",borderRadius:3}}>{b.address.split(",")[0]}</span>
                  )}
                </div>
              );
            })}

            {/* Map Legend */}
            <div style={{position:"absolute",bottom:10,left:8,background:"rgba(0,0,0,0.7)",borderRadius:10,padding:"8px 10px",boxShadow:"0 2px 8px rgba(0,0,0,0.2)",fontSize:9,maxWidth:160,zIndex:4}}>
              <div style={{fontWeight:700,marginBottom:5,fontSize:10,color:"#E0E0E0"}}>Evacuation Status</div>
              {[
                {color:STATUS.needsHelp.mapColor,  label:"Needs assistance", dot:true},
                {color:STATUS.notified.mapColor,    label:"Order received"},
                {color:STATUS.unknown.mapColor,     label:"Unknown / No Beacon"},
                {color:STATUS.selfReport.mapColor,  label:"Self-reported evacuated"},
                {color:STATUS.unverified.mapColor,  label:"Unverified confirmation"},
                {color:STATUS.verified.mapColor,    label:"Verified empty (police)"},
              ].map(l => (
                <div key={l.label} style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                  <div style={{width:8,height:8,background:l.color,borderRadius:2,flexShrink:0,position:"relative"}}>
                    {l.dot && <div style={{position:"absolute",top:-2,right:-2,width:4,height:4,borderRadius:"50%",background:"#FFF",border:`1px solid ${C.red}`}} />}
                  </div>
                  <span style={{color:"#B0B0B0",lineHeight:1.2}}>{l.label}</span>
                </div>
              ))}
              <div style={{borderTop:"1px solid rgba(255,255,255,0.15)",marginTop:4,paddingTop:4}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:8,height:8,background:C.muted,borderRadius:2,position:"relative"}}>
                    <div style={{position:"absolute",top:-2,right:-2,width:4,height:4,borderRadius:"50%",background:"#FFF",border:`1px solid ${C.red}`}} />
                  </div>
                  <span style={{color:"#B0B0B0"}}>Red dot = vulnerable occupant</span>
                </div>
              </div>
            </div>

            {/* Evacuation route indicators */}
            <div style={{position:"absolute",top:"8%",left:"40%",zIndex:2}}>
              <div style={{background:"rgba(255,255,255,0.92)",borderRadius:8,padding:"3px 7px",boxShadow:"0 1px 4px rgba(0,0,0,0.12)"}}>
                <div style={{fontSize:8,fontWeight:700,color:C.green}}>\u2191 Prescott \u2014 35 mi N</div>
                <div style={{fontSize:7,color:C.red,fontWeight:600}}>SR-89 N may be cut by fire</div>
              </div>
            </div>
            <div style={{position:"absolute",bottom:"5%",right:"10%",zIndex:2}}>
              <div style={{background:"rgba(255,255,255,0.92)",borderRadius:8,padding:"3px 7px",boxShadow:"0 1px 4px rgba(0,0,0,0.12)"}}>
                <div style={{fontSize:8,fontWeight:700,color:C.green}}>\u2193 Wickenburg \u2014 30 mi S</div>
                <div style={{fontSize:7,color:C.green}}>SR-89 S clear</div>
              </div>
            </div>

            {/* Floating action buttons on map */}
            {role === "law" && (
              <div style={{position:"absolute",bottom:10,right:8,display:"flex",flexDirection:"column",gap:6,zIndex:5}}>
                <button onClick={() => setShowRequestModal(true)} style={{padding:"8px 14px",borderRadius:14,background:C.orange,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:"#FFF",boxShadow:`0 2px 8px ${C.orange}50`}}>Request Assistance</button>
              </div>
            )}
            {role === "public" && (
              <div style={{position:"absolute",bottom:10,right:8,display:"flex",flexDirection:"column",gap:6,zIndex:5}}>
                <button onClick={() => setShowOfferModal(true)} style={{padding:"8px 14px",borderRadius:14,background:C.green,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:"#FFF",boxShadow:`0 2px 8px ${C.green}50`}}>I Can Help</button>
                <button style={{padding:"8px 14px",borderRadius:14,background:C.red,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:"#FFF",boxShadow:`0 2px 8px ${C.red}50`}}>I Need Help</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ BUILDINGS LIST ═══ */}
        {viewTab === "buildings" && (
          <div style={{padding:"8px 14px"}}>
            {needsAttention.length > 0 && (
              <div style={{fontSize:11,fontWeight:600,color:C.sub,marginBottom:6}}>
                {needsAttention.length} buildings not confirmed \u2014 by fire proximity
              </div>
            )}
            {needsAttention.map(b => <BuildingCard key={b.id} b={b} />)}

            {evacuated.length > 0 && (
              <>
                <div style={{fontSize:11,fontWeight:600,color:C.sub,marginTop:14,marginBottom:6}}>
                  {evacuated.length} reported evacuated
                </div>
                {evacuated.map(b => <BuildingCard key={b.id} b={b} />)}
              </>
            )}

            {/* Action buttons at bottom of list */}
            {role === "law" && (
              <div style={{display:"flex",gap:8,marginTop:14,paddingBottom:10}}>
                <button onClick={() => setShowRequestModal(true)} style={{flex:1,padding:"10px 0",borderRadius:14,background:C.orange,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,color:"#FFF"}}>Request Assistance</button>
                <button style={{flex:1,padding:"10px 0",borderRadius:14,background:C.blue,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,color:"#FFF"}}>Broadcast Update</button>
              </div>
            )}
            {role === "public" && (
              <div style={{display:"flex",gap:8,marginTop:14,paddingBottom:10}}>
                <button onClick={() => setShowOfferModal(true)} style={{flex:1,padding:"10px 0",borderRadius:14,background:C.green,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,color:"#FFF"}}>I Can Help</button>
                <button style={{flex:1,padding:"10px 0",borderRadius:14,background:C.red,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,color:"#FFF"}}>I Need Help</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ HELP REQUESTS ═══ */}
        {viewTab === "requests" && (
          <div style={{padding:"8px 14px"}}>
            <div style={{fontSize:11,fontWeight:600,color:C.sub,marginBottom:8}}>
              {openRequests.length} open request{openRequests.length !== 1 ? "s" : ""} \u2014 by urgency
            </div>
            {HELP_REQUESTS.filter(h => h.status === "open").map(h => <HelpRequestCard key={h.id} h={h} />)}
            {openRequests.length === 0 && (
              <div style={{textAlign:"center",padding:"30px 20px",color:C.green,fontSize:13,fontWeight:600}}>All requests fulfilled</div>
            )}
          </div>
        )}

        {/* ═══ VOLUNTEERS ═══ */}
        {viewTab === "volunteers" && (
          <div style={{padding:"8px 14px"}}>
            <div style={{fontSize:11,fontWeight:600,color:C.sub,marginBottom:8}}>
              {VOLUNTEER_OFFERS.filter(v => v.available).length} people offering help
            </div>
            {VOLUNTEER_OFFERS.map(v => <VolunteerCard key={v.id} v={v} />)}
          </div>
        )}
      </div>


      <OfferModal />
      <RequestModal />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
