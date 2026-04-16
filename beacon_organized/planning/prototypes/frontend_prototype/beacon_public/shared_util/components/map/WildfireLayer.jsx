/**
 * ============================================================================
 * WILDFIRE LAYER - Real-time NASA FIRMS fire detection + spread predictions
 * ============================================================================
 *
 * Displays active wildfires from NASA satellite data with physics-based
 * fire spread predictions using the Rothermel model.
 */

import React, { useState, useEffect } from 'react'
import { Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import WildfireService from '../../services/wildfire/WildfireService.js'

// Fire severity icons (color-coded by intensity)
const createFireIcon = (severity) => {
  const colors = {
    1: '#fbbf24', // Low - amber
    2: '#f97316', // Moderate - orange
    3: '#ef4444', // High - red
    4: '#dc2626', // Very high - dark red
    5: '#991b1b'  // Critical - very dark red
  }

  const color = colors[severity] || colors[3]

  // Fire flame SVG path (no emoji - btoa can't handle unicode)
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
    <path d="M12 23s-8-5.5-8-11a8 8 0 1 1 16 0c0 5.5-8 11-8 11z" fill="${color}"/>
    <path d="M12 5c-1.5 2-3 4-3 6.5 0 2 1.5 3.5 3 3.5s3-1.5 3-3.5c0-2.5-1.5-4.5-3-6.5z" fill="#fff"/>
  </svg>`

  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgString),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Small fire marker for spread prediction center
const fireOriginSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
  <circle cx="12" cy="12" r="10" fill="#fff" stroke="#dc2626" stroke-width="2"/>
  <path d="M12 6c-1 1.5-2 3-2 4.5 0 1.5 1 2.5 2 2.5s2-1 2-2.5c0-1.5-1-3-2-4.5z" fill="#dc2626"/>
</svg>`

const fireOriginIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(fireOriginSvg),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

function WildfireLayer({
  userLocation,
  searchRadiusKm = 100,
  showSpreadPredictions = true,
  predictionHours = 12,
  enabled = true,
  firmsApiKey = null
}) {
  const [wildfires, setWildfires] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const map = useMap()

  const wildfireService = React.useRef(new WildfireService(firmsApiKey)).current

  // Fetch wildfire data when user location changes
  useEffect(() => {
    if (!enabled || !userLocation) {
      setWildfires([])
      return
    }

    const fetchWildfires = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('🔥 Fetching wildfire intelligence...')
        const intelligence = await wildfireService.getWildfireIntelligence(
          userLocation.latitude,
          userLocation.longitude,
          searchRadiusKm
        )

        console.log(`✅ Found ${intelligence.fireCount} active wildfires`)
        setWildfires(intelligence.wildfires)
        setLastUpdate(new Date())
      } catch (err) {
        console.error('❌ Error fetching wildfire data:', err)
        setError(err.message)
        setWildfires([])
      } finally {
        setLoading(false)
      }
    }

    fetchWildfires()

    // Refresh every 10 minutes
    const interval = setInterval(fetchWildfires, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userLocation, searchRadiusKm, enabled, wildfireService])

  if (!enabled) {
    return null
  }

  // Get prediction key based on selected hours
  const getPredictionKey = () => {
    if (predictionHours <= 6) return 'hours_6'
    if (predictionHours <= 12) return 'hours_12'
    return 'hours_24'
  }

  const predictionKey = getPredictionKey()

  return (
    <>
      {/* Render active fire markers */}
      {wildfires.map((fire, index) => {
        const prediction = fire.predictions[predictionKey]

        return (
          <React.Fragment key={`fire-${index}-${fire.latitude}-${fire.longitude}`}>
            {/* Fire location marker */}
            <Marker
              position={[fire.latitude, fire.longitude]}
              icon={createFireIcon(fire.severity)}
            >
              <Popup>
                <div className="wildfire-popup">
                  <h4 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>
                    🔥 Active Wildfire
                  </h4>

                  <div style={{ fontSize: '12px' }}>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Severity:</strong> {fire.severity}/5
                      {fire.severity >= 4 && ' ⚠️ CRITICAL'}
                    </p>

                    <p style={{ margin: '4px 0' }}>
                      <strong>Distance:</strong> {fire.distance.toFixed(1)} km away
                    </p>

                    {fire.frp && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Fire Power:</strong> {fire.frp.toFixed(0)} MW
                      </p>
                    )}

                    {fire.confidence && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Confidence:</strong> {fire.confidence}
                      </p>
                    )}

                    {fire.acq_date && fire.acq_time && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Detected:</strong> {fire.acq_date} {fire.acq_time}
                      </p>
                    )}

                    {prediction && (
                      <>
                        <hr style={{ margin: '8px 0' }} />
                        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                          {predictionHours}h Spread Prediction:
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}>
                          <strong>Spread Rate:</strong> {prediction.properties.rateOfSpreadMPerHour.toFixed(0)} m/h
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}>
                          <strong>Total Spread:</strong> {(prediction.properties.totalSpreadMeters / 1000).toFixed(1)} km
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}>
                          <strong>Wind:</strong> {prediction.properties.windSpeed} km/h @ {prediction.properties.windDirection}°
                        </p>
                      </>
                    )}

                    <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#666' }}>
                      Data: NASA FIRMS + Rothermel Model
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Fire spread prediction polygon */}
            {showSpreadPredictions && prediction && prediction.coordinates && (
              <Polygon
                positions={prediction.coordinates[0].map(coord => [coord[1], coord[0]])}
                pathOptions={{
                  color: fire.severity >= 4 ? '#dc2626' : '#f97316',
                  fillColor: fire.severity >= 4 ? '#dc2626' : '#f97316',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              >
                <Popup>
                  <div style={{ fontSize: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>
                      {predictionHours}h Fire Spread Prediction
                    </h4>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Predicted Area:</strong> Shows where fire may spread in {predictionHours} hours
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Rate:</strong> {prediction.properties.rateOfSpreadMPerHour.toFixed(0)} m/h
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '10px', color: '#666' }}>
                      Based on Rothermel fire spread model
                    </p>
                  </div>
                </Popup>
              </Polygon>
            )}
          </React.Fragment>
        )
      })}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          🔥 Loading wildfire data...
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(220, 38, 38, 0.95)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          ⚠️ Error loading wildfire data
        </div>
      )}
    </>
  )
}

export default WildfireLayer
