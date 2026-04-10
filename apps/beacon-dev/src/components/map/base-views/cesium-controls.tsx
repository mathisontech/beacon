'use client';

import { useRef, useCallback } from 'react';

interface Props {
  viewerRef: React.RefObject<unknown>;
}

const btnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 20,
  background: 'rgba(31,51,72,0.85)',
  border: '1px solid rgba(255,255,255,0.15)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  color: 'white',
  touchAction: 'none',
  userSelect: 'none',
};

export default function CesiumControls({ viewerRef }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moduleRef = useRef<{ zoomCamera: (v: unknown, f: number) => void } | null>(null);

  const getModule = useCallback(async () => {
    if (!moduleRef.current) {
      moduleRef.current = await import('@/lib/cesium-init');
    }
    return moduleRef.current;
  }, []);

  const getViewer = useCallback(() => {
    const v = viewerRef.current as {
      camera: { rotateRight: (a: number) => void; rotateLeft: (a: number) => void };
      scene: { requestRender: () => void };
      isDestroyed: () => boolean;
    } | null;
    if (!v || v.isDestroyed()) return null;
    return v;
  }, [viewerRef]);

  const singleZoom = useCallback(async (factor: number) => {
    if (!viewerRef.current) return;
    const mod = await getModule();
    mod.zoomCamera(viewerRef.current, factor);
  }, [viewerRef, getModule]);

  const startHold = useCallback(async (action: () => void) => {
    action();
    intervalRef.current = setInterval(action, 80);
  }, []);

  const stopHold = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const rotate = useCallback((dir: 1 | -1) => {
    const v = getViewer();
    if (!v) return;
    if (dir === 1) v.camera.rotateRight(0.05);
    else v.camera.rotateLeft(0.05);
    v.scene.requestRender();
  }, [getViewer]);

  return (
    <div style={{
      position: 'absolute',
      bottom: 24,
      right: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 20,
    }}>
      {/* Zoom */}
      <button
        onClick={() => singleZoom(0.92)}
        onPointerDown={() => startHold(async () => { const m = await getModule(); m.zoomCamera(viewerRef.current, 0.92); })}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
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
        onPointerDown={() => startHold(async () => { const m = await getModule(); m.zoomCamera(viewerRef.current, 1.08); })}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        style={btnStyle}
        title="Zoom out (hold)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <div style={{ height: 2 }} />

      {/* Rotate */}
      <button
        onClick={() => rotate(-1)}
        onPointerDown={() => startHold(() => rotate(-1))}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        style={btnStyle}
        title="Rotate left (hold)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 2v6h6" />
          <path d="M2.5 8C5 4 9 2 13 2a10 10 0 1 1-9.8 12" />
        </svg>
      </button>
      <button
        onClick={() => rotate(1)}
        onPointerDown={() => startHold(() => rotate(1))}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        style={btnStyle}
        title="Rotate right (hold)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.5 2v6h-6" />
          <path d="M21.5 8C19 4 15 2 11 2A10 10 0 1 0 20.8 14" />
        </svg>
      </button>
    </div>
  );
}
