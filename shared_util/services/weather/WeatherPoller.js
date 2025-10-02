// ============================================================================
// Emergency Weather Polling Service
// ============================================================================

import NOAAService from './NOAAService.js'

class WeatherPoller {
  constructor() {
    this.noaaService = new NOAAService()
    this.pollInterval = null
    this.callbacks = new Set()
    this.isPolling = false
    this.currentLocation = null
    
    // Adaptive polling intervals based on emergency level (optimized for production)
    this.pollIntervals = {
      critical: 60000,    // 1 minute for critical alerts (reduced frequency)
      severe: 180000,     // 3 minutes for severe weather (reduced frequency)
      moderate: 600000,   // 10 minutes for moderate conditions (reduced frequency)
      normal: 900000      // 15 minutes for normal conditions (reduced frequency)
    }
    
    this.currentPollMode = 'normal'
    this.lastAlertLevel = 'normal'
    this.retryCount = 0
    this.maxRetries = 3
  }

  // Start polling for location
  startPolling(latitude, longitude, initialCallback = null) {
    this.currentLocation = { latitude, longitude }
    
    if (initialCallback) {
      this.callbacks.add(initialCallback)
    }
    
    if (this.isPolling) {
      this.stopPolling()
    }
    
    this.isPolling = true
    this.retryCount = 0
    
    // Initial fetch
    this.fetchWeatherData()
    
    // Set up polling
    this.scheduleNextPoll()
    
    // Weather polling started (debug only)
    if (process.env.NODE_ENV === 'development' && window.DEBUG_WEATHER) {
      console.log(`Weather polling started for ${latitude}, ${longitude}`)
    }
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearTimeout(this.pollInterval)
      this.pollInterval = null
    }
    
