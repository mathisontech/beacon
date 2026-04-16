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
const CONTENT_WIDTH = 9360;

// ─── HELPERS ───
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
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 60, line: 276 },
    children: [new TextRun({ text, font: "Arial", size: 24 })],
  });
}

function richBullet(runs, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 60, line: 276 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 24, ...r })),
  });
}

function phaseBox(time, title, color = PURPLE) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        shading: { fill: color, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        children: [new Paragraph({
          children: [
            new TextRun({ text: time + "  ", font: "Arial", size: 28, bold: true, color: ORANGE }),
            new TextRun({ text: title, font: "Arial", size: 28, bold: true, color: WHITE }),
          ],
        })],
      })],
    })],
  });
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
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [2600, 6760],
    rows,
  });
}

function makeDoc(user) {
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

  // Bio section
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
      for (const n of phase.needs) {
        children.push(bullet(n));
      }
    }

    if (phase.gives) {
      children.push(spacer(20));
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("What This User Gives to Beacon")] }));
      for (const g of phase.gives) {
        children.push(bullet(g));
      }
    }

    children.push(spacer(100));
    // Page break between phases (except last)
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
    for (const item of req.items) {
      children.push(bullet(item));
    }
    children.push(spacer(40));
  }

  return new Document({
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
        { reference: "bullets",
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
          ] },
      ],
    },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } },
          children: [
            new TextRun({ text: user.icon + " " + user.name + " \u2014 Wildfire Scenario", font: "Arial", size: 18, color: GRAY }),
          ],
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
}

// ════════════════════════════════════════════════
// USER DATA
// ════════════════════════════════════════════════

