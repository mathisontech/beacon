// ============================================================================
// ROUTE OVERLAY - Displays calculated routes on the map
// ============================================================================

import React from 'react'
import { Polyline, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Destination marker icon
const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

function RouteOverlay({ route, userLocation, destination }) {
  if (!route || !route.success) {
    return null
  }

  // Create route coordinates from geometry
  let routeCoordinates = []

  if (route.geometry) {
    // If we have geometry data from the API
    if (Array.isArray(route.geometry) && route.geometry.length > 0) {
      // Simple coordinate array format
      routeCoordinates = route.geometry.map(coord => [coord[1], coord[0]]) // [lat, lng]
    } else if (typeof route.geometry === 'string') {
      // Encoded polyline format (would need decoding library)
      console.warn('Polyline decoding not implemented, using simple route')
      routeCoordinates = getSimpleRoute(userLocation, destination)
    }
  } else {
    // Fallback to simple straight line
    routeCoordinates = getSimpleRoute(userLocation, destination)
  }

  // Ensure we have valid coordinates
  if (routeCoordinates.length < 2) {
    routeCoordinates = getSimpleRoute(userLocation, destination)
  }

  return (
    <>
      {/* Route polyline */}
      <Polyline
        positions={routeCoordinates}
        pathOptions={{
          color: route.realData ? '#2563eb' : '#f59e0b', // Blue for real data, amber for mock
          weight: 4,
          opacity: 0.8,
          dashArray: route.mock ? '10, 5' : null // Dashed line for mock data
        }}
      />

      {/* Destination marker */}
      {destination && (
        <Marker
          position={[destination.lat, destination.lng]}
          icon={destinationIcon}
        >
          <Popup>
            <div>
              <h4>🎯 Destination</h4>
              <p><strong>Coordinates:</strong> {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}</p>
              {route.distance && <p><strong>Distance:</strong> {route.distance} km</p>}
              {route.duration && <p><strong>Duration:</strong> {route.duration} min</p>}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  )
}

// Create simple route between two points
function getSimpleRoute(start, end) {
  if (!start || !end) return []

  return [
    [start.lat, start.lng],
    [end.lat, end.lng]
  ]
}

export default RouteOverlay