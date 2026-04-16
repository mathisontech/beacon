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

const CONTENT_WIDTH = 9360; // US Letter 1" margins

function spacer(pts = 120) {
  return new Paragraph({ spacing: { before: pts, after: pts }, children: [] });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120, before: opts.before || 0, line: opts.line || 276 },
    children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, size: opts.size || 24, color: opts.color, font: "Arial" })],
  });
}

function richPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120, before: opts.before || 0, line: opts.line || 276 },
    alignment: opts.alignment,
    children: runs.map(r => new TextRun({ font: "Arial", size: 24, ...r })),
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

function phaseHeader(time, title) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        shading: { fill: PURPLE, type: ShadingType.CLEAR },
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

function userBlock(role, icon, actions) {
  const rows = [];
  // Header row
  rows.push(new TableRow({
    children: [
      new TableCell({
        borders: { ...noBorders, bottom: border },
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnSpan: 2,
        shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [
            new TextRun({ text: icon + " ", font: "Arial", size: 24 }),
            new TextRun({ text: role, font: "Arial", size: 24, bold: true, color: PURPLE }),
          ],
        })],
      }),
    ],
  }));
  // Action rows
  for (const a of actions) {
    rows.push(new TableRow({
      children: [
        new TableCell({
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" } },
          width: { size: 2800, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 120, right: 60 },
          children: [new Paragraph({ children: [new TextRun({ text: a.screen, font: "Arial", size: 20, bold: true, color: BLUE })] })],
        }),
        new TableCell({
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" } },
          width: { size: 6560, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 60, right: 120 },
          children: [new Paragraph({ spacing: { line: 260 }, children: [new TextRun({ text: a.action, font: "Arial", size: 20 })] })],
        }),
      ],
    }));
  }
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [2800, 6560],
    rows,
  });
}

