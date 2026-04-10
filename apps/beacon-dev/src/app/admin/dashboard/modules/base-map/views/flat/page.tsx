'use client';

import dynamic from 'next/dynamic';
import OverlayToolbar, { useOverlays } from '@/components/map/base-views/overlay-toolbar';

const Flat2D = dynamic(() => import('@/components/map/base-views/flat-2d'), { ssr: false });

export default function Flat2DPage() {
  const { active, setActive } = useOverlays([]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <OverlayToolbar active={active} onChange={setActive} />
      <Flat2D overlays={active} />
    </div>
  );
}