    this.isPolling = false
    this.currentPollMode = 'normal'
    // Weather polling stopped (debug only)
    if (process.env.NODE_ENV === 'development' && window.DEBUG_WEATHER) {
      console.log('Weather polling stopped')
    }
  }

  // Add callback for weather updates
  addCallback(callback) {
    this.callbacks.add(callback)
    
    // If we have recent data, call immediately
    if (this.lastWeatherData) {
      callback(this.lastWeatherData)
    }
  }

  // Remove callback
  removeCallback(callback) {
    this.callbacks.delete(callback)
  }

  // Fetch weather data and notify callbacks
  async fetchWeatherData() {
    if (!this.currentLocation) {
      console.error('No location set for weather polling')
      return
    }

    try {
      const { latitude, longitude } = this.currentLocation
      
      // Fetch alerts and current conditions in parallel
      const [alertsData, conditionsData] = await Promise.allSettled([
        this.noaaService.getAlerts(latitude, longitude),
        this.noaaService.getCurrentConditions(latitude, longitude)
      ])

      const weatherData = {
        location: { latitude, longitude },
        alerts: alertsData.status === 'fulfilled' ? alertsData.value : { alerts: [], error: 'Alerts unavailable' },
        conditions: conditionsData.status === 'fulfilled' ? conditionsData.value : { error: 'Conditions unavailable' },
        lastUpdated: new Date().toISOString(),
        pollMode: this.currentPollMode
      }

      // Update polling frequency based on alert level
      this.updatePollMode(weatherData.alerts.alerts || [])

      // Store for future callbacks
      this.lastWeatherData = weatherData

      // Reset retry count on success
      this.retryCount = 0

      // Notify all callbacks
      this.notifyCallbacks(weatherData)

      // Schedule next poll
      if (this.isPolling) {
        this.scheduleNextPoll()
      }

    } catch (error) {
      console.error('Weather polling error:', error)
      
      this.retryCount++
      
      // Exponential backoff on errors
      const backoffDelay = Math.min(30000, 5000 * Math.pow(2, this.retryCount - 1))
      
      if (this.retryCount <= this.maxRetries) {
        // Retry logging (debug only)
        if (process.env.NODE_ENV === 'development' && window.DEBUG_WEATHER) {
          console.log(`Retrying weather fetch in ${backoffDelay}ms (attempt ${this.retryCount})`)
        }
        
        if (this.isPolling) {
          this.pollInterval = setTimeout(() => {
            this.fetchWeatherData()
          }, backoffDelay)
        }
      } else {
        // Max retries reached, notify callbacks with error
        const errorData = {
          location: this.currentLocation,
          alerts: { alerts: [], error: 'Weather service unavailable' },
          conditions: { error: 'Weather service unavailable' },
          lastUpdated: new Date().toISOString(),
          pollMode: this.currentPollMode,
          serviceError: true
        }
        
        this.notifyCallbacks(errorData)
        
        // Reset retry count and continue polling at normal interval
        this.retryCount = 0
        if (this.isPolling) {
          this.scheduleNextPoll()
        }
      }
    }
  }

  // Update polling frequency based on alert severity
  updatePollMode(alerts) {
    let highestLevel = 'normal'
    
    for (const alert of alerts) {
      if (alert.threatLevel === 'critical') {
        highestLevel = 'critical'
        break
      } else if (alert.threatLevel === 'severe' && highestLevel !== 'critical') {
        highestLevel = 'severe'
      } else if (alert.threatLevel === 'moderate' && 
                 !['critical', 'severe'].includes(highestLevel)) {
        highestLevel = 'moderate'
      }
    }

    // Only log if poll mode changed
    if (highestLevel !== this.currentPollMode) {
      // Poll mode update (debug only)
      if (process.env.NODE_ENV === 'development' && window.DEBUG_WEATHER) {
        console.log(`Updating poll mode from ${this.currentPollMode} to ${highestLevel}`)
      }
      this.currentPollMode = highestLevel
      
      // If we've escalated to critical/severe, fetch immediately
      if (['critical', 'severe'].includes(highestLevel) && 
          !['critical', 'severe'].includes(this.lastAlertLevel)) {
        // Emergency update (debug only)
        if (process.env.NODE_ENV === 'development' && window.DEBUG_WEATHER) {
          console.log('Emergency conditions detected, fetching immediate update')
        }
        // Cancel current timer and fetch now
        if (this.pollInterval) {
          clearTimeout(this.pollInterval)
          this.pollInterval = null
        }
        setTimeout(() => this.fetchWeatherData(), 1000)
      }
    }
    
    this.lastAlertLevel = highestLevel
  }

  // Schedule next poll based on current mode
  scheduleNextPoll() {
    const interval = this.pollIntervals[this.currentPollMode]
    
    this.pollInterval = setTimeout(() => {
      this.fetchWeatherData()
    }, interval)
  }

  // Notify all registered callbacks
  notifyCallbacks(weatherData) {
    this.callbacks.forEach(callback => {
      try {
        callback(weatherData)
      } catch (error) {
        console.error('Error in weather callback:', error)
      }
    })
  }

  // Force immediate update (for user-triggered refresh)
  async forceUpdate() {
    if (!this.currentLocation) {
      console.warn('Cannot force update: no location set')
      return
    }

    // Cancel current timer
    if (this.pollInterval) {
      clearTimeout(this.pollInterval)
      this.pollInterval = null
    }

    // Fetch immediately
    await this.fetchWeatherData()
  }

  // Get current poll status
  getStatus() {
    return {
      isPolling: this.isPolling,
      pollMode: this.currentPollMode,
      interval: this.pollIntervals[this.currentPollMode],
      location: this.currentLocation,
      lastUpdated: this.lastWeatherData?.lastUpdated,
      callbackCount: this.callbacks.size,
      retryCount: this.retryCount
    }
  }

  // Handle app going to background/foreground
  handleVisibilityChange() {
    if (document.hidden) {
      // App went to background - reduce polling frequency
      const backgroundMode = this.currentPollMode === 'critical' ? 'severe' : 
                            this.currentPollMode === 'severe' ? 'moderate' : 'normal'
      
      // Background mode (debug only)
      if (process.env.NODE_ENV === 'development' && window.DEBUG_WEATHER) {
        console.log(`App backgrounded, reducing poll mode to ${backgroundMode}`)
      }
      this.currentPollMode = backgroundMode
      
    } else {
      // App came to foreground - resume normal polling and force update
      // Foreground mode (debug only)
      if (process.env.NODE_ENV === 'development' && window.DEBUG_WEATHER) {
        console.log('App foregrounded, forcing weather update')
      }
      this.forceUpdate()
    }
  }

  // Clean up resources
  destroy() {
    this.stopPolling()
    this.callbacks.clear()
    this.currentLocation = null
    this.lastWeatherData = null
  }
}

// Singleton instance for app-wide use
let weatherPollerInstance = null

export function getWeatherPoller() {
  if (!weatherPollerInstance) {
    weatherPollerInstance = new WeatherPoller()
    
    // Handle visibility changes for background/foreground optimization
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        weatherPollerInstance.handleVisibilityChange()
      })
    }
  }
  
  return weatherPollerInstance
}

export default WeatherPoller