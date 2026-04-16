// Flag where NE countries' US polygon drifts from TIGER states
// dissolved boundary by >2 km. Emits reports/border-drift.geojson.
import { writeFileSync, mkdirSync } from 'node:fs';
import * as turf from '@turf/turf';
import { loadLayer, reportsDir } from './load.js';

const DRIFT_KM        = 2;
const STEP_KM         = 25;
const MIN_LINE_KM     = 50;
const MAX_LINE_KM     = 20000;   // cap weird antimeridian-crossing lines
const MAX_PTS_PER_LINE = 200;    // hard cap per line

const world = loadLayer('world', 'countries');
const us    = loadLayer('us', 'us_states');

if (!world || !us) {
  console.warn('border-drift: missing world countries or us_states; skipping');
  process.exit(0);
}

const usFromNE = world.features.find(f => {
  const p = f.properties || {};
  return [p.NAME, p.ADMIN, p.name, p.admin].some(
    n => n && /United States/i.test(n)
  );
});
if (!usFromNE) {
  console.warn('border-drift: US feature not found in NE countries; skipping');
  process.exit(0);
}

// Flatten to array of LineStrings for both boundaries.
function boundaryLines(polyFeature) {
  const res = turf.polygonToLine(polyFeature);
  const feats = res.type === 'FeatureCollection' ? res.features : [res];
  const lines = [];
  for (const f of feats) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'LineString') lines.push(turf.lineString(g.coordinates));
    else if (g.type === 'MultiLineString') {
      for (const c of g.coordinates) lines.push(turf.lineString(c));
    }
  }
  return lines;
}

// Dissolve all TIGER polygons to a single (multi)polygon boundary.
const tigerPolys = turf.featureCollection(
  us.features
    .filter(f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'))
);
// turf.union pairs-wise; dissolve via combine which is cheaper.
const tigerCombined = turf.combine(tigerPolys).features[0];
const tigerLines = boundaryLines(tigerCombined);
const neLines    = boundaryLines(usFromNE);

// Precompute each line's bbox once. Skip lines whose bbox is
// farther than the current best candidate distance.
function bboxDistKm(pt, bb) {
  const [x, y] = pt.geometry.coordinates;
  const dx = Math.max(bb[0] - x, 0, x - bb[2]);
  const dy = Math.max(bb[1] - y, 0, y - bb[3]);
  // degrees → km, crude (1 deg ~ 111 km) — fine as a prefilter.
  return Math.hypot(dx, dy) * 111;
}
function indexLines(lines) {
  return lines.map(l => ({ l, bb: turf.bbox(l) }));
}
function minDistKmToLines(pt, indexed) {
  let best = Infinity;
  for (const { l, bb } of indexed) {
    if (bboxDistKm(pt, bb) > best) continue;  // prefilter
    const d = turf.pointToLineDistance(pt, l, { units: 'kilometers' });
    if (d < best) best = d;
  }
  return best;
}

// Keep only long boundary lines (mainland, Alaska mainland, big islands).
const neBig    = neLines.filter(l => turf.length(l, { units: 'kilometers' }) >= MIN_LINE_KM);
const tigerBig = tigerLines.filter(l => turf.length(l, { units: 'kilometers' }) >= MIN_LINE_KM);
console.log(`border-drift: NE lines ${neLines.length}→${neBig.length} after ${MIN_LINE_KM}km filter, TIGER ${tigerLines.length}→${tigerBig.length}`);
const tigerIdx = indexLines(tigerBig);

const drifts = [];
let sampled = 0;
const t0 = Date.now();
for (let i = 0; i < neBig.length; i++) {
  const line = neBig[i];
  const rawLen = turf.length(line, { units: 'kilometers' });
  const len = Math.min(rawLen, MAX_LINE_KM);
  const step = Math.max(STEP_KM, len / MAX_PTS_PER_LINE);
  process.stdout.write(`  line ${i+1}/${neBig.length} (${rawLen.toFixed(0)} km, step ${step.toFixed(0)} km)`);
  for (let d = 0; d <= len; d += step) {
    const pt = turf.along(line, d, { units: 'kilometers' });
    const km = minDistKmToLines(pt, tigerIdx);
    if (km > DRIFT_KM) {
      pt.properties = { drift_km: Number(km.toFixed(2)) };
      drifts.push(pt);
    }
    sampled++;
  }
  console.log(` done ${((Date.now()-t0)/1000).toFixed(1)}s, ${drifts.length} flagged so far`);
}
console.log(`border-drift: sampled ${sampled} total`);

mkdirSync(reportsDir, { recursive: true });
writeFileSync(
  `${reportsDir}/border-drift.geojson`,
  JSON.stringify(turf.featureCollection(drifts))
);
console.log(`border-drift: ${drifts.length} sample points >${DRIFT_KM} km`);
