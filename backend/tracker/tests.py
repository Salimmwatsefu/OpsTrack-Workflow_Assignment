from django.test import TestCase, Client
from tracker.models import Application
import json

class ApplicationWorkflowTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.valid_draft_payload = {
            "applicant_name": "Salim Mwarika",
            "applicant_email": "salim@example.com",
            "company_name": "Yadi",
            "application_type": "Recordation",
            "description": "Initial setup"
        }

    def print_step(self, step_num, message):
        """Helper to print clean steps during testing."""
        print(f"  [Step {step_num}] {message}")

    def test_create_draft_application(self):
        print("\n\n=== RUNNING: test_create_draft_application ===")
        self.print_step(1, "Sending POST request to create Draft...")
        
        response = self.client.post(
            "/api/applications/",
            data=json.dumps(self.valid_draft_payload),
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.print_step(2, f"Success! Created application {data['tracking_number']} with status: {data['status']}")
        self.assertEqual(data["status"], Application.AppStatus.DRAFT)
        self.assertIn("APP-", data["tracking_number"])

    def test_workflow_enforcement(self):
        print("\n=== RUNNING: test_workflow_enforcement ===")
        
        # 1. Create the Draft
        self.print_step(1, "Creating initial Draft application in database.")
        app = Application.objects.create(**self.valid_draft_payload)
        
        # 2. Try to move Draft directly to Under Review (Should Fail)
        self.print_step(2, f"Attempting illegal move: Draft -> Under Review. Expecting 400.")
        response = self.client.post(f"/api/applications/{app.id}/start-review/")
        self.assertEqual(response.status_code, 400)
        self.print_step("2a", f"Blocked successfully: {response.json()['detail']}")
        
        # 3. Submit the Draft (Should Succeed)
        self.print_step(3, "Submitting the Draft. Expecting 200.")
        response = self.client.post(f"/api/applications/{app.id}/submit/")
        self.assertEqual(response.status_code, 200)
        app.refresh_from_db()
        self.print_step("3a", f"Success! Status is now: {app.status}")
        self.assertEqual(app.status, Application.AppStatus.SUBMITTED)
        
        # 4. Try to Edit a Submitted Application (Should Fail)
        self.print_step(4, "Attempting illegal edit on Submitted application. Expecting 400.")
        response = self.client.put(
            f"/api/applications/{app.id}/",
            data=json.dumps({"description": "Trying to sneak an edit"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.print_step("4a", f"Blocked successfully: {response.json()['detail']}")
        
        # 5. Move to Under Review (Should Succeed)
        self.print_step(5, "Moving application to Under Review. Expecting 200.")
        response = self.client.post(f"/api/applications/{app.id}/start-review/")
        self.assertEqual(response.status_code, 200)
        app.refresh_from_db()
        self.print_step("5a", f"Success! Status is now: {app.status}")
        
        # 6. Reject without a comment (Should Fail)
        self.print_step(6, "Attempting Rejection without required comment. Expecting 400.")
        response = self.client.post(
            f"/api/applications/{app.id}/decide/",
            data=json.dumps({"status": "Rejected", "reviewer_comment": ""}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.print_step("6a", f"Blocked successfully: {response.json()['detail']}")