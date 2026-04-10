'use client';

import { use } from 'react';
import { baseMapSubmodules } from '@/data/baseMapSubmodules';

export default function UserAdjustmentTab({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = use(params);
  const sub = baseMapSubmodules.find(s => s.key === 'user-adjustments');
  const tabData = sub?.tabs.find(t => t.slug === tab);

  if (!tabData) return <div style={{ padding: 40, color: '#6b7280' }}>Tab not found</div>;

  return (
    <div>
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>User Map Adjustments</p>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24 }}>{tabData.label}</h1>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24 }}>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Configuration interface under development.</p>
      </div>
    </div>
  );
}
