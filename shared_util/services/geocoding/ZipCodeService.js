// ============================================================================
// US ZIP CODE SERVICE - Comprehensive ZIP code to coordinates mapping
// ============================================================================

class ZipCodeService {
  constructor() {
    this.zipDatabase = null
    this.isLoaded = false
  }

  // Initialize ZIP code database (lazy loading)
  async initialize() {
    if (this.isLoaded) return true

    try {
      console.log('Loading US ZIP code database...')

      // In production, you'd load this from a JSON file or API
      // For now, we'll create a comprehensive sample database
      this.zipDatabase = await this.createZipDatabase()
      this.isLoaded = true

      console.log(`ZIP code database loaded: ${Object.keys(this.zipDatabase).length} ZIP codes`)
      return true

    } catch (error) {
      console.error('Failed to load ZIP code database:', error)
      return false
    }
  }

  // Look up coordinates for a ZIP code
  async lookup(zipCode) {
    // Ensure database is loaded
    if (!this.isLoaded) {
      await this.initialize()
    }

    if (!this.zipDatabase) {
      throw new Error('ZIP code database not available')
    }

    // Normalize ZIP code (remove spaces, ensure 5 digits)
    const normalizedZip = zipCode.toString().trim().padStart(5, '0')

    if (!/^\d{5}$/.test(normalizedZip)) {
      throw new Error('Invalid ZIP code format')
    }

    const result = this.zipDatabase[normalizedZip]
    if (!result) {
      throw new Error(`ZIP code ${normalizedZip} not found`)
    }

    return {
      zipCode: normalizedZip,
      latitude: result.lat,
      longitude: result.lng,
      city: result.city,
      state: result.state,
      county: result.county || null
    }
  }

