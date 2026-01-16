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
  token: string; // Ideally this is a JWT, for this lab it's a simple user_id string
  user: User;
}

export interface ApiError {
  error: string;
}

// Mode for the application: running against browser mock or real python backend
export type AppMode = 'simulation' | 'real_backend';

// Enhanced Challenge System (OWASP Juice Shop style)
export type ChallengeDifficulty = 1 | 2 | 3 | 4 | 5;
export type ChallengeCategory =
  | 'Injection'
  | 'Broken Access Control'
  | 'Cryptographic Failures'
  | 'Security Misconfiguration'
  | 'Sensitive Data Exposure'
  | 'XSS'
  | 'Improper Input Validation'
  | 'SSRF'
  | 'Broken Authentication';

export interface Challenge {
  id: number;
  key: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  solved: boolean;
  solvedAt?: string;
  hints: string[];
  tutorialUrl?: string;
  flag?: string;
}

export interface UserProgress {
  totalScore: number;
  solvedCount: number;
  totalChallenges: number;
  completionPercentage: number;
  achievements: Achievement[];
  startedAt: string;
  lastActivityAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface HintReveal {
  challengeKey: string;
  hintIndex: number;
  revealedAt: string;
}
