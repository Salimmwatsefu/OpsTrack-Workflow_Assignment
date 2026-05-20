// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutDashboard, FileText, LogOut } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { CreateApp } from './pages/CreateApp';
import { AppDetail } from './pages/AppDetail';
import { ReviewerLogin } from './components/forms/ReviewerLogin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  // Load initial state from localStorage
  const [role, setRole] = useState<'applicant' | 'reviewer'>(
    (localStorage.getItem('opstrack_role') as any) || 'applicant'
  );
  const [isReviewerAuth, setIsReviewerAuth] = useState(
    localStorage.getItem('opstrack_auth') === 'true'
  );

  // Sync state changes to localStorage
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
    setRole('applicant'); // Boot them back to the public view
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
          
          {/* Top Navigation */}
          <nav className="border-b-2 border-primary bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-white flex items-center justify-center font-black text-xs">O</div>
              OpsTrack
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Role Switcher */}
              <div className="flex items-center gap-2 text-sm font-semibold border-2 border-primary p-1 bg-[#fcfcfc]">
                <button 
                  onClick={() => setRole('applicant')}
                  className={`px-3 py-1.5 flex items-center gap-2 transition-colors ${
                    role === 'applicant' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  <FileText size={16} />
                  Applicant View
                </button>
                <button 
                  onClick={() => setRole('reviewer')}
                  className={`px-3 py-1.5 flex items-center gap-2 transition-colors ${
                    role === 'reviewer' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Reviewer Queue
                </button>
              </div>

              {/* Logout Button (Only visible if authenticated reviewer) */}
              {role === 'reviewer' && isReviewerAuth && (
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </nav>

          {/* Core Content Container */}
          <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12">
            {/* The Gatekeeper Logic */}
            {role === 'reviewer' && !isReviewerAuth ? (
              <ReviewerLogin onSuccess={handleLoginSuccess} />
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard role={role} />} />
                <Route path="/application/new" element={<CreateApp />} />
                <Route path="/application/:idOrTracking" element={<AppDetail role={role} />} />
              </Routes>
            )}
          </main>
          
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;