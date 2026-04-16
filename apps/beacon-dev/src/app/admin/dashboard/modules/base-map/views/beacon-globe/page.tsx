'use client';

import dynamic from 'next/dynamic';
import OverlayToolbar, { useOverlays } from '@/components/map/base-views/overlay-toolbar';

const BeaconGlobe = dynamic(
  () => import('@/components/map/base-views/beacon-globe'),
  { ssr: false }
);

export default function BeaconGlobePage() {
  const { active, setActive } = useOverlays([]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <OverlayToolbar active={active} onChange={setActive} />
      <BeaconGlobe overlays={active} />
    </div>
  );
}
