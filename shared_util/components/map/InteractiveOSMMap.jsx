// ============================================================================
// INTERACTIVE OSM MAP - Full OpenStreetMap integration with Leaflet
// ============================================================================

import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './InteractiveOSMMap.css'
import RouteOverlay from './RouteOverlay.jsx'
import ZipCodeService from '../../services/geocoding/ZipCodeService.js'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom GPS location icon
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#2563eb" stroke-width="3"/>
      <circle cx="12" cy="12" r="5" fill="#2563eb"/>
      <circle cx="12" cy="12" r="2" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// Emergency alert icon
const emergencyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="36" height="36">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
})

// Component to handle map events and updates
function MapController({ userLocation, onLocationUpdate, onMapClick, emergencyMode, onMapReady, disableAutoCenter }) {
  const map = useMap()

  // Set map instance when component mounts
  useEffect(() => {
    if (map && onMapReady) {
      console.log('MapController: Map instance ready')
      onMapReady(map)
    }
  }, [map]) // Remove onMapReady from deps to prevent double initialization

  // Auto-center on user location (only if not disabled)
  useEffect(() => {
    if (userLocation && map && !disableAutoCenter) {
      console.log('Auto-centering on user location (auto-center enabled)')
      map.setView([userLocation.latitude, userLocation.longitude], map.getZoom())
    } else if (disableAutoCenter) {
      console.log('Auto-centering disabled - not moving to user location')
    }
  }, [userLocation, map, disableAutoCenter])

  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng)
      }
    },
    locationfound: (e) => {
      if (onLocationUpdate) {
        onLocationUpdate({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          accuracy: e.accuracy,
          timestamp: Date.now()
        })
      }
    }
  })

  return null
}

