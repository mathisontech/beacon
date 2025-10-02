// ============================================================================
// OSM MAP COMPONENT - Temporary placeholder while setting up imports
// ============================================================================

import React, { useState, useEffect } from 'react'
import './OSMMap.css'

function OSMMap({
  userLocation,
  onLocationUpdate,
  emergencyMode = false,
  weatherAlerts = [],
  className = ""
}) {
  const [isLoading, setIsLoading] = useState(true)

  // Handle location updates
  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLoading(false)
      return
    }

    // Get initial position quickly with lower accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        }
        onLocationUpdate?.(newLocation)
        setIsLoading(false)
      },
      (error) => {
        console.error('Initial geolocation error:', error)
        // Still try to watch for position even if initial fails
      },
      {
        enableHighAccuracy: false, // Start with coarse location for speed
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    )

    // Then watch for more accurate updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        }
        onLocationUpdate?.(newLocation)
        setIsLoading(false)
      },
      (error) => {
        console.error('Geolocation watch error:', error)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Longer timeout for accurate position
        maximumAge: 60000
      }
    )

    // Stop loading after reasonable time even without location
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 8000)

    return () => {
      navigator.geolocation.clearWatch(watchId)
      clearTimeout(loadingTimeout)
    }
  }, [onLocationUpdate])

  if (!userLocation) {
    return (
      <div className={`osm-map-loading ${className}`}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Getting GPS location...</p>
          <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
            Allow location access when prompted
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh if stuck
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`osm-map-container ${className} ${emergencyMode ? 'emergency-mode' : ''}`}>
      {isLoading && (
        <div className="map-loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading GPS map...</p>
        </div>
      )}

      {/* Placeholder map - will be replaced with real OSM integration */}
      <div className="map-placeholder-content">
        <div className="placeholder-map">
          <div className="placeholder-header">
            <h2>🗺️ GPS Navigation Ready</h2>
            <p>OpenStreetMap integration coming up...</p>
          </div>

          <div className="location-info">
            <h3>📍 Current Location</h3>
            <div className="coordinates">
              <span>Latitude: {userLocation.latitude.toFixed(6)}</span>
              <span>Longitude: {userLocation.longitude.toFixed(6)}</span>
              <span>Accuracy: ±{userLocation.accuracy?.toFixed(0)}m</span>
            </div>
          </div>

          {weatherAlerts?.length > 0 && (
            <div className="alerts-info">
              <h3>⚠️ Weather Alerts</h3>
              <p>{weatherAlerts.length} active alert{weatherAlerts.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          <div className="next-steps">
            <h3>🚧 Setting up full map...</h3>
            <p>Real interactive OpenStreetMap with markers, routing, and navigation will be added next.</p>
          </div>
        </div>
      </div>

      {/* Emergency mode overlay */}
      {emergencyMode && (
        <div className="emergency-overlay">
          <div className="emergency-status">
            <span className="emergency-indicator">🚨</span>
            <span>EMERGENCY MODE</span>
          </div>
        </div>
      )}

      {/* Map info overlay */}
      <div className="map-info-overlay">
        <div className="map-stats">
          <span>📍 GPS: {userLocation?.accuracy ? `±${userLocation.accuracy.toFixed(0)}m` : 'No fix'}</span>
          <span>🗺️ OpenStreetMap Ready</span>
          {weatherAlerts?.length > 0 && (
            <span>⚠️ {weatherAlerts.length} Alert{weatherAlerts.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default OSMMap