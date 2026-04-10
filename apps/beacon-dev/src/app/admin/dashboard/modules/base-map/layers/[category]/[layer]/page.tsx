'use client';

import { use } from 'react';
import { baseLayerCategories } from '@/data/baseLayerCategories';

export default function LayerPage({ params }: { params: Promise<{ category: string; layer: string }> }) {
  const { category, layer } = use(params);
  const cat = baseLayerCategories.find(c => c.slug === category);
  const layerData = cat?.layers.find(l => l.slug === layer);

  if (!cat || !layerData) return <div style={{ padding: 40, color: '#6b7280' }}>Layer not found</div>;

  return (
    <div>
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{cat.label}</p>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24 }}>{layerData.label}</h1>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24 }}>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Layer configuration and data source management will be built here.</p>
      </div>
    </div>
  );
}
