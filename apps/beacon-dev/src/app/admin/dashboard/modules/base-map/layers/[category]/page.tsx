'use client';

import { use } from 'react';
import { baseLayerCategories } from '@/data/baseLayerCategories';
import Link from 'next/link';

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const cat = baseLayerCategories.find(c => c.slug === category);

  if (!cat) return <div style={{ padding: 40, color: '#6b7280' }}>Category not found</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{cat.label}</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>{cat.layers.length} layers</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cat.layers.map((layer) => (
          <Link
            key={layer.slug}
            href={`/admin/dashboard/modules/base-map/layers/${category}/${layer.slug}`}
            style={{
              display: 'block',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '14px 20px',
              fontSize: 14,
              color: '#374151',
              textDecoration: 'none',
            }}
          >
            {layer.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
