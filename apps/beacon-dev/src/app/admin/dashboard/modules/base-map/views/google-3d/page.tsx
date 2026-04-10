'use client';

import dynamic from 'next/dynamic';
import OverlayToolbar, { useOverlays } from '@/components/map/base-views/overlay-toolbar';

const Google3D = dynamic(() => import('@/components/map/base-views/google-3d'), { ssr: false });

export default function Google3DPage() {
  const { active, setActive } = useOverlays([]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <OverlayToolbar active={active} onChange={setActive} />
      <Google3D overlays={active} />
    </div>
  );
}
