
import type {
    Application,
    ApplicationCreatePayload,
    ApplicationUpdatePayload,
    ReviewerDecisionPayload
} from '../types';

const BASE_URL = 'http://127.0.0.1:8000/api/applications';

// Helper to throw clean errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An unexpected error occurred');
  }
  return response.json();
}

export const api = {
  // GET
  listApplications: () => 
    fetch(`${BASE_URL}/`).then(res => handleResponse<Application[]>(res)),
    
  getApplication: (id: string | number) => 
    fetch(`${BASE_URL}/${id}/`).then(res => handleResponse<Application>(res)),
    
  trackApplication: (trackingNumber: string) => 
    fetch(`${BASE_URL}/track/${trackingNumber}/`).then(res => handleResponse<Application>(res)),

  // POST / PUT Actions
  createApplication: (data: ApplicationCreatePayload) => 
    fetch(`${BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => handleResponse<Application>(res)),

  updateApplication: (id: number, data: ApplicationUpdatePayload) => 
    fetch(`${BASE_URL}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => handleResponse<Application>(res)),

  submitApplication: (id: number) => 
    fetch(`${BASE_URL}/${id}/submit/`, { method: 'POST' })
      .then(res => handleResponse<Application>(res)),

  startReview: (id: number) => 
    fetch(`${BASE_URL}/${id}/start-review/`, { method: 'POST' })
      .then(res => handleResponse<Application>(res)),

  decideApplication: (id: number, data: ReviewerDecisionPayload) => 
    fetch(`${BASE_URL}/${id}/decide/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => handleResponse<Application>(res)),
};