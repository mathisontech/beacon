"""Main FastAPI application for wildfire tracking system."""
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import json
from datetime import datetime, timedelta

from database import (
    get_session, init_db, FireIncident, PublicReport, FirePrediction,
    WeatherData, User, Unit, UnitAssignment, ActivityLog, MutualAidRequest,
    RadioChannel, Message, MessageRecipient
)
from schemas import (
    PublicReportCreate,
    PublicReportResponse,
    FireIncidentCreate,
    FireIncidentResponse,
    FireIncidentDetail,
    PredictionRequest,
    PredictionResponse,
    WeatherDataCreate,
    UserCreate,
    UserResponse,
    UnitCreate,
    UnitUpdate,
    UnitResponse,
    UnitAssignmentCreate,
    UnitAssignmentResponse,
    ActivityLogCreate,
    ActivityLogResponse,
    DashboardStats,
    MutualAidRequestCreate,
    MutualAidRequestUpdate,
    MutualAidRequestResponse,
    RadioChannelCreate,
    RadioChannelResponse,
    MessageCreate,
    MessageResponse,
    MessageWithRecipients,
    MessageAcknowledgment
)
from fire_model import WildfireSpreadModel, LightweightFireModel

app = FastAPI(title="Wildfire Tracking System", version="1.0.0")

# CORS middleware for web dashboard and mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
fire_model = WildfireSpreadModel()
lightweight_model = LightweightFireModel()

# WebSocket connection manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    await init_db()


# ============================================================================
# FIRE INCIDENT ENDPOINTS
# ============================================================================

@app.post("/api/incidents", response_model=FireIncidentResponse)
async def create_fire_incident(
    incident: FireIncidentCreate,
    db: AsyncSession = Depends(get_session)
):
    """Create a new incident (fires, floods, traffic, etc.)."""
    new_incident = FireIncident(
        name=incident.name,
        incident_type=incident.incident_type,
        latitude=incident.latitude,
        longitude=incident.longitude,
        severity=incident.severity,
        description=incident.description,
        status="active"
    )

    db.add(new_incident)
    await db.commit()
    await db.refresh(new_incident)

    # Broadcast to connected clients
    await manager.broadcast({
        "type": "new_incident",
        "data": {
            "id": new_incident.id,
            "name": new_incident.name,
            "latitude": new_incident.latitude,
            "longitude": new_incident.longitude
        }
    })

    return new_incident


@app.get("/api/incidents", response_model=List[FireIncidentResponse])
async def get_all_incidents(
    status: str = None,
    db: AsyncSession = Depends(get_session)
):
    """Get all fire incidents, optionally filtered by status."""
    query = select(FireIncident)

    if status:
        query = query.where(FireIncident.status == status)

    result = await db.execute(query)
    incidents = result.scalars().all()

    return incidents


