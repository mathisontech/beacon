import type { LayerRegistry } from "./types";
import { BASE_MAP } from "./base-map";
import { WEATHER } from "./weather";
import { HAZARDS } from "./hazards";
import { REFERENCE } from "./reference";
import { LIVE } from "./live";
import { FUN } from "./fun";

export const LAYER_REGISTRY: LayerRegistry = {
  baseMap: BASE_MAP,
  weather: WEATHER,
  hazards: HAZARDS,
  reference: REFERENCE,
  live: LIVE,
  fun: FUN,
};

/** Total layer count for display purposes */
export function countLayers(reg: LayerRegistry): number {
  const simple =
    reg.baseMap.layers.length +
    reg.weather.layers.length +
    reg.reference.layers.length +
    reg.live.layers.length +
    reg.fun.layers.length;
  const hazard = reg.hazards.hazards.length * 4;
  return simple + hazard;
}
