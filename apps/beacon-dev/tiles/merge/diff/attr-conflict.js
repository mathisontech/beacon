// Compare state names: NE admin_1 inside US bbox vs TIGER us_states.
// Any name present in NE but missing in TIGER (and vice versa) is
// reported. Emits reports/attr-conflict.json.
import { writeFileSync, mkdirSync } from 'node:fs';
import { loadLayer, reportsDir } from './load.js';

const w = loadLayer('world', 'states');
const u = loadLayer('us', 'us_states');
if (!w || !u) {
  console.warn('attr-conflict: missing states layer; skipping');
  process.exit(0);
}

// Collect NE state names whose admin_0 is United States.
const neUS = new Set(
  w.features
    .filter(f => /United States/i.test(f.properties?.admin || f.properties?.ADMIN || ''))
    .map(f => (f.properties?.name || f.properties?.NAME || '').trim())
    .filter(Boolean)
);

const tigerUS = new Set(
  u.features.map(f => (f.properties?.NAME || f.properties?.name || '').trim()).filter(Boolean)
);

const onlyNE    = [...neUS].filter(n => !tigerUS.has(n));
const onlyTIGER = [...tigerUS].filter(n => !neUS.has(n));

const out = {
  world_states_us: neUS.size,
  us_states: tigerUS.size,
  only_in_ne: onlyNE.sort(),
  only_in_tiger: onlyTIGER.sort(),
};

mkdirSync(reportsDir, { recursive: true });
writeFileSync(`${reportsDir}/attr-conflict.json`, JSON.stringify(out, null, 2));
console.log(`attr-conflict: ne_only=${onlyNE.length} tiger_only=${onlyTIGER.length}`);
