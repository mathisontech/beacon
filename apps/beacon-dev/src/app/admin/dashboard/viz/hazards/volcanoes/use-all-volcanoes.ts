"use client";

import { useEffect, useState } from "react";
import type { Volcano } from "./types";
import { ALL_VOLCANOES } from "./all-volcanoes";
import { fetchGvpHoloceneVolcanoes } from "./fetch-gvp-volcanoes";

// Static list first, then GVP Holocene set merged in. De-dupes by
// rounded lat/lng so curated entries (with HANS alert levels) win
// over the generic GVP copy of the same volcano.
export function useAllVolcanoes(): Volcano[] {
  const [list, setList] = useState<Volcano[]>(ALL_VOLCANOES);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchGvpHoloceneVolcanoes(ctrl.signal)
      .then((gvp) => {
        const seen = new Set(
          ALL_VOLCANOES.map((v) => `${v.lat.toFixed(2)},${v.lng.toFixed(2)}`)
        );
        const extra = gvp.filter(
          (v) => !seen.has(`${v.lat.toFixed(2)},${v.lng.toFixed(2)}`)
        );
        setList([...ALL_VOLCANOES, ...extra]);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.warn("GVP volcano fetch failed; using static list only:", err);
      });
    return () => ctrl.abort();
  }, []);

  return list;
}
