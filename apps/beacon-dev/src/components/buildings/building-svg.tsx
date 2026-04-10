'use client';

interface BuildingSvgProps {
  viewMode: '3d' | 'clay' | '2d';
  zoomLevel: 'far' | 'mid' | 'close';
  buildingType: string;
  color: string;
}

export default function BuildingSvg({ viewMode, zoomLevel, buildingType, color }: BuildingSvgProps) {
  if (zoomLevel === 'far') return <FarView viewMode={viewMode} color={color} />;
  if (zoomLevel === 'mid') return <MidView viewMode={viewMode} color={color} />;
  return <CloseView viewMode={viewMode} color={color} />;
}

// Isometric projection helpers
const ISO = { x: 0.866, y: 0.5 }; // cos(30), sin(30)

function isoPoint(x: number, y: number, z: number, ox: number, oy: number): [number, number] {
  const sx = ox + (x - y) * ISO.x * 1.0;
  const sy = oy + (x + y) * ISO.y * 0.6 - z * 0.9;
  return [sx, sy];
}

function isoRect(
  x: number, y: number, z: number, w: number, d: number, h: number,
  ox: number, oy: number
) {
  // Returns face polygons for an isometric box
  const p = (px: number, py: number, pz: number) => isoPoint(px, py, pz, ox, oy);
  const top = [p(x,y,z+h), p(x+w,y,z+h), p(x+w,y+d,z+h), p(x,y+d,z+h)];
  const left = [p(x,y+d,z), p(x,y+d,z+h), p(x+w,y+d,z+h), p(x+w,y+d,z)];
  const right = [p(x+w,y,z), p(x+w,y,z+h), p(x+w,y+d,z+h), p(x+w,y+d,z)];
  return { top, left, right };
}

function polyStr(pts: [number, number][]): string {
  return pts.map(p => `${p[0]},${p[1]}`).join(' ');
}

/* ===== FAR VIEW ===== */
function FarView({ viewMode, color }: { viewMode: string; color: string }) {
  const bg = viewMode === '3d' ? '#1a2332' : viewMode === 'clay' ? '#e8e0d4' : '#e8edf2';
  const ground = viewMode === '3d' ? '#2a3a4a' : viewMode === 'clay' ? '#d4cbbe' : '#d0dae4';
  const fp = viewMode === 'clay' ? '#b8a998' : color;
  const op = viewMode === '2d' ? 0.5 : 0.8;

  return (
    <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="280" fill={bg} />
      <rect x="40" y="140" width="320" height="120" rx="2" fill={ground} opacity={0.5} />
      <rect x="180" y="140" width="24" height="120" fill={viewMode === '3d' ? '#374a5e' : viewMode === 'clay' ? '#c4b8a8' : '#c0ccd6'} opacity={0.6} />
      <rect x="60" y="195" width="280" height="4" fill={viewMode === '3d' ? '#374a5e' : viewMode === 'clay' ? '#c4b8a8' : '#c0ccd6'} opacity={0.6} />
      {[
        [80, 155, 22, 18], [115, 160, 16, 14], [140, 152, 20, 20],
        [220, 155, 24, 16], [260, 150, 18, 22], [295, 158, 20, 16],
        [75, 210, 18, 16], [110, 215, 24, 14], [150, 208, 16, 18],
        [215, 212, 22, 18], [255, 210, 16, 14], [290, 215, 20, 16],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={1}
          fill={fp} opacity={op}
          stroke={viewMode === '2d' ? color : 'none'} strokeWidth={viewMode === '2d' ? 1 : 0}
        />
      ))}
      <text x="200" y="30" textAnchor="middle" fontSize="11" fill={viewMode === '3d' ? '#ffffff55' : '#9ca3af'} fontFamily="inherit">
        Footprints — color by purpose
      </text>
    </svg>
  );
}

/* ===== MID VIEW — Sims-style neighborhood ===== */
function MidView({ viewMode, color }: { viewMode: string; color: string }) {
  const bg = viewMode === '3d' ? '#1a2332' : viewMode === 'clay' ? '#e8e0d4' : '#e8edf2';
  const ox = 200, oy = 200;

  const palette = getPalette(viewMode, color);

  if (viewMode === '2d') {
    return (
      <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%' }}>
        <rect width="400" height="280" fill={bg} />
        {/* Roads */}
        <rect x="60" y="135" width="280" height="8" rx="1" fill="#c0ccd6" opacity={0.6} />
        <rect x="195" y="50" width="8" height="180" rx="1" fill="#c0ccd6" opacity={0.6} />
        {/* Building footprints as 2D outlines */}
        {[
          { x: 80, y: 60, w: 50, h: 40, label: 'RES' },
          { x: 140, y: 55, w: 40, h: 50, label: 'RES' },
          { x: 220, y: 60, w: 70, h: 45, label: 'COM' },
          { x: 310, y: 65, w: 35, h: 35, label: 'RES' },
          { x: 80, y: 160, w: 55, h: 45, label: 'RES' },
          { x: 160, y: 165, w: 30, h: 30, label: 'RES' },
          { x: 220, y: 155, w: 45, h: 55, label: 'SCH' },
          { x: 300, y: 160, w: 40, h: 40, label: 'RES' },
        ].map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={2}
              fill={`${color}18`} stroke={color} strokeWidth={1.5} />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 3} textAnchor="middle"
              fontSize="8" fill={`${color}88`} fontFamily="inherit">{b.label}</text>
          </g>
        ))}
      </svg>
    );
  }

  // 3D / Clay isometric neighborhood
  return (
    <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="280" fill={bg} />

      {/* Ground plane */}
      <polygon points={polyStr([
        isoPoint(-80, -60, 0, ox, oy),
        isoPoint(80, -60, 0, ox, oy),
        isoPoint(80, 60, 0, ox, oy),
        isoPoint(-80, 60, 0, ox, oy),
      ])} fill={palette.ground} opacity={0.4} />

      {/* Road horizontal */}
      <polygon points={polyStr([
        isoPoint(-80, -3, 0, ox, oy),
        isoPoint(80, -3, 0, ox, oy),
        isoPoint(80, 3, 0, ox, oy),
        isoPoint(-80, 3, 0, ox, oy),
      ])} fill={palette.road} opacity={0.5} />

      {/* Road vertical */}
      <polygon points={polyStr([
        isoPoint(-3, -60, 0, ox, oy),
        isoPoint(3, -60, 0, ox, oy),
        isoPoint(3, 60, 0, ox, oy),
        isoPoint(-3, 60, 0, ox, oy),
      ])} fill={palette.road} opacity={0.5} />

      {/* Back row houses (behind road) */}
      <SimsHouse x={-60} y={-40} w={22} d={18} h={14} roofH={8} ox={ox} oy={oy} palette={palette} />
      <SimsHouse x={-25} y={-45} w={18} d={16} h={12} roofH={7} ox={ox} oy={oy} palette={palette} />
      <SimsHouse x={15} y={-42} w={24} d={20} h={16} roofH={9} ox={ox} oy={oy} palette={palette} />
      <SimsHouse x={50} y={-38} w={20} d={16} h={13} roofH={7} ox={ox} oy={oy} palette={palette} />

      {/* Front row — featured house larger, with garage wing */}
      <SimsHouseWithGarage x={-50} y={20} w={28} d={22} h={18} roofH={10}
        garageW={12} garageD={16} garageH={10}
        ox={ox} oy={oy} palette={palette} />
      <SimsHouse x={0} y={18} w={20} d={16} h={14} roofH={8} ox={ox} oy={oy} palette={palette} />
      <SimsHouseWithGarage x={35} y={22} w={24} d={20} h={16} roofH={9}
        garageW={10} garageD={14} garageH={9}
        ox={ox} oy={oy} palette={palette} />
    </svg>
  );
}