function InteractiveOSMMap({
  userLocation,
  onLocationUpdate,
  emergencyMode = false,
  weatherAlerts = [],
  className = "",
  showAccuracyCircle = true,
  enableLocationSearch = true,
  route = null,
  destination = null
}) {
  const [mapInstance, setMapInstance] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [emergencyMarkers, setEmergencyMarkers] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [disableAutoCenter, setDisableAutoCenter] = useState(true)
  const mapRef = useRef()
  const zipCodeService = useRef(new ZipCodeService())

  // Default center (San Francisco if no location)
  const defaultCenter = [37.7749, -122.4194]
  const mapCenter = userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter
  const initialZoom = userLocation ? 15 : 10

  // Known places database for quick searches
  const knownPlaces = {
    'times square': { lat: 40.758, lng: -73.986, name: 'Times Square, NYC' },
    'central park': { lat: 40.785, lng: -73.968, name: 'Central Park, NYC' },
    'brooklyn bridge': { lat: 40.706, lng: -73.997, name: 'Brooklyn Bridge, NYC' },
    'statue of liberty': { lat: 40.689, lng: -74.045, name: 'Statue of Liberty, NYC' },
    'empire state building': { lat: 40.748, lng: -73.986, name: 'Empire State Building, NYC' },
    'philadelphia': { lat: 39.9526, lng: -75.1652, name: 'Philadelphia, PA' },
    'boston': { lat: 42.3601, lng: -71.0589, name: 'Boston, MA' },
    'washington dc': { lat: 38.9072, lng: -77.0369, name: 'Washington, DC' },
    'los angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
    'chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
    'miami': { lat: 25.7617, lng: -80.1918, name: 'Miami, FL' },
    'seattle': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' }
  }

  // Disable map's internal location tracking to prevent conflicts
  // Location is handled by parent BeaconApp component
  useEffect(() => {
    // Just set loading to false since parent handles location
    setIsLoading(false)
  }, [])

  // Process weather alerts into map markers
  useEffect(() => {
    if (!weatherAlerts?.length) {
      setEmergencyMarkers([])
      return
    }

    const markers = weatherAlerts
      .filter(alert => alert.geometry?.coordinates)
      .map(alert => ({
        id: alert.id,
        position: [alert.geometry.coordinates[1], alert.geometry.coordinates[0]], // [lat, lng]
        title: alert.title,
        severity: alert.threatLevel,
        description: alert.description,
        area: alert.areaDesc
      }))

    setEmergencyMarkers(markers)
  }, [weatherAlerts])

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng)
  }

  const centerOnUser = () => {
    if (userLocation && mapInstance) {
      console.log('Manual center on user requested')
      mapInstance.setView([userLocation.latitude, userLocation.longitude], 16)
      // Re-enable auto-centering when user manually centers
      setDisableAutoCenter(false)
      setSelectedLocation(null) // Clear any search location
    }
  }

  // Search for locations
  const searchLocation = async (query) => {
    console.log('=== SEARCH FUNCTION CALLED ===')
    console.log('Search query:', query)

    if (!query.trim()) {
      console.log('Empty query - clearing results')
      setSearchResults([])
      return
    }

    console.log('Starting search for:', query)
    setIsSearching(true)
    const results = []
    const normalized = query.toLowerCase().trim()
    console.log('Normalized query:', normalized)

    try {
      // Check coordinates first (lat,lng format)
      if (query.includes(',') && query.split(',').length === 2) {
        const parts = query.split(',').map(p => parseFloat(p.trim()))
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          results.push({
            lat: parts[0],
            lng: parts[1],
            name: `Coordinates: ${parts[0].toFixed(4)}, ${parts[1].toFixed(4)}`,
            type: 'coordinates'
          })
        }
      }

      // Check known places
      Object.entries(knownPlaces).forEach(([key, place]) => {
        if (key.includes(normalized) || normalized.includes(key)) {
          results.push({
            lat: place.lat,
            lng: place.lng,
            name: place.name,
            type: 'known_place'
          })
        }
      })

      // Check ZIP codes
      if (/^\d{5}$/.test(normalized)) {
        try {
          const zipResult = await zipCodeService.current.lookup(normalized)
          results.push({
            lat: zipResult.latitude,
            lng: zipResult.longitude,
            name: `${zipResult.city}, ${zipResult.state} ${normalized}`,
            type: 'zipcode'
          })
        } catch (error) {
          console.log(`ZIP code ${normalized} not found`)
        }
      }

      console.log('Search results generated:', results)
      setSearchResults(results.slice(0, 5)) // Limit to 5 results
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Navigate to selected location
  const navigateToLocation = (location) => {
    console.log('=== NAVIGATION START ===')
    console.log('Navigating to location:', location)
    console.log('Map instance available:', !!mapInstance)
    console.log('MapRef available:', !!mapRef.current)

    if (mapInstance) {
      console.log('Using mapInstance - Setting map view to:', [location.lat, location.lng])

      // Log current map center before navigation
      const currentCenter = mapInstance.getCenter()
      console.log('Current map center before navigation:', currentCenter.lat, currentCenter.lng)
      console.log('Current zoom before navigation:', mapInstance.getZoom())

      // Try multiple methods to ensure the map moves
      try {
        // Method 1: setView with animation
        mapInstance.setView([location.lat, location.lng], 15, {
          animate: true,
          duration: 1
        })
        console.log('setView called successfully')

        // Check if it worked after a delay
        setTimeout(() => {
          const newCenter = mapInstance.getCenter()
          console.log('Map center after setView:', newCenter.lat, newCenter.lng)
          console.log('Map zoom after setView:', mapInstance.getZoom())

          // Method 2: flyTo as backup if position didn't change
          const moved = Math.abs(newCenter.lat - location.lat) < 0.001 && Math.abs(newCenter.lng - location.lng) < 0.001
          if (!moved) {
            console.log('Position did not change, trying flyTo')
            mapInstance.flyTo([location.lat, location.lng], 15, {
              duration: 1
            })
          } else {
            console.log('Position changed successfully!')
          }
        }, 200)

      } catch (error) {
        console.error('Error setting map view:', error)
      }

      setSelectedLocation({ lat: location.lat, lng: location.lng, name: location.name })

      // Clear search but don't disable it - allow immediate new searches
      setTimeout(() => {
        setSearchQuery('')
        setSearchResults([])
      }, 200)

    } else if (mapRef.current) {
      console.log('Using mapRef fallback - Setting map view to:', [location.lat, location.lng])

      try {
        mapRef.current.setView([location.lat, location.lng], 15, {
          animate: true,
          duration: 1
        })
        console.log('mapRef setView called successfully')

        // Backup method
        setTimeout(() => {
          mapRef.current.flyTo([location.lat, location.lng], 15, {
            duration: 1
          })
          console.log('mapRef flyTo called as backup')
        }, 100)

      } catch (error) {
        console.error('Error with mapRef:', error)
      }

      setSelectedLocation({ lat: location.lat, lng: location.lng, name: location.name })

      // Clear search but don't disable it - allow immediate new searches
      setTimeout(() => {
        setSearchQuery('')
        setSearchResults([])
      }, 200)
    } else {
      console.error('No map instance available!')
    }
    console.log('=== NAVIGATION END ===')
  }

  // Handle search input changes with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocation(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Location requests handled by parent component

  return (
    <div className={`interactive-osm-map ${className} ${emergencyMode ? 'emergency-mode' : ''}`}>
      {isLoading && (
        <div className="map-loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading GPS map...</p>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        attributionControl={true}
      >
        {/* OpenStreetMap tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={17} // Reduced max zoom for better performance
          minZoom={3}
          subdomains={['a', 'b', 'c']}
          updateWhenIdle={true} // Only update tiles when map is idle
          updateWhenZooming={false} // Don't update during zoom for better performance
          keepBuffer={2} // Reduce tile buffer for memory efficiency
        />

        {/* Map controller for handling events */}
        <MapController
          userLocation={userLocation}
          onLocationUpdate={onLocationUpdate}
          onMapClick={handleMapClick}
          emergencyMode={emergencyMode}
          disableAutoCenter={disableAutoCenter}
          onMapReady={(map) => {
            console.log('Map ready callback received')
            setMapInstance(map)
            mapRef.current = map
          }}
        />

        {/* User location marker */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="user-location-popup">
                  <h4>📍 Your Location</h4>
                  <p><strong>Latitude:</strong> {userLocation.latitude.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> {userLocation.longitude.toFixed(6)}</p>
                  <p><strong>Accuracy:</strong> ±{userLocation.accuracy?.toFixed(0)}m</p>
                  {userLocation.timestamp && (
                    <p><strong>Updated:</strong> {new Date(userLocation.timestamp).toLocaleTimeString()}</p>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Accuracy circle */}
            {showAccuracyCircle && userLocation.accuracy && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            )}
          </>
        )}

        {/* Emergency alert markers */}
        {emergencyMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={emergencyIcon}
          >
            <Popup>
              <div className="emergency-popup">
                <h4>🚨 {marker.title}</h4>
                <p><strong>Severity:</strong> {marker.severity}</p>
                {marker.area && <p><strong>Area:</strong> {marker.area}</p>}
                {marker.description && (
                  <div className="alert-description">
                    <p>{marker.description}</p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="selected-location-popup">
                <h4>📌 Selected Location</h4>
                <p><strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}</p>
                <p><strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}</p>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="remove-marker-btn"
                >
                  Remove Marker
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route visualization */}
        {route && userLocation && destination && (
          <RouteOverlay
            route={route}
            userLocation={userLocation}
            destination={destination}
          />
        )}
      </MapContainer>

      {/* Map controls overlay */}
      <div className="map-controls">
        {enableLocationSearch && (
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  console.log('Search input focused')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('')
                    setSearchResults([])
                    e.target.blur()
                  }
                }}
                placeholder="Search places, ZIP codes, coordinates..."
                className="location-search-input"
                disabled={isSearching}
              />
              {isSearching && <div className="search-spinner">🔍</div>}
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {console.log('Rendering search results:', searchResults.length, 'results')}
                {searchResults.map((result, index) => {
                  console.log(`Rendering result ${index}:`, result)
                  return (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('=== SEARCH CLICK EVENT ===')
                      console.log('Search result clicked:', result)
                      console.log('Event target:', e.target)
                      console.log('About to call navigateToLocation with:', result)
                      try {
                        navigateToLocation(result)
                        console.log('navigateToLocation called successfully')
                      } catch (error) {
                        console.error('Error calling navigateToLocation:', error)
                      }
                      console.log('=== SEARCH CLICK END ===')
                    }}
                  >
                    <span className="result-icon">
                      {result.type === 'coordinates' ? '📍' :
                       result.type === 'zipcode' ? '📮' : '🏢'}
                    </span>
                    <span className="result-name">{result.name}</span>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {userLocation && (
          <button
            onClick={centerOnUser}
            className="center-user-btn"
            title="Center on my location"
          >
            📍
          </button>
        )}

        {/* Location requests handled by parent component */}
      </div>

      {/* Location error handling moved to parent component */}

      {/* Emergency mode indicator */}
      {emergencyMode && (
        <div className="emergency-indicator">
          <span className="emergency-icon">🚨</span>
          <span>EMERGENCY MODE</span>
        </div>
      )}

      {/* Map stats overlay */}
      <div className="map-stats">
        <div className="stats-content">
          <span>🗺️ OpenStreetMap</span>
          {userLocation && (
            <span>📍 GPS: ±{userLocation.accuracy?.toFixed(0)}m</span>
          )}
          {emergencyMarkers.length > 0 && (
            <span>⚠️ {emergencyMarkers.length} Alert{emergencyMarkers.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default InteractiveOSMMap