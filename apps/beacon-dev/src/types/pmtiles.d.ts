// Minimal ambient shim until `pmtiles` is installed via
// `pnpm install` on the deployment machine. The real package ships
// its own .d.ts; this is just enough to let the repo typecheck with
// no node_modules for it.

declare module "pmtiles" {
  export interface Source {
    getKey(): string;
    getBytes(offset: number, length: number): Promise<{ data: ArrayBuffer }>;
  }
  export interface TileResult {
    data: ArrayBuffer;
  }
  export class PMTiles {
    constructor(source: Source | string);
    getZxy(z: number, x: number, y: number): Promise<TileResult | undefined>;
  }
  export class FetchSource implements Source {
    constructor(url: string);
    getKey(): string;
    getBytes(offset: number, length: number): Promise<{ data: ArrayBuffer }>;
  }
  export class Protocol {
    constructor();
    tile(params: { url: string }, abortController?: AbortController): Promise<{ data: Uint8Array }>;
  }
}
