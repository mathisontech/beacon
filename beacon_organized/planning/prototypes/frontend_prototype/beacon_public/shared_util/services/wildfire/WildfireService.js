/**
 * ============================================================================
 * INTEGRATED WILDFIRE SERVICE
 * ============================================================================
 *
 * Combines NASA FIRMS real-time fire detection with physics-based fire spread modeling
 * to provide comprehensive wildfire intelligence for the Beacon emergency GPS system.
 */

import NASAFIRMSService from './NASAFIRMSService.js'
import FireSpreadModel from './FireSpreadModel.js'

class WildfireService {
  constructor(firmsApiKey = null) {
    this.firmsService = new NASAFIRMSService(firmsApiKey)
    this.spreadModel = new FireSpreadModel()
    this.activeWildfires = []
    this.predictions = new Map()
  }

  /**
   * Get comprehensive wildfire data for a location with spread predictions
   *
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @param {Object} weatherData - Current weather conditions
   * @returns {Promise<Object>} Wildfire intelligence data
   */
  async getWildfireIntelligence(lat, lon, radiusKm = 50, weatherData = null) {
    try {
      // Fetch active fires from NASA FIRMS
      const activeFires = await this.firmsService.getFiresNearLocation(lat, lon, radiusKm)

      // Use default weather if not provided
      const weather = weatherData || {
        windSpeed: 15, // km/h
        windDirection: 270, // degrees
        temperature: 30, // Celsius
        humidity: 30 // percent
      }

      // Generate predictions for each active fire
      const wildfiresWithPredictions = activeFires.map(fire => {
        // Generate predictions for 6, 12, and 24 hours
        const predictions = {
          hours_6: this.spreadModel.predictSpreadPolygon(
            fire.latitude,
            fire.longitude,
            weather.windSpeed,
            weather.windDirection,
            weather.temperature,
            weather.humidity,
            6
          ),
          hours_12: this.spreadModel.predictSpreadPolygon(
            fire.latitude,
            fire.longitude,
            weather.windSpeed,
            weather.windDirection,
            weather.temperature,
            weather.humidity,
            12
          ),
          hours_24: this.spreadModel.predictSpreadPolygon(
            fire.latitude,
            fire.longitude,
            weather.windSpeed,
            weather.windDirection,
            weather.temperature,
            weather.humidity,
            24
          )
        }

        return {
          ...fire,
          predictions,
          weather,
          distance: this._calculateDistance(lat, lon, fire.latitude, fire.longitude)
        }
      })

      // Sort by distance
      wildfiresWithPredictions.sort((a, b) => a.distance - b.distance)

      return {
        location: { lat, lon, radiusKm },
        fireCount: wildfiresWithPredictions.length,
        wildfires: wildfiresWithPredictions,
        weather,
        timestamp: new Date().toISOString(),
        dataSource: 'NASA FIRMS + Rothermel Model'
      }
    } catch (error) {
      console.error('Error getting wildfire intelligence:', error)
      throw error
    }
  }

  /**
   * Get fires by region (e.g., 'maui', 'hawaii', 'california')
   *
   * @param {string} region - Region identifier
   * @param {Object} weatherData - Weather conditions
   * @returns {Promise<Object>} Wildfire intelligence data
   */
  async getWildfiresByRegion(region, weatherData = null) {
    try {
      const activeFires = await this.firmsService.getFiresByRegion(region)

      const weather = weatherData || {
        windSpeed: 15,
        windDirection: 270,
        temperature: 30,
        humidity: 30
      }

      const wildfiresWithPredictions = activeFires.map(fire => ({
        ...fire,
        predictions: {
          hours_6: this.spreadModel.predictSpreadPolygon(
            fire.latitude,
            fire.longitude,
            weather.windSpeed,
            weather.windDirection,
            weather.temperature,
            weather.humidity,
            6
          ),
          hours_12: this.spreadModel.predictSpreadPolygon(
            fire.latitude,
            fire.longitude,
            weather.windSpeed,
            weather.windDirection,
            weather.temperature,
            weather.humidity,
            12
          ),
          hours_24: this.spreadModel.predictSpreadPolygon(
            fire.latitude,
            fire.longitude,
            weather.windSpeed,
            weather.windDirection,
            weather.temperature,
            weather.humidity,
            24
          )
        },
        weather
      }))

      return {
        region,
        fireCount: wildfiresWithPredictions.length,
        wildfires: wildfiresWithPredictions,
        weather,
        timestamp: new Date().toISOString(),
        dataSource: 'NASA FIRMS + Rothermel Model'
      }
    } catch (error) {
      console.error('Error getting wildfires by region:', error)
      throw error
    }
  }

  /**
   * Check if a location is threatened by any active wildfires
   *
   * @param {number} lat - Location latitude
   * @param {number} lon - Location longitude
   * @param {number} hoursAhead - Hours to look ahead for predictions
   * @param {number} searchRadiusKm - How far to search for fires
   * @returns {Promise<Object>} Threat assessment
   */
  async assessThreat(lat, lon, hoursAhead = 12, searchRadiusKm = 50) {
    const intel = await this.getWildfireIntelligence(lat, lon, searchRadiusKm)

    const threats = []

    for (const fire of intel.wildfires) {
      // Check if location is within predicted spread area
      const predictionKey = `hours_${hoursAhead}`
      const prediction = fire.predictions[predictionKey] || fire.predictions.hours_12

      if (prediction && this._isPointInPolygon(lat, lon, prediction.coordinates[0])) {
        threats.push({
          fire,
          prediction,
          severity: fire.severity,
          distance: fire.distance,
          estimatedTimeToReach: this._estimateTimeToReach(fire, lat, lon)
        })
      }
    }

    return {
      threatened: threats.length > 0,
      threatCount: threats.length,
      threats: threats.sort((a, b) => b.severity - a.severity),
      assessment: this._generateThreatAssessment(threats),
      location: { lat, lon }
    }
  }

  /**
   * Calculate distance between two points in kilometers
   *
   * @private
   */
  _calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Check if a point is inside a polygon
   *
   * @private
   */
  _isPointInPolygon(lat, lon, polygon) {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1], yi = polygon[i][0]
      const xj = polygon[j][1], yj = polygon[j][0]

      const intersect = ((yi > lon) !== (yj > lon)) &&
        (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }

  /**
   * Estimate time for fire to reach a location
   *
   * @private
   */
  _estimateTimeToReach(fire, targetLat, targetLon) {
    const distance = this._calculateDistance(
      fire.latitude,
      fire.longitude,
      targetLat,
      targetLon
    )

    // Simple estimation based on fire spread rate
    const spreadRateKmPerHour = (fire.predictions.hours_6.properties.rateOfSpreadMPerHour || 150) / 1000
    return distance / spreadRateKmPerHour
  }

  /**
   * Generate threat assessment text
   *
   * @private
   */
  _generateThreatAssessment(threats) {
    if (threats.length === 0) {
      return {
        level: 'safe',
        message: 'No immediate wildfire threats detected in your area.'
      }
    }

    const highestSeverity = Math.max(...threats.map(t => t.severity))
    const closestFire = threats.reduce((min, t) => t.distance < min.distance ? t : min)

    if (highestSeverity >= 4) {
      return {
        level: 'critical',
        message: `CRITICAL: High-severity wildfire ${closestFire.distance.toFixed(1)}km away. Immediate evacuation may be necessary.`,
        action: 'Evacuate immediately if instructed by authorities.'
      }
    } else if (highestSeverity >= 3) {
      return {
        level: 'high',
        message: `HIGH RISK: Active wildfire ${closestFire.distance.toFixed(1)}km away. Monitor situation closely.`,
        action: 'Prepare for possible evacuation. Stay alert for updates.'
      }
    } else {
      return {
        level: 'moderate',
        message: `MODERATE: Wildfire activity detected ${closestFire.distance.toFixed(1)}km away.`,
        action: 'Stay informed. No immediate action required.'
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.firmsService.clearCache()
    this.predictions.clear()
  }
}

export default WildfireService
