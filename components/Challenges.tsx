import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AppMode, Challenge, UserProgress, ChallengeCategory } from '../types';

interface Props {
    mode: AppMode;
    token?: string;
}

const difficultyInfo = [
    { label: 'Trivial', color: 'text-emerald-400', bg: 'bg-emerald-500' },
    { label: 'Easy', color: 'text-green-400', bg: 'bg-green-500' },
    { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500' },
    { label: 'Hard', color: 'text-orange-400', bg: 'bg-orange-500' },
    { label: 'Expert', color: 'text-red-400', bg: 'bg-red-500' },
];

const categoryIcons: Record<string, string> = {
    'Injection': '💉',
    'Broken Access Control': '🚪',
    'Cryptographic Failures': '🔐',
    'Security Misconfiguration': '⚙️',
    'Sensitive Data Exposure': '📋',
    'XSS': '⚡',
    'Improper Input Validation': '📝',
    'SSRF': '🌐',
    'Broken Authentication': '🔑',
};

const categoryDescriptions: Record<string, string> = {
    'Injection': 'Flaws that allow attackers to inject malicious code into applications',
    'Broken Access Control': 'Failures in enforcing proper access restrictions on users',
    'Cryptographic Failures': 'Weaknesses in cryptographic implementations or missing encryption',
    'Security Misconfiguration': 'Improperly configured security settings or defaults',
    'Sensitive Data Exposure': 'Exposure of sensitive data to unauthorized parties',
    'XSS': 'Cross-Site Scripting vulnerabilities that execute malicious scripts',
    'Improper Input Validation': 'Insufficient validation of user-supplied input',
    'SSRF': 'Server-Side Request Forgery allowing attackers to make requests from the server',
    'Broken Authentication': 'Weaknesses in authentication mechanisms allowing unauthorized access',
};

const Challenges: React.FC<Props> = ({ mode, token = '' }) => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<number | 'all'>('all');
    const [showSolved, setShowSolved] = useState(true);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [challengeData, progressData] = await Promise.all([
                api.getChallenges(token, mode),
                api.getUserProgress(token, mode)
            ]);
            setChallenges(challengeData);
            setProgress(progressData);
        } catch (err) {
            setError('Failed to load challenges.');
        } finally {
            setLoading(false);
        }
    }, [mode]);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
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

    const categories = [...new Set(challenges.map(ch => ch.category))];

    const filteredChallenges = challenges.filter(ch => {
        if (selectedCategory !== 'all' && ch.category !== selectedCategory) return false;
        if (selectedDifficulty !== 'all' && ch.difficulty !== selectedDifficulty) return false;
        if (!showSolved && ch.solved) return false;
        return true;
    });

    const solvedByCategory = categories.reduce((acc, cat) => {
        const catChallenges = challenges.filter(ch => ch.category === cat);
        const solved = catChallenges.filter(ch => ch.solved).length;
        acc[cat] = { solved, total: catChallenges.length };
        return acc;
    }, {} as Record<string, { solved: number; total: number }>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
                            ← Lab
                        </Link>
                        <span className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-medium">
                            Challenges
                        </span>
                        <Link to="/scoreboard" className="text-slate-400 hover:text-white transition-colors text-sm">
                            Scoreboard
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
                        🎮 Challenge Arena
                    </h1>
                    <p className="text-slate-400">Master API security vulnerabilities through hands-on challenges</p>
                </div>

                {/* Quick Stats */}
                {progress && (
                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                            <span className="text-emerald-400">✅</span>
                            <span className="text-white font-medium">{progress.solvedCount}/{progress.totalChallenges}</span>
                            <span className="text-slate-500">Solved</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                            <span className="text-amber-400">🎯</span>
                            <span className="text-white font-medium">{progress.totalScore}</span>
                            <span className="text-slate-500">Points</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                            <span className="text-purple-400">📊</span>
                            <span className="text-white font-medium">{progress.completionPercentage}%</span>
                            <span className="text-slate-500">Complete</span>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-8">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as ChallengeCategory | 'all')}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{categoryIcons[cat as ChallengeCategory]} {cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">Difficulty</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="all">All Difficulties</option>
                                {difficultyInfo.map((d, i) => (
                                    <option key={i} value={i + 1}>{'★'.repeat(i + 1)} {d.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Show Solved Toggle */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500 uppercase tracking-wide">Show Solved</label>
                            <button
                                onClick={() => setShowSolved(!showSolved)}
                                className={`w-12 h-6 rounded-full transition-colors ${showSolved ? 'bg-indigo-500' : 'bg-slate-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showSolved ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-1">
                        <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
                        <div className="space-y-2">
                            {categories.map(cat => {
                                const { solved, total } = solvedByCategory[cat];
                                const isComplete = solved === total;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat as ChallengeCategory)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${selectedCategory === cat
                                            ? 'bg-indigo-500/20 border-indigo-500/50'
                                            : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
                                            } border`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{categoryIcons[cat as ChallengeCategory]}</span>
                                            <span className={`font-medium ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                                                {cat}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">{solved}/{total} solved</span>
                                            <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${(solved / total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Difficulty Legend */}
                        <h2 className="text-lg font-semibold text-white mt-8 mb-4">Difficulty</h2>
                        <div className="space-y-2">
                            {difficultyInfo.map((d, i) => (
                                <div key={i} className="flex items-center justify-between text-sm p-2">
                                    <div className="flex items-center gap-2">
                                        <span className={d.color}>{'★'.repeat(i + 1)}</span>
                                        <span className="text-slate-400">{d.label}</span>
                                    </div>
                                    <span className="text-slate-500">{(i + 1) * 100} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Challenges Grid */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
                                ⚠️ {error}
                            </div>
                        ) : filteredChallenges.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                                <div className="text-4xl mb-4">🔍</div>
                                <p>No challenges match your filters</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {filteredChallenges.map(challenge => {
                                    const diffInfo = difficultyInfo[challenge.difficulty - 1];
                                    return (
                                        <div
                                            key={challenge.id}
                                            onClick={() => setSelectedChallenge(challenge)}
                                            className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${challenge.solved
                                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{categoryIcons[challenge.category]}</span>
                                                    {challenge.solved && (
                                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                                                            ✓ SOLVED
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className={diffInfo.color}>{'★'.repeat(challenge.difficulty)}</div>
                                                    <div className="text-lg font-bold text-white">{challenge.points} pts</div>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">{challenge.title}</h3>
                                            <p className="text-sm text-slate-400 line-clamp-2">{challenge.description}</p>
                                            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                                                <span className="text-xs text-slate-500">{challenge.category}</span>
                                                <span className="text-xs text-indigo-400">Click to view →</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Challenge Detail Modal */}
            {selectedChallenge && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{categoryIcons[selectedChallenge.category]}</span>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedChallenge.title}</h2>
                                    <p className="text-sm text-slate-400">{selectedChallenge.category}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedChallenge(null)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-5 space-y-6">
                            {/* Status & Points */}
                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-2 rounded-lg ${selectedChallenge.solved
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-700 text-slate-300'
                                    }`}>
                                    {selectedChallenge.solved ? '✅ Solved' : '🎯 Unsolved'}
                                </div>
                                <div className="px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg font-bold">
                                    {selectedChallenge.points} points
                                </div>
                                <div className={`${difficultyInfo[selectedChallenge.difficulty - 1].color}`}>
                                    {'★'.repeat(selectedChallenge.difficulty)} {difficultyInfo[selectedChallenge.difficulty - 1].label}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">Description</h3>
                                <p className="text-slate-400 leading-relaxed">{selectedChallenge.description}</p>
                            </div>

                            {/* Category Info */}
                            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">
                                    About {selectedChallenge.category}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {categoryDescriptions[selectedChallenge.category]}
                                </p>
                            </div>

                            {/* Hints */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <span>💡</span> Hints ({selectedChallenge.hints.filter(h => !h.startsWith('🔒')).length}/{selectedChallenge.hints.length} revealed)
                                </h3>
                                <div className="space-y-2">
                                    {selectedChallenge.hints.map((hint, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg text-sm transition-all ${hint.startsWith('🔒')
                                                ? 'bg-slate-700/50 text-slate-500 cursor-pointer hover:bg-slate-700 border border-slate-600/50'
                                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                                }`}
                                            onClick={() => hint.startsWith('🔒') && handleRevealHint(selectedChallenge.key, index)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="flex-shrink-0">{hint.startsWith('🔒') ? '🔒' : `${index + 1}.`}</span>
                                                <span>{hint.startsWith('🔒') ? 'Click to reveal hint' : hint}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tutorial Link */}
                            {selectedChallenge.tutorialUrl && (
                                <a
                                    href={selectedChallenge.tutorialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                                >
                                    <span>📚</span>
                                    <span>Learn about this vulnerability on OWASP</span>
                                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}

                            {/* Action Button */}
                            <Link
                                to="/"
                                className="block w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-center rounded-lg transition-all shadow-lg shadow-indigo-500/25"
                                onClick={() => setSelectedChallenge(null)}
                            >
                                Go to Lab Environment →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Challenges;
