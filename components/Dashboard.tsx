import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Transaction, AppMode } from '../types';
import { api } from '../services/api';
import TransactionModal from './TransactionModal';

interface Props {
  user: User;
  token: string;
  mode: AppMode;
  onLogout: () => void;
}

const Dashboard: React.FC<Props> = ({ user, token, mode, onLogout }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedTxId, setSelectedTxId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [token, mode]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard(token, mode);
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTransaction = async (id: number) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setCurrentTransaction(null);

    try {
      // THIS IS THE ATTACK VECTOR: Passing any ID to the API
      const tx = await api.getTransaction(id, token, mode);
      setCurrentTransaction(tx);
    } catch (err) {
      setModalError("Access Denied or Not Found");
    } finally {
      setModalLoading(false);
    }
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTxId) {
      handleFetchTransaction(parseInt(selectedTxId));
    }
  };

  const filteredTransactions = dashboardData?.recent_transactions?.filter((tx: any) => 
    tx.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-indigo-500 rounded-sm flex items-center justify-center font-bold text-lg">S</div>
              <span className="font-bold text-xl tracking-tight">ShadowBank</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 text-sm">Welcome, {user.username}</span>
              <Link to="/scoreboard" className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded border border-indigo-500 text-white transition-colors">CTF Scoreboard</Link>
              <button 
                onClick={onLogout}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-sm transition-colors border border-slate-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
           <div className="text-center py-20 text-slate-500">Loading secure banking data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Account Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Balance Card */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total Balance</h2>
                <div className="text-4xl font-bold text-slate-900">
                  {dashboardData?.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-500">
                  <span className="mr-2">Account:</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{dashboardData?.account_number}</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
                  <span className="text-xs text-slate-500">Last 30 days</span>
                </div>
                
                {/* Search Bar */}
                <div className="px-6 py-3 border-b border-slate-100 bg-white">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ul className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 && (
                     <li className="px-6 py-8 text-center text-slate-400">
                        {searchQuery ? 'No transactions match your search.' : 'No transactions found.'}
                     </li>
                  )}
                  {filteredTransactions.map((tx: any) => (
                    <li 
                      key={tx.id} 
                      className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                      onClick={() => handleFetchTransaction(tx.id)}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tx.category === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                              {tx.category}
                           </span>
                           <span className="text-xs text-slate-400 font-mono">#{tx.id}</span>
                        </div>
                        <div className="font-medium text-slate-900">{tx.description}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <span>{tx.date}</span>
                        </div>
                      </div>
                      <span className={`font-semibold ${tx.amount < 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                        {tx.amount < 0 ? '-' : '+'}{Math.abs(tx.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: The "Attacker" Panel */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 text-white rounded-lg shadow-lg p-6 border-2 border-indigo-500/50 relative overflow-hidden">
                 <div className="absolute -right-6 -top-6 text-slate-800 opacity-20 transform rotate-12">
                   <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                 </div>
                 
                 <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                   Developer / API Console
                 </h3>
                 <p className="text-slate-400 text-sm mb-6">
                   Use this tool to manually inspect transaction details via API ID lookup.
                 </p>

                 <form onSubmit={handleManualLookup} className="space-y-4">
                   <div>
                     <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Target Transaction ID</label>
                     <div className="flex gap-2">
                       <input 
                          type="number" 
                          value={selectedTxId}
                          onChange={(e) => setSelectedTxId(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                          placeholder="e.g. 1"
                        />
                       <button 
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium transition-colors"
                       >
                         GET
                       </button>
                     </div>
                   </div>
                 </form>

                 <div className="mt-6 p-3 bg-slate-800/50 rounded border border-slate-700/50 text-xs text-slate-400">
                    <strong>Lab Hint:</strong> 
                    <br/>
                    1. You are logged in as <span className="text-yellow-400 font-mono">{user.username}</span>.
                    <br/>
                    2. Note the IDs of your transactions.
                    <br/>
                    3. Try entering an ID that doesn't belong to you (e.g., <span className="text-red-400 font-mono">1</span> or <span className="text-red-400 font-mono">2</span>).
                    <br/>
                    4. If the API returns data, it is vulnerable to BOLA.
                 </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <TransactionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        isLoading={modalLoading}
        error={modalError}
        transaction={currentTransaction}
      />
    </div>
  );
};

export default Dashboard;