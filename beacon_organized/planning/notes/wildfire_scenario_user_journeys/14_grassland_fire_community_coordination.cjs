const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, LevelFormat
} = require("docx");

// ── Brand ──
const FLAME  = "EA7928";
const PURPLE = "50386A";
const BLUE   = "3881B8";
const LTGRAY = "F5F5F5";
const WHITE  = "FFFFFF";
const DKRED  = "8B0000";

const PAGE_W = 12240, PAGE_H = 15840, MARGIN = 1440;
const CW = PAGE_W - 2 * MARGIN;

const thinB = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const bord = { top: thinB, bottom: thinB, left: thinB, right: thinB };
const noB = { top:{style:BorderStyle.NONE,size:0}, bottom:{style:BorderStyle.NONE,size:0}, left:{style:BorderStyle.NONE,size:0}, right:{style:BorderStyle.NONE,size:0} };

function sp(pts=200){ return new Paragraph({ spacing:{before:pts,after:0}, children:[] }); }

function hd(text, level=HeadingLevel.HEADING_1){
  const sz = level===HeadingLevel.HEADING_1?36:level===HeadingLevel.HEADING_2?30:26;
  return new Paragraph({ heading:level, spacing:{before:300,after:200}, children:[new TextRun({text,bold:true,font:"Arial",size:sz,color:PURPLE})] });
}
function h2(t){ return hd(t,HeadingLevel.HEADING_2); }
function h3(t){ return hd(t,HeadingLevel.HEADING_3); }

function p(text,opts={}){
  return new Paragraph({
    spacing:{before:opts.before||80,after:opts.after||80},
    alignment:opts.align||AlignmentType.LEFT,
    children:[new TextRun({text,font:"Arial",size:opts.size||22,color:opts.color||"333333",bold:!!opts.bold,italics:!!opts.italics})]
  });
}

function rp(runs,opts={}){
  return new Paragraph({
    spacing:{before:opts.before||80,after:opts.after||80},
    alignment:opts.align||AlignmentType.LEFT,
    children:runs.map(r=>new TextRun({font:"Arial",size:22,color:"333333",...r}))
  });
}

function bi(text,ref="bullets"){
  return new Paragraph({ numbering:{reference:ref,level:0}, spacing:{before:40,after:40},
    children:[new TextRun({text,font:"Arial",size:22,color:"333333"})] });
}

function rb(runs,ref="bullets"){
  return new Paragraph({ numbering:{reference:ref,level:0}, spacing:{before:40,after:40},
    children:runs.map(r=>new TextRun({font:"Arial",size:22,color:"333333",...r})) });
}

function phaseBox(title,time){
  return new Table({ width:{size:CW,type:WidthType.DXA}, columnWidths:[CW],
    rows:[new TableRow({ children:[new TableCell({
      borders:noB, width:{size:CW,type:WidthType.DXA},
      shading:{fill:PURPLE,type:ShadingType.CLEAR},
      margins:{top:120,bottom:120,left:200,right:200},
      children:[new Paragraph({ children:[
        new TextRun({text:title,bold:true,font:"Arial",size:30,color:WHITE}),
        new TextRun({text:"    "+time,font:"Arial",size:24,color:FLAME}),
      ]})]
    })] })]
  });
}

function ctxBox(text){
  return new Table({ width:{size:CW,type:WidthType.DXA}, columnWidths:[CW],
    rows:[new TableRow({ children:[new TableCell({
      borders:noB, width:{size:CW,type:WidthType.DXA},
      shading:{fill:LTGRAY,type:ShadingType.CLEAR},
      margins:{top:100,bottom:100,left:200,right:200},
      children:[new Paragraph({ children:[new TextRun({text,font:"Arial",size:21,color:"555555",italics:true})] })]
    })] })]
  });
}

function alertBox(label,text,fill,labelColor){
  return new Table({ width:{size:CW,type:WidthType.DXA}, columnWidths:[CW],
    rows:[new TableRow({ children:[new TableCell({
      borders:noB, width:{size:CW,type:WidthType.DXA},
      shading:{fill,type:ShadingType.CLEAR},
      margins:{top:100,bottom:100,left:200,right:200},
      children:[
        new Paragraph({ spacing:{after:60}, children:[new TextRun({text:label,font:"Arial",size:20,color:labelColor,bold:true})] }),
        new Paragraph({ children:[new TextRun({text,font:"Arial",size:21,color:"333333"})] })
      ]
    })] })]
  });
}

function beaconBox(label,text){ return alertBox(label,text,"E8F4E8","1B5E20"); }
function realBox(label,text){ return alertBox(label,text,"FFF3E6",DKRED); }
function uiBox(label,text){ return alertBox(label,text,"E8EAF6","283593"); }

// Two-column comparison
function compare(leftTitle,leftItems,rightTitle,rightItems){
  const colW=Math.floor(CW/2);
  const rows=[new TableRow({ children:[
    new TableCell({ borders:bord, width:{size:colW,type:WidthType.DXA}, shading:{fill:"FFEBEE",type:ShadingType.CLEAR},
      margins:{top:80,bottom:80,left:120,right:120},
      children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:leftTitle,bold:true,font:"Arial",size:22,color:DKRED})]})] }),
    new TableCell({ borders:bord, width:{size:colW,type:WidthType.DXA}, shading:{fill:"E8F5E9",type:ShadingType.CLEAR},
      margins:{top:80,bottom:80,left:120,right:120},
      children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:rightTitle,bold:true,font:"Arial",size:22,color:"1B5E20"})]})] }),
  ]})];
  const max=Math.max(leftItems.length,rightItems.length);
  for(let i=0;i<max;i++){
    rows.push(new TableRow({ children:[
      new TableCell({ borders:bord, width:{size:colW,type:WidthType.DXA}, shading:{fill:"FFF8F8",type:ShadingType.CLEAR},
        margins:{top:60,bottom:60,left:120,right:120},
        children:[new Paragraph({children:[new TextRun({text:leftItems[i]||"",font:"Arial",size:20,color:"444444"})]})] }),
      new TableCell({ borders:bord, width:{size:colW,type:WidthType.DXA}, shading:{fill:"F8FFF8",type:ShadingType.CLEAR},
        margins:{top:60,bottom:60,left:120,right:120},
        children:[new Paragraph({children:[new TextRun({text:rightItems[i]||"",font:"Arial",size:20,color:"444444"})]})] }),
    ]}));
  }
  return new Table({ width:{size:CW,type:WidthType.DXA}, columnWidths:[colW,colW], rows });
}

