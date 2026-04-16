"""Script to populate database with demo data for testing."""
import asyncio
import sys
from datetime import datetime, timedelta
from database import async_session_maker, init_db, FireIncident, PublicReport, FirePrediction, Unit, UnitAssignment, ActivityLog
import json

async def create_demo_data():
    """Create demo incidents, reports, and predictions."""
    await init_db()

    async with async_session_maker() as session:
        # Create incidents - Lahaina, Maui focused (various types)
        incidents = [
            FireIncident(
                name="Lahaina Town Fire",
                incident_type="fire",
                latitude=20.8783,
                longitude=-156.6825,
                severity=5,
                status="active",
                area_hectares=890.0,
                description="Major structural fire spreading through historic district"
            ),
            FireIncident(
                name="Front Street Flooding",
                incident_type="flood",
                latitude=20.8700,
                longitude=-156.6780,
                severity=3,
                status="monitoring",
                area_hectares=12.5,
                description="Flash flooding from heavy rains, road closures in effect"
            ),
            FireIncident(
                name="Honoapiilani Hwy Jam",
                incident_type="traffic",
                latitude=20.9100,
                longitude=-156.6850,
                severity=2,
                status="active",
                area_hectares=0.0,
                description="Major traffic congestion due to evacuations"
            ),
            FireIncident(
                name="Lahainaluna Rd Barrier",
                incident_type="barrier",
                latitude=20.8850,
                longitude=-156.6750,
                severity=2,
                status="active",
                area_hectares=0.0,
                description="Road closure and checkpoint for emergency access only"
            ),
            FireIncident(
                name="West Maui Mountains Fire",
                incident_type="fire",
                latitude=20.9500,
                longitude=-156.6200,
                severity=4,
                status="active",
                area_hectares=567.3,
                description="Brush fire spreading upslope, wind-driven"
            )
        ]

        for incident in incidents:
            session.add(incident)

        await session.commit()

        # Refresh to get IDs
        for incident in incidents:
            await session.refresh(incident)

        print(f"Created {len(incidents)} incidents (fires, floods, traffic, barriers)")

        # Create public reports - Lahaina, Maui area
        reports_data = [
            # Reports for Lahaina Town Fire
            (incidents[0].id, 20.8883, -156.6725, "Fire spreading through town rapidly", True, 0.95),
            (incidents[0].id, 20.8683, -156.6925, "Multiple structures burning", True, 0.9),
            (incidents[0].id, 20.8983, -156.6625, "Heavy smoke over Front Street", True, 0.85),
            (incidents[0].id, 20.8583, -156.7025, "Evacuating historic district", True, 0.9),

            # Reports for Kaanapali Beach Fire
            (incidents[1].id, 20.9369, -156.6842, "Fire contained near resort area", True, 0.95),
            (incidents[1].id, 20.9169, -156.7042, "Crews have good perimeter", True, 0.85),

            # Reports for West Maui Mountains Fire
            (incidents[2].id, 20.9600, -156.6100, "Fire spreading upslope in brush", True, 0.9),
            (incidents[2].id, 20.9400, -156.6300, "Strong winds pushing fire north", True, 0.85),
            (incidents[2].id, 20.9700, -156.6000, "Spot fires in gulches", False, 0.7),
            (incidents[2].id, 20.9300, -156.6400, "Thick smoke hampering suppression", False, 0.75),
        ]

        for incident_id, lat, lon, desc, verified, conf in reports_data:
            report = PublicReport(
                incident_id=incident_id,
                latitude=lat,
                longitude=lon,
                description=desc,
                verified=verified,
                confidence_score=conf,
                reporter_id=f"user_{hash(desc) % 1000}"
            )
            session.add(report)

        await session.commit()
        print(f"Created {len(reports_data)} public reports")

        # Create predictions
        for incident in incidents:
            # Create a sample prediction polygon
            lat = incident.latitude
            lon = incident.longitude
            spread = 0.05  # ~5km spread

            polygon_coords = [
                [lon - spread, lat - spread],
                [lon + spread, lat - spread],
                [lon + spread, lat + spread],
                [lon - spread, lat + spread],
                [lon - spread, lat - spread]
            ]

            prediction_polygon = {
                "type": "Polygon",
                "coordinates": [polygon_coords],
                "properties": {
                    "rate_of_spread_m_per_hour": 150.0,
                    "total_spread_meters": 3600.0,
                    "prediction_hours": 24
                }
            }

            prediction = FirePrediction(
                incident_id=incident.id,
                forecast_time=datetime.utcnow() + timedelta(hours=24),
                spread_polygon=json.dumps(prediction_polygon),
                confidence=0.75,
                wind_speed=20.0,
                wind_direction=270.0,
                temperature=32.0,
                humidity=25.0
            )
            session.add(prediction)

        await session.commit()
        print(f"Created predictions for {len(incidents)} incidents")

        # Create emergency response units
        units = [
            # Maui Fire Department - Engines
            Unit(
                unit_id="E1",
                unit_type="engine",
                organization="Maui Fire Department",
                status="on_scene",
                latitude=20.8800,
                longitude=-156.6800,
                crew_count=4,
                capabilities=json.dumps({"water_capacity": 500, "equipment": ["hose", "ladder", "rescue"]})
            ),
            Unit(
                unit_id="E2",
                unit_type="engine",
                organization="Maui Fire Department",
                status="on_scene",
                latitude=20.8750,
                longitude=-156.6750,
                crew_count=4,
                capabilities=json.dumps({"water_capacity": 500, "equipment": ["hose", "ladder", "rescue"]})
            ),
            Unit(
                unit_id="E3",
                unit_type="engine",
                organization="Maui Fire Department",
                status="en_route",
                latitude=20.8900,
                longitude=-156.6700,
                crew_count=3,
                capabilities=json.dumps({"water_capacity": 500, "equipment": ["hose", "ladder"]})
            ),
            Unit(
                unit_id="E4",
                unit_type="engine",
                organization="Maui Fire Department",
                status="available",
                latitude=20.9000,
                longitude=-156.6850,
                crew_count=4,
                capabilities=json.dumps({"water_capacity": 500, "equipment": ["hose", "ladder", "rescue"]})
            ),
            # Ladder trucks
            Unit(
                unit_id="L1",
                unit_type="ladder",
                organization="Maui Fire Department",
                status="on_scene",
                latitude=20.8770,
                longitude=-156.6820,
                crew_count=3,
                capabilities=json.dumps({"ladder_height": 75, "equipment": ["aerial", "rescue"]})
            ),
            Unit(
                unit_id="L2",
                unit_type="ladder",
                organization="Maui Fire Department",
                status="available",
                latitude=20.9100,
                longitude=-156.6900,
                crew_count=3,
                capabilities=json.dumps({"ladder_height": 75, "equipment": ["aerial", "rescue"]})
            ),
            # Police units
            Unit(
                unit_id="PD1",
                unit_type="police",
                organization="Maui Police Department",
                status="on_scene",
                latitude=20.8820,
                longitude=-156.6760,
                crew_count=2,
                capabilities=json.dumps({"specialization": "traffic_control"})
            ),
            Unit(
                unit_id="PD2",
                unit_type="police",
                organization="Maui Police Department",
                status="on_scene",
                latitude=20.8700,
                longitude=-156.6780,
                crew_count=2,
                capabilities=json.dumps({"specialization": "evacuation"})
            ),
            Unit(
                unit_id="PD3",
                unit_type="police",
                organization="Maui Police Department",
                status="available",
                latitude=20.8950,
                longitude=-156.6800,
                crew_count=2,
                capabilities=json.dumps({"specialization": "patrol"})
            ),
            # Ambulances
            Unit(
                unit_id="AMB1",
                unit_type="ambulance",
                organization="Maui Emergency Medical Services",
                status="on_scene",
                latitude=20.8790,
                longitude=-156.6830,
                crew_count=2,
                capabilities=json.dumps({"equipment": ["ALS", "ventilator", "cardiac_monitor"]})
            ),
            Unit(
                unit_id="AMB2",
                unit_type="ambulance",
                organization="Maui Emergency Medical Services",
                status="available",
                latitude=20.8850,
                longitude=-156.6900,
                crew_count=2,
                capabilities=json.dumps({"equipment": ["BLS"]})
            ),
            # Helicopter
            Unit(
                unit_id="AIR1",
                unit_type="helicopter",
                organization="Hawaii Fire Department",
                status="en_route",
                latitude=20.9200,
                longitude=-156.6500,
                crew_count=3,
                capabilities=json.dumps({"equipment": ["water_bucket", "rescue_hoist"], "capacity": 1000})
            ),
            # Command vehicle
            Unit(
                unit_id="CMD1",
                unit_type="command",
                organization="Maui Fire Department",
                status="on_scene",
                latitude=20.8785,
                longitude=-156.6820,
                crew_count=2,
                capabilities=json.dumps({"equipment": ["communications", "incident_command"]})
            )
        ]

        for unit in units:
            session.add(unit)

        await session.commit()

        # Refresh to get IDs
        for unit in units:
            await session.refresh(unit)

        print(f"Created {len(units)} emergency response units")

        # Create unit assignments
        assignments = [
            # Lahaina Town Fire (incidents[0]) - Multiple units assigned
            UnitAssignment(
                unit_id=units[0].id,  # E1
                incident_id=incidents[0].id,
                assigned_by="Fire Chief Thompson",
                role_at_scene="attack"
            ),
            UnitAssignment(
                unit_id=units[1].id,  # E2
                incident_id=incidents[0].id,
                assigned_by="Fire Chief Thompson",
                role_at_scene="attack"
            ),
            UnitAssignment(
                unit_id=units[4].id,  # L1
                incident_id=incidents[0].id,
                assigned_by="Fire Chief Thompson",
                role_at_scene="support"
            ),
            UnitAssignment(
                unit_id=units[6].id,  # PD1
                incident_id=incidents[0].id,
                assigned_by="Police Chief Kealoha",
                role_at_scene="evacuation"
            ),
            UnitAssignment(
                unit_id=units[9].id,  # AMB1
                incident_id=incidents[0].id,
                assigned_by="EMS Dispatch",
                role_at_scene="medical"
            ),
            UnitAssignment(
                unit_id=units[12].id,  # CMD1
                incident_id=incidents[0].id,
                assigned_by="Fire Chief Thompson",
                role_at_scene="command"
            ),
            # Front Street Flooding (incidents[1])
            UnitAssignment(
                unit_id=units[7].id,  # PD2
                incident_id=incidents[1].id,
                assigned_by="Police Chief Kealoha",
                role_at_scene="traffic_control"
            ),
            # West Maui Mountains Fire (incidents[4])
            UnitAssignment(
                unit_id=units[2].id,  # E3
                incident_id=incidents[4].id,
                assigned_by="Fire Chief Thompson",
                role_at_scene="attack"
            ),
            UnitAssignment(
                unit_id=units[11].id,  # AIR1
                incident_id=incidents[4].id,
                assigned_by="Fire Chief Thompson",
                role_at_scene="aerial_attack"
            )
        ]

        for assignment in assignments:
            session.add(assignment)

        await session.commit()
        print(f"Created {len(assignments)} unit assignments")

        # Create activity logs
        activity_logs = [
            ActivityLog(
                incident_id=incidents[0].id,
                action_type="incident_created",
                description="Lahaina Town Fire reported - multiple structures involved",
                severity="critical"
            ),
            ActivityLog(
                incident_id=incidents[0].id,
                action_type="unit_assigned",
                description="Engine 1 (E1) dispatched to scene",
                severity="info"
            ),
            ActivityLog(
                incident_id=incidents[0].id,
                action_type="unit_assigned",
                description="Engine 2 (E2) dispatched to scene",
                severity="info"
            ),
            ActivityLog(
                incident_id=incidents[0].id,
                action_type="backup_requested",
                description="Fire Chief requesting additional units - fire spreading rapidly",
                severity="warning"
            ),
            ActivityLog(
                incident_id=incidents[0].id,
                action_type="unit_assigned",
                description="Ladder 1 (L1) dispatched for aerial operations",
                severity="info"
            ),
            ActivityLog(
                incident_id=incidents[0].id,
                action_type="status_change",
                description="Command Post established at Lahaina Civic Center",
                severity="info"
            ),
            ActivityLog(
                incident_id=incidents[1].id,
                action_type="incident_created",
                description="Flash flooding reported on Front Street",
                severity="warning"
            ),
            ActivityLog(
                incident_id=incidents[4].id,
                action_type="incident_created",
                description="Brush fire in West Maui Mountains - wind-driven spread",
                severity="critical"
            ),
            ActivityLog(
                incident_id=incidents[4].id,
                action_type="unit_assigned",
                description="Helicopter AIR1 dispatched for water drops",
                severity="info"
            )
        ]

        for log in activity_logs:
            session.add(log)

        await session.commit()
        print(f"Created {len(activity_logs)} activity log entries")

        print("\n✅ Demo data created successfully!")
        print("\n" + "="*60)
        print("LAHAINA 2023 EMERGENCY MANAGEMENT SIMULATION")
        print("="*60)
        print("\nINCIDENTS:")
        print(f"  - {len(incidents)} active incidents")
        print(f"    • Lahaina Town Fire (Severity 5) - CRITICAL")
        print(f"    • Front Street Flooding (Severity 3)")
        print(f"    • Traffic Jam on Honoapiilani Hwy (Severity 2)")
        print(f"    • Road Barrier on Lahainaluna Rd (Severity 2)")
        print(f"    • West Maui Mountains Fire (Severity 4) - CRITICAL")
        print("\nRESOURCES DEPLOYED:")
        print(f"  - {len(units)} emergency units")
        print(f"    • 4 Fire Engines")
        print(f"    • 2 Ladder Trucks")
        print(f"    • 3 Police Units")
        print(f"    • 2 Ambulances")
        print(f"    • 1 Helicopter")
        print(f"    • 1 Command Vehicle")
        print(f"\nDATA:")
        print(f"  - {len(reports_data)} crowd-sourced public reports")
        print(f"  - {len(incidents)} fire spread predictions")
        print(f"  - {len(assignments)} active unit assignments")
        print(f"  - {len(activity_logs)} activity log entries")
        print("\n" + "="*60)
        print("Access the system:")
        print("  - Command Dashboard: http://localhost:3000")
        print("  - API Documentation: http://localhost:8000/docs")
        print("  - WebSocket: ws://localhost:8000/ws")
        print("="*60 + "\n")


if __name__ == "__main__":
    print("Creating demo data for Emergency Management System...\n")
    print("Simulating Lahaina 2023 Emergency Response\n")
    asyncio.run(create_demo_data())
