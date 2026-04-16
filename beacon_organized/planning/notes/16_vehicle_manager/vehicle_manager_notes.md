# Vehicle Manager Module

## Vehicle Database

Auto-lookup from make/model/year using NHTSA vPIC API (free, covers all US-sold vehicles since 1981). Returns length, width, height, curb weight, drivetrain (2WD/4WD/AWD), wheelbase.

Supplemental data: turn radius from manufacturer specs (scraped/maintained manually for top 200 models), undercarriage clearance, towing capacity, passenger capacity. Updated annually.

Manual input fallback: user selects closest match from silhouette gallery (sedan, SUV, truck, van, motorcycle, ATV, snowmobile, bus, firetruck, ambulance, helicopter). Provides approximate dimensions.

## User Vehicle Profiles

Public users set default vehicle and up to 3 saved vehicles. When emergency notification fires, user prompted to confirm which vehicle they are in. Vehicle selection affects:
- Evacuation routing: turn radius constraints, road width minimums, clearance requirements
- Speed estimates: vehicle type + road surface + conditions = realistic travel time
- Capacity: occupant count for evacuation planning
- Capability: 4WD/AWD vehicles may get alternate routes through unpaved/snowy roads

## Special Vehicle Types

Snow tires/chains: user self-reports. Affects winter routing (chains required on certain mountain passes).

ATV/snowmobile: police/EMS in severe winter areas (e.g., Buffalo PD snow vehicles for 911 response when ambulances can't get through). These units draw patrol zones, split into groups, and coordinate coverage.

Undercarriage clearance: relevant for post-fire scenarios (driving over hot burned brush), flood wading depth, and debris-covered roads.

## EMS Vehicle Tracking

EMS vehicles tracked in real-time on dispatch layer. Vehicle type determines icon (firetruck, ambulance, police cruiser, helicopter, command vehicle). Occupant count displayed as badge. Equipment manifest per vehicle (e.g., ambulance has AED, oxygen, stretcher).

Resource manager aggregates: total vehicles available, deployed, en route, out of service. Feeds into mutual aid requests when local resources insufficient.

## Transit Integration

Base map includes all public transit with schedules: bus routes/stops (GTFS data from transit agencies), Greyhound terminals, Amtrak stations, cruise ship ports, airports, ferry terminals. Post-Katrina lesson: mass evacuation requires knowing where all transit options are and their capacity.

Transit capacity estimation: buses per route x capacity x estimated runs per hour = evacuation throughput. Critical for carless populations.
