import uuid
from django.db import models
from django.utils import timezone

def generate_tracking_number():
    """Generates a clean tracking number e.g., APP-2026-A1B2C3"""
    year = timezone.now().year
    uid = uuid.uuid4().hex[:6].upper()
    return f"APP-{year}-{uid}"

class Application(models.Model):
    class AppType(models.TextChoices):
        RECORDATION = "Recordation", "Recordation"
        RENEWAL = "Renewal", "Renewal"
        CHANGE_OWNERSHIP = "Change of Ownership", "Change of Ownership"
        CHANGE_NAME = "Change of Name", "Change of Name"
        DISCONTINUATION = "Discontinuation", "Discontinuation"

    class AppStatus(models.TextChoices):
        DRAFT = "Draft", "Draft"
        SUBMITTED = "Submitted", "Submitted"
        UNDER_REVIEW = "Under Review", "Under Review"
        NEED_MORE_INFO = "Need More Information", "Need More Information"
        APPROVED = "Approved", "Approved"
        REJECTED = "Rejected", "Rejected"

    # Core Identifiers
    tracking_number = models.CharField(max_length=20, unique=True, default=generate_tracking_number, editable=False)
    
    # Applicant Info
    applicant_name = models.CharField(max_length=255)
    applicant_email = models.EmailField()
    company_name = models.CharField(max_length=255)
    
    # Application Details
    application_type = models.CharField(max_length=50, choices=AppType.choices)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=AppStatus.choices, default=AppStatus.DRAFT)
    reviewer_comment = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.tracking_number} - {self.applicant_name} ({self.status})"