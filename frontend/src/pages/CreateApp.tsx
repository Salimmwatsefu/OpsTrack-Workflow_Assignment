import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { api } from '../api/client';
import { type ApplicationCreatePayload } from '../types';
import { ApplicationForm } from '../components/forms/ApplicationForm';

export function CreateApp() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: ApplicationCreatePayload) => api.createApplication(data),
    onSuccess: (data) => navigate(`/application/${data.tracking_number}`),
    onError: (error: any) => alert(`Something went wrong: ${error.message}`),
  });

  return (
    <div className="page-container">

      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ marginBottom: 28, marginLeft: -8 }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div style={{ marginBottom: 40 }}>
        <div className="page-eyebrow">New Application</div>
        <h1 className="page-title">Start your application</h1>
        <p className="page-sub">
          Fill in the details below. It saves as a draft — you can review before submitting.
        </p>
      </div>

      <div className="card" style={{ padding: 36, maxWidth: 700 }}>
        <ApplicationForm
          onSubmit={(data) => mutation.mutate(data)}
          isLoading={mutation.isPending}
        />
      </div>

    </div>
  );
}