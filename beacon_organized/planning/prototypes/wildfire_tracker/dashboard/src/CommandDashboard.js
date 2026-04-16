import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CommandDashboard.css';
import Communications from './Communications';

const API_BASE_URL = 'http://localhost:8000';

// Unit type icons and colors
const UNIT_TYPES = {
  engine: { icon: '🚒', color: '#d32f2f', label: 'Engine' },
  ladder: { icon: '🚨', color: '#c62828', label: 'Ladder' },
  police: { icon: '🚓', color: '#1565c0', label: 'Police' },
  ambulance: { icon: '🚑', color: '#2e7d32', label: 'Ambulance' },
  helicopter: { icon: '🚁', color: '#6a1b9a', label: 'Helicopter' },
  command: { icon: '📡', color: '#f57c00', label: 'Command' }
};

// Unit status colors
const STATUS_COLORS = {
  available: '#4caf50',
  en_route: '#ff9800',
  on_scene: '#f44336',
  returning: '#2196f3',
  out_of_service: '#9e9e9e'
};

function CommandDashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [assignedUnits, setAssignedUnits] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [ws, setWs] = useState(null);
  const [mapCenter] = useState([20.8783, -156.6825]); // Lahaina
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [showCommunications, setShowCommunications] = useState(false);

  // Map layer visibility state
  const [mapLayers, setMapLayers] = useState({
    // Environmental
    windConditions: true,
    weatherConditions: false,
    smokeLayer: false,
    temperatureMap: false,

    // Population & Civilian
    civilianLocations: true,
    censusData: false,
    evacuationZones: false,
    shelterLocations: true,

    // Fire Intelligence
    civilianFireReports: true,
    firePersonnelReports: true,
    firePerimeter: true,
    predictedSpread: true,
    hotspots: false,

    // Obstacles & Hazards
    downedTrees: true,
    lockedGates: true,
    floodedRoads: false,
    downedPowerLines: true,
    gasLeaks: false,
    structuralDamage: false,

    // Infrastructure
    fireHydrants: true,
    waterMains: false,
    powerLines: false,
    gasLines: false,
    cellTowers: false,
    bridgesOverpasses: false,

    // Emergency Resources (already have units, but adding more detail)
    fireUnits: true,
    policeUnits: true,
    ambulances: true,
    helicopters: true,
    commandVehicles: true,

    // Utility Crews
    electricCrews: false,
    gasCrews: false,
    waterCrews: false,
    telecomCrews: false,

    // Routes & Navigation
    evacuationRoutes: true,
    blockedRoads: true,
    alternateRoutes: false,
    stageAreas: true,
    safeCorridors: true,

    // Medical & Safety
    medicalFacilities: false,
    traumaCenters: false,
    temporaryMedicalStations: false,
    decontaminationZones: false
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardStats();
    loadIncidents();
    loadUnits();

    // WebSocket for real-time updates
    const websocket = new WebSocket('ws://localhost:8000/ws');

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'new_incident' || message.type === 'unit_assigned' ||
          message.type === 'unit_update' || message.type === 'activity_log') {
        loadDashboardStats();
        loadIncidents();
        loadUnits();
        if (selectedIncident) {
          loadIncidentAssignments(selectedIncident.id);
          loadIncidentActivity(selectedIncident.id);
        }
      }
    };

    setWs(websocket);

    return () => {
      if (websocket) websocket.close();
    };
  }, []);

  useEffect(() => {
    if (selectedIncident) {
      loadIncidentAssignments(selectedIncident.id);
      loadIncidentActivity(selectedIncident.id);
    }
  }, [selectedIncident]);

  const loadDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadIncidents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/incidents`);
      setIncidents(response.data);
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/units`);
      setUnits(response.data);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const loadIncidentAssignments = async (incidentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/assignments/incident/${incidentId}`);
      setAssignedUnits(response.data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadIncidentActivity = async (incidentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/activity/incident/${incidentId}`);
      setActivityLog(response.data);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const assignUnitToIncident = async (unitId, roleAtScene = 'support') => {
    if (!selectedIncident) {
      alert('Please select an incident first');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/assignments`, {
        unit_id: unitId,
        incident_id: selectedIncident.id,
        assigned_by: 'Fire Chief Thompson',
        role_at_scene: roleAtScene
      });

      loadDashboardStats();
      loadUnits();
      loadIncidentAssignments(selectedIncident.id);
    } catch (error) {
      console.error('Error assigning unit:', error);
      alert('Failed to assign unit');
    }
  };

  const clearUnitAssignment = async (assignmentId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/assignments/${assignmentId}/clear`);

      loadDashboardStats();
      loadUnits();
      if (selectedIncident) {
        loadIncidentAssignments(selectedIncident.id);
      }
    } catch (error) {
      console.error('Error clearing assignment:', error);
    }
  };

  const availableUnits = units.filter(u => u.status === 'available');
  const deployedUnits = units.filter(u => ['en_route', 'on_scene'].includes(u.status));

  // Toggle individual layer
  const toggleLayer = (layerName) => {
    setMapLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Toggle all layers in a category
  const toggleCategory = (category, value) => {
    const updates = {};
    Object.keys(mapLayers).forEach(key => {
      if (layerCategories[category]?.layers.some(l => l.key === key)) {
        updates[key] = value;
      }
    });
    setMapLayers(prev => ({ ...prev, ...updates }));
  };

  // Layer categories for organization
  const layerCategories = {
    environmental: {
      label: '🌪️ Environmental',
      icon: '🌪️',
      layers: [
        { key: 'windConditions', label: 'Wind Conditions', icon: '💨' },
        { key: 'weatherConditions', label: 'Weather Overlay', icon: '☁️' },
        { key: 'smokeLayer', label: 'Smoke Dispersion', icon: '🌫️' },
        { key: 'temperatureMap', label: 'Temperature Map', icon: '🌡️' }
      ]
    },
    population: {
      label: '👥 Population & Civilian',
      icon: '👥',
      layers: [
        { key: 'civilianLocations', label: 'Live Civilian Locations', icon: '📍', critical: true },
        { key: 'censusData', label: 'Census/Population Density', icon: '📊' },
        { key: 'evacuationZones', label: 'Evacuation Zones', icon: '⚠️' },
        { key: 'shelterLocations', label: 'Shelter Locations', icon: '🏠' }
      ]
    },
    fireIntel: {
      label: '🔥 Fire Intelligence',
      icon: '🔥',
      layers: [
        { key: 'civilianFireReports', label: 'Civilian Fire Reports', icon: '📱', critical: true },
        { key: 'firePersonnelReports', label: 'Fire Personnel Reports', icon: '👨‍🚒', critical: true },
        { key: 'firePerimeter', label: 'Fire Perimeter', icon: '🔴' },
        { key: 'predictedSpread', label: 'Predicted Spread', icon: '🔮' },
        { key: 'hotspots', label: 'Thermal Hotspots', icon: '🔥' }
      ]
    },
    obstacles: {
      label: '⚠️ Obstacles & Hazards',
      icon: '⚠️',
      layers: [
        { key: 'downedTrees', label: 'Downed Trees', icon: '🌳', critical: true },
        { key: 'lockedGates', label: 'Locked Gates', icon: '🔒', critical: true },
        { key: 'floodedRoads', label: 'Flooded Roads', icon: '🌊' },
        { key: 'downedPowerLines', label: 'Downed Power Lines', icon: '⚡', critical: true },
        { key: 'gasLeaks', label: 'Gas Leaks', icon: '💨' },
        { key: 'structuralDamage', label: 'Structural Damage', icon: '🏚️' }
      ]
    },
    infrastructure: {
      label: '🏗️ Infrastructure',
      icon: '🏗️',
      layers: [
        { key: 'fireHydrants', label: 'Fire Hydrants', icon: '🚰', critical: true },
        { key: 'waterMains', label: 'Water Mains', icon: '💧' },
        { key: 'powerLines', label: 'Power Lines', icon: '⚡' },
        { key: 'gasLines', label: 'Gas Lines', icon: '🔥' },
        { key: 'cellTowers', label: 'Cell Towers', icon: '📡' },
        { key: 'bridgesOverpasses', label: 'Bridges & Overpasses', icon: '🌉' }
      ]
    },
    resources: {
      label: '🚒 Emergency Resources',
      icon: '🚒',
      layers: [
        { key: 'fireUnits', label: 'Fire Units', icon: '🚒', critical: true },
        { key: 'policeUnits', label: 'Police Units', icon: '🚓', critical: true },
        { key: 'ambulances', label: 'Ambulances', icon: '🚑', critical: true },
        { key: 'helicopters', label: 'Helicopters', icon: '🚁' },
        { key: 'commandVehicles', label: 'Command Vehicles', icon: '📡' }
      ]
    },
    utilities: {
      label: '⚙️ Utility Crews',
      icon: '⚙️',
      layers: [
        { key: 'electricCrews', label: 'Electric Crews', icon: '⚡' },
        { key: 'gasCrews', label: 'Gas Crews', icon: '🔥' },
        { key: 'waterCrews', label: 'Water Crews', icon: '💧' },
        { key: 'telecomCrews', label: 'Telecom Crews', icon: '📡' }
      ]
    },
    routes: {
      label: '🛣️ Routes & Navigation',
      icon: '🛣️',
      layers: [
        { key: 'evacuationRoutes', label: 'Evacuation Routes', icon: '🚨', critical: true },
        { key: 'blockedRoads', label: 'Blocked Roads', icon: '🚧', critical: true },
        { key: 'alternateRoutes', label: 'Alternate Routes', icon: '↪️' },
        { key: 'stageAreas', label: 'Staging Areas', icon: '🅿️' },
        { key: 'safeCorridors', label: 'Safe Corridors', icon: '✅' }
      ]
    },
    medical: {
      label: '🏥 Medical & Safety',
      icon: '🏥',
      layers: [
        { key: 'medicalFacilities', label: 'Medical Facilities', icon: '🏥' },
        { key: 'traumaCenters', label: 'Trauma Centers', icon: '🚁' },
        { key: 'temporaryMedicalStations', label: 'Temporary Medical Stations', icon: '⛑️' },
        { key: 'decontaminationZones', label: 'Decontamination Zones', icon: '🧪' }
      ]
    }
  };

  return (
    <div className="command-dashboard">
      {/* Header */}
      <header className="command-header">
        <div className="command-header-content">
          <h1>🔥 Incident Command Center - Lahaina 2023</h1>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button
              className="communications-btn"
              onClick={() => setShowCommunications(true)}
              title="Communications Center"
            >
              📡 Communications
            </button>
            <div className="user-badge">
              <span className="user-icon">👨‍🚒</span>
              <span className="user-name">Fire Chief Thompson</span>
            </div>
          </div>
        </div>
      </header>

      <div className="command-main">
        {/* Left Panel - Resources */}
        <aside className="command-sidebar left">
          <div className="panel available-panel">
            <h2>
              <span className="panel-icon">✓</span>
              Available Units ({availableUnits.length})
            </h2>
            <div className="units-list">
              {availableUnits.map(unit => (
                <div key={unit.id} className="unit-card available">
                  <div className="unit-header">
                    <span className="unit-icon">{UNIT_TYPES[unit.unit_type]?.icon || '🚨'}</span>
                    <div className="unit-info">
                      <div className="unit-id">{unit.unit_id}</div>
                      <div className="unit-type">{UNIT_TYPES[unit.unit_type]?.label || unit.unit_type}</div>
                    </div>
                  </div>
                  <div className="unit-details">
                    <div className="unit-org">{unit.organization}</div>
                    <div className="unit-crew">Crew: {unit.crew_count}</div>
                  </div>
                  <button
                    className="assign-btn"
                    onClick={() => assignUnitToIncident(unit.id)}
                    disabled={!selectedIncident}
                  >
                    {selectedIncident ? 'Assign to Selected' : 'Select Incident First'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel deployed-panel">
            <h2>
              <span className="panel-icon">🚨</span>
              Deployed Units ({deployedUnits.length})
            </h2>
            <div className="units-list">
              {deployedUnits.map(unit => (
                <div key={unit.id} className="unit-card deployed">
                  <div className="unit-header">
                    <span className="unit-icon">{UNIT_TYPES[unit.unit_type]?.icon || '🚨'}</span>
                    <div className="unit-info">
                      <div className="unit-id">{unit.unit_id}</div>
                      <div className="unit-type">{UNIT_TYPES[unit.unit_type]?.label || unit.unit_type}</div>
                    </div>
                  </div>
                  <div className="unit-details">
                    <div
                      className="unit-status"
                      style={{color: STATUS_COLORS[unit.status]}}
                    >
                      {unit.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="unit-crew">Crew: {unit.crew_count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center - Map */}
        <div className="command-map-container">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Incident markers */}
            {incidents.map(incident => (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
              >
                <Popup>
                  <strong>{incident.name}</strong><br />
                  Type: {incident.incident_type}<br />
                  Severity: {incident.severity}/5<br />
                  Status: {incident.status}
                </Popup>
              </Marker>
            ))}

            {/* Unit markers */}
            {units.filter(u => u.latitude && u.longitude).map(unit => (
              <Marker
                key={unit.id}
                position={[unit.latitude, unit.longitude]}
              >
                <Popup>
                  <strong>{unit.unit_id}</strong><br />
                  Type: {UNIT_TYPES[unit.unit_type]?.label}<br />
                  Status: {unit.status}<br />
                  Crew: {unit.crew_count}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Layer Control Button */}
          <button
            className="layer-control-btn"
            onClick={() => setShowLayerControl(!showLayerControl)}
            title="Map Layers"
          >
            <span className="layer-icon">🗺️</span>
            <span className="layer-text">Layers</span>
          </button>

          {/* Layer Control Panel */}
          {showLayerControl && (
            <div className="layer-control-panel">
              <div className="layer-control-header">
                <h3>🗺️ Map Layers</h3>
                <button
                  className="close-layer-btn"
                  onClick={() => setShowLayerControl(false)}
                >
                  ×
                </button>
              </div>

              <div className="layer-control-body">
                {Object.entries(layerCategories).map(([categoryKey, category]) => {
                  const activeLayers = category.layers.filter(l => mapLayers[l.key]).length;
                  const totalLayers = category.layers.length;

                  return (
                    <div key={categoryKey} className="layer-category">
                      <div className="category-header">
                        <span className="category-label">
                          {category.icon} {category.label}
                        </span>
                        <div className="category-actions">
                          <span className="layer-count">{activeLayers}/{totalLayers}</span>
                          <button
                            className="category-toggle"
                            onClick={() => toggleCategory(categoryKey, activeLayers < totalLayers)}
                            title={activeLayers < totalLayers ? "Show All" : "Hide All"}
                          >
                            {activeLayers < totalLayers ? '☑' : '☐'}
                          </button>
                        </div>
                      </div>

                      <div className="category-layers">
                        {category.layers.map(layer => (
                          <div
                            key={layer.key}
                            className={`layer-item ${mapLayers[layer.key] ? 'active' : ''} ${layer.critical ? 'critical' : ''}`}
                          >
                            <label className="layer-checkbox">
                              <input
                                type="checkbox"
                                checked={mapLayers[layer.key]}
                                onChange={() => toggleLayer(layer.key)}
                              />
                              <span className="layer-icon">{layer.icon}</span>
                              <span className="layer-label">
                                {layer.label}
                                {layer.critical && <span className="critical-badge">!</span>}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="layer-control-footer">
                <div className="footer-info">
                  <span className="critical-indicator">!</span>
                  <span className="footer-text">Critical layers for emergency response</span>
                </div>
                <div className="layer-stats">
                  {Object.values(mapLayers).filter(v => v).length} of {Object.keys(mapLayers).length} layers active
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Incident Details */}
        <aside className="command-sidebar right">
          <div className="panel incidents-panel">
            <h2>
              <span className="panel-icon">🔥</span>
              Active Incidents
            </h2>
            <div className="incidents-list">
              {incidents.filter(i => i.status === 'active').map(incident => (
                <div
                  key={incident.id}
                  className={`incident-card ${selectedIncident?.id === incident.id ? 'selected' : ''}`}
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div className="incident-name">{incident.name}</div>
                  <div className="incident-type">{incident.incident_type}</div>
                  <div className={`severity-badge severity-${incident.severity}`}>
                    Severity {incident.severity}/5
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedIncident && (
            <>
              <div className="panel assigned-units-panel">
                <h2>
                  <span className="panel-icon">📍</span>
                  Units at Scene
                </h2>
                <div className="assigned-units-list">
                  {assignedUnits.map(assignment => (
                    <div key={assignment.id} className="assigned-unit-card">
                      <div className="assigned-unit-header">
                        <span className="unit-icon">
                          {UNIT_TYPES[assignment.unit?.unit_type]?.icon || '🚨'}
                        </span>
                        <div className="assigned-unit-info">
                          <div className="unit-id">{assignment.unit?.unit_id}</div>
                          <div className="unit-role">{assignment.role_at_scene || 'Support'}</div>
                        </div>
                      </div>
                      <button
                        className="clear-btn"
                        onClick={() => clearUnitAssignment(assignment.id)}
                      >
                        Clear
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel activity-panel">
                <h2>
                  <span className="panel-icon">📋</span>
                  Activity Log
                </h2>
                <div className="activity-log">
                  {activityLog.map(log => (
                    <div key={log.id} className={`activity-item severity-${log.severity}`}>
                      <div className="activity-time">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="activity-description">{log.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Communications Modal */}
      {showCommunications && (
        <Communications
          incidentId={selectedIncident?.id}
          onClose={() => setShowCommunications(false)}
        />
      )}
    </div>
  );
}

export default CommandDashboard;
