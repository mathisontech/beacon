'use client';

import dynamic from 'next/dynamic';
import OverlayToolbar, { useOverlays } from '@/components/map/base-views/overlay-toolbar';

const Satellite2D = dynamic(() => import('@/components/map/base-views/satellite-2d'), { ssr: false });

export default function Satellite2DPage() {
  const { active, setActive } = useOverlays(['labels']);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <OverlayToolbar active={active} onChange={setActive} />
      <Satellite2D overlays={active} />
    </div>
  );
}
