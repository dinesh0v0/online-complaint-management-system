from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class ComplaintStatus(str, Enum):
    pending = "pending"
    under_investigation = "under_investigation"
    resolved = "resolved"


class UserSummary(BaseModel):
    id: str
    full_name: str
    email: str
    role: str


class ComplaintNoteRecord(BaseModel):
    id: str
    complaint_id: str
    author_id: str
    note: str
    created_at: datetime
    author: UserSummary | None = None


class ComplaintRecord(BaseModel):
    id: str
    citizen_id: str
    title: str
    category: str
    description: str
    incident_date: date
    status: ComplaintStatus
    evidence_bucket: str
    evidence_path: str | None = None
    reviewed_by: str | None = None
    submitted_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None
    citizen: UserSummary | None = None
    reviewer: UserSummary | None = None
    notes: list[ComplaintNoteRecord] = Field(default_factory=list)


class ComplaintCreateRequest(BaseModel):
    title: str = Field(min_length=4, max_length=160)
    category: str = Field(min_length=3, max_length=80)
    description: str = Field(min_length=20, max_length=5000)
    incident_date: date
    evidence_bucket: str = Field(default="complaint-evidence", max_length=120)
    evidence_path: str | None = Field(default=None, max_length=500)

    @field_validator("title", "category", "description")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("incident_date")
    @classmethod
    def validate_incident_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Incident date cannot be in the future.")
        return value


class ComplaintUpdateRequest(BaseModel):
    status: ComplaintStatus


class ComplaintNoteCreateRequest(BaseModel):
    note: str = Field(min_length=4, max_length=4000)

    @field_validator("note")
    @classmethod
    def strip_note(cls, value: str) -> str:
        return value.strip()


class StatusCounts(BaseModel):
    total: int = 0
    pending: int = 0
    under_investigation: int = 0
    resolved: int = 0


class TrendPoint(BaseModel):
    label: str
    count: int


class ComplaintStatsResponse(BaseModel):
    counts: StatusCounts
    submissions_over_time: list[TrendPoint]
    categories: list[TrendPoint]
