// ============================================================================
// LOCATION PERMISSION - Handle user location access for emergency services
// ============================================================================

import React, { useState } from 'react'

function LocationPermission({ onGranted, onDenied, permissionState }) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState('')

  const requestLocation = async () => {
    setIsRequesting(true)
    setError('')

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      })

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      }

      onGranted(locationData)
    } catch (error) {
      console.error('Geolocation error:', error)
      let errorMessage = 'Unable to access your location. '
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Location access was denied. Please enable location services for emergency features.'
          onDenied()
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable.'
          break
        case error.TIMEOUT:
          errorMessage += 'Location request timed out. Please try again.'
          break
        default:
          errorMessage += 'An unknown error occurred.'
          break
      }
      
      setError(errorMessage)
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="location-permission-container">
      <div className="emergency-location-notice">
        <h2>🚨 Emergency Location Access Required</h2>
        <p>
          Beacon needs your location to provide life-saving emergency navigation and 
          weather alerts in your area.
        </p>
        
        <div className="location-benefits">
          <h3>Location enables:</h3>
          <ul>
            <li>🌪️ Real-time tornado and severe weather alerts</li>
            <li>🌊 Flash flood warnings and safe route planning</li>
            <li>🚗 Emergency evacuation route guidance</li>
            <li>📍 Precise location sharing with emergency services</li>
          </ul>
        </div>

        {permissionState === 'denied' && (
          <div className="permission-denied-notice">
            <p className="error-text">
              ⚠️ Location access is currently blocked. To enable emergency features:
            </p>
            <ol>
              <li>Click the location icon in your browser's address bar</li>
              <li>Select "Allow" for location access</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        {error && (
          <div className="location-error">
            <p className="error-text">{error}</p>
          </div>
        )}

        <div className="location-actions">
          <button
            onClick={requestLocation}
            disabled={isRequesting || permissionState === 'denied'}
            className="enable-location-btn"
          >
            {isRequesting ? 'Getting Location...' : '📍 Enable Emergency Location'}
          </button>
          
          <p className="privacy-notice">
            Your location is only used for emergency services and is never shared or stored permanently.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LocationPermission