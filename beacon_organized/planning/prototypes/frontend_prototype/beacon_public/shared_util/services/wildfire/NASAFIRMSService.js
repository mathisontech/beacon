/**
 * ============================================================================
 * NASA FIRMS (Fire Information for Resource Management System) API Service
 * ============================================================================
 *
 * Fetches real-time active fire data from NASA's MODIS and VIIRS satellites.
 *
 * FIRMS provides near real-time active fire locations from:
 * - MODIS (Moderate Resolution Imaging Spectroradiometer)
 * - VIIRS (Visible Infrared Imaging Radiometer Suite) - Higher resolution
 *
 * API Documentation: https://firms.modaps.eosdis.nasa.gov/api/
 *
 * NOTE: You need to register for a free MAP_KEY at:
 * https://firms.modaps.eosdis.nasa.gov/api/area/
 */

class NASAFIRMSService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || import.meta.env.VITE_NASA_FIRMS_API_KEY || 'YOUR_API_KEY_HERE'
    this.baseUrl = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv'
    this.cache = new Map()
    this.cacheTimeout = 10 * 60 * 1000 // 10 minutes
  }

  /**
   * Fetch active fires within a geographic area
   *
   * @param {number} minLat - Minimum latitude
   * @param {number} maxLat - Maximum latitude
   * @param {number} minLon - Minimum longitude
   * @param {number} maxLon - Maximum longitude
   * @param {string} source - Data source: 'MODIS_NRT' or 'VIIRS_NOAA20_NRT' or 'VIIRS_SNPP_NRT'
   * @param {number} dayRange - Number of days to look back (1-10)
   * @returns {Promise<Array>} Array of active fire objects
   */
  async getActiveFires(minLat, maxLat, minLon, maxLon, source = 'VIIRS_NOAA20_NRT', dayRange = 1) {
    const cacheKey = `${minLat},${maxLat},${minLon},${maxLon},${source},${dayRange}`

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('🔥 Using cached FIRMS data')
        return cached.data
      }
    }

    try {
      // Build request URL
      const url = `${this.baseUrl}/${this.apiKey}/${source}/${minLon},${minLat},${maxLon},${maxLat}/${dayRange}`

      console.log(`🛰️ Fetching FIRMS data from NASA...`)
      console.log(`   Source: ${source}`)
      console.log(`   Area: [${minLat}, ${minLon}] to [${maxLat}, ${maxLon}]`)
      console.log(`   Days: ${dayRange}`)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`FIRMS API Error: ${response.status} ${response.statusText}`)
      }

      const csvText = await response.text()

      // Parse CSV data
      const fires = this._parseCSV(csvText)

      console.log(`✅ Found ${fires.length} active fires`)

      // Cache the result
      this.cache.set(cacheKey, {
        data: fires,
        timestamp: Date.now()
      })

      return fires
    } catch (error) {
      console.error('❌ Error fetching FIRMS data:', error)
      return []
    }
  }

  /**
   * Get fires around a specific point with radius
   *
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radiusKm - Radius in kilometers
   * @param {string} source - Data source
   * @param {number} dayRange - Days to look back
   * @returns {Promise<Array>} Array of active fire objects
   */
  async getFiresNearLocation(lat, lon, radiusKm = 50, source = 'VIIRS_NOAA20_NRT', dayRange = 1) {
    // Convert radius to approximate lat/lon degrees
    // 1 degree latitude ≈ 111 km
    const latDelta = radiusKm / 111
    const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

    const minLat = lat - latDelta
    const maxLat = lat + latDelta
    const minLon = lon - lonDelta
    const maxLon = lon + lonDelta

    return this.getActiveFires(minLat, maxLat, minLon, maxLon, source, dayRange)
  }

  /**
   * Get fires for a predefined region (US states, countries, etc.)
   *
   * Common regions:
   * - Hawaii: [18.9, 22.3, -160.3, -154.8]
   * - California: [32.5, 42.0, -124.5, -114.1]
   * - Maui specifically: [20.5, 21.0, -156.7, -155.9]
   *
   * @param {string} region - Region identifier
   * @param {string} source - Data source
   * @param {number} dayRange - Days to look back
   * @returns {Promise<Array>} Array of active fire objects
   */
  async getFiresByRegion(region, source = 'VIIRS_NOAA20_NRT', dayRange = 1) {
    const regions = {
      'maui': [20.5, 21.0, -156.7, -155.9],
      'hawaii': [18.9, 22.3, -160.3, -154.8],
      'california': [32.5, 42.0, -124.5, -114.1],
      'pacific_northwest': [42.0, 49.0, -124.5, -116.5],
      'southwest': [31.0, 37.0, -114.8, -103.0]
    }

    const bounds = regions[region.toLowerCase()]
    if (!bounds) {
      throw new Error(`Unknown region: ${region}. Available: ${Object.keys(regions).join(', ')}`)
    }

    return this.getActiveFires(...bounds, source, dayRange)
  }

  /**
   * Parse CSV response from FIRMS API
   *
   * @private
   * @param {string} csvText - Raw CSV text
   * @returns {Array} Parsed fire objects
   */
  _parseCSV(csvText) {
    const lines = csvText.trim().split('\n')
    if (lines.length === 0) return []

    // First line is header
    const headers = lines[0].split(',')
    const fires = []

    // Parse each data line
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length !== headers.length) continue

      const fire = {}
      headers.forEach((header, index) => {
        fire[header.trim()] = values[index].trim()
      })

      // Convert numeric fields
      fire.latitude = parseFloat(fire.latitude)
      fire.longitude = parseFloat(fire.longitude)
      fire.brightness = parseFloat(fire.bright_ti4 || fire.bright_t31)
      fire.frp = parseFloat(fire.frp) // Fire Radiative Power (MW)
      fire.confidence = fire.confidence || fire.confidence_cat
      fire.acq_date = fire.acq_date
      fire.acq_time = fire.acq_time

      // Add derived fields
      fire.timestamp = this._parseDateTime(fire.acq_date, fire.acq_time)
      fire.severity = this._calculateSeverity(fire)

      fires.push(fire)
    }

    return fires
  }

  /**
   * Parse acquisition date and time into a timestamp
   *
   * @private
   * @param {string} date - Date string (YYYY-MM-DD)
   * @param {string} time - Time string (HHMM)
   * @returns {Date} JavaScript Date object
   */
  _parseDateTime(date, time) {
    const [year, month, day] = date.split('-').map(Number)
    const hours = Math.floor(time / 100)
    const minutes = time % 100
    return new Date(Date.UTC(year, month - 1, day, hours, minutes))
  }

  /**
   * Calculate fire severity based on FRP and confidence
   *
   * @private
   * @param {Object} fire - Fire object
   * @returns {number} Severity score 1-5
   */
  _calculateSeverity(fire) {
    const frp = fire.frp || 0
    const confidence = fire.confidence

    let score = 1

    // FRP-based scoring (Fire Radiative Power in MW)
    if (frp > 500) score = 5
    else if (frp > 200) score = 4
    else if (frp > 100) score = 3
    else if (frp > 50) score = 2

    // Adjust based on confidence
    if (confidence === 'low' || confidence === 'l') score = Math.max(1, score - 1)
    if (confidence === 'high' || confidence === 'h') score = Math.min(5, score + 1)

    return score
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get available data sources
   *
   * @returns {Array} List of available data sources
   */
  static getAvailableSources() {
    return [
      {
        id: 'VIIRS_NOAA20_NRT',
        name: 'VIIRS NOAA-20',
        resolution: '375m',
        description: 'Higher resolution, recommended for most use cases'
      },
      {
        id: 'VIIRS_SNPP_NRT',
        name: 'VIIRS S-NPP',
        resolution: '375m',
        description: 'Alternative VIIRS satellite'
      },
      {
        id: 'MODIS_NRT',
        name: 'MODIS Combined',
        resolution: '1km',
        description: 'Lower resolution but more established dataset'
      }
    ]
  }
}

export default NASAFIRMSService