/* ===== CLOSE VIEW — Sims-style detailed house ===== */
function CloseView({ viewMode, color }: { viewMode: string; color: string }) {
  const bg = viewMode === '3d' ? '#1a2332' : viewMode === 'clay' ? '#e8e0d4' : '#e8edf2';
  const palette = getPalette(viewMode, color);
  const labelColor = viewMode === '3d' ? '#ffffff88' : '#6b7280';
  const lineColor = viewMode === '3d' ? '#ffffff33' : '#d1d5db';

  if (viewMode === '2d') {
    return <Close2D color={color} bg={bg} labelColor={labelColor} lineColor={lineColor} />;
  }

  const ox = 200, oy = 190;
  // Main house body
  const mx = -35, my = -20, mw = 50, md = 40, mh = 32, mRoof = 18;
  // Garage wing
  const gx = mx + mw, gy = my + 8, gw = 22, gd = 28, gh = 20, gRoof = 10;
  // Porch overhang
  const px = mx + 8, py = my + md, pw = 20, pd = 8, ph = 14;

  return (
    <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="280" fill={bg} />

      {/* Ground */}
      <polygon points={polyStr([
        isoPoint(-80, -50, 0, ox, oy),
        isoPoint(60, -50, 0, ox, oy),
        isoPoint(60, 60, 0, ox, oy),
        isoPoint(-80, 60, 0, ox, oy),
      ])} fill={palette.ground} opacity={0.3} />

      {/* Lot boundary */}
      <polygon points={polyStr([
        isoPoint(mx - 10, my - 10, 0, ox, oy),
        isoPoint(gx + gw + 10, my - 10, 0, ox, oy),
        isoPoint(gx + gw + 10, my + md + 20, 0, ox, oy),
        isoPoint(mx - 10, my + md + 20, 0, ox, oy),
      ])} fill="none" stroke={lineColor} strokeWidth={0.5} strokeDasharray="3 2" />

      {/* Driveway */}
      <polygon points={polyStr([
        isoPoint(gx + 2, gy + gd, 0, ox, oy),
        isoPoint(gx + gw - 2, gy + gd, 0, ox, oy),
        isoPoint(gx + gw + 8, gy + gd + 18, 0, ox, oy),
        isoPoint(gx - 4, gy + gd + 18, 0, ox, oy),
      ])} fill={palette.driveway} opacity={0.5} />

      {/* Tree */}
      <SimsTree x={mx - 6} y={my - 5} ox={ox} oy={oy} palette={palette} />

      {/* Shadow beneath house */}
      <polygon points={polyStr([
        isoPoint(mx + 4, my + 4, 0, ox, oy),
        isoPoint(gx + gw + 4, gy + 4, 0, ox, oy),
        isoPoint(gx + gw + 4, my + md + 4, 0, ox, oy),
        isoPoint(mx + 4, my + md + 4, 0, ox, oy),
      ])} fill={palette.shadow} />

      {/* GARAGE WING — rendered first (behind main body) */}
      <SimsBox x={gx} y={gy} z={0} w={gw} d={gd} h={gh} ox={ox} oy={oy} palette={palette} wallShade="dark" />
      {/* Garage roof — shed style slopes toward back */}
      <SimsShedRoof x={gx} y={gy} z={gh} w={gw} d={gd} h={gRoof} ox={ox} oy={oy} palette={palette} />
      {/* Garage door on front face */}
      <SimsGarageDoor x={gx + 3} y={gy + gd} z={0} w={gw - 6} h={gh - 4} ox={ox} oy={oy} palette={palette} />

      {/* MAIN HOUSE BODY */}
      <SimsBox x={mx} y={my} z={0} w={mw} d={md} h={mh} ox={ox} oy={oy} palette={palette} wallShade="light" />

      {/* PORCH OVERHANG — extends forward from main, thinner roof slab */}
      <SimsBox x={px} y={py} z={ph} w={pw} d={pd} h={2} ox={ox} oy={oy} palette={palette} wallShade="roof" />
      {/* Porch columns */}
      {[0, pw].map((cx, i) => (
        <line key={i}
          x1={isoPoint(px + cx, py + pd, 0, ox, oy)[0]}
          y1={isoPoint(px + cx, py + pd, 0, ox, oy)[1]}
          x2={isoPoint(px + cx, py + pd, ph + 2, ox, oy)[0]}
          y2={isoPoint(px + cx, py + pd, ph + 2, ox, oy)[1]}
          stroke={palette.wallLight} strokeWidth={2}
        />
      ))}

      {/* GABLE ROOF on main house */}
      <SimsGableRoof x={mx} y={my} z={mh} w={mw} d={md} h={mRoof} ox={ox} oy={oy} palette={palette} />
      {/* Chimney on roof */}
      <SimsBox x={mx + mw - 12} y={my + 4} z={mh + mRoof - 4} w={5} d={5} h={10} ox={ox} oy={oy} palette={palette} wallShade="chimney" />

      {/* WINDOWS — main house front wall */}
      <SimsWindow x={mx + 6} y={my + md} z={mh - 18} w={10} h={10} ox={ox} oy={oy} palette={palette} face="front" />
      <SimsWindow x={mx + 20} y={my + md} z={mh - 18} w={10} h={10} ox={ox} oy={oy} palette={palette} face="front" />
      <SimsWindow x={mx + 34} y={my + md} z={mh - 18} w={8} h={8} ox={ox} oy={oy} palette={palette} face="front" />
      {/* Second floor windows */}
      <SimsWindow x={mx + 10} y={my + md} z={mh - 8} w={8} h={6} ox={ox} oy={oy} palette={palette} face="front" />
      <SimsWindow x={mx + 26} y={my + md} z={mh - 8} w={8} h={6} ox={ox} oy={oy} palette={palette} face="front" />

      {/* Side windows */}
      <SimsWindow x={mx + mw} y={my + 6} z={mh - 18} w={8} h={10} ox={ox} oy={oy} palette={palette} face="side" />
      <SimsWindow x={mx + mw} y={my + 22} z={mh - 18} w={8} h={10} ox={ox} oy={oy} palette={palette} face="side" />

      {/* DOOR under porch */}
      <SimsDoor x={px + 6} y={py} z={0} w={7} h={13} ox={ox} oy={oy} palette={palette} />

      {/* ANNOTATION LINES */}
      {/* Height */}
      <line x1={isoPoint(mx - 6, my + md, 0, ox, oy)[0]} y1={isoPoint(mx - 6, my + md, 0, ox, oy)[1]}
            x2={isoPoint(mx - 6, my + md, mh + mRoof, ox, oy)[0]} y2={isoPoint(mx - 6, my + md, mh + mRoof, ox, oy)[1]}
            stroke={lineColor} strokeWidth={0.5} />
      <text x={isoPoint(mx - 8, my + md, (mh + mRoof) / 2, ox, oy)[0] - 4}
            y={isoPoint(mx - 8, my + md, (mh + mRoof) / 2, ox, oy)[1]}
            fontSize="7" fill={labelColor} fontFamily="inherit" textAnchor="end">7.5m</text>

      {/* Material callout */}
      <line x1={isoPoint(mx + mw / 2, my + md, mh / 2, ox, oy)[0]}
            y1={isoPoint(mx + mw / 2, my + md, mh / 2, ox, oy)[1]}
            x2={isoPoint(mx + mw / 2, my + md, mh / 2, ox, oy)[0] + 30}
            y2={isoPoint(mx + mw / 2, my + md, mh / 2, ox, oy)[1] + 12}
            stroke={lineColor} strokeWidth={0.5} />
      <text x={isoPoint(mx + mw / 2, my + md, mh / 2, ox, oy)[0] + 32}
            y={isoPoint(mx + mw / 2, my + md, mh / 2, ox, oy)[1] + 15}
            fontSize="7" fill={labelColor} fontFamily="inherit">Wood frame</text>

      {/* Roof callout */}
      <line x1={isoPoint(mx + mw / 2, my, mh + mRoof * 0.6, ox, oy)[0]}
            y1={isoPoint(mx + mw / 2, my, mh + mRoof * 0.6, ox, oy)[1]}
            x2={isoPoint(mx + mw / 2, my, mh + mRoof * 0.6, ox, oy)[0] - 30}
            y2={isoPoint(mx + mw / 2, my, mh + mRoof * 0.6, ox, oy)[1] - 12}
            stroke={lineColor} strokeWidth={0.5} />
      <text x={isoPoint(mx + mw / 2, my, mh + mRoof * 0.6, ox, oy)[0] - 32}
            y={isoPoint(mx + mw / 2, my, mh + mRoof * 0.6, ox, oy)[1] - 15}
            fontSize="7" fill={labelColor} fontFamily="inherit" textAnchor="end">Asphalt shingle</text>

      {/* Entry marker */}
      <circle cx={isoPoint(px + 10, py + pd + 2, 0, ox, oy)[0]}
              cy={isoPoint(px + 10, py + pd + 2, 0, ox, oy)[1]}
              r={3} fill="none" stroke={palette.entry} strokeWidth={1} />
      <text x={isoPoint(px + 10, py + pd + 2, 0, ox, oy)[0] + 6}
            y={isoPoint(px + 10, py + pd + 2, 0, ox, oy)[1] + 3}
            fontSize="6" fill={palette.entry} fontFamily="inherit">Entry</text>

      {/* Garage overhang label */}
      <text x={isoPoint(gx + gw / 2, gy + gd + 2, gh + gRoof / 2, ox, oy)[0]}
            y={isoPoint(gx + gw / 2, gy + gd + 2, gh + gRoof / 2, ox, oy)[1] - 4}
            fontSize="6" fill={labelColor} fontFamily="inherit" textAnchor="middle">Garage</text>
    </svg>
  );
}

