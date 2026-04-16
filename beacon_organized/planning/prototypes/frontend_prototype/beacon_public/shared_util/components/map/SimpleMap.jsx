// ============================================================================
// SIMPLE MAP - Lightweight GPS component without heavy location features
// ============================================================================

import React, { useState } from 'react'
import './OSMMap.css'

function SimpleMap({
  userLocation,
  onLocationUpdate,
  emergencyMode = false,
  weatherAlerts = [],
  className = ""
}) {
  const [locationRequested, setLocationRequested] = useState(false)

  const requestLocation = () => {
    setLocationRequested(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          }
          onLocationUpdate?.(newLocation)
        },
        (error) => {
          console.error('Location error:', error)
          alert('Location access denied or unavailable')
        },
        { timeout: 10000 }
      )
    }
  }

  return (
    <div className={`osm-map-container ${className} ${emergencyMode ? 'emergency-mode' : ''}`}>
      <div className="map-placeholder-content">
        <div className="placeholder-map">
          <div className="placeholder-header">
            <h2>🗺️ Beacon GPS Navigator</h2>
            <p>Lightweight GPS tracking ready</p>
          </div>

          {!userLocation && !locationRequested && (
            <div className="location-request">
              <button
                onClick={requestLocation}
                style={{
                  padding: '16px 32px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                📍 Get My Location
              </button>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Click to get your GPS coordinates
              </p>
            </div>
          )}

          {locationRequested && !userLocation && (
            <div className="loading-location">
              <div className="loading-spinner"></div>
              <p>Getting your location...</p>
            </div>
          )}

          {userLocation && (
            <div className="location-info">
              <h3>📍 Current Location</h3>
              <div className="coordinates">
                <span>Latitude: {userLocation.latitude.toFixed(6)}</span>
                <span>Longitude: {userLocation.longitude.toFixed(6)}</span>
                <span>Accuracy: ±{userLocation.accuracy?.toFixed(0)}m</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  Updated: {new Date(userLocation.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={requestLocation}
                style={{
                  padding: '8px 16px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '12px'
                }}
              >
                🔄 Refresh Location
              </button>
            </div>
          )}

          {weatherAlerts?.length > 0 && (
            <div className="alerts-info">
              <h3>⚠️ Weather Alerts</h3>
              <p>{weatherAlerts.length} active alert{weatherAlerts.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          <div className="app-status">
            <h3>✅ GPS Ready</h3>
            <p>Basic location tracking active. OpenStreetMap integration available for full mapping features.</p>
          </div>
        </div>
      </div>

      {emergencyMode && (
        <div className="emergency-overlay">
          <div className="emergency-status">
            <span className="emergency-indicator">🚨</span>
            <span>EMERGENCY MODE</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleMap