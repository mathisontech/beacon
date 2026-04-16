"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWeather } from "./weather-context";

const MIN_HOURS = -48;
const MAX_HOURS = 120;

function formatOffset(h: number): string {
  if (h === 0) return "Now";
  const abs = Math.abs(h);
  const sign = h < 0 ? "-" : "+";
  if (abs < 24) return `${sign}${abs}h`;
  const d = Math.floor(abs / 24);
  const hh = abs % 24;
  return hh === 0 ? `${sign}${d}d` : `${sign}${d}d ${hh}h`;
}

function formatAbsolute(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface Props {
  compact?: boolean;
}

export default function WeatherTimeScrubber({ compact }: Props) {
  const w = useWeather();
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const stop = useCallback(() => {
    setPlaying(false);
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      const hoursPerSec = 2; // animation speed
      const next = w.hoursOffset + (dt / 1000) * hoursPerSec;
      if (next >= MAX_HOURS) {
        w.setHoursOffset(MAX_HOURS);
        stop();
        return;
      }
      w.setHoursOffset(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, w, stop]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(15, 23, 42, 0.92)",
        color: "#fff",
        borderRadius: 12,
        padding: compact ? "8px 12px" : "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        zIndex: 50,
        minWidth: compact ? 340 : 520,
        fontSize: 12,
      }}
    >
      <button
        type="button"
        onClick={() => (playing ? stop() : setPlaying(true))}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          border: "none",
          background: playing ? "#ef4444" : "#22c55e",
          color: "#fff",
          cursor: "pointer",
          fontSize: 14,
        }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "❚❚" : "▶"}
      </button>

      <button
        type="button"
        onClick={() => {
          stop();
          w.setHoursOffset(0);
        }}
        style={{
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid #475569",
          background: "transparent",
          color: "#fff",
          cursor: "pointer",
          fontSize: 11,
        }}
      >
        Now
      </button>

      <input
        type="range"
        min={MIN_HOURS}
        max={MAX_HOURS}
        step={1}
        value={Math.round(w.hoursOffset)}
        onChange={(e) => {
          stop();
          w.setHoursOffset(Number(e.target.value));
        }}
        style={{ flex: 1, accentColor: "#38bdf8" }}
      />

      <div style={{ textAlign: "right", minWidth: 140 }}>
        <div style={{ fontWeight: 600 }}>{formatOffset(Math.round(w.hoursOffset))}</div>
        <div style={{ fontSize: 10, color: "#94a3b8" }}>
          {formatAbsolute(w.effectiveTimeMs)}
        </div>
      </div>
    </div>
  );
}