/* ===== 2D Close Floor Plan ===== */
function Close2D({ color, bg, labelColor, lineColor }: { color: string; bg: string; labelColor: string; lineColor: string }) {
  return (
    <svg viewBox="0 0 400 280" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="280" fill={bg} />
      {/* Lot */}
      <rect x="60" y="35" width="280" height="210" rx="2" fill={`${color}06`} stroke={`${color}33`} strokeWidth={1} strokeDasharray="4 2" />
      {/* Main footprint — L-shape */}
      <path d={`M100,60 L240,60 L240,140 L280,140 L280,200 L240,200 L240,180 L100,180 Z`}
        fill={`${color}15`} stroke={color} strokeWidth={2} />
      {/* Internal walls */}
      <line x1="170" y1="60" x2="170" y2="180" stroke={`${color}44`} strokeWidth={0.5} />
      <line x1="100" y1="120" x2="240" y2="120" stroke={`${color}44`} strokeWidth={0.5} />
      <line x1="240" y1="160" x2="280" y2="160" stroke={`${color}44`} strokeWidth={0.5} />
      {/* Porch */}
      <rect x="130" y="180" width="40" height="12" rx="1" fill={`${color}08`} stroke={`${color}44`} strokeWidth={0.5} strokeDasharray="2 1" />
      {/* Room labels */}
      <text x="135" y="95" fontSize="8" fill={labelColor} fontFamily="inherit">LIVING</text>
      <text x="195" y="95" fontSize="8" fill={labelColor} fontFamily="inherit">KITCHEN</text>
      <text x="115" y="155" fontSize="8" fill={labelColor} fontFamily="inherit">BED 1</text>
      <text x="195" y="155" fontSize="8" fill={labelColor} fontFamily="inherit">BED 2</text>
      <text x="250" y="175" fontSize="7" fill={labelColor} fontFamily="inherit">GARAGE</text>
      <text x="140" y="190" fontSize="6" fill={labelColor} fontFamily="inherit">PORCH</text>
      {/* Door markers */}
      <circle cx="150" cy="180" r="3" fill={color} opacity={0.6} />
      <circle cx="260" cy="200" r="2.5" fill={color} opacity={0.4} />
      {/* Dimensions */}
      <line x1="100" y1="52" x2="240" y2="52" stroke={lineColor} strokeWidth={0.5} />
      <text x="170" y="49" textAnchor="middle" fontSize="7" fill={labelColor} fontFamily="inherit">14m</text>
      <line x1="92" y1="60" x2="92" y2="180" stroke={lineColor} strokeWidth={0.5} />
      <text x="85" y="122" textAnchor="middle" fontSize="7" fill={labelColor} fontFamily="inherit" transform="rotate(-90, 85, 122)">12m</text>
      <line x1="240" y1="132" x2="280" y2="132" stroke={lineColor} strokeWidth={0.5} />
      <text x="260" y="130" textAnchor="middle" fontSize="7" fill={labelColor} fontFamily="inherit">6m</text>
      {/* Area */}
      <text x="200" y="268" textAnchor="middle" fontSize="9" fill={labelColor} fontFamily="inherit">
        210 m² footprint — wood frame — residential
      </text>
    </svg>
  );
}

