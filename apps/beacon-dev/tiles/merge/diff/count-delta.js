// Compare feature counts: NE states clipped to US bbox vs TIGER states.
// Flags any >20% delta. Emits reports/count-delta.json.
import { writeFileSync, mkdirSync } from 'node:fs';
import * as turf from '@turf/turf';
import { loadLayer, reportsDir } from './load.js';

const pairs = [
  { world: 'states', us: 'us_states', key: 'admin_1' },
  { world: 'populated', us: null,     key: 'populated_places' },
];

// Loose US bbox (CONUS + AK + HI + PR + territories).
const USBBOX = [-180, 17, -64, 72];

const out = {};
for (const p of pairs) {
  const w = loadLayer('world', p.world);
  if (!w) { out[p.key] = { skipped: 'missing world layer' }; continue; }

  const wFeats = w.features.filter(f => {
    if (!f.geometry) return false;
    const bb = turf.bbox(f);
    return bb[0] < USBBOX[2] && bb[2] > USBBOX[0] && bb[1] < USBBOX[3] && bb[3] > USBBOX[1];
  });
  const wCount = wFeats.length;

  if (!p.us) { out[p.key] = { world: wCount, us: null }; continue; }

  const u = loadLayer('us', p.us);
  if (!u) { out[p.key] = { world: wCount, us: null, note: 'us layer missing' }; continue; }
  const uCount = u.features.length;
  const delta  = wCount === 0 ? null : Math.abs(uCount - wCount) / wCount;
  out[p.key] = {
    world: wCount,
    us: uCount,
    delta_frac: delta === null ? null : Number(delta.toFixed(3)),
    flag: delta !== null && delta > 0.20,
  };
}

mkdirSync(reportsDir, { recursive: true });
writeFileSync(`${reportsDir}/count-delta.json`, JSON.stringify(out, null, 2));
const flagged = Object.values(out).filter(v => v && v.flag).length;
console.log(`count-delta: ${flagged} flagged`);
