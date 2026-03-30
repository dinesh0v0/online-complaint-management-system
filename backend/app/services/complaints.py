from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.supabase import get_supabase_admin
from app.models.auth import UserProfile
from app.models.complaints import ComplaintCreateRequest, ComplaintStatus, ComplaintUpdateRequest


def get_profile_by_id(user_id: str) -> dict[str, Any] | None:
    result = (
        get_supabase_admin()
        .table("users")
        .select("id,email,full_name,role")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    records = result.data or []
    return records[0] if records else None


def build_profile(user_id: str, fallback_email: str | None = None, fallback_name: str | None = None) -> dict[str, Any]:
    profile = get_profile_by_id(user_id)
    if profile:
        return profile

    return {
        "id": user_id,
        "email": fallback_email or "unknown@example.com",
        "full_name": fallback_name or "Citizen",
        "role": "citizen",
    }


def _get_profiles_map(user_ids: set[str]) -> dict[str, dict[str, Any]]:
    cleaned_ids = [user_id for user_id in user_ids if user_id]
    if not cleaned_ids:
        return {}

    result = (
        get_supabase_admin()
        .table("users")
        .select("id,email,full_name,role")
        .in_("id", cleaned_ids)
        .execute()
    )
    return {record["id"]: record for record in result.data or []}


def _get_notes_map(complaint_ids: list[str], profiles_map: dict[str, dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    if not complaint_ids:
        return {}

    result = (
        get_supabase_admin()
        .table("complaint_notes")
        .select("*")
        .in_("complaint_id", complaint_ids)
        .order("created_at", desc=False)
        .execute()
    )

    notes_map: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in result.data or []:
        notes_map[record["complaint_id"]].append(
            {
                **record,
                "author": profiles_map.get(record["author_id"]),
            }
        )

    return notes_map


def _hydrate_complaints(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not records:
        return []

    user_ids = {
        *(record.get("citizen_id") for record in records),
        *(record.get("reviewed_by") for record in records),
    }
    profiles_map = _get_profiles_map({user_id for user_id in user_ids if user_id})
    notes_map = _get_notes_map([record["id"] for record in records], profiles_map)

    return [
        {
            **record,
            "citizen": profiles_map.get(str(record["citizen_id"])) if record.get("citizen_id") else None,
            "reviewer": profiles_map.get(str(record["reviewed_by"])) if record.get("reviewed_by") else None,
            "notes": notes_map.get(record["id"], []),
        }
        for record in records
    ]


def strip_internal_notes(complaint: dict[str, Any]) -> dict[str, Any]:
    return {
        **complaint,
        "notes": [],
    }


def list_citizen_complaints(user_id: str) -> list[dict[str, Any]]:
    result = (
        get_supabase_admin()
        .table("complaints")
        .select("*")
        .eq("citizen_id", user_id)
        .order("submitted_at", desc=True)
        .execute()
    )
    return _hydrate_complaints(result.data or [])


def list_admin_complaints(status_filter: str = "all", sort: str = "newest") -> list[dict[str, Any]]:
    query = get_supabase_admin().table("complaints").select("*")

    if status_filter and status_filter != "all":
        query = query.eq("status", status_filter)

    if sort == "oldest":
        query = query.order("submitted_at", desc=False)
    elif sort == "status":
        query = query.order("status", desc=False).order("submitted_at", desc=True)
    else:
        query = query.order("submitted_at", desc=True)

    return _hydrate_complaints(query.execute().data or [])


def get_complaint_by_id(complaint_id: str) -> dict[str, Any]:
    result = (
        get_supabase_admin()
        .table("complaints")
        .select("*")
        .eq("id", complaint_id)
        .limit(1)
        .execute()
    )
    records = result.data or []
    if not records:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found.")
    return _hydrate_complaints(records)[0]


def create_complaint(current_user: UserProfile, payload: ComplaintCreateRequest) -> dict[str, Any]:
    request_payload = payload.model_dump(mode="json")
    request_payload["citizen_id"] = current_user.id
    request_payload["evidence_bucket"] = payload.evidence_bucket or get_settings().evidence_bucket
    request_payload["evidence_path"] = payload.evidence_path or None

    result = get_supabase_admin().table("complaints").insert(request_payload).execute()
    records = result.data or []
    if not records:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Complaint could not be created.")
    return get_complaint_by_id(records[0]["id"])


def update_complaint_status(
    complaint_id: str,
    reviewer_id: str,
    payload: ComplaintUpdateRequest,
) -> dict[str, Any]:
    get_complaint_by_id(complaint_id)

    update_payload: dict[str, Any] = {
        "status": payload.status.value,
        "reviewed_by": reviewer_id,
        "resolved_at": datetime.now(timezone.utc).isoformat() if payload.status == ComplaintStatus.resolved else None,
    }

    get_supabase_admin().table("complaints").update(update_payload).eq("id", complaint_id).execute()
    return get_complaint_by_id(complaint_id)


def add_internal_note(complaint_id: str, author_id: str, note: str) -> dict[str, Any]:
    get_complaint_by_id(complaint_id)

    get_supabase_admin().table("complaint_notes").insert(
        {
            "complaint_id": complaint_id,
            "author_id": author_id,
            "note": note,
        }
    ).execute()
    return get_complaint_by_id(complaint_id)


def build_stats(complaints: list[dict[str, Any]]) -> dict[str, Any]:
    status_counts = Counter(record.get("status") for record in complaints)
    category_counts = Counter(record.get("category") for record in complaints if record.get("category"))
    date_counts: dict[str, int] = defaultdict(int)

    for record in complaints:
        submitted_at = record.get("submitted_at")
        if not submitted_at:
            continue
        date_key = str(submitted_at)[:10]
        date_counts[date_key] += 1

    sorted_dates = sorted(date_counts.items())[-10:]
    top_categories = category_counts.most_common(6)

    return {
        "counts": {
            "total": len(complaints),
            "pending": status_counts.get("pending", 0),
            "under_investigation": status_counts.get("under_investigation", 0),
            "resolved": status_counts.get("resolved", 0),
        },
        "submissions_over_time": [
            {"label": label, "count": count} for label, count in sorted_dates
        ],
        "categories": [
            {"label": label, "count": count} for label, count in top_categories
        ],
    }


def track_public_complaint(ref_id: str) -> dict[str, Any]:
    # Ensure ref_id is alphanumeric for safety
    clean_ref = "".join(c for c in ref_id if c.isalnum() or c == "-")
    if len(clean_ref) < 5:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found. Please provide a valid Tracking ID.")

    # Since PostgreSQL cannot use ILIKE on UUID types without explicit column casting,
    # we fetch recent records and match the suffix in Python. 
    # Valid tracking IDs are the last 12 chars of the UUID.
    result = (
        get_supabase_admin()
        .table("complaints")
        .select("id, status, title, category, submitted_at")
        .order("submitted_at", desc=True)
        .limit(2000)
        .execute()
    )
    records = result.data or []
    
    matched_complaint = None
    for row in records:
        if row["id"].endswith(clean_ref) or clean_ref in row["id"]:
            matched_complaint = row
            break

    if not matched_complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found. Please verify the Reference ID.")

    complaint = matched_complaint
    
    # Synthesize updates from notes or just simple status changes
    notes_result = (
        get_supabase_admin()
        .table("complaint_notes")
        .select("created_at, note")
        .eq("complaint_id", complaint["id"])
        .order("created_at", desc=False)
        .execute()
    )
    
    updates = [
        {"date": complaint["submitted_at"], "note": "Complaint successfully registered by the system.", "type": "success"}
    ]
    
    for note in notes_result.data or []:
        updates.append({
            "date": note["created_at"],
            "note": "Update from Admin Operations: " + note["note"],
            "type": "info"
        })
        
    if complaint["status"] == "resolved":
        updates.append({
            "date": datetime.now(timezone.utc).isoformat(),
            "note": "Complaint marked as Resolved.",
            "type": "success"
        })

    complaint["updates"] = updates
    return complaint
