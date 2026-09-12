from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    priority: str = Field("Medium", pattern="^(Low|Medium|High)$")


class TicketResponse(BaseModel):
    id: int
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    id: int
    ticket_id: str
    customer_name: str
    subject: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    note_text: str = Field(..., min_length=1)


class NoteResponse(BaseModel):
    id: int
    ticket_id: str
    note_text: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketDetailResponse(BaseModel):
    id: int
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    notes: List[NoteResponse] = []

    class Config:
        from_attributes = True


class TicketStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Open|In Progress|Closed)$")


class TicketUpdateRequest(BaseModel):
    status: Optional[str] = Field(None, pattern="^(Open|In Progress|Closed)$")
    note: Optional[str] = Field(None, min_length=1)


class AIAssistResponse(BaseModel):
    summary: str
    suggested_response: str


class TicketDeleteResponse(BaseModel):
    message: str
    ticket_id: str


class SimilarTicketResponse(BaseModel):
    ticket_id: str
    subject: str
    customer_name: str
    status: str
    priority: str
    similarity_score: float


class AnalyticsSummary(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    closed_tickets: int
    high_priority_tickets: int
    tickets_by_status: dict
    tickets_by_priority: dict
    tickets_over_time: list
    recent_activity: list
