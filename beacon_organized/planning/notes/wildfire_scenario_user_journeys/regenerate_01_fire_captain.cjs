const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak } = require("docx");

// ─── CONSTANTS ───
const ORANGE = "EA7928";
const PURPLE = "50386A";
const BLUE = "3881B8";
const RED = "C0392B";
const GREEN = "2D8B4E";
const GRAY = "6B7280";
const LIGHT_BG = "F5F5F7";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const CW = 9360;

function spacer(pts = 120) {
  return new Paragraph({ spacing: { before: pts, after: pts }, children: [] });
}
function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120, before: opts.before || 0, line: opts.line || 276 },
    alignment: opts.alignment,
    children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, size: opts.size || 24, color: opts.color, font: "Arial" })],
  });
}
function bullet(text, ref = "bullets", level = 0) {
  return new Paragraph({ numbering: { reference: ref, level }, spacing: { after: 60, line: 276 },
    children: [new TextRun({ text, font: "Arial", size: 24 })] });
}
function richBullet(runs, ref = "bullets", level = 0) {
  return new Paragraph({ numbering: { reference: ref, level }, spacing: { after: 60, line: 276 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 24, ...r })) });
}
function phaseBox(time, title, color = PURPLE) {
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW],
    rows: [new TableRow({ children: [new TableCell({
      borders: noBorders, shading: { fill: color, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 180, right: 180 },
      width: { size: CW, type: WidthType.DXA },
      children: [new Paragraph({ children: [
        new TextRun({ text: time + "  ", font: "Arial", size: 28, bold: true, color: ORANGE }),
        new TextRun({ text: title, font: "Arial", size: 28, bold: true, color: WHITE }),
      ]})],
    })] })] });
}
function actionTable(actions) {
  const rows = actions.map(a => new TableRow({
    children: [
      new TableCell({
        borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" } },
        width: { size: 2600, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 120, right: 60 },
        children: [new Paragraph({ children: [new TextRun({ text: a.screen, font: "Arial", size: 20, bold: true, color: BLUE })] })],
      }),
      new TableCell({
        borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" } },
        width: { size: 6760, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 60, right: 120 },
        children: [new Paragraph({ spacing: { line: 260 }, children: [new TextRun({ text: a.action, font: "Arial", size: 20 })] })],
      }),
    ],
  }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2600, 6760], rows });
}

function calloutBox(text, fill, labelColor) {
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW],
    rows: [new TableRow({ children: [new TableCell({
      borders: noBorders, width: { size: CW, type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 200, right: 200 },
      children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 22, color: labelColor })] })]
    })] })] });
}

