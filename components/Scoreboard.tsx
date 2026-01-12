import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AppMode, Challenge } from '../types';

interface Props {
  mode: AppMode;
}

const Scoreboard: React.FC<Props> = ({ mode }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const targetMode: AppMode = 'real_backend'; // Scoreboard should reflect real backend state
    const load = async () => {
      try {
        const data = await api.getScoreboard(targetMode);
        setChallenges(data);
      } catch (err) {
        setError('Failed to load scoreboard. Is the backend running on port 5000?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode]);

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-900 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-500 rounded-sm flex items-center justify-center font-bold text-lg">S</div>
            <span className="font-semibold text-lg">ShadowBank CTF</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-slate-300 hover:text-white">Home</Link>
            <span className="px-2 py-1 bg-indigo-600 rounded text-white">Scoreboard</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">CTF Mode Scoreboard</h1>
          <p className="text-slate-600">Track progress for the four vulnerable challenges.</p>
        </div>

        {loading && <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">Loading scoreboard...</div>}
        {error && <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 shadow-sm">{error}</div>}

        {!loading && !error && (
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Challenges</h2>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Status</span>
            </div>
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Challenge</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {challenges.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">#{ch.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{ch.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{ch.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ch.solved ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600 border border-slate-300'
                      }`}>
                        {ch.solved ? 'Solved' : 'Unsolved'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;