async function generate(){
const doc = new Document({
  styles:{
    default:{document:{run:{font:"Arial",size:22}}},
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:36,bold:true,font:"Arial",color:PURPLE},
        paragraph:{spacing:{before:300,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:30,bold:true,font:"Arial",color:PURPLE},
        paragraph:{spacing:{before:240,after:180},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:26,bold:true,font:"Arial",color:BLUE},
        paragraph:{spacing:{before:200,after:120},outlineLevel:2}},
    ]
  },
  numbering:{
    config:[
      {reference:"bullets",levels:[
        {level:0,format:LevelFormat.BULLET,text:"\u2022",alignment:AlignmentType.LEFT,
          style:{paragraph:{indent:{left:720,hanging:360}}}},
        {level:1,format:LevelFormat.BULLET,text:"\u25E6",alignment:AlignmentType.LEFT,
          style:{paragraph:{indent:{left:1440,hanging:360}}}},
      ]},
      {reference:"numbers",levels:[
        {level:0,format:LevelFormat.DECIMAL,text:"%1.",alignment:AlignmentType.LEFT,
          style:{paragraph:{indent:{left:720,hanging:360}}}},
      ]},
    ]
  },
  sections:[

  // ════════════════════════════════════════
  // TITLE PAGE
  // ════════════════════════════════════════
  {
    properties:{page:{size:{width:PAGE_W,height:PAGE_H},margin:{top:MARGIN,right:MARGIN,bottom:MARGIN,left:MARGIN}}},
    children:[
      sp(2000),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},
        children:[new TextRun({text:"BEACON",font:"Arial",size:56,bold:true,color:PURPLE})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:100},
        children:[new TextRun({text:"Community Coordination Scenario",font:"Arial",size:36,color:FLAME})]}),
      sp(400),
      new Table({width:{size:CW,type:WidthType.DXA},columnWidths:[CW],
        rows:[new TableRow({children:[new TableCell({
          borders:noB,width:{size:CW,type:WidthType.DXA},
          shading:{fill:PURPLE,type:ShadingType.CLEAR},
          margins:{top:200,bottom:200,left:300,right:300},
          children:[
            new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:120},
              children:[new TextRun({text:"Grassland Fire \u2014 Rural Iowa",font:"Arial",size:44,bold:true,color:WHITE})]}),
            new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},
              children:[new TextRun({text:"Wind-driven harvest fire  \u2022  Small town  \u2022  Farming community",font:"Arial",size:26,color:FLAME})]}),
            new Paragraph({alignment:AlignmentType.CENTER,
              children:[new TextRun({text:"How Beacon coordinates firefighters, farmers, schools, police, and neighbors into a single response",font:"Arial",size:24,color:"CCCCCC",italics:true})]}),
          ]
        })]})]
      }),
      sp(600),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:100},
        children:[new TextRun({text:"This scenario demonstrates Beacon\u2019s community coordination capabilities:",font:"Arial",size:22,color:"666666"})]}),
      bi("Civilian heavy equipment operators volunteering to cut firebreaks"),
      bi("School evacuation with bus transport and parent reunification"),
      bi("Building-by-building evacuation status tracking on the map"),
      bi("Neighbor-to-neighbor evacuation assistance including animals"),
      bi("Retired law enforcement joining the evacuation effort"),
      bi("Real-time traffic bottleneck detection from shared locations"),
      bi("Ride request and fulfillment lifecycle on the Help tab"),
    ]
  },

  // ════════════════════════════════════════
  // SCENARIO SETUP
  // ════════════════════════════════════════
  {
    properties:{page:{size:{width:PAGE_W,height:PAGE_H},margin:{top:MARGIN,right:MARGIN,bottom:MARGIN,left:MARGIN}}},
    headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,
      children:[new TextRun({text:"Beacon \u2022 Grassland Fire Community Coordination Scenario",font:"Arial",size:18,color:"999999",italics:true})]})]})},
    footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,
      children:[new TextRun({text:"Page ",font:"Arial",size:18,color:"999999"}),new TextRun({children:[PageNumber.CURRENT],font:"Arial",size:18,color:"999999"})]})]})},
    children:[

      hd("The Scenario"),
      p("A wind-driven grassland fire ignites during harvest season in rural Iowa. Dry corn stubble, 25 mph sustained winds with 40 mph gusts, and relative humidity below 15%. The fire starts at a field edge and moves fast \u2014 grassland fires can travel at 5\u201314 mph in these conditions, faster than a person can run. Within 30 minutes it threatens a small town of 2,400 people: a main street, a school, a grain elevator, farms on all sides, and two roads out.",{before:120}),

      h2("The Cast"),
      p("This scenario tracks how Beacon coordinates every type of person involved in the response:"),
      sp(60),
      rb([{text:"Fire Chief (Volunteer FD): ",bold:true},{text:"Manages suppression with a small department. 2 engines, 12 volunteers, some not yet on scene."}]),
      rb([{text:"County Sheriff Deputy: ",bold:true},{text:"Leads evacuation. One deputy on patrol, backup 20 minutes out."}]),
      rb([{text:"School Principal: ",bold:true},{text:"240 kids, 30 staff, 4 buses. Must evacuate to the next town 12 miles east."}]),
      rb([{text:"Three Farmers with Heavy Equipment: ",bold:true},{text:"Two within 2 miles have tractors with disc harrows. One has a water tank truck used for crop spraying."}]),
      rb([{text:"Retired Police Officer: ",bold:true},{text:"Lives in town, has experience directing traffic and managing evacuations."}]),
      rb([{text:"Parents: ",bold:true},{text:"At work, at home, in the fields. Need to know where their kids are being taken."}]),
      rb([{text:"Elderly Resident: ",bold:true},{text:"Lives alone on the south edge of town. No car. Has a dog and three cats."}]),
      rb([{text:"Neighbor Volunteer: ",bold:true},{text:"Lives next to the elderly resident. Has a truck and a livestock trailer."}]),
      rb([{text:"Evacuee Family: ",bold:true},{text:"Family of four. Both parents at work in the next town. Kids at school. House on the west side closest to the fire."}]),

      new Paragraph({children:[new PageBreak()]}),

      // ────────────────────────────────────────
      // PHASE 1: DETECTION AND FIRST RESPONSE
      // ────────────────────────────────────────
      phaseBox("Phase 1: Detection and Alert","T+0 to T+10 minutes"),
      sp(100),
      ctxBox("A combine operator sees flames at the edge of a harvested cornfield. Wind is pushing the fire northeast toward town at an estimated 8\u201310 mph. The town is 1.5 miles downwind. At this speed, fire reaches the edge of town in 10\u201315 minutes."),
      sp(100),

      h3("First Report"),
      bi("The combine operator opens Beacon and hits the emergency report button. He selects \u201CWildfire\u201D and drops a pin at the fire\u2019s location. The report includes: GPS coordinates, wind direction from his phone\u2019s weather data, and a photo of the fire."),
      bi("Beacon routes the report to the local volunteer fire department and the county emergency manager. It also posts to the community Timeline as a Situational Awareness item."),
      bi("The Fire Chief receives an Action Required card: \u201CWildfire reported 1.5 mi SW of town. Wind NE 25 mph gusting 40. Estimated time to town edge: 10\u201315 minutes.\u201D"),

      h3("Who Sees What"),
      rb([{text:"Fire Chief: ",bold:true},{text:"Action Required card with fire location, wind data, and projected path. He activates the incident on Beacon: \u201CGrassland Fire \u2014 West Fields.\u201D All volunteer firefighters get the callout notification."}]),
      rb([{text:"Sheriff Deputy: ",bold:true},{text:"Sees the fire report on Timeline. Opens the map. Sees the fire location and the projected spread polygon overlaying the southwest edge of town. She contacts dispatch and begins driving toward town."}]),
      rb([{text:"School Principal: ",bold:true},{text:"Sees the fire report. Opens the map. The projected fire path shows the fire passing 0.4 miles from the school within 20 minutes. She does not wait for an official evacuation order \u2014 she begins calling buses."}]),
      rb([{text:"Every Beacon user in town: ",bold:true},{text:"Sees the fire report on their Timeline. The map shows the fire\u2019s projected path. People on the west side of town can see that they are in the path."}]),

      sp(100),
      beaconBox(
        "THE CRITICAL DIFFERENCE: EVERYONE SEES THE SAME MAP",
        "In a traditional response, the combine operator calls 911. The dispatcher relays to the fire department. The fire chief drives out to assess. Minutes pass before anyone else knows. On Beacon, within 60 seconds of the report, every person in the community can see the fire\u2019s location, the projected spread, and whether they are in the path. The school principal does not wait for a phone tree. The farmers do not wait for someone to ask for help. The neighbor does not wait to be told to check on the elderly resident next door. Everyone has the same information at the same time."
      ),

      new Paragraph({children:[new PageBreak()]}),

      // ────────────────────────────────────────
      // PHASE 2: FARMER EQUIPMENT VOLUNTEERS
      // ────────────────────────────────────────
      phaseBox("Phase 2: Civilian Heavy Equipment Response","T+5 to T+25 minutes"),
      sp(100),
      ctxBox("Two farmers within 2 miles of the fire have tractors with disc harrows. A third has a water tank truck. They see the fire report on Beacon and want to help. In a traditional response, they\u2019d just start plowing and hope they\u2019re in the right place. On Beacon, they become coordinated resources."),
      sp(100),

      h3("Equipment Volunteer Check-In"),
      p("Each farmer opens Beacon and navigates to the Help tab. They see a category: \u201CI Can Help.\u201D They tap it and select from a list:"),
      sp(60),
      rb([{text:"Farmer 1 (Dale): ",bold:true},{text:"\u201CTractor with 12-row disc harrow. Available now. Location: County Road 4 and 180th Street.\u201D His pin appears on the Fire Chief\u2019s map with a tractor icon."}]),
      rb([{text:"Farmer 2 (Miguel): ",bold:true},{text:"\u201CTractor with 8-row disc. Available now. Location: farm on 175th Street.\u201D Second tractor icon appears."}]),
      rb([{text:"Farmer 3 (Karen): ",bold:true},{text:"\u201CWater tank truck, 1,500 gallon capacity. Available now.\u201D Water truck icon appears."}]),

      sp(100),
      h3("Fire Chief Coordinates the Firebreaks"),
      p("The Fire Chief opens the map. He can see: the fire\u2019s current position, the projected spread polygon, the town, and three equipment volunteers with their locations and capabilities. He does not have to call anyone. He does not have to wonder who has equipment nearby. The information is already on his screen.",{before:120}),
      sp(60),

      rb([{text:"To Dale: ",bold:true},{text:"The Fire Chief taps Dale\u2019s tractor icon and sends a direct task via the incident team: \u201CDale \u2014 Plow a firebreak along County Road 4 from mile marker 6 to mile marker 8. Stay south of the road. Fire is approaching from the SW at ~8 mph. You have approximately 15 minutes before fire reaches that line. If fire approaches within 0.25 miles, abandon the line and drive east on CR4.\u201D The task includes a drawn line on the map showing exactly where to plow."}]),
      rb([{text:"To Miguel: ",bold:true},{text:"\u201CMiguel \u2014 Plow a secondary break along 175th Street between CR4 and the grain elevator road. This is the backup line if the CR4 break doesn\u2019t hold.\u201D Again, a line on the map."}]),
      rb([{text:"To Karen: ",bold:true},{text:"\u201CKaren \u2014 Position your water truck at the intersection of CR4 and 180th. Wet down the area north of Dale\u2019s firebreak. If any spot fires jump the break, hit them.\u201D A pin on the map marks her position."}]),

      sp(100),
      h3("What the Farmers See on Their Phones"),
      p("Each farmer has the same map the Fire Chief has. They can see:"),
      bi("The fire\u2019s current position and projected spread, updating in real time."),
      bi("Their assigned firebreak line drawn on the map \u2014 they know exactly where to plow without anyone having to describe it over the phone."),
      bi("The location of the other farmers and the fire engines, so they know who is working where."),
      bi("The \u201Cin the black\u201D regions: areas that have already burned and are safe. If the fire jumps their line or the wind shifts, they can see on the map where the nearest burned-out safe ground is and drive to it."),
      bi("The fire\u2019s projected arrival time at their location, updating as conditions change. If the timer drops below their estimated time to complete the break, Beacon alerts them: \u201CFire arrival estimate has shortened. Consider withdrawing to safety.\u201D"),

      sp(100),
      beaconBox(
        "SAFETY THROUGH SHARED AWARENESS",
        "The farmers are not firefighters. They do not have fire shelters or Nomex. Their safety comes from information: knowing where the fire is, knowing where it is going, knowing where burned ground is if they need to retreat, and having a direct communication line to the Fire Chief who can tell them to pull back. Beacon gives civilian volunteers the same situational awareness that professional firefighters have. That is what makes it safe for them to help."
      ),

      sp(100),
      h3("The Firebreak Works"),
      p("Dale completes his break along CR4 in 12 minutes. The fire reaches the break 8 minutes later. The disc-harrowed strip of bare soil, combined with Karen\u2019s water truck wetting the area and the Fire Chief\u2019s engine crew working the north edge, stops the fire\u2019s main advance toward town from the southwest. Spot fires that jump the break are caught by Miguel\u2019s secondary line.",{before:120}),
      p("On the map, the fire perimeter stops advancing to the northeast along the CR4 line. The Fire Chief posts to the incident Announcements: \u201CSW firebreak holding. Fire contained along CR4. Wind still pushing flanks NW and SE. Evacuation of west side still in effect.\u201D"),

      new Paragraph({children:[new PageBreak()]}),

      // ────────────────────────────────────────
      // PHASE 3: SCHOOL EVACUATION
      // ────────────────────────────────────────
      phaseBox("Phase 3: School Evacuation","T+5 to T+40 minutes"),
      sp(100),
      ctxBox("The school has 240 students and 30 staff. The principal saw the fire report on Beacon within 60 seconds of the initial post. The projected fire path passes 0.4 miles from the school. She does not wait for an official order. She initiates evacuation."),
      sp(100),

      h3("The Principal\u2019s Actions on Beacon"),
      p("The principal, Mrs. Hernandez, takes the following steps on Beacon in rapid sequence:"),
      sp(60),

      rb([{text:"T+5 \u2014 Activates school emergency protocol. ",bold:true},{text:"She posts to the school\u2019s Beacon team Announcements: \u201CFire approaching from SW. Initiating full evacuation. All staff: execute evacuation plan. Buses loading at east entrance in 10 minutes. Destination: Lincoln Elementary in Fairfield, 12 miles east.\u201D"}]),
      rb([{text:"T+6 \u2014 Sends parent notification. ",bold:true},{text:"An Action Required card pushes to every parent in the school\u2019s Beacon group: \u201CSCHOOL EVACUATION: Your child is being transported by bus to Lincoln Elementary in Fairfield. Please pick up your child there. Do NOT come to the school \u2014 you will drive into the evacuation zone. Updates will be posted here.\u201D The card includes the address of Lincoln Elementary and a map pin."}]),
      rb([{text:"T+7 \u2014 Notifies the evacuation manager. ",bold:true},{text:"She sends a message to the Sheriff Deputy: \u201CSchool evacuation in progress. 4 buses departing east entrance in 10 minutes heading east on Highway 34 to Fairfield. Request clear route.\u201D"}]),
      rb([{text:"T+8 \u2014 Contacts Lincoln Elementary. ",bold:true},{text:"She messages the Fairfield principal through Beacon: \u201CIncoming: 240 students by bus, ETA 20 minutes. Need gymnasium and cafeteria for staging. Parents will be coming to you for pickup.\u201D"}]),

      sp(100),
      h3("The Bus Loading Process"),
      p("Teachers move students to the east entrance in classroom groups. Each teacher has a roster on their phone. As students board buses, teachers confirm attendance on Beacon:"),
      sp(60),
      bi("Bus 1: Mrs. Chen\u2019s 3rd grade (24 students) \u2014 \u201CAll 24 aboard.\u201D"),
      bi("Bus 2: Mr. Torres\u2019s 4th grade and Ms. Kim\u2019s 5th grade (48 students) \u2014 \u201CAll 48 aboard.\u201D"),
      bi("Bus 3: 6th grade classes (52 students) \u2014 \u201C51 aboard. Dylan Kowalski is in the nurse\u2019s office \u2014 staff bringing him now.\u201D Then 2 minutes later: \u201C52/52. All aboard.\u201D"),
      bi("Bus 4: Remaining K\u20132 students (66 students) \u2014 \u201CAll 66 aboard.\u201D"),
      sp(60),
      p("Each confirmation posts to the school team. Mrs. Hernandez sees a live count on her phone: 240/240 students accounted for. 30/30 staff accounted for."),

      sp(100),
      h3("The Principal\u2019s Confirmation"),
      rp([
        {text:"T+18 \u2014 ",bold:true},
        {text:"All four buses have departed. Mrs. Hernandez does a final walkthrough of the building with the custodian. The building is empty. She opens Beacon and posts to the incident team: "},
        {text:"\u201CSchool evacuation complete. 240 students, 30 staff, all accounted for. 4 buses en route to Lincoln Elementary, Fairfield. Building is empty.\u201D",bold:true},
      ]),
      sp(60),
      p("She then taps the school building on the Beacon map and changes its evacuation status. The school\u2019s building marker changes from red (occupied/not evacuated) to green (confirmed evacuated, building empty). Every Beacon user on the map can see this."),

      sp(100),
      h3("What Parents See"),
      p("A parent \u2014 Maria, whose two kids are at the school \u2014 is at work 20 miles away. She sees:"),
      sp(60),
      bi("The Action Required card: \u201CSCHOOL EVACUATION: Your child is being transported to Lincoln Elementary in Fairfield.\u201D She does not panic-drive to the school. She knows exactly where to go."),
      bi("The live bus tracking: Bus 2 (her daughter\u2019s bus) is a moving dot on the map, heading east on Highway 34. She can see it is moving, it is on the right road, and its ETA to Fairfield."),
      bi("The confirmation from Mrs. Hernandez: all 240 kids accounted for. Her children are safe and she knows where they are."),
      bi("She drives to Lincoln Elementary in Fairfield. When she arrives, she checks in on Beacon at the reunification point. She picks up her two children. The principal marks both children as \u201Creunified with parent\u201D in the system."),

      sp(100),
      uiBox(
        "UI REQUIREMENT: PARENT REUNIFICATION WORKFLOW",
        "The school team needs a student roster with three states per child: (1) At School \u2014 default, (2) On Bus \u2014 set when teacher confirms boarding, with bus number, (3) Reunified with Parent \u2014 set when parent picks up, with parent name and time. The principal and receiving school both need to see this roster. Parents need to see their own child\u2019s status but not the full roster. The count (240/240 accounted for, 187/240 reunified) should be visible to the principal at all times."
      ),

      new Paragraph({children:[new PageBreak()]}),

      // ────────────────────────────────────────
      // PHASE 4: EVACUATION COORDINATION
      // ────────────────────────────────────────
      phaseBox("Phase 4: Town Evacuation","T+8 to T+45 minutes"),
      sp(100),
      ctxBox("The Sheriff Deputy issues an evacuation order for the west side of town via Beacon. The firebreak on CR4 is holding, but flanking fire is still a threat. 600 residents on the west side need to move east. One deputy is on scene. Backup is 15 minutes out."),
      sp(100),

      h3("The Evacuation Order"),
      p("The Deputy posts the evacuation order as an Action Required card pushed to all Beacon users within the evacuation zone:"),
      sp(60),
      rp([{text:"\u201CEVACUATION ORDER: ",bold:true},{text:"All residents west of Main Street: evacuate east immediately. Take Highway 34 east toward Fairfield. Do NOT go south on CR4 \u2014 active fire suppression in progress. Confirm your evacuation status below.\u201D"}]),
      sp(60),
      p("The card has three response buttons:"),
      bi("\u201CEvacuating Now\u201D \u2014 I\u2019m leaving."),
      bi("\u201CEvacuated\u201D \u2014 I\u2019m already out."),
      bi("\u201CNeed Assistance\u201D \u2014 I cannot evacuate on my own. (This expands to: reason, address, number of people, pets/animals.)"),

      h3("Building-by-Building Status on the Map"),
      p("As residents respond, the map transforms into a real-time evacuation dashboard:"),
      sp(60),
      rb([{text:"Green buildings: ",bold:true},{text:"Confirmed evacuated. The resident tapped \u201CEvacuating Now\u201D or \u201CEvacuated\u201D and their GPS confirms they have left the zone. The building marker turns green."}]),
      rb([{text:"Yellow buildings: ",bold:true},{text:"Evacuation order received but not yet confirmed. The resident has seen the alert (Beacon shows it was delivered) but has not responded."}]),
      rb([{text:"Red buildings: ",bold:true},{text:"\u201CNeed Assistance\u201D flagged. Someone in this building cannot evacuate on their own. These are the priority for the deputy and volunteers."}]),
      rb([{text:"Gray buildings: ",bold:true},{text:"No Beacon user registered at this address. Unknown status. These also need physical checks."}]),
      sp(60),
      p("The Deputy and the evacuation team can see at a glance: how many buildings are green, how many are yellow, how many are red, and how many are gray. They focus on red first, then gray.",{bold:true}),

      sp(100),
      h3("The Elderly Resident: Need Assistance"),
      p("Ruth, 82, lives alone on the south edge of town with a dog and three cats. She sees the evacuation order on Beacon. She cannot drive. She taps \u201CNeed Assistance\u201D and fills in:"),
      bi("Reason: \u201CNo car. Cannot drive.\u201D"),
      bi("Address: 412 South Elm Street"),
      bi("People: 1"),
      bi("Animals: \u201C1 dog, 3 cats\u201D"),
      sp(60),
      p("Her building turns red on the map. Her pin shows the assistance details. Everyone on Beacon can see it."),

      sp(100),
      h3("The Neighbor Steps In"),
      p("Tom, who lives at 414 South Elm, sees Ruth\u2019s red pin next door. He does not wait for the deputy. He has a truck and a livestock trailer (he hauls cattle for the sale barn). He walks next door, helps Ruth into the truck, loads the dog in the cab and the three cats in carriers in the trailer bed."),
      p("On Beacon, Tom taps Ruth\u2019s assistance request and selects \u201CI\u2019m helping this person.\u201D The status updates: \u201CAssistance in progress \u2014 Tom B. is helping.\u201D The deputy sees this on the map \u2014 she does not need to dispatch anyone to 412 South Elm. One less red pin."),
      p("When Tom and Ruth are in the truck heading east, Tom (or Ruth) taps \u201CEvacuated.\u201D Both buildings \u2014 412 and 414 \u2014 turn green. Ruth\u2019s assistance request is resolved and removed from the active help queue."),

      sp(100),
      beaconBox(
        "THE HELP LIFECYCLE",
        "Ruth\u2019s request goes through a clear lifecycle: (1) Request posted \u2014 red pin appears, (2) Someone claims it \u2014 status changes to \u201Cin progress,\u201D (3) Request fulfilled \u2014 pin is removed from the active interface. The system is self-cleaning. Resolved requests do not clutter the map or the help queue. The deputy always sees only the outstanding needs."
      ),

      sp(100),
      h3("Animals and Livestock"),
      p("Tom\u2019s livestock trailer matters. In rural evacuations, animals are a major factor. People will refuse to evacuate if they cannot bring their animals. On Beacon:"),
      bi("Residents flagging \u201CNeed Assistance\u201D can specify animals: pets, livestock type and count, large animals that need a trailer."),
      bi("Volunteers with livestock trailers, horse trailers, or stock trucks can register on the Help tab: \u201CI have a trailer and can transport animals.\u201D"),
      bi("The evacuation manager can match animal transport needs with available trailers, just like matching Ruth with Tom."),
      bi("Evacuation shelters in Fairfield can be flagged on the map as \u201Cpet-friendly\u201D or \u201Clivestock staging at fairgrounds.\u201D Evacuees with animals know where to go."),

      new Paragraph({children:[new PageBreak()]}),

      // ────────────────────────────────────────
      // PHASE 5: RETIRED PD AND TRAFFIC
      // ────────────────────────────────────────
      phaseBox("Phase 5: Traffic and Evacuation Flow","T+10 to T+45 minutes"),
      sp(100),
      ctxBox("600 people are trying to leave the west side of town on two roads. One deputy is managing the evacuation. Traffic is building. There are two routes east, and one is faster but passes closer to the fire. People need direction."),
      sp(100),

      h3("Retired Officer Joins the Effort"),
      p("Frank, a retired police officer who lives in town, sees the evacuation order on Beacon. He opens the Help tab and taps \u201CI Can Help.\u201D He selects a category: \u201CTraffic Direction / Evacuation Assistance\u201D and notes his background: \u201CRetired PD, 22 years. Can direct traffic.\u201D"),
      p("The Deputy sees Frank\u2019s offer on her dashboard. She sends him a task: \u201CFrank \u2014 Please direct traffic at the intersection of Main and Highway 34. All westbound traffic needs to be turned east. Keep the intersection clear for emergency vehicles.\u201D Frank drives to the intersection and starts directing traffic. His position shows on the map as an active evacuation volunteer."),

      sp(100),
      h3("Traffic Bottleneck Detection from Shared Locations"),
      p("Every Beacon user who tapped \u201CEvacuating Now\u201D is sharing their location (with their permission, granted when they confirmed evacuation). The evacuation manager can see a flow of blue dots moving east on Highway 34. At T+20:"),
      sp(60),
      rb([{text:"A cluster of dots has stopped moving ",bold:true},{text:"at the intersection of Highway 34 and County Road 6. The dots have been stationary for 3 minutes. This is a bottleneck."}]),
      bi("The Deputy can see it forming on the map before anyone calls it in. She dispatches Frank\u2019s retired PD colleague \u2014 another volunteer who checked in on the Help tab \u2014 to CR6 to manage the intersection."),
      bi("She also posts to the community Timeline: \u201CTraffic backing up at Hwy 34 & CR6. If you have not yet left, take Elm Street north to Old Highway 34 as an alternate route.\u201D The alternate route is drawn on the map."),
      sp(60),
      p("The bottleneck clears within 5 minutes because traffic is being diverted before it stacks up further."),

      sp(100),
      beaconBox(
        "TRAFFIC INTELLIGENCE FROM THE EVACUEES THEMSELVES",
        "The evacuation manager does not need traffic cameras or road sensors. The evacuees ARE the sensors. Every person sharing their location during evacuation is a data point. When 40 dots stop moving at an intersection, that is a bottleneck. When dots start flowing again, it is clear. When a road shows no dots at all, either no one is using it (potential alternate route to advertise) or it is impassable (needs investigation). This is crowd-sourced traffic intelligence that exists only because Beacon users agreed to share their location during the emergency."
      ),

      sp(100),
      h3("Ride Requests and Fulfillment"),
      p("Not everyone has a car. Some people are home without transportation. Some are elderly, disabled, or have too many children to carry safely. On Beacon, the Help tab has a specific category: \u201CI Need a Ride.\u201D"),
      sp(60),

      h3("The Ride Request Lifecycle"),
      rb([{text:"Step 1 \u2014 Request: ",bold:true},{text:"A resident taps \u201CI Need a Ride\u201D on the Help tab. They enter their address, number of people, and any special needs (wheelchair, car seats, large dog). A red pin with a car icon appears on the map. The request shows in the Help queue."}]),
      rb([{text:"Step 2 \u2014 Claimed: ",bold:true},{text:"A neighbor with room in their vehicle sees the pin (or the Help queue item) and taps \u201CI\u2019ll pick them up.\u201D The pin changes to yellow and the status shows \u201CRide en route \u2014 Sarah M.\u201D The person requesting the ride gets a notification: \u201CSarah is on her way to pick you up.\u201D with Sarah\u2019s location on the map so they can see her approaching."}]),
      rb([{text:"Step 3 \u2014 Picked Up: ",bold:true},{text:"Sarah arrives and the requester taps \u201CI got my ride\u201D (or Sarah taps \u201CPassenger picked up\u201D). The pin is removed from the map entirely. The Help queue item disappears. The building can now be marked green if no one else is inside."}]),
      rb([{text:"Step 4 \u2014 Automatic Cleanup: ",bold:true},{text:"If a ride request is claimed but the requester\u2019s GPS shows they are still at the same location after 15 minutes, Beacon re-escalates: \u201CRide may not have arrived. Returning to active queue.\u201D If the requester\u2019s GPS shows them moving east (away from the fire), the request auto-resolves even if they forgot to tap the button."}]),

      sp(100),
      uiBox(
        "UI REQUIREMENT: HELP REQUEST LIFECYCLE",
        "Every help request on the Help tab must follow a clear lifecycle with visible state changes: (1) Open \u2014 red pin, in the active queue, visible to all, (2) Claimed \u2014 yellow pin, helper assigned, requester notified, (3) Fulfilled \u2014 pin removed from map and queue entirely. Resolved requests do not linger. The interface always shows only what still needs to be done. Stale requests (claimed but not fulfilled within a time window) automatically return to Open status. GPS-based auto-resolution clears requests where the person has clearly evacuated."
      ),

      new Paragraph({children:[new PageBreak()]}),

      // ────────────────────────────────────────
      // PHASE 6: THE FULL MAP AT T+30
      // ────────────────────────────────────────
      phaseBox("Phase 6: The Evacuation Manager\u2019s View","T+30 minutes"),
      sp(100),
      ctxBox("Thirty minutes into the incident. The firebreak is holding. The school has been evacuated. Residents are moving east. The Deputy looks at her Beacon map and sees the full picture."),
      sp(100),

      h3("What the Map Shows at T+30"),
      bi("The fire perimeter in the southwest, with the projected spread polygon. The CR4 firebreak line is holding \u2014 the fire has not crossed it."),
      bi("Dale\u2019s tractor (green dot) still on CR4, monitoring the break. Miguel on 175th Street. Karen\u2019s water truck at the intersection."),
      bi("The school building: bright green. \u201CEvacuated \u2014 240 students, 30 staff, confirmed by Principal Hernandez at T+18.\u201D"),
      bi("4 bus dots moving east on Highway 34, approaching Fairfield. ETA 8 minutes."),
      bi("West side residential: 38 buildings green (confirmed evacuated), 12 buildings yellow (order received, not yet confirmed), 2 buildings red (need assistance), 5 buildings gray (no Beacon user, unknown status)."),
      bi("A flow of blue dots moving east on Highway 34 and Old Highway 34. Traffic is moving. The CR6 bottleneck has cleared."),
      bi("Frank directing traffic at Main and Highway 34. A second volunteer at CR6."),
      bi("2 active ride requests on the Help tab (both claimed, helpers en route). 6 ride requests already fulfilled and removed from the queue."),
      bi("The elderly resident Ruth: green. Evacuated by Tom at T+22."),

      sp(100),
      h3("What the Deputy Does with This Information"),
      p("The Deputy can now focus her limited resources:"),
      bi("The 2 red buildings: she dispatches her backup deputy (who has arrived) to check on them physically."),
      bi("The 5 gray buildings: she asks a volunteer to knock on doors. Two are vacation homes (empty). One is a renter who is not on Beacon but is already gone (neighbor confirms). Two need door knocks."),
      bi("The 12 yellow buildings: she pushes a follow-up alert: \u201CIf you are still on the west side, please evacuate now and confirm on Beacon.\u201D Within 5 minutes, 9 of the 12 turn green. The remaining 3 get door knocks."),
      sp(60),
      p("By T+45, every building on the west side is green or confirmed empty. The Deputy posts to the incident Announcements: \u201CWest side evacuation complete. All residents accounted for.\u201D",{bold:true}),

      new Paragraph({children:[new PageBreak()]}),

      // ────────────────────────────────────────
      // PHASE 7: COORDINATION COMPARISON
      // ────────────────────────────────────────
      phaseBox("Phase 7: With and Without Beacon","The Coordination Gap"),
      sp(100),

      compare(
        "Without Beacon",
        [
          "Combine operator calls 911. Dispatcher relays to FD. 5+ minute delay before anyone else knows.",
          "Farmers want to help but don\u2019t know where to plow. They guess, or they drive to the fire chief and ask.",
          "School starts phone tree. Parents get busy signals. Some drive to the school into the fire zone.",
          "Deputy goes door to door. No way to know which houses are empty. Wastes time on already-evacuated homes.",
          "Elderly resident waits. No one knows she needs help until the deputy reaches her block.",
          "Traffic backs up. Deputy doesn\u2019t know about the bottleneck until she drives past it or someone calls.",
          "Retired officer stays home. No way to volunteer and no one to coordinate with.",
          "Person without a car calls 911. Dispatcher has no one to send. They wait.",
          "No one knows if evacuation is complete. Deputy cannot confirm all buildings are clear for hours.",
        ],
        "With Beacon",
        [
          "Report visible to entire community in 60 seconds. Everyone sees fire location and projected path.",
          "Farmers check in with equipment type and location. Fire Chief assigns firebreak lines on the map.",
          "Principal sees fire path, evacuates immediately. Parents get push notification with bus destination.",
          "Map shows green/yellow/red/gray buildings. Deputy focuses only on red and gray.",
          "Ruth taps \u201CNeed Assistance.\u201D Neighbor sees it, helps her immediately.",
          "Clustered stationary dots reveal bottleneck in real time. Deputy redirects traffic before it worsens.",
          "Retired officer checks in on Help tab. Deputy assigns him to direct traffic in 30 seconds.",
          "Ride request posted, claimed by neighbor, fulfilled, removed from queue. Self-organizing.",
          "All buildings green by T+45. Evacuation confirmed complete with a timestamp.",
        ]
      ),

      new Paragraph({children:[new PageBreak()]}),

      // ────────────────────────────────────────
      // PHASE 8: UI REQUIREMENTS
      // ────────────────────────────────────────
      phaseBox("Phase 8: UI and Architecture Requirements","What This Scenario Demands from Beacon"),
      sp(100),

      h3("Map Layer: Building Evacuation Status"),
      rb([{text:"Four-state building markers: ",bold:true},{text:"Green (confirmed evacuated), Yellow (order received, unconfirmed), Red (needs assistance), Gray (unknown/no Beacon user). Status is changed by: resident confirmation, evacuation manager override, or door-knock confirmation by a volunteer."}]),
      rb([{text:"Building details on tap: ",bold:true},{text:"Tapping a building shows: address, number of registered residents, their evacuation status, any assistance requests, and who confirmed the evacuation."}]),
      rb([{text:"Evacuation progress bar: ",bold:true},{text:"The evacuation manager sees a summary: \u201C38/57 buildings confirmed evacuated (67%)\u201D with a breakdown by status color."}]),

      h3("Map Layer: Equipment and Volunteer Resources"),
      rb([{text:"Equipment volunteer pins: ",bold:true},{text:"Distinct icons for different equipment types (tractor, water truck, bulldozer, livestock trailer). Each pin shows the volunteer\u2019s name, equipment description, and current assignment."}]),
      rb([{text:"Firebreak visualization: ",bold:true},{text:"The Fire Chief can draw lines on the map representing planned or completed firebreaks. These are visible to all users so farmers know where to plow and residents know which lines are being defended."}]),

      h3("Map Layer: Fire Intelligence"),
      rb([{text:"Projected fire spread polygon: ",bold:true},{text:"Based on wind speed, wind direction, terrain, and fuel type. Updates continuously. Every user can see where the fire is going and when it will get there."}]),
      rb([{text:"\u201CIn the black\u201D regions: ",bold:true},{text:"Already-burned areas are marked as safe zones on the map. Civilians with heavy equipment can see where to retreat if the fire jumps their line. This is the same feature that would have shown the Granite Mountain crew where safety was at Yarnell."}]),
      rb([{text:"Fire intensity overlay: ",bold:true},{text:"Heat gradient showing how hot the fire is burning in each area, from aerial and satellite data."}]),

      h3("Help Tab: Request Lifecycle"),
      rb([{text:"Request categories: ",bold:true},{text:"\u201CI Need a Ride,\u201D \u201CI Need Help Evacuating,\u201D \u201CI Need Help with Animals,\u201D \u201CI\u2019m Trapped,\u201D \u201COther.\u201D Each category has appropriate fields (address, people count, animal type, special needs)."}]),
      rb([{text:"Three-state lifecycle: ",bold:true},{text:"Open (red pin) \u2192 Claimed (yellow pin, helper assigned) \u2192 Fulfilled (removed from map and queue). Resolved requests disappear entirely. The interface always shows only active needs."}]),
      rb([{text:"Auto-resolution: ",bold:true},{text:"If a requester\u2019s GPS shows them moving away from the danger zone, the request auto-resolves. If a claimed request shows no progress (requester still at same location), it re-escalates after a time window."}]),
      rb([{text:"\u201CI Can Help\u201D categories: ",bold:true},{text:"\u201CI Have a Vehicle with Room,\u201D \u201CI Have a Trailer (livestock/horse),\u201D \u201CI Have Heavy Equipment (tractor/bulldozer),\u201D \u201CI Have Medical Training,\u201D \u201CI Have LE/Military Experience,\u201D \u201COther.\u201D"}]),

      h3("School Evacuation Module"),
      rb([{text:"Student roster with three states: ",bold:true},{text:"At School \u2192 On Bus (with bus number) \u2192 Reunified with Parent (with parent name and timestamp). Principal sees total count. Parent sees only their child."}]),
      rb([{text:"Bus tracking: ",bold:true},{text:"Each bus is a moving dot on the map with an ETA to destination. Parents can see their child\u2019s bus."}]),
      rb([{text:"Receiving school notification: ",bold:true},{text:"The destination school gets an alert with incoming count and ETA so they can prepare."}]),
      rb([{text:"Parent notification with destination: ",bold:true},{text:"Action Required card pushed to all parents with the pickup location, map pin, and explicit instruction not to come to the school."}]),

      h3("Traffic Intelligence"),
      rb([{text:"Evacuation flow visualization: ",bold:true},{text:"Location-sharing evacuees appear as a flow of dots on the evacuation routes. Stationary clusters indicate bottlenecks."}]),
      rb([{text:"Bottleneck auto-detection: ",bold:true},{text:"When N+ dots are stationary at a point for more than X minutes, Beacon flags it to the evacuation manager: \u201CTraffic stopped at [location]. [N] vehicles stationary for [X] minutes.\u201D"}]),
      rb([{text:"Alternate route suggestions: ",bold:true},{text:"The evacuation manager can draw alternate routes on the map and push them to evacuees who have not yet departed."}]),

      h3("Communication Architecture"),
      p("This scenario confirms the three-layer model works for community-scale coordination:"),
      sp(60),
      rb([{text:"Layer 1 \u2014 Action Required: ",bold:true},{text:"Evacuation orders, school evacuation notifications to parents, assistance requests. These require acknowledgment and drive the building status map."}]),
      rb([{text:"Layer 2 \u2014 Situational Awareness: ",bold:true},{text:"Fire position and projection, firebreak status, traffic flow, evacuation progress. This is the shared map that gives everyone the same picture."}]),
      rb([{text:"Layer 3 \u2014 Operational: ",bold:true},{text:"Fire Chief assigning firebreaks to specific farmers. Deputy tasking Frank to direct traffic. Teacher confirming bus headcounts. This happens inside teams and direct messages, not on the public timeline."}]),

      sp(200),
      new Table({width:{size:CW,type:WidthType.DXA},columnWidths:[CW],
        rows:[new TableRow({children:[new TableCell({
          borders:noB,width:{size:CW,type:WidthType.DXA},
          shading:{fill:PURPLE,type:ShadingType.CLEAR},
          margins:{top:200,bottom:200,left:300,right:300},
          children:[
            new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:120},
              children:[new TextRun({text:"The Core Principle",font:"Arial",size:32,bold:true,color:WHITE})]}),
            new Paragraph({alignment:AlignmentType.CENTER,
              children:[new TextRun({text:"A grassland fire moving at 10 mph gives a small town 15 minutes. That is not enough time for a centralized command structure to identify every need, dispatch every resource, and track every person. But it is enough time for a community to coordinate itself \u2014 if every person has the same information and the same tools. Beacon does not replace the fire chief or the deputy. It turns every farmer with a tractor, every neighbor with a truck, every retired officer with experience, and every parent with a phone into a coordinated participant in the response. The result is not one deputy trying to manage 600 people. It is 600 people managing themselves, with the deputy making sure no one falls through the cracks.",font:"Arial",size:22,color:"DDDDDD"})]}),
          ]
        })]})]
      }),
    ]
  },

  ]
});

const buf = await Packer.toBuffer(doc);
fs.writeFileSync("/sessions/friendly-bold-bardeen/mnt/beacon/wildfire_scenario_user_journeys/14_grassland_fire_community_coordination.docx", buf);
console.log("Created: 14_grassland_fire_community_coordination.docx");
}

generate().catch(e=>{ console.error(e); process.exit(1); });
