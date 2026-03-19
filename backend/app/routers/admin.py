from fastapi import APIRouter, Depends, Query

from app.core.auth import require_admin
from app.models.auth import UserProfile
from app.models.complaints import (
    ComplaintNoteCreateRequest,
    ComplaintRecord,
    ComplaintStatsResponse,
    ComplaintUpdateRequest,
)
from app.services.complaints import add_internal_note, build_stats, list_admin_complaints, update_complaint_status

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/complaints", response_model=list[ComplaintRecord])
async def get_all_complaints(
    status: str = Query(default="all"),
    sort: str = Query(default="newest"),
    current_user: UserProfile = Depends(require_admin),
) -> list[ComplaintRecord]:
    del current_user
    return [ComplaintRecord(**record) for record in list_admin_complaints(status_filter=status, sort=sort)]


@router.get("/stats", response_model=ComplaintStatsResponse)
async def get_admin_stats(current_user: UserProfile = Depends(require_admin)) -> ComplaintStatsResponse:
    del current_user
    return ComplaintStatsResponse(**build_stats(list_admin_complaints()))


@router.patch("/complaints/{complaint_id}", response_model=ComplaintRecord)
async def update_complaint(
    complaint_id: str,
    payload: ComplaintUpdateRequest,
    current_user: UserProfile = Depends(require_admin),
) -> ComplaintRecord:
    return ComplaintRecord(**update_complaint_status(complaint_id, current_user.id, payload))


@router.post("/complaints/{complaint_id}/notes", response_model=ComplaintRecord)
async def create_internal_note(
    complaint_id: str,
    payload: ComplaintNoteCreateRequest,
    current_user: UserProfile = Depends(require_admin),
) -> ComplaintRecord:
    return ComplaintRecord(**add_internal_note(complaint_id, current_user.id, payload.note))
