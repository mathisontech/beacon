'use client';

import { useState } from 'react';
import {
  visfileFeatures, getGeometricFeatures, getDataFeatures,
  getVisfileGroups, getFeaturesByGroup,
  type VisfileFeature, type FeatureTier,
} from '@/data/buildingVisfile';

const KIND_COLORS: Record<string, string> = {
  geometry: '#8b5cf6',
  numeric: '#3b82f6',
  categorical: '#f59e0b',
  boolean: '#10b981',
  bitfield: '#ec4899',
  text: '#64748b',
  datetime: '#0ea5e9',
};

const TIER_META: Record<FeatureTier, { label: string; desc: string; color: string }> = {
  geometric: {
    label: 'Geometric Features',
    desc: 'Physically modeled on the building — shape, walls, windows, doors, roof, signs, lot features',
    color: '#8b5cf6',
  },
  data: {
    label: 'Data Overlays',
    desc: 'Shaded, tinted, or badged over the geometry — purpose, risk, population, shelter, quality',
    color: '#3b82f6',
  },
};

export default function VisfileProtocol() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [filterKind, setFilterKind] = useState<string | null>(null);
  const [filterLidar, setFilterLidar] = useState(false);

  const toggleCat = (key: string) => setExpandedCategories(p => ({ ...p, [key]: !p[key] }));
  const toggleGroup = (g: string) => setCollapsedGroups(p => ({ ...p, [g]: !p[g] }));

  const geoFeatures = getGeometricFeatures();
  const datFeatures = getDataFeatures();
  const totalBytes = visfileFeatures.reduce((s, f) => s + f.bytes, 0);
  const kinds = [...new Set(visfileFeatures.map(f => f.kind))];

  function applyFilter(features: VisfileFeature[]) {
    if (!filterKind && !filterLidar) return features;
    return features.filter(f =>
      (!filterKind || f.kind === filterKind) &&
      (!filterLidar || f.lidarEnhanced)
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
        Visfile Protocol — Building Features
      </h1>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
        {visfileFeatures.length} features ({geoFeatures.length} geometric, {datFeatures.length} data overlays). ~{totalBytes}B fixed + geometry per tile.
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 4 }}>Filter:</span>
        {kinds.map(k => (
          <button key={k} onClick={() => setFilterKind(filterKind === k ? null : k)}
            style={{
              padding: '3px 8px', fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
              border: '1px solid', borderRadius: 3, cursor: 'pointer', fontFamily: 'inherit',
              borderColor: filterKind === k ? KIND_COLORS[k] : '#e5e7eb',
              background: filterKind === k ? `${KIND_COLORS[k]}15` : 'white',
              color: filterKind === k ? KIND_COLORS[k] : '#6b7280',
            }}>
            {k}
          </button>
        ))}
        <button onClick={() => setFilterLidar(!filterLidar)}
          style={{
            padding: '3px 8px', fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
            border: '1px solid', borderRadius: 3, cursor: 'pointer', fontFamily: 'inherit',
            borderColor: filterLidar ? '#8b5cf6' : '#e5e7eb',
            background: filterLidar ? '#8b5cf615' : 'white',
            color: filterLidar ? '#8b5cf6' : '#6b7280',
          }}>
          lidar-enhanced
        </button>
      </div>

      {/* Render each tier */}
      {(['geometric', 'data'] as FeatureTier[]).map(tier => {
        const meta = TIER_META[tier];
        const tierFeatures = tier === 'geometric' ? geoFeatures : datFeatures;
        const filtered = applyFilter(tierFeatures);
        const groups = getVisfileGroups(tier);

        if (filtered.length === 0) return null;

        return (
          <div key={tier} style={{ marginBottom: 32 }}>
            {/* Tier header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              padding: '10px 16px', background: `${meta.color}08`, border: `1px solid ${meta.color}22`,
              borderRadius: 8,
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                padding: '3px 8px', borderRadius: 3,
                background: `${meta.color}15`, color: meta.color,
              }}>
                {tier}
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{meta.label}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{meta.desc}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>
                {filtered.length} features
              </span>
            </div>

            {/* Groups within tier */}
            {groups.map(group => {
              const groupFeatures = filtered.filter(f => f.group === group);
              if (groupFeatures.length === 0) return null;
              const collapsed = collapsedGroups[group] || false;

              return (
                <div key={group} style={{
                  marginBottom: 8, background: 'white',
                  border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden',
                }}>
                  <button onClick={() => toggleGroup(group)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '10px 16px', border: 'none', background: 'none',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1f3348' }}>
                      {group}
                    </span>
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>
                      {groupFeatures.length} {collapsed ? '+' : '−'}
                    </span>
                  </button>

                  {!collapsed && (
                    <div style={{ borderTop: '1px solid #f3f4f6' }}>
                      {groupFeatures.map(f => (
                        <FeatureRow
                          key={f.key}
                          feature={f}
                          expanded={expandedCategories[f.key] || false}
                          onToggle={() => toggleCat(f.key)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function FeatureRow({ feature: f, expanded, onToggle }: {
  feature: VisfileFeature; expanded: boolean; onToggle: () => void;
}) {
  const hasCats = f.categories && f.categories.length > 0;

  return (
    <div style={{ borderBottom: '1px solid #f9fafb' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '180px 80px 90px 50px 1fr',
        gap: 8, padding: '8px 16px', alignItems: 'start', fontSize: 11,
      }}>
        {/* Name */}
        <div>
          <div style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 4 }}>
            {f.label}
            {f.lidarEnhanced && (
              <span style={{ fontSize: 8, background: '#8b5cf615', color: '#8b5cf6', padding: '1px 4px', borderRadius: 2, fontWeight: 700 }}>L</span>
            )}
          </div>
          <code style={{ fontSize: 9, color: '#9ca3af' }}>{f.key}</code>
        </div>

        {/* Kind */}
        <div>
          <span style={{
            fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: 3,
            background: `${KIND_COLORS[f.kind]}12`,
            color: KIND_COLORS[f.kind],
          }}>
            {f.kind}
          </span>
        </div>

        {/* Wire format */}
        <div>
          <code style={{ fontSize: 9, background: '#f3f4f6', padding: '1px 4px', borderRadius: 3, color: '#6366f1' }}>
            {f.wireFormat}
          </code>
        </div>

        {/* Zoom */}
        <div style={{ fontSize: 9, color: '#9ca3af' }}>{f.zoomMin}</div>

        {/* Description + viz role */}
        <div>
          <div style={{ color: '#374151' }}>{f.description}</div>
          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
            viz: {f.vizRole}
          </div>
          {f.range && (
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>
              range: {f.range}{f.unit ? ` ${f.unit}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      {hasCats && (
        <>
          <button onClick={onToggle}
            style={{
              display: 'block', width: '100%', padding: '4px 16px 4px 196px',
              border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
              fontSize: 9, color: '#6366f1', fontWeight: 600,
            }}>
            {expanded ? '− hide' : '+'} {f.categories!.length} {f.kind === 'bitfield' ? 'bits' : 'categories'}
          </button>

          {expanded && (
            <div style={{ padding: '0 16px 10px 196px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <th style={{ textAlign: 'left', padding: '3px 6px', color: '#9ca3af', fontWeight: 600, fontSize: 8, textTransform: 'uppercase' }}>
                      {f.kind === 'bitfield' ? 'Bit' : 'Value'}
                    </th>
                    <th style={{ textAlign: 'left', padding: '3px 6px', color: '#9ca3af', fontWeight: 600, fontSize: 8, textTransform: 'uppercase' }}>Label</th>
                    {f.categories!.some(c => c.color) && (
                      <th style={{ textAlign: 'left', padding: '3px 6px', color: '#9ca3af', fontWeight: 600, fontSize: 8, textTransform: 'uppercase' }}>Color</th>
                    )}
                    <th style={{ textAlign: 'left', padding: '3px 6px', color: '#9ca3af', fontWeight: 600, fontSize: 8, textTransform: 'uppercase' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {f.categories!.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                      <td style={{ padding: '3px 6px', color: '#6b7280' }}>
                        <code style={{ fontSize: 9 }}>{c.value}</code>
                      </td>
                      <td style={{ padding: '3px 6px', fontWeight: 500, color: '#111827' }}>{c.label}</td>
                      {f.categories!.some(cc => cc.color) && (
                        <td style={{ padding: '3px 6px' }}>
                          {c.color ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color, display: 'inline-block' }} />
                              <code style={{ fontSize: 8, color: '#9ca3af' }}>{c.color}</code>
                            </span>
                          ) : '—'}
                        </td>
                      )}
                      <td style={{ padding: '3px 6px', color: '#6b7280' }}>{c.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
