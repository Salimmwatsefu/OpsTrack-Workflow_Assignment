import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { StatusBadge } from '../components/ui/StatusBadge';

interface Props {
  role: 'applicant' | 'reviewer';
}

export function Dashboard({ role }: Props) {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');

  // Only fetch the master list if we are in the reviewer role
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: api.listApplications,
    enabled: role === 'reviewer',
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) {
      navigate(`/application/${trackId.trim()}`);
    }
  };

  if (role === 'applicant') {
    return (
      <div className="space-y-12 max-w-2xl mx-auto mt-12">
        <div className="border-2 border-primary p-8 bg-surface shadow-solid text-center space-y-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight">Start a New Application</h1>
          <p className="text-gray-600">Draft, review, and submit your official requests.</p>
          <button 
            onClick={() => navigate('/application/new')}
            className="btn-primary w-full text-lg"
          >
            Create Application
          </button>
        </div>

        <div className="border-2 border-primary p-8 bg-surface shadow-solid text-center space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-tight">Track Existing</h2>
          <form onSubmit={handleTrack} className="flex gap-4">
            <input 
              type="text" 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="e.g. APP-2026-A1B2C3" 
              className="input-editorial flex-1"
              required
            />
            <button type="submit" className="btn-outline">Track</button>
          </form>
        </div>
      </div>
    );
  }

  // --- REVIEWER DASHBOARD ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold uppercase tracking-tight">Review Queue</h1>
        <span className="font-medium text-sm border-2 border-primary px-3 py-1 bg-surface shadow-solid">
          {applications?.length || 0} Total
        </span>
      </div>

      {isLoading ? (
        <div className="p-8 font-bold animate-pulse text-center border-2 border-primary">Loading records...</div>
      ) : (
        <div className="border-2 border-primary bg-surface shadow-solid overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-primary bg-background">
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Tracking No.</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Applicant</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Type</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications?.map((app) => (
                <tr key={app.id} className="border-b border-border-light hover:bg-background transition-colors">
                  <td className="p-4 font-medium">{app.tracking_number}</td>
                  <td className="p-4">{app.applicant_name} <br/><span className="text-xs text-gray-500">{app.company_name}</span></td>
                  <td className="p-4 text-sm">{app.application_type}</td>
                  <td className="p-4"><StatusBadge status={app.status} /></td>
                  <td className="p-4">
                    <button 
                      onClick={() => navigate(`/application/${app.id}`)}
                      className="text-sm font-bold underline hover:no-underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {applications?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No applications found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}