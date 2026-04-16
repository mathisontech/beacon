'use client';

import { baseLayerCategories } from '@/data/baseLayerCategories';
import Link from 'next/link';

export default function BaseLayersPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Periodic Regional Layers
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        {baseLayerCategories.length} categories, {baseLayerCategories.reduce((n, c) => n + c.layers.length, 0)} layers
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {baseLayerCategories.map((cat) => (
          <div key={cat.slug} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', marginBottom: 10 }}>{cat.label}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cat.layers.map((layer) => (
                <Link
                  key={layer.slug}
                  href={`/admin/dashboard/modules/base-map/layers/${cat.slug}/${layer.slug}`}
                  style={{ fontSize: 13, color: '#0097b2', textDecoration: 'none' }}
                >
                  {layer.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
