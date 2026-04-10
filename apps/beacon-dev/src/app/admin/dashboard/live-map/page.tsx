'use client';

import dynamic from 'next/dynamic';

const LiveWorldMap = dynamic(
  () => import('@/components/map/live-world-map'),
  { ssr: false }
);

export default function LiveMapPage() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    }}>
      <LiveWorldMap />
    </div>
  );
}
