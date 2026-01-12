export interface User {
  id: number;
  username: string;
  api_key: string;
  balance: number;
  account_number: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  date: string;
  recipient_account: string;
  category: 'Debit' | 'Credit';
}

export interface LoginResponse {
  token: string; // Ideally this is a JWT, for this lab it's just the user_id or a simple string
  user: User;
}

export interface ApiError {
  error: string;
}

// Mode for the application: running against browser mock or real python backend
export type AppMode = 'simulation' | 'real_backend';

export interface Challenge {
  id: number;
  key: string;
  title: string;
  description: string;
  solved: boolean;
}
