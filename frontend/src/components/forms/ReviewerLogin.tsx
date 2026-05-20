// frontend/src/components/forms/ReviewerLogin.tsx
import { useState } from 'react';
import { Lock } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export function ReviewerLogin({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy Auth Check
    if (email === 'admin@opstrack.com' && password === 'admin123') {
      onSuccess();
    } else {
      setError('Invalid credentials. Check the README for the admin login.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 border-2 border-primary p-8 bg-surface shadow-solid space-y-6 text-center">
      <div className="flex justify-center mb-4 text-primary">
        <Lock size={48} strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Authorized Access Only</h2>
        <p className="text-gray-500 text-sm mt-2">Please authenticate to view the reviewer queue.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 text-left">
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Admin Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-editorial"
            placeholder="admin@opstrack.com"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-editorial"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-600 text-sm font-bold bg-red-50 p-2 border border-red-200">{error}</p>}

        <button type="submit" className="btn-primary w-full mt-4">
          Authenticate
        </button>
      </form>
    </div>
  );
}