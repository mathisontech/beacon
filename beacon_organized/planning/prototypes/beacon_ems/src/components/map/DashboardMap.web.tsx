import React, { Suspense, lazy } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../theme/tokens';

// Lazy load the immersive map
const ImmersiveHazardMap = lazy(() => import('./ImmersiveHazardMap.web').then(m => ({ default: m.ImmersiveHazardMap })));

interface DashboardMapProps {
  onMarkerPress?: (marker: any) => void;
  onExpandPress?: () => void;
  showLayers?: boolean;
  markers?: any[];
  zones?: any[];
}

export const DashboardMap: React.FC<DashboardMapProps> = () => {
  return (
    <View style={styles.container}>
      <Suspense fallback={
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a1a2e',
        }}>
          <div style={{ color: '#0097b2', fontSize: 20 }}>Loading 3D Map...</div>
        </div>
      }>
        <ImmersiveHazardMap />
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});

export default DashboardMap;
