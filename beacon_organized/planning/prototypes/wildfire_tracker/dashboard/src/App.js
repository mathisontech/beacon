import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Popup, CircleMarker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

// Incident type configurations
const INCIDENT_TYPES = {
  fire: {
    name: 'Fire',
    icon: '🔥',
    color: '#d32f2f',
    description: 'Wildfire, structure fire, or brush fire'
  },
  flood: {
    name: 'Flood',
    icon: '🌊',
    color: '#1976d2',
    description: 'Flash flood, river overflow, or standing water'
  },
  traffic: {
    name: 'Traffic Jam',
    icon: '🚗',
    color: '#f57c00',
    description: 'Major traffic congestion or gridlock'
  },
  barrier: {
    name: 'Road Barrier',
    icon: '🚧',
    color: '#fbc02d',
    description: 'Road closure, checkpoint, or blocked route'
  },
  medical: {
    name: 'Medical Emergency',
    icon: '🚑',
    color: '#c62828',
    description: 'Mass casualty or medical emergency'
  },
  hazmat: {
    name: 'Hazmat',
    icon: '☣️',
    color: '#6a1b9a',
    description: 'Hazardous materials incident or chemical spill'
  },
  other: {
    name: 'Other Emergency',
    icon: '⚠️',
    color: '#757575',
    description: 'Other emergency situation'
  }
};

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [reports, setReports] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [ws, setWs] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.8783, -156.6825]); // Default: Lahaina, Maui
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [selectedIncidentType, setSelectedIncidentType] = useState('fire');
  const [createMode, setCreateMode] = useState(true); // Always in create mode

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000/ws');

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'new_incident' || message.type === 'new_report') {
        // Refresh data
        loadIncidents();
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  // Load all incidents
  const loadIncidents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/incidents`);
      setIncidents(response.data);
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  // Load incident details
  const loadIncidentDetail = async (incidentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/incidents/${incidentId}`);
      setSelectedIncident(response.data);
      setReports(response.data.reports || []);

      if (response.data.latest_prediction) {
        setPredictions([response.data.latest_prediction]);
      }

      // Center map on incident
      setMapCenter([response.data.latitude, response.data.longitude]);
    } catch (error) {
      console.error('Error loading incident detail:', error);
    }
  };

  // Generate new prediction
  const generatePrediction = async (incidentId, hours) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/predictions`, {
        incident_id: incidentId,
        hours_ahead: hours
      });

      // Reload incident to get updated prediction
      loadIncidentDetail(incidentId);
    } catch (error) {
      console.error('Error generating prediction:', error);
    }
  };

  // Handle map click
  const handleMapClick = (latlng) => {
    setClickedLocation(latlng);
    setShowCreateModal(true);
  };

  // Create new incident
  const createIncident = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await axios.post(`${API_BASE_URL}/api/incidents`, {
        name: formData.get('name'),
        latitude: parseFloat(formData.get('latitude')),
        longitude: parseFloat(formData.get('longitude')),
        severity: parseInt(formData.get('severity'))
      });

      loadIncidents();
      e.target.reset();
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  // Create incident from map click
  const createIncidentFromMap = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await axios.post(`${API_BASE_URL}/api/incidents`, {
        name: formData.get('name'),
        incident_type: selectedIncidentType,
        latitude: clickedLocation.lat,
        longitude: clickedLocation.lng,
        severity: parseInt(formData.get('severity')),
        description: formData.get('description') || null
      });

      loadIncidents();
      setShowCreateModal(false);
      setClickedLocation(null);
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <h1>🚨 Emergency Management Dashboard</h1>
          {createMode && (
            <div className="mode-indicator">
              <span className="mode-icon" style={{background: INCIDENT_TYPES[selectedIncidentType].color}}>
                {INCIDENT_TYPES[selectedIncidentType].icon}
              </span>
              <span className="mode-text">
                Click map to create: <strong>{INCIDENT_TYPES[selectedIncidentType].name}</strong>
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="section">
            <h2>Incident Type</h2>
            <div className="incident-type-selector">
              {Object.entries(INCIDENT_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  className={`type-button ${selectedIncidentType === type ? 'active' : ''}`}
                  onClick={() => setSelectedIncidentType(type)}
                  style={{
                    borderColor: selectedIncidentType === type ? config.color : '#ddd',
                    background: selectedIncidentType === type ? config.color : 'white',
                    color: selectedIncidentType === type ? 'white' : '#333'
                  }}
                >
                  <span className="type-icon">{config.icon}</span>
                  <span className="type-name">{config.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Active Incidents</h2>
            <div className="incidents-list">
              {incidents.map(incident => {
                const incidentConfig = INCIDENT_TYPES[incident.incident_type] || INCIDENT_TYPES.other;
                return (
                  <div
                    key={incident.id}
                    className={`incident-card ${selectedIncident?.id === incident.id ? 'selected' : ''}`}
                    onClick={() => loadIncidentDetail(incident.id)}
                    style={{borderLeftColor: incidentConfig.color, borderLeftWidth: '4px'}}
                  >
                    <div className="incident-header">
                      <span className="incident-type-badge" style={{background: incidentConfig.color}}>
                        {incidentConfig.icon}
                      </span>
                      <h3>{incident.name}</h3>
                    </div>
                    <p className={`status-${incident.status}`}>{incident.status.toUpperCase()}</p>
                    <p>Severity: {incident.severity}/5</p>
                    {incident.area_hectares > 0 && <p>Area: {incident.area_hectares.toFixed(1)} ha</p>}
                    <p className="timestamp">{new Date(incident.start_time).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section">
            <h2>Create New Incident</h2>
            <p className="hint">💡 Tip: Click anywhere on the map to create an incident at that location</p>
            <form onSubmit={createIncident} className="form">
              <input name="name" placeholder="Fire Name" required />
              <input name="latitude" type="number" step="0.0001" placeholder="Latitude" required />
              <input name="longitude" type="number" step="0.0001" placeholder="Longitude" required />
              <input name="severity" type="number" min="1" max="5" placeholder="Severity (1-5)" required />
              <button type="submit">Create Incident</button>
            </form>
          </div>

          {selectedIncident && (
            <div className="section">
              <h2>Generate Prediction</h2>
              <div className="prediction-controls">
                <button onClick={() => generatePrediction(selectedIncident.id, 6)}>6 Hours</button>
                <button onClick={() => generatePrediction(selectedIncident.id, 12)}>12 Hours</button>
                <button onClick={() => generatePrediction(selectedIncident.id, 24)}>24 Hours</button>
                <button onClick={() => generatePrediction(selectedIncident.id, 48)}>48 Hours</button>
              </div>
            </div>
          )}

          {selectedIncident && (
            <div className="section">
              <h2>Incident Details</h2>
              <div className="details">
                <p><strong>Name:</strong> {selectedIncident.name}</p>
                <p><strong>Status:</strong> {selectedIncident.status}</p>
                <p><strong>Public Reports:</strong> {reports.length}</p>
                <p><strong>Verified Reports:</strong> {reports.filter(r => r.verified).length}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Map */}
        <main className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Map Click Handler */}
            <MapClickHandler onMapClick={handleMapClick} />

            {/* Fire Incidents */}
            {incidents.map(incident => (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
              >
                <Popup>
                  <strong>{incident.name}</strong><br />
                  Status: {incident.status}<br />
                  Severity: {incident.severity}/5
                </Popup>
              </Marker>
            ))}

            {/* Public Reports */}
            {reports.map(report => (
              <CircleMarker
                key={report.id}
                center={[report.latitude, report.longitude]}
                radius={5}
                color={report.verified ? 'green' : 'orange'}
                fillOpacity={0.7}
              >
                <Popup>
                  <strong>Public Report</strong><br />
                  {report.verified ? 'Verified' : 'Unverified'}<br />
                  Confidence: {(report.confidence_score * 100).toFixed(0)}%<br />
                  {report.description && `Note: ${report.description}`}
                </Popup>
              </CircleMarker>
            ))}

            {/* Predictions */}
            {predictions.map((pred, idx) => {
              if (pred.spread_polygon && pred.spread_polygon.coordinates) {
                // Convert GeoJSON coordinates to Leaflet format [lat, lon]
                const positions = pred.spread_polygon.coordinates[0].map(coord => [coord[1], coord[0]]);

                return (
                  <Polygon
                    key={idx}
                    positions={positions}
                    color="red"
                    fillOpacity={0.2}
                  >
                    <Popup>
                      <strong>Spread Prediction</strong><br />
                      Confidence: {(pred.confidence * 100).toFixed(0)}%<br />
                      Forecast: {new Date(pred.forecast_time).toLocaleString()}
                    </Popup>
                  </Polygon>
                );
              }
              return null;
            })}
          </MapContainer>
        </main>
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && clickedLocation && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{borderBottomColor: INCIDENT_TYPES[selectedIncidentType].color}}>
              <div className="modal-title">
                <span className="modal-type-icon" style={{background: INCIDENT_TYPES[selectedIncidentType].color}}>
                  {INCIDENT_TYPES[selectedIncidentType].icon}
                </span>
                <h2>Create {INCIDENT_TYPES[selectedIncidentType].name}</h2>
              </div>
              <button className="close-button" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="location-info">
                📍 Location: {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
              </p>
              <form onSubmit={createIncidentFromMap} className="form">
                <input
                  name="name"
                  placeholder={`Incident Name (e.g., ${selectedIncidentType === 'fire' ? 'Lahaina Fire' : selectedIncidentType === 'flood' ? 'Front St Flood' : selectedIncidentType === 'traffic' ? 'Highway 30 Jam' : selectedIncidentType === 'barrier' ? 'Main St Closure' : 'Emergency Site'})`}
                  required
                  autoFocus
                />
                <select name="severity" required>
                  <option value="">Select Severity</option>
                  <option value="1">1 - Minor</option>
                  <option value="2">2 - Moderate</option>
                  <option value="3">3 - Serious</option>
                  <option value="4">4 - Severe</option>
                  <option value="5">5 - Extreme</option>
                </select>
                <textarea
                  name="description"
                  placeholder="Description (optional)"
                  rows="3"
                ></textarea>
                <div className="modal-buttons">
                  <button type="button" className="cancel-button" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    style={{background: INCIDENT_TYPES[selectedIncidentType].color}}
                  >
                    Create {INCIDENT_TYPES[selectedIncidentType].name}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
