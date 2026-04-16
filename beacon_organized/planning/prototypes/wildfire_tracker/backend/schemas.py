"""Pydantic schemas for API request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PublicReportCreate(BaseModel):
    """Schema for creating a public fire report."""
    incident_id: Optional[int] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    reporter_id: Optional[str] = None
    photo_url: Optional[str] = None
    description: Optional[str] = None


class PublicReportResponse(BaseModel):
    """Schema for public report response."""
    id: int
    incident_id: Optional[int]
    latitude: float
    longitude: float
    timestamp: datetime
    verified: bool
    confidence_score: float
    description: Optional[str]

    class Config:
        from_attributes = True


class FireIncidentCreate(BaseModel):
    """Schema for creating an incident."""
    name: str
    incident_type: str = Field(default="fire")  # fire, flood, traffic, barrier, medical, hazmat, other
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    severity: int = Field(default=1, ge=1, le=5)
    description: Optional[str] = None


class FireIncidentResponse(BaseModel):
    """Schema for incident response."""
    id: int
    name: str
    incident_type: str
    latitude: float
    longitude: float
    start_time: datetime
    status: str
    severity: int
    area_hectares: float
    description: Optional[str]

    class Config:
        from_attributes = True


class FireIncidentDetail(FireIncidentResponse):
    """Detailed fire incident with reports and predictions."""
    reports: List[PublicReportResponse] = []
    latest_prediction: Optional[dict] = None


class PredictionRequest(BaseModel):
    """Request for fire spread prediction."""
    incident_id: int
    hours_ahead: int = Field(default=24, ge=1, le=168)  # 1 hour to 7 days


class PredictionResponse(BaseModel):
    """Fire spread prediction response."""
    id: int
    incident_id: int
    prediction_time: datetime
    forecast_time: datetime
    spread_polygon: str  # GeoJSON string
    confidence: float
    wind_speed: Optional[float]
    wind_direction: Optional[float]
    temperature: Optional[float]
    humidity: Optional[float]

    class Config:
        from_attributes = True


class WeatherDataCreate(BaseModel):
    """Schema for weather data."""
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: float
    precipitation: float = 0.0


class CoordinatePoint(BaseModel):
    """Simple coordinate point."""
    latitude: float
    longitude: float


# ============================================================================
# USER AND AUTHENTICATION SCHEMAS
# ============================================================================

class UserCreate(BaseModel):
    """Schema for creating a user."""
    username: str
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = Field(default="public")  # public, field_personnel, fire_chief, police_chief, dispatch, government, utility
    organization: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    organization: Optional[str]
    created_at: datetime
    is_active: bool
    phone: Optional[str]

    class Config:
        from_attributes = True


# ============================================================================
# UNIT AND RESOURCE SCHEMAS
# ============================================================================

class UnitCreate(BaseModel):
    """Schema for creating an emergency unit."""
    unit_id: str  # E1, L3, PD12, AMB5, AIR1
    unit_type: str  # engine, ladder, police, ambulance, helicopter, command
    organization: str
    crew_count: int = 0
    capabilities: Optional[str] = None  # JSON string


class UnitUpdate(BaseModel):
    """Schema for updating unit status and location."""
    status: Optional[str] = None  # available, en_route, on_scene, returning, out_of_service
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    crew_count: Optional[int] = None


class UnitResponse(BaseModel):
    """Schema for unit response."""
    id: int
    unit_id: str
    unit_type: str
    organization: str
    status: str
    latitude: Optional[float]
    longitude: Optional[float]
    last_update: datetime
    crew_count: int
    capabilities: Optional[str]

    class Config:
        from_attributes = True


# ============================================================================
# UNIT ASSIGNMENT SCHEMAS
# ============================================================================

class UnitAssignmentCreate(BaseModel):
    """Schema for assigning a unit to an incident."""
    unit_id: int
    incident_id: int
    assigned_by: Optional[str] = None
    role_at_scene: Optional[str] = None  # attack, support, medical, evacuation, command


class UnitAssignmentResponse(BaseModel):
    """Schema for unit assignment response."""
    id: int
    unit_id: int
    incident_id: int
    assigned_at: datetime
    cleared_at: Optional[datetime]
    assigned_by: Optional[str]
    role_at_scene: Optional[str]
    unit: Optional[UnitResponse] = None

    class Config:
        from_attributes = True


# ============================================================================
# ACTIVITY LOG SCHEMAS
# ============================================================================

class ActivityLogCreate(BaseModel):
    """Schema for creating an activity log entry."""
    incident_id: Optional[int] = None
    user_id: Optional[int] = None
    action_type: str  # unit_assigned, status_change, backup_requested, report_submitted
    description: str
    severity: str = Field(default="info")  # info, warning, critical
    extra_data: Optional[str] = None  # JSON string


class ActivityLogResponse(BaseModel):
    """Schema for activity log response."""
    id: int
    incident_id: Optional[int]
    user_id: Optional[int]
    timestamp: datetime
    action_type: str
    description: str
    severity: str
    extra_data: Optional[str]

    class Config:
        from_attributes = True


# ============================================================================
# MUTUAL AID REQUEST SCHEMAS
# ============================================================================

class MutualAidRequestCreate(BaseModel):
    """Schema for creating a mutual aid request."""
    incident_id: int
    requested_by: str
    requesting_agency: str
    request_type: str  # strike_team, task_force, single_resource
    resource_type: str  # engine, ladder, ambulance, police, mixed
    quantity: int = 1
    priority: str = Field(default="normal")  # routine, urgent, emergency
    reporting_location: str
    travel_route: Optional[str] = None
    incident_type: str
    justification: str
    notes: Optional[str] = None


class MutualAidRequestUpdate(BaseModel):
    """Schema for updating a mutual aid request."""
    status: Optional[str] = None  # pending, approved, dispatched, arrived, completed, denied, cancelled
    approved_by: Optional[str] = None
    responding_agency: Optional[str] = None
    assigned_resources: Optional[str] = None  # JSON string
    notes: Optional[str] = None


class MutualAidRequestResponse(BaseModel):
    """Schema for mutual aid request response."""
    id: int
    request_number: str
    incident_id: int
    requested_by: str
    requesting_agency: str
    request_type: str
    resource_type: str
    quantity: int
    priority: str
    reporting_location: str
    travel_route: Optional[str]
    incident_type: str
    justification: str
    request_time: datetime
    approved_time: Optional[datetime]
    dispatched_time: Optional[datetime]
    arrived_time: Optional[datetime]
    cleared_time: Optional[datetime]
    status: str
    approved_by: Optional[str]
    responding_agency: Optional[str]
    assigned_resources: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True


# ============================================================================
# DASHBOARD SCHEMAS
# ============================================================================

class DashboardStats(BaseModel):
    """Statistics for command dashboard."""
    total_incidents: int
    active_incidents: int
    total_units: int
    available_units: int
    deployed_units: int
    total_personnel: int
    pending_mutual_aid_requests: int = 0


# ============================================================================
# COMMUNICATIONS SCHEMAS
# ============================================================================

class RadioChannelCreate(BaseModel):
    """Schema for creating a radio channel."""
    incident_id: int
    channel_name: str
    channel_type: str  # command, tactical, branch, division, logistics
    frequency: Optional[str] = None
    assigned_to: Optional[str] = None  # JSON list
    notes: Optional[str] = None


class RadioChannelResponse(BaseModel):
    """Schema for radio channel response."""
    id: int
    incident_id: int
    channel_name: str
    channel_type: str
    frequency: Optional[str]
    assigned_to: Optional[str]
    status: str
    created_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    """Schema for creating a message."""
    incident_id: Optional[int] = None
    sender_name: str
    sender_role: Optional[str] = None
    message_type: str  # broadcast, unit_message, alert, status_update
    priority: str = Field(default="routine")  # routine, urgent, emergency
    subject: Optional[str] = None
    content: str
    recipient_type: str  # all_units, specific_units, division, branch, agency
    recipient_ids: Optional[str] = None  # JSON list
    channel_id: Optional[int] = None
    requires_acknowledgment: bool = False
    expires_at: Optional[datetime] = None


class MessageResponse(BaseModel):
    """Schema for message response."""
    id: int
    incident_id: Optional[int]
    sender_name: str
    sender_role: Optional[str]
    message_type: str
    priority: str
    subject: Optional[str]
    content: str
    recipient_type: str
    recipient_ids: Optional[str]
    sent_at: datetime
    expires_at: Optional[datetime]
    channel_id: Optional[int]
    requires_acknowledgment: bool
    is_active: bool

    class Config:
        from_attributes = True


class MessageRecipientResponse(BaseModel):
    """Schema for message recipient response."""
    id: int
    message_id: int
    recipient_name: str
    delivered_at: datetime
    read_at: Optional[datetime]
    acknowledged_at: Optional[datetime]
    acknowledged_by: Optional[str]

    class Config:
        from_attributes = True


class MessageWithRecipients(MessageResponse):
    """Message with recipient tracking."""
    recipients: List[MessageRecipientResponse] = []


class MessageAcknowledgment(BaseModel):
    """Schema for acknowledging a message."""
    acknowledged_by: str  # Name of person acknowledging
