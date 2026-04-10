"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type PlaybackSpeed = -4 | -1 | 0 | 1 | 4;

export default function MapTimelinePlayback() {
  const [expanded, setExpanded] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(0);
  const [timeOffset, setTimeOffset] = useState(0); // minutes from "now"
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const holdActive = useRef(false);

  // Format the time display
  const formatTime = (offsetMin: number) => {
    if (offsetMin === 0) return "NOW";
    const abs = Math.abs(offsetMin);
    const hrs = Math.floor(abs / 60);
    const mins = abs % 60;
    const sign = offsetMin < 0 ? "-" : "+";
    if (hrs === 0) return `${sign}${mins}m`;
    if (mins === 0) return `${sign}${hrs}h`;
    return `${sign}${hrs}h ${mins}m`;
  };

  // Advance time based on speed
  useEffect(() => {
    if (speed === 0) return;
    const interval = setInterval(() => {
      setTimeOffset((prev) => {
        const next = prev + speed;
        // Clamp to -24h to +24h
        return Math.max(-1440, Math.min(1440, next));
      });
    }, 200);
    return () => clearInterval(interval);
  }, [speed]);

  // Handle drag for rewind/forward
  const dragStart = useRef<{ x: number; speed: PlaybackSpeed } | null>(null);

  const onDragStart = useCallback((e: React.PointerEvent, direction: "rewind" | "forward") => {
    e.preventDefault();
    const baseSpeed: PlaybackSpeed = direction === "rewind" ? -1 : 1;
    dragStart.current = { x: e.clientX, speed: baseSpeed };
    setSpeed(baseSpeed);
    holdActive.current = true;

    const onMove = (ev: PointerEvent) => {
      if (!dragStart.current) return;
      const dx = ev.clientX - dragStart.current.x;
      const threshold = 40;
      if (direction === "rewind") {
        // Drag left for 4x rewind
        setSpeed(dx < -threshold ? -4 : -1);
      } else {
        // Drag right for 4x forward
        setSpeed(dx > threshold ? 4 : 1);
      }
    };

    const onUp = () => {
      setSpeed(0);
      dragStart.current = null;
      holdActive.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const speedLabel = (s: PlaybackSpeed) => {
    switch (s) {
      case -4: return "4x REW";
      case -1: return "1x REW";
      case 0: return "";
      case 1: return "1x FWD";
      case 4: return "4x FWD";
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: 44,
          height: 44,
          borderRadius: 22,
          background: "rgba(31,51,72,0.7)",
          border: "1px solid rgba(255,255,255,0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 15,
          backdropFilter: "blur(6px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          transition: "opacity 0.2s",
          opacity: 0.6,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; }}
        title="Timeline Playback"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
          <polygon points="6,4 20,12 6,20" />
        </svg>
      </button>
    );
  }

  return (
    <div style={{
      position: "absolute",
      bottom: 16,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      zIndex: 15,
      userSelect: "none",
    }}>
      {/* Speed indicator */}
      {speed !== 0 && (
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "1px",
          color: "white",
          background: "rgba(31,51,72,0.8)",
          padding: "3px 10px",
          borderRadius: 4,
          backdropFilter: "blur(6px)",
        }}>
          {speedLabel(speed)}
        </div>
      )}

      {/* Time display */}
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: timeOffset === 0 ? "rgba(255,255,255,0.8)" : "#3b82f6",
        background: "rgba(31,51,72,0.8)",
        padding: "3px 12px",
        borderRadius: 4,
        backdropFilter: "blur(6px)",
        letterSpacing: "0.5px",
      }}>
        {formatTime(timeOffset)}
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(31,51,72,0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: 24,
        padding: "4px 6px",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}>
        {/* Rewind - hold & drag */}
        <button
          onPointerDown={(e) => onDragStart(e, "rewind")}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            background: speed < 0 ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.06)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "none",
          }}
          title="Hold to rewind. Drag left for 4x speed."
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
            <polygon points="12,4 2,12 12,20" />
            <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => {
            if (speed !== 0) {
              setSpeed(0);
            } else if (timeOffset !== 0) {
              setSpeed(1);
            }
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            background: speed !== 0 ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {speed !== 0 ? (
            // Pause icon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            // Play icon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Fast forward - hold & drag */}
        <button
          onPointerDown={(e) => onDragStart(e, "forward")}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            background: speed > 0 ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.06)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "none",
          }}
          title="Hold to fast-forward. Drag right for 4x speed."
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
            <polygon points="12,4 22,12 12,20" />
            <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2" />
          </svg>
        </button>

        {/* Reset to now */}
        {timeOffset !== 0 && (
          <button
            onClick={() => { setTimeOffset(0); setSpeed(0); }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: "rgba(255,255,255,0.06)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Reset to now"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        )}

        {/* Close */}
        <button
          onClick={() => { setExpanded(false); setSpeed(0); setTimeOffset(0); }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Timeline scrubber */}
      <div style={{
        width: 200,
        height: 3,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        position: "relative",
        cursor: "pointer",
      }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          // Map 0-1 to -1440 to +1440
          setTimeOffset(Math.round((pct - 0.5) * 2880));
        }}
      >
        {/* Current position indicator */}
        <div style={{
          position: "absolute",
          left: `${((timeOffset + 1440) / 2880) * 100}%`,
          top: -3,
          width: 8,
          height: 8,
          borderRadius: 4,
          background: timeOffset === 0 ? "rgba(255,255,255,0.6)" : "#3b82f6",
          transform: "translateX(-50%)",
          transition: speed === 0 ? "left 0.1s" : "none",
        }} />
        {/* Center mark (NOW) */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: -2,
          width: 2,
          height: 6,
          background: "rgba(255,255,255,0.3)",
          transform: "translateX(-50%)",
        }} />
      </div>
    </div>
  );
}
