# Beacon Tile Server Setup

Self-hosted vector tiles via PMTiles on Cloudflare R2.
No tile server process — tiles served directly from CDN via HTTP range requests.

## Why this architecture

- **Zero server** — no process to crash during emergencies
- **Infinite burst** — Cloudflare handles any spike automatically
- **Zero egress fees** — R2 doesn't charge for bandwidth
- **Offline capable** — tiles cached on devices via service worker
- **Full customization** — every road, building, label is styleable

## 1. Get the PMTiles file

Download the latest Protomaps build (global OpenStreetMap data):

```bash
# ~80GB for full planet, takes a few hours
curl -L -o planet.pmtiles https://build.protomaps.com/20250101.pmtiles

# Or use a regional extract to start smaller:
# California: ~2GB
# US: ~15GB
# See https://protomaps.com/downloads for extracts
```

## 2. Upload to Cloudflare R2

```bash
# Install wrangler CLI
npm install -g wrangler
wrangler login

# Create R2 bucket
wrangler r2 bucket create beacon-tiles

# Upload (supports resumable uploads for large files)
wrangler r2 object put beacon-tiles/planet.pmtiles --file=planet.pmtiles

# Enable public access
# In Cloudflare dashboard: R2 > beacon-tiles > Settings > Public Access > Allow
# Or connect a custom domain: tiles.beacon.app
```

## 3. Configure Beacon

Add to `.env.local`:

```
NEXT_PUBLIC_PMTILES_URL=https://tiles.beacon.app/planet.pmtiles
```

Or if using R2 public URL:

```
NEXT_PUBLIC_PMTILES_URL=https://pub-xxxxx.r2.dev/planet.pmtiles
```

## 4. Install dependencies

```bash
npm install pmtiles protomaps-themes-base
```

## 5. CORS headers (R2)

Add to your R2 bucket CORS config:

```json
[
  {
    "AllowedOrigins": ["https://beacon.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range"],
    "ExposeHeaders": ["Content-Range", "Content-Length"],
    "MaxAgeSeconds": 86400
  }
]
```

## 6. Device caching (service worker)

The service worker in `public/sw-tiles.js` intercepts tile requests and caches
them in the browser's Cache API. Tiles are cached for 30 days and served
offline-first. A typical city area (~50km radius) caches at ~20-50MB.

## Cost estimate

| Component | Monthly cost |
|-----------|-------------|
| R2 storage (80GB) | $1.20 |
| R2 requests (1M range) | $0.36 |
| R2 egress | $0.00 |
| **Total** | **~$2/month** |

Scales to millions of requests with no config changes.

## Alternative: AWS S3 + CloudFront

If you prefer AWS:

```bash
aws s3 cp planet.pmtiles s3://beacon-tiles/planet.pmtiles
# Add CloudFront distribution with Range request support
# ~$5-15/month depending on traffic (egress charges apply)
```

## Files

- `src/lib/pmtiles-setup.ts` — registers pmtiles:// protocol with MapLibre
- `src/lib/map-style.ts` — custom vector style with editable color palettes
- `src/components/map/base-views/flat-2d.tsx` — 2D view using vector tiles
