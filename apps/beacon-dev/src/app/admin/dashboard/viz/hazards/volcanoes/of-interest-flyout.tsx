"use client";

import type { Volcano } from "./types";
import { volcanoSvg } from "./volcano-svg";
import type { OfInterestEntry, OfInterestReason } from "./of-interest";
import { REASON_LABEL } from "./of-interest";

interface Props {
  open: boolean;
  items: OfInterestEntry[];
  onSelect: (v: Volcano) => void;
  onClose: () => void;
}

export function OfInterestFlyout({ open, items, onSelect, onClose }: Props) {
  return (
    <aside
      className={`vp-oi-flyout${open ? " open" : ""}`}
      aria-hidden={!open}
    >
      <header className="vp-oi-head">
        <div className="vp-oi-title">Volcanoes of interest</div>
        <div className="vp-oi-sub">Erupting · high human risk · evacuation</div>
        <button
          type="button"
          className="vp-oi-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <div className="vp-oi-body">
        {items.length === 0 && (
          <div className="vp-oi-empty">No volcanoes of interest right now.</div>
        )}
        {items.map(({ volcano: v, reasons, note }) => (
          <button
            key={v.id}
            type="button"
            className="vp-oi-row"
            onClick={() => onSelect(v)}
          >
            <div
              className={`vp-oi-icon level-${v.level}`}
              dangerouslySetInnerHTML={{ __html: volcanoSvg(v.level, 22) }}
            />
            <div className="vp-oi-meta">
              <div className="vp-oi-name">{v.name}</div>
              <div className="vp-oi-region">{v.region}</div>
              {note && <div className="vp-oi-note">{note}</div>}
              <div className="vp-oi-tags">
                {reasons.map((r: OfInterestReason) => (
                  <span key={r} className={`vp-oi-tag tag-${r}`}>
                    {REASON_LABEL[r]}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
