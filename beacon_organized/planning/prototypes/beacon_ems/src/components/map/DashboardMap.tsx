import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Buffalo, NY coordinates
const BUFFALO_REGION = {
  latitude: 42.8864,
  longitude: -78.8784,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Police unit locations around Buffalo
const POLICE_UNITS = [
  { id: 'bpd-1', callsign: 'Unit 101', lat: 42.8986, lng: -78.8697, status: 'available' },
  { id: 'bpd-2', callsign: 'Unit 102', lat: 42.8812, lng: -78.8591, status: 'responding' },
  { id: 'bpd-3', callsign: 'Unit 103', lat: 42.9045, lng: -78.8492, status: 'available' },
  { id: 'bpd-4', callsign: 'Unit 104', lat: 42.8734, lng: -78.8889, status: 'on_scene' },
  { id: 'bpd-5', callsign: 'Unit 105', lat: 42.8921, lng: -78.8234, status: 'available' },
  { id: 'bpd-6', callsign: 'Unit 106', lat: 42.8654, lng: -78.8712, status: 'responding' },
  { id: 'bpd-7', callsign: 'Unit 107', lat: 42.9112, lng: -78.8567, status: 'available' },
  { id: 'bpd-8', callsign: 'Unit 108', lat: 42.8789, lng: -78.8945, status: 'on_scene' },
  { id: 'bpd-9', callsign: 'K9 Unit', lat: 42.8867, lng: -78.8678, status: 'available' },
  { id: 'bpd-10', callsign: 'Traffic 1', lat: 42.8956, lng: -78.8834, status: 'available' },
  { id: 'bpd-11', callsign: 'SWAT 1', lat: 42.8823, lng: -78.8456, status: 'staging' },
  { id: 'bpd-12', callsign: 'Det. Unit', lat: 42.8901, lng: -78.8723, status: 'available' },
];

// Disaster/hazard areas
const HAZARD_ZONES = [
  {
    id: 'flood-1',
    type: 'flood',
    name: 'Buffalo River Flood Zone',
    center: { lat: 42.8734, lng: -78.8789 },
    radius: 800,
    severity: 'high',
    timeframes: [0, 1, 2, 3, 4, 5, 6], // Hours when this hazard is active
    expanding: true,
  },
  {
    id: 'fire-1',
    type: 'fire',
    name: 'Industrial Fire - Seneca St',
    center: { lat: 42.8812, lng: -78.8591 },
    radius: 300,
    severity: 'critical',
    timeframes: [0, 1, 2, 3],
    expanding: false,
  },
  {
    id: 'storm-1',
    type: 'storm',
    name: 'Severe Storm Cell',
    center: { lat: 42.9100, lng: -78.9000 },
    radius: 2000,
    severity: 'moderate',
    timeframes: [2, 3, 4, 5, 6],
    expanding: true,
    path: [
      { lat: 42.9100, lng: -78.9000 },
      { lat: 42.9000, lng: -78.8800 },
      { lat: 42.8900, lng: -78.8600 },
      { lat: 42.8800, lng: -78.8400 },
    ],
  },
  {
    id: 'powerout-1',
    type: 'power_outage',
    name: 'Grid Failure - Downtown',
    center: { lat: 42.8864, lng: -78.8784 },
    radius: 1200,
    severity: 'moderate',
    timeframes: [1, 2, 3, 4, 5, 6],
    expanding: false,
  },
];

// Incident markers
const INCIDENTS = [
  { id: 'inc-1', type: 'accident', lat: 42.8945, lng: -78.8612, title: 'MVA - I-190 & Elm', time: 0 },
  { id: 'inc-2', type: 'medical', lat: 42.8756, lng: -78.8534, title: 'Medical Emergency', time: 1 },
  { id: 'inc-3', type: 'crime', lat: 42.8823, lng: -78.8901, title: 'Burglary in Progress', time: 2 },
  { id: 'inc-4', type: 'fire', lat: 42.8812, lng: -78.8591, title: 'Structure Fire', time: 0 },
  { id: 'inc-5', type: 'rescue', lat: 42.8734, lng: -78.8789, title: 'Water Rescue', time: 3 },
  { id: 'inc-6', type: 'hazmat', lat: 42.8678, lng: -78.8456, title: 'Chemical Spill', time: 4 },
];

// High-risk alerts for Buffalo area
const HIGH_RISK_ALERTS = [
  {
    id: 'alert-1',
    type: 'traffic',
    severity: 'high',
    title: 'Multi-Vehicle Pile-Up Risk',
    location: 'I-190 Southbound',
    description: 'Icy conditions + reduced visibility',
    icon: '🚗',
    coordinates: { lat: 42.8945, lng: -78.8612 },
  },
  {
    id: 'alert-2',
    type: 'weather',
    severity: 'critical',
    title: 'Lake Effect Snow Warning',
    location: 'Erie County',
    description: '12-18" expected, 40mph gusts',
    icon: '🌨️',
    coordinates: { lat: 42.8864, lng: -78.8784 },
  },
  {
    id: 'alert-3',
    type: 'flood',
    severity: 'high',
    title: 'Flash Flood Watch',
    location: 'Buffalo River Basin',
    description: 'Rapid snowmelt + rain forecast',
    icon: '🌊',
    coordinates: { lat: 42.8734, lng: -78.8789 },
  },
  {
    id: 'alert-4',
    type: 'infrastructure',
    severity: 'moderate',
    title: 'Power Grid Strain',
    location: 'Downtown District',
    description: 'High demand, rolling outages possible',
    icon: '⚡',
    coordinates: { lat: 42.8864, lng: -78.8784 },
  },
];

// Weather forecast for Buffalo
const WEATHER_FORECAST = {
  current: {
    temp: '28°F',
    condition: 'Heavy Snow',
    wind: '35 mph NW',
    visibility: '0.25 mi',
  },
  alerts: [
    { type: 'Winter Storm Warning', expires: '8:00 PM', severity: 'critical' },
    { type: 'Wind Advisory', expires: '6:00 PM', severity: 'high' },
  ],
  hourly: [
    { time: '2 PM', temp: '28°F', precip: '100%', icon: '🌨️' },
    { time: '4 PM', temp: '26°F', precip: '90%', icon: '🌨️' },
    { time: '6 PM', temp: '24°F', precip: '80%', icon: '🌨️' },
    { time: '8 PM', temp: '22°F', precip: '60%', icon: '❄️' },
  ],
};

const getAlertSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return colors.status.critical;
    case 'high': return colors.status.severe;
    case 'moderate': return colors.status.moderate;
    default: return colors.status.minor;
  }
};

