from ninja import Schema
from datetime import datetime
from typing import Optional
from .models import Application


# OUT 

class ApplicationOut(Schema):
    id: int
    tracking_number: str
    applicant_name: str
    applicant_email: str
    company_name: str
    application_type: str
    description: str
    status: str
    reviewer_comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None


# IN 

class ApplicationCreateIn(Schema):
    applicant_name: str
    applicant_email: str
    company_name: str
    application_type: str
    description: str

class ApplicationUpdateIn(Schema):
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    company_name: Optional[str] = None
    application_type: Optional[str] = None
    description: Optional[str] = None

class ReviewerDecisionIn(Schema):
    status: str
    reviewer_comment: Optional[str] = None