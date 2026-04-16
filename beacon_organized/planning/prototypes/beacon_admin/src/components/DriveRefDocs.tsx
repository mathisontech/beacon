'use client';

import { useState, useEffect } from 'react';
import { getRefDocsForModule, RefDocEntry } from '@/data/referenceDocs';
import { drivePreviewUrl } from './integrations/DriveFileRow';
import './refDocs.css';

interface DriveDoc {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

interface ResolvedDoc {
  entry: RefDocEntry;
  file: DriveDoc | null;
}

export default function DriveRefDocs({ module }: { module: string }) {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [docs, setDocs] = useState<ResolvedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ id: string; name: string } | null>(null);

  const entries = getRefDocsForModule(module);

  useEffect(() => {
    if (entries.length === 0) { setLoading(false); return; }

    let cancelled = false;

    async function load() {
      try {
        const statusRes = await fetch('/api/admin/integrations/google/status');
        const status = await statusRes.json();
        if (!status.connected) { setConnected(false); setLoading(false); return; }
        setConnected(true);

        const results: ResolvedDoc[] = await Promise.all(
          entries.map(async (entry) => {
            try {
              const params = new URLSearchParams({ search: entry.driveSearchTerm });
              const res = await fetch(`/api/admin/integrations/google/drive?${params}`);
              const data = await res.json();
              const file = data.files?.[0] ?? null;
              return { entry, file };
            } catch {
              return { entry, file: null };
            }
          })
        );
        if (!cancelled) setDocs(results);
      } catch {
        setConnected(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [module]);

  if (entries.length === 0) return null;
  if (loading) return <div className="ref-docs-loading">Loading reference docs...</div>;
  if (connected === false) return null;

  const found = docs.filter((d) => d.file);
  if (found.length === 0) return null;

  return (
    <div className="ref-docs">
      <div className="ref-docs-title">Reference Documents</div>
      <div className="ref-docs-list">
        {found.map((d) => (
          <div
            key={d.file!.id}
            className={`ref-doc-item ${preview?.id === d.file!.id ? 'active' : ''}`}
            onClick={() => setPreview(preview?.id === d.file!.id ? null : { id: d.file!.id, name: d.entry.label })}
          >
            <span className="ref-doc-name">{d.entry.label}</span>
            {d.file!.webViewLink && (
              <button
                className="ref-doc-open"
                onClick={(e) => { e.stopPropagation(); window.open(d.file!.webViewLink, '_blank'); }}
              >
                open in drive
              </button>
            )}
          </div>
        ))}
      </div>

      {preview && (
        <div className="ref-doc-preview">
          <div className="ref-doc-preview-header">
            <span className="ref-doc-preview-title">{preview.name}</span>
            <button className="ref-doc-preview-close" onClick={() => setPreview(null)}>close</button>
          </div>
          <iframe
            className="ref-doc-frame"
            src={drivePreviewUrl(preview.id)}
            title={preview.name}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
