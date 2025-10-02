// ============================================================================
// EMERGENCY MAP - Main map interface for disaster avoidance navigation
// ============================================================================

import React, { useState, useEffect } from 'react'
import LocationPermission from '../../shared_util/components/location/LocationPermission'
import AlertBanner from '../../shared_util/components/alerts/AlertBanner'
import InteractiveOSMMap from '../../shared_util/components/map/InteractiveOSMMap'
import { useWeatherAlerts } from '../../shared_util/hooks/useWeatherAlerts'

function EmergencyMap({ user }) {
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState('prompt') // 'granted', 'denied', 'prompt'
  const [isEmergency, setIsEmergency] = useState(false)

  // Weather alerts integration
  const {
    alerts: weatherAlerts,
    conditions,
    loading: weatherLoading,
    error: weatherError,
    lastUpdated,
    pollMode,
    connectionStatus,
    hasCriticalAlerts,
    hasEvacuationRecommendation,
    getMostUrgentAlert,
    formatTimeToImpact,
    refreshAlerts
  } = useWeatherAlerts(userLocation, {
    autoStart: true,
    enablePolling: true,
    onCriticalAlert: (criticalAlerts) => {
      // Activate emergency mode for critical alerts
      console.warn('CRITICAL WEATHER ALERT:', criticalAlerts)
      setIsEmergency(true)
      
      // Could trigger browser notification here
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 CRITICAL WEATHER ALERT', {
          body: criticalAlerts[0]?.title || 'Immediate action required',
          icon: '/beacon_logo.png',
          tag: 'critical-weather'
        })
      }
    },
    onAlertChange: (newAlerts, oldAlerts) => {
      // Log alert changes for debugging
      console.log('Weather alerts updated:', { new: newAlerts.length, old: oldAlerts?.length || 0 })
    }
  })

  useEffect(() => {
    checkLocationPermission()
    
    // Request notification permission for emergency alerts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Monitor for emergency conditions
  useEffect(() => {
    const criticalCount = weatherAlerts?.filter(alert => alert.threatLevel === 'critical').length || 0
    const severeCount = weatherAlerts?.filter(alert => alert.threatLevel === 'severe').length || 0
    
    // Auto-enable emergency mode for critical alerts or multiple severe alerts
    const shouldActivateEmergency = criticalCount > 0 || severeCount >= 2
    
    if (shouldActivateEmergency !== isEmergency) {
      setIsEmergency(shouldActivateEmergency)
    }
  }, [weatherAlerts, isEmergency])

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied')
      return
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(permission.state)
    } catch (error) {
      console.error('Error checking location permission:', error)
      setLocationPermission('prompt')
    }
  }

  const handleLocationPermissionGranted = (location) => {
    setUserLocation(location)
    setLocationPermission('granted')
  }

  const handleLocationUpdate = (newLocation) => {
    setUserLocation(newLocation)
  }

  const handleLocationPermissionDenied = () => {
    setLocationPermission('denied')
  }

  // Emergency mode UI
  if (isEmergency) {
    return (
      <div className="emergency-mode">
        <AlertBanner
          alerts={weatherAlerts}
          severity="critical"
        />
        <div className="emergency-actions">
          <h1>🚨 EMERGENCY MODE ACTIVE</h1>
          <p>Monitoring for immediate threats...</p>
        </div>
        <div className="emergency-map">
          <InteractiveOSMMap
            userLocation={userLocation}
            onLocationUpdate={handleLocationUpdate}
            emergencyMode={true}
            weatherAlerts={weatherAlerts}
            className="emergency-map-container"
            showAccuracyCircle={true}
          />
        </div>
      </div>
    )
  }

  // Location permission not granted
  if (locationPermission !== 'granted') {
    return (
      <div className="beacon-map-container">
        <div className="location-setup">
          <LocationPermission
            onGranted={handleLocationPermissionGranted}
            onDenied={handleLocationPermissionDenied}
            permissionState={locationPermission}
          />
        </div>
      </div>
    )
  }

  // Main map interface with OpenStreetMap
  return (
    <div className="beacon-map-container">
      <div className="alerts-overlay">
        {weatherAlerts?.length > 0 && (
          <AlertBanner alerts={weatherAlerts} />
        )}
      </div>

      <div className="map-content">
        <InteractiveOSMMap
          userLocation={userLocation}
          onLocationUpdate={handleLocationUpdate}
          emergencyMode={isEmergency}
          weatherAlerts={weatherAlerts}
          className="main-map-container"
          showAccuracyCircle={true}
          enableLocationSearch={true}
        />

        {/* Weather status sidebar */}
        <div className="weather-status-sidebar">
          <div className="status-header">
            <h4>🌤️ Weather Status</h4>
            <span className={`connection-indicator ${connectionStatus}`}>
              {connectionStatus === 'connected' ? '🟢' :
               connectionStatus === 'connecting' ? '🟡' : '🔴'}
            </span>
          </div>

          <div className="status-grid">
            <div className="status-item">
              <span className="label">Alerts:</span>
              <span className="value">{weatherAlerts?.length || 0}</span>
            </div>
            <div className="status-item">
              <span className="label">Mode:</span>
              <span className="value">{pollMode}</span>
            </div>
            <div className="status-item">
              <span className="label">Updated:</span>
              <span className="value">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>

          {weatherError && (
            <div className="error-message">
              ⚠️ {weatherError}
            </div>
          )}

          {weatherAlerts?.length > 0 && (
            <div className="urgent-alert">
              <strong>Most Urgent:</strong>
              <span>{getMostUrgentAlert()?.title || 'None'}</span>
            </div>
          )}

          <button
            onClick={refreshAlerts}
            className={`refresh-btn ${weatherLoading ? 'loading' : ''}`}
            disabled={weatherLoading}
          >
            {weatherLoading ? '⏳ Refreshing...' : '🔄 Refresh Weather'}
          </button>

          <div className="development-notice">
            <h4>📍 GPS Navigation</h4>
            <p className="location-display">
              {userLocation ?
                `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}` :
                'Acquiring location...'}
            </p>
            <div className="feature-status">
              <div className="feature-item completed">✅ OpenStreetMap Integration</div>
              <div className="feature-item completed">✅ Real-time GPS Tracking</div>
              <div className="feature-item completed">✅ Weather Alert Mapping</div>
              <div className="feature-item pending">🚧 Route Planning</div>
              <div className="feature-item pending">🚧 Disaster Avoidance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyMap