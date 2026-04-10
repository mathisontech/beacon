"use client";

import { useRef, useCallback } from "react";

interface Props {
  viewer: unknown;
}

const btnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 20,
  background: "rgba(31,51,72,0.85)",
  border: "1px solid rgba(255,255,255,0.15)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(8px)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  color: "white",
  touchAction: "none",
  userSelect: "none",
};

export default function MapZoomControls({ viewer }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moduleRef = useRef<{ zoomCamera: (v: unknown, f: number) => void } | null>(null);
  const prevViewerRef = useRef<unknown>(null);

  // Clear cached module if viewer changes (new viewer after view switch)
  if (viewer !== prevViewerRef.current) {
    prevViewerRef.current = viewer;
    moduleRef.current = null;
  }

  const getModule = useCallback(async () => {
    if (!moduleRef.current) {
      moduleRef.current = await import("@/lib/cesium-init");
    }
    return moduleRef.current;
  }, []);

  const singleZoom = useCallback(async (factor: number) => {
    if (!viewer) return;
    const mod = await getModule();
    mod.zoomCamera(viewer, factor);
  }, [viewer, getModule]);

  const startZoom = useCallback(async (factor: number) => {
    if (!viewer) return;
    const mod = await getModule();
    mod.zoomCamera(viewer, factor);
    intervalRef.current = setInterval(() => {
      mod.zoomCamera(viewer, factor);
    }, 80);
  }, [viewer, getModule]);

  const stopZoom = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 68,
        right: 16,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        zIndex: 20,
      }}
    >
      <button
        onClick={() => singleZoom(0.92)}
        onPointerDown={() => startZoom(0.92)}
        onPointerUp={stopZoom}
        onPointerLeave={stopZoom}
        style={btnStyle}
        title="Zoom in (hold)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <button
        onClick={() => singleZoom(1.08)}
        onPointerDown={() => startZoom(1.08)}
        onPointerUp={stopZoom}
        onPointerLeave={stopZoom}
        style={btnStyle}
        title="Zoom out (hold)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
