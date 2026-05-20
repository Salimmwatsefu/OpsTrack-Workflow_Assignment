import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { type ApplicationCreatePayload } from '../types';
import { ApplicationForm } from '../components/forms/ApplicationForm';

export function CreateApp() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: ApplicationCreatePayload) => api.createApplication(data),
    onSuccess: (data) => {
      // Redirect to the newly created application using its tracking number
      navigate(`/application/${data.tracking_number}`);
    },
    onError: (error: any) => {
      alert(`Error creating application: ${error.message}`);
    }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm font-bold underline mb-4 inline-block hover:no-underline">
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold uppercase tracking-tight">New Application Draft</h1>
        <p className="text-gray-600 mt-2">Fill out the details below. You can save this as a draft and submit it later.</p>
      </div>

      <div className="border-2 border-primary p-6 md:p-8 bg-surface shadow-solid">
        <ApplicationForm 
          onSubmit={(data) => mutation.mutate(data)} 
          isLoading={mutation.isPending} 
        />
      </div>
    </div>
  );
}