import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, LeaderboardEntry } from '../services/api';
import { AppMode, Challenge, UserProgress } from '../types';

interface Props {
  mode: AppMode;
  token?: string;
}

const difficultyStars = (level: number) => {
  return Array(5).fill(0).map((_, i) => (
    <span key={i} className={`text-lg ${i < level ? 'text-yellow-400' : 'text-slate-600'}`}>★</span>
  ));
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Injection': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  'Broken Access Control': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'Cryptographic Failures': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Security Misconfiguration': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Sensitive Data Exposure': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  'XSS': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  'Improper Input Validation': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'SSRF': { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  'Broken Authentication': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
};

const Scoreboard: React.FC<Props> = ({ mode, token = '' }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedChallenge, setExpandedChallenge] = useState<number | null>(null);
  const [confetti, setConfetti] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');

  const loadData = useCallback(async () => {
    try {
      const [challengeData, progressData, leaderboardData] = await Promise.all([
        api.getChallenges(token, mode),
        api.getUserProgress(token, mode),
        api.getLeaderboard(mode)
      ]);
      setChallenges(challengeData);
      setProgress(progressData);
      setLeaderboard(leaderboardData);

      // Show confetti if completed
      if (progressData.completionPercentage === 100) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 5000);
      }
    } catch (err) {
      setError('Failed to load scoreboard data.');
    } finally {
      setLoading(false);
    }
  }, [mode, token]);

  useEffect(() => {
    loadData();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRevealHint = async (challengeKey: string, hintIndex: number) => {
    try {
      await api.revealHint(challengeKey, hintIndex, token, mode);
      await loadData();
    } catch (err) {
      console.error('Failed to reveal hint:', err);
    }
  };

  const handleResetProgress = async () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      await api.resetProgress(token, mode);
      await loadData();
    }
  };

  const solvedChallenges = challenges.filter(ch => ch.solved);
  const totalPoints = challenges.reduce((sum, ch) => sum + ch.points, 0);
  const earnedPoints = solvedChallenges.reduce((sum, ch) => sum + ch.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Confetti animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array(50).fill(0).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96f2d7', '#ffd93d', '#c084fc'][Math.floor(Math.random() * 6)],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/25">
              S
            </div>
            <div>
              <span className="font-bold text-lg text-white">ShadowBank</span>
              <span className="ml-2 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-semibold">CTF</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm">
              ← Back to Lab
            </Link>
            <Link to="/challenges" className="text-slate-400 hover:text-white transition-colors text-sm">
              Challenges
            </Link>
            <span className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-medium">
              Scoreboard
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
            🏆 CTF Scoreboard
          </h1>
          <p className="text-slate-400">Track your progress and conquer all security challenges!</p>
        </div>

        {/* Progress Stats Cards */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-500/30 rounded-xl flex items-center justify-center text-xl">
                  🎯
                </div>
                <span className="text-slate-400 text-sm uppercase tracking-wide">Total Score</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {earnedPoints} <span className="text-slate-500 text-lg font-normal">/ {totalPoints}</span>
              </div>
            </div>

            {/* Challenges Card */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500/30 rounded-xl flex items-center justify-center text-xl">
                  ✅
                </div>
                <span className="text-slate-400 text-sm uppercase tracking-wide">Challenges</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {progress.solvedCount} <span className="text-slate-500 text-lg font-normal">/ {progress.totalChallenges}</span>
              </div>
            </div>

            {/* Completion Card */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-500/30 rounded-xl flex items-center justify-center text-xl">
                  📊
                </div>
                <span className="text-slate-400 text-sm uppercase tracking-wide">Completion</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {progress.completionPercentage}%
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Achievements Card */}
            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-pink-500/30 rounded-xl flex items-center justify-center text-xl">
                  🏅
                </div>
                <span className="text-slate-400 text-sm uppercase tracking-wide">Achievements</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {progress.achievements.length}
              </div>
              <div className="mt-2 flex gap-1">
                {progress.achievements.slice(0, 4).map((ach, i) => (
                  <span key={i} title={ach.title} className="text-lg">{ach.icon}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6 max-w-xs">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'challenges'
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            Challenges
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'leaderboard'
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            🏆 Leaderboard
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
            <span className="text-xl mr-2">⚠️</span> {error}
          </div>
        )}

        {/* Leaderboard Tab */}
        {!loading && !error && activeTab === 'leaderboard' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                🏆 Global Leaderboard
              </h2>
              <span className="text-xs text-slate-500">Top 50 players</span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">🎮</div>
                <p>No scores yet. Be the first to solve a challenge!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-3">Rank</th>
                      <th className="px-6 py-3">Player</th>
                      <th className="px-6 py-3 text-right">Score</th>
                      <th className="px-6 py-3 text-right">Solved</th>
                      <th className="px-6 py-3 text-right">Last Solve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {leaderboard.map((entry, i) => (
                      <tr
                        key={entry.username}
                        className={`hover:bg-slate-700/30 transition-colors ${i === 0 ? 'bg-amber-500/10' :
                            i === 1 ? 'bg-slate-400/5' :
                              i === 2 ? 'bg-orange-500/5' : ''
                          }`}
                      >
                        <td className="px-6 py-4">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${i === 0 ? 'bg-amber-500 text-white' :
                              i === 1 ? 'bg-slate-400 text-white' :
                                i === 2 ? 'bg-orange-600 text-white' :
                                  'bg-slate-700 text-slate-400'
                            }`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : entry.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {entry.username[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{entry.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-lg text-indigo-400">{entry.score}</span>
                          <span className="text-slate-500 text-sm ml-1">pts</span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400">
                          {entry.solved} / {challenges.length}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-500">
                          {entry.lastSolve ? new Date(entry.lastSolve).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Challenges Tab */}
        {!loading && !error && activeTab === 'challenges' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Challenges</h2>
              <button
                onClick={handleResetProgress}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Reset Progress
              </button>
            </div>

            <div className="grid gap-4">
              {challenges.map((challenge) => {
                const colors = categoryColors[challenge.category] || { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
                const isExpanded = expandedChallenge === challenge.id;

                return (
                  <div
                    key={challenge.id}
                    className={`bg-slate-800/50 border rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 ${challenge.solved ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/50 hover:border-slate-600/50'
                      }`}
                  >
                    {/* Challenge Header */}
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => setExpandedChallenge(isExpanded ? null : challenge.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                              {challenge.category}
                            </span>
                            <span className="text-slate-500 font-mono text-sm">#{challenge.id}</span>
                            {challenge.solved && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                SOLVED
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {challenge.title}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {challenge.description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex mb-1">{difficultyStars(challenge.difficulty)}</div>
                          <div className={`text-lg font-bold ${challenge.solved ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {challenge.points} pts
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-700/50">
                        {/* Hints Section */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <span>💡</span> Hints
                          </h4>
                          <div className="space-y-2">
                            {challenge.hints.map((hint, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg text-sm ${hint.startsWith('🔒')
                                  ? 'bg-slate-700/50 text-slate-500 cursor-pointer hover:bg-slate-700'
                                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                  }`}
                                onClick={() => hint.startsWith('🔒') && handleRevealHint(challenge.key, index)}
                              >
                                {hint}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tutorial Link */}
                        {challenge.tutorialUrl && (
                          <a
                            href={challenge.tutorialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <span>📚</span> Learn more about this vulnerability
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {progress && progress.achievements.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-6">🏅 Unlocked Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {progress.achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform"
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h3 className="font-semibold text-white text-sm">{achievement.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Scoreboard;
