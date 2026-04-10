'use client';

import { useState } from 'react';
import { buildingAttributeGroups } from '@/data/buildingAttributes';
import { rawDataFields, shadingOverlays, indicatorTags } from '@/data/buildingVizFormats';
import BuildingSvg from './building-svg';

export default function BuildingWorkshop() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'3d' | 'clay' | '2d'>('3d');
  const [zoomLevel, setZoomLevel] = useState<'far' | 'mid' | 'close'>('mid');

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const totalAttributes = buildingAttributeGroups.reduce((sum, g) => sum + g.attributes.length, 0);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
        Buildings — Visualization Workshop
      </h1>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
        Define how buildings render across map modes and zoom levels. {totalAttributes} tracked attributes across {buildingAttributeGroups.length} groups.
      </p>

      {/* Workshop preview area */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Preview panel */}
        <div style={{ flex: '1 1 400px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#1f3348' }}>
              Preview
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['3d', 'clay', '2d'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '4px 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    border: '1px solid', borderColor: viewMode === mode ? '#1f3348' : '#d1d5db',
                    borderRadius: 4, background: viewMode === mode ? '#1f3348' : 'white',
                    color: viewMode === mode ? 'white' : '#6b7280', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom level selector */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#9ca3af', marginRight: 8 }}>Zoom:</span>
            {(['far', 'mid', 'close'] as const).map(z => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                style={{
                  padding: '3px 8px', fontSize: 10, fontWeight: 500,
                  border: 'none', borderRadius: 3,
                  background: zoomLevel === z ? '#f3f4f6' : 'transparent',
                  color: zoomLevel === z ? '#1f3348' : '#9ca3af',
                  cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase',
                }}
              >
                {z}
              </button>
            ))}
          </div>

          {/* Preview canvas */}
          <div style={{
            height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: viewMode === '2d' ? '#e8edf2' : viewMode === 'clay' ? '#f0ebe4' : '#1a2332',
            position: 'relative',
          }}>
            <BuildingSvg
              viewMode={viewMode}
              zoomLevel={zoomLevel}
              buildingType="default"
              color="#4ade80"
            />

            {zoomLevel === 'close' && (
              <div style={{
                position: 'absolute', bottom: 8, left: 8, right: 8,
                display: 'flex', gap: 4, flexWrap: 'wrap',
              }}>
                {['footprint', 'height', 'material', 'purpose', 'exits', 'risk'].map(tag => (
                  <span key={tag} style={{
                    fontSize: 8, padding: '2px 5px', borderRadius: 3,
                    background: viewMode === '3d' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
                    color: viewMode === '3d' ? 'rgba(255,255,255,0.6)' : '#9ca3af',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Viz spec summary */}
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 8 }}>
              Visible at this level
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(zoomLevel === 'far'
                ? ['Footprint outline', 'Color by purpose']
                : zoomLevel === 'mid'
                  ? ['Footprint outline', 'Color by purpose', 'Height extrusion', 'Roof shape']
                  : ['Footprint outline', 'Color by purpose', 'Height extrusion', 'Roof shape', 'Material texture', 'Entry markers', 'Risk overlay', 'Label']
              ).map(item => (
                <div key={item} style={{ fontSize: 11, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 4, height: 4, borderRadius: 1, background: '#4ade80' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shape source note */}
        <div style={{ flex: '0 0 260px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 8 }}>
            Shape Source
          </div>
          <div style={{ fontSize: 11, color: '#374151', marginBottom: 12 }}>
            Buildings with LiDAR coverage get exact roof-edge geometry extruded in 3D/clay. Satellite-only buildings use simplified rectangular approximation.
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 6 }}>
            LOD Levels
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#374151' }}>
            <div><span style={{ fontWeight: 600 }}>Box</span> — 4 vertices, rectangular fill</div>
            <div><span style={{ fontWeight: 600 }}>Simple</span> — 5-8 verts, L/T/U shapes</div>
            <div><span style={{ fontWeight: 600 }}>Moderate</span> — 9-20 verts, wings + setbacks</div>
            <div><span style={{ fontWeight: 600 }}>Complex</span> — 21+ verts, full LiDAR trace</div>
          </div>
        </div>
      </div>

      {/* FORMAT SPEC SECTIONS */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>

        {/* Raw Map Data Format */}
        <div style={{ flex: '1 1 400px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#1f3348' }}>
              Raw Tile Data Format
            </span>
            <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 8 }}>
              per-building vector tile payload
            </span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: '#fafafa' }}>
                  <th style={{ textAlign: 'left', padding: '6px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 9, textTransform: 'uppercase' }}>Field</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 9, textTransform: 'uppercase' }}>Format</th>
                  <th style={{ textAlign: 'right', padding: '6px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 9, textTransform: 'uppercase' }}>Bytes</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 9, textTransform: 'uppercase' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {rawDataFields.map(f => (
                  <tr key={f.key} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '5px 10px', fontWeight: 500, color: '#111827' }}>{f.label}</td>
                    <td style={{ padding: '5px 10px' }}>
                      <code style={{ fontSize: 9, background: '#f3f4f6', padding: '1px 4px', borderRadius: 3, color: '#6366f1' }}>{f.format}</code>
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', color: '#6b7280' }}>{f.bytes}</td>
                    <td style={{ padding: '5px 10px', color: '#9ca3af' }}>{f.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '8px 16px', borderTop: '1px solid #f3f4f6', fontSize: 10, color: '#9ca3af' }}>
            ~{rawDataFields.reduce((s, f) => s + parseInt(f.bytes) || 0, 0) || '~24'}B fixed + geometry per feature
          </div>
        </div>

        {/* Shading Overlays */}
        <div style={{ flex: '1 1 340px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#1f3348' }}>
              Regional Shading Overlays
            </span>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shadingOverlays.map(o => (
              <div key={o.id} style={{ padding: '8px 10px', background: '#fafafa', borderRadius: 6, border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{o.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 10, color: '#6b7280' }}>
                  <span>source: <code style={{ fontSize: 9, color: '#6366f1' }}>{o.source}</code></span>
                  <span>range: {o.range}</span>
                </div>
                <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>
                  {o.colorScale} — {o.blendMode}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicator Tags */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#1f3348' }}>
            Indicator Tags
          </span>
          <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 8 }}>
            population + facility markers on buildings
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: '#f3f4f6' }}>
          {indicatorTags.map(t => (
            <div key={t.id} style={{ padding: '10px 14px', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <code style={{ fontSize: 9, background: '#ede9fe', color: '#7c3aed', padding: '1px 5px', borderRadius: 3 }}>{t.icon}</code>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{t.label}</span>
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>
                trigger: <code style={{ fontSize: 9, color: '#6366f1' }}>{t.trigger}</code>
              </div>
              <div style={{ fontSize: 9, color: '#9ca3af' }}>
                {t.visibility} — {t.placement}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attributes reference */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#1f3348' }}>
            All Building Attributes ({totalAttributes})
          </span>
        </div>
        <div>
          {buildingAttributeGroups.map((group) => {
            const isOpen = expandedGroups[group.label] || false;
            return (
              <div key={group.label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '10px 16px', border: 'none', background: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {group.label}
                  </span>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>
                    {group.attributes.length} {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ textAlign: 'left', padding: '4px 8px', color: '#9ca3af', fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Attribute</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px', color: '#9ca3af', fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px', color: '#9ca3af', fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.attributes.map((attr) => (
                          <tr key={attr.key} style={{ borderBottom: '1px solid #f9fafb' }}>
                            <td style={{ padding: '5px 8px', color: '#111827', fontWeight: 500 }}>{attr.label}</td>
                            <td style={{ padding: '5px 8px' }}>
                              <code style={{ fontSize: 10, background: '#f3f4f6', padding: '1px 4px', borderRadius: 3, color: '#6366f1' }}>
                                {attr.type}
                              </code>
                            </td>
                            <td style={{ padding: '5px 8px', color: '#6b7280' }}>{attr.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
