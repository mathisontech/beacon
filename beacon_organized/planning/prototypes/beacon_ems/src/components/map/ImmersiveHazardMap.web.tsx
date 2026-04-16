import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../../theme/tokens';

// Types
interface PersonMarker {
  id: string;
  lat: number;
  lon: number;
  name: string;
  status: 'safe' | 'needs_help' | 'unknown' | 'evacuating';
  message?: string;
}

interface HazardTimelinePoint {
  time: string;
  waterLevel: number;
}

interface ImmersiveHazardMapProps {
  initialLocation?: { lat: number; lon: number };
  onMarkerClick?: (marker: PersonMarker) => void;
}

// Status colors
const STATUS_COLORS: Record<string, string> = {
  safe: '#22c55e',
  needs_help: '#ef4444',
  unknown: '#eab308',
  evacuating: '#3b82f6',
};

// Buffalo, NY
const DEFAULT_LOCATION = {
  lat: 42.8864,
  lon: -78.8784,
};

// Layer definitions
const MAP_LAYERS = [
  { id: 'myteams', name: 'My Teams', active: true },
  { id: 'units', name: 'All Units', active: false },
  { id: 'incidents', name: 'Incidents', active: true },
  { id: 'roads', name: 'Road Closures', active: false },
  { id: 'shelters', name: 'Shelters', active: false },
  { id: 'hazards', name: 'Hazard Zones', active: false },
  { id: 'utilities', name: 'Utilities', active: false },
];

// Vehicle type icons for map display
const VEHICLE_ICONS: Record<string, string> = {
  atv: '🚙',
  fire: '🚒',
  ambulance: '🚑',
  utility: '🚐',
  civilian: '🚗',
  patrol: '🚔',
  foot: '👤', // Person on foot
};

// Unit data for map markers - includes isMyTeam and onFoot flags
const UNIT_MARKERS = [
  // My Teams - these are directly under admin's command
  { id: 'atv-1', name: 'ATG #1', type: 'atv', lat: 42.9018, lon: -78.8722, status: 'responding', isMyTeam: true, onFoot: false },
  { id: 'atv-2', name: 'ATG #2', type: 'atv', lat: 42.9164, lon: -78.8834, status: 'on_scene', isMyTeam: true, onFoot: false },
  { id: 'fire-1', name: 'Engine 7', type: 'fire', lat: 42.8864, lon: -78.8784, status: 'on_scene', isMyTeam: true, onFoot: false },
  { id: 'fire-2', name: 'Ladder 3', type: 'fire', lat: 42.8874, lon: -78.8794, status: 'on_scene', isMyTeam: true, onFoot: false },
  { id: 'amb-1', name: 'Medic 7', type: 'ambulance', lat: 42.8764, lon: -78.8584, status: 'on_scene', isMyTeam: true, onFoot: false },
  { id: 'civ-1', name: 'CERT Alpha', type: 'civilian', lat: 42.9114, lon: -78.8534, status: 'on_scene', isMyTeam: true, onFoot: false },
  // My Teams - on foot (not in confirmed vehicle)
  { id: 'foot-1', name: 'Officer Torres', type: 'foot', lat: 42.9028, lon: -78.8732, status: 'on_scene', isMyTeam: true, onFoot: true },
  { id: 'foot-2', name: 'Mary Thompson', type: 'foot', lat: 42.9120, lon: -78.8544, status: 'responding', isMyTeam: true, onFoot: true },

  // All Units (not My Teams)
  { id: 'fire-4', name: 'Rescue 1', type: 'fire', lat: 42.8564, lon: -78.8284, status: 'responding', isMyTeam: false, onFoot: false },
  { id: 'amb-2', name: 'Medic 12', type: 'ambulance', lat: 42.8964, lon: -78.8684, status: 'responding', isMyTeam: false, onFoot: false },
  { id: 'util-1', name: 'Power Crew Alpha', type: 'utility', lat: 42.9214, lon: -78.8634, status: 'on_scene', isMyTeam: false, onFoot: false },
  { id: 'util-2', name: 'Power Crew Beta', type: 'utility', lat: 42.8814, lon: -78.8934, status: 'responding', isMyTeam: false, onFoot: false },
];