const user = {
  name: "Fire Captain (Incident Commander)",
  icon: "\uD83D\uDE92",
  filename: "01_fire_captain_ic",
  subtitle: "Career firefighter leading the operational response",
  bio: [
    "Captain Maria Gonzalez, Riverside Fire Department",
    "20 years experience. Incident Commander for NE Hills fire.",
    "Beacon Dashboard user (paid client account).",
    "Primary focus: firefighter safety, structure defense, resource management.",
  ],
  phases: [
    // ── PHASE 1: DETECTION (OFF-DUTY) ──
    {
      time: "T+0 to T+15 min", title: "Phase 1: Detection (Off-Duty)",
      context: "Captain Gonzalez is off-shift at home. Lieutenant Chen is the on-duty officer running the watch. Beacon pushes a clustered fire sighting alert to both of them. Lt. Chen and Engine 7 begin rolling from the station based on 911 calls and Beacon crowdsourced reports. Gonzalez reviews the situation from home \u2014 the crowdsourced photos, the wind data, the terrain \u2014 and makes a decision before she even gets in her car.",
      emotional: "Alert but controlled. Already building a mental model of the incident from crowdsourced data. Knows this terrain \u2014 NE hills are wildland-urban interface with heavy brush and limited access. Wind data from the Beacon weather overlay looks bad.",
      actions: [
        { screen: "Push Notification", action: "Receives Beacon alert: 3+ fire sighting reports clustered in NE hills within her jurisdiction." },
        { screen: "Feed", action: "Reviews crowdsourced photo reports from residents. Assesses approximate fire size and wind direction from multiple vantage points." },
        { screen: "Map", action: "Checks sighting cluster location against known terrain. Sees wind overlay: sustained 35 mph from the NE. Barometric pressure readings from Beacon users near the fire confirm low pressure and gusty conditions, improving the wind prediction model." },
        { screen: "Map > Fire Sim", action: "The fire simulation layer, seeded by crowdsourced sighting locations, shows projected spread lines: 30-minute, 1-hour, 1.5-hour, and 2-hour projections based on current wind and fuel conditions. At current rate, the fire reaches Zone 3 residential in approximately 90 minutes." },
        { screen: "Teams > Fire Dept (Chat)", action: "Messages Lt. Chen: \u201CI see the NE hills reports. What do you have on arrival? I\u2019m reviewing from home.\u201D" },
        { screen: "Teams > Fire Dept (Chat)", action: "Lt. Chen responds from scene: \u201CConfirmed brush fire, 3\u20135 acres, wind-driven. Fast-moving. We\u2019re on initial attack but this is going to outrun us.\u201D" },
      ],
      needs: [
        "Aggregated crowdsourced reports with photo evidence before arriving on scene",
        "Map showing cluster location relative to known infrastructure and terrain",
        "Fire simulation with projected spread lines (30 min, 1 hr, 1.5 hr, 2 hr) visible to all users",
        "Barometric pressure data from Beacon users to improve wind predictions",
        "Quick communication channel to on-duty crews while still off-site",
      ],
      gives: [
        "Senior command awareness before arrival on scene",
        "Assessment of whether to assume command remotely or wait for arrival",
      ],
    },
    // ── PHASE 2: ASSUMING COMMAND ──
    {
      time: "T+15 min to T+45 min", title: "Phase 2: Assuming Command",
      context: "Gonzalez makes the call: this fire is going to require Incident Command. She goes active on Beacon and assumes command virtually while still driving to the scene. Lt. Chen has been managing the initial attack, but Gonzalez takes over the strategic picture. She creates the official event, which transitions the fire simulation from crowdsourced-only to an authoritative layer. She draws the official fire perimeter from Lt. Chen\u2019s field reports and the aerial observation, replacing the simulation\u2019s estimate. She coordinates with the Sheriff to begin evacuation staging.",
      emotional: "Focused, high-tempo. Running resource calculations. Knows this fire will outpace initial attack. Needs mutual aid fast. She\u2019s making command decisions from her truck based on Beacon data before she even sees the fire with her own eyes.",
      actions: [
        { screen: "Dashboard > Events", action: "Goes active on Beacon. Creates official event: \u201CNE Hills Brush Fire.\u201D Assumes Incident Commander role. Lt. Chen automatically becomes Operations Section Chief. This triggers emergency protocol across all verified Beacon teams in the county." },
        { screen: "Dashboard > Events", action: "Beacon asks if the event started at the current time or earlier. Gonzalez sets the start time back to T+0 \u2014 when the first crowdsourced sighting came in, 15 minutes ago. This tells Beacon to capture and archive everything from that point forward: all map data, crowdsourced reports, photos, weather conditions, and barometric readings from that time. If she had not backdated it, Beacon would still automatically snapshot all current map state and weather data from the previous 48 hours at the moment the event is declared \u2014 so nothing is lost either way. But backdating ensures the entire crowdsourced detection phase is part of the official event record." },
        { screen: "Dashboard > Map", action: "Draws initial fire perimeter from Lt. Chen\u2019s field report and aerial photos. This becomes the authoritative fire layer, replacing the simulation\u2019s estimated perimeter for all users." },
        { screen: "Map > Fire Sim", action: "The fire simulation updates to use the drawn perimeter as its baseline instead of crowdsourced sighting dots. Projected spread lines recalculate: 30-min, 1-hr, 1.5-hr, 2-hr arcs now radiate from the official perimeter. At current wind and intervention level, the 90-minute line overlays Zone 3 residential. This projection is visible to the public \u2014 every Beacon user can see when the fire is expected to reach their area." },
        { screen: "Dashboard > Map", action: "Updates perimeter as fire grows to 15 acres within 10 minutes. The simulation\u2019s projection lines shift outward each time she redraws. Adds wind direction arrows from field observation." },
        { screen: "Dashboard > Map", action: "Reviews barometric pressure readings from Beacon users in the area. Two residents near the fire have phones providing atmospheric data. Combined with weather station data, this improves the wind vector model used by the fire simulation." },
        { screen: "Dashboard > Resources", action: "Logs Engine 7 and Engine 12 on scene. Requests 3 additional engines, 1 aerial unit, 2 water tenders." },
        { screen: "Dashboard > Mutual Aid", action: "Sends mutual aid request to San Bernardino and Corona fire departments. Request includes situation summary, resource needs, and the current fire simulation projections." },
        { screen: "Dashboard > Comms", action: "Opens emergency coordination channel with Sheriff and County Emergency Manager. Briefs: \u201C15 acres, wind-driven, heading toward Zone 3 residential.\u201D Shares the 90-minute projection." },
        { screen: "Dashboard > Comms", action: "Tells Sheriff: \u201CBegin drawing evacuation zones based on the fire projection. If this wind holds, we\u2019re 90 minutes from structures.\u201D" },
        { screen: "Teams > Fire Dept (Announce)", action: "All-call: \u201CAll personnel report to Station 4 for staging. Full structure gear.\u201D" },
      ],
      needs: [
        "Ability to go active and assume IC role remotely before arriving on scene",
        "Official event creation that transitions simulation from crowdsourced to authoritative mode",
        "Event backdating: ability to set event start time to when the fire actually began, so all prior data is captured. Auto-snapshot of map state and 48 hours of weather data if not backdated.",
        "Fast polygon drawing tool for fire perimeter under field conditions (one-handed operation)",
        "Fire simulation that recalculates spread projections every time the perimeter is redrawn",
        "Public-facing spread projection lines (30 min, 1 hr, 1.5 hr, 2 hr) so residents can see when fire will reach them",
        "Barometric pressure integration from Beacon user devices to improve wind modeling",
        "Resource request system that auto-notifies mutual aid partners",
        "Unified communication channel with sheriff, EM, and utilities",
      ],
      gives: [
        "Authoritative fire perimeter visible to all Beacon users, replacing simulation estimates",
        "Official event activation enabling emergency channels for all verified teams",
        "Fire spread projection visible to the public so they can make informed evacuation decisions",
        "Situational intelligence to sheriff for evacuation zone drawing",
        "Resource status visible to emergency manager",
      ],
    },
    // ── PHASE 3: EVACUATION OPERATIONS & RADIO ──
    {
      time: "T+45 min to T+2 hours", title: "Phase 3: Evacuation Operations",
      context: "Fire growing to 80 acres. Wind shift pushes it directly at Zone 3 residential. The sheriff has drawn the evacuation zones on Beacon based on the fire projection and is issuing orders. Gonzalez is now managing 8 engines on defensive structure protection while the fire continues to spread. Mutual aid is arriving. She integrates radio communications with Beacon \u2014 her crews are primarily on tactical radio channels, and she\u2019s relaying key information between radio and Beacon so that the broader coordination picture stays current.",
      emotional: "Intense. Balancing firefighter safety against structure defense. Knows some homes will be lost. Making triage decisions. Her crews are on radio fighting fire \u2014 she\u2019s the bridge between their tactical radio world and the Beacon coordination layer.",
      actions: [
        { screen: "Dashboard > Map", action: "Continuous perimeter updates. Fire at 80 acres. Redraws the perimeter as the wind shifts, and the simulation\u2019s projection lines update in real time. Structures on the map are now color-coded by expected fire contact time: red (< 30 min), orange (30\u201360 min), yellow (1\u20132 hr), green (> 2 hr)." },
        { screen: "Dashboard > Map", action: "Selects specific structures on the map to see projected fire arrival time: \u201C2847 Cedar Ave \u2014 fire contact in 38 minutes at current rate.\u201D Can toggle between \u201Ccurrent intervention\u201D and \u201Cno intervention\u201D projections to see the difference firefighting efforts are making." },
        { screen: "Dashboard > Comms", action: "Tells Sheriff: \u201CUpgrade Zone 3 NOW. Fire will reach structures in 45 minutes at current rate.\u201D" },
        { screen: "Dashboard > Comms", action: "Sheriff confirms he is drawing evacuation zones per the fire projection. He\u2019s using the simulation\u2019s 1-hour and 2-hour lines as the inner and outer zone boundaries." },
        { screen: "Radio \u2192 Beacon", action: "Lt. Chen radios from the fire line: \u201CEngine 12 reporting spot fire across CR4, 200 yards ahead of the main line.\u201D Gonzalez relays this to Beacon by dropping a pin: \u201CFire engine spotted here \u2014 spot fire confirmed.\u201D This updates the simulation and is visible to all users." },
        { screen: "Radio \u2192 Beacon", action: "Aerial unit radios a perimeter update from overhead. Gonzalez redraws the eastern boundary on the Beacon map. Projection lines shift outward." },
        { screen: "Dashboard > Resources", action: "Mutual aid engines arriving. Assigns defensive positions: Engine 12 to Oak St homes, Engine 15 to Cedar Ave, aerial on eastern flank." },
        { screen: "Teams > Fire Dept (Tasks)", action: "Creates and assigns specific tasks: \u201CEngine 12: defend Oak St. Engine 15: defend Cedar Ave. Truck 3: water supply from hydrant at Main.\u201D" },
        { screen: "Dashboard > Map", action: "Marks areas where crews must NOT enter due to fire behavior. Safety zones identified and visible to all." },
        { screen: "Dashboard > Map", action: "Confirms \u201Cin the black\u201D regions where fire has already passed. Manually draws the burned area boundary from field reports. These regions appear on everyone\u2019s map as safe ground. If the simulation\u2019s auto-detected burn area is wrong, she can manually add, remove, or redraw these zones." },
        { screen: "Dashboard > Comms", action: "Coordinates with Utility Rep: \u201CDe-energize Zone 3 lines before my crews work near them.\u201D" },
      ],
      needs: [
        "Real-time fire perimeter drawing with automatic simulation recalculation on every update",
        "Structure color-coding by projected fire contact time (red/orange/yellow/green)",
        "Point-and-click structure query: select any building to see projected fire arrival with current vs. no intervention",
        "Radio-to-Beacon relay: quick pin drops and perimeter updates from radio reports, labeled \u201Cfire engine spotted here\u201D",
        "Manual \u201Cin the black\u201D boundary drawing with ability to add, remove, or redraw burned regions visible to all users",
        "Task assignment system that maps to specific geographic positions",
        "Safety zone marking and no-go zone designation",
        "Coordination channel with utility for de-energization timing",
      ],
      gives: [
        "Updated authoritative fire perimeter with recalculated projections for all users",
        "Structure-level fire arrival projections visible to evacuation teams and residents",
        "Spot fire confirmations that update the public simulation",
        "Confirmed \u201Cin the black\u201D safe zones visible to all \u2014 firefighters, civilians, and volunteers",
        "Intelligence to sheriff on fire timing for evacuation urgency",
        "Crew task assignments visible to all firefighters",
      ],
    },
    // ── PHASE 4: ACTIVE EMERGENCY & SHERIFF COORDINATION ──
    {
      time: "T+2 hours to T+6 hours", title: "Phase 4: Active Emergency",
      context: "Fire is 250 acres. Homes are burning on Cedar Ave and Pine St. Gonzalez is managing 15 engines, 4 aerial units, and 200+ personnel across a multi-mile fire line. She\u2019s lost 12 structures. Crews are fatigued. She\u2019s rotating shifts and managing safety. The Sheriff is running the evacuation side \u2014 he\u2019s coordinating over radio with his deputies and manually inputting their status into Beacon, because his people in the field are focused on moving civilians, not tapping screens. Backup deputies are arriving and the Sheriff adds them to the event using an access code so everyone can see who is assigned where.",
      emotional: "Exhausted but locked in. Making structure triage decisions that will affect families. Uses the simulation projections and crowdsourced reports to stay ahead of a fire that\u2019s moving faster than her crews.",
      actions: [
        { screen: "Dashboard > Map", action: "Continuous perimeter updates. Marks structures lost (12 confirmed). The simulation recalculates after each update \u2014 the loss of structures changes fuel load calculations and projected spread. Remaining structures re-color based on updated projections." },
        { screen: "Dashboard > Map", action: "The fire simulation shows the 30-min and 1-hr projection lines. At current intervention, the eastern flank is being held. Without intervention, the simulation shows the fire reaching the highway in 2 hours. This \u201Cwith vs. without\u201D comparison helps justify resource allocation decisions." },
        { screen: "Dashboard > Resources", action: "Manages 15 engines, 4 aerial, 200+ personnel. Tracks crew fatigue hours. Initiates mandatory rotation for crews past 10 hours." },
        { screen: "Dashboard > Map", action: "Redraws \u201Cin the black\u201D regions as the fire passes through areas. These are now safe zones. The simulation auto-detects some burned areas from satellite data, but Gonzalez confirms or corrects them manually. She removes a small section the simulation marked as \u201Cin the black\u201D that still has hot spots." },
        { screen: "Dashboard > Comms", action: "Sheriff reports: \u201CBackup units arriving. I\u2019m adding them to the event now.\u201D He gives each arriving deputy an event access code. When they enter it on Beacon, they appear on the map with their assigned role: \u201CDeputy Rodriguez \u2014 Zone 3 door-knock\u201D, \u201CDeputy Kim \u2014 Highway 91 traffic control.\u201D Everyone on the incident can see who is doing what." },
        { screen: "Dashboard > Comms", action: "Notes that the Sheriff is doing most of the Beacon input himself for his deputies. The deputies are on patrol radio coordinating the actual evacuation. The Sheriff is the bridge between their radio world and Beacon, just as Gonzalez is the bridge for her fire crews. This is the expected workflow \u2014 the commanders update Beacon, the field personnel stay on radio." },
        { screen: "Radio \u2192 Beacon", action: "Aerial unit radios: \u201CSpot fire confirmed east of the highway, south of Pine St.\u201D Gonzalez drops the pin on Beacon. The simulation immediately recalculates, and the projection lines for the southern neighborhoods shift outward." },
        { screen: "Dashboard > Intelligence", action: "Citizen posts geofenced condition report with photo: \u201CFlames visible on Pine St roof at 2nd house.\u201D Dispatches nearest crew." },
        { screen: "Dashboard > Intelligence", action: "Reviews aggregated citizen reports to identify new spot fires ahead of the main fire line." },
        { screen: "Dashboard > Map", action: "Marks confirmed safe areas behind the fire line as \u201Cin the black.\u201D Informs evacuation teams which areas are clear for SAR." },
        { screen: "Teams > Fire Dept (Tasks)", action: "Updates task assignments as the operation evolves. Reassigns crews from lost structures to defensible ones." },
      ],
      needs: [
        "Fire simulation that recalculates on every perimeter redraw, with \u201Ccurrent intervention\u201D vs. \u201Cno intervention\u201D modes",
        "Structure loss confirmation that feeds back into the simulation (changes fuel load)",
        "Manual confirm/correct/redraw for \u201Cin the black\u201D regions \u2014 override auto-detection when it\u2019s wrong",
        "Event access code system so the Sheriff can quickly add backup deputies with assigned roles visible to all",
        "Role assignment visible on the map: each person\u2019s name and assignment shown on their dot",
        "Crew fatigue tracking and mandatory rotation alerts",
        "Real-time crowdsourced condition reports from remaining citizens",
        "Spot fire detection from citizen reports ahead of the main line",
      ],
      gives: [
        "Structure-by-structure damage status for all stakeholders",
        "Accurate, continuously updated fire perimeter with recalculated projections",
        "Confirmed \u201Cin the black\u201D safe zones for SAR and civilian retreat",
        "Crew status and resource availability to county EM",
        "Fire simulation projections that help justify resource allocation to mutual aid partners",
      ],
    },
    // ── PHASE 5: CONTAINMENT ──
    {
      time: "T+6 hours to T+24 hours", title: "Phase 5: Containment",
      context: "Wind dies down overnight. Fire reaches 40% containment at 450 acres. 23 homes destroyed, 8 damaged. Captain Gonzalez manages the overnight shift, identifies remaining hot spots, and begins coordinating with SAR teams for burn zone entry. She maps the complete damage assessment using field crews. The fire simulation\u2019s projection lines are shrinking as containment increases \u2014 the 2-hour projection now barely extends beyond the current perimeter.",
      emotional: "Relieved that the wind died. Exhausted after 12+ hours of command. Focused on keeping crews safe in mop-up operations and clearing safe corridors for SAR.",
      actions: [
        { screen: "Dashboard > Map", action: "Draws 40% containment line. Marks remaining hot spots and active fire areas. The simulation\u2019s projection lines are now much smaller \u2014 visible confirmation that the fire is being brought under control." },
        { screen: "Dashboard > Map", action: "Finalizes \u201Cin the black\u201D regions for the entire burn area. Manually confirms areas that have cooled enough for entry. Removes hot spot flags as crews confirm them cold." },
        { screen: "Dashboard > Resources", action: "Rotates overnight crews. Releases mutual aid engines that are no longer needed. Thanks all partners." },
        { screen: "Dashboard > Intelligence", action: "Confirms structure damage: 23 destroyed, 8 major damage, 15 minor. Maps each on the authoritative damage layer." },
        { screen: "Dashboard > Comms", action: "Clears safe corridors for sheriff\u2019s SAR team to enter burn zone. Marks areas still too hot for entry." },
        { screen: "Dashboard > Comms", action: "Briefing to county EM: situation summary, damage count, containment projection: 85% by tomorrow evening." },
        { screen: "Teams > Fire Dept (Announce)", action: "\u201COutstanding work today. 23 structures lost but dozens more saved. Mop-up continues overnight. Stay safe.\u201D" },
      ],
      needs: [
        "Structure damage mapping tool with status categories (destroyed, major, minor, intact)",
        "Containment line drawing that distinguishes from fire perimeter",
        "Safe corridor designation tool for SAR access",
        "Hot spot marking and cooling rate tracking",
        "Fire simulation that reflects containment progress visually",
      ],
      gives: [
        "Complete damage assessment layer visible to EM, sheriff, residents",
        "Safe corridor information for SAR operations",
        "Containment status and projections",
        "Finalized \u201Cin the black\u201D map for all users",
      ],
    },
    // ── PHASE 6: STABILIZATION ──
    {
      time: "T+24h to T+72h", title: "Phase 6: Stabilization",
      context: "Fire reaches 85% containment. Captain Gonzalez transitions from active firefighting to mop-up coordination and investigation support. Arson investigation team arrives. She provides Beacon data logs to investigators \u2014 including the complete fire simulation history showing how the fire spread and how projections compared to reality.",
      emotional: "Winding down from the adrenaline. Beginning to process the losses. Proud of the team. Starting to think about lessons learned.",
      actions: [
        { screen: "Dashboard > Map", action: "Final perimeter update: 85% contained, 450 acres. Marks full containment projected for tomorrow." },
        { screen: "Dashboard > Resources", action: "Scales down operations. Most mutual aid released. Keeps 4 engines for mop-up and hot spot monitoring." },
        { screen: "Dashboard > Intelligence", action: "Pulls Beacon event logs for investigation team: timeline of citizen reports, fire simulation history, crowdsourced photos, and fire progression." },
        { screen: "Dashboard > Comms", action: "Coordinates with EM on when to allow escorted resident access." },
        { screen: "Teams > Fire Dept (Announce)", action: "\u201CFire 85% contained. Mop-up continues. Investigation team on scene. Thank you to all mutual aid partners.\u201D" },
      ],
      needs: [
        "Event log export for investigation and after-action review, including fire simulation replay",
        "Scaled-down resource management as operation winds down",
        "Coordination with EM on zone access decisions",
      ],
      gives: [
        "Final fire perimeter and containment status",
        "Event data and simulation history for investigation",
        "Clearance information for resident return planning",
      ],
    },
    // ── PHASE 7: RECOVERY ──
    {
      time: "T+3 days to T+14 days", title: "Phase 7: Recovery Support",
      context: "Fire fully contained. Captain Gonzalez participates in the after-action review, provides testimony for the damage assessment team, and supports community recovery briefings. Her Beacon data \u2014 including the fire simulation replay \u2014 becomes part of the official incident record.",
      emotional: "Processing. Attending critical incident stress debriefings. Proud of team performance but haunted by the homes lost.",
      actions: [
        { screen: "Dashboard > After-Action", action: "Reviews Beacon event timeline. Exports complete dataset: resource movements, citizen reports, response times, decision points, fire simulation accuracy." },
        { screen: "Dashboard > Map", action: "Provides final damage assessment map to FEMA preliminary damage assessment team." },
        { screen: "Dashboard > Comms", action: "Participates in multi-agency after-action conference call. Reviews response effectiveness. Compares simulation projections vs. actual fire spread." },
        { screen: "Teams > Fire Dept (Announce)", action: "Posts lessons learned and commendations. Recognizes specific crew actions during the event." },
      ],
      needs: [
        "Complete event data export including fire simulation replay for after-action review",
        "Simulation accuracy analysis: projected vs. actual fire spread comparison",
        "Multi-agency after-action communication tools",
      ],
      gives: [
        "Official incident record preserved in Beacon",
        "Damage assessment data for FEMA",
        "Lessons learned for future preparedness",
        "Simulation accuracy data to improve future fire models",
      ],
    },
    // ── PHASE 8: PREPAREDNESS ──
    {
      time: "T+14 days onward", title: "Phase 8: Preparedness",
      context: "Captain Gonzalez works with the county EM to update Beacon\u2019s fire risk layers based on the burn scar, update defensible space recommendations, and plan community preparedness outreach. The fire simulation data improves Beacon\u2019s spread models for the entire region. The event data trains better wind and fuel models.",
      emotional: "Determined. Wants to ensure the community is better prepared next time. Advocates for Beacon expansion funding to increase household adoption.",
      actions: [
        { screen: "Dashboard > Map", action: "Updates fire risk layers to reflect burn scar (reduced risk) and adjacent unburned areas (elevated risk from ember exposure)." },
        { screen: "Dashboard > Alerts", action: "Pushes preparedness guidance for next fire season: defensible space, go bags, evacuation planning." },
        { screen: "Teams > Fire Dept (Announce)", action: "Announces community preparedness workshops and open house at fire stations." },
        { screen: "Feed (Public)", action: "Posts a public thank-you to the community. Highlights how citizen reports and the fire simulation helped identify threats 15 minutes faster than traditional observation." },
      ],
      needs: [
        "Fire risk layer update tools incorporating burn scar data",
        "Preparedness campaign push notification capabilities",
        "Community engagement metrics to measure outreach effectiveness",
      ],
      gives: [
        "Updated risk assessment for the entire community",
        "Preparedness guidance for residents",
        "Public trust building through transparency",
      ],
    },
  ],
  requirements: [
    { section: "Fire Simulation & Projection", items: [
      "Fire spread projection lines visible on the map: 30-minute, 1-hour, 1.5-hour, and 2-hour arcs from current perimeter",
      "Projection recalculates automatically every time the IC redraws the fire perimeter",
      "Two projection modes: \u201Ccurrent intervention\u201D vs. \u201Cno intervention\u201D \u2014 shows the difference firefighting is making",
      "Public-facing projections: every Beacon user can see the spread lines and know when the fire is expected to reach their area",
      "Point-and-click structure query: tap any building to see projected fire arrival time under current conditions",
      "Structures color-coded by projected fire contact time: red (< 30 min), orange (30\u201360 min), yellow (1\u20132 hr), green (> 2 hr)",
      "Simulation seeded by crowdsourced sighting reports initially, then transitions to authoritative perimeter when IC draws it",
      "Barometric pressure readings from Beacon user devices integrated into wind modeling",
      "Fire simulation history replay for after-action review",
      "Simulation accuracy tracking: projected vs. actual fire spread comparison",
      "At-risk assessment visible to fire chief: \u201CThis fire is at high risk of growing out of control given current wind conditions\u201D based on wind speed, fuel, humidity, and terrain",
    ]},
    { section: "In the Black / Burned Area Management", items: [
      "Manual \u201Cin the black\u201D boundary drawing: IC draws confirmed burned regions visible to all users",
      "Auto-detection from satellite data that the IC can confirm, correct, or override",
      "Ability to add, remove, or redraw burned regions as conditions change",
      "Visible to all users: firefighters can retreat to burned ground, civilians know where safe zones are",
      "\u201CIn the black\u201D regions feed back into the fire simulation as areas where the fire cannot re-burn",
    ]},
    { section: "Remote Command & Radio Integration", items: [
      "Ability to go active and assume IC role remotely before arriving on scene",
      "Radio-to-Beacon relay workflow: IC hears radio reports and quickly drops pins, redraws perimeters, or updates status on Beacon",
      "\u201CFire engine spotted here\u201D quick-pin from radio reports, visible to all users",
      "Expected workflow: field crews stay on tactical radio, IC bridges radio and Beacon. Sheriff does the same for deputies.",
    ]},
    { section: "Event Access & Role Assignment", items: [
      "Event access code that the Sheriff (or any commander) can give to arriving personnel",
      "Entering the code adds the person to the event and places them on the map",
      "Role assignment visible on each person\u2019s map dot: name and current assignment",
      "Everyone on the incident can see who is assigned where and what their role is",
    ]},
    { section: "Dashboard Features", items: [
      "Fast polygon drawing tool optimized for field conditions (one-handed, large targets)",
      "Official event creation with automatic emergency channel activation",
      "Event start time backdating: declarer can set event start to an earlier time so all data from that point is captured in the event record. If not backdated, Beacon auto-snapshots all current map state and weather conditions from the previous 48 hours at time of declaration.",
      "Fire perimeter drawing that becomes the authoritative map layer for all users",
      "Resource management: engines, aerials, personnel with fatigue tracking",
      "Mutual aid request system with auto-notification to partner agencies",
      "Unified emergency communication channel (fire, sheriff, EM, utilities)",
      "Task assignment system with geographic mapping",
      "Structure damage assessment tool with status categories",
      "Containment line drawing distinct from fire perimeter",
      "Safe corridor designation for SAR access",
      "Geofenced citizen condition reporting",
      "Event log export for investigation and after-action review",
    ]},
    { section: "Evacuation Zone Coordination", items: [
      "Evacuation zones are drawn per-incident by the Sheriff based on the fire IC\u2019s projection data and terrain",
      "The Sheriff uses the fire simulation\u2019s projection lines (1-hr, 2-hr) as references for zone boundaries",
      "Pre-drawn zone templates may exist for known high-risk areas but are adjusted per incident based on actual fire behavior",
      "The fire IC recommends evacuation timing; the Sheriff draws the zones and issues the orders",
    ]},
    { section: "Teams Features", items: [
      "Announcements sub-tab for official department communications",
      "Tasks sub-tab for crew assignments with geographic positions",
      "Chat for rapid crew coordination",
    ]},
    { section: "Map Features", items: [
      "Wind model overlay with wind direction arrows and speed",
      "Safety zone marking and no-go zone designation",
      "Burned area cooling model and hot spot tracking",
      "Burn scar visualization for long-term recovery",
    ]},
  ],
};

