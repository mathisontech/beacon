/**
 * ============================================================================
 * ROTHERMEL WILDFIRE SPREAD MODEL - JavaScript Implementation
 * ============================================================================
 *
 * Simplified wildfire spread model based on Rothermel equations.
 * Incorporates weather data and crowd-sourced observations.
 *
 * Adapted from the Python implementation in the wildfire tracker backend.
 */

class FireSpreadModel {
  constructor() {
    // Model parameters (simplified)
    this.fuelLoad = 1.0 // kg/m^2
    this.fuelMoisture = 0.1 // 10% moisture content
    this.slopeFactor = 1.0
  }

  /**
   * Calculate rate of spread in meters/hour using simplified Rothermel model
   *
   * @param {number} windSpeed - Wind speed in km/h
   * @param {number} windDirection - Wind direction in degrees
   * @param {number} temperature - Temperature in Celsius
   * @param {number} humidity - Relative humidity as percentage
   * @returns {number} Rate of spread in meters/hour
   */
  calculateRateOfSpread(windSpeed, windDirection, temperature, humidity) {
    // Convert wind speed to m/s
    const windMs = (windSpeed * 1000) / 3600

    // Base rate of spread (without wind)
    const baseRos = 10.0 // m/hour

    // Wind effect (exponential relationship)
    const windFactor = 1 + (windMs * 0.5)

    // Temperature effect (higher temp = faster spread)
    const tempFactor = 1 + ((temperature - 20) * 0.02)

    // Humidity effect (lower humidity = faster spread)
    const humidityFactor = 1 + ((50 - humidity) * 0.01)

    // Moisture effect
    const moistureFactor = 1 / (1 + this.fuelMoisture * 2)

    // Combined rate of spread
    const ros = baseRos * windFactor * tempFactor * humidityFactor * moistureFactor

    return Math.max(ros, 5.0) // Minimum 5 m/hour
  }

  /**
   * Predict fire spread as a polygon over time
   *
   * @param {number} centerLat - Center latitude of fire
   * @param {number} centerLon - Center longitude of fire
   * @param {number} windSpeed - Wind speed in km/h
   * @param {number} windDirection - Wind direction in degrees (meteorological)
   * @param {number} temperature - Temperature in Celsius
   * @param {number} humidity - Relative humidity percentage
   * @param {number} hoursAhead - Hours to predict into the future
   * @param {Array} crowdReports - Optional list of crowd-sourced reports with lat/lon
   * @returns {Object} GeoJSON-compatible polygon dictionary
   */
  predictSpreadPolygon(centerLat, centerLon, windSpeed, windDirection, temperature, humidity, hoursAhead, crowdReports = null) {
    // Calculate rate of spread
    const ros = this.calculateRateOfSpread(windSpeed, windDirection, temperature, humidity)

    // Total spread distance in meters
    let totalSpreadM = ros * hoursAhead

    // Apply crowd-sourced data to adjust prediction
    if (crowdReports && crowdReports.length > 0) {
      const adjustmentFactor = this._analyzeCrowdReports(
        centerLat,
        centerLon,
        crowdReports,
        totalSpreadM
      )
      totalSpreadM *= adjustmentFactor
    }

    // Convert meters to approximate degrees (rough approximation)
    // 1 degree latitude ≈ 111km
    const spreadDeg = totalSpreadM / 111000

    // Create elliptical spread pattern (wind creates elongation)
    // Wind direction in radians (convert from meteorological to mathematical)
    const windRad = ((270 - windDirection) % 360) * (Math.PI / 180)

    // Ellipse parameters: elongated in wind direction
    const majorAxis = spreadDeg * 1.5 // Elongated in wind direction
    const minorAxis = spreadDeg * 0.7 // Narrower perpendicular to wind

    // Generate polygon points (ellipse)
    const numPoints = 32
    const coordinates = []

    for (let i = 0; i <= numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints

      // Ellipse equation
      const x = majorAxis * Math.cos(angle)
      const y = minorAxis * Math.sin(angle)

      // Rotate by wind direction
      const xRot = x * Math.cos(windRad) - y * Math.sin(windRad)
      const yRot = x * Math.sin(windRad) + y * Math.cos(windRad)

      // Convert to lat/lon
      const lat = centerLat + yRot
      const lon = centerLon + (xRot / Math.cos(centerLat * (Math.PI / 180)))

      coordinates.push([lon, lat])
    }

    // Create GeoJSON polygon
    return {
      type: 'Polygon',
      coordinates: [coordinates],
      properties: {
        rateOfSpreadMPerHour: ros,
        totalSpreadMeters: totalSpreadM,
        predictionHours: hoursAhead,
        windSpeed,
        windDirection,
        temperature,
        humidity
      }
    }
  }

  /**
   * Analyze crowd-sourced reports to adjust prediction confidence
   *
   * @param {number} centerLat - Center latitude
   * @param {number} centerLon - Center longitude
   * @param {Array} crowdReports - List of reports with latitude/longitude
   * @param {number} predictedSpread - Predicted spread in meters
   * @returns {number} Adjustment factor (0.5 to 1.5) to apply to spread prediction
   */
  _analyzeCrowdReports(centerLat, centerLon, crowdReports, predictedSpread) {
    if (!crowdReports || crowdReports.length === 0) {
      return 1.0
    }

    // Calculate distances of reports from center
    const distances = crowdReports.map(report =>
      this._haversineDistance(
        centerLat,
        centerLon,
        report.latitude,
        report.longitude
      )
    )

    if (distances.length === 0) {
      return 1.0
    }

    // If reports are farther than predicted, increase spread
    // If closer, decrease spread
    const avgReportDistance = distances.reduce((a, b) => a + b, 0) / distances.length

    if (avgReportDistance > predictedSpread * 1.2) {
      return 1.3 // Fire spreading faster than model predicts
    } else if (avgReportDistance < predictedSpread * 0.8) {
      return 0.9 // Fire spreading slower
    }

    return 1.0 // Reports align with model
  }

  /**
   * Calculate great circle distance between two points in meters
   *
   * @param {number} lat1 - First point latitude
   * @param {number} lon1 - First point longitude
   * @param {number} lat2 - Second point latitude
   * @param {number} lon2 - Second point longitude
   * @returns {number} Distance in meters
   */
  _haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // Earth radius in meters

    const phi1 = lat1 * (Math.PI / 180)
    const phi2 = lat2 * (Math.PI / 180)
    const deltaPhi = (lat2 - lat1) * (Math.PI / 180)
    const deltaLambda = (lon2 - lon1) * (Math.PI / 180)

    const a = Math.sin(deltaPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) ** 2

    const c = 2 * Math.asin(Math.sqrt(a))

    return R * c
  }

  /**
   * Quick prediction for performance-critical applications
   *
   * @param {number} windSpeed - Wind speed in km/h
   * @param {number} temperature - Temperature in Celsius
   * @param {number} humidity - Humidity percentage
   * @param {number} hours - Prediction hours
   * @returns {number} Estimated spread radius in meters
   */
  quickPredict(windSpeed, temperature, humidity, hours) {
    const ros = this.calculateRateOfSpread(windSpeed, 0, temperature, humidity)
    return ros * hours
  }
}

export default FireSpreadModel
