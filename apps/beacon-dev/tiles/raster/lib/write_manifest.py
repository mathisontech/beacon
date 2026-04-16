#!/usr/bin/env python3
"""Write manifest.json listing all built raster layers with their
encoding parameters. The app uses this to decode tiles at runtime."""
import os
import json
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(__file__)
OUT_DIR = os.path.join(SCRIPT_DIR, '..', 'out')
LAYERS_PATH = os.path.join(SCRIPT_DIR, '..', 'layers.json')
MANIFEST_PATH = os.path.join(OUT_DIR, 'manifest.json')

def main():
    with open(LAYERS_PATH) as f:
        spec = json.load(f)

    archives = {f.replace('.pmtiles', ''): f for f in os.listdir(OUT_DIR) if f.endswith('.pmtiles')}

    layers = []
    for layer in spec['layers']:
        name = layer['name']
        pmtiles = archives.get(name)
        if not pmtiles:
            continue
        entry = {
            'name': name,
            'type': layer['type'],
            'archive': pmtiles,
            'size_bytes': os.path.getsize(os.path.join(OUT_DIR, pmtiles)),
        }
        if 'encoding' in layer:
            entry['encoding'] = layer['encoding']
            entry['scale'] = layer.get('scale')
            entry['offset'] = layer.get('offset')
        if 'unit' in layer:
            entry['unit'] = layer['unit']
        if 'max_classes' in layer:
            entry['max_classes'] = layer['max_classes']
        layers.append(entry)

    manifest = {
        'version': 1,
        'built': datetime.now(timezone.utc).isoformat(),
        'grid': spec['grid'],
        'layers': layers,
    }

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"manifest: {len(layers)} layers → {MANIFEST_PATH}")

if __name__ == '__main__':
    main()
