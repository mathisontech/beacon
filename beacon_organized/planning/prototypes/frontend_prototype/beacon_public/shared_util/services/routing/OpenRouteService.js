// ============================================================================
// OPENROUTE SERVICE - A-to-B routing with multiple transport modes
// ============================================================================

class OpenRouteService {
  constructor() {
    // OpenRouteService API with your key
    this.baseURL = 'https://api.openrouteservice.org'
    this.apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYyODYzMTFjZjVjMDQxNjE4MDU5NDUxYTNhNmFhM2Y3IiwiaCI6Im11cm11cjY0In0='
  }

  // Get route between two points
  async getRoute(startCoords, endCoords, profile = 'driving-car') {
    try {
      console.log(`Requesting route from OpenRouteService API with profile: ${profile}`)

      const url = `${this.baseURL}/v2/directions/${profile}`

      const requestBody = {
        coordinates: [
          [startCoords.lng, startCoords.lat], // start [longitude, latitude]
          [endCoords.lng, endCoords.lat]      // end [longitude, latitude]
        ],
        format: 'json',
        instructions: true,
        geometry: true
      }

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }

      // Add API key if available
      if (this.apiKey) {
        headers['Authorization'] = this.apiKey
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`OpenRouteService API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Real API route data received:', data)
      return this.formatRouteResponse(data)

    } catch (error) {
      console.error('OpenRouteService routing error:', error)
      console.log('Falling back to mock routing data')
      // Fallback to mock data
      return this.getMockRoute(startCoords, endCoords, profile)
    }
  }

  // Format the API response for easier use
  formatRouteResponse(data) {
    const route = data.routes[0]
    const segment = route.segments[0]

    return {
      success: true,
      distance: (route.summary.distance / 1000).toFixed(1), // km
      duration: Math.round(route.summary.duration / 60), // minutes
      geometry: route.geometry, // GeoJSON coordinates
      instructions: segment.steps.map(step => ({
        instruction: step.instruction,
        distance: (step.distance / 1000).toFixed(1),
        duration: Math.round(step.duration / 60),
        coordinates: [step.way_points[0], step.way_points[1]]
      })),
      bbox: route.bbox, // bounding box
      realData: true, // Flag to indicate this is real API data
      timestamp: Date.now()
    }
  }

  // Mock route for development/fallback
  getMockRoute(startCoords, endCoords, profile) {
    const distance = this.calculateDistance(startCoords, endCoords)
    const duration = this.estimateDuration(distance, profile)
    const direction = this.getDirection(startCoords, endCoords)

    // Generate more realistic turn-by-turn instructions
    const instructions = []
    const segments = Math.max(3, Math.min(8, Math.floor(distance * 2))) // 3-8 steps

    for (let i = 0; i < segments; i++) {
      const segmentDistance = distance / segments
      const segmentDuration = duration / segments

      if (i === 0) {
        instructions.push({
          instruction: `Head ${direction} on current road`,
          distance: segmentDistance.toFixed(1),
          duration: Math.round(segmentDuration)
        })
      } else if (i === segments - 1) {
        instructions.push({
          instruction: 'Arrive at destination on the right',
          distance: '0.0',
          duration: 0
        })
      } else {
        const turns = ['Continue straight', 'Turn left', 'Turn right', 'Keep left', 'Keep right']
        const roads = ['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Highway 101', 'Local Road']

        instructions.push({
          instruction: `${turns[i % turns.length]} onto ${roads[i % roads.length]}`,
          distance: segmentDistance.toFixed(1),
          duration: Math.round(segmentDuration)
        })
      }
    }

    return {
      success: true,
      distance: distance.toFixed(1),
      duration: Math.round(duration),
      geometry: this.getMockGeometry(startCoords, endCoords),
      instructions: instructions,
      mock: true,
      profile: profile,
      note: 'This is a demo route. Real API call failed.',
      timestamp: Date.now()
    }
  }

  // Calculate straight-line distance between points (Haversine formula)
  calculateDistance(coord1, coord2) {
    const R = 6371 // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Estimate duration based on profile
  estimateDuration(distance, profile) {
    const speeds = {
      'driving-car': 60, // km/h
      'cycling-regular': 15, // km/h
      'foot-walking': 5, // km/h
      'wheelchair': 4 // km/h
    }
    const speed = speeds[profile] || 60
    return (distance / speed) * 60 // minutes
  }

  // Generate simple mock geometry
  getMockGeometry(start, end) {
    return [
      [start.lng, start.lat],
      [(start.lng + end.lng) / 2, (start.lat + end.lat) / 2], // midpoint
      [end.lng, end.lat]
    ]
  }

  // Get cardinal direction
  getDirection(start, end) {
    const dLng = end.lng - start.lng
    const dLat = end.lat - start.lat

    if (Math.abs(dLng) > Math.abs(dLat)) {
      return dLng > 0 ? 'east' : 'west'
    } else {
      return dLat > 0 ? 'north' : 'south'
    }
  }

  // Get available routing profiles
  getAvailableProfiles() {
    return [
      { id: 'driving-car', name: '🚗 Driving', description: 'Fastest route by car' },
      { id: 'cycling-regular', name: '🚲 Cycling', description: 'Bike-friendly routes' },
      { id: 'foot-walking', name: '🚶 Walking', description: 'Pedestrian routes' },
      { id: 'wheelchair', name: '♿ Wheelchair', description: 'Accessible routes' }
    ]
  }
}

export default OpenRouteService