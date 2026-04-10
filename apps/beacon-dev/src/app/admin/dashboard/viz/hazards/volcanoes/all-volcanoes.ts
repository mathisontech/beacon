import type { Volcano } from "./types";
import { VOLCANOES } from "./volcano-data";
import { VOLCANOES_GLOBAL } from "./volcano-data-global";

// Combined list: the 30 US volcanoes from volcano-data.ts plus
// ~120 globally significant entries from volcano-data-global.ts.
// This is what the playground map and the recent-eruptions
// fly-out actually iterate over.
//
// Keep the two source files separate so they can be updated and
// reviewed independently.
export const ALL_VOLCANOES: Volcano[] = [...VOLCANOES, ...VOLCANOES_GLOBAL];
