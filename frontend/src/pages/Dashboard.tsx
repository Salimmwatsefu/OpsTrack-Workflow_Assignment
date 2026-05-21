import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FilePlus, Search, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/ui/StatusBadge';

interface Props {
  role: 'applicant' | 'reviewer';
}

export function Dashboard({ role }: Props) {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: api.listApplications,
    enabled: role === 'reviewer',
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) navigate(`/application/${trackId.trim()}`);
  };

  // ── Applicant ──────────────────────────────────────────────────────────────
  if (role === 'applicant') {
    return (
      <div className="page-container">
        <div className="mb-12">
          <div className="page-eyebrow">Workflow Tracker</div>
          <h1 className="page-title">What do you need to do?</h1>
          <p className="page-sub">Submit a new application or check where an existing one stands.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 760 }}>

          {/* New application card */}
          <div className="card-elevated flex flex-col gap-6 p-8">
            <div
              style={{
                width: 48, height: 48, borderRadius: 10,
                background: 'var(--color-lime-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FilePlus size={22} color="var(--color-lime)" />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                New application
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.55 }}>
                Start a request for recordation, renewal, ownership changes, and more. Saved as a draft first.
              </p>
            </div>
            <button
              onClick={() => navigate('/application/new')}
              className="btn btn-primary"
              style={{ marginTop: 'auto' }}
            >
              Get started
            </button>
          </div>

          {/* Track existing card */}
          <div className="card-elevated flex flex-col gap-6 p-8">
            <div
              style={{
                width: 48, height: 48, borderRadius: 10,
                background: 'var(--color-lime-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Search size={22} color="var(--color-lime)" />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                Track your application
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.55 }}>
                Enter your tracking number to see where your submission is in the review process.
              </p>
            </div>
            <form onSubmit={handleTrack} className="flex gap-2" style={{ marginTop: 'auto' }}>
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="APP-2026-A1B2C3"
                className="input-field input-mono flex-1"
                required
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '11px 16px' }}>
                <ArrowRight size={17} />
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // ── Reviewer ───────────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="page-eyebrow">Reviewer Portal</div>
          <h1 className="page-title">Review Queue</h1>
        </div>
        {!isLoading && (
          <span
            style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--color-muted)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              padding: '6px 16px', borderRadius: 100,
            }}
          >
            {applications?.length ?? 0} applications
          </span>
        )}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-muted)', fontSize: 15 }}>
            Loading…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking no.</th>
                <th>Applicant</th>
                <th>Company</th>
                <th>Type</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications?.map((app) => (
                <tr key={app.id}>
                  <td>
                    <span className="input-mono" style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                      {app.tracking_number}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{app.applicant_name}</td>
                  <td style={{ color: 'var(--color-muted)' }}>{app.company_name}</td>
                  <td style={{ color: 'var(--color-muted)' }}>{app.application_type}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td>
                    <button
                      onClick={() => navigate(`/application/${app.id}`)}
                      className="btn btn-ghost"
                      style={{ fontSize: 13, color: 'var(--color-lime)', gap: 4 }}
                    >
                      Open <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {applications?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 60, textAlign: 'center', color: 'var(--color-muted)' }}>
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}