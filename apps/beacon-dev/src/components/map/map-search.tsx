"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { geocode, type GeoResult } from "@/lib/geocode";

interface Props {
  onSelect: (result: GeoResult) => void;
}

export default function MapSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const res = await geocode(q);
    setResults(res);
    setOpen(res.length > 0);
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (r: GeoResult) => {
    setQuery(r.label.split(",")[0]);
    setOpen(false);
    onSelect(r);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timerRef.current) clearTimeout(timerRef.current);
      search(query);
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative w-64">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search location..."
        className="w-full px-3 py-1.5 text-xs bg-white border border-beacon-border rounded text-beacon-text placeholder-beacon-muted focus:outline-none focus:border-beacon-accent"
      />
      {loading && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-beacon-muted">
          ...
        </span>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-beacon-border rounded shadow-lg">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2 text-xs text-beacon-text hover:bg-beacon-bg truncate"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
