import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, MessageSquare, XCircle, Lock } from 'lucide-react';
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

  const [isEditing, setIsEditing]       = useState(false);
  const [decisionType, setDecisionType] = useState<AppStatus | null>(null);
  const [comment, setComment]           = useState('');

  const isTrackingNumber = idOrTracking?.startsWith('APP-');

  const { data: app, isLoading, error } = useQuery({
    queryKey: ['application', idOrTracking],
    queryFn: () =>
      isTrackingNumber
        ? api.trackApplication(idOrTracking!)
        : api.getApplication(idOrTracking!),
  });

  const opts = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', idOrTracking] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsEditing(false);
      setDecisionType(null);
      setComment('');
    },
    onError: (err: any) => alert(err.message),
  };

  const updateMutation = useMutation({ mutationFn: (data: any) => api.updateApplication(app!.id, data), ...opts });
  const submitMutation = useMutation({ mutationFn: () => api.submitApplication(app!.id), ...opts });
  const reviewMutation = useMutation({ mutationFn: () => api.startReview(app!.id), ...opts });
  const decideMutation = useMutation({
    mutationFn: () => api.decideApplication(app!.id, { status: decisionType!, reviewer_comment: comment }),
    ...opts,
  });

  const commentRequired = ['Rejected', 'Need More Information'].includes(decisionType ?? '');
  const canConfirm      = !decideMutation.isPending && (!commentRequired || comment.trim().length > 0);

  // ── States ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--color-muted)', fontSize: 15 }}>
          Loading application…
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="page-container" style={{ maxWidth: 520 }}>
        <div className="card" style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={24} color="#f87171" />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Application not found</p>
            <p style={{ fontSize: 15, color: 'var(--color-muted)' }}>
              No record matches <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{idOrTracking}</code>.
              Double-check your tracking number and try again.
            </p>
          </div>
          <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginTop: 8 }}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Edit view ───────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="page-container">
        <button onClick={() => setIsEditing(false)} className="btn btn-ghost" style={{ marginBottom: 28, marginLeft: -8 }}>
          <ChevronLeft size={16} /> Cancel
        </button>
        <div style={{ marginBottom: 40 }}>
          <div className="page-eyebrow">Edit Application</div>
          <h1 className="page-title">Update your details</h1>
          <p className="page-sub">Make your changes below, then save.</p>
        </div>
        <div className="card" style={{ padding: 36, maxWidth: 700 }}>
          <ApplicationForm
            initialData={app}
            onSubmit={(data) => updateMutation.mutate(data)}
            isLoading={updateMutation.isPending}
            submitLabel="Save changes"
          />
        </div>
      </div>
    );
  }

  // ── Detail view ─────────────────────────────────────────────────────────────
  return (
    <div className="page-container" style={{ maxWidth: 820 }}>

      <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ marginBottom: 28, marginLeft: -8 }}>
        <ChevronLeft size={16} /> Dashboard
      </button>

      <div className="card-elevated" style={{ overflow: 'hidden' }}>

        {/* Hero */}
        <div className="detail-hero">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 10 }}>
                  {app.application_type}
                </p>
                <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: 8, lineHeight: 1.1 }}>
                  {app.company_name}
                </h1>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-muted-2)', letterSpacing: '0.06em' }}>
                  {app.tracking_number}
                </p>
              </div>
              <StatusBadge status={app.status} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Contact grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="field-label">Contact name</p>
              <p style={{ fontSize: 16, color: 'var(--color-ink)' }}>{app.applicant_name}</p>
            </div>
            <div>
              <p className="field-label">Email address</p>
              <p style={{ fontSize: 16, color: 'var(--color-ink)' }}>{app.applicant_email}</p>
            </div>
          </div>

          <hr className="divider" />

          {/* Description */}
          <div>
            <p className="field-label">Description</p>
            <p style={{ fontSize: 15, color: 'var(--color-ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {app.description}
            </p>
          </div>

          {/* Reviewer note */}
          {app.reviewer_comment && (
            <div className="reviewer-note">
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#fbbf24', marginBottom: 6 }}>
                Reviewer note
              </p>
              <p style={{ fontSize: 15, color: '#fde68a', lineHeight: 1.6 }}>
                {app.reviewer_comment}
              </p>
            </div>
          )}

        </div>

        <hr className="divider" style={{ margin: '0 40px' }} />

        {/* Actions */}
        <div style={{ padding: '28px 40px 32px' }}>
          <p className="field-label" style={{ marginBottom: 18 }}>Available actions</p>

          {/* ── Applicant ── */}
          {role === 'applicant' && (
            <div>
              {app.status === 'Draft' && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                    Edit draft
                  </button>
                  <button
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending}
                    className="btn btn-primary"
                  >
                    {submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
                  </button>
                </div>
              )}

              {app.status === 'Need More Information' && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                    Update application
                  </button>
                  <button
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending}
                    className="btn btn-primary"
                  >
                    {submitMutation.isPending ? 'Resubmitting…' : 'Resubmit'}
                  </button>
                </div>
              )}

              {['Submitted', 'Under Review', 'Approved', 'Rejected'].includes(app.status) && (
                <div className="locked-note">
                  <Lock size={14} />
                  {app.status === 'Approved'
                    ? 'This application has been approved. No further changes can be made.'
                    : app.status === 'Rejected'
                    ? 'This application was rejected and is now closed.'
                    : 'Your application is with the reviewer and cannot be edited right now.'}
                </div>
              )}
            </div>
          )}

          {/* ── Reviewer ── */}
          {role === 'reviewer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {app.status === 'Submitted' && (
                <button
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewMutation.isPending}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {reviewMutation.isPending ? 'Processing…' : 'Start review'}
                </button>
              )}

              {app.status === 'Under Review' && !decisionType && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => setDecisionType('Approved')} className="btn btn-approve">
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button onClick={() => setDecisionType('Need More Information')} className="btn btn-request">
                    <MessageSquare size={15} /> Request more information
                  </button>
                  <button onClick={() => setDecisionType('Rejected')} className="btn btn-reject">
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}

              {decisionType && (
                <div className="action-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                      Decision:{' '}
                      <span style={{ color: 'var(--color-lime)' }}>{decisionType}</span>
                    </p>
                    <button
                      onClick={() => { setDecisionType(null); setComment(''); }}
                      style={{ fontSize: 13, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-sans)' }}
                    >
                      Change
                    </button>
                  </div>

                  {commentRequired && (
                    <div>
                      <label className="field-label" htmlFor="reviewer-comment">
                        Your reasoning{' '}
                        <span style={{ color: '#f87171', textTransform: 'none', fontWeight: 400 }}>(required)</span>
                      </label>
                      <textarea
                        id="reviewer-comment"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Explain what's needed or why this is being rejected…"
                        className="input-field"
                        style={{ fontSize: 15 }}
                      />
                    </div>
                  )}

                  <div>
                    <button
                      onClick={() => decideMutation.mutate()}
                      disabled={!canConfirm}
                      className="btn btn-primary"
                    >
                      {decideMutation.isPending ? 'Saving…' : 'Confirm decision'}
                    </button>
                  </div>
                </div>
              )}

              {['Draft', 'Need More Information', 'Approved', 'Rejected'].includes(app.status) && !decisionType && (
                <div className="locked-note">
                  <Lock size={14} />
                  {app.status === 'Draft'
                    ? 'Waiting for the applicant to submit this.'
                    : 'No actions available at this stage.'}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}