/* ===== COMPONENT PRIMITIVES ===== */

interface Palette {
  wallLight: string;
  wallDark: string;
  roofLight: string;
  roofDark: string;
  roofTop: string;
  ground: string;
  road: string;
  shadow: string;
  window: string;
  windowFrame: string;
  door: string;
  doorKnob: string;
  chimney: string;
  driveway: string;
  tree: string;
  treeTrunk: string;
  entry: string;
  garageDoor: string;
  garageLine: string;
}

function getPalette(viewMode: string, color: string): Palette {
  if (viewMode === 'clay') return {
    wallLight: '#d4c4b0', wallDark: '#bfad98', roofLight: '#a89480', roofDark: '#9a876e',
    roofTop: '#b8a48e', ground: '#d4cbbe', road: '#c4b8a8', shadow: 'rgba(0,0,0,0.10)',
    window: '#e8e0d4', windowFrame: '#c8b8a4', door: '#a09080', doorKnob: '#887060',
    chimney: '#988070', driveway: '#c8bca8', tree: '#b8c0a0', treeTrunk: '#a09080',
    entry: '#88a868', garageDoor: '#b8a898', garageLine: '#a89888',
  };
  if (viewMode === '2d') return {
    wallLight: `${color}30`, wallDark: `${color}20`, roofLight: `${color}40`, roofDark: `${color}30`,
    roofTop: `${color}20`, ground: '#d0dae4', road: '#c0ccd6', shadow: 'rgba(0,0,0,0.04)',
    window: `${color}15`, windowFrame: color, door: `${color}40`, doorKnob: color,
    chimney: `${color}30`, driveway: `${color}08`, tree: '#a0c4a0', treeTrunk: '#8a7a6a',
    entry: '#4ade80', garageDoor: `${color}20`, garageLine: `${color}30`,
  };
  // 3d
  return {
    wallLight: color, wallDark: `${color}bb`, roofLight: `${color}dd`, roofDark: `${color}aa`,
    roofTop: `${color}cc`, ground: '#2a3a4a', road: '#374a5e', shadow: 'rgba(0,0,0,0.25)',
    window: '#ffffff44', windowFrame: `${color}88`, door: '#ffffff22', doorKnob: '#ffffff44',
    chimney: `${color}99`, driveway: `${color}22`, tree: '#2d6b3e55', treeTrunk: '#5a3e2855',
    entry: '#4ade8088', garageDoor: '#ffffff18', garageLine: '#ffffff0c',
  };
}

