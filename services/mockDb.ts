import { User, Transaction, LoginResponse, Challenge, UserProgress, Achievement } from '../types';

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
  },
  {
    id: 3,
    username: 'admin',
    api_key: 'key_admin_super_secret_789',
    balance: 999999999.99,
    account_number: 'SB-ADMIN-0001'
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
  { id: 15, user_id: 2, amount: -120.00, description: 'Utility Bill - Electric', date: '2023-10-30', recipient_account: 'CITY-POWER', category: 'Debit' },

  // Admin's Secret Transactions
  { id: 16, user_id: 3, amount: -1000000.00, description: 'SECRET: Black Budget Transfer', date: '2023-10-01', recipient_account: 'CLASSIFIED', category: 'Debit' },
  { id: 17, user_id: 3, amount: 5000000.00, description: 'SECRET: Government Contract', date: '2023-10-15', recipient_account: 'SB-ADMIN-0001', category: 'Credit' },
];

// 18 CHALLENGES - OWASP Juice Shop style
const mockChallenges: Challenge[] = [
  // === ORIGINAL 8 CHALLENGES ===
  {
    id: 1, key: 'sqli',
    title: 'SQL Injection Login Bypass',
    description: "Bypass the login form using SQL injection to authenticate as any user without knowing their password.",
    category: 'Injection', difficulty: 2, points: 200, solved: false,
    hints: ["Think about how the backend constructs the SQL query", "What happens with a single quote (') in username?", "Try: ' OR 1=1 --"],
    tutorialUrl: 'https://owasp.org/www-community/attacks/SQL_Injection'
  },
  {
    id: 2, key: 'bola',
    title: 'BOLA / IDOR Attack',
    description: "Access another user's transaction details by exploiting Broken Object Level Authorization.",
    category: 'Broken Access Control', difficulty: 1, points: 100, solved: false,
    hints: ["Observe the transaction IDs when viewing your own transactions", "Try accessing a transaction that doesn't belong to you", "Use the Developer Console to enter IDs like 1 or 2"],
    tutorialUrl: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/'
  },
  {
    id: 3, key: 'xss',
    title: 'Reflected XSS Attack',
    description: 'Execute arbitrary JavaScript in the browser through a reflected XSS vulnerability.',
    category: 'XSS', difficulty: 2, points: 200, solved: false,
    hints: ["Look for input fields that reflect your input back", "The /api/search endpoint might not sanitize input", "Try: <script>alert('XSS')</script>"],
    tutorialUrl: 'https://owasp.org/www-community/attacks/xss/'
  },
  {
    id: 4, key: 'admin_dump',
    title: 'Sensitive Data Exposure',
    description: 'Discover and access an unprotected admin endpoint that exposes sensitive user data.',
    category: 'Sensitive Data Exposure', difficulty: 3, points: 300, solved: false,
    hints: ["Admin endpoints often follow predictable naming patterns", "Try accessing /api/admin/users directly", "No authentication required!"],
    tutorialUrl: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/'
  },
  {
    id: 5, key: 'api_key_theft',
    title: 'API Key Theft',
    description: "Extract a user's API key through the data exposure vulnerability.",
    category: 'Broken Access Control', difficulty: 2, points: 200, solved: false,
    hints: ["The /api/admin/users endpoint returns more than just usernames", "API keys are included in the response", "Use these keys to impersonate users"]
  },
  {
    id: 6, key: 'mass_assignment',
    title: 'Mass Assignment',
    description: 'Modify your account balance by exploiting improper handling of user input.',
    category: 'Improper Input Validation', difficulty: 4, points: 400, solved: false,
    hints: ["Try updating your profile with extra fields", "What if you include 'balance' in your update request?", "PUT /api/profile with {balance: 999999}"]
  },
  {
    id: 7, key: 'weak_token',
    title: 'Token Enumeration',
    description: 'Discover that authentication tokens are predictable and can be enumerated.',
    category: 'Cryptographic Failures', difficulty: 3, points: 300, solved: false,
    hints: ["Look at the token you receive after login", "Is it truly random or predictable?", "Try using token '1' in the Authorization header"]
  },
  {
    id: 8, key: 'hidden_admin',
    title: 'Hidden Admin Account',
    description: 'Discover and login to a hidden admin account with access to all transactions.',
    category: 'Security Misconfiguration', difficulty: 4, points: 400, solved: false,
    hints: ["Check the /api/admin/users endpoint for all users", "An admin account might exist with user_id 3", "Try logging in as 'admin' user"]
  },

  // === NEW 10 CHALLENGES ===
  {
    id: 9, key: 'stored_xss',
    title: 'Stored XSS via Comments',
    description: 'Persist a malicious script in the comments system that executes for other users.',
    category: 'XSS', difficulty: 3, points: 300, solved: false,
    hints: ["POST a comment to /api/comments", "Include a <script> tag in the comment text", "View /api/comments to see your payload execute"],
    tutorialUrl: 'https://owasp.org/www-community/attacks/xss/'
  },
  {
    id: 10, key: 'ssrf',
    title: 'Server-Side Request Forgery',
    description: 'Make the server fetch internal resources that should not be accessible externally.',
    category: 'SSRF', difficulty: 4, points: 400, solved: false,
    hints: ["Find an endpoint that fetches URLs", "/api/fetch-url?url= takes a URL parameter", "Try fetching http://localhost or file:// URLs"],
    tutorialUrl: 'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/'
  },
  {
    id: 11, key: 'jwt_none',
    title: 'JWT Algorithm None Attack',
    description: 'Bypass JWT signature verification by exploiting the "none" algorithm vulnerability.',
    category: 'Cryptographic Failures', difficulty: 4, points: 400, solved: false,
    hints: ["JWTs have a header that specifies the algorithm", "What if you set the algorithm to 'none'?", "Craft a JWT: {\"alg\":\"none\"}.{\"user_id\":1}."],
    tutorialUrl: 'https://portswigger.net/web-security/jwt'
  },
  {
    id: 12, key: 'path_traversal',
    title: 'Path Traversal',
    description: 'Read sensitive files from the server by escaping the intended directory.',
    category: 'Injection', difficulty: 3, points: 300, solved: false,
    hints: ["The /api/files endpoint reads files", "Try adding ../ to escape the directory", "/api/files?name=../../../etc/passwd"],
    tutorialUrl: 'https://owasp.org/www-community/attacks/Path_Traversal'
  },
  {
    id: 13, key: 'rate_limit',
    title: 'Missing Rate Limiting',
    description: 'Brute force the password reset code due to missing rate limiting.',
    category: 'Security Misconfiguration', difficulty: 2, points: 200, solved: false,
    hints: ["The password reset endpoint accepts codes", "There's no limit on how many attempts you can make", "Send 10+ requests to /api/password-reset"],
    tutorialUrl: 'https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks'
  },
  {
    id: 14, key: 'xxe',
    title: 'XML External Entity (XXE)',
    description: 'Exploit the XML parser to read local files or make server-side requests.',
    category: 'Injection', difficulty: 5, points: 500, solved: false,
    hints: ["POST XML data to /api/xml/parse", "Include an external entity declaration", "<!ENTITY xxe SYSTEM 'file:///etc/passwd'>"],
    tutorialUrl: 'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing'
  },
  {
    id: 15, key: 'open_redirect',
    title: 'Open Redirect',
    description: 'Abuse the redirect functionality to send users to malicious external sites.',
    category: 'Security Misconfiguration', difficulty: 2, points: 200, solved: false,
    hints: ["Find a redirect endpoint", "/api/redirect?url= takes a destination URL", "Try redirecting to https://evil.com"],
    tutorialUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html'
  },
  {
    id: 16, key: 'insecure_deserialization',
    title: 'Insecure Deserialization',
    description: 'Execute arbitrary code by exploiting unsafe deserialization of user input.',
    category: 'Injection', difficulty: 5, points: 500, solved: false,
    hints: ["POST serialized data to /api/import-data", "Python's pickle module is unsafe with untrusted data", "Include __reduce__ or os.system in payload"],
    tutorialUrl: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/16-Testing_for_HTTP_Incoming_Requests'
  },
  {
    id: 17, key: 'broken_auth',
    title: 'Password Reset Poisoning',
    description: 'Hijack password reset links by poisoning the Host header.',
    category: 'Broken Authentication', difficulty: 4, points: 400, solved: false,
    hints: ["The reset link uses the Host header", "Add X-Forwarded-Host header with your domain", "The reset link will point to your site!"],
    tutorialUrl: 'https://portswigger.net/web-security/host-header/exploiting/password-reset-poisoning'
  },
  {
    id: 18, key: 'verbose_errors',
    title: 'Verbose Error Messages',
    description: 'Extract sensitive information from overly detailed error messages and stack traces.',
    category: 'Security Misconfiguration', difficulty: 1, points: 100, solved: false,
    hints: ["Trigger an error condition", "Visit /api/debug/error?type=db", "Error responses contain database credentials!"],
    tutorialUrl: 'https://owasp.org/www-community/Improper_Error_Handling'
  },
];

