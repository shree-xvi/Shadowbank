import { AppMode, Challenge, LoginResponse, Transaction } from '../types';
import { mockApi } from './mockDb';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api';

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
    
    if (!res.ok) throw new Error('Invalid credentials');
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
      return mockApi.getTransaction(id);
    }

    // THE VULNERABLE REQUEST
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to fetch transaction');
    return res.json();
  },

  getScoreboard: async (mode: AppMode): Promise<Challenge[]> => {
    if (mode === 'simulation') {
      return mockApi.getScoreboard();
    }

    const res = await fetch(`${API_BASE}/scoreboard`);
    if (!res.ok) throw new Error('Failed to load scoreboard');
    const data = await res.json();
    return data.challenges;
  }
};
