"""Database configuration and models for wildfire tracking system."""
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite+aiosqlite:///./wildfire_tracker.db"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


class FireIncident(Base):
    """Main incident tracking - fires, floods, traffic, barriers, etc."""
    __tablename__ = "fire_incidents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    incident_type = Column(String, default="fire")  # fire, flood, traffic, barrier, medical, hazmat, other
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")  # active, contained, resolved, monitoring
    severity = Column(Integer, default=1)  # 1-5 scale
    area_hectares = Column(Float, default=0.0)
    description = Column(Text, nullable=True)  # Additional details

    # Relationships
    reports = relationship("PublicReport", back_populates="incident")
    predictions = relationship("FirePrediction", back_populates="incident")


class PublicReport(Base):
    """Crowd-sourced fire sighting reports from mobile app."""
    __tablename__ = "public_reports"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("fire_incidents.id"))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    reporter_id = Column(String, nullable=True)  # Anonymous or user ID
    photo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    verified = Column(Boolean, default=False)
    confidence_score = Column(Float, default=0.5)  # ML-assigned confidence

    # Relationship
    incident = relationship("FireIncident", back_populates="reports")


class FirePrediction(Base):
    """Wildfire spread predictions over time."""
    __tablename__ = "fire_predictions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("fire_incidents.id"))
    prediction_time = Column(DateTime, default=datetime.utcnow)
    forecast_time = Column(DateTime, nullable=False)  # Time being predicted
    model_version = Column(String, default="v1.0")

    # Prediction data stored as GeoJSON or similar
    spread_polygon = Column(Text, nullable=False)  # JSON string of coordinates
    confidence = Column(Float, default=0.7)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)

    # Relationship
    incident = relationship("FireIncident", back_populates="predictions")


class WeatherData(Base):
    """Weather data for fire spread modeling."""
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    temperature = Column(Float)  # Celsius
    humidity = Column(Float)  # Percentage
    wind_speed = Column(Float)  # km/h
    wind_direction = Column(Float)  # Degrees
    precipitation = Column(Float)  # mm


