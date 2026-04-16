const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, LevelFormat, VerticalAlign
} = require("docx");

// ── Beacon brand colors ──
const FLAME  = "EA7928";
const PURPLE = "50386A";
const BLUE   = "3881B8";
const LTGRAY = "F5F5F5";
const MEDGRAY = "E0E0E0";
const WHITE  = "FFFFFF";
const BLACK  = "000000";
const RED    = "CC0000";
const DKRED  = "8B0000";

// ── Page dimensions (US Letter, 1" margins) ──
const PAGE_W = 12240;
const PAGE_H = 15840;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - 2 * MARGIN; // 9360

// ── Shared borders ──
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

// ── Helpers ──
function spacer(pts = 200) {
  return new Paragraph({ spacing: { before: pts, after: 0 }, children: [] });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 30 : 26, color: PURPLE })]
  });
}

function subheading(text) {
  return heading(text, HeadingLevel.HEADING_2);
}

function h3(text) {
  return heading(text, HeadingLevel.HEADING_3);
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 80, after: opts.after || 80 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({ text, font: "Arial", size: opts.size || 22, color: opts.color || "333333", bold: !!opts.bold, italics: !!opts.italics })]
  });
}

function richPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 80, after: opts.after || 80 },
    alignment: opts.align || AlignmentType.LEFT,
    children: runs.map(r => new TextRun({ font: "Arial", size: 22, color: "333333", ...r }))
  });
}

function bulletItem(text, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: "333333" })]
  });
}

function richBullet(runs, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { before: 40, after: 40 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 22, color: "333333", ...r }))
  });
}

function phaseBox(title, timeRange) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { fill: PURPLE, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: title, bold: true, font: "Arial", size: 30, color: WHITE }),
              new TextRun({ text: "    " + timeRange, font: "Arial", size: 24, color: FLAME }),
            ]
          })
        ]
      })]
    })]
  });
}

function contextBox(text) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { fill: LTGRAY, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [new Paragraph({
          children: [new TextRun({ text, font: "Arial", size: 21, color: "555555", italics: true })]
        })]
      })]
    })]
  });
}

function realityBox(label, text) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { fill: "FFF3E6", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: label, font: "Arial", size: 20, color: DKRED, bold: true })]
          }),
          new Paragraph({
            children: [new TextRun({ text, font: "Arial", size: 21, color: "444444" })]
          })
        ]
      })]
    })]
  });
}

function beaconBox(label, text) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { fill: "E8F4E8", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: label, font: "Arial", size: 20, color: "1B5E20", bold: true })]
          }),
          new Paragraph({
            children: [new TextRun({ text, font: "Arial", size: 21, color: "333333" })]
          })
        ]
      })]
    })]
  });
}

function comparisonTable(realTitle, realItems, beaconTitle, beaconItems) {
  const colW = Math.floor(CONTENT_W / 2);
  const makeCell = (title, items, headerFill, headerColor, bodyFill) => {
    return [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: colW, type: WidthType.DXA },
            shading: { fill: headerFill, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: title, bold: true, font: "Arial", size: 22, color: headerColor })]
            })]
          }),
        ]
      }),
      ...items.map(item => new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: colW, type: WidthType.DXA },
            shading: { fill: bodyFill, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text: item, font: "Arial", size: 20, color: "333333" })]
            })]
          })
        ]
      }))
    ];
  };

  // Build as two side-by-side columns
  const maxRows = Math.max(realItems.length, beaconItems.length);
  const rows = [];

  // Header row
  rows.push(new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: colW, type: WidthType.DXA },
        shading: { fill: "FFEBEE", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: realTitle, bold: true, font: "Arial", size: 22, color: DKRED })]
        })]
      }),
      new TableCell({
        borders,
        width: { size: colW, type: WidthType.DXA },
        shading: { fill: "E8F5E9", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: beaconTitle, bold: true, font: "Arial", size: 22, color: "1B5E20" })]
        })]
      }),
    ]
  }));

  for (let i = 0; i < maxRows; i++) {
    rows.push(new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: colW, type: WidthType.DXA },
          shading: { fill: "FFF8F8", type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: realItems[i] || "", font: "Arial", size: 20, color: "444444" })]
          })]
        }),
        new TableCell({
          borders,
          width: { size: colW, type: WidthType.DXA },
          shading: { fill: "F8FFF8", type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: beaconItems[i] || "", font: "Arial", size: 20, color: "444444" })]
          })]
        }),
      ]
    }));
  }

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [colW, colW],
    rows
  });
}

