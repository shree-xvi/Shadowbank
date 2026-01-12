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
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        const data = await api.register(username, password, email, mode);
        setSuccess('Registration successful! Logging you in...');
        setTimeout(() => {
          onLogin(data.user, data.token);
        }, 1000);
      } else {
        const data = await api.login(username, password, mode);
        onLogin(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setEmail('');
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
            {isRegistering ? 'Create your CTF account' : 'Authorized Personnel Only'} — <Link to="/scoreboard" className="text-indigo-600 hover:text-indigo-500">CTF Scoreboard</Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-2xl rounded-lg border-t-4 border-slate-900">
          {/* Tab Toggle */}
          <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => !loading && setIsRegistering(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isRegistering ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => !loading && setIsRegistering(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isRegistering ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Register
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-700">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRegistering ? 'Choose a username (min 3 chars)' : 'Enter username'}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegistering ? 'Min 4 characters' : 'Enter password'}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isRegistering ? 'Creating Account...' : 'Authenticating...'}
                  </span>
                ) : (
                  isRegistering ? 'Create Account' : 'Sign In'
                )}
              </button>
            </div>
          </form>

          {isRegistering && (
            <div className="mt-4 text-center text-xs text-slate-500">
              By registering, you agree to participate in this CTF lab ethically.
            </div>
          )}

          <div className="mt-6 border-t border-slate-200 pt-6">
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

            {!isRegistering && (
              <div className="text-xs text-slate-500 space-y-1 font-mono bg-slate-100 p-3 rounded">
                <p className="font-sans text-slate-600 mb-2">Demo accounts for testing:</p>
                <p>User 1: <span className="text-slate-900">victim</span> / <span className="text-slate-900">12345</span></p>
                <p>User 2: <span className="text-slate-900">attacker</span> / <span className="text-slate-900">12345</span></p>
              </div>
            )}

            {isRegistering && mode === 'simulation' && (
              <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                ⚠ Registration in Browser Sim mode only works locally. Use "Local Python" mode for persistent accounts.
              </div>
            )}

            {mode === 'real_backend' && (
              <p className="mt-3 text-xs text-amber-600">
                ⚠ Ensure <code>python backend/app.py</code> is running on port 5000.
              </p>
            )}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-white py-4 px-6 shadow-lg rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700">🏆 Top Players</h4>
            <Link to="/scoreboard" className="text-xs text-indigo-600 hover:text-indigo-500">View All →</Link>
          </div>
          <div className="text-xs text-slate-500 text-center py-4">
            <Link
              to="/scoreboard"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Login to see leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
