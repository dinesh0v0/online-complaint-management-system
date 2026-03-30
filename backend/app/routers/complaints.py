from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user
from app.models.auth import UserProfile
from app.models.complaints import ComplaintCreateRequest, ComplaintRecord, ComplaintStatsResponse, ComplaintTrackingResponse
from app.services.complaints import (
    build_stats,
    create_complaint,
    get_complaint_by_id,
    list_citizen_complaints,
    strip_internal_notes,
    track_public_complaint,
)

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.get("", response_model=list[ComplaintRecord])
async def get_my_complaints(current_user: UserProfile = Depends(get_current_user)) -> list[ComplaintRecord]:
    return [ComplaintRecord(**strip_internal_notes(record)) for record in list_citizen_complaints(current_user.id)]


@router.get("/stats", response_model=ComplaintStatsResponse)
async def get_my_complaint_stats(current_user: UserProfile = Depends(get_current_user)) -> ComplaintStatsResponse:
    return ComplaintStatsResponse(**build_stats(list_citizen_complaints(current_user.id)))


@router.post("", response_model=ComplaintRecord)
async def submit_complaint(
    payload: ComplaintCreateRequest,
    current_user: UserProfile = Depends(get_current_user),
) -> ComplaintRecord:
    return ComplaintRecord(**strip_internal_notes(create_complaint(current_user, payload)))


@router.get("/track/{ref_id}", response_model=ComplaintTrackingResponse)
async def track_complaint(ref_id: str) -> ComplaintTrackingResponse:
    return ComplaintTrackingResponse(**track_public_complaint(ref_id))


@router.get("/{complaint_id}", response_model=ComplaintRecord)
async def get_my_complaint(
    complaint_id: str,
    current_user: UserProfile = Depends(get_current_user),
) -> ComplaintRecord:
    complaint = get_complaint_by_id(complaint_id)
    if complaint["citizen_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot access this complaint.")
    if current_user.role != "admin":
        complaint = strip_internal_notes(complaint)
    return ComplaintRecord(**complaint)