function SimsBox({ x, y, z, w, d, h, ox, oy, palette, wallShade }: {
  x: number; y: number; z: number; w: number; d: number; h: number;
  ox: number; oy: number; palette: Palette; wallShade: string;
}) {
  const faces = isoRect(x, y, z, w, d, h, ox, oy);
  const fill = wallShade === 'dark' ? palette.wallDark
    : wallShade === 'roof' ? palette.roofLight
    : wallShade === 'chimney' ? palette.chimney
    : palette.wallLight;
  const fillDark = wallShade === 'dark' ? palette.wallDark
    : wallShade === 'roof' ? palette.roofDark
    : wallShade === 'chimney' ? palette.chimney
    : palette.wallDark;

  return (
    <g>
      <polygon points={polyStr(faces.left)} fill={fill} />
      <polygon points={polyStr(faces.right)} fill={fillDark} />
      <polygon points={polyStr(faces.top)} fill={wallShade === 'roof' ? palette.roofTop : palette.roofTop} opacity={0.3} />
    </g>
  );
}

function SimsGableRoof({ x, y, z, w, d, h, ox, oy, palette }: {
  x: number; y: number; z: number; w: number; d: number; h: number;
  ox: number; oy: number; palette: Palette;
}) {
  const p = (px: number, py: number, pz: number) => isoPoint(px, py, pz, ox, oy);
  const overhang = 3;
  // Ridge runs along x-axis (left-right), centered on d
  const ridgeY = y + d / 2;

  // Left roof face (front-facing)
  const leftFace = [
    p(x - overhang, ridgeY, z + h),
    p(x + w + overhang, ridgeY, z + h),
    p(x + w + overhang, y + d + overhang, z),
    p(x - overhang, y + d + overhang, z),
  ];
  // Right roof face (back-facing)
  const rightFace = [
    p(x - overhang, ridgeY, z + h),
    p(x + w + overhang, ridgeY, z + h),
    p(x + w + overhang, y - overhang, z),
    p(x - overhang, y - overhang, z),
  ];
  // Gable triangle (right side wall)
  const gableRight = [
    p(x + w, y, z),
    p(x + w, y + d, z),
    p(x + w, ridgeY, z + h),
  ];

  return (
    <g>
      <polygon points={polyStr(rightFace)} fill={palette.roofDark} />
      <polygon points={polyStr(leftFace)} fill={palette.roofLight} />
      <polygon points={polyStr(gableRight)} fill={palette.wallDark} opacity={0.6} />
      {/* Ridge line */}
      <line x1={p(x - overhang, ridgeY, z + h)[0]} y1={p(x - overhang, ridgeY, z + h)[1]}
            x2={p(x + w + overhang, ridgeY, z + h)[0]} y2={p(x + w + overhang, ridgeY, z + h)[1]}
            stroke={palette.roofDark} strokeWidth={0.8} />
    </g>
  );
}

