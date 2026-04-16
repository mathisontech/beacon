import path from "node:path";
import { PMTiles } from "pmtiles";
import { NodeFileSource } from "./file-source";

// Single process-wide PMTiles handle pointing at the Beacon basemap
// archive. The archive path is controlled by the
// BEACON_BASEMAP_PMTILES env var so deployments can point at a CDN-
// synced local file or a packaged asset.

let cached: PMTiles | null = null;

function archivePath(): string {
  const env = process.env.BEACON_BASEMAP_PMTILES;
  if (env) return env;
  return path.join(process.cwd(), "tiles", "out", "beacon-basemap.pmtiles");
}

export function basemapArchive(): PMTiles {
  if (cached) return cached;
  cached = new PMTiles(new NodeFileSource(archivePath()));
  return cached;
}
