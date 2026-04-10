/**
 * PMTiles + MapLibre integration
 *
 * Registers the pmtiles:// protocol with MapLibre so vector tiles
 * can be fetched directly from a .pmtiles file on any CDN (Cloudflare R2, S3, etc).
 *
 * Usage:
 *   import { registerPMTiles, PMTILES_URL } from '@/lib/pmtiles-setup';
 *   registerPMTiles(maplibregl);
 *   // then use pmtiles:// URLs in your style sources
 *
 * Install: npm install pmtiles protomaps-themes-base
 */

let _registered = false;

/** Default PMTiles URL — point this at your R2/S3 bucket */
export const PMTILES_URL =
  process.env.NEXT_PUBLIC_PMTILES_URL ||
  'https://build.protomaps.com/20250101.pmtiles'; // free demo — replace with your own

/**
 * Register the pmtiles:// protocol handler with MapLibre.
 * Safe to call multiple times — only registers once.
 */
export async function registerPMTiles(maplibregl: {
  addProtocol: (name: string, handler: unknown) => void;
}) {
  if (_registered) return;

  // Dynamic import — works whether installed via npm or loaded from CDN
  const { pmtiles } = await getPMTilesLib();
  const protocol = new pmtiles.PMTiles(PMTILES_URL);

  maplibregl.addProtocol('pmtiles', (params: { url: string }) => {
    const url = params.url.replace('pmtiles://', '');
    // @ts-expect-error pmtiles protocol handler
    return protocol.getResource(url);
  });

  _registered = true;
}

async function getPMTilesLib() {
  try {
    // Prefer npm-installed version
    const mod = await import('pmtiles');
    return { pmtiles: mod };
  } catch {
    // Fallback: load from CDN
    if (typeof window !== 'undefined') {
      await loadScript('https://unpkg.com/pmtiles@4.2.0/dist/pmtiles.js');
      return { pmtiles: (window as Record<string, unknown>).pmtiles as typeof import('pmtiles') };
    }
    throw new Error('pmtiles not available');
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