function SimsShedRoof({ x, y, z, w, d, h, ox, oy, palette }: {
  x: number; y: number; z: number; w: number; d: number; h: number;
  ox: number; oy: number; palette: Palette;
}) {
  const p = (px: number, py: number, pz: number) => isoPoint(px, py, pz, ox, oy);
  const ov = 2;
  // Slopes from high (back/y) to low (front/y+d)
  const face = [
    p(x - ov, y - ov, z + h),
    p(x + w + ov, y - ov, z + h),
    p(x + w + ov, y + d + ov, z),
    p(x - ov, y + d + ov, z),
  ];
  const side = [
    p(x + w, y, z + h),
    p(x + w, y + d, z),
    p(x + w, y + d, z),
    p(x + w, y, z + h),
  ];

  return (
    <g>
      <polygon points={polyStr(face)} fill={palette.roofLight} />
    </g>
  );
}

function SimsWindow({ x, y, z, w, h, ox, oy, palette, face }: {
  x: number; y: number; z: number; w: number; h: number;
  ox: number; oy: number; palette: Palette; face: 'front' | 'side';
}) {
  const p = (px: number, py: number, pz: number) => isoPoint(px, py, pz, ox, oy);
  let pts: [number, number][];

  if (face === 'front') {
    pts = [p(x, y, z), p(x + w, y, z), p(x + w, y, z + h), p(x, y, z + h)];
  } else {
    pts = [p(x, y, z), p(x, y + w, z), p(x, y + w, z + h), p(x, y, z + h)];
  }

  // Cross panes
  const midH = (z + z + h) / 2;
  const midW = face === 'front' ? x + w / 2 : y + w / 2;

  return (
    <g>
      <polygon points={polyStr(pts)} fill={palette.window} />
      {/* Horizontal pane */}
      {face === 'front' ? (
        <>
          <line x1={p(x, y, midH)[0]} y1={p(x, y, midH)[1]}
                x2={p(x + w, y, midH)[0]} y2={p(x + w, y, midH)[1]}
                stroke={palette.windowFrame} strokeWidth={0.4} />
          <line x1={p(midW, y, z)[0]} y1={p(midW, y, z)[1]}
                x2={p(midW, y, z + h)[0]} y2={p(midW, y, z + h)[1]}
                stroke={palette.windowFrame} strokeWidth={0.4} />
        </>
      ) : (
        <>
          <line x1={p(x, y, midH)[0]} y1={p(x, y, midH)[1]}
                x2={p(x, y + w, midH)[0]} y2={p(x, y + w, midH)[1]}
                stroke={palette.windowFrame} strokeWidth={0.4} />
          <line x1={p(x, midW, z)[0]} y1={p(x, midW, z)[1]}
                x2={p(x, midW, z + h)[0]} y2={p(x, midW, z + h)[1]}
                stroke={palette.windowFrame} strokeWidth={0.4} />
        </>
      )}
    </g>
  );
}

function SimsDoor({ x, y, z, w, h, ox, oy, palette }: {
  x: number; y: number; z: number; w: number; h: number;
  ox: number; oy: number; palette: Palette;
}) {
  const p = (px: number, py: number, pz: number) => isoPoint(px, py, pz, ox, oy);
  const pts = [p(x, y, z), p(x + w, y, z), p(x + w, y, z + h), p(x, y, z + h)];
  const knobPos = p(x + w - 1.5, y, z + h * 0.45);

  return (
    <g>
      <polygon points={polyStr(pts)} fill={palette.door} />
      <circle cx={knobPos[0]} cy={knobPos[1]} r={0.8} fill={palette.doorKnob} />
    </g>
  );
}

