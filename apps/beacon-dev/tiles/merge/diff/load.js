// Shared loader. Reads a layer's GeoJSON FeatureCollection from
// either the world or us pipeline output directory.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const worldDir = resolve(here, '../../world/data/geojson');
const usDir    = resolve(here, '../../us/data/geojson');

export function loadLayer(scope, name) {
  const base = scope === 'world' ? worldDir : usDir;
  const path = `${base}/${name}.geojson`;
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

export const reportsDir = resolve(here, '../reports');
