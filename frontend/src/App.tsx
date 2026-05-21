import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FileText, LayoutGrid, LogOut } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { CreateApp } from './pages/CreateApp';
import { AppDetail } from './pages/AppDetail';
import { ReviewerLogin } from './components/forms/ReviewerLogin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

function App() {
  const [role, setRole] = useState<'applicant' | 'reviewer'>(
    (localStorage.getItem('opstrack_role') as any) || 'applicant'
  );
  const [isReviewerAuth, setIsReviewerAuth] = useState(
    localStorage.getItem('opstrack_auth') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('opstrack_role', role);
  }, [role]);

  const handleLoginSuccess = () => {
    setIsReviewerAuth(true);
    localStorage.setItem('opstrack_auth', 'true');
  };

  const handleLogout = () => {
    setIsReviewerAuth(false);
    localStorage.removeItem('opstrack_auth');
    setRole('applicant');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>

          <nav className="top-nav">
            <Link to="/" className="nav-brand">
              <div className="nav-logo">O</div>
              OpsTrack
            </Link>

            <div className="flex items-center gap-3">
              <div className="role-switcher">
                <button
                  onClick={() => setRole('applicant')}
                  className={`role-tab ${role === 'applicant' ? 'active' : ''}`}
                >
                  <FileText size={14} />
                  My Applications
                </button>
                <button
                  onClick={() => setRole('reviewer')}
                  className={`role-tab ${role === 'reviewer' ? 'active' : ''}`}
                >
                  <LayoutGrid size={14} />
                  Review Queue
                </button>
              </div>

              {role === 'reviewer' && isReviewerAuth && (
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="btn btn-ghost p-2"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
                >
                  <LogOut size={17} />
                </button>
              )}
            </div>
          </nav>

          <main className="flex-1">
            {role === 'reviewer' && !isReviewerAuth ? (
              <ReviewerLogin onSuccess={handleLoginSuccess} />
            ) : (
              <Routes>
                <Route path="/"                            element={<Dashboard role={role} />} />
                <Route path="/application/new"             element={<CreateApp />} />
                <Route path="/application/:idOrTracking"   element={<AppDetail role={role} />} />
              </Routes>
            )}
          </main>

        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;