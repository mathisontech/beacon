"use client";

import { useEffect, useState } from "react";

// Loads Leaflet JS + CSS from unpkg on first mount. Returns the
// global `L` once it's ready. Avoids bundling Leaflet as an npm dep.
const JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

export function useLeafletCdn(): unknown | null {
  const [L, setL] = useState<unknown | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { L?: unknown };
    if (w.L) {
      setL(w.L);
      return;
    }

    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_URL;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${JS_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => setL(w.L ?? null));
      if (w.L) setL(w.L);
      return;
    }

    const script = document.createElement("script");
    script.src = JS_URL;
    script.async = true;
    script.onload = () => setL(w.L ?? null);
    document.body.appendChild(script);
  }, []);

  return L;
}
