"use client";

import type { InspectorData } from "@/types/map";

interface Props {
  data: InspectorData | null;
  clickPosition: { lat: number; lng: number; alt: number } | null;
  onClose: () => void;
}

export default function InspectorPanel({ data, clickPosition, onClose }: Props) {
  if (!clickPosition) return null;

  return (
    <div className="w-80 bg-beacon-surface border-l border-beacon-border h-full overflow-y-auto p-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs font-semibold text-beacon-muted uppercase tracking-wider">
          Inspector
        </h2>
        <button
          onClick={onClose}
          className="text-beacon-muted hover:text-beacon-text text-sm"
        >
          x
        </button>
      </div>

      <div className="text-xs text-beacon-muted mb-2">
        {clickPosition.lat.toFixed(4)}, {clickPosition.lng.toFixed(4)}
      </div>

      {data ? (
        <div className="space-y-3">
          <Section title="Source" content={data.source} />
          <Section title="Fetched" content={data.fetchedAt} />
          <JsonBlock title="Raw" json={data.raw} />
          <JsonBlock title="Processed" json={data.processed} />
        </div>
      ) : (
        <p className="text-xs text-beacon-muted">No data at this location</p>
      )}
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-[10px] text-beacon-muted uppercase">{title}</h3>
      <p className="text-xs text-beacon-text">{content}</p>
    </div>
  );
}

function JsonBlock({ title, json }: { title: string; json: unknown }) {
  return (
    <div>
      <h3 className="text-[10px] text-beacon-muted uppercase">{title}</h3>
      <pre className="text-[10px] text-beacon-text bg-beacon-bg p-2 rounded overflow-x-auto max-h-48">
        {JSON.stringify(json, null, 2)}
      </pre>
    </div>
  );
}