function SimsGarageDoor({ x, y, z, w, h, ox, oy, palette }: {
  x: number; y: number; z: number; w: number; h: number;
  ox: number; oy: number; palette: Palette;
}) {
  const p = (px: number, py: number, pz: number) => isoPoint(px, py, pz, ox, oy);
  const pts = [p(x, y, z), p(x + w, y, z), p(x + w, y, z + h), p(x, y, z + h)];

  return (
    <g>
      <polygon points={polyStr(pts)} fill={palette.garageDoor} />
      {/* Horizontal lines on garage door */}
      {[0.25, 0.5, 0.75].map(frac => (
        <line key={frac}
          x1={p(x, y, z + h * frac)[0]} y1={p(x, y, z + h * frac)[1]}
          x2={p(x + w, y, z + h * frac)[0]} y2={p(x + w, y, z + h * frac)[1]}
          stroke={palette.garageLine} strokeWidth={0.4} />
      ))}
    </g>
  );
}

function SimsTree({ x, y, ox, oy, palette }: {
  x: number; y: number; ox: number; oy: number; palette: Palette;
}) {
  const base = isoPoint(x, y, 0, ox, oy);
  const top = isoPoint(x, y, 18, ox, oy);
  const mid = isoPoint(x, y, 8, ox, oy);

  return (
    <g>
      {/* Trunk */}
      <line x1={base[0]} y1={base[1]} x2={mid[0]} y2={mid[1]}
        stroke={palette.treeTrunk} strokeWidth={2.5} />
      {/* Canopy layers */}
      <ellipse cx={top[0]} cy={top[1] + 6} rx={10} ry={8} fill={palette.tree} />
      <ellipse cx={top[0] - 2} cy={top[1] + 2} rx={8} ry={6} fill={palette.tree} opacity={0.8} />
    </g>
  );
}

/* Mid-view house (simpler) */
function SimsHouse({ x, y, w, d, h, roofH, ox, oy, palette }: {
  x: number; y: number; w: number; d: number; h: number; roofH: number;
  ox: number; oy: number; palette: Palette;
}) {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx={isoPoint(x + w / 2 + 2, y + d / 2 + 2, 0, ox, oy)[0]}
               cy={isoPoint(x + w / 2 + 2, y + d / 2 + 2, 0, ox, oy)[1]}
               rx={w * 0.4} ry={d * 0.15} fill={palette.shadow} />
      <SimsBox x={x} y={y} z={0} w={w} d={d} h={h} ox={ox} oy={oy} palette={palette} wallShade="light" />
      <SimsGableRoof x={x} y={y} z={h} w={w} d={d} h={roofH} ox={ox} oy={oy} palette={palette} />
    </g>
  );
}

/* Mid-view house with garage wing */
function SimsHouseWithGarage({ x, y, w, d, h, roofH, garageW, garageD, garageH, ox, oy, palette }: {
  x: number; y: number; w: number; d: number; h: number; roofH: number;
  garageW: number; garageD: number; garageH: number;
  ox: number; oy: number; palette: Palette;
}) {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx={isoPoint(x + (w + garageW) / 2 + 2, y + d / 2 + 2, 0, ox, oy)[0]}
               cy={isoPoint(x + (w + garageW) / 2 + 2, y + d / 2 + 2, 0, ox, oy)[1]}
               rx={(w + garageW) * 0.35} ry={d * 0.15} fill={palette.shadow} />
      {/* Garage */}
      <SimsBox x={x + w} y={y + (d - garageD) / 2} z={0} w={garageW} d={garageD} h={garageH}
               ox={ox} oy={oy} palette={palette} wallShade="dark" />
      <SimsShedRoof x={x + w} y={y + (d - garageD) / 2} z={garageH} w={garageW} d={garageD} h={6}
                    ox={ox} oy={oy} palette={palette} />
      {/* Main house */}
      <SimsBox x={x} y={y} z={0} w={w} d={d} h={h} ox={ox} oy={oy} palette={palette} wallShade="light" />
      <SimsGableRoof x={x} y={y} z={h} w={w} d={d} h={roofH} ox={ox} oy={oy} palette={palette} />
    </g>
  );
}
