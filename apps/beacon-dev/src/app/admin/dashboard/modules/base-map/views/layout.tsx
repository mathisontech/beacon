'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const views = [
  { label: '2D', href: '/admin/dashboard/modules/base-map/views/flat' },
  { label: '2D Satellite', href: '/admin/dashboard/modules/base-map/views/satellite' },
  { label: '3D Clay', href: '/admin/dashboard/modules/base-map/views/clay' },
  { label: '3D Google', href: '/admin/dashboard/modules/base-map/views/google-3d' },
];

const TAB_H = 38;

export default function BaseMapViewsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 2,
        borderBottom: '1px solid #e5e7eb',
        padding: '0 16px',
        background: '#fff',
        flexShrink: 0,
        height: TAB_H,
        alignItems: 'stretch',
      }}>
        {views.map((v) => {
          const active = pathname === v.href;
          return (
            <Link key={v.href} href={v.href} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              color: active ? '#111827' : '#6b7280',
              textDecoration: 'none',
              borderBottom: active ? '2px solid #111827' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {v.label}
            </Link>
          );
        })}
      </div>

      {/* Map area — absolute fill below tabs */}
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
