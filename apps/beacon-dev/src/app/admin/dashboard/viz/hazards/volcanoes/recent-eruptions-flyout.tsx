"use client";

import type { RecentEruption } from "./get-recent-eruptions";
import type { Volcano } from "./types";
import { volcanoSvg } from "./volcano-svg";

interface Props {
  open: boolean;
  items: RecentEruption[];
  onSelect: (v: Volcano) => void;
  onClose: () => void;
}

export function RecentEruptionsFlyout({ open, items, onSelect, onClose }: Props) {
  return (
    <aside
      className={`vp-flyout${open ? " open" : ""}`}
      aria-hidden={!open}
    >
      <header className="vp-flyout-head">
        <div className="vp-flyout-title">Recent eruptions</div>
        <div className="vp-flyout-sub">Last 12 months or ongoing</div>
        <button
          type="button"
          className="vp-flyout-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <div className="vp-flyout-body">
        {items.length === 0 && (
          <div className="vp-flyout-empty">
            No eruptions in the last 12 months.
          </div>
        )}
        {items.map(({ volcano: v, mostRecentDisplay, ongoing }) => (
          <button
            key={v.id}
            type="button"
            className="vp-flyout-row"
            onClick={() => onSelect(v)}
          >
            <div
              className={`vp-flyout-icon level-${v.level}`}
              dangerouslySetInnerHTML={{ __html: volcanoSvg(v.level, 22) }}
            />
            <div className="vp-flyout-meta">
              <div className="vp-flyout-name">{v.name}</div>
              <div className="vp-flyout-region">{v.region}</div>
            </div>
            <div className="vp-flyout-when">
              {ongoing ? "Ongoing" : mostRecentDisplay}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