// User progress tracking (stored in localStorage)
const PROGRESS_KEY = 'shadowbank_progress';
const HINTS_KEY = 'shadowbank_hints';

const getProgress = (): UserProgress => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    totalScore: 0,
    solvedCount: 0,
    totalChallenges: mockChallenges.length,
    completionPercentage: 0,
    achievements: [],
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString()
  };
};

const saveProgress = (progress: UserProgress): void => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

const getSolvedChallenges = (): Set<string> => {
  const stored = localStorage.getItem('shadowbank_solved');
  if (stored) {
    return new Set(JSON.parse(stored));
  }
  return new Set();
};

const saveSolvedChallenge = (key: string): void => {
  const solved = getSolvedChallenges();
  solved.add(key);
  localStorage.setItem('shadowbank_solved', JSON.stringify([...solved]));
};

const getRevealedHints = (): Map<string, number[]> => {
  const stored = localStorage.getItem(HINTS_KEY);
  if (stored) {
    const obj = JSON.parse(stored);
    return new Map(Object.entries(obj).map(([k, v]) => [k, v as number[]]));
  }
  return new Map();
};

const saveRevealedHint = (challengeKey: string, hintIndex: number): void => {
  const hints = getRevealedHints();
  const current = hints.get(challengeKey) || [];
  if (!current.includes(hintIndex)) {
    current.push(hintIndex);
    hints.set(challengeKey, current);
    localStorage.setItem(HINTS_KEY, JSON.stringify(Object.fromEntries(hints)));
  }
};