// ─── BUILD DOCUMENT ───
async function generate() {
  const children = [];

  // Title page
  children.push(spacer(2000));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "BEACON", font: "Arial", size: 48, bold: true, color: ORANGE }),
  ]}));
  children.push(spacer(40));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Wildfire Scenario", font: "Arial", size: 32, color: GRAY }),
  ]}));
  children.push(spacer(60));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: user.icon + " " + user.name, font: "Arial", size: 40, bold: true, color: PURPLE }),
  ]}));
  children.push(spacer(40));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: user.subtitle, font: "Arial", size: 26, color: GRAY }),
  ]}));
  children.push(spacer(200));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
    new TextRun({ text: "User Profile", font: "Arial", size: 24, bold: true, color: PURPLE }),
  ]}));
  for (const line of user.bio) {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [
      new TextRun({ text: line, font: "Arial", size: 22, color: GRAY }),
    ]}));
  }
  children.push(spacer(400));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: "Beacon Platform \u2022 Wildfire Scenario Simulation \u2022 March 2026", font: "Arial", size: 20, color: GRAY }),
  ]}));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Phases
  for (const phase of user.phases) {
    children.push(phaseBox(phase.time, phase.title));
    children.push(spacer(60));
    children.push(para(phase.context));
    children.push(spacer(40));
    if (phase.emotional) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Emotional State")] }));
      children.push(para(phase.emotional, { italics: true, color: GRAY }));
      children.push(spacer(40));
    }
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Actions in Beacon")] }));
    children.push(actionTable(phase.actions));
    children.push(spacer(40));
    if (phase.needs) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("What This User Needs From Beacon")] }));
      for (const n of phase.needs) children.push(bullet(n));
    }
    if (phase.gives) {
      children.push(spacer(20));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("What This User Gives to Beacon")] }));
      for (const g of phase.gives) children.push(bullet(g));
    }
    children.push(spacer(100));
    if (phase !== user.phases[user.phases.length - 1]) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  // Summary page
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("UI Requirements Summary")] }));
  children.push(spacer(40));
  children.push(para("Based on this user\u2019s journey through the wildfire scenario, the following screens and features are required:"));
  children.push(spacer(40));
  for (const req of user.requirements) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(req.section)] }));
    for (const item of req.items) children.push(bullet(item));
    children.push(spacer(40));
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 24 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 34, bold: true, font: "Arial", color: PURPLE },
          paragraph: { spacing: { before: 320, after: 180 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: PURPLE },
          paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: BLUE },
          paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 } },
      ],
    },
    numbering: {
      config: [
        { reference: "bullets", levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        ]},
      ],
    },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } },
          children: [new TextRun({ text: user.icon + " " + user.name + " \u2014 Wildfire Scenario", font: "Arial", size: 18, color: GRAY })],
        })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Beacon Platform \u2022 Page ", font: "Arial", size: 18, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: GRAY }),
          ],
        })] }),
      },
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  const outPath = "/sessions/friendly-bold-bardeen/mnt/beacon/wildfire_scenario_user_journeys/01_fire_captain_ic.docx";
  fs.writeFileSync(outPath, buf);
  console.log("Created: 01_fire_captain_ic.docx");
}

generate().catch(e => { console.error(e); process.exit(1); });