@app.get("/api/incidents/{incident_id}", response_model=FireIncidentDetail)
async def get_incident_detail(
    incident_id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get detailed information about a specific incident."""
    result = await db.execute(
        select(FireIncident).where(FireIncident.id == incident_id)
    )
    incident = result.scalar_one_or_none()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Get reports
    reports_result = await db.execute(
        select(PublicReport).where(PublicReport.incident_id == incident_id)
    )
    reports = reports_result.scalars().all()

    # Get latest prediction
    prediction_result = await db.execute(
        select(FirePrediction)
        .where(FirePrediction.incident_id == incident_id)
        .order_by(FirePrediction.prediction_time.desc())
        .limit(1)
    )
    latest_prediction = prediction_result.scalar_one_or_none()

    prediction_data = None
    if latest_prediction:
        prediction_data = {
            "spread_polygon": json.loads(latest_prediction.spread_polygon),
            "forecast_time": latest_prediction.forecast_time.isoformat(),
            "confidence": latest_prediction.confidence
        }

    return FireIncidentDetail(
        id=incident.id,
        name=incident.name,
        latitude=incident.latitude,
        longitude=incident.longitude,
        start_time=incident.start_time,
        status=incident.status,
        severity=incident.severity,
        area_hectares=incident.area_hectares,
        reports=[PublicReportResponse.from_orm(r) for r in reports],
        latest_prediction=prediction_data
    )


# ============================================================================
# PUBLIC REPORT ENDPOINTS (Mobile App)
# ============================================================================

@app.post("/api/reports", response_model=PublicReportResponse)
async def submit_public_report(
    report: PublicReportCreate,
    db: AsyncSession = Depends(get_session)
):
    """Submit a fire sighting report from the mobile app."""
    # If no incident_id provided, try to find nearest active incident
    incident_id = report.incident_id

    if not incident_id:
        # Find nearest active incident within 50km
        result = await db.execute(
            select(FireIncident).where(FireIncident.status == "active")
        )
        incidents = result.scalars().all()

        if incidents:
            # Simple distance calculation (should use proper geospatial in production)
            min_dist = float('inf')
            nearest_incident = None

            for incident in incidents:
                dist = ((incident.latitude - report.latitude) ** 2 +
                       (incident.longitude - report.longitude) ** 2) ** 0.5

                if dist < min_dist:
                    min_dist = dist
                    nearest_incident = incident

            if nearest_incident and min_dist < 0.5:  # ~50km
                incident_id = nearest_incident.id

    new_report = PublicReport(
        incident_id=incident_id,
        latitude=report.latitude,
        longitude=report.longitude,
        reporter_id=report.reporter_id,
        photo_url=report.photo_url,
        description=report.description,
        verified=False,
        confidence_score=0.7  # Default; can be improved with ML
    )

    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    # Broadcast new report
    await manager.broadcast({
        "type": "new_report",
        "data": {
            "id": new_report.id,
            "incident_id": incident_id,
            "latitude": new_report.latitude,
            "longitude": new_report.longitude
        }
    })

    return new_report


@app.get("/api/reports", response_model=List[PublicReportResponse])
async def get_reports(
    incident_id: int = None,
    verified: bool = None,
    db: AsyncSession = Depends(get_session)
):
    """Get public reports, optionally filtered."""
    query = select(PublicReport)

    if incident_id:
        query = query.where(PublicReport.incident_id == incident_id)

    if verified is not None:
        query = query.where(PublicReport.verified == verified)

    result = await db.execute(query)
    reports = result.scalars().all()

    return reports


# ============================================================================
# PREDICTION ENDPOINTS
# ============================================================================

@app.post("/api/predictions", response_model=PredictionResponse)
async def generate_prediction(
    request: PredictionRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Generate wildfire spread prediction using the accurate model.
    For Fire Department dashboard.
    """
    # Get incident
    result = await db.execute(
        select(FireIncident).where(FireIncident.id == request.incident_id)
    )
    incident = result.scalar_one_or_none()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Get recent crowd-sourced reports
    reports_result = await db.execute(
        select(PublicReport).where(PublicReport.incident_id == request.incident_id)
    )
    reports = reports_result.scalars().all()

    crowd_reports = [
        {"latitude": r.latitude, "longitude": r.longitude}
        for r in reports
    ]

    # Get weather data (mock for now; integrate real API in production)
    # For demo, use reasonable defaults
    wind_speed = 15.0  # km/h
    wind_direction = 270.0  # degrees
    temperature = 30.0  # Celsius
    humidity = 30.0  # percent

    # Generate prediction
    spread_polygon = fire_model.predict_spread_polygon(
        center_lat=incident.latitude,
        center_lon=incident.longitude,
        wind_speed=wind_speed,
        wind_direction=wind_direction,
        temperature=temperature,
        humidity=humidity,
        hours_ahead=request.hours_ahead,
        crowd_reports=crowd_reports
    )

    # Save prediction
    forecast_time = datetime.utcnow() + timedelta(hours=request.hours_ahead)

    new_prediction = FirePrediction(
        incident_id=request.incident_id,
        forecast_time=forecast_time,
        spread_polygon=json.dumps(spread_polygon),
        confidence=0.75,
        wind_speed=wind_speed,
        wind_direction=wind_direction,
        temperature=temperature,
        humidity=humidity
    )

    db.add(new_prediction)
    await db.commit()
    await db.refresh(new_prediction)

    # Broadcast prediction update
    await manager.broadcast({
        "type": "new_prediction",
        "data": {
            "incident_id": request.incident_id,
            "forecast_hours": request.hours_ahead
        }
    })

    return new_prediction


@app.get("/api/predictions/mobile/{incident_id}")
async def get_lightweight_prediction(
    incident_id: int,
    hours: int = 6,
    db: AsyncSession = Depends(get_session)
):
    """
    Get lightweight prediction for mobile devices.
    Uses simplified model for fast computation.
    """
    result = await db.execute(
        select(FireIncident).where(FireIncident.id == incident_id)
    )
    incident = result.scalar_one_or_none()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Use lightweight model
    spread_radius = lightweight_model.quick_predict(
        wind_speed=15.0,
        temperature=30.0,
        humidity=30.0,
        hours=hours
    )

    return {
        "incident_id": incident_id,
        "center_lat": incident.latitude,
        "center_lon": incident.longitude,
        "spread_radius_meters": spread_radius,
        "forecast_hours": hours,
        "model": "lightweight"
    }


# ============================================================================
# WEBSOCKET FOR REAL-TIME UPDATES
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()

            # Echo back for heartbeat
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ============================================================================
# UNIT MANAGEMENT ENDPOINTS (Command & Control)
# ============================================================================

@app.post("/api/units", response_model=UnitResponse)
async def create_unit(
    unit: UnitCreate,
    db: AsyncSession = Depends(get_session)
):
    """Create a new emergency response unit."""
    new_unit = Unit(
        unit_id=unit.unit_id,
        unit_type=unit.unit_type,
        organization=unit.organization,
        crew_count=unit.crew_count,
        capabilities=unit.capabilities,
        status="available"
    )

    db.add(new_unit)
    await db.commit()
    await db.refresh(new_unit)

    return new_unit


@app.get("/api/units", response_model=List[UnitResponse])
async def get_all_units(
    status: str = None,
    unit_type: str = None,
    db: AsyncSession = Depends(get_session)
):
    """Get all units, optionally filtered by status or type."""
    query = select(Unit)

    if status:
        query = query.where(Unit.status == status)
    if unit_type:
        query = query.where(Unit.unit_type == unit_type)

    result = await db.execute(query)
    units = result.scalars().all()

    return units


@app.get("/api/units/{unit_id}", response_model=UnitResponse)
async def get_unit(
    unit_id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get a specific unit by ID."""
    result = await db.execute(
        select(Unit).where(Unit.id == unit_id)
    )
    unit = result.scalar_one_or_none()

    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    return unit


@app.patch("/api/units/{unit_id}", response_model=UnitResponse)
async def update_unit(
    unit_id: int,
    update: UnitUpdate,
    db: AsyncSession = Depends(get_session)
):
    """Update unit status and location."""
    result = await db.execute(
        select(Unit).where(Unit.id == unit_id)
    )
    unit = result.scalar_one_or_none()

    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    if update.status:
        unit.status = update.status
    if update.latitude is not None:
        unit.latitude = update.latitude
    if update.longitude is not None:
        unit.longitude = update.longitude
    if update.crew_count is not None:
        unit.crew_count = update.crew_count

    unit.last_update = datetime.utcnow()

    await db.commit()
    await db.refresh(unit)

    # Broadcast update
    await manager.broadcast({
        "type": "unit_update",
        "data": {
            "unit_id": unit.id,
            "status": unit.status,
            "latitude": unit.latitude,
            "longitude": unit.longitude
        }
    })

    return unit


# ============================================================================
# UNIT ASSIGNMENT ENDPOINTS
# ============================================================================

@app.post("/api/assignments", response_model=UnitAssignmentResponse)
async def assign_unit_to_incident(
    assignment: UnitAssignmentCreate,
    db: AsyncSession = Depends(get_session)
):
    """Assign a unit to an incident."""
    # Create assignment
    new_assignment = UnitAssignment(
        unit_id=assignment.unit_id,
        incident_id=assignment.incident_id,
        assigned_by=assignment.assigned_by,
        role_at_scene=assignment.role_at_scene
    )

    db.add(new_assignment)

    # Update unit status
    result = await db.execute(
        select(Unit).where(Unit.id == assignment.unit_id)
    )
    unit = result.scalar_one_or_none()

    if unit:
        unit.status = "en_route"
        unit.last_update = datetime.utcnow()

    # Log activity
    log = ActivityLog(
        incident_id=assignment.incident_id,
        action_type="unit_assigned",
        description=f"Unit {unit.unit_id if unit else assignment.unit_id} assigned to incident",
        severity="info"
    )
    db.add(log)

    await db.commit()
    await db.refresh(new_assignment)

    # Broadcast assignment
    await manager.broadcast({
        "type": "unit_assigned",
        "data": {
            "unit_id": assignment.unit_id,
            "incident_id": assignment.incident_id
        }
    })

    return new_assignment


@app.get("/api/assignments/incident/{incident_id}", response_model=List[UnitAssignmentResponse])
async def get_incident_assignments(
    incident_id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get all unit assignments for an incident."""
    result = await db.execute(
        select(UnitAssignment)
        .where(UnitAssignment.incident_id == incident_id)
        .where(UnitAssignment.cleared_at.is_(None))
    )
    assignments = result.scalars().all()

    # Fetch unit details for each assignment
    for assignment in assignments:
        unit_result = await db.execute(
            select(Unit).where(Unit.id == assignment.unit_id)
        )
        assignment.unit = unit_result.scalar_one_or_none()

    return assignments


@app.patch("/api/assignments/{assignment_id}/clear")
async def clear_assignment(
    assignment_id: int,
    db: AsyncSession = Depends(get_session)
):
    """Clear a unit assignment (unit returning to service)."""
    result = await db.execute(
        select(UnitAssignment).where(UnitAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.cleared_at = datetime.utcnow()

    # Update unit status to available
    unit_result = await db.execute(
        select(Unit).where(Unit.id == assignment.unit_id)
    )
    unit = unit_result.scalar_one_or_none()

    if unit:
        unit.status = "available"
        unit.last_update = datetime.utcnow()

    await db.commit()

    return {"status": "cleared", "assignment_id": assignment_id}


# ============================================================================
# ACTIVITY LOG ENDPOINTS
# ============================================================================

@app.post("/api/activity", response_model=ActivityLogResponse)
async def create_activity_log(
    log: ActivityLogCreate,
    db: AsyncSession = Depends(get_session)
):
    """Create an activity log entry."""
    new_log = ActivityLog(
        incident_id=log.incident_id,
        user_id=log.user_id,
        action_type=log.action_type,
        description=log.description,
        severity=log.severity,
        metadata=log.metadata
    )

    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)

    # Broadcast activity
    await manager.broadcast({
        "type": "activity_log",
        "data": {
            "incident_id": log.incident_id,
            "description": log.description,
            "severity": log.severity
        }
    })

    return new_log


@app.get("/api/activity/incident/{incident_id}", response_model=List[ActivityLogResponse])
async def get_incident_activity(
    incident_id: int,
    limit: int = 50,
    db: AsyncSession = Depends(get_session)
):
    """Get activity log for an incident."""
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.incident_id == incident_id)
        .order_by(ActivityLog.timestamp.desc())
        .limit(limit)
    )
    logs = result.scalars().all()

    return logs


# ============================================================================
# MUTUAL AID REQUEST ENDPOINTS
# ============================================================================

@app.post("/api/mutual-aid", response_model=MutualAidRequestResponse)
async def create_mutual_aid_request(
    request: MutualAidRequestCreate,
    db: AsyncSession = Depends(get_session)
):
    """Create a new mutual aid / backup request."""
    # Generate unique request number
    incident_result = await db.execute(
        select(FireIncident).where(FireIncident.id == request.incident_id)
    )
    incident = incident_result.scalar_one_or_none()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Count existing requests for this incident to generate unique number
    count_result = await db.execute(
        select(MutualAidRequest).where(MutualAidRequest.incident_id == request.incident_id)
    )
    existing_count = len(count_result.scalars().all())

    # Generate request number like LAH-E101 (Location-Type-Number)
    incident_code = incident.name[:3].upper()
    resource_code = request.resource_type[0].upper()
    request_number = f"{incident_code}-{resource_code}{100 + existing_count + 1}"

    new_request = MutualAidRequest(
        request_number=request_number,
        incident_id=request.incident_id,
        requested_by=request.requested_by,
        requesting_agency=request.requesting_agency,
        request_type=request.request_type,
        resource_type=request.resource_type,
        quantity=request.quantity,
        priority=request.priority,
        reporting_location=request.reporting_location,
        travel_route=request.travel_route,
        incident_type=request.incident_type,
        justification=request.justification,
        notes=request.notes,
        status="pending"
    )

    db.add(new_request)

    # Log activity
    log = ActivityLog(
        incident_id=request.incident_id,
        action_type="mutual_aid_requested",
        description=f"Mutual aid requested: {request.quantity}x {request.resource_type} ({request.priority} priority)",
        severity="warning" if request.priority == "emergency" else "info"
    )
    db.add(log)

    await db.commit()
    await db.refresh(new_request)

    # Broadcast to connected clients
    await manager.broadcast({
        "type": "mutual_aid_request",
        "data": {
            "request_number": request_number,
            "incident_id": request.incident_id,
            "priority": request.priority
        }
    })

    return new_request


@app.get("/api/mutual-aid", response_model=List[MutualAidRequestResponse])
async def get_mutual_aid_requests(
    status: str = None,
    incident_id: int = None,
    db: AsyncSession = Depends(get_session)
):
    """Get all mutual aid requests, optionally filtered."""
    query = select(MutualAidRequest)

    if status:
        query = query.where(MutualAidRequest.status == status)
    if incident_id:
        query = query.where(MutualAidRequest.incident_id == incident_id)

    query = query.order_by(MutualAidRequest.request_time.desc())

    result = await db.execute(query)
    requests = result.scalars().all()

    return requests


@app.get("/api/mutual-aid/{request_id}", response_model=MutualAidRequestResponse)
async def get_mutual_aid_request(
    request_id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get a specific mutual aid request."""
    result = await db.execute(
        select(MutualAidRequest).where(MutualAidRequest.id == request_id)
    )
    aid_request = result.scalar_one_or_none()

    if not aid_request:
        raise HTTPException(status_code=404, detail="Mutual aid request not found")

    return aid_request


@app.patch("/api/mutual-aid/{request_id}", response_model=MutualAidRequestResponse)
async def update_mutual_aid_request(
    request_id: int,
    update: MutualAidRequestUpdate,
    db: AsyncSession = Depends(get_session)
):
    """Update a mutual aid request status."""
    result = await db.execute(
        select(MutualAidRequest).where(MutualAidRequest.id == request_id)
    )
    aid_request = result.scalar_one_or_none()

    if not aid_request:
        raise HTTPException(status_code=404, detail="Mutual aid request not found")

    # Update fields
    if update.status:
        old_status = aid_request.status
        aid_request.status = update.status

        # Update timeline based on status
        if update.status == "approved" and not aid_request.approved_time:
            aid_request.approved_time = datetime.utcnow()
        elif update.status == "dispatched" and not aid_request.dispatched_time:
            aid_request.dispatched_time = datetime.utcnow()
        elif update.status == "arrived" and not aid_request.arrived_time:
            aid_request.arrived_time = datetime.utcnow()
        elif update.status == "completed" and not aid_request.cleared_time:
            aid_request.cleared_time = datetime.utcnow()

        # Log status change
        log = ActivityLog(
            incident_id=aid_request.incident_id,
            action_type="mutual_aid_status_change",
            description=f"Mutual aid request {aid_request.request_number}: {old_status} → {update.status}",
            severity="info"
        )
        db.add(log)

    if update.approved_by:
        aid_request.approved_by = update.approved_by
    if update.responding_agency:
        aid_request.responding_agency = update.responding_agency
    if update.assigned_resources:
        aid_request.assigned_resources = update.assigned_resources
    if update.notes:
        aid_request.notes = update.notes

    await db.commit()
    await db.refresh(aid_request)

    # Broadcast update
    await manager.broadcast({
        "type": "mutual_aid_update",
        "data": {
            "request_id": request_id,
            "status": aid_request.status
        }
    })

    return aid_request


# ============================================================================
# DASHBOARD STATS ENDPOINT
# ============================================================================

@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_session)
):
    """Get statistics for command dashboard."""
    # Count incidents
    incidents_result = await db.execute(select(FireIncident))
    all_incidents = incidents_result.scalars().all()
    total_incidents = len(all_incidents)
    active_incidents = len([i for i in all_incidents if i.status == "active"])

    # Count units
    units_result = await db.execute(select(Unit))
    all_units = units_result.scalars().all()
    total_units = len(all_units)
    available_units = len([u for u in all_units if u.status == "available"])
    deployed_units = len([u for u in all_units if u.status in ["en_route", "on_scene"]])

    # Count personnel
    total_personnel = sum(u.crew_count for u in all_units)

    # Count pending mutual aid requests
    mutual_aid_result = await db.execute(
        select(MutualAidRequest).where(MutualAidRequest.status == "pending")
    )
    pending_mutual_aid = len(mutual_aid_result.scalars().all())

    return DashboardStats(
        total_incidents=total_incidents,
        active_incidents=active_incidents,
        total_units=total_units,
        available_units=available_units,
        deployed_units=deployed_units,
        total_personnel=total_personnel,
        pending_mutual_aid_requests=pending_mutual_aid
    )


# ============================================================================
# COMMUNICATIONS ENDPOINTS
# ============================================================================

@app.post("/api/radio-channels", response_model=RadioChannelResponse)
async def create_radio_channel(
    channel: RadioChannelCreate,
    db: AsyncSession = Depends(get_session)
):
    """Create a new radio channel for an incident."""
    new_channel = RadioChannel(
        incident_id=channel.incident_id,
        channel_name=channel.channel_name,
        channel_type=channel.channel_type,
        frequency=channel.frequency,
        assigned_to=channel.assigned_to,
        notes=channel.notes
    )
    db.add(new_channel)
    await db.commit()
    await db.refresh(new_channel)
    return new_channel


@app.get("/api/radio-channels/{incident_id}", response_model=List[RadioChannelResponse])
async def get_radio_channels(
    incident_id: int,
    db: AsyncSession = Depends(get_session)
):
    """Get all radio channels for an incident."""
    result = await db.execute(
        select(RadioChannel)
        .where(RadioChannel.incident_id == incident_id)
        .where(RadioChannel.status == "active")
        .order_by(RadioChannel.created_at)
    )
    channels = result.scalars().all()
    return channels


@app.post("/api/messages", response_model=MessageResponse)
async def send_message(
    message: MessageCreate,
    db: AsyncSession = Depends(get_session)
):
    """Send a message (broadcast, unit message, or alert)."""
    # Create the message
    new_message = Message(
        incident_id=message.incident_id,
        sender_name=message.sender_name,
        sender_role=message.sender_role,
        message_type=message.message_type,
        priority=message.priority,
        subject=message.subject,
        content=message.content,
        recipient_type=message.recipient_type,
        recipient_ids=message.recipient_ids,
        channel_id=message.channel_id,
        requires_acknowledgment=message.requires_acknowledgment,
        expires_at=message.expires_at
    )
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)

    # Create recipient records if specific units are targeted
    if message.recipient_type in ["specific_units", "division", "branch"]:
        recipient_list = json.loads(message.recipient_ids) if message.recipient_ids else []

        for recipient_name in recipient_list:
            # Try to find unit by unit_id
            unit_result = await db.execute(
                select(Unit).where(Unit.unit_id == recipient_name)
            )
            unit = unit_result.scalar_one_or_none()

            recipient = MessageRecipient(
                message_id=new_message.id,
                unit_id=unit.id if unit else None,
                recipient_name=recipient_name
            )
            db.add(recipient)

    elif message.recipient_type == "all_units":
        # Send to all deployed units
        units_result = await db.execute(
            select(Unit).where(Unit.status.in_(["en_route", "on_scene"]))
        )
        units = units_result.scalars().all()

        for unit in units:
            recipient = MessageRecipient(
                message_id=new_message.id,
                unit_id=unit.id,
                recipient_name=unit.unit_id
            )
            db.add(recipient)

    await db.commit()

    # Log the message in activity log
    log = ActivityLog(
        incident_id=message.incident_id,
        action_type="message_sent",
        description=f"{message.sender_name} sent {message.message_type} message: {message.subject or message.content[:50]}",
        severity="info" if message.priority == "routine" else ("warning" if message.priority == "urgent" else "critical")
    )
    db.add(log)
    await db.commit()

    return new_message


@app.get("/api/messages", response_model=List[MessageWithRecipients])
async def get_messages(
    incident_id: int = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_session)
):
    """Get messages for an incident or all recent messages."""
    query = select(Message).where(Message.is_active == True)

    if incident_id:
        query = query.where(Message.incident_id == incident_id)

    query = query.order_by(Message.sent_at.desc()).limit(limit)

    result = await db.execute(query)
    messages = result.scalars().all()

    # Load recipients for each message
    messages_with_recipients = []
    for msg in messages:
        recipients_result = await db.execute(
            select(MessageRecipient).where(MessageRecipient.message_id == msg.id)
        )
        recipients = recipients_result.scalars().all()

        msg_dict = {
            "id": msg.id,
            "incident_id": msg.incident_id,
            "sender_name": msg.sender_name,
            "sender_role": msg.sender_role,
            "message_type": msg.message_type,
            "priority": msg.priority,
            "subject": msg.subject,
            "content": msg.content,
            "recipient_type": msg.recipient_type,
            "recipient_ids": msg.recipient_ids,
            "sent_at": msg.sent_at,
            "expires_at": msg.expires_at,
            "channel_id": msg.channel_id,
            "requires_acknowledgment": msg.requires_acknowledgment,
            "is_active": msg.is_active,
            "recipients": recipients
        }
        messages_with_recipients.append(msg_dict)

    return messages_with_recipients


@app.post("/api/messages/{message_id}/acknowledge")
async def acknowledge_message(
    message_id: int,
    ack: MessageAcknowledgment,
    recipient_name: str,
    db: AsyncSession = Depends(get_session)
):
    """Acknowledge receipt of a message."""
    # Find the recipient record
    result = await db.execute(
        select(MessageRecipient)
        .where(MessageRecipient.message_id == message_id)
        .where(MessageRecipient.recipient_name == recipient_name)
    )
    recipient = result.scalar_one_or_none()

    if not recipient:
        raise HTTPException(status_code=404, detail="Message recipient not found")

    # Update acknowledgment
    recipient.acknowledged_at = datetime.utcnow()
    recipient.acknowledged_by = ack.acknowledged_by
    await db.commit()

    return {"status": "acknowledged", "message_id": message_id, "recipient": recipient_name}


@app.patch("/api/messages/{message_id}/read")
async def mark_message_read(
    message_id: int,
    recipient_name: str,
    db: AsyncSession = Depends(get_session)
):
    """Mark a message as read by a recipient."""
    result = await db.execute(
        select(MessageRecipient)
        .where(MessageRecipient.message_id == message_id)
        .where(MessageRecipient.recipient_name == recipient_name)
    )
    recipient = result.scalar_one_or_none()

    if not recipient:
        raise HTTPException(status_code=404, detail="Message recipient not found")

    recipient.read_at = datetime.utcnow()
    await db.commit()

    return {"status": "read", "message_id": message_id, "recipient": recipient_name}


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": "Emergency Management System API",
        "version": "2.0.0",
        "endpoints": {
            "incidents": "/api/incidents",
            "reports": "/api/reports",
            "predictions": "/api/predictions",
            "units": "/api/units",
            "assignments": "/api/assignments",
            "activity": "/api/activity",
            "mutual_aid": "/api/mutual-aid",
            "radio_channels": "/api/radio-channels",
            "messages": "/api/messages",
            "dashboard": "/api/dashboard/stats",
            "websocket": "/ws"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow()}
