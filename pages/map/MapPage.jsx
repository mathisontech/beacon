// ============================================================================
// MAP/GPS PAGE - Primary navigation interface with hazard tagging
// ============================================================================

import React, { useState, useEffect, useRef } from 'react'
import InteractiveOSMMap from '../../shared_util/components/map/InteractiveOSMMap'
import { useWeatherAlerts } from '../../shared_util/hooks/useWeatherAlerts'

const TAG_TYPES = [
  { id: 'fire', label: 'Fire', icon: '🔥', color: '#dc2626' },
  { id: 'road_blockage', label: 'Road Blockage', icon: '🚧', color: '#f59e0b' },
  { id: 'power_line', label: 'Downed Power Line', icon: '⚡', color: '#eab308' },
  { id: 'neighbor_help', label: 'Neighbor Needs Help', icon: '🆘', color: '#ef4444' },
  { id: 'tornado', label: 'Tornado', icon: '🌪️', color: '#7c3aed' },
  { id: 'food', label: 'Food Available', icon: '🍽️', color: '#10b981' },
  { id: 'shelter', label: 'Shelter Available', icon: '🏠', color: '#3b82f6' },
  { id: 'transport', label: 'Can Drive You', icon: '🚗', color: '#06b6d4' }
]

function MapPage({ user }) {
  const [userLocation, setUserLocation] = useState(null)
  const [destination, setDestination] = useState('')
  const [mapView, setMapView] = useState('standard') // 'standard', 'satellite', 'terrain'
  const [showTagMenu, setShowTagMenu] = useState(false)
  const [tags, setTags] = useState([]) // User-created tags/pins
  const [isPlacingTag, setIsPlacingTag] = useState(false)
  const [selectedTagType, setSelectedTagType] = useState(null)
  const mapRef = useRef(null)

  const { alerts: weatherAlerts } = useWeatherAlerts(userLocation, {
    autoStart: true,
    enablePolling: true
  })

  // Initialize location tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      (error) => {
        console.error('Location error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const handleDropTag = (tagType) => {
    setSelectedTagType(tagType)
    setIsPlacingTag(true)
    setShowTagMenu(false)
    // User will click on map to place the tag
  }

  const handleMapClick = (coords) => {
    if (isPlacingTag && selectedTagType) {
      const newTag = {
        id: Date.now(),
        type: selectedTagType.id,
        label: selectedTagType.label,
        icon: selectedTagType.icon,
        color: selectedTagType.color,
        latitude: coords.lat,
        longitude: coords.lng,
        createdBy: user?.username || 'Anonymous',
        timestamp: Date.now()
      }

      setTags([...tags, newTag])
      setIsPlacingTag(false)
      setSelectedTagType(null)
    }
  }

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      // This will be passed to the map component to trigger re-centering
      mapRef.current.centerOnUser()
    }
  }

  const handleNavigateToAddress = () => {
    if (!destination.trim()) {
      alert('Please enter a destination address')
      return
    }

    // TODO: Implement geocoding and routing
    console.log('Navigate to:', destination)
    alert(`Navigation to "${destination}" will be implemented soon`)
  }

  return (
    <div className="map-page">
      {/* Address Input Bar */}
      <div className="address-bar">
        <input
          type="text"
          className="address-input"
          placeholder="Enter destination address..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleNavigateToAddress()}
        />
        <button className="navigate-btn" onClick={handleNavigateToAddress}>
          Navigate
        </button>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <InteractiveOSMMap
          ref={mapRef}
          userLocation={userLocation}
          onLocationUpdate={setUserLocation}
          weatherAlerts={weatherAlerts}
          tags={tags}
          onMapClick={handleMapClick}
          isPlacingTag={isPlacingTag}
          className="main-map"
        />
      </div>

      {/* Floating Action Buttons */}
      <div className="map-controls">
        {/* Center on User Location */}
        <button
          className="map-btn center-btn"
          onClick={handleCenterOnUser}
          title="Center on my location"
        >
          📍
        </button>

        {/* Drop Pin/Tag Button */}
        <button
          className={`map-btn drop-tag-btn ${showTagMenu ? 'active' : ''}`}
          onClick={() => setShowTagMenu(!showTagMenu)}
          title="Drop a tag"
        >
          📌
        </button>

        {/* Map View Toggle */}
        <button
          className="map-btn view-btn"
          onClick={() => {
            const views = ['standard', 'satellite', 'terrain']
            const currentIndex = views.indexOf(mapView)
            const nextView = views[(currentIndex + 1) % views.length]
            setMapView(nextView)
          }}
          title={`Map view: ${mapView}`}
        >
          🗺️
        </button>
      </div>

      {/* Tag Selection Menu */}
      {showTagMenu && (
        <div className="tag-menu">
          <div className="tag-menu-header">
            <h3>Select Tag Type</h3>
            <button
              className="close-btn"
              onClick={() => setShowTagMenu(false)}
            >
              ✕
            </button>
          </div>
          <div className="tag-options">
            {TAG_TYPES.map(tagType => (
              <button
                key={tagType.id}
                className="tag-option"
                style={{ borderLeftColor: tagType.color }}
                onClick={() => handleDropTag(tagType)}
              >
                <span className="tag-icon">{tagType.icon}</span>
                <span className="tag-label">{tagType.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Placing Tag Indicator */}
      {isPlacingTag && selectedTagType && (
        <div className="placing-tag-banner">
          <span className="banner-icon">{selectedTagType.icon}</span>
          <span className="banner-text">
            Click on the map to place "{selectedTagType.label}"
          </span>
          <button
            className="cancel-btn"
            onClick={() => {
              setIsPlacingTag(false)
              setSelectedTagType(null)
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Location Status */}
      {userLocation && (
        <div className="location-status">
          <span className="status-dot active"></span>
          <span className="status-text">
            GPS: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  )
}

export default MapPage