// ────────────────────────────────────────────
// MAIN DOCUMENT GENERATION
// ────────────────────────────────────────────
async function generate() {

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: PURPLE },
          paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: "Arial", color: PURPLE },
          paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: BLUE },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ]
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
          ]
        },
        {
          reference: "numbers",
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          ]
        },
      ]
    },
    sections: [

      // ════════════════════════════════════════
      // TITLE PAGE
      // ════════════════════════════════════════
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
          }
        },
        children: [
          spacer(2000),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: "BEACON", font: "Arial", size: 56, bold: true, color: PURPLE })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: "Incident Command Scenario Analysis", font: "Arial", size: 36, color: FLAME })]
          }),
          spacer(400),
          new Table({
            width: { size: CONTENT_W, type: WidthType.DXA },
            columnWidths: [CONTENT_W],
            rows: [new TableRow({
              children: [new TableCell({
                borders: noBorders,
                width: { size: CONTENT_W, type: WidthType.DXA },
                shading: { fill: PURPLE, type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 300, right: 300 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [new TextRun({ text: "The Yarnell Hill Fire", font: "Arial", size: 44, bold: true, color: WHITE })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 60 },
                    children: [new TextRun({ text: "June 28\u201330, 2013  \u2022  Yarnell, Arizona", font: "Arial", size: 26, color: FLAME })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "What would have happened if Beacon existed?", font: "Arial", size: 24, color: "CCCCCC", italics: true })]
                  }),
                ]
              })]
            })]
          }),
          spacer(600),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: "In memory of the 19 members of the Granite Mountain Hotshots", font: "Arial", size: 22, color: "666666", italics: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "who gave their lives on June 30, 2013.", font: "Arial", size: 22, color: "666666", italics: true })]
          }),
          spacer(400),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "This document examines how modern situational awareness technology could address the communication failures that contributed to this tragedy, so that the lessons of Yarnell Hill can save lives in the future.", font: "Arial", size: 20, color: "888888" })]
          }),
        ]
      },

      // ════════════════════════════════════════
      // SECTION 1: WHAT ACTUALLY HAPPENED
      // ════════════════════════════════════════
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
          }
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Beacon \u2022 Yarnell Hill Incident Command Scenario", font: "Arial", size: 18, color: "999999", italics: true })]
            })]
          })
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Page ", font: "Arial", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" })]
            })]
          })
        },
        children: [
          heading("Part 1: What Actually Happened"),
          para("The Yarnell Hill Fire began on June 28, 2013, when lightning struck dry chaparral on a mountainous ridge west of Yarnell, Arizona. Over the next two days, a cascade of communication failures, coordination gaps, and situational awareness breakdowns led to the deadliest wildfire event for firefighters in the United States since 1933.", { before: 120 }),

          subheading("The Fire and the Incident Command Structure"),
          para("The fire was initially managed by a Type 3 Incident Management Team from the Arizona State Forestry Division (ASFD). By the morning of June 30, a more capable Type 2 Incident Management Team was arriving to assume command. The formal transfer of command was announced by radio at 10:22 AM. During this transition, the Granite Mountain Interagency Hotshot Crew (IHC), led by Superintendent Eric Marsh, was assigned as Division Alpha Supervisor on the southwest perimeter."),
          para("The incoming Type 2 Short team lacked critical positions: no safety officers and no division supervisors were in place during the afternoon when conditions deteriorated. This structural gap meant there was no dedicated person tracking crew safety or maintaining communication with the Granite Mountain crew during the most dangerous hours."),

          subheading("The Critical Timeline: June 30, 2013"),

          h3("Morning: Briefing and Deployment"),
          bulletItem("07:00 \u2014 Incoming Type 2 IMT briefs crews. Granite Mountain Superintendent accepts Division Alpha Supervisor role."),
          bulletItem("The crew hikes into the fire area to establish anchor points and build fire line along a ridge road."),
          bulletItem("Brendan McDonough, the youngest crew member, is posted as a lookout on a high point to monitor fire behavior and weather."),

          h3("Early Afternoon: Weather Shift Begins"),
          bulletItem("Thunderstorm cells begin building to the north and east. Outflow winds from these storms push erratically toward the fire."),
          bulletItem("15:26 \u2014 Officials receive word of heavy winds from a thunderstorm moving into the area."),
          bulletItem("The fire begins pushing aggressively southeast toward Yarnell. Other crews shift to evacuation and structure protection."),
          bulletItem("Only the Granite Mountain Hotshots remain on the southwest perimeter, on the ridge."),

          h3("15:30\u201316:00: Air Support Collapses"),
          bulletItem("Officials request six heavy air tankers \u2014 half of the available western U.S. fleet."),
          bulletItem("Only one tanker is available on scene, making multiple retardant drops."),
          bulletItem("Two tankers flying from Albuquerque and Durango are diverted en route to serve the Dean Peak Fire near Kingman."),
          bulletItem("Five of the six requested tankers never arrive. Dangerous weather conditions and fleet limitations prevent deployment."),

          h3("16:00\u201316:04: The Lookout Retreats"),
          bulletItem("McDonough radios Superintendent Marsh: weather is changing rapidly, wind direction has shifted, fire spread direction has changed."),
          bulletItem("McDonough is forced to abandon his lookout position as fire threatens to overtake it."),
          bulletItem("The crew is in the \u201Cblack\u201D (already burned, safe area) on top of the ridge. Personnel who communicate with them at this time assume they will stay there."),

          h3("16:04\u201316:37: The 33-Minute Silence"),
          realityBox(
            "THE CRITICAL FAILURE",
            "For 33 minutes, there is no communication from the Granite Mountain crew. No one at Incident Command contacts them. No one realizes they have left the safety of the burned area. The investigation later found the crew left the black sometime after 16:04 and began hiking southeast, down into an unburned box canyon, taking the most direct route toward Boulder Springs Ranch \u2014 a safety zone identified during the morning briefing. They hiked a two-track road for about 15 minutes, then left the road and descended into heavy brush. The reasons for this decision remain unknown."
          ),
          spacer(100),
          para("The investigation cited multiple factors in this communication gap: radios not programmed with appropriate tone guards, heavy radio traffic on shared channels, possible radio dead zones in the terrain, and a culture of avoiding channel congestion. Brief, informal, and vague radio transmissions made it impossible to reconstruct the crew's intentions or location.", { before: 120 }),

          h3("16:37\u201316:42: Final Contact and Entrapment"),
          bulletItem("16:37 \u2014 The crew reestablishes radio contact. They are in the box canyon, surrounded by unburned fuel."),
          bulletItem("The fire, driven by thunderstorm outflow winds at 10\u201312 miles per hour, has swept around and below them."),
          bulletItem("The crew has less than two minutes to attempt a deployment site. They use chainsaws to clear brush and attempt a burnout."),
          bulletItem("16:42 \u2014 The fire overtakes the deployment site. Direct flame contact and extreme temperatures in the box canyon are unsurvivable."),
          bulletItem("19 firefighters are killed. Brendan McDonough, still at his abandoned lookout position area, is the sole survivor."),

          new Paragraph({ children: [new PageBreak()] }),

          subheading("Root Causes: What Failed"),
          comparisonTable(
            "What Failed at Yarnell Hill",
            [
              "No real-time location tracking of ground crews",
              "33-minute communication blackout with no alarm triggered",
              "Radios not programmed with correct tone guards",
              "Heavy radio traffic caused missed/delayed transmissions",
              "No shared visual of crew positions relative to fire",
              "Air support diverted without ground crews being informed",
              "IMT lacked safety officers during critical afternoon",
              "Lookout warnings did not propagate to all commanders",
              "No mechanism to alert IC that crew left safety zone",
              "Weather shift information fragmented across channels",
            ],
            "What Beacon Is Designed to Solve",
            [
              "GPS tracking shows every crew member on shared map",
              "Automatic alerts when any unit goes silent beyond threshold",
              "Digital communication eliminates radio programming errors",
              "Layered communication prevents channel congestion",
              "Shared operational map is the single source of truth",
              "Air coordination visible to all connected teams",
              "Role assignments tracked digitally with gap alerts",
              "Announcements propagate to all team members instantly",
              "Geofence alerts when crews move into hazard zones",
              "Weather data pushed to all users with location context",
            ]
          ),
        ]
      },

      // ════════════════════════════════════════
      // SECTION 2: THE BEACON REPLAY
      // ════════════════════════════════════════
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
          }
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Beacon \u2022 Yarnell Hill Incident Command Scenario", font: "Arial", size: 18, color: "999999", italics: true })]
            })]
          })
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Page ", font: "Arial", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" })]
            })]
          })
        },
        children: [
          heading("Part 2: The Beacon Replay"),
          para("We now replay the same fire, the same terrain, the same weather, the same crews \u2014 but with Beacon deployed across the incident. This is not about hindsight. It is about showing, minute by minute, how shared situational awareness changes the decisions that get made when lives are at stake.", { before: 120 }),

          // ── PHASE 1: PRE-DEPLOYMENT ──
          spacer(200),
          phaseBox("Phase 1: Pre-Deployment Setup", "June 28\u201329 (Before Granite Mountain arrives)"),
          spacer(100),
          contextBox("The fire has been burning for 24+ hours. A Type 3 team is managing. The Type 2 IMT is preparing to assume command on the morning of June 30. Granite Mountain Hotshots are en route from Prescott."),
          spacer(100),

          h3("Incident Command Post (ICP) Setup on Beacon"),
          bulletItem("The Type 2 Incident Commander creates the incident on Beacon: \u201CYarnell Hill Fire \u2014 IC-402.\u201D"),
          bulletItem("Beacon auto-generates the ICS team structure: Command, Operations, Plans, Logistics, Finance sections."),
          bulletItem("The IC invites division supervisors, branch directors, and all inbound crew superintendents to the Beacon incident group."),
          bulletItem("Air Operations is added as a sub-team. Helicopter and tanker crews are linked to the group. Their tail numbers and current assignments are visible on the shared map."),
          bulletItem("The IC uploads the current fire perimeter as a map overlay. Weather forecasts are pinned as an Announcement in the incident group."),

          h3("Backup Crew Arrival and Onboarding"),
          para("This is where the Incident Command onboarding flow becomes critical. In 2013, arriving crews received a verbal briefing and a paper map. On Beacon, the process is structured:"),
          spacer(60),
          richBullet([
            { text: "Step 1 \u2014 QR Code Check-In: ", bold: true },
            { text: "At the ICP staging area, a printed QR code links to the Beacon incident group. Each arriving crew superintendent scans it, which simultaneously checks their crew into the incident roster and grants them access to the shared map, announcements, and coordination channels." },
          ]),
          richBullet([
            { text: "Step 2 \u2014 Digital Briefing Package: ", bold: true },
            { text: "The crew superintendent immediately receives the current Incident Action Plan (IAP): fire perimeter overlay, weather forecast, division assignments, hazard zones, safety zones, escape routes, and communication plan \u2014 all on the map they can pinch-zoom on their phone." },
          ]),
          richBullet([
            { text: "Step 3 \u2014 Paper Map + Digital Backup: ", bold: true },
            { text: "Crews still receive a paper topographic map with safety zones and escape routes marked. But now it is a printout of the same map everyone sees on Beacon, so there is no discrepancy between what is on paper and what is on screen. If conditions change, the digital map updates. The paper map is the fallback." },
          ]),
          richBullet([
            { text: "Step 4 \u2014 Role Assignment: ", bold: true },
            { text: "The Operations Section Chief assigns Granite Mountain as Division Alpha on Beacon. The assignment is visible to everyone in the incident group. Eric Marsh's name and crew appear on the map at their assigned division." },
          ]),
          richBullet([
            { text: "Step 5 \u2014 Comms Check: ", bold: true },
            { text: "Before deploying, each crew confirms Beacon connectivity. If any crew member's phone shows weak signal, this is flagged on the IC's dashboard. The crew designates a \u201Ccomms relay\u201D member if needed \u2014 one person who stays at higher elevation to maintain connectivity for the group." },
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PHASE 2: MORNING OPERATIONS ──
          phaseBox("Phase 2: Morning Operations", "June 30, 07:00\u201314:00"),
          spacer(100),
          contextBox("The Granite Mountain crew hikes to the southwest perimeter. McDonough is posted as a lookout. The fire is active but manageable. The Type 2 IMT formally assumes command at 10:22 AM."),
          spacer(100),

          h3("What Beacon Shows"),
          bulletItem("The shared map displays all crew positions via GPS tracking. Granite Mountain's 20 blue dots cluster along the ridge as they build fire line."),
          bulletItem("McDonough's position is marked as \u201CLookout \u2014 Alpha Division\u201D on the map. His elevated position shows strong connectivity."),
          bulletItem("The fire perimeter is being updated by Air Operations as spotter aircraft fly overhead. The perimeter polygon expands on everyone's map in near real-time."),
          bulletItem("At 10:22, the IC posts an Announcement: \u201CCommand transfer complete. Type 2 IMT now in command. All divisions confirm receipt.\u201D Each division supervisor, including Marsh, taps \u201CConfirmed\u201D on the Action Required card."),

          h3("Helicopter Coordination Begins"),
          para("A single heavy air tanker is making retardant drops. On Beacon:"),
          bulletItem("The tanker's flight path is visible on the map. Ground crews can see where drops are being targeted."),
          bulletItem("Air Operations posts drop coordinates in the Air Ops sub-team chat. Ground crews near the drop zone receive an automatic proximity alert: \u201CRetardant drop inbound within 0.5 mi of your position. Seek cover.\u201D"),
          bulletItem("When the tanker returns to reload, its ETA back to the fire is visible. Ground crews know exactly how long they are without air cover."),

          // ── PHASE 3: THE WEATHER SHIFT ──
          spacer(200),
          phaseBox("Phase 3: The Weather Shift", "June 30, 14:00\u201315:30"),
          spacer(100),
          contextBox("Thunderstorm cells build to the north. Outflow winds begin pushing toward the fire. The fire behavior starts to change. This is where the sequence of events begins to diverge from reality."),
          spacer(100),

          h3("Automated Weather Alerts"),
          bulletItem("Beacon's weather integration detects the approaching thunderstorm outflow. A red weather alert auto-posts to the incident Announcements: \u201CWEATHER ALERT: Thunderstorm outflow approaching from NNE. Expect erratic wind shifts 15\u201325 mph within 30 minutes.\u201D"),
          bulletItem("This alert surfaces as an Action Required card on every connected user's Timeline. No one has to hear it on a crowded radio channel. No one has to be tuned to the right frequency. Everyone sees it."),
          bulletItem("The IC pins a follow-up Announcement: \u201CAll divisions: confirm crew positions and escape routes. Report any concerns.\u201D"),

          h3("The Difference: Forced Acknowledgment"),
          realityBox(
            "WHAT HAPPENED IN REALITY",
            "Weather shift information reached some commanders through radio but did not propagate uniformly. McDonough radioed Marsh directly about the wind change, but this critical weather intelligence did not reach the IC or other division supervisors through any systematic mechanism. There was no confirmation loop."
          ),
          spacer(60),
          beaconBox(
            "WHAT HAPPENS ON BEACON",
            "The weather alert requires acknowledgment. The IC's dashboard shows a status board: which divisions have confirmed, which have not. If Granite Mountain does not acknowledge within 5 minutes, the IC sees a yellow warning: \u201CDivision Alpha has not confirmed weather alert.\u201D If 10 minutes pass, it escalates to red. Someone reaches out. The 33-minute silence cannot happen."
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PHASE 4: AIR SUPPORT CRISIS ──
          phaseBox("Phase 4: Air Support Crisis", "June 30, 15:30\u201316:00"),
          spacer(100),
          contextBox("Officials request six heavy air tankers. Only one is on scene. Two en route from Albuquerque and Durango are diverted to the Dean Peak Fire. Dangerous weather grounds others."),
          spacer(100),

          h3("Air Support Coordination on Beacon"),
          bulletItem("When the request for six tankers goes out, it is logged in the Air Ops sub-team with current fleet status. Every tanker's location and assignment is visible on the map."),
          bulletItem("When the two inbound tankers are diverted, Air Operations posts an Announcement: \u201CTanker 42 and Tanker 67 diverted to Dean Peak Fire. No additional tankers available. Current air support: Tanker 21 only, 15-minute reload cycle.\u201D"),
          bulletItem("This is the critical information that in reality did not reach ground crews. On Beacon, every division supervisor sees it immediately. Marsh would see it. The Operations Section Chief sees it."),

          h3("Impact on Decision-Making"),
          para("When a crew superintendent sees that air support has collapsed to a single tanker with a 15-minute reload cycle, and that a thunderstorm outflow is about to hit, the risk calculus changes immediately. The crew knows they cannot count on air cover. This is the kind of information that drives a crew to consolidate in the black and wait."),
          spacer(60),
          beaconBox(
            "BEACON\u2019S ROLE",
            "Beacon does not make decisions for the crew. But it ensures the crew has the same information the IC has. The asymmetry of information \u2014 where the IC knows air support has collapsed but the crew on the ridge does not \u2014 is eliminated."
          ),

          // ── PHASE 5: THE 33 MINUTES ──
          spacer(200),
          phaseBox("Phase 5: The 33 Minutes", "June 30, 16:04\u201316:37"),
          spacer(100),
          contextBox("In reality, this is the gap. No communication from Granite Mountain for 33 minutes. No one at IC contacts them. No one knows they have left the black. They descend into the box canyon. The fire sweeps around below them."),
          spacer(100),

          h3("What Beacon Shows at 16:04"),
          bulletItem("McDonough's lookout position has been abandoned \u2014 his GPS dot has moved away from the marked lookout point. Beacon flags this: \u201CLookout Alpha has left designated position.\u201D"),
          bulletItem("The Granite Mountain crew's 20 GPS dots are clustered in the black on the ridge. This is visible to the IC, to Operations, to every division supervisor."),

          h3("What Beacon Shows at 16:10"),
          bulletItem("The crew's GPS dots begin moving southeast, away from the black, off the ridge, and downslope toward the unburned drainage."),
          bulletItem("Beacon's geofence system triggers: \u201CALERT: Division Alpha crew moving out of burned safety zone into unburned fuel. Current wind: NNE 20 mph. Fire moving SE at estimated 10\u201312 mph.\u201D"),
          bulletItem("This alert fires on the IC's dashboard, the Operations Section Chief's phone, and the Safety Officer's phone (if one had been assigned). It is not a radio call that can be missed. It is a persistent red card at the top of the Timeline that requires acknowledgment."),

          h3("What Beacon Shows at 16:15"),
          bulletItem("The crew has been moving through unburned terrain for 5 minutes. Their bearing is toward Boulder Springs Ranch."),
          bulletItem("The IC can see both the crew's position and the fire's estimated spread on the same map. The fire polygon, updated by air observation, is sweeping southeast \u2014 the same direction the crew is moving, but faster."),
          bulletItem("Beacon calculates an estimated time to intersection: the fire's leading edge will reach the crew's projected path within approximately 20 minutes at current rate of spread."),

          h3("What the Crew Sees on Their Own Phones"),
          para("This is the part that changes everything. In 2013, the crew's only tools for reading the fire were their own eyes, their training, and a radio. They could not see over the ridge. They could not see the fire's behavior on the other side of the drainage. They were making a life-or-death navigation decision with line-of-sight information only. On Beacon, every crew member with a phone can see:", { before: 120 }),
          spacer(60),

          richBullet([
            { text: "Projected Fire Path: ", bold: true },
            { text: "The map shows the fire's current perimeter and a projected spread polygon based on wind speed, wind direction, terrain slope, and fuel type. The projection updates as conditions change. At 16:15, the projection shows the fire sweeping southeast through the drainage below the crew at 10\u201312 mph \u2014 and curving around toward Boulder Springs Ranch from the west. The crew can see, on the map in their hands, that the fire will reach the ranch before they do." },
          ]),
          richBullet([
            { text: "Fire Intensity Data: ", bold: true },
            { text: "Infrared data from aerial assets and MODIS/VIIRS satellite passes is overlaid on the map as a heat gradient. The chaparral in the drainage they are about to descend into is dense, dry, and unburned \u2014 conditions that produce flame lengths of 20\u201330 feet and temperatures exceeding 2,000\u00B0F. The heat overlay shows the fire burning at extreme intensity on the northeast flank. This is not a creeping ground fire they can outrun. The map makes the severity visible in a way that looking at smoke columns from a ridge cannot." },
          ]),
          richBullet([
            { text: "Deployment Site Analysis: ", bold: true },
            { text: "Beacon's map layer shows terrain classification: vegetation density, slope angle, and clearings. Between the crew's current position in the black and Boulder Springs Ranch, the route passes through 600 meters of unburned box canyon choked with brush, manzanita, and Gambel oak \u2014 flashy fuels that burn fast and hot. There are no clearings. No rock outcrops. No previously burned areas. No flat ground with mineral soil. The map shows, in plain visual terms, that there is nowhere to deploy fire shelters along this route that would be survivable. The entire path is fuel." },
          ]),
          richBullet([
            { text: "Escape Route Comparison: ", bold: true },
            { text: "Beacon highlights two options: (1) Return to the black \u2014 300 meters uphill, 10\u201315 minutes, into already-burned ground where the fire cannot reach them. (2) Continue to Boulder Springs Ranch \u2014 600+ meters through unburned drainage, 25\u201330 minutes on foot, with fire projected to arrive in 20 minutes. The map draws both routes with estimated travel time and shows the fire's projected position at the time the crew would arrive at each destination. Route 1 is green. Route 2 is red." },
          ]),

          spacer(100),
          realityBox(
            "WHAT THE CREW COULD NOT SEE IN 2013",
            "Eric Marsh was one of the most experienced wildland firefighters in the country. But he was making this decision from a ridge, looking at smoke, feeling the wind, reading terrain he had only seen on a paper topo map that morning. He could not see the fire's actual rate of spread on the far side of the drainage. He could not see that the outflow winds were about to push the fire directly into his path. He could not see that there was no survivable deployment site between the black and the ranch. He was navigating blind through the most dangerous 30 minutes of the fire. No amount of experience can replace information you physically cannot see."
          ),
          spacer(60),
          beaconBox(
            "WHAT BEACON PUTS IN THE CREW\u2019S HANDS",
            "Marsh opens his phone and sees the same map the IC sees. The fire projection is sweeping around below him. The drainage is a wall of red on the heat overlay. The route to the ranch is marked red with a timestamp showing the fire arrives before they do. The route back to the black is marked green \u2014 10 minutes uphill, into safety. He does not need the IC to call him. He does not need to hear it on a crowded radio channel. The information is in his hand, and it is unambiguous. Twenty experienced firefighters, looking at that map, do not walk into that canyon."
          ),

          spacer(100),
          h3("What the IC Sees Simultaneously"),
          para("Even if Marsh's phone loses signal as the crew descends into the drainage, the IC at the command post has already seen the movement:"),
          bulletItem("Twenty GPS dots moving from green (safe, burned) terrain into red (unburned, in the fire's projected path)."),
          bulletItem("The fire projection polygon and the crew's projected route intersecting on the map within 20 minutes."),
          bulletItem("Zero identified deployment sites along the crew's route \u2014 the terrain analysis is the same one the crew can see."),
          bulletItem("An unacknowledged weather alert from 15 minutes ago still showing yellow on the Division Alpha status row."),
          spacer(60),
          beaconBox(
            "THE IC\u2019S RESPONSE",
            "The IC immediately radios Granite Mountain: \u201CAlpha, IC. I show your crew moving SE into unburned fuel. Fire projection has it in your path within 20 minutes. I see no deployment sites along your route. Return to the black immediately. Confirm.\u201D If Marsh has a tactical reason for the move, he explains it \u2014 and the IC can evaluate it against the shared map. If Marsh cannot be reached, the IC escalates to emergency protocol. This is not a suggestion. This is the IC seeing 20 people walking toward a fire with no survivable ground between them and their destination."
          ),

          new Paragraph({ children: [new PageBreak()] }),

          h3("The Helicopter Factor"),
          para("In the Beacon replay, Air Operations sees the same alert. The single available tanker is currently on a reload cycle. On Beacon:"),
          bulletItem("Air Ops posts to the incident Announcements: \u201CTanker 21 is 8 minutes from reload complete. Requesting priority retardant line between Alpha crew and advancing fire front.\u201D"),
          bulletItem("The tanker pilot can see the crew's position on the air operations display. The drop coordinates are placed to create a retardant line between the crew and the fire, buying time."),
          bulletItem("If any helicopters are in the area (even from other incidents), Mutual Aid requests go out through Beacon with the crew's GPS position and the fire's bearing. \u201C20 firefighters in unburned fuel with fire closing at estimated 10 mph. Any available rotary wing asset respond.\u201D"),
          para("None of this coordination was possible in 2013 because the tanker pilots did not know where the crew was, the crew did not know where the tankers were, and the IC did not know the crew had moved.", { italics: true, color: "666666" }),

          // ── PHASE 6: WHAT CHANGES ──
          spacer(200),
          phaseBox("Phase 6: The Divergence Point", "June 30, 16:10 (Beacon timeline)"),
          spacer(100),
          contextBox("This is the moment where the Beacon timeline diverges from reality. In reality, the crew continued into the box canyon for another 27 minutes without contact. On Beacon, the geofence alert fires within minutes of the crew leaving the black."),
          spacer(100),

          h3("Most Likely Beacon Outcome"),
          para("Based on the information Beacon would have surfaced, the most probable sequence:"),
          spacer(60),
          richBullet([
            { text: "16:10 \u2014 ", bold: true },
            { text: "Geofence alert fires. IC sees Granite Mountain moving into unburned fuel." },
          ]),
          richBullet([
            { text: "16:11 \u2014 ", bold: true },
            { text: "IC contacts Marsh via Beacon message and radio: \u201CAlpha, your crew is showing movement into the green. What is your situation?\u201D" },
          ]),
          richBullet([
            { text: "16:12\u201316:14 \u2014 ", bold: true },
            { text: "Marsh responds. Two scenarios:" },
          ]),
          spacer(60),

          para("Scenario A \u2014 Most Likely: The crew never leaves the black in the first place. Marsh pulls out his phone before making the decision to move. He sees the projected fire path sweeping through the drainage between his position and the ranch. He sees the heat intensity overlay showing extreme fire behavior in the chaparral below. He sees the terrain analysis: no clearings, no rock, no mineral soil, no survivable deployment site along the entire route. He sees the fire arriving at Boulder Springs Ranch before his crew can get there on foot. He sees the route back into the black marked green: 10 minutes uphill into already-burned ground where the fire physically cannot reach them. He tells his crew to stay in the black. They wait. The fire passes below them. Everyone goes home.", { before: 60 }),

          para("Scenario B: Marsh has already begun moving and the geofence alert fires. The IC contacts him and relays the same information Marsh can see on his own map: fire projection intersects his route, no deployment sites along the path, return to the black. Marsh turns the crew around. They are back in safety within 10\u201315 minutes.", { before: 120 }),

          para("Scenario C: Marsh cannot be reached (radio dead zone in the canyon). The IC sees 20 dots descending into a drainage with no response. This triggers an emergency protocol. Air Operations is directed to divert the tanker to lay retardant between the fire and the crew's last known position. A helicopter, if available, is dispatched to make visual contact and drop communication. The IC contacts adjacent divisions to attempt relay communication. Even in this worst-case Beacon scenario, the alarm is raised at 16:10 \u2014 not 16:37. That is 27 additional minutes of response time.", { before: 120 }),

          para("In every scenario, the information asymmetry is eliminated. The crew sees the fire. The IC sees the crew. The 33-minute silence cannot happen. And the most likely outcome is that the decision to enter the canyon is never made at all, because the map makes the danger impossible to miss.", { before: 120, bold: true }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PHASE 7: BACKUP CREW COORDINATION ──
          phaseBox("Phase 7: Backup Crew Coordination", "The Broader IC Challenge"),
          spacer(100),
          contextBox("Beyond the Granite Mountain crew, the Yarnell Hill Fire involved dozens of resources that needed to be tracked, briefed, and coordinated. This section examines the full Incident Command workflow on Beacon."),
          spacer(100),

          h3("New Crew Arrival During Active Operations"),
          para("When a backup crew arrives at an active, escalating incident, the onboarding process is critical. In 2013, the Type 2 IMT was still getting organized when conditions deteriorated. On Beacon, the process is:"),
          spacer(60),

          richBullet([
            { text: "Scan and Join: ", bold: true },
            { text: "The arriving crew superintendent scans the incident QR code at staging. Their entire crew appears on the map as gray dots (staged, not yet deployed). The IC's resource board updates: \u201CCrew 7 checked in, 18 personnel, staged at ICP.\u201D" },
          ]),
          richBullet([
            { text: "Receive Digital IAP: ", bold: true },
            { text: "The current Incident Action Plan \u2014 including all updates since original publication \u2014 is immediately available. The crew does not receive a morning briefing that is already 8 hours out of date. They see the current fire perimeter, current weather, current resource positions, current hazards." },
          ]),
          richBullet([
            { text: "Paper Map Print: ", bold: true },
            { text: "At the ICP, a printer (or pre-printed stack) produces paper maps that exactly match the digital map. Safety zones, escape routes, and hazard areas are marked. The paper map is annotated with the crew's specific assignment once given." },
          ]),
          richBullet([
            { text: "Assignment and Deployment: ", bold: true },
            { text: "The Operations Section Chief assigns the crew to a division on Beacon. The assignment triggers: (1) the crew is added to that division's sub-team, (2) the crew's dots change from gray to blue on the map, (3) the division supervisor gets a notification: \u201CCrew 7 assigned to your division.\u201D" },
          ]),
          richBullet([
            { text: "Connectivity Verification: ", bold: true },
            { text: "Before the crew walks into the field, Beacon verifies their connectivity. If their assigned area has known dead zones, this is flagged. The IC can assign a relay position or satellite communication device." },
          ]),

          h3("Helicopter Water Drop Coordination"),
          para("Coordinating air drops with ground crews is one of the most dangerous aspects of wildfire operations. Miscommunication about drop locations can injure or kill ground personnel. On Beacon:"),
          spacer(60),

          richBullet([
            { text: "Shared Drop Map: ", bold: true },
            { text: "Air Operations places a drop request pin on the map with coordinates, bearing, and target. The pin is visible to both the helicopter pilot and the ground crews near the drop zone." },
          ]),
          richBullet([
            { text: "Proximity Warnings: ", bold: true },
            { text: "When a drop is approved, any ground crew within the danger radius receives an automatic alert: \u201CWater/retardant drop inbound at [coordinates], ETA 3 minutes. Clear the area.\u201D The crew supervisor taps \u201CCleared\u201D to confirm. If not confirmed, the pilot is notified to hold." },
          ]),
          richBullet([
            { text: "Drop Effectiveness Reporting: ", bold: true },
            { text: "After a drop, ground crews can post to the Board: \u201CDrop landed 50m north of target. Fire still advancing on south flank.\u201D Air Operations adjusts. This feedback loop \u2014 which in 2013 relied on radio calls that competed with dozens of other transmissions \u2014 is now its own dedicated channel." },
          ]),
          richBullet([
            { text: "Reload Cycle Visibility: ", bold: true },
            { text: "Ground crews see when the helicopter departs to reload and when it will return. They know exactly how long they are without air cover. This changes tactical decisions: if air cover is 20 minutes away, a crew digs in rather than advancing." },
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          h3("Division Supervisor Dashboard"),
          para("Each division supervisor on Beacon has a dashboard view that shows:"),
          bulletItem("All assigned crews with member count, current GPS position, and connectivity status"),
          bulletItem("Active hazard zones and escape routes for their division"),
          bulletItem("Weather data specific to their geographic area"),
          bulletItem("Unacknowledged alerts \u2014 any crew that has not confirmed a weather alert or safety directive"),
          bulletItem("Air support status: which aircraft are assigned to their area, ETA, and fuel/load status"),
          bulletItem("Tasks assigned to their division with completion status"),
          spacer(60),
          para("In 2013, division supervisors managed all of this via radio, paper, and memory. The cognitive load was enormous, and critical information was routinely lost in the noise. Beacon does not replace the division supervisor's judgment. It gives them the information they need to exercise it."),

          // ── PHASE 8: THE TOWN EVACUATION ──
          spacer(200),
          phaseBox("Phase 8: Evacuating Yarnell", "June 30, 15:50\u201318:00"),
          spacer(100),
          contextBox("Yarnell is a retirement community of approximately 650 people. The median age is 69.5 years old. Many residents are elderly, live alone, and have limited mobility. The town sits along State Route 89, which descends Yarnell Hill \u2014 a 1,300-foot drop in four miles. When the fire shifts direction at 15:50 and pushes southeast toward town, the entire community must evacuate on one highway. In reality, two shelters were set up: one at Yavapai College in Prescott and one at Wickenburg High School, because the closure of SR 89 north of Yarnell cut off some evacuees from reaching Prescott. 351 people spent at least one night in a shelter."),
          spacer(100),

          h3("The Evacuation Order on Beacon"),
          para("At 15:50, the fire shifts. The IC and the Sheriff\u2019s Deputy see it on the map simultaneously \u2014 the fire projection polygon swings southeast and overlays the west edge of Yarnell within 20 minutes. The Deputy issues the evacuation order as an Action Required card pushed to every Beacon user in the evacuation zone:"),
          spacer(60),
          richPara([
            { text: "\u201CEVACUATION ORDER: ", bold: true },
            { text: "All Yarnell residents: evacuate immediately. Take SR 89 south toward Wickenburg or north toward Prescott. Fire is approaching from the west. Confirm your evacuation status below.\u201D" },
          ]),
          spacer(60),
          para("The card has three response buttons:"),
          bulletItem("\u201CEvacuating Now\u201D \u2014 I am leaving."),
          bulletItem("\u201CEvacuated\u201D \u2014 I am already out of town."),
          bulletItem("\u201CNeed Assistance\u201D \u2014 I cannot evacuate on my own. This expands to: reason, address, number of people, mobility limitations, pets or animals."),

          h3("Building-by-Building Evacuation Status"),
          para("As residents respond, the map of Yarnell transforms into a real-time evacuation dashboard. Every building has a color:"),
          spacer(60),
          richBullet([
            { text: "Green: ", bold: true },
            { text: "Confirmed evacuated. The resident tapped \u201CEvacuating Now\u201D or \u201CEvacuated,\u201D and their GPS confirms they have left the zone. The building marker turns green." },
          ]),
          richBullet([
            { text: "Yellow: ", bold: true },
            { text: "Evacuation order received but not yet confirmed. The alert was delivered to the resident\u2019s phone but they have not responded." },
          ]),
          richBullet([
            { text: "Red: ", bold: true },
            { text: "\u201CNeed Assistance\u201D flagged. Someone at this address cannot evacuate on their own. These are the highest priority." },
          ]),
          richBullet([
            { text: "Gray: ", bold: true },
            { text: "No Beacon user registered at this address. Unknown status. These also need physical checks." },
          ]),
          spacer(60),
          para("The Deputy can see at a glance: how many buildings are green, how many are still yellow, how many are red, and how many are gray. She focuses on red first, then gray. She does not waste time knocking on doors that are already empty.", { bold: true }),

          spacer(100),
          realityBox(
            "WHAT HAPPENED IN REALITY",
            "The evacuation of Yarnell was chaotic. With a median age of 69.5, many residents had limited mobility, did not drive, or were confused about where to go. Some residents did not learn about the evacuation until the fire was already visible from their homes. The closure of SR 89 north of town meant that some evacuees who headed toward Prescott were cut off and had to be redirected to Wickenburg \u2014 a completely different direction. There was no centralized view of who had evacuated and who had not. Deputies went door to door without knowing which homes were empty and which still had people inside."
          ),

          new Paragraph({ children: [new PageBreak()] }),

          h3("The Retirement Community Challenge"),
          para("A median age of 69.5 means this is not a typical evacuation. A large portion of Yarnell\u2019s residents are in their 70s, 80s, and 90s. Many live alone. Many do not drive. Some have mobility impairments. Some have oxygen tanks, walkers, or wheelchairs. Some will not leave without their pets. This is the hardest evacuation scenario there is \u2014 and Beacon\u2019s Help system is built for exactly this.", { before: 120 }),
          spacer(60),

          para("Within minutes of the evacuation order, the Help tab fills with \u201CNeed Assistance\u201D requests:"),
          spacer(60),
          richBullet([
            { text: "Dorothy, 84: ", bold: true },
            { text: "\u201CNo car. Use a walker. I have two cats. 218 Hillside Drive.\u201D Red pin appears on the map." },
          ]),
          richBullet([
            { text: "Harold, 78: ", bold: true },
            { text: "\u201CMy wife has dementia. We cannot drive. Need transport for two people. 305 Sunset Road.\u201D Red pin." },
          ]),
          richBullet([
            { text: "Gene, 91: ", bold: true },
            { text: "\u201COn oxygen. Cannot move fast. No transportation. 112 Main Street.\u201D Red pin." },
          ]),
          richBullet([
            { text: "Margaret, 76: ", bold: true },
            { text: "\u201CI can drive but I am not leaving without my three dogs. I need help loading them. 440 Ridge Road.\u201D Red pin." },
          ]),
          spacer(60),
          para("Four red pins. Four people (six total including Harold\u2019s wife) who will not make it out without help. In a town with a median age this high, there are likely 20 or 30 more."),

          h3("Neighbors Responding to Neighbors"),
          para("But Yarnell is a community. People know each other. And on Beacon, they can see who needs help."),
          spacer(60),

          richBullet([
            { text: "Jim, 62, retired contractor: ", bold: true },
            { text: "Sees Dorothy\u2019s red pin two doors down. He walks over, helps her into his truck, puts the cat carriers in the back seat. He taps \u201CI\u2019m helping this person\u201D on Dorothy\u2019s request. The status updates: \u201CAssistance in progress \u2014 Jim R.\u201D The Deputy sees it. One less red pin to dispatch someone to. When Jim and Dorothy are in the truck heading south on SR 89, Dorothy taps \u201CEvacuated.\u201D Her building turns green. Jim\u2019s building was already green. Dorothy\u2019s assistance request is resolved and removed from the Help queue." },
          ]),
          richBullet([
            { text: "Susan, 55, part-time nurse: ", bold: true },
            { text: "Sees Gene\u2019s pin \u2014 he\u2019s on oxygen. She has medical knowledge and a car. She drives to his house, helps him into her car with his portable oxygen, and loads his tank. She claims his request on Beacon. Gene\u2019s pin goes from red to yellow (help en route) and then disappears entirely when they clear the evacuation zone." },
          ]),
          richBullet([
            { text: "Tom and Linda, 68: ", bold: true },
            { text: "Have a Suburban with room. They see Harold\u2019s pin and know the couple. They drive over, help Harold\u2019s wife into the back seat, load their essentials. Harold taps \u201CI got my ride.\u201D The pin is removed from the map. Harold and his wife are on their way to Wickenburg." },
          ]),
          richBullet([
            { text: "A younger resident with an SUV: ", bold: true },
            { text: "Sees Margaret\u2019s request about the three dogs. Drives over, helps load the dogs in his vehicle. Margaret follows in her own car. She taps \u201CEvacuated\u201D once she confirms the dogs are loaded and she is leaving. Her pin disappears." },
          ]),

          spacer(100),
          beaconBox(
            "THE HELP REQUEST LIFECYCLE",
            "Every assistance request follows the same three-state lifecycle: (1) Open \u2014 red pin on the map, visible to all, in the active Help queue. (2) Claimed \u2014 a neighbor or volunteer taps \u201CI\u2019m helping.\u201D The pin turns yellow. The requester gets a notification: \u201CJim is on his way.\u201D The Deputy sees the request is being handled. (3) Fulfilled \u2014 the requester confirms evacuation or their GPS shows them leaving the zone. The pin is removed from the map entirely. Resolved requests do not clutter the interface. The Deputy always sees only the outstanding needs."
          ),

          new Paragraph({ children: [new PageBreak()] }),

          h3("The Ride Request System"),
          para("Beyond \u201CNeed Assistance,\u201D there is a specific \u201CI Need a Ride\u201D category on the Help tab. In a town where many elderly residents do not drive, this is the most critical feature during evacuation.", { before: 120 }),
          spacer(60),

          richBullet([
            { text: "Step 1 \u2014 Request: ", bold: true },
            { text: "A resident taps \u201CI Need a Ride.\u201D They enter their address, number of people, and special needs (wheelchair, oxygen, pets, car seats). A red pin with a car icon appears on the map." },
          ]),
          richBullet([
            { text: "Step 2 \u2014 Claimed: ", bold: true },
            { text: "A neighbor with room in their vehicle taps \u201CI\u2019ll pick them up.\u201D The pin turns yellow. The requester gets a notification: \u201CSusan is on her way\u201D with Susan\u2019s location on the map." },
          ]),
          richBullet([
            { text: "Step 3 \u2014 Picked Up: ", bold: true },
            { text: "Susan arrives. The requester taps \u201CI got my ride.\u201D The pin is removed from the map entirely. The Help queue item disappears. The building can now be marked green." },
          ]),
          richBullet([
            { text: "Auto-Resolution: ", bold: true },
            { text: "If a ride was claimed but the requester\u2019s GPS shows them still at the same location after 10 minutes, Beacon re-escalates: \u201CRide may not have arrived. Returning to active queue.\u201D If the requester\u2019s GPS shows them moving south on SR 89, the request auto-resolves even if they forgot to tap the button." },
          ]),

          h3("Retired Law Enforcement Joins the Effort"),
          para("Frank, a retired Sheriff\u2019s deputy who has lived in Yarnell for 15 years, sees the evacuation order. He opens the Help tab and taps \u201CI Can Help\u201D \u2014 selecting \u201CLaw Enforcement / Military Experience\u201D and noting: \u201CRetired Yavapai County Sheriff, 24 years. Can direct traffic or assist evacuation.\u201D"),
          para("The active-duty Deputy sees Frank\u2019s offer on her screen. She has one patrol vehicle, backup is 20 minutes out, and she needs to manage an entire town\u2019s evacuation. Frank is a gift. She sends him a direct task: \u201CFrank \u2014 Please direct traffic at the SR 89 and Main Street intersection. All traffic heading east needs to turn south toward Wickenburg. Keep the intersection clear for emergency vehicles.\u201D"),
          para("Frank drives to the intersection, puts on a reflective vest, and starts directing traffic. His position shows on the map as an active evacuation volunteer. A second retired officer, Carl, checks in on the Help tab ten minutes later. The Deputy assigns him to the south end of town to manage the merge onto SR 89."),

          h3("Traffic Bottleneck Detection"),
          para("Every Beacon user who tapped \u201CEvacuating Now\u201D is sharing their location. The Deputy sees a flow of blue dots moving south on SR 89. At T+25 minutes:"),
          spacer(60),
          richBullet([
            { text: "A cluster of dots has stopped moving ", bold: true },
            { text: "at the SR 89 and Yarnell Hill descent. The steep, winding four-mile descent has slowed traffic to a crawl. Forty vehicles are stacked up at the top of the hill." },
          ]),
          bulletItem("The Deputy sees the bottleneck forming on the map in real time. She does not need a phone call or a radio report. Forty stationary dots are a bottleneck."),
          bulletItem("She dispatches Carl to the top of Yarnell Hill to manage traffic flow down the descent \u2014 spacing vehicles, preventing people from stopping or panicking on the switchbacks."),
          bulletItem("She pushes a message to the community Timeline: \u201CTraffic slow on SR 89 south at Yarnell Hill. Be patient. Do not stop on the hill. Alternative: Head north on SR 89 toward Prescott if that route is open.\u201D"),
          spacer(60),
          para("But here is the problem \u2014 SR 89 north of Yarnell is closed by the fire. People who try to go north will be turned back. On Beacon, this is visible on the map: the road closure is marked, and the fire projection shows why. The Deputy updates the Timeline: \u201CSR 89 NORTH IS CLOSED. All traffic south to Wickenburg only. Shelter at Wickenburg High School.\u201D"),

          spacer(100),
          beaconBox(
            "TRAFFIC INTELLIGENCE FROM THE EVACUEES",
            "The Deputy does not need traffic cameras. The evacuees are the sensors. Every person sharing their location during evacuation is a data point. When 40 dots stop moving at the top of Yarnell Hill, that is a bottleneck. When dots resume moving, it is clearing. When a road shows no dots, it is either empty (potential alternate route) or impassable (needs investigation). This is real-time traffic intelligence that exists only because Beacon users are sharing their location during the emergency."
          ),

          new Paragraph({ children: [new PageBreak()] }),

          h3("The Shelter Routing Problem"),
          para("In 2013, two shelters were set up: Yavapai College in Prescott (north) and Wickenburg High School (south). Some evacuees headed north toward Prescott but were cut off by the SR 89 closure and had to reverse direction. On Beacon, this confusion does not happen:", { before: 120 }),
          spacer(60),
          bulletItem("The map shows both shelter locations as pins with details: address, capacity, current occupancy, and whether they accept pets."),
          bulletItem("The SR 89 north closure is visible on the map. Evacuees can see before they leave their driveway that the only route open is south."),
          bulletItem("The evacuation order Action Required card includes the shelter destination: \u201CEvacuate south on SR 89 to Wickenburg High School.\u201D No one drives the wrong direction."),
          bulletItem("As shelters fill, their occupancy updates. If Wickenburg High School approaches capacity, the emergency manager can update the map to redirect people to a secondary location before they arrive."),

          h3("The Evacuation Manager\u2019s View at T+45"),
          para("Forty-five minutes after the evacuation order, the Deputy looks at the Beacon map and sees:"),
          spacer(60),
          bulletItem("The fire perimeter in the west, with the projection sweeping through the west side of town."),
          bulletItem("Residential buildings: 142 green (confirmed evacuated), 18 yellow (order received, not confirmed), 4 red (need assistance), 8 gray (no Beacon user, unknown status)."),
          bulletItem("A flow of blue dots moving south on SR 89 toward Wickenburg. Traffic is moving, slowly but steadily, down Yarnell Hill."),
          bulletItem("Frank at the Main Street intersection. Carl at the top of the hill. Both managing traffic flow."),
          bulletItem("3 active ride requests on the Help tab: 1 claimed and en route, 2 still open. 14 ride requests already fulfilled and removed from the queue."),
          bulletItem("Wickenburg High School shelter: 87 people checked in. Capacity available."),
          spacer(60),
          para("The Deputy focuses her remaining effort: the 4 red buildings get door knocks from her backup who has arrived. The 8 gray buildings get volunteer checks. The 18 yellow buildings get a follow-up push alert. By T+60, every building in Yarnell is green, gray-confirmed-empty, or has been physically checked.", { bold: true }),
          spacer(60),
          para("She posts to the incident Announcements: \u201CYarnell evacuation complete. All residents accounted for. No persons remaining in the evacuation zone.\u201D"),

          // ── PHASE 9: LESSONS ──
          spacer(200),
          phaseBox("Phase 9: What This Scenario Reveals About Beacon", "UI and Architecture Requirements"),
          spacer(100),

          h3("Incident Command-Specific Features Needed"),
          spacer(60),

          richBullet([
            { text: "ICS Team Structure Templates: ", bold: true },
            { text: "When an incident is created, Beacon should offer ICS org chart templates (Type 1 through Type 5) that auto-generate the team hierarchy with role slots. The IC fills in names as they assign personnel." },
          ]),
          richBullet([
            { text: "QR Code Onboarding: ", bold: true },
            { text: "A printable QR code that links to the incident group. Scanning it checks the crew in, grants map access, and delivers the current IAP. This must work in 10 seconds with poor connectivity." },
          ]),
          richBullet([
            { text: "Geofence Alerts: ", bold: true },
            { text: "The ability to draw hazard zones on the map (unburned fuel, steep terrain, known hazards) and receive automatic alerts when any tracked person enters them." },
          ]),
          richBullet([
            { text: "Silence Detection: ", bold: true },
            { text: "Configurable timers per crew. If a crew does not send any communication or GPS update within X minutes, an alert escalates through the command chain. This is the single feature that would have broken the 33-minute silence." },
          ]),
          richBullet([
            { text: "Fire Spread Projection: ", bold: true },
            { text: "Real-time fire perimeter with projected spread polygon based on wind speed, wind direction, terrain slope, and fuel type. Updated continuously from aerial observation and satellite data. Every user on the map can see not just where the fire is but where it is going and when it will get there. This is the feature that shows the crew their route is a dead end before they take it." },
          ]),
          richBullet([
            { text: "Fire Intensity Overlay: ", bold: true },
            { text: "Heat gradient visualization from infrared aerial assets and satellite passes (MODIS/VIIRS). Shows the crew how hot the fire is burning in each area. Dense chaparral producing 20\u201330 foot flame lengths at 2,000\u00B0F+ looks fundamentally different on this overlay than a creeping ground fire. Crew members can assess whether conditions are survivable without line-of-sight to the fire itself." },
          ]),
          richBullet([
            { text: "Deployment Site Analysis: ", bold: true },
            { text: "Terrain classification layer showing vegetation density, slope angle, surface type (mineral soil, rock, brush), and clearings. In emergency situations, this layer answers the critical question: if the fire catches us here, is there anywhere we can survive? On the Yarnell Hill route through the box canyon, this layer would have shown solid dense brush with zero viable deployment sites for over 600 meters. That information, visible on the map, changes the decision." },
          ]),
          richBullet([
            { text: "Escape Route Comparison: ", bold: true },
            { text: "When a crew's position is flagged (geofence breach, weather alert, fire proximity), Beacon auto-generates escape route options with estimated travel times and compares them against the fire's projected arrival. Routes are color-coded green (safe margin), yellow (tight), or red (fire arrives first). At Yarnell Hill, the route back to the black would have been green. The route to the ranch would have been red." },
          ]),
          richBullet([
            { text: "Air Ops Integration: ", bold: true },
            { text: "Aircraft positions on the shared map. Drop request workflow with ground confirmation. Reload cycle visibility. Diversion notifications that reach all affected ground crews." },
          ]),
          richBullet([
            { text: "Forced Acknowledgment on Safety Alerts: ", bold: true },
            { text: "Weather alerts and safety directives require tap-to-confirm. Unacknowledged alerts escalate with time. The IC can see at a glance who has confirmed and who has not." },
          ]),
          richBullet([
            { text: "Offline/Low-Connectivity Mode: ", bold: true },
            { text: "Map tiles, fire projections, and the IAP must be cached on device. GPS tracking should store positions locally and batch-upload when connectivity returns. Even if a crew loses signal in a canyon, their last known position and trajectory are available to IC. And critically, the fire projection and terrain analysis are still visible on the crew's phone even without connectivity \u2014 the data was cached before they descended." },
          ]),
          richBullet([
            { text: "Paper Map Export: ", bold: true },
            { text: "The digital map (with fire perimeter, projected spread, safety zones, escape routes, crew positions) must be exportable as a high-resolution PDF for printing at the ICP. Paper maps must match digital. This is non-negotiable for wildfire operations." },
          ]),

          h3("Community Evacuation Features Needed"),
          spacer(60),

          richBullet([
            { text: "Building Evacuation Status Map: ", bold: true },
            { text: "Four-state building markers: Green (confirmed evacuated), Yellow (order received, unconfirmed), Red (needs assistance), Gray (unknown/no Beacon user). Status changed by: resident confirmation, evacuation manager override, or door-knock confirmation by a volunteer. The evacuation manager sees a summary: \u201C142/172 buildings confirmed evacuated (83%)\u201D with a breakdown by color." },
          ]),
          richBullet([
            { text: "Help Request Lifecycle: ", bold: true },
            { text: "Three-state lifecycle: Open (red pin, in active queue) \u2192 Claimed (yellow pin, helper assigned, requester notified) \u2192 Fulfilled (pin removed from map and queue entirely). Resolved requests disappear. The interface always shows only what still needs to be done. Stale requests (claimed but not fulfilled within a time window) return to Open status. GPS-based auto-resolution clears requests where the person has clearly left the zone." },
          ]),
          richBullet([
            { text: "Ride Request System: ", bold: true },
            { text: "A specific \u201CI Need a Ride\u201D category with fields for address, number of people, mobility needs, and pets. When claimed, the requester sees the helper\u2019s location approaching on the map. When the requester confirms pickup or their GPS shows them leaving the zone, the request disappears. In a retirement community like Yarnell, this is the single most critical evacuation feature." },
          ]),
          richBullet([
            { text: "\u201CI Can Help\u201D Volunteer Registration: ", bold: true },
            { text: "Categories: \u201CI Have a Vehicle with Room,\u201D \u201CI Have LE/Military Experience,\u201D \u201CI Have Medical Training,\u201D \u201CI Have a Trailer (livestock/pet transport),\u201D \u201COther.\u201D Each volunteer appears on the evacuation manager\u2019s map with their capability and location." },
          ]),
          richBullet([
            { text: "Shelter Status and Routing: ", bold: true },
            { text: "Shelter locations on the map with address, capacity, current occupancy, pet policy, and medical capabilities. When a road closure changes which shelter is reachable, the map updates and the evacuation order card can be amended. No one drives the wrong direction." },
          ]),
          richBullet([
            { text: "Traffic Flow Visualization: ", bold: true },
            { text: "Location-sharing evacuees appear as a flow of dots on evacuation routes. Stationary clusters indicate bottlenecks. Auto-detection: when N+ dots are stationary for more than X minutes, Beacon flags it to the evacuation manager. Alternate route suggestions can be drawn on the map and pushed to evacuees who have not yet departed." },
          ]),

          h3("Communication Architecture Implications"),
          para("The Yarnell Hill Fire confirms that Beacon's three-layer communication architecture is correct for both incident command and community coordination:"),
          spacer(60),
          richBullet([
            { text: "Layer 1 \u2014 Action Required: ", bold: true },
            { text: "Weather alerts, safety directives, evacuation orders, geofence breach notifications, school evacuation parent notifications. These are the \u201C33-minute silence\u201D breakers for firefighters and the \u201Cget out now\u201D drivers for residents. They require acknowledgment and drive the building status map." },
          ]),
          richBullet([
            { text: "Layer 2 \u2014 Situational Awareness: ", bold: true },
            { text: "Fire perimeter and projection, air support status, evacuation progress, traffic flow, shelter status. This is the shared map that gives firefighters, police, volunteers, and residents the same picture at the same time." },
          ]),
          richBullet([
            { text: "Layer 3 \u2014 Operational: ", bold: true },
            { text: "Division-level crew coordination, Deputy assigning volunteers to intersections, teacher confirming bus headcounts, neighbor messaging the person they are picking up. This happens inside teams and direct messages, not on the public timeline." },
          ]),

          spacer(200),
          new Table({
            width: { size: CONTENT_W, type: WidthType.DXA },
            columnWidths: [CONTENT_W],
            rows: [new TableRow({
              children: [new TableCell({
                borders: noBorders,
                width: { size: CONTENT_W, type: WidthType.DXA },
                shading: { fill: PURPLE, type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 300, right: 300 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [new TextRun({ text: "The Core Principle", font: "Arial", size: 32, bold: true, color: WHITE })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [new TextRun({ text: "Beacon cannot prevent a fire from changing direction. It cannot override a crew superintendent\u2019s judgment call. It cannot make a 91-year-old man on oxygen walk faster. What it can do is ensure that the crew sees the fire\u2019s path before they walk into it, that the IC sees the crew\u2019s movement before they disappear for 33 minutes, and that when a 91-year-old man taps \u201CI need help,\u201D his neighbor two doors down sees it on her phone and drives over.", font: "Arial", size: 22, color: "DDDDDD" })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Yarnell was two tragedies. Nineteen firefighters died because they did not have the information they needed to make a safe decision. And an entire retirement community evacuated in chaos because there was no system to coordinate who needed help, who could give it, and where everyone should go. Beacon solves both.", font: "Arial", size: 22, color: "DDDDDD" })]
                  }),
                ]
              })]
            })]
          }),
          spacer(200),
          para("The 19 members of the Granite Mountain Hotshots walked into a box canyon without knowing that air support had collapsed, without knowing the fire\u2019s rate of spread had tripled, and without anyone at Incident Command knowing they had left safety. Six hundred residents of a retirement community evacuated on one highway without knowing which direction to go, without knowing if their neighbors needed help, and without the deputy knowing which homes were empty and which still had people inside. Every one of those information gaps is a problem Beacon is built to solve.", { color: "555555", italics: true }),
        ]
      },
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/sessions/friendly-bold-bardeen/mnt/beacon/wildfire_scenario_user_journeys/13_incident_command_yarnell.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Created: 13_incident_command_yarnell.docx");
}

generate().catch(err => { console.error(err); process.exit(1); });
