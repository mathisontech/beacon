"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActiveFire, FireTimelineEntry } from "@/types/fire";
import { formatAcres } from "@/lib/fire-data";

export interface FireProjection {
  spreadRateAcresPerHour: number;
  movementBearingDeg: number;
  movementLabel: string;
  movementDistKmPerDay: number;
  projectedAcres24h: number;
  projectedAcres48h: number;
  confidence: "high" | "medium" | "low";
}

interface Props {
  fire: ActiveFire | null;
  onGeometryChange: (geom: GeoJSON.Geometry | null) => void;
  onProjection: (proj: FireProjection | null, loading: boolean) => void;
  onClose: () => void;
}

export default function FireTimeline({
  fire,
  onGeometryChange,
  onProjection,
  onClose,
}: Props) {
  const [entries, setEntries] = useState<FireTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!fire) {
      setEntries([]);
      onProjection(null, false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      onProjection(null, true);
      try {
        const res = await fetch(
          `/api/fires/history?name=${encodeURIComponent(fire!.name)}`
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          const tl = (data.timeline || []) as FireTimelineEntry[];
          setEntries(tl);
          setIndex(tl.length > 0 ? tl.length - 1 : 0);
          onProjection(data.projection || null, false);
        }
      } catch (err) {
        console.warn("Timeline fetch failed:", err);
        if (!cancelled) {
          setEntries([]);
          onProjection(null, false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [fire, onProjection]);

  useEffect(() => {
    if (entries.length > 0 && entries[index]) {
      onGeometryChange(entries[index].geometry);
    } else {
      onGeometryChange(null);
    }
  }, [index, entries, onGeometryChange]);

  useEffect(() => {
    if (!playing || entries.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => {
        if (prev >= entries.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [playing, entries.length]);

  const handleClose = useCallback(() => {
    onGeometryChange(null);
    onClose();
  }, [onGeometryChange, onClose]);

  if (!fire) return null;

  const current = entries[index];
  const dateLabel = current
    ? new Date(current.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div style={{
      position: "absolute",
      bottom: 60,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 25,
      background: "rgba(20,20,20,0.92)",
      borderRadius: 10,
      padding: "10px 14px",
      color: "#fff",
      minWidth: 320,
      maxWidth: 420,
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Perimeter History</div>
        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: 14,
            padding: "0 4px",
          }}
        >
          x
        </button>
      </div>

      {loading && (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", padding: "8px 0" }}>
          Loading perimeter history...
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", padding: "8px 0" }}>
          No perimeter history available
        </div>
      )}

      {!loading && entries.length > 0 && (
        <>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 6,
          }}>
            <span>{dateLabel}</span>
            <span>
              {current ? `${formatAcres(current.acres)} acres` : ""}
              {current && current.containment > 0
                ? ` / ${current.containment}%`
                : ""}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setPlaying((p) => !p)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 4,
                color: "#fff",
                cursor: "pointer",
                fontSize: 11,
                padding: "3px 8px",
                width: 36,
              }}
            >
              {playing ? "||" : ">"}
            </button>
            <input
              type="range"
              min={0}
              max={entries.length - 1}
              value={index}
              onChange={(e) => {
                setPlaying(false);
                setIndex(Number(e.target.value));
              }}
              style={{ flex: 1, accentColor: "#f97316" }}
            />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 30, textAlign: "right" }}>
              {index + 1}/{entries.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