const USERS = [

// ─── 1. FIRE CAPTAIN ───
{
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
    {
      time: "T+0 to T+15 min", title: "Phase 1: Detection",
      context: "Captain Gonzalez is off-shift at home when Beacon pushes a clustered fire sighting alert to her phone. She reviews the crowdsourced reports, assesses the photos, and contacts dispatch. Engine 7 is already rolling based on 911 calls, but Beacon\u2019s crowdsourced data gives her a head start on understanding the situation before she arrives on scene.",
      emotional: "Alert but controlled. Assessing from crowdsourced data before committing to scene. Appreciates that Beacon gives her advance situational awareness beyond dispatch radio.",
      actions: [
        { screen: "Push Notification", action: "Receives Beacon alert: 3+ fire sighting reports clustered in NE hills within her jurisdiction." },
        { screen: "Feed", action: "Reviews crowdsourced photo reports from residents. Assesses approximate fire size and wind direction from multiple vantage points." },
        { screen: "Map", action: "Checks sighting cluster location against known terrain. NE hills are wildland-urban interface with heavy brush." },
        { screen: "Teams > Fire Dept (Chat)", action: "Messages on-duty crew: \u201CEngine 7 responding? I see 5+ crowdsourced smoke reports NE hills. Looks wind-driven.\u201D" },
        { screen: "Teams > Fire Dept (Announce)", action: "Posts: \u201CEngine 7 dispatched to NE hills. All off-duty personnel: stand by for callback.\u201D" },
      ],
      needs: [
        "Aggregated crowdsourced reports with photo evidence before arriving on scene",
        "Map showing cluster location relative to known infrastructure and terrain",
        "Quick communication channel to on-duty crews",
      ],
      gives: [
        "Official department announcement confirming awareness",
        "Leadership communication to personnel",
      ],
    },
    {
      time: "T+15 min to T+45 min", title: "Phase 2: Confirmation & Escalation",
      context: "Captain Gonzalez arrives on scene and assumes Incident Command. The fire is 5 acres and spreading rapidly with 40+ mph Santa Ana winds. She creates the official event in Beacon, draws the fire perimeter on the dashboard map, and begins requesting resources. Her fire perimeter drawing replaces the crowdsourced sighting dots with an authoritative layer visible to all users.",
      emotional: "Focused, high-tempo. Running resource calculations. Knows this fire will outpace initial attack. Needs mutual aid fast.",
      actions: [
        { screen: "Dashboard > Events", action: "Creates official event: \u201CNE Hills Brush Fire.\u201D This triggers emergency protocol across all verified Beacon teams in the county." },
        { screen: "Dashboard > Map", action: "Draws initial fire perimeter from field observation. This becomes the authoritative fire layer, replacing crowdsourced dots for all users." },
        { screen: "Dashboard > Map", action: "Updates perimeter as fire grows to 15 acres within 10 minutes. Adds wind direction arrows." },
        { screen: "Dashboard > Resources", action: "Logs Engine 7 and Engine 12 on scene. Requests 3 additional engines, 1 aerial unit, 2 water tenders." },
        { screen: "Dashboard > Mutual Aid", action: "Sends mutual aid request to San Bernardino and Corona fire departments. Request includes situation summary and resource needs." },
        { screen: "Dashboard > Comms", action: "Opens emergency coordination channel with Sheriff and County Emergency Manager. Briefs: \u201C15 acres, wind-driven, heading toward Zone 3 residential.\u201D" },
        { screen: "Dashboard > Comms", action: "Tells Sheriff: \u201CPre-stage for Zone 3 evacuation. If this wind holds, we\u2019re 90 minutes from structures.\u201D" },
        { screen: "Teams > Fire Dept (Announce)", action: "All-call: \u201CAll personnel report to Station 4 for staging. Full structure gear.\u201D" },
      ],
      needs: [
        "Fast polygon drawing tool for fire perimeter under field conditions (one-handed operation)",
        "Resource request system that auto-notifies mutual aid partners",
        "Unified communication channel with sheriff, EM, and utilities",
        "Wind model overlay to project fire spread",
      ],
      gives: [
        "Authoritative fire perimeter visible to all Beacon users",
        "Official event activation enabling emergency channels for all verified teams",
        "Situational intelligence to sheriff for evacuation planning",
        "Resource status visible to emergency manager",
      ],
    },
    {
      time: "T+45 min to T+2 hours", title: "Phase 3: Evacuation Operations",
      context: "Fire growing to 80 acres. Wind shift pushes it directly at Zone 3 residential. Captain Gonzalez tells the sheriff to upgrade evacuation. She\u2019s now managing 8 engines on defensive structure protection while the fire continues to spread. Mutual aid is arriving. She assigns defensive positions using the task management system.",
      emotional: "Intense. Balancing firefighter safety against structure defense. Knows some homes will be lost. Making triage decisions.",
      actions: [
        { screen: "Dashboard > Map", action: "Continuous perimeter updates. Fire at 80 acres. Draws new threat areas as wind shifts." },
        { screen: "Dashboard > Comms", action: "Tells Sheriff: \u201CUpgrade Zone 3 NOW. Fire will reach structures in 45 minutes at current rate.\u201D" },
        { screen: "Dashboard > Resources", action: "Mutual aid engines arriving. Assigns defensive positions: Engine 12 to Oak St homes, Engine 15 to Cedar Ave, aerial on eastern flank." },
        { screen: "Teams > Fire Dept (Tasks)", action: "Creates and assigns specific tasks: \u201CEngine 12: defend Oak St. Engine 15: defend Cedar Ave. Truck 3: water supply from hydrant at Main.\u201D" },
        { screen: "Dashboard > Intelligence", action: "Uses geofenced condition reporting: asks remaining residents in Zone 3 to report what they see. Gets eyes in areas crews can\u2019t reach." },
        { screen: "Dashboard > Map", action: "Marks areas where crews must NOT enter due to fire behavior. Safety zones identified." },
        { screen: "Dashboard > Comms", action: "Coordinates with Utility Rep: \u201CDe-energize Zone 3 lines before my crews work near them.\u201D" },
      ],
      needs: [
        "Real-time fire perimeter drawing with rapid update capability",
        "Task assignment system that maps to specific geographic positions",
        "Safety zone marking and no-go zone designation",
        "Crowdsourced condition reports from remaining residents",
        "Coordination channel with utility for de-energization timing",
      ],
      gives: [
        "Updated authoritative fire perimeter for all users",
        "Intelligence to sheriff on fire timing for evacuation urgency",
        "Crew task assignments visible to all firefighters",
        "Safety zone information for all responders",
      ],
    },
    {
      time: "T+2 hours to T+6 hours", title: "Phase 4: Active Emergency",
      context: "Fire is 250 acres. Homes are burning on Cedar Ave and Pine St. Captain Gonzalez is managing 15 engines, 4 aerial units, and 200+ personnel across a multi-mile fire line. She\u2019s lost 12 structures. Crews are fatigued. She\u2019s rotating shifts and managing safety. Crowdsourced reports from remaining residents are helping her spot new threats faster than her own observation.",
      emotional: "Exhausted but locked in. Making structure triage decisions that will affect families. Uses crowdsourced intelligence to stay ahead of a fire that\u2019s moving faster than her crews.",
      actions: [
        { screen: "Dashboard > Map", action: "Continuous perimeter updates. Marks structures lost (12 confirmed). Identifies new threat vectors as wind shifts again." },
        { screen: "Dashboard > Resources", action: "Manages 15 engines, 4 aerial, 200+ personnel. Tracks crew fatigue hours. Initiates mandatory rotation for crews past 10 hours." },
        { screen: "Dashboard > Comms", action: "Coordinates defensive priorities with county EM: \u201CSaving what we can on Cedar Ave. Pine St is lost.\u201D" },
        { screen: "Dashboard > Intelligence", action: "Citizen posts geofenced condition report with photo: \u201CFlames visible on Pine St roof at 2nd house.\u201D Dispatches nearest crew." },
        { screen: "Dashboard > Intelligence", action: "Reviews aggregated citizen reports to identify new spot fires ahead of the main fire line." },
        { screen: "Dashboard > Map", action: "Marks confirmed safe areas behind the fire line as burned zones cool. Informs evacuation teams which areas are clear for SAR." },
        { screen: "Teams > Fire Dept (Tasks)", action: "Updates task assignments as the operation evolves. Reassigns crews from lost structures to defensible ones." },
        { screen: "Dashboard > Resources", action: "Releases 2 mutual aid engines no longer needed on the western flank. Thanks crews via Beacon." },
      ],
      needs: [
        "Structure loss confirmation and mapping tool",
        "Crew fatigue tracking and mandatory rotation alerts",
        "Real-time crowdsourced condition reports from remaining citizens",
        "Spot fire detection from citizen reports ahead of the main line",
        "Burned area cooling model to identify safe zones for SAR",
      ],
      gives: [
        "Structure-by-structure damage status for all stakeholders",
        "Accurate, continuously updated fire perimeter",
        "Safe zone information for SAR teams",
        "Crew status and resource availability to county EM",
      ],
    },
    {
      time: "T+6 hours to T+24 hours", title: "Phase 5: Containment",
      context: "Wind dies down overnight. Fire reaches 40% containment at 450 acres. 23 homes destroyed, 8 damaged. Captain Gonzalez manages the overnight shift, identifies remaining hot spots, and begins coordinating with SAR teams for burn zone entry. She maps the complete damage assessment using field crews with tablets.",
      emotional: "Relieved that the wind died. Exhausted after 12+ hours of command. Focused on keeping crews safe in mop-up operations and clearing safe corridors for SAR.",
      actions: [
        { screen: "Dashboard > Map", action: "Draws 40% containment line. Marks remaining hot spots and active fire areas." },
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
      ],
      gives: [
        "Complete damage assessment layer visible to EM, sheriff, residents",
        "Safe corridor information for SAR operations",
        "Containment status and projections",
      ],
    },
    {
      time: "T+24h to T+72h", title: "Phase 6: Stabilization",
      context: "Fire reaches 85% containment. Captain Gonzalez transitions from active firefighting to mop-up coordination and investigation support. Arson investigation team arrives. She provides Beacon data logs to investigators.",
      emotional: "Winding down from the adrenaline. Beginning to process the losses. Proud of the team. Starting to think about lessons learned.",
      actions: [
        { screen: "Dashboard > Map", action: "Final perimeter update: 85% contained, 450 acres. Marks full containment projected for tomorrow." },
        { screen: "Dashboard > Resources", action: "Scales down operations. Most mutual aid released. Keeps 4 engines for mop-up and hot spot monitoring." },
        { screen: "Dashboard > Intelligence", action: "Pulls Beacon event logs for investigation team: timeline of citizen reports, crowdsourced photos, and fire progression." },
        { screen: "Dashboard > Comms", action: "Coordinates with EM on when to allow escorted resident access to Zone 3." },
        { screen: "Teams > Fire Dept (Announce)", action: "\u201CFire 85% contained. Mop-up continues. Investigation team on scene. Thank you to all mutual aid partners.\u201D" },
      ],
      needs: [
        "Event log export for investigation and after-action review",
        "Scaled-down resource management as operation winds down",
        "Coordination with EM on zone access decisions",
      ],
      gives: [
        "Final fire perimeter and containment status",
        "Event data for investigation",
        "Clearance information for resident return planning",
      ],
    },
    {
      time: "T+3 days to T+14 days", title: "Phase 7: Recovery Support",
      context: "Fire fully contained. Captain Gonzalez participates in the after-action review, provides testimony for the damage assessment team, and supports community recovery briefings. Her Beacon data becomes part of the official incident record.",
      emotional: "Processing. Attending critical incident stress debriefings. Proud of team performance but haunted by the homes lost.",
      actions: [
        { screen: "Dashboard > After-Action", action: "Reviews Beacon event timeline. Exports complete dataset: resource movements, citizen reports, response times, decision points." },
        { screen: "Dashboard > Map", action: "Provides final damage assessment map to FEMA preliminary damage assessment team." },
        { screen: "Dashboard > Comms", action: "Participates in multi-agency after-action conference call. Reviews response effectiveness." },
        { screen: "Teams > Fire Dept (Announce)", action: "Posts lessons learned and commendations. Recognizes specific crew actions during the event." },
      ],
      needs: [
        "Complete event data export for after-action review",
        "Timeline visualization of the entire incident with decision points marked",
        "Multi-agency after-action communication tools",
      ],
      gives: [
        "Official incident record preserved in Beacon",
        "Damage assessment data for FEMA",
        "Lessons learned for future preparedness",
      ],
    },
    {
      time: "T+14 days onward", title: "Phase 8: Preparedness",
      context: "Captain Gonzalez works with the county EM to update Beacon\u2019s fire risk layers based on the burn scar, update defensible space recommendations, and plan community preparedness outreach. The event data from this fire improves Beacon\u2019s fire spread models for the entire region.",
      emotional: "Determined. Wants to ensure the community is better prepared next time. Advocates for Beacon expansion funding to increase household adoption.",
      actions: [
        { screen: "Dashboard > Map", action: "Updates fire risk layers to reflect burn scar (reduced risk) and adjacent unburned areas (elevated risk from ember exposure)." },
        { screen: "Dashboard > Alerts", action: "Pushes preparedness guidance for next fire season: defensible space, go bags, evacuation planning." },
        { screen: "Teams > Fire Dept (Announce)", action: "Announces community preparedness workshops and open house at fire stations." },
        { screen: "Feed (Public)", action: "Posts a public thank-you to the community. Highlights how citizen reports helped identify spot fires 15 minutes faster than traditional observation." },
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
    { section: "Dashboard Features", items: [
      "Fast polygon drawing tool optimized for field conditions (one-handed, large targets)",
      "Official event creation with automatic emergency channel activation",
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
      "Fire risk layer update tools",
    ]},
    { section: "Teams Features", items: [
      "Announcements sub-tab for official department communications",
      "Tasks sub-tab for crew assignments with geographic positions",
      "Chat for rapid crew coordination",
    ]},
    { section: "Map Features", items: [
      "Wind model overlay with projected fire spread",
      "Safety zone marking and no-go zone designation",
      "Burned area cooling model",
      "Burn scar visualization for long-term recovery",
    ]},
  ],
},

// ─── 2. SHERIFF DEPUTY ───
{
  name: "Sheriff Deputy (Evacuation Lead)",
  icon: "\uD83D\uDC6E",
  filename: "02_sheriff_deputy_evac",
  subtitle: "Law enforcement officer leading civilian evacuation operations",
  bio: [
    "Deputy James Torres, Riverside County Sheriff\u2019s Department",
    "12 years experience. Assigned as Evacuation Group Supervisor.",
    "Beacon Dashboard user (paid client, law enforcement tier).",
    "Primary focus: civilian safety, evacuation execution, missing persons.",
  ],
  phases: [
    {
      time: "T+0 to T+15 min", title: "Phase 1: Detection",
      context: "Deputy Torres is on patrol when smoke sighting alerts start appearing on Beacon. He checks the Feed and Map to assess the situation. No official orders yet, but he begins mentally planning evacuation routes.",
      emotional: "Watchful. Running scenarios in his head. Reviewing known vulnerable populations in the area.",
      actions: [
        { screen: "Push Notification", action: "Receives Beacon alert: clustered fire sighting reports in NE hills." },
        { screen: "Feed + Map", action: "Reviews citizen reports. Assesses location relative to residential areas. Identifies Zone 3 as most at risk." },
        { screen: "Dashboard > Map", action: "Pulls up evacuation zone templates pre-drawn during planning. Zone 3 aligns with the threat area." },
        { screen: "Dashboard > Resources", action: "Reviews on-duty patrol unit positions. Identifies units closest to Zone 3 for rapid deployment." },
      ],
      needs: [
        "Pre-drawn evacuation zone templates that can be activated quickly",
        "Patrol unit location mapping for rapid deployment planning",
      ],
      gives: [
        "Early awareness of vulnerable areas and pre-staging considerations",
      ],
    },
    {
      time: "T+15 min to T+45 min", title: "Phase 2: Confirmation & Escalation",
      context: "Fire confirmed. Captain Gonzalez briefs Torres via the emergency channel. Torres begins drawing final evacuation zone boundaries and pre-staging patrol units at key intersections. He defines evacuation routes on the Beacon map.",
      emotional: "Methodical urgency. Running through the checklist. Knows he\u2019ll need to move thousands of people if Zone 3 is ordered.",
      actions: [
        { screen: "Dashboard > Comms", action: "Receives briefing from fire IC: \u201C15 acres, wind-driven, heading toward Zone 3. Pre-stage for evacuation.\u201D" },
        { screen: "Dashboard > Map (Zones)", action: "Finalizes evacuation zone boundaries: Zone 1 (closest to fire), Zone 2 (schools/commercial), Zone 3 (residential). Draws geofenced polygons." },
        { screen: "Dashboard > Routes", action: "Defines primary evacuation route (Highway 91) and alternates (Elm Ave, River Rd). Marks them on the map." },
        { screen: "Dashboard > Resources", action: "Deploys 6 patrol units to pre-stage at major intersections along evacuation routes." },
        { screen: "Dashboard > Comms", action: "Coordinates with fire IC: \u201CZones drawn. Routes defined. Ready to issue warning on your call.\u201D" },
        { screen: "Dashboard > Alerts (Draft)", action: "Pre-drafts evacuation warning text for rapid push when fire IC gives the word." },
      ],
      needs: [
        "Geofenced evacuation zone polygon drawing tool",
        "Evacuation route definition with alternate route marking",
        "Pre-drafted alert template system for rapid deployment",
        "Patrol unit location tracking on the map",
      ],
      gives: [
        "Evacuation zone boundaries visible to all emergency services",
        "Defined routes ready for publication to public",
        "Patrol unit staging information",
      ],
    },
    {
      time: "T+45 min to T+2 hours", title: "Phase 3: Evacuation Orders",
      context: "Fire IC calls it: Zone 3 needs to go. Torres activates the evacuation warning, then upgrades to mandatory 20 minutes later. His dashboard becomes a real-time accountability tracker: who\u2019s evacuating, who\u2019s staying, who hasn\u2019t responded. He dispatches welfare checks for non-responsive residents, coordinates road closures, and manages the flow of thousands of vehicles.",
      emotional: "High stress. People\u2019s lives depend on his decisions. Every non-response on the evacuation confirmation is a person who might be trapped.",
      actions: [
        { screen: "Dashboard > Zones", action: "Activates evacuation WARNING for Zone 3. All users with addresses in the polygon receive push notifications and Action Required cards." },
        { screen: "Dashboard > Evac Module", action: "Watches real-time responses: 340 \u201CEvacuating Now,\u201D 45 \u201CStaying,\u201D 180 \u201CNo Response.\u201D" },
        { screen: "Dashboard > Zones", action: "20 minutes later: upgrades Zone 3 to MANDATORY evacuation. Red banner pushed to all Zone 3 users." },
        { screen: "Dashboard > Evac Module", action: "Reviews \u201CStaying\u201D responses. 18 have submitted next-of-kin forms. 27 have not. Flags them for door-knock." },
        { screen: "Dashboard > Help Manager", action: "Pushes Category 1 welfare check requests for 12 non-responsive users flagged as elderly or disabled in their profiles." },
        { screen: "Dashboard > Help Manager", action: "Pushes Category 2 evacuation confirmation requests to volunteers: \u201CConfirm 123 Oak St is empty.\u201D" },
        { screen: "Dashboard > Routes", action: "Oak St blocked by fallen tree. Marks it closed. Route automatically updates for evacuees. Dispatches road crew." },
        { screen: "Dashboard > Map", action: "Monitors traffic flow on evacuation routes. Identifies bottleneck at Highway 91 on-ramp. Deploys officer to direct traffic." },
        { screen: "Dashboard > Comms", action: "Coordinates with school: \u201CZone 2 warning issued. Advise school evacuation.\u201D" },
        { screen: "Dashboard > Alerts", action: "Pushes shelter locations with capacity: \u201CConvention Center open. Pet-friendly. Medical staff on site.\u201D" },
      ],
      needs: [
        "One-tap evacuation zone activation (warning and mandatory as separate actions)",
        "Real-time evacuation confirmation dashboard with response categories",
        "Next-of-kin form collection from \u201CStaying\u201D respondents",
        "Non-responsive user flagging with vulnerability profile data",
        "Welfare check dispatch system (Categories 1 and 2)",
        "Road closure marking with automatic route recalculation for evacuees",
        "Real-time traffic monitoring on evacuation routes",
        "Shelter capacity tracking and publication",
      ],
      gives: [
        "Evacuation orders pushed to all affected users with Action Required cards",
        "Evacuation route publication on public map",
        "Shelter information visible to all users",
        "Welfare check requests dispatched to volunteers",
        "Road status updates affecting all users\u2019 routes",
      ],
    },
    {
      time: "T+2 hours to T+6 hours", title: "Phase 4: Active Emergency",
      context: "Evacuation mostly complete. Torres focuses on the 47 people who responded \u201CStaying\u201D and the shrinking pool of non-responsive users. He\u2019s sending patrol units for door-knocks on the most vulnerable. Volunteer welfare checks are closing the gap. 3 people are actively refusing mandatory evacuation.",
      emotional: "Frustrated by refusals. Worried about the non-responsive. Grateful for volunteers closing the welfare check gap.",
      actions: [
        { screen: "Dashboard > Evac Module", action: "47 staying, 14 non-responsive. Cross-references with shelter check-in data. 6 of the 14 are actually at shelters (just didn\u2019t respond). 8 truly unaccounted." },
        { screen: "Dashboard > Help Manager", action: "Volunteers have confirmed 22 addresses as evacuated. Updates the evacuation status layer." },
        { screen: "Dashboard > Comms", action: "Dispatches patrol units for door-knocks on the 8 truly unaccounted addresses." },
        { screen: "Dashboard > Map", action: "Tracks patrol unit positions in real-time. Adjusts traffic control as evacuee flow slows." },
        { screen: "Dashboard > Comms", action: "3 residents refusing evacuation. Documents refusal. Ensures next-of-kin forms are on file. Notes their locations for fire crews." },
        { screen: "Dashboard > Alerts", action: "Pushes Zone 2 warning as fire approaches. New wave of evacuees." },
      ],
      needs: [
        "Cross-reference between evacuation confirmation and shelter check-in to eliminate false non-responses",
        "Volunteer welfare check status tracking (confirmed evacuated, still occupied, no answer)",
        "Refusal documentation workflow",
        "Progressive zone activation capability",
      ],
      gives: [
        "Accurate accountability data for all emergency services",
        "Evacuation status layer showing confirmed evacuated addresses",
        "Refusal documentation and locations for fire crews",
      ],
    },
    {
      time: "T+6 hours to T+24 hours", title: "Phase 5: Accountability",
      context: "Fire partially contained. Torres transitions to accountability mode. He cross-references every data source to find the 6 truly unaccounted residents. SAR teams enter cooled parts of the burn zone. He\u2019s also managing a missing persons tracker for family members who can\u2019t reach loved ones.",
      emotional: "Dreading what SAR might find. Methodically working through the list. Every confirmed-safe person is a relief.",
      actions: [
        { screen: "Dashboard > Missing Persons", action: "Activates missing persons tracker. 4 family reports received of loved ones they can\u2019t reach." },
        { screen: "Dashboard > Evac Module", action: "Cross-references: 2 of the 4 reported missing are on the \u201CStaying\u201D list with submitted next-of-kin. 2 are truly unaccounted." },
        { screen: "Dashboard > Comms", action: "Coordinates SAR entry with fire IC. Receives safe corridor clearance for 4 addresses." },
        { screen: "Dashboard > Welfare", action: "SAR teams confirm: 2 addresses evacuated (occupants found at a hotel not on Beacon). 2 remaining, both found safe at a friend\u2019s house." },
        { screen: "Dashboard > Missing Persons", action: "Closes all missing person reports with confirmed-safe status. Families notified through Beacon." },
        { screen: "Dashboard > Alerts", action: "Pushes: \u201CAll Zone 3 residents accounted for. Evacuation orders remain in effect.\u201D" },
      ],
      needs: [
        "Missing persons tracker with family submission intake",
        "Cross-referencing tool between evacuation data, shelter data, and missing reports",
        "SAR coordination with safe corridor information from fire IC",
        "Family notification system when missing person is found",
      ],
      gives: [
        "Accountability status for all residents",
        "Family notifications for missing persons",
        "All-clear communication when everyone is accounted for",
      ],
    },
    {
      time: "T+24h to T+72h", title: "Phase 6: Stabilization",
      context: "Torres manages the phased return of residents. Zone 2 cleared first. Zone 3 requires escorted access only due to hazardous conditions. He coordinates checkpoint staffing and access time slots through Beacon.",
      emotional: "Relief mixed with sadness. Driving through the burned area is emotional. Focused on orderly and safe return.",
      actions: [
        { screen: "Dashboard > Zones", action: "Lifts Zone 2 evacuation order. Posts to all Zone 2 users: \u201CYou may return. Use caution.\u201D" },
        { screen: "Dashboard > Zones", action: "Zone 3: escorted access only. Creates time slot registration system for residents to visit their properties." },
        { screen: "Dashboard > Routes", action: "Defines escorted access routes through Zone 3. Staffs checkpoints with officers." },
        { screen: "Dashboard > Alerts", action: "Posts: \u201CZone 3 escorted access begins Saturday 9 AM. Register for time slot via Beacon.\u201D" },
      ],
      needs: [
        "Zone status management (active evacuation, escorted access, cleared)",
        "Time slot registration system for escorted zone access",
        "Checkpoint staffing coordination",
      ],
      gives: [
        "Clear return authorization information for residents",
        "Organized, safe property access for displaced residents",
      ],
    },
    {
      time: "T+3 days to T+14 days", title: "Phase 7: Recovery Support",
      context: "Torres supports ongoing security for the burn zone, participates in damage assessment escorts, and assists with the after-action review. His Beacon data on evacuation compliance and timeline becomes part of the official record.",
      actions: [
        { screen: "Dashboard > Map", action: "Maintains security perimeter around damaged areas. Coordinates access for insurance adjusters and debris removal." },
        { screen: "Dashboard > After-Action", action: "Exports evacuation timeline data: response rates, compliance rates, timeline from warning to completion." },
        { screen: "Dashboard > Comms", action: "Participates in multi-agency after-action review with fire, EM, utilities, and schools." },
      ],
      needs: ["Evacuation compliance analytics for after-action review", "Data export for official reports"],
      gives: ["Security coordination for recovery operations", "Evacuation performance data for future planning"],
    },
    {
      time: "T+14 days onward", title: "Phase 8: Preparedness",
      context: "Torres works with EM to update evacuation zone templates based on lessons learned. Updates pre-staged patrol positions. Advocates for increased Beacon adoption among residents who didn\u2019t have accounts during the fire.",
      actions: [
        { screen: "Dashboard > Zones", action: "Updates pre-drawn evacuation zone templates based on actual fire behavior and road performance." },
        { screen: "Dashboard > Routes", action: "Updates alternate evacuation routes based on what actually worked during the event." },
        { screen: "Teams > Sheriff (Announce)", action: "Posts lessons learned for deputies: what went well, what to improve for next event." },
      ],
      needs: ["Evacuation zone template versioning", "Route performance analytics"],
      gives: ["Updated evacuation plans for future events", "Institutional knowledge preservation"],
    },
  ],
  requirements: [
    { section: "Evacuation Management", items: [
      "One-tap zone activation with warning/mandatory/lift status levels",
      "Real-time evacuation confirmation dashboard (evacuating, staying, no response)",
      "Next-of-kin form collection embedded in Action Required cards",
      "Non-responsive user flagging with vulnerability profile data (elderly, disabled, no vehicle)",
      "Cross-referencing between evacuation confirmation, shelter check-in, and missing reports",
      "Refusal documentation workflow",
      "Progressive zone escalation (warning to mandatory)",
      "Phased return management with zone status levels",
      "Time slot registration for escorted access",
    ]},
    { section: "Public Safety Dispatch", items: [
      "Category 1 welfare check dispatch to volunteers",
      "Category 2 evacuation confirmation dispatch to volunteers",
      "Missing persons tracker with family intake and notification",
      "SAR coordination with safe corridor mapping from fire IC",
    ]},
    { section: "Route and Traffic Management", items: [
      "Evacuation route definition with primary/alternate designation",
      "Road closure marking with automatic rerouting for evacuees",
      "Real-time traffic monitoring on evacuation routes",
      "Checkpoint staffing coordination",
      "Shelter capacity publication with services listed",
    ]},
  ],
},

// ─── 3. COUNTY EMERGENCY MANAGER ───
{
  name: "County Emergency Manager",
  icon: "\uD83C\uDFDB\uFE0F",
  filename: "03_county_emergency_manager",
  subtitle: "Coordinating the multi-agency response and long-term recovery",
  bio: [
    "Director Lisa Park, Riverside County Office of Emergency Services",
    "15 years in emergency management. County\u2019s top civilian EM authority.",
    "Beacon Dashboard user (paid client, government tier).",
    "Primary focus: multi-agency coordination, resource allocation, public communication, recovery.",
  ],
  phases: [
    { time: "T+0 to T+15 min", title: "Phase 1: Detection",
      context: "Director Park receives the clustered fire sighting alert. She monitors the situation from her office, assessing whether this will escalate to an event requiring emergency protocol activation.",
      emotional: "Watchful. Assessing scale. Reviewing the county\u2019s readiness posture.",
      actions: [
        { screen: "Push Notification", action: "Receives Beacon alert: multiple fire sightings in NE hills." },
        { screen: "Feed + Map", action: "Reviews crowdsourced reports. Checks wind conditions. Assesses escalation potential." },
        { screen: "Dashboard > Resources", action: "Reviews county resource availability: shelters, Red Cross contacts, mutual aid agreements." },
      ],
      needs: ["Escalation potential assessment from crowdsourced data density and wind conditions"],
      gives: ["Pre-staging awareness for shelters and resources"],
    },
    { time: "T+15 min to T+45 min", title: "Phase 2: Confirmation & Escalation",
      context: "Fire confirmed. Park activates the official Beacon event protocol, which opens emergency channels for all verified teams in the county. She pushes the first official awareness alert to citizens and begins multi-agency coordination.",
      emotional: "Decisive. This is what she trained for. Activating the playbook.",
      actions: [
        { screen: "Dashboard > Events", action: "Activates official event protocol: \u201CNE Hills Brush Fire.\u201D Triggers emergency channel access for all verified teams countywide." },
        { screen: "Dashboard > Alerts", action: "Pushes awareness alert to 5-mile radius: \u201CConfirmed brush fire. No evacuation orders yet. Prepare go bags.\u201D" },
        { screen: "Dashboard > Comms", action: "Opens unified coordination channel with fire IC, sheriff, utility reps, school district, and Red Cross." },
        { screen: "Dashboard > Map", action: "Reviews wind model overlay. Identifies Zone 3 residential in projected fire path within 90 minutes." },
        { screen: "Dashboard > Resources", action: "Activates shelter pre-staging at Convention Center. Contacts Red Cross for shelter management team." },
      ],
      needs: ["One-click event protocol activation that opens emergency channels for all verified teams",
              "Geofenced alert push with radius control", "Wind model overlay for threat assessment"],
      gives: ["Emergency channel activation for all verified teams", "First official public alert", "Multi-agency coordination hub"],
    },
    { time: "T+45 min to T+2 hours", title: "Phase 3: Evacuation Operations",
      context: "Park oversees the multi-agency response from the Emergency Operations Center. She manages shelter activation, coordinates with Red Cross and FEMA, and pushes public information updates.",
      emotional: "Orchestrating. Managing a dozen conversations simultaneously. Every agency needs something from her.",
      actions: [
        { screen: "Dashboard > Shelter", action: "Convention Center officially opened as evacuation shelter. Enters capacity (500), services (meals, pets, medical), and location on map." },
        { screen: "Dashboard > Comms", action: "Coordinates with Red Cross: shelter staffing, supplies, and cot delivery." },
        { screen: "Dashboard > Alerts", action: "Pushes shelter information: \u201CConvention Center open. Pet-friendly. Medical staff. Meals provided.\u201D" },
        { screen: "Dashboard > Intelligence", action: "Monitors aggregated data: evacuation compliance rates, road conditions, resource deployment." },
        { screen: "Dashboard > Comms", action: "Contacts FEMA regional office: \u201CWe may need a presidential disaster declaration. 4,000 homes threatened.\u201D" },
        { screen: "Dashboard > Comms", action: "Briefs state OES on situation. Requests state fire management assistance." },
      ],
      needs: ["Shelter management with capacity tracking and services inventory",
              "Aggregated situational dashboard showing all agencies' data in one view",
              "External agency contact management (Red Cross, FEMA, state OES)"],
      gives: ["Shelter information for all users", "Resource coordination across agencies", "State and federal notification"],
    },
    { time: "T+2 hours to T+6 hours", title: "Phase 4: Active Emergency",
      context: "Full-scale operations. Park manages shelter overflow by opening a second site. Coordinates mutual aid, monitors evacuation compliance, and manages public communications.",
      emotional: "Intensely focused. Managing information overload. Prioritizing decisions.",
      actions: [
        { screen: "Dashboard > Shelter", action: "Convention Center at 60% capacity. Opens second shelter at Riverside High School gym." },
        { screen: "Dashboard > Comms", action: "Coordinates with Red Cross, FEMA, state OES, utility, school district simultaneously." },
        { screen: "Dashboard > Alerts", action: "Pushes updates: second shelter location, road condition changes, fire progression summary." },
        { screen: "Dashboard > Intelligence", action: "Reviews aggregated data: 3,200 evacuated, 47 staying, 14 unconfirmed. Resource utilization 85%." },
        { screen: "Dashboard > Resources", action: "Requests additional ambulances staged at shelter. Medical needs higher than anticipated." },
      ],
      needs: ["Multi-shelter management dashboard", "Aggregated intelligence view across all agencies", "Resource request fulfillment tracking"],
      gives: ["Public information updates", "Resource coordination", "Situational overview for all agencies"],
    },
    { time: "T+6h to T+24h", title: "Phase 5: Accountability",
      context: "Immediate threat subsiding. Park activates the missing persons tracker, coordinates SAR operations, and begins planning for damage assessment and recovery.",
      emotional: "Transitioning from response to recovery mindset. Worried about accountability. Starting to think about the weeks ahead.",
      actions: [
        { screen: "Dashboard > Intelligence", action: "Reviews accountability data: 14 still \u201CNo Response.\u201D Coordinates with sheriff on SAR priorities." },
        { screen: "Dashboard > Missing Persons", action: "Activates missing persons module. 4 family reports received. Cross-references all data sources." },
        { screen: "Dashboard > Alerts", action: "Pushes: \u201CFire 40% contained. Evacuation orders remain in effect. All residents accounted for.\u201D" },
        { screen: "Dashboard > Comms", action: "Contacts FEMA: requests preliminary damage assessment team. 23 homes destroyed." },
        { screen: "Dashboard > Recovery (Plan)", action: "Begins drafting phased return plan, damage assessment schedule, and recovery resource directory." },
      ],
      needs: ["Missing persons coordination module", "Recovery planning tools", "FEMA coordination workflow"],
      gives: ["Accountability status for public", "Federal disaster assistance request", "Recovery plan draft"],
    },
    { time: "T+24h to T+72h", title: "Phase 6: Stabilization",
      context: "Park coordinates FEMA preliminary damage assessment, manages phased return, closes shelters as residents go home or find temporary housing, and builds the recovery resource hub.",
      emotional: "Steady. The worst is over. Now the long work of recovery begins.",
      actions: [
        { screen: "Dashboard > Damage", action: "Coordinates FEMA PDA teams. Maps every damaged structure with status." },
        { screen: "Dashboard > Zones", action: "Approves Zone 2 return. Works with fire IC and sheriff on Zone 3 escorted access timeline." },
        { screen: "Dashboard > Shelter", action: "Convention Center population down to 180. Riverside High closed. Coordinates temporary housing for remaining displaced." },
        { screen: "Dashboard > Alerts", action: "Pushes phased return plan, debris removal schedule, hazardous materials warnings." },
        { screen: "Dashboard > Recovery", action: "Publishes recovery resource hub: FEMA registration, SBA loans, insurance contacts, mental health hotlines." },
      ],
      needs: ["Damage assessment coordination with FEMA", "Recovery resource hub builder", "Shelter drawdown management"],
      gives: ["Damage assessment data", "Recovery resources for displaced residents", "Phased return authorization"],
    },
    { time: "T+3d to T+14d", title: "Phase 7: Recovery Phase 1",
      context: "Park manages the full recovery operation: debris removal, utility restoration coordination, school reopening, and community support programs.",
      actions: [
        { screen: "Dashboard > Recovery", action: "Coordinates debris removal schedule. Hazardous materials assessment for Zone 3." },
        { screen: "Dashboard > Comms", action: "Works with school district on reopening timeline. Lincoln Elementary needs air quality clearance." },
        { screen: "Dashboard > Recovery", action: "Updates resource hub with new grant opportunities, updated FEMA status, donation coordination." },
        { screen: "Dashboard > Map", action: "Damage assessment complete: 23 destroyed, 8 major, 15 minor. Published as map layer for all users." },
      ],
      needs: ["Debris removal scheduling and coordination", "Recovery resource hub with live updates"],
      gives: ["Recovery coordination across all agencies", "Public resource directory"],
    },
    { time: "T+14d onward", title: "Phase 8: Long-Term Recovery",
      context: "Park leads the after-action review, coordinates with city council on rebuilding, advocates for updated building codes and defensible space requirements, and plans for increased Beacon adoption.",
      actions: [
        { screen: "Dashboard > After-Action", action: "Comprehensive after-action review. Exports Beacon data for all agencies. Identifies 14 improvement areas." },
        { screen: "Dashboard > Comms", action: "Coordinates with city council: updated building codes, defensible space requirements, Beacon expansion." },
        { screen: "Dashboard > Alerts", action: "Pushes updated preparedness guidance based on lessons learned." },
        { screen: "Dashboard > Recovery", action: "Maintains recovery resource hub as a living document. Updates as new grants, programs, and rebuilding resources emerge." },
      ],
      needs: ["Comprehensive after-action data export and analytics", "Long-term recovery resource management"],
      gives: ["Institutional improvement recommendations", "Updated preparedness for the community"],
    },
  ],
  requirements: [
    { section: "Event Management", items: ["One-click event protocol activation", "Multi-agency emergency communication channel", "Geofenced alert push with configurable radius", "Event log and timeline for after-action review"]},
    { section: "Shelter Management", items: ["Multi-shelter dashboard with capacity tracking", "Services inventory per shelter", "Shelter drawdown and closure management", "Temporary housing coordination"]},
    { section: "Intelligence & Recovery", items: ["Aggregated situational dashboard across all agencies", "Missing persons module", "FEMA damage assessment coordination", "Recovery resource hub builder with live updates", "Debris removal scheduling", "After-action analytics and data export"]},
  ],
},

// ─── 4. PARAMEDIC/EMT ───
{
  name: "Paramedic / EMT",
  icon: "\uD83D\uDE91",
  filename: "04_paramedic_emt",
  subtitle: "Emergency medical responder providing care during evacuation and at shelters",
  bio: [
    "Paramedic Chris Reeves, Riverside County EMS",
    "8 years experience. Assigned to evacuation medical support.",
    "Beacon Dashboard user (paid client, EMS tier).",
    "Primary focus: medical emergencies during evacuation, shelter medical support, triage.",
  ],
  phases: [
    { time: "T+0 to T+15 min", title: "Phase 1: Detection",
      context: "Reeves is on duty at Station 2 when fire reports appear. He preps the ambulance and reviews the Beacon map for likely medical staging areas.",
      emotional: "Preparing. Checking supplies. Mental triage checklist running.",
      actions: [
        { screen: "Push Notification", action: "Receives fire sighting cluster alert." },
        { screen: "Map", action: "Reviews fire location. Identifies likely medical staging if evacuation happens: Highway 91 corridor." },
        { screen: "Teams > EMS (Chat)", action: "Coordinates with dispatch: \u201CShould we pre-stage at Highway 91?\u201D" },
      ],
      needs: ["Fire location relative to likely medical staging areas"],
      gives: ["EMS readiness status"],
    },
    { time: "T+15 min to T+45 min", title: "Phase 2: Confirmation & Escalation",
      context: "Fire confirmed. Reeves deploys to the Highway 91 medical staging area. He monitors for incoming medical calls from the evacuation zone.",
      emotional: "Staged and ready. Watching the evacuation build. Waiting for the first call.",
      actions: [
        { screen: "Dashboard > Map", action: "Reviews fire perimeter and evacuation zones. Identifies his coverage area." },
        { screen: "Dashboard > Comms", action: "Joins emergency channel. Monitors for medical dispatch." },
        { screen: "Dashboard > Resources", action: "Logs ambulance position at Highway 91 staging. Available for dispatch." },
        { screen: "Teams > EMS (Tasks)", action: "Accepts standby assignment at Highway 91." },
      ],
      needs: ["Medical staging area designation on the map", "Emergency channel access for dispatch"],
      gives: ["Ambulance position visible to all coordinators", "Medical resource availability"],
    },
    { time: "T+45 min to T+2 hours", title: "Phase 3: Evacuation Operations",
      context: "First medical call: smoke inhalation case on Cedar Ave. Reeves checks the route accessibility model. Route is passable but conditions are deteriorating. He responds, treats the patient, and transports to a hospital outside the zone.",
      emotional: "Adrenaline. Running toward the danger. Route planning is critical\u2014can\u2019t get stuck.",
      actions: [
        { screen: "Dashboard > Dispatch", action: "Receives medical dispatch: smoke inhalation, Cedar Ave. Woman with asthma having severe reaction." },
        { screen: "Dashboard > Map", action: "Checks \u201CCan A reach B\u201D model. Route via Elm Ave is accessible. Cedar Ave partially obstructed but passable." },
        { screen: "Teams > EMS (Tasks)", action: "Accepts dispatch. Updates status: \u201CResponding to Cedar Ave. ETA 8 minutes.\u201D" },
        { screen: "Dashboard > Map", action: "En route, marks road conditions: \u201CCedar Ave south of 3rd\u2014heavy smoke, single lane passable.\u201D" },
        { screen: "Dashboard > Map", action: "Patient loaded. Transports to Riverside Community Hospital (outside evacuation zone)." },
        { screen: "Teams > EMS (Tasks)", action: "Updates: \u201CPatient delivered to ER. Returning to staging. Available.\u201D" },
      ],
      needs: [
        "\u201CCan A reach B\u201D route accessibility model for medical dispatch",
        "Road condition updates from other responders and citizens",
        "Quick status updates (responding, on scene, transporting, available)",
        "Hospital locations and status outside the evacuation zone",
      ],
      gives: [
        "Road condition updates from field observation",
        "Medical situation awareness for command",
      ],
    },
    { time: "T+2h to T+6h", title: "Phase 4: Active Emergency",
      context: "Multiple medical calls during active firefighting. Reeves handles 4 calls: burn injury to a firefighter, elderly fall during evacuation, anxiety attack at shelter, and a child\u2019s asthma exacerbation from smoke. He also sets up the shelter medical station.",
      emotional: "In the zone. Rapid patient turnover. The shelter medical station is overwhelming\u2014more patients than expected.",
      actions: [
        { screen: "Dashboard > Dispatch", action: "Burn injury to firefighter at Oak St. Dispatched immediately. Route clear via Highway 91." },
        { screen: "Dashboard > Map", action: "Marks firefighter injury location. Updates: \u201CEngine 12 crew member treated for 2nd degree burns. Transported.\u201D" },
        { screen: "Dashboard > Dispatch", action: "Elderly resident fell during evacuation at Convention Center parking lot. Responds to shelter." },
        { screen: "Dashboard > Shelter", action: "Sets up medical station at Convention Center. Treats 12 patients in 3 hours: smoke inhalation, anxiety, asthma, minor injuries." },
        { screen: "Dashboard > Comms", action: "Reports to EM: \u201CShelter medical needs higher than anticipated. Request additional ambulance staged here.\u201D" },
      ],
      needs: ["Shelter medical station management", "Patient tracking system", "Resource escalation request capability"],
      gives: ["Medical status reports for command", "Shelter medical capability assessment", "Firefighter injury documentation"],
    },
    { time: "T+6h to T+24h", title: "Phase 5: Containment",
      context: "Overnight. Reeves manages the shelter medical station. Patient volume decreasing. Focus shifts to chronic conditions: medications lost in evacuation, insulin refrigeration, oxygen supplies.",
      emotional: "Tired. The acute emergencies are slowing. Now dealing with the chronic, grinding medical needs of displaced people.",
      actions: [
        { screen: "Dashboard > Shelter", action: "Manages medication list for shelter residents who lost prescriptions. Coordinates with pharmacy." },
        { screen: "Dashboard > Comms", action: "Requests insulin refrigeration unit for 3 diabetic shelter residents." },
        { screen: "Teams > EMS (Announce)", action: "Posts medical status report: 28 patients treated, 3 transported, 0 critical. Shelter medical stable." },
      ],
      needs: ["Medication management for shelter residents", "Chronic condition tracking", "Pharmacy coordination"],
      gives: ["Medical status for EM", "Patient care documentation"],
    },
    { time: "T+24h to T+72h", title: "Phase 6: Stabilization",
      context: "Shelter population decreasing. Reeves transitions medical station to volunteer health professionals. Briefs incoming medical teams.",
      actions: [
        { screen: "Dashboard > Shelter", action: "Transitions medical station to Red Cross volunteer doctors. Provides patient handoff." },
        { screen: "Teams > EMS (Tasks)", action: "Completes medical documentation for all patients treated during the event." },
        { screen: "Dashboard > Comms", action: "Briefs incoming medical relief on ongoing patient needs and medication schedules." },
      ],
      needs: ["Medical handoff documentation", "Volunteer medical team coordination"],
      gives: ["Continuity of patient care", "Complete medical record for the event"],
    },
    { time: "T+3d to T+14d", title: "Phase 7: Recovery",
      context: "Reeves returns to normal duty. Participates in after-action medical review. Advocates for better smoke inhalation protocols and shelter medical pre-staging.",
      actions: [
        { screen: "Dashboard > After-Action", action: "Reviews medical response data: response times, patient volumes, resource utilization." },
        { screen: "Teams > EMS (Announce)", action: "Posts lessons learned: need faster shelter medical setup, more respiratory supplies pre-staged." },
      ],
      needs: ["Medical response analytics for after-action review"],
      gives: ["Medical improvement recommendations for future events"],
    },
    { time: "T+14d onward", title: "Phase 8: Preparedness",
      context: "Reeves updates shelter medical pre-staging protocols and participates in community preparedness events, teaching basic first aid.",
      actions: [
        { screen: "Teams > EMS (Board)", action: "Posts updated shelter medical checklist for next event." },
        { screen: "Feed (Public)", action: "Participates in community preparedness post: \u201CWhat to include in your go bag: medications guide.\u201D" },
      ],
      needs: ["Protocol update and distribution system"],
      gives: ["Medical preparedness content for community", "Updated protocols for next event"],
    },
  ],
  requirements: [
    { section: "Medical Dispatch", items: ["\u201CCan A reach B\u201D route model for ambulance dispatch", "Quick status toggle (responding, on scene, transporting, available)", "Road condition reporting while en route", "Hospital status and location outside evacuation zone"]},
    { section: "Shelter Medical", items: ["Shelter medical station management", "Patient tracking and documentation", "Medication management for displaced residents", "Medical resource escalation requests", "Medical handoff documentation for relief teams"]},
  ],
},

// ─── 5-12 abbreviated for size, full data follows the same pattern ───

// ─── 5. UTILITY REP ───
{
  name: "Utility Representative (Riverside Electric)",
  icon: "\u26A1",
  filename: "05_utility_rep",
  subtitle: "Managing power infrastructure during wildfire threat and restoration after",
  bio: ["Dan Mitchell, Field Operations Manager, Riverside Electric", "10 years at the utility. Manages power shutoff and restoration.", "Beacon Dashboard user (paid client, utility enterprise tier).", "Primary focus: de-energization safety, infrastructure protection, rapid restoration."],
  phases: [
    { time: "T+0 to T+15 min", title: "Phase 1: Detection",
      context: "Mitchell sees fire reports and checks power infrastructure in the area. Three transmission lines cross the NE hills.",
      emotional: "Calculating. Which lines are at risk? When do we need to de-energize?",
      actions: [
        { screen: "Push Notification", action: "Receives fire sighting alert. Checks Beacon for location." },
        { screen: "Dashboard > Map", action: "Overlays fire sighting cluster on utility infrastructure map. 3 transmission lines in the area." },
        { screen: "Dashboard > Crews", action: "Pre-alerts field crews for possible emergency deployment." },
      ],
      needs: ["Fire location relative to power infrastructure overlay"], gives: ["Early infrastructure risk assessment"],
    },
    { time: "T+15 min to T+45 min", title: "Phase 2: Confirmation & Escalation",
      context: "Fire confirmed and wind-driven toward the transmission lines. Mitchell joins the emergency channel and coordinates de-energization timing with the fire IC.",
      actions: [
        { screen: "Dashboard > Comms", action: "Joins emergency coordination channel. Briefs: \u201C3 transmission lines in projected fire path.\u201D" },
        { screen: "Dashboard > Map", action: "Marks at-risk infrastructure on the shared map. Lines TL-4, TL-7, and TL-12." },
        { screen: "Dashboard > Alerts", action: "Posts to Infrastructure layer: \u201CPossible power shutoff in Zone 3 if fire approaches lines.\u201D" },
        { screen: "Dashboard > Crews", action: "Pre-stages repair crews at the substation serving NE residential." },
      ],
      needs: ["Emergency channel access for coordination with fire IC", "Infrastructure overlay on shared map"],
      gives: ["Power infrastructure risk information for all responders", "Pre-staging for rapid restoration"],
    },
    { time: "T+45 min to T+2 hours", title: "Phase 3: De-Energization",
      context: "Fire approaching transmission lines. Fire IC requests de-energization for crew safety. Mitchell coordinates the shutoff, notifies all affected customers through Beacon, and pulls field crews back from the danger zone.",
      emotional: "Heavy responsibility. De-energizing means thousands of people lose power, including those still evacuating. But energized lines near a fire kill people.",
      actions: [
        { screen: "Dashboard > Comms", action: "Fire IC: \u201CDe-energize TL-4 and TL-7 now. My crews are working near those lines.\u201D Mitchell confirms." },
        { screen: "Dashboard > Alerts", action: "Pushes to all Zone 3 users: \u201CPower shutoff imminent. Charge devices NOW. Backup power recommended.\u201D" },
        { screen: "Dashboard > Outage", action: "Executes de-energization of TL-4 and TL-7. Updates outage map layer in real-time. 3,400 customers affected." },
        { screen: "Dashboard > Crews", action: "Pulls all field crews out of Zone 3. Safety first." },
        { screen: "Dashboard > Map", action: "Marks de-energized areas on the shared map. Visible to all users and responders." },
        { screen: "Dashboard > Alerts", action: "Posts timeline: \u201CPower shutoff will remain until fire passes. Estimated restoration: 24-48 hours after clearance.\u201D" },
      ],
      needs: ["Outage map layer with real-time update capability", "Customer notification system for de-energization", "Crew safety management and pull-back coordination"],
      gives: ["De-energized area information for firefighter safety", "Customer notification of shutoff", "Restoration timeline estimate"],
    },
    { time: "T+2h to T+6h", title: "Phase 4: Active Emergency",
      context: "Zone 3 fully de-energized. Mitchell monitors from outside the zone. Fire damages 4 power poles and 1 transformer. He logs infrastructure damage for the repair queue.",
      actions: [
        { screen: "Dashboard > Outage", action: "Monitors de-energized zone. No changes\u2014everything stays off until fire passes." },
        { screen: "Dashboard > Comms", action: "Fire IC reports: power pole down and burning at Cedar Ave and 5th. Mitchell marks on map and adds to repair queue." },
        { screen: "Dashboard > Repair Queue", action: "Logs: 4 poles down, 1 transformer destroyed. Estimates repair materials needed." },
        { screen: "Dashboard > Alerts", action: "Updates customers: \u201CZone 3 power off until further notice. Infrastructure damage confirmed.\u201D" },
      ],
      needs: ["Infrastructure damage logging from field reports", "Repair queue and materials estimation"],
      gives: ["Infrastructure damage map layer", "Customer updates"],
    },
    { time: "T+6h to T+24h", title: "Phase 5: Assessment",
      context: "Fire partially contained. Mitchell sends assessment crews into cooled areas to catalog damage. 4 poles, 1 transformer, 2 spans of conductor. Orders replacement materials.",
      actions: [
        { screen: "Dashboard > Repair Queue", action: "Assessment crews report: 4 poles, 1 transformer, 2 conductor spans, 12 service drops damaged. Total rebuild needed for Cedar Ave corridor." },
        { screen: "Dashboard > Crews", action: "Orders replacement materials from regional warehouse. ETA 18 hours." },
        { screen: "Dashboard > Alerts", action: "Updates: \u201CZone 3 restoration estimate: Zone 2 by 6 PM tomorrow. Zone 3 corridor: 48-72 hours.\u201D" },
      ],
      needs: ["Damage assessment workflow for field crews", "Materials ordering integration"], gives: ["Detailed restoration timeline for residents and EM"],
    },
    { time: "T+24h to T+72h", title: "Phase 6: Restoration",
      context: "Mitchell leads the restoration effort. Zone 2 comes back online first. Zone 3 corridor requires rebuild. He updates the outage map block by block as power returns.",
      emotional: "Pride in the crew. They\u2019re working 16-hour shifts to get people back online.",
      actions: [
        { screen: "Dashboard > Outage", action: "Zone 2 restored at 4:30 PM. Updates outage map\u2014blocks turn green as power returns." },
        { screen: "Dashboard > Alerts", action: "Posts: \u201CZone 2 power restored. Zone 3: crews working. Progress visible on Beacon map.\u201D" },
        { screen: "Dashboard > Repair Queue", action: "Zone 3 Cedar Ave corridor: poles set, transformer installed, conductor strung. Energization test tomorrow." },
        { screen: "Dashboard > Map", action: "Real-time restoration map visible to all residents\u2014they can see their block status." },
      ],
      needs: ["Block-by-block restoration progress mapping", "Customer notification per restoration zone"],
      gives: ["Real-time restoration visibility for residents (seeing their block turn green)", "Progress reporting to EM"],
    },
    { time: "T+3d to T+14d", title: "Phase 7: Completion",
      context: "Full restoration complete. Mitchell exports event data for regulatory reporting and participates in after-action review.",
      actions: [
        { screen: "Dashboard > Outage", action: "All customers restored. Final zone energized at 72 hours." },
        { screen: "Dashboard > After-Action", action: "Exports: outage duration per customer, response times, materials used, crew hours. Required for regulatory reporting." },
      ],
      needs: ["Regulatory data export for utility commission reporting"], gives: ["Complete restoration", "Event data for future planning"],
    },
    { time: "T+14d onward", title: "Phase 8: Hardening",
      context: "Mitchell advocates for infrastructure hardening: undergrounding lines in the WUI zone, fire-resistant poles, and automated sectionalizing.",
      actions: [
        { screen: "Dashboard > Map", action: "Uses fire event data to identify infrastructure hardening priorities." },
        { screen: "Dashboard > Alerts", action: "Posts public information on infrastructure improvements planned for fire season." },
      ],
      needs: ["Event data analytics for infrastructure investment planning"], gives: ["Infrastructure improvement plan for the community"],
    },
  ],
  requirements: [
    { section: "Utility Dashboard", items: ["Power infrastructure overlay on shared emergency map", "De-energization execution and outage map with real-time updates", "Block-by-block restoration progress visible to all users", "Repair queue with materials estimation and ordering", "Customer notification system for shutoff, updates, and restoration", "Regulatory data export for commission reporting"]},
  ],
},

// ─── 6. SCHOOL PRINCIPAL ───
{
  name: "School Principal",
  icon: "\uD83C\uDFEB",
  filename: "06_school_principal",
  subtitle: "Responsible for student safety and parent communication during the emergency",
  bio: ["Principal Angela Foster, Lincoln Elementary School", "Zone 2 location, 320 students. After-school program had 45 students when fire started.", "Beacon special designation (School Principal tier).", "Primary focus: student safety, parent communication, school evacuation, reopening."],
  phases: [
    { time: "T+0 to T+15 min", title: "Phase 1: Detection",
      context: "Foster sees the smoke reports on Beacon. Smoke faintly visible from campus but fire is 2.5 miles away. 45 kids in after-school program. She decides to notify parents proactively.",
      emotional: "Protective instinct. 45 children in her care. Parents will be panicking.",
      actions: [
        { screen: "Push Notification", action: "Receives fire sighting alert. Steps outside\u2014can see faint haze from NE." },
        { screen: "Feed + Map", action: "Reviews reports. Fire is 2.5 miles NE. School is not in immediate danger but monitoring." },
        { screen: "Teams > School (Announce)", action: "Posts: \u201CWe are aware of smoke reports NE of campus. All students safe. After-school programs continuing. Monitoring.\u201D" },
        { screen: "Dashboard (Special)", action: "Checks student roster. 45 students in after-school program. Identifies parent contact info." },
      ],
      needs: ["Quick school announcement push to all parent followers", "Student roster with parent contact information"],
      gives: ["Proactive parent communication reducing anxiety calls"],
    },
    { time: "T+15 min to T+45 min", title: "Phase 2: Confirmation & Escalation",
      context: "Fire confirmed and growing. Smoke now clearly visible from campus. Foster decides to end after-school programs immediately and send a pickup alert to all parents.",
      emotional: "Escalating concern. Making the call to release students early. Parents are flooding in.",
      actions: [
        { screen: "Push Notification", action: "Receives official fire confirmation alert from county EM." },
        { screen: "Teams > School (Announce)", action: "URGENT: \u201CFire confirmed 2 miles NE. After-school programs ending immediately. All parents: pick up children NOW.\u201D" },
        { screen: "Dashboard (Special)", action: "Triggers auto-pickup alert to all 45 after-school parents via Beacon push notification." },
        { screen: "Dashboard (Special)", action: "Monitors parent arrival. Tracks which students have been picked up. 30 picked up within 20 minutes." },
        { screen: "Timeline", action: "Monitors official channels for any evacuation order affecting Zone 2 (school\u2019s zone)." },
      ],
      needs: ["Auto-alert push to all parents of students currently on campus", "Student pickup tracking dashboard", "Zone-specific alert monitoring"],
      gives: ["Parent notification and pickup coordination", "Student status for EM"],
    },
    { time: "T+45 min to T+2 hours", title: "Phase 3: School Evacuation",
      context: "Zone 2 receives an evacuation warning. Foster initiates school evacuation. Buses transport remaining students to the Convention Center shelter. 8 students\u2019 parents are unreachable.",
      emotional: "Highest stress. Responsible for every child. The 8 unreachable parents are terrifying.",
      actions: [
        { screen: "Timeline", action: "Receives Zone 2 evacuation warning. School must evacuate." },
        { screen: "Teams > School (Announce)", action: "\u201CSchool evacuation underway. Buses departing to Convention Center. All remaining parents: pick up at shelter.\u201D" },
        { screen: "Dashboard (Special)", action: "Initiates school evacuation protocol. 15 students on buses, 8 parents unreachable." },
        { screen: "Dashboard > Comms", action: "Contacts 8 unreachable parents via Beacon. 6 respond (were driving, in zones with poor signal). 2 still unreachable." },
        { screen: "Dashboard > Comms", action: "Flags 2 unreachable parents to county EM for follow-up. Both students transported to shelter under school care." },
        { screen: "Dashboard (Special)", action: "Final check: all 45 students accounted for. 30 with parents, 15 transported to shelter. 0 unaccounted." },
      ],
      needs: ["School evacuation protocol activation", "Bus tracking to shelter", "Parent contact system with escalation for unreachable parents", "Student accountability (all accounted, with parent, on bus, at shelter)"],
      gives: ["Student accountability data for EM", "Parent communication reducing 911 calls about children"],
    },
    { time: "T+2h to T+6h", title: "Phase 4: At Shelter",
      context: "Foster is at the Convention Center with 15 students awaiting parent pickup. She manages student supervision and coordinates with EM for any special needs.",
      actions: [
        { screen: "Dashboard (Special)", action: "Monitors: 10 parents have arrived at shelter for pickup. 5 students remaining." },
        { screen: "Teams > School (Announce)", action: "\u201C5 students still at Convention Center. Parents: we are in the gym area.\u201D" },
        { screen: "Dashboard > Comms", action: "2 unreachable parents finally respond. Both stuck in traffic. ETA 90 minutes. Students safe." },
        { screen: "Dashboard (Special)", action: "All 45 students accounted for with parents by 10 PM." },
      ],
      needs: ["Shelter-based student tracking", "Parent communication from shelter"], gives: ["Complete student accountability"],
    },
    { time: "T+6h to T+72h", title: "Phases 5-6: Assessment",
      context: "Foster assesses school damage (minimal\u2014Zone 2 was spared), coordinates with the district and county EM on air quality testing, and plans reopening.",
      actions: [
        { screen: "Dashboard (Special)", action: "School facility inspection: minimal damage. Smoke residue on outdoor surfaces." },
        { screen: "Dashboard > Comms", action: "Coordinates air quality testing with county health department. Results due tomorrow." },
        { screen: "Teams > School (Announce)", action: "\u201CSchool closed Monday and Tuesday for air quality assessment and deep cleaning.\u201D" },
      ],
      needs: ["Facility status reporting", "Air quality coordination"], gives: ["School status for parents and community"],
    },
    { time: "T+3d to T+14d", title: "Phase 7: Reopening",
      context: "Air quality cleared. School reopens with counselors available. Foster coordinates support for 3 displaced families whose children attend Lincoln Elementary.",
      emotional: "Relief and care. Focused on the children\u2019s emotional recovery.",
      actions: [
        { screen: "Teams > School (Announce)", action: "\u201CLincoln Elementary reopens Wednesday. Counselors available. Normal schedule.\u201D" },
        { screen: "Teams > School (Board)", action: "Posts resource list: school supply replacements for displaced families, free lunch enrollment, tutoring available." },
        { screen: "Dashboard (Special)", action: "Updates roster: 3 families relocated out of district. Coordinates transfer paperwork." },
      ],
      needs: ["Parent resource posting capability", "Roster management for displaced families"],
      gives: ["School reopening information for community", "Support resources for displaced families"],
    },
    { time: "T+14d onward", title: "Phase 8: Preparedness",
      context: "Foster updates the school\u2019s emergency plan based on lessons learned and runs an improved evacuation drill.",
      actions: [
        { screen: "Teams > School (Announce)", action: "Posts updated school emergency plan. Announces drill scheduled for next month." },
        { screen: "Dashboard (Special)", action: "Updates parent contact information for 12 families whose info was outdated during the event." },
      ],
      needs: ["Emergency plan distribution via Beacon"], gives: ["Updated preparedness for the school community"],
    },
  ],
  requirements: [
    { section: "School Principal Special Dashboard", items: ["Student roster with parent contact information and pickup tracking", "Auto-alert push to parents of on-campus students", "School evacuation protocol activation with bus tracking", "Parent reachability tracking with escalation to EM for unreachable", "Student accountability dashboard (with parent, on bus, at shelter, unaccounted)", "Air quality coordination workflow", "Resource posting for displaced families"]},
  ],
},

];

// ─── GENERATE ───
async function generateAll() {
  // Generate remaining simpler users inline
  const additionalUsers = [
    {
      name: "Road Crew Lead",
      icon: "\uD83D\uDEA7",
      filename: "07_road_crew_lead",
      subtitle: "Clearing hazards and maintaining evacuation routes",
      bio: ["Foreman Rick Santos, Riverside Public Works", "Manages road maintenance and emergency debris clearance.", "Beacon Dashboard user (paid client, public works tier).", "Primary focus: keeping evacuation routes open, clearing hazards, road status updates."],
      phases: [
        { time: "T+0 to T+45 min", title: "Phases 1-2: Standby",
          context: "Santos monitors the developing situation. Pre-stages chainsaw crew and heavy equipment near likely evacuation routes.",
          actions: [
            { screen: "Push Notification", action: "Receives fire and emergency event alerts." },
            { screen: "Dashboard > Map", action: "Reviews evacuation routes. Identifies vulnerable points: narrow roads, overhanging trees, known problem areas." },
            { screen: "Dashboard > Resources", action: "Pre-stages chainsaw crew and loader at the public works yard nearest Zone 3." },
          ],
          needs: ["Evacuation route overlay for hazard assessment"], gives: ["Pre-staged road clearance resources"],
        },
        { time: "T+45 min to T+2 hours", title: "Phase 3: Route Clearance",
          context: "Evacuation underway. Fallen tree blocks Oak St\u2014a primary evacuation route. Santos dispatches a chainsaw crew. While they work, a power line is down on Elm Ave. He coordinates with the utility for de-energization before his crew can approach.",
          emotional: "Urgent. Every minute that road is blocked, evacuees are stuck. Lives depend on clearing it fast.",
          actions: [
            { screen: "Dashboard > Map", action: "Receives report: fallen tree blocking Oak St. Marks as road closed on the map. Route auto-updates for all evacuees." },
            { screen: "Teams > Public Works (Tasks)", action: "Assigns chainsaw crew to Oak St. ETA 15 minutes. Updates task with progress." },
            { screen: "Dashboard > Comms", action: "Elm Ave: power line down. Contacts utility rep: \u201CIs Elm Ave de-energized? I need to send a crew.\u201D" },
            { screen: "Dashboard > Map", action: "Oak St tree cleared at T+70 min. Updates road status to OPEN. Evacuation route reactivates for all users." },
            { screen: "Dashboard > Map", action: "Utility confirms Elm Ave de-energized. Crew clears downed line debris. Road reopened." },
          ],
          needs: ["Road closure marking with automatic evacuee rerouting", "Task dispatch system for crews", "Coordination with utility on downed line de-energization"],
          gives: ["Road status updates visible to all evacuees in real-time", "Cleared routes enabling faster evacuation"],
        },
        { time: "T+2h to T+6h", title: "Phase 4: Ongoing Maintenance",
          context: "Multiple hazards as wind pushes debris across roads. Santos manages a rolling set of road clearance tasks across the evacuation zone.",
          actions: [
            { screen: "Dashboard > Map", action: "Monitors citizen road condition reports. 4 new hazards reported by evacuees." },
            { screen: "Teams > Public Works (Tasks)", action: "Prioritizes and assigns clearance tasks by evacuation route importance." },
            { screen: "Dashboard > Map", action: "Updates road status for each cleared hazard. Green/yellow/red visible to all users." },
          ],
          needs: ["Citizen road condition reports integrated into work queue", "Priority-based task assignment"], gives: ["Continuously updated road status layer"],
        },
        { time: "T+6h to T+14d", title: "Phases 5-7: Cleanup & Restoration",
          context: "Post-fire debris removal. Santos manages road reopening through the burn zone as fire crews clear areas.",
          actions: [
            { screen: "Dashboard > Map", action: "Maps road damage in burn zone: 2 roads with melted asphalt, 3 with debris." },
            { screen: "Teams > Public Works (Tasks)", action: "Schedules debris removal and road repair. Coordinates with fire IC on safe access." },
            { screen: "Dashboard > Map", action: "Updates road status as repairs complete. Residents can see which roads are open for return." },
          ],
          needs: ["Road damage assessment mapping", "Repair scheduling integration"], gives: ["Road reopening information for returning residents"],
        },
        { time: "T+14d onward", title: "Phase 8: Preparedness",
          context: "Santos identifies road improvements needed: wider shoulders on evacuation routes, fire-resistant vegetation setbacks.",
          actions: [
            { screen: "Dashboard > After-Action", action: "Reports on road clearance times and bottleneck locations for future planning." },
          ],
          needs: ["Road performance data for capital improvement planning"], gives: ["Infrastructure improvement recommendations"],
        },
      ],
      requirements: [
        { section: "Public Works Features", items: ["Road closure marking with automatic evacuee rerouting", "Road status layer (green/yellow/red) visible to all users", "Task dispatch and crew assignment system", "Citizen road condition reports integrated into work queue", "Coordination channel with utility for downed line safety", "Road damage assessment and repair scheduling"]},
      ],
    },
    {
      name: "Parent with Kids at School",
      icon: "\uD83D\uDC69\u200D\uD83D\uDC67",
      filename: "08_parent",
      subtitle: "A mother navigating evacuation while retrieving her children from school",
      bio: ["Maria Chen, mother of two (ages 7 and 10) at Lincoln Elementary", "Lives in Zone 3. Works 15 minutes from school.", "Beacon free public user (member of Family, Neighborhood, and School teams).", "Primary focus: get kids, get family safe, help neighbors if possible."],
      phases: [
        { time: "T+0 to T+15 min", title: "Phase 1: Detection",
          context: "Maria is at work when smoke alerts start. Her kids are at after-school at Lincoln Elementary. She immediately checks Beacon for information and the school team for any announcements.",
          emotional: "Anxiety spiking. Kids are at school 15 minutes away. Is the fire near them?",
          actions: [
            { screen: "Push Notification", action: "Receives: \u201CMultiple smoke reports near you.\u201D Taps to open Beacon." },
            { screen: "Feed", action: "Reads citizen smoke sighting posts. Fire dept says they\u2019re dispatching. No evacuation yet." },
            { screen: "Map", action: "Checks fire location relative to school (2.5 miles from school) and home (1.5 miles from sightings)." },
            { screen: "Teams > Lincoln Elementary", action: "Checks Announcements. Principal just posted: students safe, monitoring, programs continuing." },
            { screen: "Teams > Family (Chat)", action: "Messages husband: \u201CDid you see the smoke reports? Kids are still at school.\u201D" },
          ],
          needs: ["Quick location assessment: fire vs. school vs. home on the map", "School team announcements for parent peace of mind", "Family messaging"],
          gives: ["Engagement data that helps rank the smoke reports higher in the feed"],
        },
        { time: "T+15 min to T+45 min", title: "Phase 2: Getting the Kids",
          context: "Fire confirmed and growing. School sends pickup alert. Maria leaves work immediately. She\u2019s checking Beacon while driving (passenger mode) for route information and school updates.",
          emotional: "Fear. Driving fast but trying to stay safe. Just wants to hold her kids.",
          actions: [
            { screen: "Push Notification", action: "Receives BOTH official fire alert AND school pickup alert at the same time." },
            { screen: "Timeline", action: "Sees school announcement pinned: \u201CPick up children immediately.\u201D" },
            { screen: "Map", action: "Checks route to school. Direct route goes past the fire area. Reroutes via Highway 91." },
            { screen: "Teams > Family (Chat)", action: "\u201CI\u2019m getting the kids. Start packing the go bags. Load the car.\u201D" },
            { screen: "Teams > Lincoln Elementary (Chat)", action: "Sees other parents confirming they\u2019re coming. 20+ parents posting ETAs." },
          ],
          needs: ["Route to school avoiding fire area", "School pickup status (is my child still there or already picked up?)", "Family coordination messaging"],
          gives: ["School team engagement data"],
        },
        { time: "T+45 min to T+2 hours", title: "Phase 3: Evacuation",
          context: "Maria has the kids. Returns home to grab go bags. Zone 3 evacuation warning arrives as an Action Required card. She responds and follows the evacuation route to the Convention Center shelter.",
          emotional: "Relieved to have the kids. Now scared about the house. Focused on getting to safety.",
          actions: [
            { screen: "Timeline (Action Card)", action: "EVACUATION WARNING for Zone 3. Responds: \u201CEvacuating Now.\u201D" },
            { screen: "Map", action: "Follows Beacon evacuation route. Highway 91 moving. Avoids Oak St (marked closed)." },
            { screen: "Map", action: "Sees shelter location with capacity gauge. Convention Center has space." },
            { screen: "Teams > Family (Chat)", action: "\u201CI have the kids and go bags. Following Highway 91 to Convention Center. Meet us there.\u201D" },
            { screen: "Feed > Report", action: "Reports road conditions while driving: \u201CHighway 91 on-ramp slow but moving. 15 min wait.\u201D" },
            { screen: "Teams > Neighborhood (Chat)", action: "\u201CWe\u2019re evacuating. Has anyone checked on Mr. Henderson on Oak St?\u201D" },
          ],
          needs: ["Action Required card with simple evacuation confirmation", "Real-time evacuation route with closure updates", "Shelter location with capacity info", "Family coordination"],
          gives: ["Evacuation confirmation data for sheriff", "Road condition report from her route", "Neighborly concern that may trigger volunteer action"],
        },
        { time: "T+2h to T+6h", title: "Phase 4: At Shelter",
          context: "Maria and family are at the Convention Center. Kids are scared. She monitors updates, checks on friends, and watches for news about their house.",
          emotional: "Safe but anxious. Kids asking if the house will be okay. Refreshing the Feed constantly.",
          actions: [
            { screen: "Timeline", action: "Monitors fire updates. Sees Cedar Ave mentioned\u2014that\u2019s two streets from home." },
            { screen: "Feed", action: "Reads community posts. Neighbors sharing information. Upvotes helpful reports." },
            { screen: "Teams > Family (Chat)", action: "Updates extended family: \u201CWe\u2019re all safe at Convention Center. House is in Zone 3, don\u2019t know status yet.\u201D" },
            { screen: "Teams > Neighborhood (Chat)", action: "Active chat. \u201CAnyone have eyes on Pine St? Is it still standing?\u201D" },
            { screen: "Help Tab", action: "Sees request for children\u2019s books at shelter. Posts: \u201CI have coloring books in the car. Coming to the kids area.\u201D" },
          ],
          needs: ["Real-time fire updates relative to home address", "Community connection at shelter", "Help coordination for shelter needs"],
          gives: ["Shelter supply sharing", "Community support"],
        },
        { time: "T+6h to T+72h", title: "Phases 5-6: Waiting and Return",
          context: "Fire partially contained. Maria\u2019s street was spared\u2014houses on the next block were not. Zone 2 cleared for return but Zone 3 still restricted. She waits, then returns when Zone 3 opens.",
          emotional: "Survivor\u2019s guilt. Their house is intact. Neighbors lost everything. Wants to help.",
          actions: [
            { screen: "Timeline", action: "Sees damage report: homes destroyed on Cedar Ave (two streets away). Her street not listed. Relief and guilt." },
            { screen: "Timeline", action: "Sees: \u201CZone 3 evacuation order lifted. Use caution.\u201D Returns home." },
            { screen: "Map", action: "Follows return route. Road conditions green. Home is intact but smoky." },
            { screen: "Feed > Report", action: "Reports: \u201CPine St intact. Heavy smoke smell but no damage visible.\u201D" },
            { screen: "Teams > Neighborhood (Board)", action: "Posts: \u201COur house is intact. We have space. Any displaced family needs a place to stay, please reach out.\u201D" },
          ],
          needs: ["Home address status notification", "Return route guidance", "Community help coordination"], gives: ["Condition reports from her street", "Temporary housing offer"],
        },
        { time: "T+3d onward", title: "Phases 7-8: Recovery & Community",
          context: "Maria becomes active in the community recovery effort. She helps organize a supply drive and supports displaced neighbors. The fire brought the neighborhood closer.",
          actions: [
            { screen: "Teams > Neighborhood (Board)", action: "Helps organize supply drive and meal train for displaced families." },
            { screen: "Teams > Neighborhood (Tasks)", action: "Volunteers for Wednesday donation sorting shift." },
            { screen: "Feed", action: "Shares community fundraiser. Engages with recovery posts. Upvotes progress updates." },
            { screen: "Teams > Family (Chat)", action: "Family discusses upgrading their emergency plan. Creates a go-bag checklist as a family task." },
          ],
          needs: ["Community organizing tools (board, tasks)", "Long-term recovery engagement"], gives: ["Volunteer labor", "Housing offer", "Community organizing energy"],
        },
      ],
      requirements: [
        { section: "Public App (Free User)", items: ["Push notifications for fire sightings near user location", "School team announcements visible immediately", "Action Required evacuation confirmation cards on Timeline", "Real-time evacuation route on Map with closure updates", "Shelter locations with capacity gauges", "Family team chat for coordination", "Road condition reporting while evacuating", "Home address status updates (damage assessment results)", "Community help board and task volunteering", "Help tab for shelter supply coordination"]},
      ],
    },
    {
      name: "Elderly Resident (Lives Alone, No Vehicle)",
      icon: "\uD83D\uDC74",
      filename: "09_elderly_resident",
      subtitle: "A vulnerable resident depending on community and technology to evacuate safely",
      bio: ["Robert Henderson, age 78. Lives alone on Oak St in Zone 3.", "No vehicle. Uses a walker. Has a cat named Whiskers.", "Beacon free public user. Adult daughter Sarah set up his account.", "Primary focus: understanding what\u2019s happening, getting help evacuating, staying connected with family."],
      phases: [
        { time: "T+0 to T+15 min", title: "Phase 1: Detection",
          context: "Robert steps outside and sees haze. His Beacon app has smoke report notifications. He\u2019s not sure how serious it is. He messages his daughter.",
          emotional: "Confused and slightly worried. Can see haze but doesn\u2019t know what it means. Relies on the app and his daughter for interpretation.",
          actions: [
            { screen: "Push Notification", action: "Receives: \u201CSmoke reports near you.\u201D" },
            { screen: "Feed", action: "Reads reports. Sees the fire department response: \u201CNo evacuation at this time.\u201D Somewhat reassured." },
            { screen: "Teams > DMs (Daughter)", action: "Messages Sarah: \u201CI see smoke outside. Is everything okay? Should I be worried?\u201D" },
          ],
          needs: ["Simple, clear language in alerts (not jargon)", "Easy messaging to family contacts", "Reassurance from official sources"],
          gives: ["Presence data (he\u2019s in Zone 3 and active on Beacon)"],
        },
        { time: "T+15 min to T+45 min", title: "Phase 2: Growing Concern",
          context: "Fire confirmed. Smoke getting heavier. Robert reads the updates but isn\u2019t sure what to do. His daughter messages back telling him to pack a bag.",
          emotional: "Anxiety building. Smoke getting heavier. Alone. Wants his daughter here.",
          actions: [
            { screen: "Push Notification", action: "Receives official fire confirmation alert." },
            { screen: "Timeline", action: "Reads updates. Sees \u201Cprepare go bags.\u201D Doesn\u2019t have a go bag. Doesn\u2019t know what to pack." },
            { screen: "Teams > DMs (Daughter)", action: "Sarah messages: \u201CDad, pack your medications, Whiskers\u2019 carrier, wallet, and a change of clothes. I\u2019m leaving work.\u201D" },
            { screen: "Feed", action: "Reads community posts. People are already packing cars. He doesn\u2019t have a car." },
          ],
          needs: ["Go-bag guidance accessible from the alert", "Clear instructions for people without vehicles", "Family connection for guidance"],
          gives: ["Activity data showing he\u2019s aware but may need help"],
        },
        { time: "T+45 min to T+2 hours", title: "Phase 3: Getting Help",
          context: "Evacuation warning arrives. Robert responds \u201CNeed Assistance\u201D which triggers a transport help request. A neighbor volunteer picks him up within 20 minutes. He brings Whiskers.",
          emotional: "Scared. The Action Card is asking him to make a choice. He can\u2019t drive. He taps \u201CNeed Assistance\u201D and hopes someone comes.",
          actions: [
            { screen: "Timeline (Action Card)", action: "EVACUATION WARNING. Three options: \u201CEvacuating Now,\u201D \u201CStaying,\u201D \u201CNeed Assistance.\u201D Taps \u201CNeed Assistance.\u201D" },
            { screen: "Timeline (Expanded Form)", action: "System asks: mobility needs (uses walker), number of people (1), pets (cat), location confirmed. Submits." },
            { screen: "Help Tab", action: "Sees his request appear: \u201CTransport Needed: Elderly resident, Oak St, uses walker, 1 cat.\u201D Waiting." },
            { screen: "Help Tab", action: "Notification: \u201CJake (neighbor) has responded to your request. ETA 12 minutes.\u201D Communication bridge opens." },
            { screen: "Help > Bridge", action: "Jake messages: \u201CMr. Henderson, I\u2019m coming with my truck. Be out front with Whiskers.\u201D" },
            { screen: "Teams > DMs (Daughter)", action: "Messages Sarah: \u201CA neighbor is coming to get me. His name is Jake. I have Whiskers.\u201D" },
          ],
          needs: [
            "\u201CNeed Assistance\u201D option on evacuation Action Cards (not just evacuating/staying)",
            "Automatic help request generation from \u201CNeed Assistance\u201D response",
            "Mobility/accessibility profile that pre-fills the request form",
            "Communication bridge between helper and person needing help",
            "ETA notification when someone responds",
            "Large text and clear UI for elderly users",
          ],
          gives: ["Evacuation status data for sheriff", "Help request that mobilizes community"],
        },
        { time: "T+2h to T+6h", title: "Phase 4: At Shelter",
          context: "Robert is at the Convention Center with Whiskers. He\u2019s disoriented in the large facility. He confirms his safety when the wellness check Action Card appears.",
          emotional: "Safe but overwhelmed. Large noisy shelter. Cat is stressed. Grateful to the neighbor who drove him.",
          actions: [
            { screen: "Timeline (Action Card)", action: "Wellness check from county: \u201CAre you safe?\u201D Responds: \u201CI\u2019m Safe.\u201D" },
            { screen: "Teams > DMs (Daughter)", action: "\u201CI\u2019m at Convention Center. Whiskers is with me. A nice man Jake drove me. When can you come?\u201D" },
            { screen: "Feed", action: "Reads updates about the fire. Worried about his house on Oak St." },
          ],
          needs: ["Simple wellness check confirmation", "Family messaging", "Clear shelter information (where is the pet area, where is medical)"],
          gives: ["Safety confirmation reducing SAR workload"],
        },
        { time: "T+6h to T+72h", title: "Phases 5-6: Waiting",
          context: "Robert waits at the shelter, then moves to his daughter\u2019s house. His house on Oak St survived. He returns with his daughter to check on it.",
          actions: [
            { screen: "Timeline", action: "Monitors for news about Oak St. Eventually sees: \u201CDamage assessment: Oak St structures intact.\u201D Relief." },
            { screen: "Teams > DMs (Daughter)", action: "Coordinating with Sarah to stay at her house until Zone 3 is fully cleared." },
            { screen: "Timeline", action: "Sees Zone 3 escorted access announcement. Registers for a time slot with Sarah\u2019s help." },
          ],
          needs: ["Home address damage status notification", "Time slot registration (accessible UI)"],
          gives: ["Reduced welfare check burden once confirmed safe"],
        },
        { time: "T+3d onward", title: "Phases 7-8: Recovery",
          context: "Robert returns home. House is okay but smoky. His daughter helps him clean up. He\u2019s now a vocal advocate for Beacon in his senior community.",
          actions: [
            { screen: "Teams > Neighborhood (Chat)", action: "Posts: \u201CThank you Jake for driving me to safety. This neighborhood saved my life.\u201D" },
            { screen: "Feed", action: "Reads recovery updates. Checks on neighbors who lost homes." },
          ],
          needs: ["Community connection and gratitude expression"], gives: ["Community bonds", "Beacon advocacy in senior community"],
        },
      ],
      requirements: [
        { section: "Accessibility & Vulnerable Population Features", items: ["\u201CNeed Assistance\u201D option on evacuation Action Cards", "Automatic help request generation with pre-filled mobility/accessibility profile", "Communication bridge between volunteer and person needing help", "ETA notification when a helper is on the way", "Large text / accessibility mode for elderly users", "Simple wellness check confirmation (one tap)", "Go-bag guidance linked from alert", "Home address damage status notification", "Pet-friendly shelter information"]},
      ],
    },
    {
      name: "Neighbor Volunteer / Community Organizer",
      icon: "\uD83E\uDD1D",
      filename: "10_neighbor_volunteer",
      subtitle: "From checking on neighbors during evacuation to leading the recovery effort",
      bio: ["Jake Martinez, 34. Lives in Zone 3, Oakridge Neighborhood.", "Has a truck and chainsaw. Registered both in his Beacon equipment profile.", "Beacon free public user (member of Neighborhood, active volunteer).", "Primary focus: helping neighbors evacuate, welfare checks, organizing recovery."],
      phases: [
        { time: "T+0 to T+15 min", title: "Phase 1: Detection",
          context: "Jake sees the smoke reports on his Feed. Immediately thinks about the elderly neighbors on his street.",
          emotional: "Alert and community-minded. Already thinking about who needs help.",
          actions: [
            { screen: "Feed", action: "Reads smoke reports and fire dept response. Starts thinking about neighbors who might need help." },
            { screen: "Teams > Neighborhood (Chat)", action: "Posts: \u201CAnyone else seeing the smoke? Has anyone checked on Mr. Henderson on Oak St?\u201D" },
            { screen: "Map", action: "Checks fire location relative to his street. Close enough to be concerned." },
          ],
          needs: ["Community awareness through neighborhood chat"], gives: ["Early community mobilization"],
        },
        { time: "T+15 min to T+45 min", title: "Phase 2: Preparing to Help",
          context: "Fire confirmed and growing. Jake starts packing his truck: go bag, chainsaw, first aid kit. He\u2019s ready to help people evacuate if needed.",
          actions: [
            { screen: "Feed", action: "Reads official fire confirmation. Starts preparing for evacuation and to help others." },
            { screen: "Teams > Neighborhood (Chat)", action: "\u201CI\u2019m packing the truck. If anyone needs a ride to the shelter, DM me.\u201D" },
            { screen: "Help Tab", action: "Checks for help requests. None yet, but he knows they\u2019re coming." },
          ],
          needs: ["Help tab that surfaces requests early"], gives: ["Proactive help offer in neighborhood chat"],
        },
        { time: "T+45 min to T+2 hours", title: "Phase 3: Evacuation Hero",
          context: "Evacuation ordered. Jake responds \u201CEvacuating Now\u201D but first drives to Mr. Henderson\u2019s house. The Help tab shows Henderson\u2019s transport request. Jake accepts it. He drives Henderson, Whiskers, and two other neighbors to the shelter. Makes three trips total.",
          emotional: "Adrenaline and purpose. This is what neighbors do. Driving through smoke to get people to safety.",
          actions: [
            { screen: "Timeline (Action Card)", action: "Responds \u201CEvacuating Now\u201D to Zone 3 evacuation order." },
            { screen: "Help Tab", action: "Sees: \u201CTransport Needed: Elderly resident, Oak St, uses walker, 1 cat.\u201D Taps \u201CI Can Help.\u201D" },
            { screen: "Help > Bridge", action: "Messages Henderson: \u201CMr. Henderson, I\u2019m coming with my truck. Be out front with Whiskers.\u201D" },
            { screen: "Help Tab", action: "After delivering Henderson, accepts 2 more transport requests. Makes 3 total trips." },
            { screen: "Feed > Report", action: "Reports road conditions while driving: \u201CElm Ave clear. Oak St passable but debris.\u201D" },
            { screen: "Teams > Neighborhood (Board)", action: "Posts: \u201COffering help: I have a truck. Making runs to shelter. DM me.\u201D" },
          ],
          needs: ["Help tab with nearby requests sorted by urgency and distance", "Communication bridge that opens instantly on accepting a request", "Road condition reporting while driving", "Multiple trip tracking (started, completed, returning for more)"],
          gives: ["3 people safely evacuated who wouldn\u2019t have made it alone", "Road condition reports from the field", "Community leadership that inspires others to help"],
        },
        { time: "T+2h to T+6h", title: "Phase 4: Welfare Checks",
          context: "Jake delivered everyone he could. Now at the shelter but volunteers for welfare checks. Drives back toward the zone edge and confirms 3 addresses as evacuated.",
          actions: [
            { screen: "Help Tab", action: "Accepts welfare check tasks from the sheriff\u2019s Help Manager dispatch. 3 addresses to verify." },
            { screen: "Help > Welfare Check", action: "Drives to each address. Confirms: house dark, car gone, no one home. Reports \u201CConfirmed Evacuated\u201D for all 3." },
            { screen: "Feed > Report", action: "Reports road and air conditions while doing checks: \u201CCedar Ave heavy smoke. Use caution.\u201D" },
          ],
          needs: ["Welfare check task acceptance and completion workflow", "Confirmed-evacuated reporting that updates the sheriff\u2019s dashboard"],
          gives: ["3 confirmed-evacuated addresses reducing the unaccounted list", "Field condition intelligence"],
        },
        { time: "T+6h to T+72h", title: "Phases 5-6: Organizing",
          context: "Jake transitions from field volunteer to community organizer. He starts coordinating supply drives, temporary housing offers, and cleanup crews.",
          emotional: "Exhausted but energized. The community came together and he wants to keep that momentum.",
          actions: [
            { screen: "Teams > Neighborhood (Board)", action: "Posts structured supply drive: \u201CDropping off supplies at shelter 10 AM. Who can contribute?\u201D" },
            { screen: "Help Tab > Offer", action: "Posts: \u201COffering spare bedroom for displaced family. Up to 2 months.\u201D" },
            { screen: "Teams > Neighborhood (Tasks)", action: "Creates task list: supply sorting Monday, shelter visits Tuesday, debris help Wednesday." },
            { screen: "Teams > Neighborhood (Announce)", action: "Asks admin to post: \u201CCommunity recovery meeting Thursday 7 PM at library.\u201D" },
          ],
          needs: ["Board post types (supply drive, housing offer, event)", "Task management for volunteer coordination", "Community meeting announcement capability"],
          gives: ["Organized volunteer effort", "Temporary housing", "Community leadership"],
        },
        { time: "T+3d onward", title: "Phases 7-8: Community Leader",
          context: "Jake becomes the de facto neighborhood recovery coordinator. He manages volunteers, tracks displaced families\u2019 needs, and coordinates with the county EM on community input for rebuilding.",
          actions: [
            { screen: "Teams > Neighborhood (Tasks)", action: "Manages ongoing volunteer schedule: meal delivery, cleanup, emotional support visits." },
            { screen: "Teams > Neighborhood (Board)", action: "Maintains living resource directory: FEMA links, grants, donation drives, contractor referrals." },
            { screen: "Feed", action: "Posts weekly community updates: \u201C3 families found permanent housing. 2 rebuild permits approved.\u201D" },
            { screen: "Teams > Neighborhood (Announce)", action: "Monthly community meetings. Posts minutes and action items." },
          ],
          needs: ["Long-term task management that persists for weeks/months", "Resource directory that can be collaboratively edited", "Community update distribution"],
          gives: ["Sustained community recovery coordination", "Beacon engagement that keeps the platform relevant long after the emergency"],
        },
      ],
      requirements: [
        { section: "Volunteer Coordination", items: ["Help tab with urgency/distance sorting", "Communication bridge between volunteer and person in need", "Welfare check task workflow (accept, drive to, confirm, report)", "Multiple trip tracking for transport volunteers", "Road condition reporting while in the field", "Equipment profile matching to help requests"]},
        { section: "Community Organizing", items: ["Board post types: supply drives, housing offers, events, resource directories", "Task management with volunteer sign-up and scheduling", "Community announcement distribution", "Living resource directory with collaborative editing", "Long-term task persistence (weeks/months, not just during emergency)"]},
      ],
    },
    {
      name: "Evacuee / Displaced Resident",
      icon: "\uD83C\uDFE0",
      filename: "11_displaced_resident",
      subtitle: "From evacuation through discovering their home is destroyed to rebuilding their life",
      bio: ["The Patel family: Raj, Priya, and children Anika (12) and Dev (9).", "Lived on Cedar Ave in Zone 3. Home destroyed in the fire.", "Beacon free public users (Family team, Neighborhood team, School following).", "Primary focus: safety, information about their home, recovery resources, rebuilding."],
      phases: [
        { time: "T+0 to T+45 min", title: "Phases 1-2: Awareness",
          context: "The Patels are at home when smoke reports start. They watch the Feed and Timeline as the situation escalates. Raj starts packing the car.",
          emotional: "Growing dread. They live right in the projected fire path. Start grabbing valuables.",
          actions: [
            { screen: "Feed", action: "Reading smoke reports with photos. Fire is close\u2014NE hills are visible from their backyard." },
            { screen: "Map", action: "Fire sighting cluster is less than a mile from Cedar Ave. Wind blowing their direction." },
            { screen: "Teams > Family (Chat)", action: "Raj to Priya: \u201CStart packing the car. Grab the photo albums and the laptop. I\u2019ll get the kids\u2019 stuff.\u201D" },
            { screen: "Timeline", action: "Official fire confirmation. They know it\u2019s real. Start packing urgently." },
          ],
          needs: ["Clear threat proximity information on Map"], gives: ["Engagement data from threatened area"],
        },
        { time: "T+45 min to T+2 hours", title: "Phase 3: Evacuation",
          context: "Evacuation ordered. The Patels grab what they can in 15 minutes: documents, medications, laptops, kids\u2019 favorite stuffed animals, the dog\u2019s leash. They leave Mittens the cat in the carrier but in the chaos forget the hamster cage.",
          emotional: "Panic contained by action. Kids are crying. Priya is grabbing everything she can. Raj is focused on driving safely.",
          actions: [
            { screen: "Timeline (Action Card)", action: "Evacuation WARNING then MANDATORY. Raj responds \u201CEvacuating Now\u201D immediately." },
            { screen: "Map", action: "Follows Beacon evacuation route. Highway 91 is moving. Avoids Cedar Ave closure." },
            { screen: "Teams > Family (Chat)", action: "Raj messages extended family: \u201CWe\u2019re evacuating to Convention Center. Cedar Ave area. House may be in the path.\u201D" },
            { screen: "Teams > Neighborhood (Chat)", action: "Posts: \u201CWe left. Forgot the hamster. If anyone goes back past 247 Cedar Ave, the cage is in the garage.\u201D" },
          ],
          needs: ["Fast evacuation confirmation (one tap)", "Clear route guidance under extreme stress", "Family coordination while driving"],
          gives: ["Evacuation confirmation data", "Neighborhood mutual aid request (hamster)"],
        },
        { time: "T+2h to T+6h", title: "Phase 4: Shelter and Dread",
          context: "At the Convention Center. Kids are scared. They monitor the Timeline obsessively. Cedar Ave is mentioned in fire updates. They know it\u2019s bad.",
          emotional: "Dread. Every fire update mentioning Cedar Ave is a knife. Trying to be strong for the kids. Priya can\u2019t stop refreshing.",
          actions: [
            { screen: "Timeline", action: "Sees: \u201CRiverside Fire confirms structure loss on Cedar Ave.\u201D Their street. But which houses?" },
            { screen: "Feed", action: "Desperately searching for any photo or report showing Cedar Ave conditions." },
            { screen: "Teams > Neighborhood (Chat)", action: "\u201CDoes anyone have eyes on 247 Cedar Ave? Please. We need to know.\u201D" },
            { screen: "Teams > Family (Chat)", action: "Extended family offering support. Raj\u2019s brother: \u201CCome stay with us as long as you need.\u201D" },
            { screen: "Help Tab", action: "Posts about the hamster again. A volunteer responds: \u201CI\u2019ll check on next welfare check run.\u201D" },
          ],
          needs: ["Home address-specific updates (not just street-level)", "Community information sharing about specific addresses", "Emotional support resources at shelter"],
          gives: ["Community engagement data", "Specific address inquiry that may trigger volunteer action"],
        },
        { time: "T+6h to T+72h", title: "Phases 5-6: Confirmation and Grief",
          context: "Damage assessment confirms: 247 Cedar Ave is destroyed. A neighbor posts a photo showing the burned lot. The Patels\u2019 lives are shattered. But they begin picking up the pieces. Beacon becomes their recovery lifeline.",
          emotional: "Devastation. Then numbness. Then the grinding reality of what to do next. Grateful for the community but overwhelmed.",
          actions: [
            { screen: "Timeline", action: "Sees damage assessment: \u201C247 Cedar Ave \u2014 Destroyed.\u201D Confirmation of their worst fear." },
            { screen: "Feed", action: "Neighbor posts photo of Cedar Ave. Their lot is visible. Foundation only. Everything gone." },
            { screen: "Help Tab", action: "Starts searching: FEMA registration, insurance contacts, temporary housing, school transfer info." },
            { screen: "Teams > Neighborhood (Board)", action: "Posts: \u201CWe lost our home. Family of 4. Looking for temporary housing near Riverside. Any leads?\u201D" },
            { screen: "Teams > DMs", action: "Receives 8 messages offering spare rooms, clothes, meals, and support. Overwhelmed by kindness." },
            { screen: "Timeline (Action Card)", action: "Registers for Zone 3 escorted property access. Saturday 10 AM." },
          ],
          needs: [
            "Address-specific damage notification (destroyed, damaged, intact)",
            "Recovery resource directory: FEMA, insurance, housing, schools, mental health",
            "Temporary housing coordination through community board",
            "DM capability for private offers of help",
            "Escorted access registration with time slot selection",
          ],
          gives: ["Housing need that mobilizes community support", "FEMA registration data"],
        },
        { time: "T+3d to T+14d", title: "Phase 7: Early Recovery",
          context: "The Patels visit the property. It\u2019s devastating. They photograph everything for insurance. They start FEMA registration. Anika\u2019s school is helping with supply replacement. The community rallies.",
          actions: [
            { screen: "Map", action: "Follows escorted route to 247 Cedar Ave. Damage overlay shows their block in red." },
            { screen: "Feed > Report", action: "Photos of the damage for insurance documentation. Shared privately, not publicly." },
            { screen: "Help Tab", action: "Uses recovery resource directory: files FEMA application, contacts insurance adjuster, finds temporary housing program." },
            { screen: "Teams > Neighborhood (Board)", action: "Updates: \u201CStaying with Raj\u2019s brother for now. Kids enrolled at new school temporarily. Thank you all.\u201D" },
            { screen: "Teams > Lincoln Elementary", action: "Sees school resource post: supply replacements for displaced students. Signs up." },
          ],
          needs: ["Insurance documentation support (photo upload, organized by address)", "FEMA application link and status tracking", "School resource coordination for displaced children"],
          gives: ["Recovery progress updates that help the community understand ongoing needs"],
        },
        { time: "T+14d onward", title: "Phase 8: Rebuilding",
          context: "Long road ahead. Insurance negotiations, contractor selection, rebuilding permits. Beacon\u2019s community keeps them connected and supported throughout the months-long process.",
          emotional: "Grief, resilience, and community. The neighborhood team becomes their anchor through the rebuilding process.",
          actions: [
            { screen: "Teams > Neighborhood (Board)", action: "Posts: \u201CLooking for contractor recommendations for rebuild. Anyone started the process?\u201D" },
            { screen: "Teams > Neighborhood (Chat)", action: "Stays connected with other displaced families. Mutual support group forming organically." },
            { screen: "Feed", action: "Community fundraiser reaches $45,000. Posts thank you." },
            { screen: "Help Tab", action: "Monitors for new grant opportunities and recovery resources as they become available." },
            { screen: "Teams > DMs", action: "Coordinates with temporary housing host on timeline for finding permanent housing." },
          ],
          needs: [
            "Long-term recovery resource directory that updates over months",
            "Community fundraiser sharing and tracking",
            "Contractor and rebuild resource sharing",
            "Ongoing community support through neighborhood team",
            "Recovery milestone tracking (insurance filed, permit approved, construction started)",
          ],
          gives: ["Recovery community bonds", "Beacon engagement for months post-disaster", "Beacon advocacy as a life-saving platform"],
        },
      ],
      requirements: [
        { section: "Displaced Resident Recovery", items: ["Address-specific damage notification in Timeline", "Recovery resource directory: FEMA, insurance, housing, mental health, schools", "Temporary housing coordination through community boards and DMs", "Escorted property access registration with time slots", "Insurance documentation support (organized photo upload)", "School resource coordination for displaced children\u2019s families", "Long-term recovery milestone tracking", "Community fundraiser sharing", "Contractor and rebuild resource sharing boards", "Months-long engagement support (not just emergency-phase features)"]},
      ],
    },
    {
      name: "Family Searching for a Missing Loved One",
      icon: "\u2764\uFE0F",
      filename: "12_missing_person_family",
      subtitle: "The agonizing wait for news when a loved one is unaccounted for",
      bio: ["Sarah Henderson (Robert\u2019s daughter) and the Kim family (searching for uncle in Zone 3).", "This journey represents any family member who cannot reach a loved one during the disaster.", "Beacon free public users.", "Primary focus: locating their missing person, getting official confirmation of safety."],
      phases: [
        { time: "T+0 to T+2 hours", title: "Phases 1-3: Growing Panic",
          context: "Sarah is 45 minutes away when the fire breaks out. She can\u2019t reach her father Robert on the phone for 30 minutes (he was in the shower). The Kim family can\u2019t reach their uncle who lives alone in Zone 3.",
          emotional: "Terror. Every unanswered call is a nightmare. The mind goes to the worst place. Need information NOW.",
          actions: [
            { screen: "Teams > DMs (Dad)", action: "Sarah messages Robert repeatedly: \u201CDad are you okay? Please respond. There\u2019s a fire near you.\u201D" },
            { screen: "Timeline", action: "Monitoring every update obsessively. Evacuation ordered for Zone 3\u2014Dad is in Zone 3." },
            { screen: "Teams > DMs (Dad)", action: "Robert finally responds: \u201CI\u2019m okay. A neighbor is driving me to shelter.\u201D RELIEF." },
            { screen: "Help Tab (Kim family)", action: "Cannot reach uncle. No response for 2 hours. Submits missing person report: name, address, photo, medical conditions." },
            { screen: "Timeline (Kim family)", action: "Sees: \u201C6 residents unaccounted for in Zone 3. SAR operations underway.\u201D Their uncle might be one of them." },
          ],
          needs: [
            "Read receipts or activity indicators (last seen online) for family contacts",
            "Missing person report submission with photo, address, and medical info",
            "Real-time accountability status updates (\u201CX residents unaccounted\u201D)",
            "Push notification when a missing person\u2019s status changes",
          ],
          gives: ["Missing person report that helps SAR prioritize", "Family information that aids identification"],
        },
        { time: "T+2h to T+24h", title: "Phases 4-5: The Wait",
          context: "Sarah\u2019s father is safe (confirmed via Beacon). The Kim family waits through the night. Their uncle is one of the 6 unaccounted.",
          emotional: "For Sarah: relief, then gratitude, then worry about his house. For the Kims: agony. Refreshing every 30 seconds. Can\u2019t sleep.",
          actions: [
            { screen: "Timeline (Kim family)", action: "Watches accountability count drop: 6 unaccounted... 4 unaccounted... 2 unaccounted." },
            { screen: "Help Tab (Kim family)", action: "Checks missing person report status. Sees: \u201CSAR team dispatched to address. Status: Searching.\u201D" },
            { screen: "Teams > Family (Kim)", action: "Family group chat active all night. Sharing any scrap of information. Praying together over text." },
            { screen: "Timeline (Kim family)", action: "Next morning: \u201CAll Zone 3 residents accounted for.\u201D Then push notification: \u201CYour missing person report: FOUND SAFE.\u201D" },
            { screen: "Help Tab (Kim family)", action: "Report updated: \u201CUncle found safe at friend\u2019s house outside the zone. Was not on Beacon.\u201D" },
          ],
          needs: [
            "Missing person report status tracking (submitted, SAR dispatched, searching, found safe / found injured / not found)",
            "Push notification when missing person status changes",
            "Accountability count updates on Timeline",
            "Report resolution with details (where found, condition)",
          ],
          gives: ["Reduced 911 call volume (families can track status in Beacon instead of calling)", "SAR priority information"],
        },
        { time: "T+24h onward", title: "Phases 6-8: Aftermath",
          context: "Both families\u2019 loved ones are safe. The Kim family helps their uncle set up a Beacon account. Sarah advocates for elderly notification features.",
          actions: [
            { screen: "Teams > DMs", action: "Sarah coordinates getting Robert home safely. Helps him navigate the return process." },
            { screen: "Feed", action: "Kim family posts: \u201COur uncle is safe. Thank you to the SAR team and the Beacon community.\u201D" },
            { screen: "Account", action: "Kim uncle creates a Beacon account for next time. Family adds him to their team." },
          ],
          needs: ["Easy account creation for previously unconnected family members", "Family team invitation flow"],
          gives: ["New Beacon user acquisition driven by the event", "Community gratitude and platform advocacy"],
        },
      ],
      requirements: [
        { section: "Missing Persons System", items: ["Missing person report submission: name, photo, address, medical info, last known activity", "Report status tracking: submitted, SAR dispatched, searching, resolved", "Push notification on status change", "Accountability count on Timeline (\u201CX residents unaccounted\u201D)", "Resolution details (where found, condition, who found them)", "Contact activity indicators (last seen online, last Beacon activity)", "Family team coordination for search efforts"]},
      ],
    },
  ];

  const allUsers = [...USERS, ...additionalUsers];

  for (const user of allUsers) {
    const doc = makeDoc(user);
    const buffer = await Packer.toBuffer(doc);
    const path = `/sessions/friendly-bold-bardeen/mnt/beacon/wildfire_scenario_user_journeys/${user.filename}.docx`;
    fs.writeFileSync(path, buffer);
    console.log(`Created: ${user.filename}.docx`);
  }

  console.log(`\nDone! ${allUsers.length} documents generated.`);
}

generateAll().catch(err => { console.error(err); process.exit(1); });