// Achievements
const defaultAchievements: Achievement[] = [
  { id: 'first_blood', title: 'First Blood', description: 'Solve your first challenge', icon: '🩸' },
  { id: 'injection_master', title: 'Injection Master', description: 'Complete all injection challenges', icon: '💉' },
  { id: 'access_denied', title: 'Access Denied?', description: 'Exploit a broken access control vulnerability', icon: '🚪' },
  { id: 'half_way', title: 'Halfway There', description: 'Complete 50% of all challenges', icon: '🎯' },
  { id: 'completionist', title: 'Completionist', description: 'Solve all challenges', icon: '🏆' },
  { id: 'xss_ninja', title: 'XSS Ninja', description: 'Complete all XSS challenges', icon: '⚡' },
  { id: 'crypto_breaker', title: 'Crypto Breaker', description: 'Break cryptographic protections', icon: '🔐' },
  { id: 'full_access', title: 'Full Access', description: 'Gain admin access', icon: '👑' },
];

// MOCK API LOGIC
export const mockApi = {
  login: async (username: string): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check for SQL injection bypass
        if (username.toLowerCase().includes("' or") || username.toLowerCase().includes('" or') || username.includes('1=1')) {
          saveSolvedChallenge('sqli');
          const user = users[0]; // Return victim user on SQL injection
          resolve({ token: String(user.id), user });
          return;
        }

        const user = users.find(u => u.username === username);
        if (user) {
          // Check for hidden admin
          if (user.username === 'admin') {
            saveSolvedChallenge('hidden_admin');
          }
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
      const userTxs = transactions.filter(t => t.user_id === userId);

      setTimeout(() => {
        if (user) {
          resolve({
            balance: user.balance,
            account_number: user.account_number,
            recent_transactions: userTxs.sort((a, b) => b.id - a.id).map(({ id, amount, description, date, category }) => ({ id, amount, description, date, category }))
          });
        }
      }, 300);
    });
  },

  getTransaction: async (id: number, token?: string): Promise<Transaction> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tx = transactions.find(t => t.id === id);
        if (tx) {
          if (token) {
            const userId = parseInt(token);
            if (tx.user_id !== userId) {
              saveSolvedChallenge('bola');
            }
          }
          resolve(tx);
        } else {
          reject(new Error("Transaction not found"));
        }
      }, 300);
    });
  },

  getScoreboard: async (): Promise<Challenge[]> => {
    const solved = getSolvedChallenges();
    const revealedHints = getRevealedHints();

    return Promise.resolve(mockChallenges.map(ch => ({
      ...ch,
      solved: solved.has(ch.key),
      solvedAt: solved.has(ch.key) ? new Date().toISOString() : undefined,
      hints: ch.hints.map((hint, i) => {
        const revealed = revealedHints.get(ch.key) || [];
        return revealed.includes(i) ? hint : '🔒 Hint locked - click to reveal';
      })
    })));
  },

  getChallenges: async (): Promise<Challenge[]> => {
    const solved = getSolvedChallenges();
    const revealedHints = getRevealedHints();

    return Promise.resolve(mockChallenges.map(ch => ({
      ...ch,
      solved: solved.has(ch.key),
      solvedAt: solved.has(ch.key) ? new Date().toISOString() : undefined,
      hints: ch.hints.map((hint, i) => {
        const revealed = revealedHints.get(ch.key) || [];
        return revealed.includes(i) ? hint : '🔒 Hint locked - click to reveal';
      })
    })));
  },

  getUserProgress: async (): Promise<UserProgress> => {
    const solved = getSolvedChallenges();
    const solvedChallenges = mockChallenges.filter(ch => solved.has(ch.key));
    const totalScore = solvedChallenges.reduce((sum, ch) => sum + ch.points, 0);

    return Promise.resolve({
      totalScore,
      solvedCount: solvedChallenges.length,
      totalChallenges: mockChallenges.length,
      completionPercentage: Math.round((solvedChallenges.length / mockChallenges.length) * 100),
      achievements: getUnlockedAchievements(solvedChallenges),
      startedAt: getProgress().startedAt,
      lastActivityAt: new Date().toISOString()
    });
  },

  revealHint: async (challengeKey: string, hintIndex: number): Promise<string> => {
    const challenge = mockChallenges.find(ch => ch.key === challengeKey);
    if (!challenge || hintIndex >= challenge.hints.length) {
      throw new Error('Invalid hint request');
    }
    saveRevealedHint(challengeKey, hintIndex);
    return Promise.resolve(challenge.hints[hintIndex]);
  },

  submitFlag: async (challengeKey: string, flag: string): Promise<boolean> => {
    const challenge = mockChallenges.find(ch => ch.key === challengeKey);
    if (challenge) {
      saveSolvedChallenge(challengeKey);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  resetProgress: async (): Promise<void> => {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem('shadowbank_solved');
    localStorage.removeItem(HINTS_KEY);
    return Promise.resolve();
  },

  getAdminUsers: async (): Promise<User[]> => {
    saveSolvedChallenge('admin_dump');
    saveSolvedChallenge('api_key_theft');
    return Promise.resolve(users);
  }
};

function getUnlockedAchievements(solvedChallenges: Challenge[]): Achievement[] {
  const unlocked: Achievement[] = [];

  if (solvedChallenges.length >= 1) {
    unlocked.push({ ...defaultAchievements[0], unlockedAt: new Date().toISOString() });
  }

  const injectionChallenges = mockChallenges.filter(ch => ch.category === 'Injection');
  const solvedInjection = solvedChallenges.filter(ch => ch.category === 'Injection');
  if (solvedInjection.length === injectionChallenges.length && injectionChallenges.length > 0) {
    unlocked.push({ ...defaultAchievements[1], unlockedAt: new Date().toISOString() });
  }

  if (solvedChallenges.some(ch => ch.category === 'Broken Access Control')) {
    unlocked.push({ ...defaultAchievements[2], unlockedAt: new Date().toISOString() });
  }

  if (solvedChallenges.length >= mockChallenges.length / 2) {
    unlocked.push({ ...defaultAchievements[3], unlockedAt: new Date().toISOString() });
  }

  if (solvedChallenges.length === mockChallenges.length) {
    unlocked.push({ ...defaultAchievements[4], unlockedAt: new Date().toISOString() });
  }

  const xssChallenges = mockChallenges.filter(ch => ch.category === 'XSS');
  const solvedXss = solvedChallenges.filter(ch => ch.category === 'XSS');
  if (solvedXss.length === xssChallenges.length && xssChallenges.length > 0) {
    unlocked.push({ ...defaultAchievements[5], unlockedAt: new Date().toISOString() });
  }

  if (solvedChallenges.some(ch => ch.category === 'Cryptographic Failures')) {
    unlocked.push({ ...defaultAchievements[6], unlockedAt: new Date().toISOString() });
  }

  if (solvedChallenges.some(ch => ch.key === 'hidden_admin')) {
    unlocked.push({ ...defaultAchievements[7], unlockedAt: new Date().toISOString() });
  }

  return unlocked;
}