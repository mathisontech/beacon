import { useState } from "react";

const C = {
  bg: "#F5F5F7", card: "#FFFFFF", text: "#1A1A1A", sub: "#6B7280", muted: "#9CA3AF",
  orange: "#EA7928", purple: "#B829FC", blue: "#3881B8", deepPurple: "#50386A",
  green: "#2D8B4E", yellow: "#E8B84E", red: "#C0392B", border: "#E5E7EB", feedBg: "#F0F0F2",
};

// ─── ICONS ───
const FeedSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5" fill={a?C.orange:C.muted}/></svg>;
const TimeSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const MapSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const HelpSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="13" x2="12" y2="7"/></svg>;
const TeamSvg = ({a}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.orange:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CloseSvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const BackSvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const LayersSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const PlaySvg = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const SendSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill={C.orange} stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;

// ─── COMPONENTS ───
const Avatar = ({size=34, onClick, initials="KM"}) => (
  <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${C.orange},${C.purple})`,cursor:onClick?"pointer":"default",flexShrink:0,border:"2px solid #FFF",boxShadow:"0 2px 8px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:size*0.38,fontWeight:700}}>{initials}</div>
);

const Badge = ({children, color=C.blue}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 7px",borderRadius:10,fontSize:10,fontWeight:600,color,background:`${color}15`,marginRight:3}}>{children}</span>
);

const UnreadDot = ({count, color=C.orange}) => count > 0 ? (
  <span style={{minWidth:18,height:18,borderRadius:9,background:color,color:"#FFF",fontSize:10,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{count}</span>
) : null;

const ReportButton = ({onClick}) => (
  <button onClick={onClick} style={{
    width:28,height:28,borderRadius:9,background:C.orange,border:"none",cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${C.orange}40`,
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  </button>
);

