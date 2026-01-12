import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { User, AppMode } from '../types';

interface Props {
  onLogin: (user: User, token: string) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Login: React.FC<Props> = ({ onLogin, mode, setMode }) => {
  const [username, setUsername] = useState('attacker');
  const [password, setPassword] = useState('12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username, password, mode);
      onLogin(data.user, data.token);
    } catch (err) {
      setError('Invalid credentials or server unreachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-full h-full text-slate-300 opacity-20" fill="currentColor" viewBox="0 0 100 100">
           <circle cx="50" cy="50" r="50" />
        </svg>
      </div>

      <div className="max-w-md w-full space-y-8 z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-slate-900 rounded-lg flex items-center justify-center mb-4 shadow-xl">
             <span className="text-white font-bold text-3xl">SB</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ShadowBank Corporate
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Authorized Personnel Only — <Link to="/scoreboard" className="text-indigo-600 hover:text-indigo-500">CTF Scoreboard</Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-2xl rounded-lg border-t-4 border-slate-900">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all shadow-md"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Lab Configuration
            </h4>
            
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200 mb-4">
              <span className="text-sm text-slate-700 font-medium">Backend Mode:</span>
              <div className="flex bg-slate-200 rounded p-1">
                <button 
                  onClick={() => setMode('simulation')}
                  className={`px-3 py-1 text-xs rounded font-medium transition-all ${mode === 'simulation' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
                >
                  Browser Sim
                </button>
                <button 
                  onClick={() => setMode('real_backend')}
                  className={`px-3 py-1 text-xs rounded font-medium transition-all ${mode === 'real_backend' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
                >
                  Local Python
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1 font-mono bg-slate-100 p-3 rounded">
              <p>User 1: <span className="text-slate-900">victim</span> / <span className="text-slate-900">12345</span></p>
              <p>User 2: <span className="text-slate-900">attacker</span> / <span className="text-slate-900">12345</span></p>
            </div>
            
            {mode === 'real_backend' && (
              <p className="mt-3 text-xs text-amber-600">
                ⚠ Ensure <code>python backend/app.py</code> is running on port 5000.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