interface DashboardMapProps {
  onMarkerPress?: (marker: any) => void;
  onExpandPress?: () => void;
  showLayers?: boolean;
  markers?: any[];
  zones?: any[];
}

const getUnitColor = (status: string) => {
  switch (status) {
    case 'available': return '#2563eb'; // Blue
    case 'responding': return '#f59e0b'; // Yellow/Orange
    case 'on_scene': return '#dc2626'; // Red
    case 'staging': return '#7c3aed'; // Purple
    default: return '#6b7280'; // Gray
  }
};

const getHazardColor = (type: string, severity: string) => {
  switch (type) {
    case 'flood': return 'rgba(59, 130, 246, 0.3)'; // Blue
    case 'fire': return 'rgba(220, 38, 38, 0.4)'; // Red
    case 'storm': return 'rgba(124, 58, 237, 0.25)'; // Purple
    case 'power_outage': return 'rgba(107, 114, 128, 0.3)'; // Gray
    default: return 'rgba(0, 0, 0, 0.2)';
  }
};

const getHazardBorderColor = (type: string) => {
  switch (type) {
    case 'flood': return '#2563eb';
    case 'fire': return '#dc2626';
    case 'storm': return '#7c3aed';
    case 'power_outage': return '#6b7280';
    default: return '#000000';
  }
};

const getIncidentIcon = (type: string) => {
  switch (type) {
    case 'accident': return '🚗';
    case 'medical': return '🏥';
    case 'crime': return '🚨';
    case 'fire': return '🔥';
    case 'rescue': return '🆘';
    case 'hazmat': return '☢️';
    default: return '📍';
  }
};