  // Create comprehensive ZIP code database
  async createZipDatabase() {
    // This would normally be loaded from a JSON file
    // For demonstration, creating a substantial sample covering major areas
    return {
      // New York State
      '10001': { lat: 40.7505, lng: -73.9934, city: 'New York', state: 'NY', county: 'New York' },
      '10002': { lat: 40.7209, lng: -73.9896, city: 'New York', state: 'NY', county: 'New York' },
      '10003': { lat: 40.7316, lng: -73.9890, city: 'New York', state: 'NY', county: 'New York' },
      '10004': { lat: 40.7047, lng: -74.0142, city: 'New York', state: 'NY', county: 'New York' },
      '10005': { lat: 40.7067, lng: -74.0089, city: 'New York', state: 'NY', county: 'New York' },
      '10010': { lat: 40.7390, lng: -73.9820, city: 'New York', state: 'NY', county: 'New York' },
      '10011': { lat: 40.7414, lng: -74.0000, city: 'New York', state: 'NY', county: 'New York' },
      '10012': { lat: 40.7256, lng: -73.9986, city: 'New York', state: 'NY', county: 'New York' },
      '10013': { lat: 40.7193, lng: -74.0020, city: 'New York', state: 'NY', county: 'New York' },
      '10014': { lat: 40.7342, lng: -74.0070, city: 'New York', state: 'NY', county: 'New York' },
      '10016': { lat: 40.7450, lng: -73.9758, city: 'New York', state: 'NY', county: 'New York' },
      '10017': { lat: 40.7527, lng: -73.9707, city: 'New York', state: 'NY', county: 'New York' },
      '10018': { lat: 40.7549, lng: -73.9933, city: 'New York', state: 'NY', county: 'New York' },
      '10019': { lat: 40.7656, lng: -73.9877, city: 'New York', state: 'NY', county: 'New York' },
      '10020': { lat: 40.7589, lng: -73.9786, city: 'New York', state: 'NY', county: 'New York' },
      '10021': { lat: 40.7698, lng: -73.9589, city: 'New York', state: 'NY', county: 'New York' },
      '10022': { lat: 40.7587, lng: -73.9707, city: 'New York', state: 'NY', county: 'New York' },
      '10023': { lat: 40.7757, lng: -73.9825, city: 'New York', state: 'NY', county: 'New York' },
      '10024': { lat: 40.7881, lng: -73.9756, city: 'New York', state: 'NY', county: 'New York' },
      '10025': { lat: 40.7982, lng: -73.9663, city: 'New York', state: 'NY', county: 'New York' },

      // Pennsylvania
      '18428': { lat: 41.2033, lng: -75.1945, city: 'Lakeville', state: 'PA', county: 'Wayne' },
      '19104': { lat: 39.9526, lng: -75.1652, city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
      '19103': { lat: 39.9523, lng: -75.1638, city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
      '19102': { lat: 39.9500, lng: -75.1667, city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
      '19106': { lat: 39.9537, lng: -75.1430, city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
      '19107': { lat: 39.9445, lng: -75.1514, city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
      '15213': { lat: 40.4398, lng: -79.9441, city: 'Pittsburgh', state: 'PA', county: 'Allegheny' },
      '15232': { lat: 40.4563, lng: -79.9228, city: 'Pittsburgh', state: 'PA', county: 'Allegheny' },

      // California
      '90210': { lat: 34.0901, lng: -118.4065, city: 'Beverly Hills', state: 'CA', county: 'Los Angeles' },
      '90211': { lat: 34.0823, lng: -118.4009, city: 'Beverly Hills', state: 'CA', county: 'Los Angeles' },
      '90401': { lat: 34.0195, lng: -118.4912, city: 'Santa Monica', state: 'CA', county: 'Los Angeles' },
      '90402': { lat: 34.0208, lng: -118.4820, city: 'Santa Monica', state: 'CA', county: 'Los Angeles' },
      '94102': { lat: 37.7849, lng: -122.4094, city: 'San Francisco', state: 'CA', county: 'San Francisco' },
      '94103': { lat: 37.7716, lng: -122.4141, city: 'San Francisco', state: 'CA', county: 'San Francisco' },
      '94104': { lat: 37.7912, lng: -122.4013, city: 'San Francisco', state: 'CA', county: 'San Francisco' },
      '94105': { lat: 37.7886, lng: -122.3905, city: 'San Francisco', state: 'CA', county: 'San Francisco' },

      // Massachusetts
      '02108': { lat: 42.3601, lng: -71.0589, city: 'Boston', state: 'MA', county: 'Suffolk' },
      '02109': { lat: 42.3647, lng: -71.0536, city: 'Boston', state: 'MA', county: 'Suffolk' },
      '02110': { lat: 42.3584, lng: -71.0498, city: 'Boston', state: 'MA', county: 'Suffolk' },
      '02111': { lat: 42.3505, lng: -71.0634, city: 'Boston', state: 'MA', county: 'Suffolk' },
      '02115': { lat: 42.3467, lng: -71.0972, city: 'Boston', state: 'MA', county: 'Suffolk' },
      '02116': { lat: 42.3466, lng: -71.0788, city: 'Boston', state: 'MA', county: 'Suffolk' },

      // Washington DC Area
      '20001': { lat: 38.9072, lng: -77.0369, city: 'Washington', state: 'DC', county: 'District of Columbia' },
      '20002': { lat: 38.9007, lng: -76.9951, city: 'Washington', state: 'DC', county: 'District of Columbia' },
      '20003': { lat: 38.8814, lng: -76.9951, city: 'Washington', state: 'DC', county: 'District of Columbia' },
      '20004': { lat: 38.8853, lng: -77.0209, city: 'Washington', state: 'DC', county: 'District of Columbia' },
      '20005': { lat: 38.9007, lng: -77.0290, city: 'Washington', state: 'DC', county: 'District of Columbia' },

      // Florida
      '33101': { lat: 25.7839, lng: -80.2102, city: 'Miami', state: 'FL', county: 'Miami-Dade' },
      '33139': { lat: 25.7814, lng: -80.1373, city: 'Miami Beach', state: 'FL', county: 'Miami-Dade' },
      '33140': { lat: 25.7907, lng: -80.1420, city: 'Miami Beach', state: 'FL', county: 'Miami-Dade' },
      '32801': { lat: 28.5383, lng: -81.3792, city: 'Orlando', state: 'FL', county: 'Orange' },
      '32803': { lat: 28.5486, lng: -81.3712, city: 'Orlando', state: 'FL', county: 'Orange' },

      // Texas
      '77002': { lat: 29.7604, lng: -95.3698, city: 'Houston', state: 'TX', county: 'Harris' },
      '77003': { lat: 29.7589, lng: -95.3477, city: 'Houston', state: 'TX', county: 'Harris' },
      '75201': { lat: 32.7767, lng: -96.7970, city: 'Dallas', state: 'TX', county: 'Dallas' },
      '75202': { lat: 32.7831, lng: -96.8067, city: 'Dallas', state: 'TX', county: 'Dallas' },
      '78701': { lat: 30.2672, lng: -97.7431, city: 'Austin', state: 'TX', county: 'Travis' },

      // Illinois
      '60601': { lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL', county: 'Cook' },
      '60602': { lat: 41.8796, lng: -87.6355, city: 'Chicago', state: 'IL', county: 'Cook' },
      '60603': { lat: 41.8739, lng: -87.6291, city: 'Chicago', state: 'IL', county: 'Cook' },
      '60604': { lat: 41.8781, lng: -87.6345, city: 'Chicago', state: 'IL', county: 'Cook' },

      // Nevada
      '89101': { lat: 36.1699, lng: -115.1398, city: 'Las Vegas', state: 'NV', county: 'Clark' },
      '89102': { lat: 36.1662, lng: -115.1156, city: 'Las Vegas', state: 'NV', county: 'Clark' },

      // Georgia
      '30301': { lat: 33.7490, lng: -84.3880, city: 'Atlanta', state: 'GA', county: 'Fulton' },
      '30309': { lat: 33.7896, lng: -84.3823, city: 'Atlanta', state: 'GA', county: 'Fulton' },

      // Add more major metropolitan areas...
      // This is just a sample - in production you'd load all 41,000+ ZIP codes
    }
  }

  // Get statistics about loaded ZIP codes
  getStats() {
    if (!this.isLoaded || !this.zipDatabase) {
      return { loaded: false, count: 0 }
    }

    const states = new Set()
    const cities = new Set()

    Object.values(this.zipDatabase).forEach(zip => {
      states.add(zip.state)
      cities.add(`${zip.city}, ${zip.state}`)
    })

    return {
      loaded: true,
      totalZipCodes: Object.keys(this.zipDatabase).length,
      statesCovered: states.size,
      citiesCovered: cities.size,
      states: Array.from(states).sort()
    }
  }
}

export default ZipCodeService