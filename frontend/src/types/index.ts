
export type AppType = 
  | "Recordation"
  | "Renewal"
  | "Change of Ownership"
  | "Change of Name"
  | "Discontinuation";

export type AppStatus = 
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Need More Information"
  | "Approved"
  | "Rejected";

export interface Application {
  id: number;
  tracking_number: string;
  applicant_name: string;
  applicant_email: string;
  company_name: string;
  application_type: AppType;
  description: string;
  status: AppStatus;
  reviewer_comment: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface ApplicationCreatePayload {
  applicant_name: string;
  applicant_email: string;
  company_name: string;
  application_type: AppType;
  description: string;
}

export interface ApplicationUpdatePayload {
  description?: string;
}

export interface ReviewerDecisionPayload {
  status: AppStatus;
  reviewer_comment?: string;
}