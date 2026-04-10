'use client';

import dynamic from 'next/dynamic';
import OverlayToolbar, { useOverlays } from '@/components/map/base-views/overlay-toolbar';

const Clay3D = dynamic(() => import('@/components/map/base-views/clay-3d'), { ssr: false });

export default function Clay3DPage() {
  const { active, setActive } = useOverlays([]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <OverlayToolbar active={active} onChange={setActive} />
      <Clay3D overlays={active} />
    </div>
  );
}
