// Shared primitives for heuristic scoring. Pure, tile-local, no I/O.

export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const norm  = (x: number, lo: number, hi: number) => clamp((x - lo) / (hi - lo));
export const sigmoid = (x: number, k = 1) => 1 / (1 + Math.exp(-k * x));

export type CellInputs = {
  elev_m: number;
  slope_deg: number;
  aspect_deg: number;
  tpi: number;
  hand_m: number;
  landcover: number;
  nonburnable_frac: number;
  fuel_fm40: number;
  canopy_h_m: number;
  bldg_h_m: number;
  bldg_density: number;
  dist_road_m: number;
  dist_water_m: number;
  dist_coast_m: number;
  fault_dist_m: number;
  volcano_dist_m: number;
  shake_vs30: number;
  popdens: number;
};

export type Advice = 'shelter' | 'move' | 'evacuate';

export function decide(safety: number, hazard: number, etaSeconds?: number): Advice {
  if (hazard >= 0.7) return 'evacuate';
  if (safety >= 0.7 && hazard < 0.4) return 'shelter';
  if (etaSeconds !== undefined && etaSeconds < 600) return 'evacuate';
  return 'move';
}