// Incident markers
const INCIDENT_MARKERS = [
  { id: 'inc-1', name: 'Structure Fire', type: 'fire', lat: 42.8864, lon: -78.8784, priority: 'critical' },
  { id: 'inc-2', name: 'Vehicle Entrapment', type: 'rescue', lat: 42.8564, lon: -78.8284, priority: 'high' },
  { id: 'inc-3', name: 'Hypothermia', type: 'medical', lat: 42.8764, lon: -78.8584, priority: 'critical' },
  { id: 'inc-4', name: 'Power Outage', type: 'utility', lat: 42.9214, lon: -78.8634, priority: 'high' },
  { id: 'inc-5', name: 'Gas Leak', type: 'hazmat', lat: 42.8814, lon: -78.8934, priority: 'high' },
  { id: 'inc-6', name: 'Stranded Motorist', type: 'rescue', lat: 42.9018, lon: -78.8722, priority: 'medium' },
];

// Unit type colors
const UNIT_COLORS: Record<string, string> = {
  atv: '#8b5cf6',
  fire: '#ef4444',
  ambulance: '#22c55e',
  utility: '#f59e0b',
  civilian: '#3b82f6',
  foot: '#10b981', // Person on foot
};

// Incident priority colors
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
};

export const ImmersiveHazardMap: React.FC<ImmersiveHazardMapProps> = ({
  initialLocation = DEFAULT_LOCATION,
  onMarkerClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const waterEntityRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Initializing...');
  const [waterLevel, setWaterLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timeline, setTimeline] = useState<HazardTimelinePoint[]>([]);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    MAP_LAYERS.reduce((acc, layer) => ({ ...acc, [layer.id]: layer.active }), {})
  );

  // Load Cesium from CDN (self-hosted version would use local files)
  useEffect(() => {
    let mounted = true;

    const loadCesium = () => {
      // Load Cesium CSS
      if (!document.getElementById('cesium-css')) {
        setStatus('Loading styles...');
        const css = document.createElement('link');
        css.id = 'cesium-css';
        css.rel = 'stylesheet';
        css.href = 'https://cesium.com/downloads/cesiumjs/releases/1.121/Build/Cesium/Widgets/widgets.css';
        document.head.appendChild(css);
      }

      // Check if already loaded
      if ((window as any).Cesium) {
        initViewer((window as any).Cesium);
        return;
      }

      // Load Cesium JS
      setStatus('Loading CesiumJS engine...');
      const script = document.createElement('script');
      script.id = 'cesium-script';
      script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.121/Build/Cesium/Cesium.js';
      script.onload = () => {
        if (mounted) initViewer((window as any).Cesium);
      };
      script.onerror = () => {
        if (mounted) {
          setError('Failed to load CesiumJS');
          setIsLoading(false);
        }
      };
      document.head.appendChild(script);
    };

    const initViewer = (Cesium: any) => {
      if (!containerRef.current || viewerRef.current) return;

      try {
        setStatus('Initializing 3D viewer...');

        // IMPORTANT: Disable Ion - we're self-hosting
        Cesium.Ion.defaultAccessToken = '';

        // Create viewer with NO Ion dependencies
        const viewer = new Cesium.Viewer(containerRef.current, {
          // Disable all Ion-dependent features
          imageryProvider: false, // We'll add our own
          terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Flat earth for now
          baseLayerPicker: false,
          geocoder: false,

          // Disable UI elements we don't need
          timeline: false,
          animation: false,
          homeButton: false,
          navigationHelpButton: false,
          sceneModePicker: false,
          selectionIndicator: true,
          infoBox: true,

          // Performance
          requestRenderMode: false,
          shouldAnimate: true,
        });

        // Use CartoDB Voyager - clean style with roads and building outlines
        viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: 'https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
            credit: new Cesium.Credit('© CARTO © OpenStreetMap contributors'),
            maximumLevel: 20,
          })
        );

        // Store reference
        viewerRef.current = viewer;

        // Fly to initial location - Buffalo city view
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            initialLocation.lon,
            initialLocation.lat,
            15000 // 15km altitude for city view
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-50),
            roll: 0,
          },
          duration: 2,
        });

        // Handle clicks on entities
        viewer.screenSpaceEventHandler.setInputAction((click: any) => {
          const picked = viewer.scene.pick(click.position);
          if (Cesium.defined(picked) && picked.id && picked.id.personData) {
            onMarkerClick?.(picked.id.personData);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        setStatus('Ready');
        setIsLoading(false);

        // Add some demo markers
        addDemoData(Cesium, viewer);

      } catch (err) {
        console.error('Cesium init error:', err);
        setError('Failed to initialize: ' + String(err));
        setIsLoading(false);
      }
    };

    loadCesium();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [initialLocation, onMarkerClick]);

  // Create unit icon with vehicle/person emoji
  const createUnitIcon = (unit: typeof UNIT_MARKERS[0], color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background circle
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emoji icon
      const icon = unit.onFoot ? VEHICLE_ICONS.foot : (VEHICLE_ICONS[unit.type] || '🚗');
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 16, 16);

      // My Team indicator (small star in corner)
      if (unit.isMyTeam) {
        ctx.beginPath();
        ctx.arc(26, 6, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    return canvas.toDataURL();
  };

  // Add demo data for Buffalo
  const addDemoData = (Cesium: any, viewer: any) => {
    // Add unit markers
    UNIT_MARKERS.forEach(unit => {
      const color = UNIT_COLORS[unit.type] || '#6b7280';
      const entity = viewer.entities.add({
        id: `unit-${unit.id}`,
        position: Cesium.Cartesian3.fromDegrees(unit.lon, unit.lat, 50),
        billboard: {
          image: createUnitIcon(unit, color),
          width: 32,
          height: 32,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: unit.name,
          font: '12px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString(color),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        description: `<div style="padding:8px;"><strong>${unit.name}</strong><br/>Status: ${unit.status}<br/>Type: ${unit.onFoot ? 'On Foot' : unit.type}${unit.isMyTeam ? '<br/><span style="color:#fbbf24;">★ My Team</span>' : ''}</div>`,
      });
      // Set initial visibility based on default layer states
      // My Teams layer is on by default, All Units layer is off by default
      entity.show = unit.isMyTeam;
      markersRef.current.set(`unit-${unit.id}`, entity);
    });

    // Add incident markers
    INCIDENT_MARKERS.forEach(incident => {
      const color = PRIORITY_COLORS[incident.priority] || '#6b7280';
      const entity = viewer.entities.add({
        id: `incident-${incident.id}`,
        position: Cesium.Cartesian3.fromDegrees(incident.lon, incident.lat, 100),
        billboard: {
          image: createIncidentIcon(color),
          width: 24,
          height: 24,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: incident.name,
          font: '11px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 14),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        description: `<div style="padding:8px;"><strong>${incident.name}</strong><br/>Priority: ${incident.priority}<br/>Type: ${incident.type}</div>`,
      });
      markersRef.current.set(`incident-${incident.id}`, entity);
    });
  };

  // Create a simple triangle icon for incidents
  const createIncidentIcon = (color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(22, 22);
      ctx.lineTo(2, 22);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Exclamation mark
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 12, 18);
    }
    return canvas.toDataURL();
  };

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    const newState = !activeLayers[layerId];
    setActiveLayers(prev => ({ ...prev, [layerId]: newState }));

    // Show/hide entities based on layer
    if (layerId === 'myteams') {
      // Show/hide only My Teams units
      UNIT_MARKERS.forEach(unit => {
        if (unit.isMyTeam) {
          const entity = markersRef.current.get(`unit-${unit.id}`);
          if (entity) entity.show = newState;
        }
      });
    } else if (layerId === 'units') {
      // Show/hide all units (non-My Teams)
      UNIT_MARKERS.forEach(unit => {
        if (!unit.isMyTeam) {
          const entity = markersRef.current.get(`unit-${unit.id}`);
          if (entity) entity.show = newState;
        }
      });
    } else if (layerId === 'incidents') {
      INCIDENT_MARKERS.forEach(incident => {
        const entity = markersRef.current.get(`incident-${incident.id}`);
        if (entity) entity.show = newState;
      });
    }
    // Other layers are just for UI demo - no actual data yet
  };

  // Internal function to add a person marker
  const addPersonMarkerInternal = (Cesium: any, viewer: any, marker: PersonMarker) => {
    const color = STATUS_COLORS[marker.status] || STATUS_COLORS.unknown;

    // Create the marker entity
    const entity = viewer.entities.add({
      id: `person-${marker.id}`,
      position: Cesium.Cartesian3.fromDegrees(marker.lon, marker.lat, 100),

      // Point on the ground
      point: {
        pixelSize: 15,
        color: Cesium.Color.fromCssColorString(color),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },

      // Label above
      label: {
        text: `${marker.name}\n${marker.status.replace('_', ' ').toUpperCase()}`,
        font: '14px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },

      // Store marker data for click handling
      personData: marker,

      // Description for info box
      description: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 10px 0; color: ${color};">${marker.name}</h3>
          <p><strong>Status:</strong> ${marker.status.replace('_', ' ')}</p>
          ${marker.message ? `<p><strong>Message:</strong> ${marker.message}</p>` : ''}
          <p><strong>Location:</strong> ${marker.lat.toFixed(4)}, ${marker.lon.toFixed(4)}</p>
        </div>
      `,
    });

    markersRef.current.set(marker.id, entity);
    return entity;
  };

  // Public function to add a marker
  const addPersonMarker = useCallback((marker: PersonMarker) => {
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    addPersonMarkerInternal(Cesium, viewer, marker);
  }, []);

  // Update water level visualization
  const updateWaterLevel = useCallback((level: number) => {
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    setWaterLevel(level);

    // Remove existing water entity
    if (waterEntityRef.current) {
      viewer.entities.remove(waterEntityRef.current);
      waterEntityRef.current = null;
    }

    if (level <= 0) return;

    // Create water surface as a large polygon
    // Covering Buffalo area for demo
    const waterEntity = viewer.entities.add({
      id: 'water-surface',
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          -78.95, 42.82,
          -78.80, 42.82,
          -78.80, 42.95,
          -78.95, 42.95,
        ]),
        height: level, // Height above ellipsoid
        material: Cesium.Color.fromCssColorString('rgba(30, 144, 255, 0.6)'),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('rgba(0, 100, 200, 0.8)'),
        outlineWidth: 2,
      },
      description: `<p>Water Level: ${level.toFixed(1)} meters</p>`,
    });

    waterEntityRef.current = waterEntity;
  }, []);

  // Timeline playback
  useEffect(() => {
    if (!isPlaying || timeline.length === 0) return;

    const interval = setInterval(() => {
      setTimelineIndex(prev => {
        const next = prev + 1;
        if (next >= timeline.length) {
          setIsPlaying(false);
          return prev;
        }
        const point = timeline[next];
        setCurrentTime(point.time);
        updateWaterLevel(point.waterLevel);
        return next;
      });
    }, 1500); // 1.5 seconds per step

    return () => clearInterval(interval);
  }, [isPlaying, timeline, updateWaterLevel]);

  // Format time for display
  const formatTime = (isoString: string) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Play/pause toggle
  const togglePlayback = () => {
    if (!isPlaying && timelineIndex >= timeline.length - 1) {
      // Reset to beginning
      setTimelineIndex(0);
      if (timeline.length > 0) {
        setCurrentTime(timeline[0].time);
        updateWaterLevel(timeline[0].waterLevel);
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Scrub to specific point
  const scrubTo = (index: number) => {
    if (index < 0 || index >= timeline.length) return;
    setTimelineIndex(index);
    setCurrentTime(timeline[index].time);
    updateWaterLevel(timeline[index].waterLevel);
    setIsPlaying(false);
  };

  // Fly to location
  const flyTo = (lat: number, lon: number, altitude: number = 5000) => {
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 2,
    });
  };

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>{error}</div>
        <button onClick={() => window.location.reload()} style={styles.button}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Loading overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
          <div style={{ color: '#e94560', fontSize: 20, marginTop: 16 }}>Loading 3D Map</div>
          <div style={{ color: '#8b8b9e', fontSize: 14, marginTop: 8 }}>{status}</div>
        </div>
      )}

      {/* Cesium container */}
      <div ref={containerRef} style={styles.cesiumContainer} />

      {/* Layer Toggle Bar */}
      {!isLoading && (
        <div style={styles.layerBar}>
          {MAP_LAYERS.map(layer => (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              style={{
                ...styles.layerButton,
                backgroundColor: activeLayers[layer.id] ? 'rgba(0, 151, 178, 0.9)' : 'rgba(50, 50, 70, 0.9)',
                borderColor: activeLayers[layer.id] ? '#0097b2' : '#555',
              }}
            >
              {layer.name}
            </button>
          ))}
        </div>
      )}

      {/* Legend Panel */}
      {!isLoading && (
        <div style={styles.legendPanel}>
          <div style={styles.legendSection}>
            <div style={styles.legendTitle}>My Teams</div>
            <div style={styles.legendItems}>
              {Object.entries(VEHICLE_ICONS).filter(([type]) => type !== 'patrol').map(([type, icon]) => (
                <div key={type} style={styles.legendItem}>
                  <span style={styles.legendIcon}>{icon}</span>
                  <span style={styles.legendText}>{type === 'foot' ? 'On Foot' : type}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.legendSection}>
            <div style={styles.legendTitle}>Incidents</div>
            <div style={styles.legendItems}>
              {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                <div key={priority} style={styles.legendItem}>
                  <div style={{ ...styles.legendTriangle, borderBottomColor: color }} />
                  <span style={styles.legendText}>{priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* City Label */}
      {!isLoading && (
        <div style={styles.cityLabel}>
          <div style={styles.cityIcon}>🏙️</div>
          <div style={styles.cityInfo}>
            <div style={styles.cityName}>Buffalo, NY</div>
            <div style={styles.citySubtext}>Emergency Response View</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    minHeight: 600,
    position: 'relative',
    backgroundColor: '#1a1a2e',
  },
  cesiumContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  layerBar: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 8,
    padding: '8px 12px',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 8,
    zIndex: 50,
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
  layerButton: {
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    border: '1px solid',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    zIndex: 100,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #333',
    borderTop: '4px solid #e94560',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    minHeight: 600,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  button: {
    backgroundColor: '#e94560',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  legendPanel: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 8,
    padding: 12,
    zIndex: 50,
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
  legendSection: {
    marginBottom: 10,
  },
  legendTitle: {
    color: '#8b8b9e',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  legendItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  legendIcon: {
    fontSize: 14,
  },
  legendTriangle: {
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderBottom: '10px solid',
  },
  legendText: {
    color: '#aaa',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  cityLabel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 12,
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    zIndex: 50,
  },
  cityIcon: {
    fontSize: 28,
  },
  cityInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  cityName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
  },
  citySubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textTransform: 'uppercase',
  },
};

// Add keyframe animation for spinner
if (typeof document !== 'undefined' && !document.getElementById('cesium-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'cesium-spinner-style';
  style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export default ImmersiveHazardMap;
