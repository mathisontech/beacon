/** Comprehensive layer system types */

export interface Layer {
  id: string;
  label: string;
  enabled: boolean;
  opacity: number;
  /** SVG path data for the layer icon */
  path?: string;
  /** Icon color */
  color?: string;
  /** Minimum zoom level to show (undefined = always) */
  minZoom?: number;
  /** Show a heatmap representation when zoomed out past minZoom */
  heatmapFallback?: boolean;
  /** True when a rendering layer is actually wired up. Unimplemented
   *  layers stay in the registry (as roadmap) but render grayed out. */
  impl?: boolean;
}

export interface HazardSublayers {
  risk: Layer;
  activeEvents: Layer;
  eventsOfInterest: Layer;
  coverage: Layer;
}

export interface HazardLayer {
  id: string;
  label: string;
  color: string;
  dimColor: string;
  path: string;
  sublayers: HazardSublayers;
}

export interface LayerCategory {
  id: string;
  label: string;
  layers: Layer[];
}

export interface HazardCategory {
  id: string;
  label: string;
  hazards: HazardLayer[];
}

export interface LayerRegistry {
  baseMap: LayerCategory;
  weather: LayerCategory;
  hazards: HazardCategory;
  reference: LayerCategory;
  live: LayerCategory;
  fun: LayerCategory;
}