// ─── DOCUMENT STRUCTURE ───
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: PURPLE },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: PURPLE },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
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
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // ─── TITLE PAGE ───
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        spacer(2400),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "BEACON", font: "Arial", size: 52, bold: true, color: ORANGE }),
        ]}),
        spacer(80),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "Wildfire Scenario Simulation", font: "Arial", size: 40, bold: true, color: PURPLE }),
        ]}),
        spacer(60),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "User Behavior Timeline & UI Requirements", font: "Arial", size: 28, color: GRAY }),
        ]}),
        spacer(200),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
          new TextRun({ text: "A minute-by-minute simulation of a wildfire event", font: "Arial", size: 24, color: GRAY }),
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
          new TextRun({ text: "from first smoke sighting through long-term recovery,", font: "Arial", size: 24, color: GRAY }),
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
          new TextRun({ text: "tracking every user type and their interactions with Beacon.", font: "Arial", size: 24, color: GRAY }),
        ]}),
        spacer(600),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "Beacon Platform", font: "Arial", size: 22, color: GRAY }),
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "March 2026", font: "Arial", size: 22, color: GRAY }),
        ]}),
      ],
    },
    // ─── OVERVIEW PAGE ───
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } },
          children: [
            new TextRun({ text: "Beacon Wildfire Scenario Simulation", font: "Arial", size: 18, color: GRAY }),
          ],
        })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 18, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: GRAY }),
          ],
        })] }),
      },
      children: [
        heading("Scenario Overview"),
        para("This document simulates a wildfire event in Riverside, California from first detection through long-term recovery. It tracks the minute-by-minute behaviors of every user type on the Beacon platform, mapping each action to a specific screen, tab, or feature in the app."),
        para("The purpose is to stress-test the Beacon UI architecture by walking through a realistic disaster scenario and identifying every interaction point. Each phase answers: What does this person need to know? What action do they need to take? Where in Beacon do they do it?"),

        heading("Scenario Parameters", HeadingLevel.HEADING_2),
        bullet("Location: Northeast hills above Riverside, CA (wildland-urban interface)"),
        bullet("Season: Late October, Santa Ana wind event (gusts 40-55 mph, 8% humidity)"),
        bullet("Time: Fire ignition at approximately 5:30 PM on a weekday"),
        bullet("Scale: 500-acre fire threatening 4,000 homes across 3 evacuation zones"),
        bullet("Beacon adoption: Riverside County is a paying Beacon client. 60% household penetration in affected area"),

        heading("User Types Tracked", HeadingLevel.HEADING_2),
        para("This simulation follows 12 distinct user types through every phase of the disaster:"),
        spacer(40),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: PURPLE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Emergency Services", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: PURPLE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Infrastructure", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: PURPLE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Public Users", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
            ]}),
            ...([
              ["Fire Captain (IC)", "Utility Rep (Electric)", "Parent (kids at school)"],
              ["Sheriff Deputy (Evac Lead)", "School Principal", "Elderly Resident (no car)"],
              ["Emergency Manager (County)", "Road Crew Lead", "Neighbor Volunteer"],
              ["Paramedic/EMT", "", "Evacuee at Shelter"],
            ].map(row => new TableRow({ children: row.map((cell, ci) =>
              new TableCell({ borders, width: { size: 3120, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 100, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 20 })] })] })
            )}))),
          ],
        }),

        heading("Event Phases", HeadingLevel.HEADING_2),
        para("The scenario unfolds across 8 phases, each representing a distinct operational tempo and set of user needs:"),
        spacer(40),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1200, 2160, 6000],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: PURPLE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Phase", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 2160, type: WidthType.DXA }, shading: { fill: PURPLE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Time", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 6000, type: WidthType.DXA }, shading: { fill: PURPLE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Description", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
            ]}),
            ...([
              ["1", "T+0 to T+15m", "Detection and First Reports: Smoke sightings, crowdsourced confirmation, fire dept dispatch"],
              ["2", "T+15m to T+45m", "Official Confirmation and Escalation: Fire confirmed, resources deployed, alert channels activate"],
              ["3", "T+45m to T+2h", "Evacuation Orders: Zones activated, routes published, mass population movement begins"],
              ["4", "T+2h to T+6h", "Active Emergency: Full-scale firefighting, ongoing evacuation, shelter operations, mutual aid"],
              ["5", "T+6h to T+24h", "Containment and Accountability: Fire partially contained, missing persons tracked, welfare checks"],
              ["6", "T+24h to T+72h", "Stabilization: Fire contained, damage assessment begins, return planning, utility restoration"],
              ["7", "T+3d to T+14d", "Recovery Phase 1: Residents return, insurance documentation, debris removal, emotional support"],
              ["8", "T+14d+", "Recovery Phase 2: Rebuilding, community healing, lessons learned, long-term support coordination"],
            ].map(row => new TableRow({ children: [
              new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: row[0], font: "Arial", size: 20, bold: true, color: ORANGE })] })] }),
              new TableCell({ borders, width: { size: 2160, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: row[1], font: "Arial", size: 20, bold: true })] })] }),
              new TableCell({ borders, width: { size: 6000, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 100, right: 100 }, children: [new Paragraph({ spacing: { line: 260 }, children: [new TextRun({ text: row[2], font: "Arial", size: 20 })] })] }),
            ]}))),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // PHASE 1: DETECTION AND FIRST REPORTS
        // ════════════════════════════════════════
        phaseHeader("T+0 to T+15 min", "Phase 1: Detection and First Reports"),
        spacer(80),
        para("A resident notices smoke rising from the northeast hills at 5:32 PM. Within minutes, multiple Beacon users in the area independently report the same smoke. Beacon\u2019s system begins correlating the reports. No official channels have activated yet. This is purely crowdsourced awareness."),
        spacer(40),

        heading("What Happens on Beacon", HeadingLevel.HEADING_3),
        bullet("T+0:00 \u2014 First user posts a smoke sighting on the Feed with a photo. Tagged as \u201CSighting.\u201D"),
        bullet("T+0:03 \u2014 Second and third reports from different locations. Beacon auto-groups them into an event cluster."),
        bullet("T+0:05 \u2014 System generates an automated Timeline entry: \u201CSpike in fire sightings (3 new) between 5:32 and 5:37 PM.\u201D"),
        bullet("T+0:08 \u2014 Nearby users receive a push notification: \u201CMultiple smoke reports near you. Open Beacon for details.\u201D"),
        bullet("T+0:10 \u2014 Map tab shows clustered orange dots in the NE hills. Users clicking dots see crowdsourced photos."),
        bullet("T+0:12 \u2014 Riverside Fire Dept (a verified team) posts on the Feed: \u201CWe are aware of smoke reports. Engine 7 dispatched.\u201D"),
        spacer(60),

        heading("User Behaviors", HeadingLevel.HEADING_3),

        userBlock("Resident Who Spots Smoke", "\uD83D\uDC64", [
          { screen: "Feed > Report (+)", action: "Taps the orange Report button. Selects \u201CFire / Smoke.\u201D Takes a photo pointing NE. Adds note: \u201CSmoke visible from northeast hills, growing.\u201D Submits." },
          { screen: "Feed", action: "Watches as other reports appear. Upvotes confirming reports. Reads fire dept response." },
          { screen: "Teams > Family", action: "Sends a chat message: \u201CSmoke over the hills. Keeping an eye on it.\u201D" },
        ]),
        spacer(60),

        userBlock("Other Nearby Residents", "\uD83D\uDC65", [
          { screen: "Push Notification", action: "Receive \u201CSmoke reports near you\u201D notification. Tap to open Beacon." },
          { screen: "Feed", action: "See the sighting posts. Some add confirming reports, others upvote. Discussion in comments." },
          { screen: "Map", action: "Check the map to see where smoke dots are clustered. Compare to their own location." },
          { screen: "Teams > Neighborhood", action: "Post in neighborhood chat: \u201CAnyone else seeing the smoke from the NE?\u201D" },
        ]),
        spacer(60),

        userBlock("Fire Captain (Off-Duty, Monitoring)", "\uD83D\uDE92", [
          { screen: "Push Notification", action: "Receives Beacon alert about clustered fire sightings in their jurisdiction." },
          { screen: "Feed", action: "Reviews crowdsourced reports and photos. Assesses size and direction from user photos." },
          { screen: "Teams > Fire Dept", action: "Posts in the Announcements sub-tab: \u201CEngine 7 dispatched to NE hills. All off-duty personnel stand by.\u201D" },
          { screen: "Map (Dashboard)", action: "Opens paid client dashboard. Sees crowdsourced sighting cluster. Begins planning resource staging." },
        ]),
        spacer(60),

        userBlock("Parent (Kids Still at After-School Program)", "\uD83D\uDC69\u200D\uD83D\uDC67", [
          { screen: "Push Notification", action: "Sees smoke reports notification. Immediately thinks about kids at Lincoln Elementary after-school." },
          { screen: "Feed", action: "Reads the fire dept post. No evacuation mentioned. Watches for updates." },
          { screen: "Teams > Lincoln Elementary", action: "Checks the Announcements tab. No school announcement yet. Checks chat to see what other parents are saying." },
          { screen: "Teams > Family", action: "Messages spouse: \u201CDid you see the smoke reports? Kids are still at school.\u201D" },
        ]),
        spacer(60),

        userBlock("School Principal", "\uD83C\uDFEB", [
          { screen: "Push Notification", action: "Receives the smoke cluster alert. Checks Beacon for details." },
          { screen: "Feed + Map", action: "Reviews reports and checks proximity to school. Smoke is 2.5 miles NE. Monitors." },
          { screen: "Teams > School (Announcements)", action: "Posts: \u201CWe are aware of smoke reports NE of campus. All students safe. After-school programs continuing normally. We are monitoring.\u201D" },
        ]),
        spacer(60),

        userBlock("Elderly Resident (Lives Alone, No Car)", "\uD83D\uDC74", [
          { screen: "Push Notification", action: "Sees smoke alert. Steps outside and can see a faint haze." },
          { screen: "Feed", action: "Reads reports. Doesn\u2019t know how to assess risk. Reads the fire dept post saying no evacuation yet." },
          { screen: "Teams > Family Contact", action: "DMs their adult child: \u201CI see smoke. Is everything okay?\u201D" },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // PHASE 2: OFFICIAL CONFIRMATION
        // ════════════════════════════════════════
        phaseHeader("T+15 min to T+45 min", "Phase 2: Official Confirmation and Escalation"),
        spacer(80),
        para("Engine 7 arrives on scene and confirms a 5-acre brush fire with rapid spread due to Santa Ana winds. The fire captain establishes incident command and requests additional resources. The county emergency manager activates Beacon\u2019s emergency event protocol. Official alerts begin flowing through verified channels."),
        spacer(40),

        heading("What Happens on Beacon", HeadingLevel.HEADING_3),
        bullet("T+15:00 \u2014 Fire Captain creates an official event in the dashboard: \u201CNE Hills Brush Fire.\u201D"),
        bullet("T+17:00 \u2014 County Emergency Manager activates event protocol. Emergency channels open for all verified EMS teams."),
        bullet("T+18:00 \u2014 First official alert pushed to all users within 5-mile radius: \u201CConfirmed brush fire NE hills. Monitor for updates.\u201D"),
        bullet("T+20:00 \u2014 Map shows official fire perimeter (drawn by IC from field observation). Authoritative layer replaces crowdsourced dots."),
        bullet("T+25:00 \u2014 Wind model overlay shows projected fire spread toward residential areas within 90 minutes."),
        bullet("T+30:00 \u2014 Fire captain requests mutual aid. Neighboring departments see the request on their dashboards."),
        bullet("T+35:00 \u2014 Timeline auto-updates with official source: \u201CRiverside Fire confirms 15-acre brush fire, rapid spread.\u201D"),
        bullet("T+40:00 \u2014 Sheriff\u2019s office activated. Deputy begins pre-staging evacuation zones on the dashboard."),
        spacer(60),

        heading("User Behaviors", HeadingLevel.HEADING_3),

        userBlock("Fire Captain (Incident Commander)", "\uD83D\uDE92", [
          { screen: "Dashboard > Map", action: "Draws initial fire perimeter on the map. This becomes the authoritative fire layer visible to all users." },
          { screen: "Dashboard > Resources", action: "Logs Engine 7 and Engine 12 on scene. Requests aerial support. Requests 3 additional engines." },
          { screen: "Dashboard > Mutual Aid", action: "Sends mutual aid request to San Bernardino and Corona fire departments via Beacon." },
          { screen: "Teams > Fire Dept", action: "Posts announcement: \u201CAll personnel: NE Hills fire confirmed. 15 acres, wind-driven. Report to Station 4 for staging.\u201D" },
          { screen: "Dashboard > Comms", action: "Opens emergency coordination channel with Sheriff and Emergency Management. Discusses pre-evacuation." },
        ]),
        spacer(60),

        userBlock("County Emergency Manager", "\uD83C\uDFDB\uFE0F", [
          { screen: "Dashboard > Events", action: "Activates official event protocol: \u201CNE Hills Brush Fire.\u201D This triggers emergency channel access for all verified teams." },
          { screen: "Dashboard > Alerts", action: "Pushes official awareness alert to 5-mile radius: \u201CConfirmed brush fire. No evacuation orders. Prepare go bags.\u201D" },
          { screen: "Dashboard > Comms", action: "Coordinates with fire IC, sheriff, utility reps, and school district in the unified emergency channel." },
          { screen: "Dashboard > Map", action: "Reviews wind model overlay. Identifies that Zone 3 residential area is in the projected path within 90 minutes." },
        ]),
        spacer(60),

        userBlock("Sheriff Deputy (Evacuation Lead)", "\uD83D\uDC6E", [
          { screen: "Dashboard > Map", action: "Reviews projected fire spread. Begins drawing evacuation zone boundaries on the map (Zone 1, 2, 3)." },
          { screen: "Dashboard > Routes", action: "Defines primary and alternate evacuation routes. Marks Highway 91 as primary route out." },
          { screen: "Dashboard > Comms", action: "Coordinates with fire IC: \u201CWhen do you want me to issue the warning for Zone 3?\u201D" },
          { screen: "Dashboard > Resources", action: "Deploys patrol units to pre-stage at major intersections along evacuation routes." },
        ]),
        spacer(60),

        userBlock("Utility Rep (Riverside Electric)", "\u26A1", [
          { screen: "Push Notification", action: "Receives emergency event activation. Opens Beacon dashboard." },
          { screen: "Dashboard > Map", action: "Checks fire perimeter against power infrastructure. Identifies 3 transmission lines in projected path." },
          { screen: "Dashboard > Alerts", action: "Posts to Infrastructure map layer: \u201CPossible power shutoff in Zone 3 area if fire approaches transmission lines.\u201D" },
          { screen: "Dashboard > Comms", action: "Joins emergency channel. Coordinates with fire IC on when to de-energize lines for firefighter safety." },
          { screen: "Dashboard > Crews", action: "Pre-stages repair crews at the substation serving the NE residential area." },
        ]),
        spacer(60),

        userBlock("School Principal", "\uD83C\uDFEB", [
          { screen: "Push Notification", action: "Receives official fire confirmation alert. Smoke now visible from school campus." },
          { screen: "Teams > School", action: "Posts urgent announcement: \u201CFire confirmed 2 miles NE. After-school programs ending immediately. All parents: pick up children NOW.\u201D" },
          { screen: "Timeline", action: "Monitors for evacuation orders. If Zone 2 (school\u2019s zone) gets an order, will need to execute school evacuation plan." },
          { screen: "Dashboard (Special)", action: "Accesses student roster with parent contact info. Beacon auto-sends pickup alert to all registered parents." },
        ]),
        spacer(60),

        userBlock("Parent", "\uD83D\uDC69\u200D\uD83D\uDC67", [
          { screen: "Push Notification", action: "Receives both the official fire alert AND the school\u2019s pickup alert simultaneously." },
          { screen: "Timeline", action: "Sees school announcement pinned: \u201CPick up children immediately.\u201D" },
          { screen: "Map", action: "Checks fire location relative to school and home. Plans route to school that avoids the fire area." },
          { screen: "Teams > Family", action: "Messages spouse: \u201CI\u2019m getting the kids. Start packing the car with the go bags.\u201D" },
        ]),
        spacer(60),

        userBlock("Neighbor Volunteer", "\uD83E\uDD1D", [
          { screen: "Feed", action: "Reads fire confirmation. Immediately thinks about elderly neighbor who lives alone." },
          { screen: "Teams > Neighborhood (Chat)", action: "Posts: \u201CHas anyone checked on Mr. Henderson on Oak St? He doesn\u2019t drive.\u201D" },
          { screen: "Help Tab", action: "Checks Help tab for any requests. None yet from the area. Prepares to offer help." },
        ]),
        spacer(60),

        userBlock("Elderly Resident", "\uD83D\uDC74", [
          { screen: "Push Notification", action: "Receives official fire alert. Anxiety rising. Can now see heavy smoke." },
          { screen: "Timeline", action: "Reads official updates. Sees \u201Cno evacuation orders yet\u201D but feels uncertain." },
          { screen: "Teams > DMs", action: "Messages adult child: \u201CThe fire is confirmed. I\u2019m scared. Can you come get me?\u201D" },
          { screen: "Feed", action: "Reads community posts. Others are already packing cars. Feels urgency but has no car." },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // PHASE 3: EVACUATION ORDERS
        // ════════════════════════════════════════
        phaseHeader("T+45 min to T+2 hours", "Phase 3: Evacuation Orders"),
        spacer(80),
        para("The fire has grown to 80 acres. Wind shifts push it directly toward residential Zone 3. The sheriff issues an evacuation warning for Zone 3, then upgrades to a mandatory order 20 minutes later. Thousands of residents begin moving. This is the highest-stress phase for the public app. Every second of UI clarity matters."),
        spacer(40),

        heading("What Happens on Beacon", HeadingLevel.HEADING_3),
        bullet("T+45:00 \u2014 Sheriff issues Evacuation WARNING for Zone 3 via Beacon dashboard. Pushed to all Zone 3 users."),
        bullet("T+48:00 \u2014 Action Required cards appear on Timeline for every user with an address in Zone 3."),
        bullet("T+50:00 \u2014 Evacuation confirmation module activates: \u201CAre you evacuating? Staying? Already left?\u201D"),
        bullet("T+55:00 \u2014 Shelter opens at Convention Center. Location added to map with capacity tracker."),
        bullet("T+60:00 \u2014 Sheriff upgrades to MANDATORY evacuation for Zone 3. Red banner across entire app."),
        bullet("T+65:00 \u2014 Routes published on map. Real-time traffic data shows Highway 91 moving, Oak St blocked."),
        bullet("T+70:00 \u2014 System detects 12 users in Zone 3 who haven\u2019t responded to evacuation confirmation. Welfare check requests generated."),
        bullet("T+80:00 \u2014 Help requests flooding in: transport needed, pet rescue, equipment needed."),
        bullet("T+90:00 \u2014 Zone 2 upgraded to evacuation warning. School evacuation initiated."),
        bullet("T+100:00 \u2014 Power shutoff in Zone 3. Utility posts outage on map. BeaconMesh activates for users losing connectivity."),
        spacer(60),

        heading("User Behaviors", HeadingLevel.HEADING_3),

        userBlock("Sheriff Deputy (Evacuation Lead)", "\uD83D\uDC6E", [
          { screen: "Dashboard > Zones", action: "Activates evacuation WARNING for Zone 3. Draws geofenced zone on map. All users with addresses in the polygon receive alerts." },
          { screen: "Dashboard > Comms", action: "Coordinates with fire IC: Fire not slowing. Upgrades to MANDATORY 20 minutes later." },
          { screen: "Dashboard > Evac Module", action: "Monitors evacuation confirmation dashboard. Sees real-time counts: 340 evacuating, 45 staying, 180 no response." },
          { screen: "Dashboard > Help Mgr", action: "Pushes Category 1 welfare check requests for the 12 non-responsive elderly/disabled-flagged users." },
          { screen: "Dashboard > Routes", action: "Monitors road conditions. Marks Oak St as closed after tree blocks road. Updates route to redirect traffic." },
        ]),
        spacer(60),

        userBlock("Fire Captain (IC)", "\uD83D\uDE92", [
          { screen: "Dashboard > Map", action: "Updates fire perimeter as it grows. Wind shift now pushing directly toward Zone 3. 80 acres." },
          { screen: "Dashboard > Resources", action: "Mutual aid engines arriving. Assigns them to defensive positions along the residential edge." },
          { screen: "Dashboard > Comms", action: "Tells Sheriff: \u201CUpgrade Zone 3 now. Fire will reach homes in 45 minutes at current rate.\u201D" },
          { screen: "Teams > Fire Dept (Tasks)", action: "Assigns tasks to crews: Engine 12 defend Oak St homes, Engine 15 defend Cedar Ave, aerial on eastern flank." },
        ]),
        spacer(60),

        userBlock("Parent (Picking Up Kids)", "\uD83D\uDC69\u200D\uD83D\uDC67", [
          { screen: "Timeline (Action Card)", action: "EVACUATION WARNING appears as pinned Action Required card. Responds: \u201CEvacuating Now.\u201D" },
          { screen: "Map", action: "Checks evacuation routes. Sees Highway 91 clear but her route to school goes through a closure. Reroutes." },
          { screen: "Timeline", action: "Sees school announcement: \u201CAll students released to parents. Bus evacuation initiated for remaining students.\u201D" },
          { screen: "Teams > Family (Chat)", action: "\u201CI have the kids. Heading home to grab go bags then to Convention Center.\u201D" },
          { screen: "Map", action: "Follows Beacon-suggested evacuation route. Route updates in real-time as conditions change." },
        ]),
        spacer(60),

        userBlock("Elderly Resident (No Car)", "\uD83D\uDC74", [
          { screen: "Timeline (Action Card)", action: "Sees EVACUATION WARNING. Responds: \u201CNeed Assistance.\u201D This triggers a transport help request." },
          { screen: "Timeline (Expanded Form)", action: "System asks for details: mobility limitations (uses walker), number of people (1), pets (1 cat), location confirmation." },
          { screen: "Help Tab", action: "Sees his own request appear in Help tab: \u201CTransport Needed: Elderly resident needs ride to shelter.\u201D Waiting for a responder." },
          { screen: "Teams > DMs", action: "Adult child messages: \u201CI\u2019m 45 minutes away. Beacon is finding you a ride. Stay inside.\u201D" },
          { screen: "Feed", action: "Sees neighbor volunteer post: \u201CI\u2019m driving people to the shelter. DM me.\u201D" },
        ]),
        spacer(60),

        userBlock("Neighbor Volunteer", "\uD83E\uDD1D", [
          { screen: "Timeline (Action Card)", action: "Responds to evacuation confirmation: \u201CEvacuating Now\u201D but is going to help first." },
          { screen: "Help Tab", action: "Sees transport request for elderly resident 0.4 miles away. Taps \u201CI Can Help.\u201D Communication bridge opens." },
          { screen: "Help Tab > Request", action: "Coordinates with elderly resident via the in-app communication bridge. Confirms pickup address and ETA." },
          { screen: "Teams > Neighborhood (Board)", action: "Posts: \u201COffering help: I have a truck and can carry 4 people + pets. DM me.\u201D" },
          { screen: "Feed", action: "Reports road conditions as they drive: \u201CElm Ave clear both directions as of 6:45 PM.\u201D" },
        ]),
        spacer(60),

        userBlock("School Principal", "\uD83C\uDFEB", [
          { screen: "Dashboard (Special)", action: "School in Zone 2 (warning just issued). Initiates school evacuation protocol in Beacon." },
          { screen: "Teams > School (Announcements)", action: "\u201CSchool evacuation underway. Buses departing to Convention Center shelter. All remaining parents pick up at shelter.\u201D" },
          { screen: "Dashboard > Roster", action: "Monitors student pickup dashboard. Tracks which students are with parents vs. on buses. 8 students unaccounted for." },
          { screen: "Dashboard > Comms", action: "Contacts 8 unaccounted parents directly through Beacon. 6 respond. 2 non-responsive flagged for EMS follow-up." },
        ]),
        spacer(60),

        userBlock("Utility Rep", "\u26A1", [
          { screen: "Dashboard > Map", action: "Fire approaching transmission lines. Coordinates with fire IC on de-energization timing." },
          { screen: "Dashboard > Alerts", action: "Posts to all Zone 3 users: \u201CPower shutoff imminent. Charge devices. Backup power recommended.\u201D" },
          { screen: "Dashboard > Outage", action: "Executes power shutoff for Zone 3 at T+100 min. Updates outage map layer in real-time." },
          { screen: "Dashboard > Crews", action: "Pulls crews back from Zone 3. Pre-positions for rapid restoration once fire passes." },
        ]),
        spacer(60),

        userBlock("Paramedic/EMT", "\uD83D\uDE91", [
          { screen: "Dashboard > Map", action: "Staged at Highway 91 intersection. Monitors incoming injury reports." },
          { screen: "Dashboard > Comms", action: "Receives dispatch: smoke inhalation case at Cedar Ave. Checks route accessibility with the \u201CCan A reach B\u201D model." },
          { screen: "Teams > EMS (Tasks)", action: "Accepts task assignment. Route is accessible. Responds." },
          { screen: "Dashboard > Map", action: "Marks Cedar Ave as partially obstructed after responding. Updates conditions for other units." },
        ]),
        spacer(60),

        userBlock("Road Crew Lead", "\uD83D\uDEA7", [
          { screen: "Dashboard > Map", action: "Receives task: fallen tree blocking Oak St evacuation route. Marks location on map." },
          { screen: "Teams > Public Works (Tasks)", action: "Assigns chainsaw crew to Oak St. Updates ETA: 20 minutes to clear." },
          { screen: "Dashboard > Alerts", action: "Posts road closure to map layer. Route automatically updates for all evacuees using Oak St." },
          { screen: "Dashboard > Map", action: "Clears tree. Updates road status to OPEN. Evacuation route reactivates." },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // PHASE 4: ACTIVE EMERGENCY
        // ════════════════════════════════════════
        phaseHeader("T+2 hours to T+6 hours", "Phase 4: Active Emergency"),
        spacer(80),
        para("The fire is now 250 acres. Homes are burning. Evacuation is mostly complete but some residents remain in the zone. Firefighters are in defensive operations. Shelters are filling. The Help system is at peak demand. BeaconMesh is active in areas that lost power and cell service. This phase is the most operationally complex."),
        spacer(40),

        heading("User Behaviors", HeadingLevel.HEADING_3),

        userBlock("Fire Captain (IC)", "\uD83D\uDE92", [
          { screen: "Dashboard > Map", action: "Continuous fire perimeter updates. Marks structures lost. Identifies new threat areas as wind shifts." },
          { screen: "Dashboard > Resources", action: "Manages 15 engines, 4 aerial units, 200+ personnel. Tracks fatigue and rotation schedules." },
          { screen: "Dashboard > Comms", action: "Coordinates defensive structure protection priorities with county EM. \u201CSave what we can on Cedar Ave.\u201D" },
          { screen: "Dashboard > Intelligence", action: "Uses crowdsourced reports from remaining residents to get eyes on areas crews cannot reach." },
          { screen: "Dashboard > Map", action: "Receives geofenced condition reports from citizens: \u201CFlames visible on Pine St roof.\u201D Dispatches crew." },
        ]),
        spacer(60),

        userBlock("Sheriff Deputy (Evacuation Lead)", "\uD83D\uDC6E", [
          { screen: "Dashboard > Evac Module", action: "47 users in Zone 3 still marked as \u201CStaying.\u201D Reviews their next-of-kin forms (submitted via Action Cards)." },
          { screen: "Dashboard > Help Mgr", action: "Pushes Category 2 evacuation confirmation requests to volunteers: \u201CConfirm 123 Oak St is empty.\u201D" },
          { screen: "Dashboard > Comms", action: "Coordinates with EMS: 3 people refusing to evacuate despite mandatory order. Sends patrol units for door knock." },
          { screen: "Dashboard > Map", action: "Monitors real-time location of officers on evacuation routes. Adjusts traffic control points." },
        ]),
        spacer(60),

        userBlock("County Emergency Manager", "\uD83C\uDFDB\uFE0F", [
          { screen: "Dashboard > Shelter", action: "Convention Center at 60% capacity. Opens second shelter at Riverside High School gym." },
          { screen: "Dashboard > Comms", action: "Coordinates with Red Cross, FEMA regional office, state OES. Requests federal fire management assistance." },
          { screen: "Dashboard > Alerts", action: "Pushes shelter information updates: locations, capacity, services available (meals, pet area, medical)." },
          { screen: "Dashboard > Intelligence", action: "Reviews aggregated data: 3,200 evacuated, 47 staying, 180 unconfirmed. Prioritizes welfare checks." },
        ]),
        spacer(60),

        userBlock("Evacuee at Shelter", "\uD83C\uDFE0", [
          { screen: "Timeline", action: "Monitors updates from shelter. Sees fire progression. Checks if their street has been impacted." },
          { screen: "Feed", action: "Reads community posts. Other evacuees sharing experiences. Support forming organically." },
          { screen: "Teams > Neighborhood (Chat)", action: "Real-time chat: \u201CAnyone have eyes on Maple St? Is it still standing?\u201D" },
          { screen: "Teams > Family", action: "Confirms all family members accounted for. Updates status: \u201CSafe at Convention Center.\u201D" },
          { screen: "Help Tab", action: "Sees a request for baby formula at the shelter. Responds: \u201CI have formula. Booth near entrance.\u201D" },
        ]),
        spacer(60),

        userBlock("Neighbor Volunteer (Now at Shelter)", "\uD83E\uDD1D", [
          { screen: "Help Tab", action: "Transported 3 people to shelter. Now looking for more ways to help. Accepts welfare check task." },
          { screen: "Help > Welfare Check", action: "Drives back toward Zone 3 edge. Confirms 3 addresses are evacuated. Reports to Beacon." },
          { screen: "Teams > Neighborhood (Board)", action: "Posts help offer: \u201CI have a truck and am making runs. Can carry people, pets, or supplies. DM or post.\u201D" },
          { screen: "Feed > Report", action: "Reports road conditions while driving: \u201CCedar Ave passable but heavy smoke. Use with caution.\u201D" },
        ]),
        spacer(60),

        userBlock("Elderly Resident (Now Safe at Shelter)", "\uD83D\uDC74", [
          { screen: "Timeline", action: "Monitors from shelter. Worried about house and cat (cat was brought along). Sees fire updates." },
          { screen: "Teams > DMs", action: "Messages adult child: \u201CI\u2019m safe at Convention Center. A neighbor drove me. Cat is with me.\u201D" },
          { screen: "Timeline (Action Card)", action: "Receives wellness check from county: \u201CAre you safe?\u201D Responds: \u201CI\u2019m Safe.\u201D" },
        ]),
        spacer(60),

        userBlock("Utility Rep", "\u26A1", [
          { screen: "Dashboard > Outage", action: "Zone 3 fully de-energized. Monitors for fire damage to infrastructure." },
          { screen: "Dashboard > Comms", action: "Fire IC reports a power pole is down and burning. Marks it on the map. Utility adds to repair queue." },
          { screen: "Dashboard > Alerts", action: "Updates customers: \u201CZone 3 power shutoff will remain until fire passes. Estimated restoration: 24-48 hours.\u201D" },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // PHASE 5: CONTAINMENT AND ACCOUNTABILITY
        // ════════════════════════════════════════
        phaseHeader("T+6 hours to T+24 hours", "Phase 5: Containment and Accountability"),
        spacer(80),
        para("Wind dies down overnight. Fire is 40% contained at 450 acres. 23 homes destroyed, 8 damaged. The immediate threat is subsiding but a new crisis emerges: accountability. Who is missing? Is everyone accounted for? Some residents still have no contact with loved ones. Search and rescue operations begin in the burn zone. The emotional toll is mounting."),
        spacer(40),

        heading("User Behaviors", HeadingLevel.HEADING_3),

        userBlock("County Emergency Manager", "\uD83C\uDFDB\uFE0F", [
          { screen: "Dashboard > Intelligence", action: "Reviews accountability data. 14 residents in Zone 3 still marked \u201CNo Response\u201D to evacuation confirmation." },
          { screen: "Dashboard > Missing", action: "Activates missing persons tracker. Family members can report loved ones they cannot reach." },
          { screen: "Dashboard > Alerts", action: "Pushes update: \u201CFire 40% contained. Evacuation orders remain in effect. No return authorized.\u201D" },
          { screen: "Dashboard > Comms", action: "Coordinates SAR teams for burn zone entry. Reviews crowdsourced damage reports from the edge." },
        ]),
        spacer(60),

        userBlock("Sheriff Deputy", "\uD83D\uDC6E", [
          { screen: "Dashboard > Evac Module", action: "Cross-references \u201CNo Response\u201D list with shelter check-in data. 8 confirmed at shelters (just didn\u2019t respond). 6 truly unaccounted." },
          { screen: "Dashboard > Welfare", action: "Dispatches patrol units for door-to-door check on 6 unaccounted addresses in the cooled burn zone." },
          { screen: "Dashboard > Comms", action: "Works with fire IC to identify which areas are safe for SAR entry. Uses burn zone cooling model." },
        ]),
        spacer(60),

        userBlock("Family of Missing Person", "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", [
          { screen: "Teams > DMs", action: "Cannot reach elderly uncle who lived in Zone 3. No response to messages for 8 hours." },
          { screen: "Help Tab", action: "Submits a missing person welfare check request through Beacon. Includes uncle\u2019s address, photo, and medical info." },
          { screen: "Timeline", action: "Watches for any update. Sees: \u201C6 residents unaccounted for in Zone 3. SAR operations underway.\u201D" },
          { screen: "Teams > Family", action: "Family group chat is active all night. Sharing updates, trying to coordinate information." },
        ]),
        spacer(60),

        userBlock("Evacuee at Shelter (House Destroyed)", "\uD83C\uDFE0", [
          { screen: "Timeline", action: "Sees damage report: \u201C23 homes destroyed on Cedar Ave, Pine St, and Oak Ct.\u201D Their street is listed." },
          { screen: "Feed", action: "Neighbor posts a photo from the edge of the zone. Their house is visible \u2014 it\u2019s gone." },
          { screen: "Teams > Neighborhood (Chat)", action: "Devastating chat. Multiple families confirming losses. Community support pouring in." },
          { screen: "Help Tab", action: "Sees community help offers: clothing, temporary housing, meals. Taps to connect." },
        ]),
        spacer(60),

        userBlock("Fire Captain (IC)", "\uD83D\uDE92", [
          { screen: "Dashboard > Map", action: "Updates containment line. 40% contained. Identifies remaining hot spots for crew rotation." },
          { screen: "Dashboard > Resources", action: "Manages crew fatigue. Rotates overnight shifts. Releases mutual aid engines no longer needed." },
          { screen: "Dashboard > Intelligence", action: "Confirms structure damage via crew reports. Maps each destroyed/damaged structure on authoritative layer." },
          { screen: "Dashboard > Comms", action: "Coordinates SAR access with sheriff. Clears safe corridors for patrol units." },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // PHASE 6: STABILIZATION
        // ════════════════════════════════════════
        phaseHeader("T+24 hours to T+72 hours", "Phase 6: Stabilization"),
        spacer(80),
        para("Fire is 85% contained. The immediate danger is over. Now the focus shifts to damage assessment, utility restoration, and planning for residents to return. The app\u2019s role transitions from emergency alerts to recovery coordination. Emotional support becomes as important as logistical support."),
        spacer(40),

        heading("User Behaviors", HeadingLevel.HEADING_3),

        userBlock("County Emergency Manager", "\uD83C\uDFDB\uFE0F", [
          { screen: "Dashboard > Damage", action: "Coordinates FEMA preliminary damage assessment. Teams survey with tablets, marking each structure on the map." },
          { screen: "Dashboard > Zones", action: "Lifts evacuation order for Zone 2 (minimal damage). Zone 3 remains restricted pending hazmat assessment." },
          { screen: "Dashboard > Alerts", action: "Pushes phased return plan: Zone 2 cleared to return. Zone 3 assessment in progress. Estimated 48 hours." },
          { screen: "Dashboard > Shelter", action: "Tracks shelter population. 180 people still sheltered. Begins coordinating temporary housing with Red Cross." },
        ]),
        spacer(60),

        userBlock("Utility Rep", "\u26A1", [
          { screen: "Dashboard > Repair Queue", action: "Dispatches repair crews to Zone 2 first (residents returning). 14 poles down, 2 transformers destroyed." },
          { screen: "Dashboard > Alerts", action: "Posts restoration timeline: Zone 2 power by 6 PM tomorrow. Zone 3 pending structural assessment." },
          { screen: "Dashboard > Map", action: "Updates outage map in real-time as repairs complete. Residents can see their block turn from red to green." },
        ]),
        spacer(60),

        userBlock("Returning Resident (Zone 2)", "\uD83C\uDFE0", [
          { screen: "Timeline", action: "Sees: \u201CZone 2 evacuation order lifted. You may return. Use caution: hazards present.\u201D" },
          { screen: "Map", action: "Checks route home. Sees road status (green = clear, yellow = passable, red = closed). Plans return." },
          { screen: "Feed > Report", action: "Reports conditions when returning: \u201CZone 2 smoky but homes on Elm Ave appear intact. Debris on road.\u201D" },
          { screen: "Teams > Neighborhood", action: "Chat is active: neighbors coordinating return, sharing what they find, reporting hazards." },
        ]),
        spacer(60),

        userBlock("Displaced Resident (Zone 3, Home Destroyed)", "\uD83C\uDFE0", [
          { screen: "Timeline", action: "Sees: \u201CZone 3 remains restricted.\u201D Frustration building. Wants to see their property." },
          { screen: "Help Tab", action: "Searches for: temporary housing, insurance contacts, FEMA registration. Beacon surfaces relevant resources." },
          { screen: "Teams > Neighborhood (Board)", action: "Posts: \u201CLooking for temporary housing near Riverside for family of 4. Any leads?\u201D" },
          { screen: "Feed", action: "Community rallying. GoFundMe links shared. Clothing drives organized. Meal trains forming." },
          { screen: "Teams > DMs", action: "Receives messages from 5 people offering spare rooms, supplies, and emotional support." },
        ]),
        spacer(60),

        userBlock("Neighbor Volunteer", "\uD83E\uDD1D", [
          { screen: "Teams > Neighborhood (Board)", action: "Organizes a supply drive: \u201CDropping off supplies to shelter at 10 AM. Who can contribute?\u201D" },
          { screen: "Help Tab > Offer", action: "Posts: \u201COffering spare bedroom for displaced family. Up to 2 months. DM me.\u201D" },
          { screen: "Teams > Neighborhood (Tasks)", action: "Creates task list: supply collection, shelter visits, checking on returned homes for damage." },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // PHASE 7: RECOVERY PHASE 1
        // ════════════════════════════════════════
        phaseHeader("T+3 days to T+14 days", "Phase 7: Recovery Phase 1"),
        spacer(80),
        para("Fire is fully contained. Zone 3 reopens for escorted visits. Residents return to assess damage. Insurance adjusters arrive. Debris removal planning begins. Animal reunification efforts ramp up. The community is grieving but organizing. Beacon transitions from an emergency tool to a recovery coordination hub."),
        spacer(40),

        heading("User Behaviors", HeadingLevel.HEADING_3),

        userBlock("Displaced Resident (Returning to View Property)", "\uD83C\uDFE0", [
          { screen: "Timeline", action: "Sees: \u201CZone 3 escorted access begins Saturday 9 AM. Register for a time slot.\u201D" },
          { screen: "Timeline (Action Card)", action: "Action Required: \u201CRegister for property access. Select time slot.\u201D Registers for 10 AM." },
          { screen: "Map", action: "Follows escorted route. Sees damage overlay: red = destroyed, orange = major damage, yellow = minor, green = intact." },
          { screen: "Feed > Report", action: "Takes photos of damage for insurance. Posts: \u201COur house is gone. Foundation is all that\u2019s left.\u201D" },
          { screen: "Help Tab", action: "Finds FEMA registration link, insurance filing guide, debris removal signup, and mental health resources." },
        ]),
        spacer(60),

        userBlock("Pet Owner (Separated from Animal)", "\uD83D\uDC3E", [
          { screen: "Help Tab", action: "Posts: \u201CMissing dog. Golden retriever, red collar, last seen on Pine St before evacuation. Name: Buddy.\u201D" },
          { screen: "Feed", action: "Community shares the post widely. Someone at the animal shelter posts: \u201CGolden retriever found near Pine St.\u201D" },
          { screen: "Help > Request", action: "Coordinates via Beacon to identify and recover the dog from the temporary animal shelter." },
          { screen: "Teams > Neighborhood", action: "Updates: \u201CBuddy found! Thank you everyone.\u201D 47 upvotes." },
        ]),
        spacer(60),

        userBlock("Community Organizer (Emerges from Neighborhood Team)", "\uD83E\uDD1D", [
          { screen: "Teams > Neighborhood (Announcements)", action: "Posts: \u201CCommunity recovery meeting Thursday 7 PM at library. Everyone welcome.\u201D" },
          { screen: "Teams > Neighborhood (Board)", action: "Creates structured help board: temporary housing offers, donated supplies inventory, volunteer driver schedule." },
          { screen: "Teams > Neighborhood (Tasks)", action: "Organizes task list: sort donations (Monday), shelter visit (Tuesday), debris removal signup help (Wednesday)." },
          { screen: "Help Tab > Offer", action: "Coordinates volunteers to help displaced families navigate FEMA paperwork." },
        ]),
        spacer(60),

        userBlock("County Emergency Manager", "\uD83C\uDFDB\uFE0F", [
          { screen: "Dashboard > Recovery", action: "Publishes recovery resource hub: FEMA, SBA loans, insurance guidance, mental health hotlines." },
          { screen: "Dashboard > Map", action: "Damage assessment complete: 23 destroyed, 8 major damage, 15 minor damage. Shared as map layer." },
          { screen: "Dashboard > Alerts", action: "Pushes debris removal schedule and hazardous materials warnings for burned areas." },
          { screen: "Dashboard > Comms", action: "Coordinates with school district on reopening timeline. Lincoln Elementary needs air quality clearance." },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // PHASE 8: LONG-TERM RECOVERY
        // ════════════════════════════════════════
        phaseHeader("T+14 days onward", "Phase 8: Recovery Phase 2 \u2014 Rebuilding"),
        spacer(80),
        para("The emergency is over but the recovery has just begun. Displaced families are navigating insurance, temporary housing, and the emotional aftermath. The community is organizing rebuilding efforts, fundraisers, and mutual support. Beacon\u2019s role becomes a long-term coordination platform for the affected community."),
        spacer(40),

        heading("User Behaviors", HeadingLevel.HEADING_3),

        userBlock("Displaced Family", "\uD83C\uDFE0", [
          { screen: "Help Tab", action: "Accesses ongoing resource directory: FEMA status updates, insurance adjuster contacts, contractor referrals." },
          { screen: "Teams > Neighborhood (Board)", action: "Posts: \u201CLooking for contractor recommendations for rebuild. Anyone started the process?\u201D" },
          { screen: "Teams > Neighborhood (Chat)", action: "Stays connected with neighbors going through the same thing. Mutual emotional support." },
          { screen: "Feed", action: "Community fundraiser reaches $45,000. Posts update thanking everyone." },
          { screen: "Teams > DMs", action: "Coordinates with temporary housing host. Updates timeline for finding permanent housing." },
        ]),
        spacer(60),

        userBlock("School Principal", "\uD83C\uDFEB", [
          { screen: "Teams > School (Announcements)", action: "Posts: \u201CLincoln Elementary reopens Monday. Air quality cleared. Counselors available for students.\u201D" },
          { screen: "Teams > School (Board)", action: "Posts resource list for displaced families: school supply replacements, lunch assistance, tutoring." },
          { screen: "Dashboard (Special)", action: "Updates student roster: 3 families relocated out of district. Coordinates transfer paperwork." },
        ]),
        spacer(60),

        userBlock("Community Organizer", "\uD83E\uDD1D", [
          { screen: "Teams > Neighborhood (Announcements)", action: "Monthly community meeting. Posts minutes and action items as Beacon tasks." },
          { screen: "Teams > Neighborhood (Tasks)", action: "Manages ongoing volunteer rotation: meal delivery, debris cleanup, emotional support visits." },
          { screen: "Feed", action: "Posts community wins: \u201C3 families found permanent housing this week. 2 more rebuilding permits approved.\u201D" },
          { screen: "Help Tab", action: "Maintains a living resource directory: updated FEMA links, new grant opportunities, donation drives." },
        ]),
        spacer(60),

        userBlock("County Emergency Manager", "\uD83C\uDFDB\uFE0F", [
          { screen: "Dashboard > After-Action", action: "Begins after-action review. Reviews Beacon event logs, response times, user engagement data." },
          { screen: "Dashboard > Alerts", action: "Posts lessons learned and updated preparedness guidance for next fire season." },
          { screen: "Dashboard > Comms", action: "Coordinates with city council on rebuilding codes, defensible space requirements, and Beacon expansion funding." },
        ]),
        spacer(60),

        userBlock("All Users", "\uD83D\uDCF1", [
          { screen: "Feed", action: "The community feed transitions from emergency mode back to daily use. Fire preparedness posts increase. Community bonds strengthen." },
          { screen: "Teams", action: "Neighborhood team membership up 300% since the fire. Engagement stays high. New teams forming: \u201CRiverside Rebuilds.\u201D" },
          { screen: "Timeline", action: "Historical timeline preserved. Users can look back at the event. Serves as a community record." },
          { screen: "Map", action: "Burn scar visible on map. Rebuilding progress tracked. New defensible space layers added." },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════
        // UI REQUIREMENTS SYNTHESIS
        // ════════════════════════════════════════
        heading("UI Requirements Identified by This Scenario"),
        spacer(40),
        para("Walking through this scenario reveals several UI features and screens that Beacon must have. Below is a synthesis of every screen, feature, and interaction point referenced in the timeline, organized by where they live in the app architecture."),
        spacer(60),

        heading("Feed Tab", HeadingLevel.HEADING_2),
        bullet("Report button (+) with structured report types (fire, flood, road hazard, etc.)"),
        bullet("Upvoting system with engagement-relative-to-group-size ranking"),
        bullet("Auto-grouping of related reports into event clusters"),
        bullet("Verified badge on official team posts"),
        bullet("Sort options: Trending, New, Nearby, Events Only"),
        bullet("Photo attachments on posts with geotagging"),
        bullet("Comment threads for community discussion"),
        bullet("Emergency alert banner at top linking to Timeline"),
        bullet("\u201CI can help\u201D quick-action on help-related posts"),
        spacer(60),

        heading("Timeline Tab", HeadingLevel.HEADING_2),
        bullet("Chronological event stream with color-coded severity"),
        bullet("Pinned Action Required cards at top (evacuation confirmation, wellness checks, forms)"),
        bullet("Embedded response buttons on Action Cards (Evacuating / Staying / Already Left)"),
        bullet("Expandable inline forms (next-of-kin, time slot registration)"),
        bullet("Auto-generated system entries (report spikes, aggregated conditions)"),
        bullet("Official source attribution on government/EMS posts"),
        bullet("Linked content: \u201CView on Map\u201D and \u201CTrack Contacts\u201D deep links"),
        bullet("Date-grouped sections with clear visual separation"),
        bullet("Real-time \u201CLast updated\u201D timestamp"),
        spacer(60),

        heading("Map Tab", HeadingLevel.HEADING_2),
        bullet("Crowdsourced report dots (Phase 1) that transition to authoritative layers (Phase 2+)"),
        bullet("Official fire perimeter drawn by IC, updated in real-time"),
        bullet("Evacuation zone polygons with color coding (warning = yellow, mandatory = red)"),
        bullet("Evacuation routes with real-time traffic/closure status"),
        bullet("Shelter locations with capacity gauges"),
        bullet("Road status overlay (green/yellow/red)"),
        bullet("Utility outage layer with restoration progress"),
        bullet("Damage assessment overlay (destroyed/damaged/intact)"),
        bullet("Wind model and projected fire spread overlay"),
        bullet("User location dot with contact tracking during emergencies"),
        bullet("Burn scar and recovery progress layers (long-term)"),
        spacer(60),

        heading("Help Tab", HeadingLevel.HEADING_2),
        bullet("Request Help / Offer Help split buttons"),
        bullet("Category filters: Transport, Welfare, Pet, Equipment, Housing, Supplies"),
        bullet("Urgency indicators with distance from user"),
        bullet("Responder count per request"),
        bullet("\u201CI Can Help\u201D button that opens a communication bridge"),
        bullet("Skills and equipment profile for matching"),
        bullet("Missing person/pet reports with photo and last known location"),
        bullet("Resource directory: FEMA, insurance, mental health, housing, donations"),
        bullet("Long-term recovery resource hub that persists beyond the emergency"),
        spacer(60),

        heading("Teams Tab", HeadingLevel.HEADING_2),
        bullet("Messages section at top (DMs as two-person teams)"),
        bullet("Team list with unread badges and last message preview"),
        bullet("Inner team view with four sub-tabs:"),
        bullet("   Announcements: admin posts, pinned messages, official updates", "bullets", 1),
        bullet("   Board: help requests, offers, coordination with status tracking", "bullets", 1),
        bullet("   Chat: real-time group messaging", "bullets", 1),
        bullet("   Tasks: assigned action items with owners, status, priority, progress bar", "bullets", 1),
        bullet("Team membership surge support (300% growth post-disaster)"),
        bullet("Communication bridge between strangers during help coordination"),
        bullet("EMS direct communication surfacing as Action Cards on Timeline"),
        spacer(60),

        heading("Dashboard (Paid Clients)", HeadingLevel.HEADING_2),
        bullet("Event creation and protocol activation"),
        bullet("Map with polygon drawing tools (zones, routes, perimeters)"),
        bullet("Alert push system with geofenced targeting"),
        bullet("Evacuation confirmation module with real-time response dashboard"),
        bullet("Resource and personnel management"),
        bullet("Mutual aid request and coordination"),
        bullet("Unified emergency communication channel"),
        bullet("Welfare check dispatch and tracking"),
        bullet("Shelter management with capacity tracking"),
        bullet("Damage assessment and reporting tools"),
        bullet("After-action review and event analytics"),
        bullet("Student roster and parent notification (school special)"),
        bullet("Outage management and repair queue (utility special)"),
        bullet("Road status management (public works special)"),
        bullet("Can A reach B accessibility model"),
        bullet("Public help request dispatch (Categories 1-6)"),

        spacer(200),
        richPara([
          { text: "End of Scenario Simulation", bold: true, italics: true, color: GRAY, size: 22 },
        ], { alignment: AlignmentType.CENTER }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/friendly-bold-bardeen/mnt/beacon/beacon_wildfire_scenario_timeline.docx", buffer);
  console.log("Document created successfully.");
});
