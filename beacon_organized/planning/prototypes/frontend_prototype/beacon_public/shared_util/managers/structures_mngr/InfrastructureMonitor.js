// ============================================================================
// STRUCTURES MANAGER - Building and infrastructure status monitoring
// ============================================================================

class InfrastructureMonitor {
  constructor() {
    this.buildings = new Map()
    this.bridges = new Map()
    this.roads = new Map()
    this.emergencyFacilities = new Map()
    this.isMonitoring = false
  }

  // Monitor building and infrastructure status during disasters
  async monitorInfrastructure(latitude, longitude, disasterType, severity) {
    try {
      const nearbyStructures = await this.findNearbyStructures(latitude, longitude)
      const structuralAssessment = await this.assessStructuralIntegrity(nearbyStructures, disasterType, severity)
      const safetyStatus = this.calculateSafetyStatus(structuralAssessment)

      return {
        structuralStatus: safetyStatus,
        buildings: structuralAssessment.buildings,
        infrastructure: structuralAssessment.infrastructure,
        emergencyFacilities: structuralAssessment.emergencyFacilities,
        recommendations: this.generateStructuralRecommendations(safetyStatus, disasterType),
        evacuationRoutes: await this.assessEvacuationRoutes(latitude, longitude, structuralAssessment),
        shelterOptions: this.findSafeShelters(nearbyStructures, structuralAssessment),
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Infrastructure monitoring error:', error)
      return { error: 'Unable to monitor infrastructure', timestamp: Date.now() }
    }
  }

  // Find nearby structures and buildings
  async findNearbyStructures(latitude, longitude, radiusKm = 5) {
    // Placeholder for structure database query
    return {
      buildings: [
        {
          id: 'bldg_001',
          name: 'City Hall',
          type: 'government',
          coordinates: { lat: latitude + 0.01, lng: longitude - 0.01 },
          height: 4, // floors
          constructionYear: 1985,
          buildingCode: 'modern',
          capacity: 500,
          hasGenerator: true,
          accessibility: true
        },
        {
          id: 'bldg_002',
          name: 'Memorial Hospital',
          type: 'hospital',
          coordinates: { lat: latitude - 0.005, lng: longitude + 0.008 },
          height: 8,
          constructionYear: 2010,
          buildingCode: 'seismic-compliant',
          capacity: 200,
          hasGenerator: true,
          accessibility: true
        },
        {
          id: 'bldg_003',
          name: 'Downtown Office Complex',
          type: 'commercial',
          coordinates: { lat: latitude + 0.003, lng: longitude + 0.002 },
          height: 15,
          constructionYear: 1978,
          buildingCode: 'older',
          capacity: 1000,
          hasGenerator: false,
          accessibility: false
        }
      ],
      infrastructure: [
        {
          id: 'bridge_001',
          name: 'Main Street Bridge',
          type: 'bridge',
          coordinates: { lat: latitude + 0.02, lng: longitude },
          constructionYear: 1995,
          inspectionDate: '2023-06-15',
          condition: 'good',
          capacity: 'unlimited'
        },
        {
          id: 'road_001',
          name: 'Highway 101',
          type: 'highway',
          coordinates: { lat: latitude, lng: longitude + 0.05 },
          condition: 'excellent',
          trafficCapacity: 'high',
          emergencyAccess: true
        }
      ]
    }
  }

  // Assess structural integrity based on disaster type
  async assessStructuralIntegrity(structures, disasterType, severity) {
    const assessment = {
      buildings: [],
      infrastructure: [],
      emergencyFacilities: []
    }

    // Assess buildings
    for (const building of structures.buildings) {
      const buildingAssessment = this.assessBuildingSafety(building, disasterType, severity)
      assessment.buildings.push(buildingAssessment)

      if (building.type === 'hospital' || building.type === 'fire_station' || building.type === 'police') {
        assessment.emergencyFacilities.push(buildingAssessment)
      }
    }

    // Assess infrastructure
    for (const infra of structures.infrastructure) {
      const infraAssessment = this.assessInfrastructureSafety(infra, disasterType, severity)
      assessment.infrastructure.push(infraAssessment)
    }

    return assessment
  }

  // Assess individual building safety
  assessBuildingSafety(building, disasterType, severity) {
    let safetyScore = 100
    let statusFactors = []

    // Age factor
    const age = new Date().getFullYear() - building.constructionYear
    if (age > 50) {
      safetyScore -= 30
      statusFactors.push('Older construction')
    } else if (age > 25) {
      safetyScore -= 15
      statusFactors.push('Aging infrastructure')
    }

    // Building code compliance
    if (building.buildingCode === 'older') {
      safetyScore -= 25
      statusFactors.push('Pre-modern building codes')
    } else if (building.buildingCode === 'seismic-compliant') {
      safetyScore += 10
      statusFactors.push('Seismic upgrades completed')
    }

    // Disaster-specific assessments
    switch (disasterType) {
      case 'earthquake':
        safetyScore = this.assessEarthquakeSafety(building, safetyScore, severity)
        break
      case 'flood':
        safetyScore = this.assessFloodSafety(building, safetyScore, severity)
        break
      case 'fire':
        safetyScore = this.assessFireSafety(building, safetyScore, severity)
        break
      case 'wind':
        safetyScore = this.assessWindSafety(building, safetyScore, severity)
        break
    }

    const safetyLevel = safetyScore >= 80 ? 'safe' :
                       safetyScore >= 60 ? 'caution' :
                       safetyScore >= 40 ? 'unsafe' : 'critical'

    return {
      ...building,
      safetyScore: Math.max(0, safetyScore),
      safetyLevel: safetyLevel,
      statusFactors: statusFactors,
      recommendation: this.getBuildingRecommendation(safetyLevel, building.type),
      lastAssessed: Date.now()
    }
  }

  // Earthquake-specific building assessment
  assessEarthquakeSafety(building, baseScore, severity) {
    let score = baseScore

    if (building.height > 10) score -= 20 // Tall buildings more vulnerable
    if (building.buildingCode !== 'seismic-compliant') score -= 30
    if (severity === 'extreme') score -= 25

    return score
  }

  // Flood-specific building assessment
  assessFloodSafety(building, baseScore, severity) {
    let score = baseScore

    // Check elevation (simplified)
    const elevation = Math.random() * 100 // Mock elevation data
    if (elevation < 10) score -= 40 // Low-lying areas
    if (building.type === 'hospital' && elevation < 20) score -= 20
    if (severity === 'extreme') score -= 20

    return score
  }

  // Fire-specific building assessment
  assessFireSafety(building, baseScore, severity) {
    let score = baseScore

    if (building.constructionYear < 1980) score -= 25 // Older fire codes
    if (building.height > 5) score -= 15 // Evacuation challenges
    if (severity === 'extreme') score -= 30

    return score
  }

  // Wind-specific building assessment
  assessWindSafety(building, baseScore, severity) {
    let score = baseScore

    if (building.height > 8) score -= 25 // Wind exposure
    if (building.constructionYear < 1990) score -= 20 // Older wind codes
    if (severity === 'extreme') score -= 35

    return score
  }

  // Assess infrastructure safety
  assessInfrastructureSafety(infrastructure, disasterType, severity) {
    let safetyScore = 100
    let statusFactors = []

    const age = new Date().getFullYear() - infrastructure.constructionYear
    if (age > 30) {
      safetyScore -= 25
      statusFactors.push('Aging infrastructure')
    }

    if (infrastructure.condition === 'poor') {
      safetyScore -= 40
      statusFactors.push('Poor maintenance condition')
    } else if (infrastructure.condition === 'fair') {
      safetyScore -= 20
      statusFactors.push('Fair condition')
    }

    // Disaster-specific factors
    if (disasterType === 'earthquake' && infrastructure.type === 'bridge') {
      safetyScore -= 30
      statusFactors.push('Seismic vulnerability')
    }

    if (disasterType === 'flood' && infrastructure.type === 'road') {
      safetyScore -= 35
      statusFactors.push('Flood exposure')
    }

    const safetyLevel = safetyScore >= 75 ? 'operational' :
                       safetyScore >= 50 ? 'limited' :
                       safetyScore >= 25 ? 'compromised' : 'failed'

    return {
      ...infrastructure,
      safetyScore: Math.max(0, safetyScore),
      safetyLevel: safetyLevel,
      statusFactors: statusFactors,
      lastAssessed: Date.now()
    }
  }

  // Calculate overall safety status
  calculateSafetyStatus(assessment) {
    const allStructures = [...assessment.buildings, ...assessment.infrastructure]

    if (allStructures.length === 0) return 'unknown'

    const averageScore = allStructures.reduce((sum, item) => sum + item.safetyScore, 0) / allStructures.length
    const criticalCount = allStructures.filter(item => item.safetyLevel === 'critical' || item.safetyLevel === 'failed').length

    if (criticalCount > allStructures.length * 0.3) return 'critical'
    if (averageScore >= 75) return 'safe'
    if (averageScore >= 50) return 'caution'
    return 'unsafe'
  }

  // Generate structural recommendations
  generateStructuralRecommendations(safetyStatus, disasterType) {
    const recommendations = {
      critical: [
        'Evacuate all unsafe buildings immediately',
        'Avoid compromised infrastructure and roads',
        'Seek emergency shelter in designated safe zones',
        'Do not enter damaged buildings',
        'Wait for official structural assessments'
      ],
      unsafe: [
        'Avoid buildings with visible damage',
        'Use alternative routes around compromised infrastructure',
        'Gather in open areas away from tall structures',
        'Monitor official safety updates'
      ],
      caution: [
        'Inspect buildings for visible damage before entering',
        'Be aware of potential structural weaknesses',
        'Have evacuation plans ready',
        'Monitor structural safety updates'
      ],
      safe: [
        'Buildings appear structurally sound',
        'Continue monitoring for changes',
        'Follow emergency protocols'
      ]
    }

    return recommendations[safetyStatus] || recommendations.safe
  }

  // Assess evacuation routes
  async assessEvacuationRoutes(latitude, longitude, structuralAssessment) {
    const routes = []

    // Analyze road and bridge conditions
    const safeInfrastructure = structuralAssessment.infrastructure.filter(
      item => item.safetyLevel === 'operational' || item.safetyLevel === 'limited'
    )

    for (const infra of safeInfrastructure.slice(0, 3)) { // Top 3 routes
      routes.push({
        routeName: infra.name,
        condition: infra.safetyLevel,
        recommendation: infra.safetyLevel === 'operational' ? 'recommended' : 'use with caution',
        restrictions: infra.safetyLevel === 'limited' ? 'Reduced capacity' : 'None'
      })
    }

    return routes
  }

  // Find safe shelter options
  findSafeShelters(structures, assessment) {
    const safeShelters = assessment.buildings.filter(
      building => building.safetyLevel === 'safe' &&
                 (building.type === 'government' || building.type === 'hospital' || building.hasGenerator)
    )

    return safeShelters.map(shelter => ({
      name: shelter.name,
      type: shelter.type,
      capacity: shelter.capacity,
      facilities: this.getShelterFacilities(shelter),
      safetyRating: shelter.safetyLevel,
      accessibility: shelter.accessibility
    }))
  }

  getShelterFacilities(building) {
    const facilities = []
    if (building.hasGenerator) facilities.push('Emergency power')
    if (building.accessibility) facilities.push('ADA accessible')
    if (building.type === 'hospital') facilities.push('Medical care')
    if (building.type === 'government') facilities.push('Emergency coordination')
    return facilities
  }

  getBuildingRecommendation(safetyLevel, buildingType) {
    const recommendations = {
      safe: 'Safe for occupation and use',
      caution: 'Inspect before use, monitor for changes',
      unsafe: 'Avoid use, potential structural damage',
      critical: 'Do not enter, immediate evacuation required'
    }

    let rec = recommendations[safetyLevel]

    if (buildingType === 'hospital' && safetyLevel !== 'safe') {
      rec += ' - Coordinate patient transfers if needed'
    }

    return rec
  }

  // Start infrastructure monitoring
  startInfrastructureMonitoring(latitude, longitude) {
    this.isMonitoring = true
    console.log('Infrastructure monitoring started')
  }

  stopInfrastructureMonitoring() {
    this.isMonitoring = false
    console.log('Infrastructure monitoring stopped')
  }

  // Get monitoring status
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      buildingsTracked: this.buildings.size,
      infrastructureTracked: this.bridges.size + this.roads.size,
      emergencyFacilitiesTracked: this.emergencyFacilities.size,
      lastUpdate: Date.now()
    }
  }
}

export default InfrastructureMonitor