import { User, Transaction, LoginResponse, Challenge } from '../types';

// MOCK DATA SEEDING
const users: User[] = [
  {
    id: 1,
    username: 'victim',
    api_key: 'key_victim_secret_123',
    balance: 1500000.00,
    account_number: 'SB-8829-9921'
  },
  {
    id: 2,
    username: 'attacker',
    api_key: 'key_attacker_public_456',
    balance: 50.00,
    account_number: 'SB-1102-3344'
  }
];

const transactions: Transaction[] = [
  // Victim's Transactions (High Value / Confidential)
  { id: 1, user_id: 1, amount: -50000.00, description: 'Wire Transfer - Offshore Holdings', date: '2023-10-12', recipient_account: 'KY-2929-1111', category: 'Debit' },
  { id: 2, user_id: 1, amount: 250000.00, description: 'Dividend Payout - Corp A', date: '2023-10-15', recipient_account: 'SB-8829-9921', category: 'Credit' },
  { id: 5, user_id: 1, amount: -1200.00, description: 'Luxury Car Lease Payment', date: '2023-10-01', recipient_account: 'AUTO-LEASE-01', category: 'Debit' },
  { id: 6, user_id: 1, amount: -450.00, description: 'Golf Club Membership', date: '2023-10-05', recipient_account: 'CLUB-ELITE', category: 'Debit' },
  { id: 7, user_id: 1, amount: 15000.00, description: 'Consulting Fee - Tech Strategy', date: '2023-10-18', recipient_account: 'SB-8829-9921', category: 'Credit' },
  { id: 11, user_id: 1, amount: -3200.00, description: 'Fine Art Auction Deposit', date: '2023-10-28', recipient_account: 'SOTHEBYS-NYC', category: 'Debit' },
  { id: 13, user_id: 1, amount: -150.00, description: 'Executive Lunch', date: '2023-10-30', recipient_account: 'NOBU-DOWNTOWN', category: 'Debit' },
  
  // Attacker's Transactions (Low Value / Everyday)
  { id: 3, user_id: 2, amount: -15.00, description: 'Coffee Shop', date: '2023-10-20', recipient_account: 'MERCHANT-99', category: 'Debit' },
  { id: 4, user_id: 2, amount: -5.00, description: 'Bus Ticket', date: '2023-10-21', recipient_account: 'MERCHANT-22', category: 'Debit' },
  { id: 8, user_id: 2, amount: -12.50, description: 'Fast Food Lunch', date: '2023-10-22', recipient_account: 'BURGER-KING', category: 'Debit' },
  { id: 9, user_id: 2, amount: 2500.00, description: 'Monthly Salary', date: '2023-10-25', recipient_account: 'SB-1102-3344', category: 'Credit' },
  { id: 10, user_id: 2, amount: -60.00, description: 'Gas Station Fuel', date: '2023-10-26', recipient_account: 'SHELL-01', category: 'Debit' },
  { id: 12, user_id: 2, amount: -9.99, description: 'Streaming Service', date: '2023-10-28', recipient_account: 'NETFLIX', category: 'Debit' },
  { id: 14, user_id: 2, amount: -45.00, description: 'Grocery Store', date: '2023-10-29', recipient_account: 'WHOLE-FOODS', category: 'Debit' },
  { id: 15, user_id: 2, amount: -120.00, description: 'Utility Bill - Electric', date: '2023-10-30', recipient_account: 'CITY-POWER', category: 'Debit' }
];

const mockChallenges: Challenge[] = [
  { id: 1, key: 'sqli', title: 'SQL Injection Login Bypass', description: "Bypass login with `' OR 1=1 --`", solved: false },
  { id: 2, key: 'bola', title: 'BOLA / IDOR on Transactions', description: 'Access another user transaction by ID', solved: false },
  { id: 3, key: 'xss', title: 'Reflected XSS Search', description: 'Inject script via search query', solved: false },
  { id: 4, key: 'admin_dump', title: 'Sensitive Data Exposure', description: 'Dump all users including passwords', solved: false },
];

// MOCK API LOGIC
export const mockApi = {
  login: async (username: string): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.username === username);
        if (user) {
          resolve({ token: String(user.id), user });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 500);
    });
  },

  getDashboard: async (token: string): Promise<any> => {
    return new Promise((resolve) => {
      const userId = parseInt(token);
      const user = users.find(u => u.id === userId);
      // Secure filtering for dashboard
      const userTxs = transactions.filter(t => t.user_id === userId);
      
      setTimeout(() => {
        if (user) {
          resolve({
            balance: user.balance,
            account_number: user.account_number,
            // Return transactions sorted by ID descending (newest first simulation)
            recent_transactions: userTxs.sort((a,b) => b.id - a.id).map(({ id, amount, description, date, category }) => ({ id, amount, description, date, category }))
          });
        }
      }, 300);
    });
  },

  // VULNERABLE MOCK ENDPOINT
  getTransaction: async (id: number): Promise<Transaction> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // VULNERABILITY: We just find by ID. We do NOT check if the token matches the user_id.
        const tx = transactions.find(t => t.id === id);
        if (tx) {
          resolve(tx);
        } else {
          reject(new Error("Transaction not found"));
        }
      }, 300);
    });
  },

  getScoreboard: async (): Promise<Challenge[]> => {
    return Promise.resolve(mockChallenges);
  }
};