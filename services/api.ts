import { AppMode, Challenge, LoginResponse, Transaction, UserProgress, User } from '../types';
import { mockApi } from './mockDb';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  solved: number;
  lastSolve: string | null;
}

export const api = {
  login: async (username: string, password: string, mode: AppMode): Promise<LoginResponse> => {
    if (mode === 'simulation') {
      return mockApi.login(username);
    }

    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Invalid credentials');
    }
    return res.json();
  },

  register: async (username: string, password: string, email: string, mode: AppMode): Promise<LoginResponse> => {
    if (mode === 'simulation') {
      // In simulation mode, just create a mock user
      const mockUser: User = {
        id: Date.now(),
        username,
        api_key: `key_${username}_mock`,
        balance: 100.00,
        account_number: `SB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
      };
      return { token: String(mockUser.id), user: mockUser };
    }

    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Registration failed');
    }
    return res.json();
  },

  getDashboard: async (token: string, mode: AppMode) => {
    if (mode === 'simulation') {
      return mockApi.getDashboard(token);
    }

    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  getTransaction: async (id: number, token: string, mode: AppMode): Promise<Transaction> => {
    if (mode === 'simulation') {
      return mockApi.getTransaction(id, token);
    }

    // THE VULNERABLE REQUEST
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch transaction');
    return res.json();
  },

  getScoreboard: async (token: string, mode: AppMode): Promise<Challenge[]> => {
    if (mode === 'simulation') {
      return mockApi.getScoreboard();
    }

    const res = await fetch(`${API_BASE}/scoreboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load scoreboard');
    const data = await res.json();
    return data.challenges;
  },

  getChallenges: async (token: string, mode: AppMode): Promise<Challenge[]> => {
    if (mode === 'simulation') {
      return mockApi.getChallenges();
    }

    const res = await fetch(`${API_BASE}/challenges`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load challenges');
    const data = await res.json();
    return data.challenges;
  },

  getUserProgress: async (token: string, mode: AppMode): Promise<UserProgress> => {
    if (mode === 'simulation') {
      return mockApi.getUserProgress();
    }

    const res = await fetch(`${API_BASE}/progress`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load progress');
    return res.json();
  },

  getLeaderboard: async (mode: AppMode): Promise<LeaderboardEntry[]> => {
    if (mode === 'simulation') {
      // Mock leaderboard for simulation
      return [
        { rank: 1, username: 'h4ck3r_1337', score: 2100, solved: 8, lastSolve: new Date().toISOString() },
        { rank: 2, username: 'security_guru', score: 1500, solved: 6, lastSolve: new Date().toISOString() },
        { rank: 3, username: 'ctf_player', score: 800, solved: 3, lastSolve: new Date().toISOString() },
      ];
    }

    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('Failed to load leaderboard');
    const data = await res.json();
    return data.leaderboard;
  },

  revealHint: async (challengeKey: string, hintIndex: number, token: string, mode: AppMode): Promise<string> => {
    if (mode === 'simulation') {
      return mockApi.revealHint(challengeKey, hintIndex);
    }

    const res = await fetch(`${API_BASE}/hints/reveal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ challengeKey, hintIndex })
    });
    if (!res.ok) throw new Error('Failed to reveal hint');
    const data = await res.json();
    return data.hint;
  },

  submitFlag: async (challengeKey: string, flag: string, token: string, mode: AppMode): Promise<boolean> => {
    if (mode === 'simulation') {
      return mockApi.submitFlag(challengeKey, flag);
    }

    const res = await fetch(`${API_BASE}/flags/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ challengeKey, flag })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success;
  },

  resetProgress: async (token: string, mode: AppMode): Promise<void> => {
    if (mode === 'simulation') {
      return mockApi.resetProgress();
    }

    await fetch(`${API_BASE}/progress/reset`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  getAdminUsers: async (token: string, mode: AppMode): Promise<User[]> => {
    if (mode === 'simulation') {
      return mockApi.getAdminUsers();
    }

    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load admin users');
    const data = await res.json();
    return data.users;
  }
};
