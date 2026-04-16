// ============================================================================
// NOAA/NWS Emergency Weather Service
// ============================================================================

class NOAAService {
  constructor() {
    this.baseURL = 'https://api.weather.gov'
    this.alertsCache = new Map()
    this.cacheTimeout = 30000 // 30 seconds for emergency updates
  }

  // Get emergency alerts for location
  async getAlerts(latitude, longitude, maxRetries = 3) {
    const cacheKey = `${latitude},${longitude}`
    const cached = this.alertsCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get NWS grid point data
        const pointResponse = await fetch(`${this.baseURL}/points/${latitude},${longitude}`, {
          headers: {
            'User-Agent': 'BeaconEmergencyApp/1.0 (emergency-contact@mathison.com)'
          },
          timeout: 10000
        })

        if (!pointResponse.ok) {
          throw new Error(`Point API failed: ${pointResponse.status}`)
        }

        const pointData = await pointResponse.json()
        const { county, gridId, gridX, gridY } = pointData.properties

        // Get active alerts for the area
        const alertsResponse = await fetch(
          `${this.baseURL}/alerts/active?point=${latitude},${longitude}&severity=Severe,Extreme&certainty=Observed,Likely`,
          {
            headers: {
              'User-Agent': 'BeaconEmergencyApp/1.0 (emergency-contact@mathison.com)'
            },
            timeout: 15000
          }
        )

        if (!alertsResponse.ok) {
          throw new Error(`Alerts API failed: ${alertsResponse.status}`)
        }

        const alertsData = await alertsResponse.json()
        const processedAlerts = this.processAlerts(alertsData.features)

        // Cache the results
        this.alertsCache.set(cacheKey, {
          data: {
            alerts: processedAlerts,
            location: {
              county: county?.replace(' County', '') || 'Unknown',
              gridId,
              gridX,
              gridY
            },
            lastUpdated: new Date().toISOString()
          },
          timestamp: Date.now()
        })

        return this.alertsCache.get(cacheKey).data

      } catch (error) {
        console.warn(`NOAA API attempt ${attempt} failed:`, error.message)
        
        if (attempt === maxRetries) {
          // Return fallback data on final failure
          return {
            alerts: [],
            location: { county: 'Unknown' },
            lastUpdated: new Date().toISOString(),
            error: 'Weather service temporarily unavailable'
          }
        }

        // Progressive backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
      }
    }
  }

  // Process raw NOAA alerts into standardized format
  processAlerts(features) {
    const processedAlerts = []
    const now = new Date()

    for (const feature of features) {
      const properties = feature.properties
      
      // Skip expired alerts
      const expiresTime = new Date(properties.expires)
      if (expiresTime < now) continue

      // Categorize severity for emergency prioritization
      const severity = this.categorizeSeverity(properties.severity, properties.event)
      
      // Skip minor alerts during emergencies
      if (severity === 'minor') continue

      processedAlerts.push({
        id: properties.id,
        title: properties.headline || properties.event,
        event: properties.event,
        severity: severity,
        urgency: properties.urgency?.toLowerCase() || 'unknown',
        certainty: properties.certainty?.toLowerCase() || 'unknown',
        description: properties.description,
        instruction: properties.instruction,
        areas: properties.areaDesc?.split(';').map(area => area.trim()) || [],
        effective: properties.effective,
        expires: properties.expires,
        senderName: properties.senderName,
        
        // Emergency-specific categorization
        emergencyType: this.getEmergencyType(properties.event),
        threatLevel: this.getThreatLevel(properties.severity, properties.urgency, properties.certainty),
        
        // Action recommendations
        actionRequired: this.getActionRequired(properties.event, severity),
        evacuationRecommended: this.shouldRecommendEvacuation(properties.event, severity),
        
        // Time sensitivity
        timeToImpact: this.calculateTimeToImpact(properties.onset || properties.effective),
        isImminent: this.isImminent(properties.onset || properties.effective)
      })
    }

    // Sort by threat level and time sensitivity
    return processedAlerts.sort((a, b) => {
      const threatOrder = { 'critical': 0, 'severe': 1, 'moderate': 2, 'minor': 3 }
      const threatDiff = threatOrder[a.threatLevel] - threatOrder[b.threatLevel]
      
      if (threatDiff !== 0) return threatDiff
      
      // If same threat level, prioritize by imminence
      if (a.isImminent && !b.isImminent) return -1
      if (!a.isImminent && b.isImminent) return 1
      
      return a.timeToImpact - b.timeToImpact
    })
  }

  // Categorize alert severity for emergency response
  categorizeSeverity(severity, event) {
    const extremeEvents = [
      'tornado warning', 'flash flood warning', 'severe thunderstorm warning',
      'hurricane warning', 'blizzard warning', 'ice storm warning'
    ]
    
    const severeEvents = [
      'tornado watch', 'flash flood watch', 'severe thunderstorm watch',
      'hurricane watch', 'winter storm warning', 'high wind warning'
    ]

    const eventLower = event?.toLowerCase() || ''
    
    if (severity === 'Extreme' || extremeEvents.some(e => eventLower.includes(e.toLowerCase()))) {
      return 'critical'
    }
    
    if (severity === 'Severe' || severeEvents.some(e => eventLower.includes(e.toLowerCase()))) {
      return 'severe'
    }
    
    if (severity === 'Moderate') {
      return 'moderate'
    }
    
    return 'minor'
  }

  // Determine emergency type for navigation planning
  getEmergencyType(event) {
    const eventLower = event?.toLowerCase() || ''
    
    if (eventLower.includes('tornado')) return 'tornado'
    if (eventLower.includes('flood')) return 'flooding'
    if (eventLower.includes('hurricane') || eventLower.includes('tropical storm')) return 'hurricane'
    if (eventLower.includes('thunderstorm') || eventLower.includes('hail')) return 'severe_weather'
    if (eventLower.includes('winter') || eventLower.includes('blizzard') || eventLower.includes('ice')) return 'winter_storm'
    if (eventLower.includes('fire')) return 'wildfire'
    if (eventLower.includes('earthquake')) return 'earthquake'
    
    return 'general'
  }

  // Calculate threat level for UI prioritization
  getThreatLevel(severity, urgency, certainty) {
    if (severity === 'Extreme' && urgency === 'immediate' && certainty === 'observed') {
      return 'critical'
    }
    
    if (severity === 'Extreme' || 
        (severity === 'Severe' && urgency === 'immediate') ||
        (severity === 'Severe' && certainty === 'observed')) {
      return 'severe'
    }
    
    if (severity === 'Severe' || severity === 'Moderate') {
      return 'moderate'
    }
    
    return 'minor'
  }

  // Determine required actions for emergency response
  getActionRequired(event, severity) {
    const actions = []
    const eventLower = event?.toLowerCase() || ''
    
    if (eventLower.includes('tornado warning')) {
      actions.push('SEEK IMMEDIATE SHELTER')
      actions.push('Go to lowest floor, interior room')
      actions.push('Stay away from windows')
    } else if (eventLower.includes('flash flood warning')) {
      actions.push('DO NOT DRIVE THROUGH FLOODED ROADS')
      actions.push('Move to higher ground immediately')
      actions.push('Avoid low-lying areas')
    } else if (eventLower.includes('severe thunderstorm warning')) {
      actions.push('Seek indoor shelter')
      actions.push('Avoid windows and electrical equipment')
      actions.push('Do not go outside')
    } else if (severity === 'critical' || severity === 'severe') {
      actions.push('Follow local emergency instructions')
      actions.push('Stay informed via emergency broadcasts')
    }
    
    return actions
  }

  // Determine if evacuation should be recommended
  shouldRecommendEvacuation(event, severity) {
    const evacuationEvents = [
      'hurricane warning', 'wildfire warning', 'flood warning', 
      'dam break', 'levee failure', 'evacuation order'
    ]
    
    const eventLower = event?.toLowerCase() || ''
    return severity === 'critical' && evacuationEvents.some(e => eventLower.includes(e))
  }

  // Calculate time until impact for prioritization
  calculateTimeToImpact(onsetTime) {
    if (!onsetTime) return Infinity
    
    const onset = new Date(onsetTime)
    const now = new Date()
    return Math.max(0, onset.getTime() - now.getTime())
  }

  // Determine if threat is imminent (within next hour)
  isImminent(onsetTime) {
    return this.calculateTimeToImpact(onsetTime) <= 3600000 // 1 hour in milliseconds
  }

  // Format time remaining for display
  formatTimeToImpact(timeToImpact) {
    if (timeToImpact === Infinity) return 'Unknown'
    if (timeToImpact <= 0) return 'NOW'
    
    const hours = Math.floor(timeToImpact / 3600000)
    const minutes = Math.floor((timeToImpact % 3600000) / 60000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  // Get current conditions and short-term forecast
  async getCurrentConditions(latitude, longitude) {
    try {
      const pointResponse = await fetch(`${this.baseURL}/points/${latitude},${longitude}`, {
        headers: {
          'User-Agent': 'BeaconEmergencyApp/1.0 (emergency-contact@mathison.com)'
        }
      })

      const pointData = await pointResponse.json()
      const forecastURL = pointData.properties.forecast

      const forecastResponse = await fetch(forecastURL, {
        headers: {
          'User-Agent': 'BeaconEmergencyApp/1.0 (emergency-contact@mathison.com)'
        }
      })

      const forecastData = await forecastResponse.json()
      const currentPeriod = forecastData.properties.periods[0]

      return {
        temperature: currentPeriod.temperature,
        temperatureUnit: currentPeriod.temperatureUnit,
        windSpeed: currentPeriod.windSpeed,
        windDirection: currentPeriod.windDirection,
        shortForecast: currentPeriod.shortForecast,
        detailedForecast: currentPeriod.detailedForecast,
        isDaytime: currentPeriod.isDaytime,
        lastUpdated: new Date().toISOString()
      }

    } catch (error) {
      console.error('Failed to get current conditions:', error)
      return {
        error: 'Current conditions unavailable',
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

export default NOAAService