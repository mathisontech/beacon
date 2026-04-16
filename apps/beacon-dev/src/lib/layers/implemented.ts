// Set of layer / hazard ids that have a real rendering implementation
// on the live world map. Anything not in this set is shown as a grayed
// placeholder in the layers panel.

export const IMPLEMENTED_LAYERS: ReadonlySet<string> = new Set([
  "live-nws-alerts",
  "live-nifc-fires",
  "live-feeds-master",
  "ref-countries",
  "ref-states",
  "ref-fault-lines",
  "ref-volcanoes",
]);

export const IMPLEMENTED_HAZARDS: ReadonlySet<string> = new Set([
  "volcano",
]);

export function isLayerImpl(id: string): boolean {
  return IMPLEMENTED_LAYERS.has(id);
}
export function isHazardImpl(id: string): boolean {
  return IMPLEMENTED_HAZARDS.has(id);
}
