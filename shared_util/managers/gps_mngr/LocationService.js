// ============================================================================
// GPS MANAGER - Location services and GPS operations backend
// ============================================================================

class LocationService {
  constructor() {
    this.currentLocation = null
    this.locationHistory = []
    this.geofences = new Map()
    this.isTracking = false
    this.trackingInterval = null
    this.accuracy = {
      high: 10,      // meters
      medium: 50,    // meters
      low: 100       // meters
    }
  }

  // Process and validate GPS coordinates
  processGPSData(rawGPSData) {
    try {
      const processedData = {
        latitude: this.validateLatitude(rawGPSData.latitude),
        longitude: this.validateLongitude(rawGPSData.longitude),
        accuracy: rawGPSData.accuracy || this.accuracy.medium,
        altitude: rawGPSData.altitude || null,
        speed: rawGPSData.speed || 0,
        heading: rawGPSData.heading || null,
        timestamp: Date.now(),
        source: rawGPSData.source || 'browser-geolocation'
      }

      // Store in location history
      this.addToLocationHistory(processedData)

      // Update current location
      this.currentLocation = processedData

      // Check geofences
      this.checkGeofences(processedData)

      return {
        success: true,
        location: processedData,
        quality: this.assessLocationQuality(processedData)
      }

    } catch (error) {
      console.error('GPS data processing error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      }
    }
  }

  // Validate latitude coordinate
  validateLatitude(lat) {
    const latitude = parseFloat(lat)
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${lat}`)
    }
    return latitude
  }

  // Validate longitude coordinate
  validateLongitude(lng) {
    const longitude = parseFloat(lng)
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${lng}`)
    }
    return longitude
  }

  // Assess GPS location quality
  assessLocationQuality(locationData) {
    let qualityScore = 100

    // Accuracy penalty
    if (locationData.accuracy > this.accuracy.low) qualityScore -= 40
    else if (locationData.accuracy > this.accuracy.medium) qualityScore -= 20

    // Age penalty (if timestamp is old)
    const age = Date.now() - locationData.timestamp
    if (age > 300000) qualityScore -= 30 // 5 minutes
    else if (age > 60000) qualityScore -= 10 // 1 minute

    // Speed consistency check
    if (this.locationHistory.length > 1) {
      const speedConsistency = this.checkSpeedConsistency(locationData)
      if (!speedConsistency) qualityScore -= 20
    }

    return {
      score: Math.max(0, qualityScore),
      rating: qualityScore >= 80 ? 'excellent' :
              qualityScore >= 60 ? 'good' :
              qualityScore >= 40 ? 'fair' : 'poor',
      factors: {
        accuracy: locationData.accuracy,
        age: age,
        consistency: this.locationHistory.length > 1
      }
    }
  }

  // Check speed consistency between GPS points
  checkSpeedConsistency(newLocation) {
    if (this.locationHistory.length === 0) return true

    const lastLocation = this.locationHistory[this.locationHistory.length - 1]
    const distance = this.calculateDistance(lastLocation, newLocation)
    const timeDiff = (newLocation.timestamp - lastLocation.timestamp) / 1000 // seconds
    const calculatedSpeed = (distance / timeDiff) * 3.6 // km/h

    // Check if calculated speed is reasonable (not exceeding 200 km/h)
    return calculatedSpeed <= 200
  }

  // Calculate distance between two GPS points
  calculateDistance(point1, point2) {
    const R = 6371000 // Earth's radius in meters
    const lat1Rad = point1.latitude * Math.PI / 180
    const lat2Rad = point2.latitude * Math.PI / 180
    const deltaLatRad = (point2.latitude - point1.latitude) * Math.PI / 180
    const deltaLngRad = (point2.longitude - point1.longitude) * Math.PI / 180

    const a = Math.sin(deltaLatRad/2) * Math.sin(deltaLatRad/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad/2) * Math.sin(deltaLngRad/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  // Add location to history with size limit
  addToLocationHistory(location) {
    this.locationHistory.push(location)

    // Keep only last 100 locations
    if (this.locationHistory.length > 100) {
      this.locationHistory = this.locationHistory.slice(-100)
    }
  }

  // Create geofence for location monitoring
  createGeofence(name, centerLat, centerLng, radiusMeters, type = 'circular') {
    const geofence = {
      id: `geofence_${Date.now()}`,
      name: name,
      center: { latitude: centerLat, longitude: centerLng },
      radius: radiusMeters,
      type: type,
      active: true,
      entries: 0,
      exits: 0,
      created: Date.now()
    }

    this.geofences.set(geofence.id, geofence)
    return geofence.id
  }

  // Check if current location is within any geofences
  checkGeofences(location) {
    const results = []

    this.geofences.forEach((geofence, id) => {
      if (!geofence.active) return

      const distance = this.calculateDistance(geofence.center, location)
      const isInside = distance <= geofence.radius

      const result = {
        geofenceId: id,
        name: geofence.name,
        isInside: isInside,
        distance: distance,
        status: isInside ? 'inside' : 'outside'
      }

      results.push(result)

      // Track entries/exits (simplified)
      if (isInside) {
        geofence.lastEntry = Date.now()
      }
    })

    return results
  }

  // Generate location-based route
  async generateRoute(startLat, startLng, endLat, endLng, routeType = 'fastest') {
    try {
      // Placeholder for routing algorithm
      const routeData = {
        distance: this.calculateDistance(
          { latitude: startLat, longitude: startLng },
          { latitude: endLat, longitude: endLng }
        ),
        estimatedTime: this.estimateRouteTime(startLat, startLng, endLat, endLng),
        routeType: routeType,
        waypoints: this.generateWaypoints(startLat, startLng, endLat, endLng),
        instructions: this.generateRouteInstructions(),
        trafficConditions: await this.getTrafficConditions(),
        emergencyAlternatives: this.generateEmergencyRoutes(startLat, startLng, endLat, endLng)
      }

      return {
        success: true,
        route: routeData,
        timestamp: Date.now()
      }

    } catch (error) {
      console.error('Route generation error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      }
    }
  }

  // Estimate route travel time
  estimateRouteTime(startLat, startLng, endLat, endLng) {
    const distance = this.calculateDistance(
      { latitude: startLat, longitude: startLng },
      { latitude: endLat, longitude: endLng }
    )

    // Estimate based on average speed (50 km/h)
    const timeHours = (distance / 1000) / 50
    const timeMinutes = Math.round(timeHours * 60)

    return {
      minutes: timeMinutes,
      hours: Math.floor(timeMinutes / 60),
      display: timeMinutes < 60 ? `${timeMinutes} min` :
               `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m`
    }
  }

  // Generate waypoints for route
  generateWaypoints(startLat, startLng, endLat, endLng) {
    // Simple linear interpolation for demo
    const waypoints = []
    const numPoints = 5

    for (let i = 0; i <= numPoints; i++) {
      const fraction = i / numPoints
      const lat = startLat + (endLat - startLat) * fraction
      const lng = startLng + (endLng - startLng) * fraction

      waypoints.push({
        latitude: lat,
        longitude: lng,
        order: i
      })
    }

    return waypoints
  }

  // Generate route instructions
  generateRouteInstructions() {
    return [
      { step: 1, instruction: 'Head north on Main St', distance: '0.5 miles' },
      { step: 2, instruction: 'Turn right onto Highway 101', distance: '2.3 miles' },
      { step: 3, instruction: 'Take exit 42 toward destination', distance: '0.8 miles' },
      { step: 4, instruction: 'Arrive at destination', distance: '0.1 miles' }
    ]
  }

  // Get traffic conditions
  async getTrafficConditions() {
    return {
      status: 'moderate',
      delays: '5-10 minutes',
      incidents: [
        {
          type: 'construction',
          location: 'Highway 101 Mile 15',
          impact: 'lane closure',
          delay: '3 minutes'
        }
      ]
    }
  }

  // Generate emergency alternative routes
  generateEmergencyRoutes(startLat, startLng, endLat, endLng) {
    return [
      {
        name: 'Emergency Route A',
        description: 'Avoids main highways',
        addedTime: '10 minutes',
        reliability: 'high'
      },
      {
        name: 'Emergency Route B',
        description: 'Uses back roads',
        addedTime: '15 minutes',
        reliability: 'medium'
      }
    ]
  }

  // Get current GPS status
  getGPSStatus() {
    return {
      isTracking: this.isTracking,
      currentLocation: this.currentLocation,
      accuracy: this.currentLocation?.accuracy || null,
      lastUpdate: this.currentLocation?.timestamp || null,
      historyCount: this.locationHistory.length,
      activeGeofences: Array.from(this.geofences.values()).filter(g => g.active).length,
      quality: this.currentLocation ? this.assessLocationQuality(this.currentLocation) : null
    }
  }

  // Start GPS tracking
  startTracking(intervalMs = 30000) {
    this.isTracking = true
    console.log('GPS tracking started')

    this.trackingInterval = setInterval(() => {
      if (this.currentLocation) {
        console.log('GPS position updated:', this.currentLocation)
      }
    }, intervalMs)
  }

  // Stop GPS tracking
  stopTracking() {
    this.isTracking = false
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
      this.trackingInterval = null
    }
    console.log('GPS tracking stopped')
  }

  // Clear location history
  clearHistory() {
    this.locationHistory = []
    console.log('Location history cleared')
  }

  // Export location data
  exportLocationData() {
    return {
      currentLocation: this.currentLocation,
      history: this.locationHistory,
      geofences: Array.from(this.geofences.values()),
      exportTime: Date.now()
    }
  }
}

export default LocationService