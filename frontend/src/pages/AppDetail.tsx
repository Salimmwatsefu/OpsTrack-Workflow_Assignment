// frontend/src/pages/AppDetail.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ApplicationForm } from '../components/forms/ApplicationForm';
import { type AppStatus } from '../types';

interface Props {
  role: 'applicant' | 'reviewer';
}

export function AppDetail({ role }: Props) {
  const { idOrTracking } = useParams<{ idOrTracking: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [decisionType, setDecisionType] = useState<AppStatus | null>(null);
  const [comment, setComment] = useState('');

  // 1. Fetch data intelligently based on routing type (ID or String Tracking Number)
  const isTrackingNumber = idOrTracking?.startsWith('APP-');
  
  const { data: app, isLoading, error } = useQuery({
    queryKey: ['application', idOrTracking],
    queryFn: () => isTrackingNumber 
      ? api.trackApplication(idOrTracking!) 
      : api.getApplication(idOrTracking!),
  });

  // 2. Lifecycle State mutations
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', idOrTracking] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsEditing(false);
      setDecisionType(null);
      setComment('');
    },
    onError: (err: any) => {
      alert(err.message);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateApplication(app!.id, data),
    ...mutationOptions
  });

  const submitMutation = useMutation({
    mutationFn: () => api.submitApplication(app!.id),
    ...mutationOptions
  });

  const reviewMutation = useMutation({
    mutationFn: () => api.startReview(app!.id),
    ...mutationOptions
  });

  const decideMutation = useMutation({
    mutationFn: () => api.decideApplication(app!.id, { status: decisionType!, reviewer_comment: comment }),
    ...mutationOptions
  });

  if (isLoading) return <div className="p-8 font-bold border-2 border-primary text-center">Loading details...</div>;
  if (error || !app) return (
    <div className="border-2 border-primary p-8 bg-white shadow-solid text-center space-y-4">
      <h2 className="text-xl font-bold uppercase">Record Not Found</h2>
      <p className="text-gray-500">Could not fetch an application matching "{idOrTracking}"</p>
      <button onClick={() => navigate('/')} className="btn-outline text-sm">Return Dashboard</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Upper context breadcrumb */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-sm font-bold underline hover:no-underline">
          &larr; Dashboard
        </button>
        <StatusBadge status={app.status} />
      </div>

      {isEditing ? (
        <div className="border-2 border-primary p-6 md:p-8 bg-white shadow-solid space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold uppercase tracking-tight">Edit Application</h2>
            <button onClick={() => setIsEditing(false)} className="text-sm underline font-bold">Cancel</button>
          </div>
          <ApplicationForm 
            initialData={app} 
            onSubmit={(data) => updateMutation.mutate(data)}
            isLoading={updateMutation.isPending}
          />
        </div>
      ) : (
        <div className="border-2 border-primary bg-white shadow-solid divide-y-2 divide-primary">
          
          {/* Main Application Summary details block */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-widest">{app.application_type}</span>
              <h1 className="text-3xl font-black uppercase tracking-tight">{app.company_name}</h1>
              <p className="font-mono text-sm text-gray-500">ID: {app.tracking_number}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-y border-border-light py-4 text-sm">
              <div><span className="font-bold uppercase text-xs text-gray-400 block">Contact Name</span>{app.applicant_name}</div>
              <div><span className="font-bold uppercase text-xs text-gray-400 block">Contact Email</span>{app.applicant_email}</div>
            </div>

            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-gray-400 block">Applicant Description</span>
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{app.description}</p>
            </div>

            {app.reviewer_comment && (
              <div className="p-4 bg-orange-50 border-2 border-orange-200 space-y-1">
                <span className="font-bold uppercase text-xs text-orange-700 block">Reviewer Feedback Log</span>
                <p className="text-sm text-orange-900 font-medium italic">"{app.reviewer_comment}"</p>
              </div>
            )}
          </div>

          {/* Contextual Legal Control Panel section based on status and role */}
          <div className="p-6 bg-[#fcfcfc] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Available Lifecycle Actions</h3>
            
            {/* APPLICANT ACTIONS CONTROLS */}
            {role === 'applicant' && (
              <div className="flex flex-wrap gap-4">
                {app.status === 'Draft' && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="btn-outline">Edit Draft</button>
                    <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="btn-primary">
                      {submitMutation.isPending ? 'Submitting...' : 'Submit to Reviewer'}
                    </button>
                  </>
                )}
                {app.status === 'Need More Information' && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="btn-outline">Update Description</button>
                    <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="btn-primary">
                      {submitMutation.isPending ? 'Resubmitting...' : 'Resubmit Application'}
                    </button>
                  </>
                )}
                {['Submitted', 'Under Review', 'Approved', 'Rejected'].includes(app.status) && (
                  <p className="text-sm italic text-gray-500">This record is securely locked down. No current modifications allowed.</p>
                )}
              </div>
            )}

            {/* REVIEWER ACTIONS CONTROLS */}
            {role === 'reviewer' && (
              <div className="space-y-4">
                {app.status === 'Submitted' && (
                  <button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending} className="btn-primary">
                    {reviewMutation.isPending ? 'Processing...' : 'Lock & Start Active Review'}
                  </button>
                )}

                {app.status === 'Under Review' && !decisionType && (
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => setDecisionType('Approved')} className="bg-[#ccffcc] border-2 border-primary font-bold px-4 py-2 shadow-solid transition-transform active:translate-y-0.5">
                      Approve
                    </button>
                    <button onClick={() => setDecisionType('Need More Information')} className="bg-[#e6ccff] border-2 border-primary font-bold px-4 py-2 shadow-solid transition-transform active:translate-y-0.5">
                      Request Info
                    </button>
                    <button onClick={() => setDecisionType('Rejected')} className="bg-[#ffcccc] border-2 border-primary font-bold px-4 py-2 shadow-solid transition-transform active:translate-y-0.5">
                      Reject Record
                    </button>
                  </div>
                )}

                {/* Inline comment panel expansion for required decisions */}
                {decisionType && (
                  <div className="border-2 border-primary p-4 bg-white space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs uppercase">Action Decision Target: <span className="underline">{decisionType}</span></span>
                      <button onClick={() => { setDecisionType(null); setComment(''); }} className="text-xs text-red-500 underline font-semibold">Reset Choice</button>
                    </div>
                    
                    {['Rejected', 'Need More Information'].includes(decisionType) && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase text-gray-500">Decision Context Comment (Required)</label>
                        <textarea
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                          placeholder="Provide the concrete reasoning behind this executive decision..."
                          className="input-editorial text-sm"
                        />
                      </div>
                    )}

                    <button 
                      onClick={() => decideMutation.mutate()}
                      disabled={decideMutation.isPending || (['Rejected', 'Need More Information'].includes(decisionType) && !comment.trim())}
                      className="btn-primary w-full text-sm"
                    >
                      {decideMutation.isPending ? 'Recording Decision...' : 'Confirm Executive Action'}
                    </button>
                  </div>
                )}

                {['Draft', 'Need More Information', 'Approved', 'Rejected'].includes(app.status) && !decisionType && (
                  <p className="text-sm italic text-gray-500">
                    {app.status === 'Draft' ? 'Awaiting submission from applicant.' : 'No executive panel operations permitted at this status layer.'}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}