// Report modal
const ReportModal = ({open, onClose}) => {
  if (!open) return null;
  const items = [
    {icon:"🔥",label:"Fire / Smoke",desc:"Report visible flames or smoke"},
    {icon:"🌊",label:"Flooding",desc:"Report rising water or road flooding"},
    {icon:"⚡",label:"Downed Power Line",desc:"Report a fallen or sparking line"},
    {icon:"🌡️",label:"Weather Conditions",desc:"How does it feel outside?"},
    {icon:"🤧",label:"Allergies / Air Quality",desc:"Report allergy severity or air quality"},
    {icon:"⚠️",label:"Road Hazard",desc:"Report debris, accident, or closure"},
    {icon:"📷",label:"General Observation",desc:"Post a photo or note about your area"},
    {icon:"👽",label:"Something Weird",desc:"UFO? Strange sound? Share it."},
  ];
  return (
    <>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",zIndex:90,borderRadius:40}} />
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.card,borderRadius:"24px 24px 0 0",zIndex:100,padding:"16px 16px 30px",maxHeight:"70%",overflow:"auto",boxShadow:"0 -4px 20px rgba(0,0,0,0.1)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontSize:16,fontWeight:700,color:C.text}}>Report Conditions</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><CloseSvg/></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {items.map(it => (
            <div key={it.label} style={{background:C.feedBg,borderRadius:14,padding:12,cursor:"pointer",transition:"all 0.15s"}}>
              <span style={{fontSize:22,display:"block",marginBottom:4}}>{it.icon}</span>
              <span style={{fontSize:13,fontWeight:600,color:C.text,display:"block"}}>{it.label}</span>
              <span style={{fontSize:11,color:C.sub,lineHeight:1.3}}>{it.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Feed post
const Post = ({p}) => {
  const [v, setV] = useState(false);
  const [n, setN] = useState(p.votes);
  return (
    <div style={{background:C.card,borderRadius:16,padding:13,marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",gap:10}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,paddingTop:2}}>
          <div onClick={()=>{setV(!v);setN(v?n-1:n+1)}} style={{cursor:"pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={v?C.orange:"none"} stroke={v?C.orange:C.muted} strokeWidth="2"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:v?C.orange:C.sub}}>{n}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:p.ac||"#DDD",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#FFF",fontWeight:700}}>{p.ai}</div>
            <span style={{fontSize:12,fontWeight:600,color:C.text}}>{p.author}</span>
            <span style={{fontSize:11,color:C.muted}}>{p.time}</span>
            {p.dist && <span style={{fontSize:11,color:C.muted}}>{p.dist}</span>}
          </div>
          <div style={{marginBottom:5}}>
            {p.type && <Badge color={p.tc}>{p.type}</Badge>}
            {p.official && <Badge color={C.green}>Verified</Badge>}
          </div>
          <p style={{fontSize:13.5,lineHeight:1.5,color:C.text,margin:"0 0 7px"}}>{p.text}</p>
          {p.img && <div style={{width:"100%",height:140,borderRadius:12,marginBottom:7,background:p.img}} />}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:3}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {p.comments}
            </span>
            {p.helpable && <button style={{background:"none",border:`1.5px solid ${C.green}`,borderRadius:10,padding:"2px 9px",fontSize:11,fontWeight:600,color:C.green,cursor:"pointer"}}>I can help</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Timeline entry
const TimeEntry = ({e}) => (
  <div style={{display:"flex",gap:10,marginBottom:4,paddingBottom:12,borderLeft:`2px solid ${e.color||C.border}`,marginLeft:6,paddingLeft:14,position:"relative"}}>
    <div style={{position:"absolute",left:-5,top:2,width:10,height:10,borderRadius:"50%",background:e.color||C.border,border:"2px solid #FFF"}} />
    <div style={{flex:1}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
        <span style={{fontSize:11,fontWeight:600,color:C.muted}}>{e.time}</span>
        {e.official && <Badge color={C.green}>Official</Badge>}
        {e.system && <Badge color={C.blue}>System</Badge>}
      </div>
      <p style={{fontSize:13,fontWeight:e.bold?700:500,color:C.text,margin:"0 0 2px",lineHeight:1.4}}>{e.text}</p>
      {e.detail && <p style={{fontSize:12,color:C.sub,margin:0,lineHeight:1.4}}>{e.detail}</p>}
      {e.action && (
        <button style={{marginTop:5,background:"none",border:`1.5px solid ${C.orange}`,borderRadius:10,padding:"4px 12px",fontSize:11,fontWeight:600,color:C.orange,cursor:"pointer"}}>{e.action}</button>
      )}
    </div>
  </div>
);

// Action Required Card (Layer 1 — EMS direct requests)
const ActionCard = ({a, onRespond}) => {
  const [expanded, setExpanded] = useState(false);
  const [responded, setResponded] = useState(null);
  return (
    <div style={{background:C.card,borderRadius:14,padding:12,marginBottom:10,border:`2px solid ${C.red}40`,boxShadow:`0 2px 12px ${C.red}15`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:C.red,boxShadow:`0 0 8px ${C.red}80`}} />
        <Badge color={C.red}>Action Required</Badge>
        <span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>{a.time}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
        <span style={{fontSize:14}}>{a.icon}</span>
        <span style={{fontSize:13,fontWeight:700,color:C.text}}>{a.from}</span>
        {a.verified && <Badge color={C.green}>Verified</Badge>}
      </div>
      <p style={{fontSize:13,fontWeight:600,color:C.text,margin:"0 0 4px",lineHeight:1.4}}>{a.title}</p>
      <p style={{fontSize:12,color:C.sub,margin:"0 0 10px",lineHeight:1.4}}>{a.desc}</p>
      {!responded ? (
        <div style={{display:"flex",gap:8}}>
          {a.actions.map((act, i) => (
            <button key={i} onClick={() => { setResponded(act.label); if (act.expand) setExpanded(true); }} style={{
              flex:1, padding:"9px 0", borderRadius:12, fontSize:12, fontWeight:600, cursor:"pointer",
              background: act.primary ? C.orange : "transparent",
              color: act.primary ? "#FFF" : C.text,
              border: act.primary ? "none" : `1.5px solid ${C.border}`,
              boxShadow: act.primary ? `0 3px 10px ${C.orange}40` : "none",
            }}>{act.label}</button>
          ))}
        </div>
      ) : (
        <div style={{background:`${C.green}10`,borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{fontSize:12,fontWeight:600,color:C.green}}>Responded: {responded}</span>
        </div>
      )}
      {expanded && (
        <div style={{marginTop:10,padding:12,background:C.feedBg,borderRadius:12}}>
          <p style={{fontSize:12,fontWeight:700,color:C.text,margin:"0 0 8px"}}>Next of Kin Information</p>
          <p style={{fontSize:11,color:C.sub,margin:"0 0 10px",lineHeight:1.4}}>Riverside County requires this for residents who stay in evacuation zones.</p>
          {[{label:"Full Name",val:"Kristin Mullaney"},{label:"Emergency Contact",val:""},{label:"Relationship",val:""},{label:"Contact Phone",val:""}].map((f,i) => (
            <div key={i} style={{marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:600,color:C.sub,display:"block",marginBottom:3}}>{f.label}</span>
              <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:"7px 10px",fontSize:12,color:f.val?C.text:C.muted}}>{f.val || "Tap to enter"}</div>
            </div>
          ))}
          <button style={{width:"100%",padding:"10px 0",borderRadius:12,background:C.orange,color:"#FFF",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",marginTop:4,boxShadow:`0 3px 10px ${C.orange}40`}}>Submit Form</button>
        </div>
      )}
    </div>
  );
};

// Map view
const MapView = () => (
  <div style={{position:"relative",width:"100%",height:"100%"}}>
    <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg, #e8f4e8 0%, #d4e8d4 20%, #c8dcc8 40%, #f0ead6 60%, #e8e0cc 80%, #dcd4c0 100%)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"30%",left:0,right:0,height:3,background:"#CCC",transform:"rotate(-5deg)"}} />
      <div style={{position:"absolute",top:"55%",left:0,right:0,height:3,background:"#CCC",transform:"rotate(8deg)"}} />
      <div style={{position:"absolute",top:0,bottom:0,left:"40%",width:3,background:"#CCC",transform:"rotate(3deg)"}} />
      <div style={{position:"absolute",top:0,bottom:0,left:"70%",width:2,background:"#D5D5D5",transform:"rotate(-4deg)"}} />
      {[{t:"25%",l:"55%",c:C.orange},{t:"60%",l:"30%",c:C.blue},{t:"45%",l:"65%",c:C.yellow},{t:"70%",l:"50%",c:C.red}].map((p,i) =>
        <div key={i} style={{position:"absolute",top:p.t,left:p.l,width:10,height:10,borderRadius:"50%",background:p.c,opacity:0.7,boxShadow:`0 0 8px ${p.c}60`}} />
      )}
      <div style={{position:"absolute",top:"48%",left:"45%",transform:"translate(-50%,-50%)"}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:`${C.blue}25`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:C.blue,border:"3px solid #FFF",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}} />
        </div>
      </div>
      <div style={{position:"absolute",top:"22%",left:"52%",background:"#FFF",borderRadius:6,padding:"2px 6px",fontSize:9,fontWeight:600,color:C.orange,boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}>Smoke reported</div>
      <div style={{position:"absolute",top:"67%",left:"46%",background:"#FFF",borderRadius:6,padding:"2px 6px",fontSize:9,fontWeight:600,color:C.red,boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}>Road closed</div>
    </div>
    <button style={{position:"absolute",top:60,right:12,width:38,height:38,borderRadius:12,background:"rgba(26,26,26,0.7)",backdropFilter:"blur(10px)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}><LayersSvg/></button>
    <button style={{position:"absolute",bottom:12,left:12,width:34,height:34,borderRadius:"50%",background:"rgba(26,26,26,0.7)",backdropFilter:"blur(10px)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}><PlaySvg/></button>
  </div>
);

// Side menu
const SideMenu = ({open, onClose}) => (
  <>
    {open && <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.3)",zIndex:90,borderRadius:40}} />}
    <div style={{position:"absolute",top:0,left:0,bottom:0,width:"78%",background:C.card,zIndex:100,borderRadius:"40px 0 0 40px",transform:open?"translateX(0)":"translateX(-100%)",transition:"transform 0.3s ease",boxShadow:open?"4px 0 20px rgba(0,0,0,0.1)":"none",display:"flex",flexDirection:"column",padding:"50px 20px 20px",overflow:"auto"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",cursor:"pointer"}}><CloseSvg/></button>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
        <Avatar size={48} />
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16,fontWeight:700,color:C.text}}>Kristin Mullaney</span>
            <div title="BeaconMesh: Idle" style={{width:10,height:10,borderRadius:"50%",background:C.yellow,boxShadow:`0 0 6px ${C.yellow}60`}} />
          </div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,paddingLeft:4}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span style={{fontSize:13,color:C.sub}}>Riverside, CA</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,padding:"8px 12px",background:`${C.green}10`,borderRadius:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:C.green}} />
        <span style={{fontSize:13,color:C.green,fontWeight:500}}>Available</span>
        <span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>edit</span>
      </div>
      <div style={{height:1,background:C.border,margin:"0 0 14px"}} />
      {["My Household","Vehicles & Equipment","Emergency Plan","Notifications","BeaconMesh","Accessibility","Privacy & Location","Account","Help & Support"].map((l,i) => (
        <div key={i} style={{padding:"11px 4px",cursor:"pointer",borderRadius:10}}>
          <span style={{fontSize:14,color:C.text,fontWeight:500}}>{l}</span>
        </div>
      ))}
    </div>
  </>
);

// ─── Inner Team View ───
const TeamInnerView = ({team, onBack}) => {
  const [subTab, setSubTab] = useState(0);
  const subTabs = ["Announcements","Board","Chat","Tasks"];

  const announcements = [
    {author:"Admin",time:"2h ago",pinned:true,text:"Emergency preparedness meeting Saturday at the park pavilion, 10am. Please RSVP.",replies:4},
    {author:"Admin",time:"1d ago",text:"Reminder: Community cleanup this Sunday. Meet at the park entrance at 9am. Bring gloves!",replies:8},
    {author:"Admin",time:"3d ago",text:"Welcome to all new members! Please update your household profile and set up your emergency contacts.",replies:2},
  ];

  const boardPosts = [
    {author:"Tom R.",initials:"TR",color:"#5A8FE6",time:"3h ago",type:"request",text:"Need help clearing fallen branches from my yard after the wind. Anyone with a chainsaw available tomorrow?",resp:2},
    {author:"Lisa M.",initials:"LM",color:"#E67E5A",time:"5h ago",type:"offer",text:"I have a generator and 20 gal of fuel. Happy to share if anyone loses power tonight.",resp:0},
    {author:"Dave K.",initials:"DK",color:"#9B59B6",time:"8h ago",type:"info",text:"FYI the storm drain on Maple is completely clogged. Water pooling. I called the city.",resp:5},
  ];

  const chatMessages = [
    {author:"Sarah K.",initials:"SK",color:"#E67E5A",time:"12m",text:"Anyone else smell smoke?",mine:false},
    {author:"You",initials:"KM",time:"10m",text:"Yes! Coming from the northeast it looks like.",mine:true},
    {author:"Mike T.",initials:"MT",color:"#5A8FE6",time:"8m",text:"I can see haze from my backyard. Definitely smoke.",mine:false},
    {author:"Tom R.",initials:"TR",color:"#9B59B6",time:"5m",text:"Fire dept just posted about it. Engine 7 dispatched.",mine:false},
    {author:"Sarah K.",initials:"SK",color:"#E67E5A",time:"3m",text:"Good. Stay safe everyone. I'm packing a go bag just in case.",mine:false},
    {author:"You",initials:"KM",time:"1m",text:"Same. Kids are home from school already at least.",mine:true},
  ];

  const tasks = [
    {title:"Check on elderly neighbors",assignee:"Tom R.",status:"in_progress",priority:"high"},
    {title:"Map blocked routes in our area",assignee:"Mike T.",status:"done",priority:"medium"},
    {title:"Stock community supply cache",assignee:"Unassigned",status:"todo",priority:"medium"},
    {title:"Test neighborhood walkie-talkies",assignee:"Dave K.",status:"todo",priority:"low"},
  ];

  const statusColors = {done:C.green,in_progress:C.orange,todo:C.muted};
  const statusLabels = {done:"Done",in_progress:"In Progress",todo:"To Do"};
  const priColors = {high:C.red,medium:C.yellow,low:C.muted};

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Team header */}
      <div style={{padding:"6px 10px 0",display:"flex",alignItems:"center",gap:10,background:C.bg}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><BackSvg/></button>
        <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg, ${team.color}20, ${team.color}10)`,border:`2px solid ${team.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{team.icon}</div>
        <div>
          <span style={{fontSize:14,fontWeight:700,color:C.text,display:"block",lineHeight:1.2}}>{team.fullName}</span>
          <span style={{fontSize:11,color:C.muted}}>{team.members} members{team.followers ? ` · ${team.followers} followers` : ""}</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:0,padding:"10px 10px 0",background:C.bg}}>
        {subTabs.map((s,i) => (
          <button key={s} onClick={()=>setSubTab(i)} style={{
            flex:1, padding:"8px 0", fontSize:11, fontWeight:subTab===i?700:500,
            color:subTab===i?C.orange:C.muted, background:"none", border:"none",
            borderBottom:subTab===i?`2.5px solid ${C.orange}`:"2.5px solid transparent",
            cursor:"pointer", transition:"all 0.15s",
          }}>{s}{i===0 && team.unreadAnn ? ` (${team.unreadAnn})` : ""}{i===2 && team.unreadChat ? ` (${team.unreadChat})` : ""}</button>
        ))}
      </div>

      {/* Sub-tab content */}
      <div style={{flex:1,overflow:"auto",background:C.feedBg}}>
        {/* Announcements */}
        {subTab === 0 && (
          <div style={{padding:"10px 12px"}}>
            {announcements.map((a,i) => (
              <div key={i} style={{background:C.card,borderRadius:14,padding:12,marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",borderLeft:a.pinned?`3px solid ${C.orange}`:"3px solid transparent"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <Badge color={C.orange}>Announcement</Badge>
                  {a.pinned && <Badge color={C.deepPurple}>Pinned</Badge>}
                  <span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>{a.time}</span>
                </div>
                <p style={{fontSize:13,color:C.text,margin:"0 0 6px",lineHeight:1.5}}>{a.text}</p>
                <span style={{fontSize:11,color:C.muted}}>{a.replies} replies</span>
              </div>
            ))}
          </div>
        )}

        {/* Board — help requests, offers, coordination */}
        {subTab === 1 && (
          <div style={{padding:"10px 12px"}}>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {["All","Requests","Offers","Info"].map((f,i) => (
                <button key={f} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,
                  background:i===0?C.orange:"transparent",color:i===0?"#FFF":C.sub,
                  border:i===0?"none":`1.5px solid ${C.border}`,cursor:"pointer",
                }}>{f}</button>
              ))}
            </div>
            {boardPosts.map((p,i) => (
              <div key={i} style={{background:C.card,borderRadius:14,padding:12,marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#FFF",fontWeight:700}}>{p.initials}</div>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>{p.author}</span>
                  <Badge color={p.type==="request"?C.orange:p.type==="offer"?C.green:C.blue}>
                    {p.type==="request"?"Help Needed":p.type==="offer"?"Offering Help":"Info"}
                  </Badge>
                  <span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>{p.time}</span>
                </div>
                <p style={{fontSize:13,color:C.text,margin:"0 0 8px",lineHeight:1.5}}>{p.text}</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:C.muted}}>{p.resp} responding</span>
                  {p.type==="request" && <button style={{background:C.green,border:"none",borderRadius:10,padding:"5px 12px",fontSize:11,fontWeight:600,color:"#FFF",cursor:"pointer"}}>I Can Help</button>}
                </div>
              </div>
            ))}
            <button style={{width:"100%",padding:"11px 0",borderRadius:14,background:C.card,border:`2px dashed ${C.border}`,fontSize:13,fontWeight:600,color:C.sub,cursor:"pointer",marginTop:4}}>+ New Post</button>
          </div>
        )}

        {/* Chat */}
        {subTab === 2 && (
          <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{flex:1,padding:"12px 12px 0",overflow:"auto"}}>
              {chatMessages.map((m,i) => (
                <div key={i} style={{display:"flex",justifyContent:m.mine?"flex-end":"flex-start",marginBottom:8}}>
                  <div style={{display:"flex",gap:6,maxWidth:"80%",flexDirection:m.mine?"row-reverse":"row",alignItems:"flex-end"}}>
                    {!m.mine && <div style={{width:22,height:22,borderRadius:"50%",background:m.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#FFF",fontWeight:700,flexShrink:0}}>{m.initials}</div>}
                    <div style={{
                      background:m.mine?C.orange:C.card,
                      color:m.mine?"#FFF":C.text,
                      padding:"8px 12px",
                      borderRadius:m.mine?"16px 16px 4px 16px":"16px 16px 16px 4px",
                      boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
                    }}>
                      {!m.mine && <span style={{fontSize:10,fontWeight:600,color:C.sub,display:"block",marginBottom:2}}>{m.author}</span>}
                      <span style={{fontSize:13,lineHeight:1.4}}>{m.text}</span>
                      <span style={{fontSize:9,color:m.mine?"rgba(255,255,255,0.7)":C.muted,display:"block",textAlign:"right",marginTop:2}}>{m.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:"8px 12px 12px",display:"flex",gap:8,alignItems:"center",background:C.feedBg}}>
              <div style={{flex:1,background:C.card,borderRadius:20,padding:"9px 14px",border:`1px solid ${C.border}`,fontSize:13,color:C.muted}}>Type a message...</div>
              <div style={{width:36,height:36,borderRadius:"50%",background:C.orange,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 2px 8px ${C.orange}40`}}><SendSvg/></div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {subTab === 3 && (
          <div style={{padding:"10px 12px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>Team Tasks</span>
              <span style={{fontSize:11,color:C.muted}}>{tasks.filter(t=>t.status==="done").length}/{tasks.length} complete</span>
            </div>
            {/* Progress bar */}
            <div style={{height:6,borderRadius:3,background:C.border,marginBottom:14,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(tasks.filter(t=>t.status==="done").length/tasks.length)*100}%`,background:C.green,borderRadius:3,transition:"width 0.3s"}} />
            </div>
            {tasks.map((t,i) => (
              <div key={i} style={{background:C.card,borderRadius:14,padding:12,marginBottom:8,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${statusColors[t.status]}`,background:t.status==="done"?statusColors[t.status]:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {t.status==="done" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:13,fontWeight:600,color:t.status==="done"?C.muted:C.text,textDecoration:t.status==="done"?"line-through":"none",display:"block",lineHeight:1.3}}>{t.title}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                    <span style={{fontSize:11,color:C.muted}}>{t.assignee}</span>
                    <div style={{width:6,height:6,borderRadius:"50%",background:priColors[t.priority]}} />
                    <Badge color={statusColors[t.status]}>{statusLabels[t.status]}</Badge>
                  </div>
                </div>
              </div>
            ))}
            <button style={{width:"100%",padding:"11px 0",borderRadius:14,background:C.card,border:`2px dashed ${C.border}`,fontSize:13,fontWeight:600,color:C.sub,cursor:"pointer",marginTop:4}}>+ Add Task</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SAMPLE DATA ───
const POSTS = [
  {author:"Sarah K.",ai:"SK",ac:"#E67E5A",time:"12m",dist:"0.3 mi",type:"Sighting",tc:C.orange,text:"Smoke visible from the northeast hills. Looks like it might be growing. Anyone else seeing this?",img:"linear-gradient(135deg, #f0d4a0, #c0a080, #908070)",votes:34,comments:18},
  {author:"Riverside Fire Dept",ai:"FD",ac:C.red,time:"28m",official:true,text:"We are aware of smoke reports in the NE hills area. Engine 7 dispatched to investigate. No evacuation orders at this time. Updates to follow.",votes:89,comments:24},
  {author:"Mike T.",ai:"MT",ac:"#5A8FE6",time:"45m",dist:"0.8 mi",type:"Report",tc:C.blue,text:"Construction crew blocking the right lane on Main St near 3rd Ave. Flaggers directing traffic but expect 10-15 min delays.",votes:23,comments:5},
  {author:"Jenny L.",ai:"JL",ac:"#9B59B6",time:"1h",dist:"1.2 mi",text:"Beautiful double rainbow over the park right now!",img:"linear-gradient(135deg, #a0c4f0, #80a0d0, #7090c0)",votes:67,comments:12},
  {author:"Anonymous",ai:"?",ac:"#AAA",time:"2h",dist:"area",type:"Poll",tc:C.purple,text:"Anyone else's allergies absolutely terrible today? Feels way worse than usual.",votes:41,comments:31},
];

const ACTION_ITEMS = [
  {
    time:"6:14 PM", icon:"🚨", from:"Riverside County Sheriff", verified:true,
    title:"Evacuation Status Confirmation",
    desc:"Your address is in Zone 3. Please confirm your current evacuation status.",
    actions:[
      {label:"Evacuating Now", primary:true},
      {label:"Staying", expand:true},
      {label:"Already Left"},
    ],
  },
  {
    time:"6:10 PM", icon:"🏥", from:"Riverside Fire Dept", verified:true,
    title:"Wellness Check — Are you safe?",
    desc:"You are a registered contact in the evacuation zone. Please confirm you are safe.",
    actions:[
      {label:"I'm Safe", primary:true},
      {label:"Need Assistance"},
    ],
  },
];

const TIMELINE = [
  {time:"6:12 PM",color:C.red,official:true,bold:true,text:"Evacuation Warning — Zone 3",detail:"Brush fire NE hills. Prepare to evacuate if ordered. Shelter open at Riverside Convention Center.",action:"View on Map"},
  {time:"6:05 PM",color:C.orange,system:true,text:"10 contacts in Zone 3 report currently evacuating",detail:"Sarah K., Mike T., and 8 others. Tap to track.",action:"Track Contacts"},
  {time:"5:58 PM",color:C.orange,official:true,text:"Road closures: Oak St & Elm Ave northbound closed",detail:"Riverside PD: Expect detours. Evacuation route via Highway 91 is clear."},
  {time:"5:50 PM",color:C.orange,official:true,text:"Riverside Fire Dept confirms brush fire NE hills",detail:"Engine 7 and Engine 12 on scene. Air support requested."},
  {time:"5:45 PM",color:C.yellow,system:true,bold:true,text:"Spike in fire sightings (6 new reports) — 5:38-5:45 PM",detail:"Multiple users reporting smoke and visible flames NE of downtown. Auto-grouped into event.",action:"View Reports"},
  {time:"5:38 PM",color:C.yellow,text:"First smoke sighting reported",detail:"Sarah K. reported smoke visible from NE hills. 0.3 mi away."},
  {time:"4:12 PM",color:C.blue,official:true,text:"NWS: Wind Advisory until 6pm",detail:"Gusts up to 45mph expected. Secure loose outdoor items."},
  {time:"2:00 PM",color:C.green,text:"Riverside Electric: Planned outage Thursday 8am-12pm",detail:"Maintenance in downtown grid sector. Prepare backup power if needed."},
];

const HELP = [
  {icon:"🚗",type:"Transport Needed",desc:"Elderly resident needs ride to evacuation shelter. No vehicle, uses walker.",dist:"0.4 mi",resp:0,urgent:true},
  {icon:"👀",type:"Welfare Check",desc:"Haven't heard from elderly neighbor since evacuation warning. Usually very active.",dist:"0.2 mi",resp:1,urgent:true},
  {icon:"🐕",type:"Pet Rescue",desc:"2 dogs left behind during evacuation. Owner at shelter, left keys with neighbor.",dist:"1.1 mi",resp:2,urgent:false},
  {icon:"🔧",type:"Equipment Needed",desc:"Need chainsaw to clear fallen tree blocking driveway on Oak St.",dist:"0.7 mi",resp:0,urgent:false},
];

const TEAMS = [
  {name:"Mullaney\nFamily",fullName:"Mullaney Family",icon:"🏠",color:C.orange,role:"Member",members:4,followers:0,unreadAnn:0,unreadChat:3,lastMsg:"Mom: Checked in — Safe, at home",lastTime:"3h"},
  {name:"Oakridge\nNeighborhood",fullName:"Oakridge Neighborhood",icon:"🌳",color:C.green,role:"Member",members:47,followers:120,unreadAnn:1,unreadChat:12,lastMsg:"Tom R.: Anyone smell smoke?",lastTime:"12m"},
  {name:"Lincoln\nElementary",fullName:"Lincoln Elementary",icon:"🏫",color:C.blue,role:"Following",members:12,followers:340,unreadAnn:1,unreadChat:0,lastMsg:"Admin: Early dismissal tomorrow",lastTime:"5h"},
  {name:"Riverside\nFire Dept",fullName:"Riverside Fire Dept",icon:"🚒",color:C.red,role:"Following",members:45,followers:2100,unreadAnn:2,unreadChat:0,lastMsg:"Official: Prescribed burn north ridge...",lastTime:"6h"},
];

const DMS = [
  {name:"Mom",initials:"SM",color:"#E67E5A",lastMsg:"Did you see the evacuation warning?",time:"5m",unread:2},
  {name:"Mike T.",initials:"MT",color:"#5A8FE6",lastMsg:"I'm heading to the shelter. You?",time:"18m",unread:1},
  {name:"Sarah K.",initials:"SK",color:"#9B59B6",lastMsg:"Thanks for the heads up!",time:"1h",unread:0},
];

// ─── MAIN APP ───
export default function BeaconApp() {
  const [tab, setTab] = useState(0);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Trending");
  const [activeTeam, setActiveTeam] = useState(null); // null = team list, index = inner view

  const tabs = [
    {icon:a=><FeedSvg a={a}/>,label:"Feed"},
    {icon:a=><TimeSvg a={a}/>,label:"Timeline"},
    {icon:a=><MapSvg a={a}/>,label:"Map"},
    {icon:a=><HelpSvg a={a}/>,label:"Help"},
    {icon:a=><TeamSvg a={a}/>,label:"Teams",badge:3},
  ];

  return (
    <div style={{width:375,height:812,borderRadius:40,overflow:"hidden",background:C.bg,position:"relative",fontFamily:"'Poppins', -apple-system, sans-serif",boxShadow:"0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)",margin:"20px auto"}}>

      {/* ── Status bar ── */}
      <div style={{height:50,padding:"14px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between",background:tab===2?"transparent":C.bg,position:tab===2?"absolute":"relative",top:0,left:0,right:0,zIndex:10}}>
        <span style={{fontSize:14,fontWeight:600,color:tab===2?"#555":C.text}}>9:41</span>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{width:16,height:10,border:`1.5px solid ${tab===2?"#555":C.text}`,borderRadius:3,position:"relative"}}><div style={{position:"absolute",top:1.5,left:1.5,bottom:1.5,width:"70%",background:tab===2?"#555":C.text,borderRadius:1}} /></div>
        </div>
      </div>

      {/* ── Header bar ── */}
      {tab !== 2 && activeTeam === null && (
        <div style={{padding:"4px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Avatar size={34} onClick={()=>setMenu(true)} />
            <span style={{fontSize:16,fontWeight:700,color:C.text}}>
              {["Riverside, CA","Timeline","","Help Nearby","My Teams"][tab]}
            </span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {tab === 0 && <>
              <span style={{fontSize:12,fontWeight:600,color:C.sub}}>72°</span>
              <span style={{fontSize:14}}>☀️</span>
            </>}
            {tab === 1 && <span style={{fontSize:11,color:C.sub,fontWeight:500}}>Last updated 6:14 PM</span>}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div style={{position:"absolute",top:tab===2?0:(tab===4&&activeTeam!==null)?50:94,bottom:68,left:0,right:0,overflow:tab===4&&activeTeam!==null?"hidden":"auto",background:tab===2?"transparent":C.feedBg}}>

        {/* FEED TAB */}
        {tab === 0 && (
          <div style={{padding:"6px 14px"}}>
            {/* Evacuation alert → timeline link */}
            <div onClick={()=>setTab(1)} style={{background:`linear-gradient(135deg, ${C.red}10, ${C.orange}08)`,border:`1.5px solid ${C.red}30`,borderRadius:14,padding:"10px 12px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:C.red,boxShadow:`0 0 6px ${C.red}60`}} />
              <div style={{flex:1}}>
                <span style={{fontSize:12,fontWeight:700,color:C.red}}>Evacuation Warning — Zone 3</span>
                <span style={{fontSize:11,color:C.sub,display:"block"}}>Brush fire NE hills. Shelter open at Convention Center.</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            {/* Action row: Report + Sort */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <button onClick={()=>setReport(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,background:C.orange,border:"none",cursor:"pointer",boxShadow:`0 2px 8px ${C.orange}35`}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span style={{fontSize:12,fontWeight:600,color:"#FFF"}}>Report</span>
              </button>
              <div style={{position:"relative"}}>
                <button onClick={()=>setSortOpen(!sortOpen)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:20,background:C.card,border:`1.5px solid ${C.border}`,cursor:"pointer"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h12M3 18h6"/></svg>
                  <span style={{fontSize:12,fontWeight:500,color:C.sub}}>{sortBy}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2.5"><polyline points={sortOpen?"18 15 12 9 6 15":"6 9 12 15 18 9"}/></svg>
                </button>
                {sortOpen && (
                  <div style={{position:"absolute",top:36,right:0,background:C.card,borderRadius:12,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",border:`1px solid ${C.border}`,zIndex:30,overflow:"hidden",minWidth:140}}>
                    {["Trending","New","Nearby","Events Only"].map(s => (
                      <div key={s} onClick={()=>{setSortBy(s);setSortOpen(false)}} style={{padding:"9px 14px",fontSize:13,fontWeight:s===sortBy?600:400,color:s===sortBy?C.orange:C.text,cursor:"pointer",background:s===sortBy?`${C.orange}08`:"transparent"}}>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {POSTS.map((p,i) => <Post key={i} p={p} />)}
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab === 1 && (
          <div style={{padding:"10px 14px 10px 14px"}}>
            {/* ACTION REQUIRED — Layer 1 pinned cards */}
            {ACTION_ITEMS.length > 0 && (
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:C.red,boxShadow:`0 0 6px ${C.red}60`}} />
                  <span style={{fontSize:13,fontWeight:700,color:C.red}}>Action Required ({ACTION_ITEMS.length})</span>
                </div>
                {ACTION_ITEMS.map((a,i) => <ActionCard key={i} a={a} />)}
              </div>
            )}

            {/* Date header */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,paddingLeft:6}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>Today — March 22, 2026</span>
              <div style={{flex:1,height:1,background:C.border}} />
            </div>

            <div style={{paddingLeft:6}}>
              {TIMELINE.map((e,i) => <TimeEntry key={i} e={e} />)}

              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginBottom:14}}>
                <span style={{fontSize:13,fontWeight:700,color:C.muted}}>Yesterday</span>
                <div style={{flex:1,height:1,background:C.border}} />
              </div>
              <TimeEntry e={{time:"8:45 PM",color:C.blue,text:"Air quality returned to Good",detail:"AQI dropped below 50. Safe for outdoor activity."}} />
              <TimeEntry e={{time:"2:15 PM",color:C.yellow,official:true,text:"NWS: Wind Advisory issued for tomorrow",detail:"Gusts up to 45mph expected starting 10am."}} />
            </div>
          </div>
        )}

        {/* MAP TAB */}
        {tab === 2 && (
          <div style={{height:"100%"}}>
            <MapView />
            <div style={{position:"absolute",top:52,left:16,zIndex:10}}><Avatar size={34} onClick={()=>setMenu(true)} /></div>
            <div style={{position:"absolute",top:56,left:60,zIndex:10,background:"rgba(255,255,255,0.92)",backdropFilter:"blur(10px)",borderRadius:10,padding:"4px 10px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:600,color:C.text}}>Riverside, CA</span>
              <span style={{fontSize:10,color:C.sub}}>72°</span>
              <span style={{fontSize:12}}>☀️</span>
            </div>
            <div style={{position:"absolute",top:52,right:62,zIndex:10}}><ReportButton onClick={()=>setReport(true)} /></div>
          </div>
        )}

        {/* HELP TAB */}
        {tab === 3 && (
          <div style={{padding:"8px 14px"}}>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <button style={{flex:1,padding:"12px 0",borderRadius:14,fontSize:14,fontWeight:600,background:C.orange,color:"#FFF",border:"none",cursor:"pointer",boxShadow:`0 4px 12px ${C.orange}40`}}>Request Help</button>
              <button style={{flex:1,padding:"12px 0",borderRadius:14,fontSize:14,fontWeight:600,background:C.card,color:C.text,border:`2px solid ${C.border}`,cursor:"pointer"}}>Offer Help</button>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:16,overflow:"auto",paddingBottom:4}}>
              {[{i:"🔥",l:"Fire"},{i:"🌊",l:"Flood"},{i:"⚡",l:"Power"},{i:"⚠️",l:"Hazard"},{i:"❤️",l:"Welfare"},{i:"🔍",l:"Missing"}].map(r => (
                <div key={r.l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:50}}>
                  <div style={{width:42,height:42,borderRadius:14,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>{r.i}</div>
                  <span style={{fontSize:10,color:C.muted,fontWeight:500}}>{r.l}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:14,fontWeight:700,color:C.text}}>Nearby Requests</span>
              <span style={{fontSize:12,color:C.orange,fontWeight:600}}>4 active</span>
            </div>
            {HELP.map((r,i) => (
              <div key={i} style={{background:C.card,borderRadius:14,padding:12,marginBottom:10,borderLeft:`4px solid ${r.urgent?C.red:C.yellow}`,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <span style={{fontSize:15}}>{r.icon}</span>
                  <span style={{fontSize:13,fontWeight:700,color:C.text}}>{r.type}</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:C.muted}}>{r.dist}</span>
                </div>
                <p style={{fontSize:13,color:C.sub,margin:"0 0 7px",lineHeight:1.4}}>{r.desc}</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:C.muted}}>{r.resp} responding</span>
                  <button style={{background:C.green,border:"none",borderRadius:10,padding:"5px 13px",fontSize:12,fontWeight:600,color:"#FFF",cursor:"pointer"}}>I Can Help</button>
                </div>
              </div>
            ))}
            <div style={{background:C.card,borderRadius:14,padding:13,marginTop:4,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>My Skills & Equipment</span>
                <span style={{fontSize:11,color:C.blue,fontWeight:600,cursor:"pointer"}}>Edit</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["4WD Vehicle","First Aid","Generator","Chainsaw"].map(s => <span key={s} style={{padding:"3px 9px",borderRadius:8,fontSize:11,fontWeight:500,background:`${C.green}12`,color:C.green}}>{s}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* TEAMS TAB */}
        {tab === 4 && activeTeam === null && (
          <div style={{padding:"8px 14px"}}>

            {/* Direct Messages section */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:14,fontWeight:700,color:C.text}}>Messages</span>
                <span style={{fontSize:12,color:C.orange,fontWeight:600,cursor:"pointer"}}>New</span>
              </div>
              {DMS.map((d,i) => (
                <div key={i} style={{background:C.card,borderRadius:14,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:d.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#FFF",fontWeight:700,flexShrink:0}}>{d.initials}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:13,fontWeight:d.unread?700:500,color:C.text}}>{d.name}</span>
                      <span style={{fontSize:11,color:d.unread?C.orange:C.muted}}>{d.time}</span>
                    </div>
                    <span style={{fontSize:12,color:d.unread?C.text:C.muted,fontWeight:d.unread?500:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{d.lastMsg}</span>
                  </div>
                  {d.unread > 0 && <UnreadDot count={d.unread} />}
                </div>
              ))}
            </div>

            <div style={{height:1,background:C.border,marginBottom:14}} />

            {/* Teams list — WhatsApp style */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:14,fontWeight:700,color:C.text}}>Teams</span>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:C.orange,fontWeight:600,cursor:"pointer"}}>Browse</span>
                <div style={{width:28,height:28,borderRadius:10,border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:C.muted,cursor:"pointer"}}>+</div>
              </div>
            </div>
            {TEAMS.map((t,i) => {
              const totalUnread = (t.unreadAnn||0) + (t.unreadChat||0);
              return (
                <div key={i} onClick={()=>setActiveTeam(i)} style={{background:C.card,borderRadius:14,padding:"10px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:10,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                  <div style={{width:42,height:42,borderRadius:13,background:`linear-gradient(135deg, ${t.color}20, ${t.color}10)`,border:`2px solid ${t.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{t.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:13,fontWeight:totalUnread?700:500,color:C.text}}>{t.fullName}</span>
                      <span style={{fontSize:11,color:totalUnread?C.orange:C.muted}}>{t.lastTime}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
                      <span style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:0.5}}>{t.role}</span>
                      <span style={{fontSize:10,color:C.muted}}>·</span>
                      <span style={{fontSize:11,color:totalUnread?C.text:C.muted,fontWeight:totalUnread?500:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{t.lastMsg}</span>
                    </div>
                  </div>
                  {totalUnread > 0 && <UnreadDot count={totalUnread} />}
                </div>
              );
            })}
          </div>
        )}

        {/* TEAM INNER VIEW */}
        {tab === 4 && activeTeam !== null && (
          <TeamInnerView team={TEAMS[activeTeam]} onBack={()=>setActiveTeam(null)} />
        )}
      </div>

      {/* ── Tab bar ── */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:68,background:C.card,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-around",paddingBottom:8,zIndex:20}}>
        {tabs.map((t,i) => (
          <button key={i} onClick={()=>{setTab(i);if(i!==4)setActiveTeam(null);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 10px",opacity:tab===i?1:0.45,position:"relative"}}>
            {t.icon(tab===i)}
            {tab===i && <div style={{width:4,height:4,borderRadius:"50%",background:C.orange}} />}
            {t.badge && t.badge > 0 && tab !== i && (
              <span style={{position:"absolute",top:2,right:4,minWidth:14,height:14,borderRadius:7,background:C.orange,color:"#FFF",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Side menu ── */}
      <SideMenu open={menu} onClose={()=>setMenu(false)} />

      {/* ── Report modal ── */}
      <ReportModal open={report} onClose={()=>setReport(false)} />
    </div>
  );
}
