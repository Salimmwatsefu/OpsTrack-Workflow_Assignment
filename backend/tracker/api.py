from ninja import Router
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Application
from .schemas import ApplicationOut, ApplicationCreateIn, ApplicationUpdateIn, ReviewerDecisionIn
from typing import List

router = Router()

@router.post("/", response=ApplicationOut)
def create_application(request, payload: ApplicationCreateIn):
    """Creates a new application in Draft status."""
    app = Application.objects.create(**payload.dict())
    return app

@router.get("/", response=List[ApplicationOut])
def list_applications(request):
    """Returns all applications. (For Reviewer View)"""
    return Application.objects.exclude(status=Application.AppStatus.DRAFT).order_by('-created_at')

@router.get("/{app_id}/", response=ApplicationOut)
def get_application(request, app_id: int):
    """Returns details for a specific application by ID."""
    return get_object_or_404(Application, id=app_id)

@router.get("/track/{tracking_number}/", response=ApplicationOut)
def track_application(request, tracking_number: str):
    """Returns application details by tracking number. (For Applicant View)"""
    return get_object_or_404(Application, tracking_number=tracking_number)

@router.put("/{app_id}/", response=ApplicationOut)
def update_application(request, app_id: int, payload: ApplicationUpdateIn):
    """
    Updates an application.
    Rule: Only Draft and Need More Information applications can be edited.
    """
    app = get_object_or_404(Application, id=app_id)
    
    if app.status not in [Application.AppStatus.DRAFT, Application.AppStatus.NEED_MORE_INFO]:
        raise HttpError(400, "Only Draft or 'Need More Information' applications can be edited.")
        
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(app, attr, value)
    
    app.save()
    return app

@router.post("/{app_id}/submit/", response=ApplicationOut)
def submit_application(request, app_id: int):
    """
    Submits an application.
    Rule: Only Draft and Need More Info applications can be submitted/resubmitted.
    """
    app = get_object_or_404(Application, id=app_id)
    
    if app.status not in [Application.AppStatus.DRAFT, Application.AppStatus.NEED_MORE_INFO]:
        raise HttpError(400, "Only Draft or 'Need More Information' applications can be submitted.")
        
    app.status = Application.AppStatus.SUBMITTED
    app.submitted_at = timezone.now()
    app.save()
    return app

@router.post("/{app_id}/start-review/", response=ApplicationOut)
def start_review(request, app_id: int):
    """
    Moves application to Under Review.
    Rule: Only Submitted applications can move to Under Review.
    """
    app = get_object_or_404(Application, id=app_id)
    
    if app.status != Application.AppStatus.SUBMITTED:
        raise HttpError(400, "Only Submitted applications can be placed Under Review.")
        
    app.status = Application.AppStatus.UNDER_REVIEW
    app.save()
    return app

@router.post("/{app_id}/decide/", response=ApplicationOut)
def reviewer_decision(request, app_id: int, payload: ReviewerDecisionIn):
    """
    Records the reviewer's decision.
    Rules: 
    1. Only Under Review applications can receive a decision.
    2. Need More Information or Rejected decisions MUST include a comment.
    """
    app = get_object_or_404(Application, id=app_id)
    
    if app.status != Application.AppStatus.UNDER_REVIEW:
        raise HttpError(400, "Only 'Under Review' applications can receive a decision.")
        
    valid_decisions = [
        Application.AppStatus.APPROVED, 
        Application.AppStatus.REJECTED, 
        Application.AppStatus.NEED_MORE_INFO
    ]
    
    if payload.status not in valid_decisions:
        raise HttpError(400, "Invalid decision status.")
        
    if payload.status in [Application.AppStatus.REJECTED, Application.AppStatus.NEED_MORE_INFO]:
        if not payload.reviewer_comment or payload.reviewer_comment.strip() == "":
            raise HttpError(400, "A comment is required when rejecting or requesting more information.")
            
    app.status = payload.status
    app.reviewer_comment = payload.reviewer_comment
    app.reviewed_at = timezone.now()
    app.save()
    return app