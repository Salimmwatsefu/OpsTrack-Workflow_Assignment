import { useState } from 'react';

interface Props {
  onSuccess: () => void;
}

export function ReviewerLogin({ onSuccess }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate a brief network delay so it doesn't feel instant
    await new Promise((r) => setTimeout(r, 600));

    if (email === 'admin@opstrack.com' && password === 'admin123') {
      onSuccess();
    } else {
      setError('Those credentials dont match. Check the README for the demo login.');
    }

    setLoading(false);
  };

  return (
    <div className="page-container flex items-start justify-center pt-16">
      <div className="w-full max-w-sm">

        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)] flex items-center justify-center mb-6 mx-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="page-title text-center mb-1">Reviewer access</h1>
        <p className="page-sub text-center mb-8">Sign in to access the review queue.</p>

        {/* Form */}
        <div className="card p-6 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@opstrack.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="pt-1 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted)] text-center font-mono">
              admin@opstrack.com / admin123
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}