export const DashboardMap: React.FC<DashboardMapProps> = ({
  onMarkerPress,
  onExpandPress,
  showLayers = true,
}) => {
  const mapRef = useRef<any>(null);
  const [currentHour, setCurrentHour] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    policeUnits: true,
    incidents: true,
    floodZones: true,
    fireZones: true,
    stormZones: true,
    powerOutage: true,
  });

  // Simulate time progression
  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentHour((prev) => (prev >= 6 ? 0 : prev + 1));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Get hazard radius based on time (for expanding hazards)
  const getHazardRadius = (hazard: typeof HAZARD_ZONES[0], hour: number) => {
    if (!hazard.timeframes.includes(hour)) return 0;
    if (!hazard.expanding) return hazard.radius;
    const baseRadius = hazard.radius;
    const expansion = hour * 100; // Expand 100m per hour
    return baseRadius + expansion;
  };

  // Get storm position based on time
  const getStormPosition = (hazard: typeof HAZARD_ZONES[0], hour: number) => {
    if (!hazard.path || hazard.path.length === 0) return hazard.center;
    const pathIndex = Math.min(Math.floor(hour / 2), hazard.path.length - 1);
    return { lat: hazard.path[pathIndex].lat, lng: hazard.path[pathIndex].lng };
  };

  // Filter incidents by time
  const visibleIncidents = INCIDENTS.filter((inc) => inc.time <= currentHour);

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const formatHour = (hour: number) => {
    const baseHour = 14; // 2 PM start
    const displayHour = baseHour + hour;
    return `${displayHour > 12 ? displayHour - 12 : displayHour}:00 ${displayHour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <View style={styles.container}>
      {/* High Risk Alerts Banner */}
      <View style={styles.alertsBanner}>
        <View style={styles.alertsHeader}>
          <Text style={styles.alertsTitle}>⚠️ Active Alerts</Text>
          <View style={styles.weatherBadge}>
            <Text style={styles.weatherBadgeText}>{WEATHER_FORECAST.current.condition} • {WEATHER_FORECAST.current.temp}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alertsScroll}>
          {HIGH_RISK_ALERTS.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.alertCard, { borderLeftColor: getAlertSeverityColor(alert.severity) }]}
              onPress={() => {
                onMarkerPress?.(alert);
                // Pan map to alert location
                mapRef.current?.animateToRegion({
                  latitude: alert.coordinates.lat,
                  longitude: alert.coordinates.lng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }, 500);
              }}
            >
              <View style={styles.alertCardHeader}>
                <Text style={styles.alertIcon}>{alert.icon}</Text>
                <View style={[styles.severityBadge, { backgroundColor: getAlertSeverityColor(alert.severity) }]}>
                  <Text style={styles.severityBadgeText}>{alert.severity.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertLocation}>📍 {alert.location}</Text>
              <Text style={styles.alertDescription}>{alert.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Weather Overview */}
        <View style={styles.weatherOverview}>
          <View style={styles.weatherCurrent}>
            <Text style={styles.weatherCurrentIcon}>🌨️</Text>
            <View style={styles.weatherCurrentInfo}>
              <Text style={styles.weatherCurrentTemp}>{WEATHER_FORECAST.current.temp}</Text>
              <Text style={styles.weatherCurrentCondition}>{WEATHER_FORECAST.current.condition}</Text>
            </View>
            <View style={styles.weatherCurrentDetails}>
              <Text style={styles.weatherDetail}>💨 {WEATHER_FORECAST.current.wind}</Text>
              <Text style={styles.weatherDetail}>👁️ Vis: {WEATHER_FORECAST.current.visibility}</Text>
            </View>
          </View>

          <View style={styles.weatherAlerts}>
            {WEATHER_FORECAST.alerts.map((alert, index) => (
              <View key={index} style={[styles.weatherAlertItem, { backgroundColor: getAlertSeverityColor(alert.severity) + '20' }]}>
                <View style={[styles.weatherAlertDot, { backgroundColor: getAlertSeverityColor(alert.severity) }]} />
                <Text style={styles.weatherAlertText}>{alert.type}</Text>
                <Text style={styles.weatherAlertExpires}>Until {alert.expires}</Text>
              </View>
            ))}
          </View>

          <View style={styles.weatherHourly}>
            {WEATHER_FORECAST.hourly.map((hour, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>{hour.time}</Text>
                <Text style={styles.hourlyIcon}>{hour.icon}</Text>
                <Text style={styles.hourlyTemp}>{hour.temp}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={BUFFALO_REGION}
          mapType="standard"
        >
          {/* Hazard Zones */}
          {HAZARD_ZONES.map((hazard) => {
            const radius = getHazardRadius(hazard, currentHour);
            if (radius === 0) return null;

            const isVisible =
              (hazard.type === 'flood' && visibleLayers.floodZones) ||
              (hazard.type === 'fire' && visibleLayers.fireZones) ||
              (hazard.type === 'storm' && visibleLayers.stormZones) ||
              (hazard.type === 'power_outage' && visibleLayers.powerOutage);

            if (!isVisible) return null;

            const position = hazard.type === 'storm'
              ? getStormPosition(hazard, currentHour)
              : hazard.center;

            return (
              <Circle
                key={hazard.id}
                center={{ latitude: position.lat, longitude: position.lng }}
                radius={radius}
                fillColor={getHazardColor(hazard.type, hazard.severity)}
                strokeColor={getHazardBorderColor(hazard.type)}
                strokeWidth={2}
              />
            );
          })}

          {/* Police Units */}
          {visibleLayers.policeUnits && POLICE_UNITS.map((unit) => (
            <Marker
              key={unit.id}
              coordinate={{ latitude: unit.lat, longitude: unit.lng }}
              onPress={() => onMarkerPress?.(unit)}
            >
              <View style={[styles.unitMarker, { backgroundColor: getUnitColor(unit.status) }]}>
                <Text style={styles.unitMarkerText}>🚔</Text>
              </View>
            </Marker>
          ))}

          {/* Incidents */}
          {visibleLayers.incidents && visibleIncidents.map((incident) => (
            <Marker
              key={incident.id}
              coordinate={{ latitude: incident.lat, longitude: incident.lng }}
              onPress={() => onMarkerPress?.(incident)}
            >
              <View style={styles.incidentMarker}>
                <Text style={styles.incidentMarkerText}>{getIncidentIcon(incident.type)}</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Layer toggle button */}
        {showLayers && (
          <TouchableOpacity
            style={[styles.layerToggleButton, layerPanelOpen && styles.layerToggleButtonActive]}
            onPress={() => setLayerPanelOpen(!layerPanelOpen)}
          >
            <Text style={styles.layerToggleIcon}>☰</Text>
            <Text style={styles.layerToggleText}>Layers</Text>
          </TouchableOpacity>
        )}

        {/* Layer panel */}
        {showLayers && layerPanelOpen && (
          <View style={styles.layerPanel}>
            <View style={styles.layerPanelHeader}>
              <Text style={styles.layerPanelTitle}>Map Layers</Text>
              <TouchableOpacity onPress={() => setLayerPanelOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.layerList}>
              <TouchableOpacity style={styles.layerItem} onPress={() => toggleLayer('policeUnits')}>
                <View style={[styles.checkbox, visibleLayers.policeUnits && styles.checkboxChecked]}>
                  {visibleLayers.policeUnits && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.layerItemText}>Police Units</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.layerItem} onPress={() => toggleLayer('incidents')}>
                <View style={[styles.checkbox, visibleLayers.incidents && styles.checkboxChecked]}>
                  {visibleLayers.incidents && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.layerItemText}>Incidents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.layerItem} onPress={() => toggleLayer('floodZones')}>
                <View style={[styles.checkbox, visibleLayers.floodZones && styles.checkboxChecked]}>
                  {visibleLayers.floodZones && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.layerItemText}>Flood Zones</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.layerItem} onPress={() => toggleLayer('fireZones')}>
                <View style={[styles.checkbox, visibleLayers.fireZones && styles.checkboxChecked]}>
                  {visibleLayers.fireZones && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.layerItemText}>Fire Zones</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.layerItem} onPress={() => toggleLayer('stormZones')}>
                <View style={[styles.checkbox, visibleLayers.stormZones && styles.checkboxChecked]}>
                  {visibleLayers.stormZones && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.layerItemText}>Storm Zones</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.layerItem} onPress={() => toggleLayer('powerOutage')}>
                <View style={[styles.checkbox, visibleLayers.powerOutage && styles.checkboxChecked]}>
                  {visibleLayers.powerOutage && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.layerItemText}>Power Outage</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Expand button */}
        {onExpandPress && (
          <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
            <Text style={styles.expandButtonText}>⛶</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Timeline Controls */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Hazard Timeline Simulation</Text>
          <Text style={styles.currentTime}>{formatHour(currentHour)}</Text>
        </View>

        <View style={styles.sliderContainer}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <View style={styles.sliderWrapper}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={6}
              step={1}
              value={currentHour}
              onValueChange={setCurrentHour}
              minimumTrackTintColor={colors.beacon.primary}
              maximumTrackTintColor={colors.border.dark}
              thumbTintColor={colors.beacon.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>2 PM</Text>
              <Text style={styles.sliderLabel}>5 PM</Text>
              <Text style={styles.sliderLabel}>8 PM</Text>
            </View>
          </View>
        </View>

        {/* Active Hazards Summary */}
        <View style={styles.hazardSummary}>
          {HAZARD_ZONES.filter(h => h.timeframes.includes(currentHour)).map((hazard) => (
            <View key={hazard.id} style={[styles.hazardBadge, { borderColor: getHazardBorderColor(hazard.type) }]}>
              <View style={[styles.hazardDot, { backgroundColor: getHazardBorderColor(hazard.type) }]} />
              <Text style={styles.hazardBadgeText}>{hazard.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendSection}>
          <Text style={styles.legendSectionTitle}>Units</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Responding</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
              <Text style={styles.legendText}>On Scene</Text>
            </View>
          </View>
        </View>
        <View style={styles.legendSection}>
          <Text style={styles.legendSectionTitle}>Hazards</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
              <Text style={styles.legendText}>Flood</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
              <Text style={styles.legendText}>Fire</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#7c3aed' }]} />
              <Text style={styles.legendText}>Storm</Text>
            </View>
          </View>
        </View>
      </View>
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

  // Alerts Banner
  alertsBanner: {
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    padding: spacing.md,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  weatherBadge: {
    backgroundColor: colors.status.moderate,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  weatherBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  alertsScroll: {
    marginBottom: spacing.md,
  },
  alertCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    minWidth: 180,
    maxWidth: 220,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertIcon: {
    fontSize: 20,
  },
  severityBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  severityBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  alertTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  alertLocation: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  alertDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },

  // Weather Overview
  weatherOverview: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  weatherCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
  },
  weatherCurrentIcon: {
    fontSize: 32,
  },
  weatherCurrentInfo: {
    alignItems: 'flex-start',
  },
  weatherCurrentTemp: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  weatherCurrentCondition: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  weatherCurrentDetails: {
    gap: spacing.xs,
  },
  weatherDetail: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  weatherAlerts: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  weatherAlertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  weatherAlertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  weatherAlertText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  weatherAlertExpires: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  weatherHourly: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border.default,
  },
  hourlyItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  hourlyTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  hourlyIcon: {
    fontSize: 16,
  },
  hourlyTemp: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },

  mapContainer: {
    flex: 1,
    minHeight: 300,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Markers
  unitMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  unitMarkerText: {
    fontSize: 16,
  },
  incidentMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.status.critical,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  incidentMarkerText: {
    fontSize: 18,
  },

  // Layer controls
  layerToggleButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.xs,
  },
  layerToggleButtonActive: {
    borderColor: colors.beacon.primary,
    backgroundColor: colors.beacon.primaryLight,
  },
  layerToggleIcon: {
    fontSize: 14,
    color: colors.text.primary,
  },
  layerToggleText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  layerPanel: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 200,
    maxHeight: 300,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  layerPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  layerPanelTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 16,
    color: colors.text.muted,
  },
  layerList: {
    padding: spacing.sm,
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  layerItemText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.dark,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.card,
  },
  checkboxChecked: {
    backgroundColor: colors.beacon.primary,
    borderColor: colors.beacon.primary,
  },
  checkmark: {
    fontSize: 12,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  expandButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  expandButtonText: {
    fontSize: 18,
    color: colors.text.primary,
  },

  // Timeline
  timelineContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timelineTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  currentTime: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.beacon.primary,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.beacon.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: colors.status.severe,
  },
  playButtonText: {
    fontSize: 16,
    color: colors.white,
  },
  sliderWrapper: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sliderLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  hazardSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  hazardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  hazardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hazardBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  legendSection: {
    alignItems: 'center',
  },
  legendSectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  legendItems: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});

export default DashboardMap;