class User(Base):
    """User accounts with role-based access."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="public")  # public, field_personnel, fire_chief, police_chief, dispatch, government, utility
    organization = Column(String, nullable=True)  # Fire Dept, Police Dept, Public Works, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    phone = Column(String, nullable=True)

    # Relationships
    activity_logs = relationship("ActivityLog", back_populates="user")


class Unit(Base):
    """Emergency response units - fire trucks, police cars, ambulances, etc."""
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(String, unique=True, nullable=False, index=True)  # E1, L3, PD12, AMB5, AIR1
    unit_type = Column(String, nullable=False)  # engine, ladder, police, ambulance, helicopter, command
    organization = Column(String, nullable=False)  # Maui Fire Dept, Maui Police, etc.
    status = Column(String, default="available")  # available, en_route, on_scene, returning, out_of_service
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_update = Column(DateTime, default=datetime.utcnow)
    crew_count = Column(Integer, default=0)
    capabilities = Column(Text, nullable=True)  # JSON: water capacity, equipment, specializations

    # Relationships
    assignments = relationship("UnitAssignment", back_populates="unit")


class UnitAssignment(Base):
    """Track which units are assigned to which incidents."""
    __tablename__ = "unit_assignments"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    incident_id = Column(Integer, ForeignKey("fire_incidents.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    cleared_at = Column(DateTime, nullable=True)
    assigned_by = Column(String, nullable=True)  # User who assigned
    role_at_scene = Column(String, nullable=True)  # attack, support, medical, evacuation, command

    # Relationships
    unit = relationship("Unit", back_populates="assignments")
    incident = relationship("FireIncident")


class ActivityLog(Base):
    """Activity and communication log for incident command."""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("fire_incidents.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action_type = Column(String, nullable=False)  # unit_assigned, status_change, backup_requested, report_submitted
    description = Column(Text, nullable=False)
    severity = Column(String, default="info")  # info, warning, critical
    extra_data = Column(Text, nullable=True)  # JSON for additional data

    # Relationships
    incident = relationship("FireIncident")
    user = relationship("User", back_populates="activity_logs")


class MutualAidRequest(Base):
    """Mutual aid / backup requests following ICS protocols."""
    __tablename__ = "mutual_aid_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String, unique=True, nullable=False, index=True)  # e.g., LAH-E101
    incident_id = Column(Integer, ForeignKey("fire_incidents.id"), nullable=False)
    requested_by = Column(String, nullable=False)  # Fire Chief name
    requesting_agency = Column(String, nullable=False)  # e.g., Maui Fire Department

    # Request details
    request_type = Column(String, nullable=False)  # strike_team, task_force, single_resource
    resource_type = Column(String, nullable=False)  # engine, ladder, ambulance, police, mixed
    quantity = Column(Integer, default=1)
    priority = Column(String, default="normal")  # routine, urgent, emergency

    # Incident details
    reporting_location = Column(String, nullable=False)  # Where resources should report
    travel_route = Column(Text, nullable=True)  # Suggested route
    incident_type = Column(String, nullable=False)  # fire, flood, etc.
    justification = Column(Text, nullable=False)  # Why backup is needed

    # Timeline tracking
    request_time = Column(DateTime, default=datetime.utcnow)
    approved_time = Column(DateTime, nullable=True)
    dispatched_time = Column(DateTime, nullable=True)
    arrived_time = Column(DateTime, nullable=True)
    cleared_time = Column(DateTime, nullable=True)

    # Status tracking
    status = Column(String, default="pending")  # pending, approved, dispatched, arrived, completed, denied, cancelled
    approved_by = Column(String, nullable=True)
    responding_agency = Column(String, nullable=True)
    assigned_resources = Column(Text, nullable=True)  # JSON list of unit IDs

    # Notes and communication
    notes = Column(Text, nullable=True)

    # Relationships
    incident = relationship("FireIncident")


class RadioChannel(Base):
    """Radio channel assignments following ICS communications structure."""
    __tablename__ = "radio_channels"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("fire_incidents.id"), nullable=False)
    channel_name = Column(String, nullable=False)  # e.g., "Command", "Tactical 1", "Branch Alpha"
    channel_type = Column(String, nullable=False)  # command, tactical, branch, division, logistics
    frequency = Column(String, nullable=True)  # Radio frequency if applicable
    assigned_to = Column(String, nullable=True)  # Unit IDs or Division name (JSON list)
    status = Column(String, default="active")  # active, standby, inactive
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    # Relationships
    incident = relationship("FireIncident")


class Message(Base):
    """Communications messages for incident command - broadcasts, unit messages, alerts."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("fire_incidents.id"), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sender_name = Column(String, nullable=False)  # Display name
    sender_role = Column(String, nullable=True)  # fire_chief, incident_commander, etc.

    # Message details
    message_type = Column(String, nullable=False)  # broadcast, unit_message, alert, status_update
    priority = Column(String, default="routine")  # routine, urgent, emergency
    subject = Column(String, nullable=True)
    content = Column(Text, nullable=False)

    # Recipient targeting
    recipient_type = Column(String, nullable=False)  # all_units, specific_units, division, branch, agency
    recipient_ids = Column(Text, nullable=True)  # JSON list of unit IDs or division names

    # Timing
    sent_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # For time-sensitive alerts

    # Channel information
    channel_id = Column(Integer, ForeignKey("radio_channels.id"), nullable=True)

    # Status
    requires_acknowledgment = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    incident = relationship("FireIncident")
    sender = relationship("User")
    channel = relationship("RadioChannel")
    recipients = relationship("MessageRecipient", back_populates="message")


class MessageRecipient(Base):
    """Track message delivery and acknowledgment status."""
    __tablename__ = "message_recipients"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)
    recipient_name = Column(String, nullable=False)  # Unit ID or personnel name

    # Status tracking
    delivered_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String, nullable=True)  # Name of person who acknowledged

    # Relationships
    message = relationship("Message", back_populates="recipients")
    unit = relationship("Unit")


async def get_session() -> AsyncSession:
    """Dependency for getting database sessions."""
    async with async_session_maker() as session:
        yield session


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
