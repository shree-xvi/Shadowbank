import React from 'react';
import { Transaction } from '../types';

interface Props {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

const TransactionModal: React.FC<Props> = ({ transaction, isOpen, onClose, isLoading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-semibold text-lg">Transaction Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!isLoading && !error && transaction && (
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 text-sm uppercase tracking-wide">Transaction ID</span>
                <span className="font-mono text-slate-800 font-bold">#{transaction.id}</span>
              </div>
              
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 text-sm uppercase tracking-wide">Date</span>
                <span className="text-slate-800">{transaction.date}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 text-sm uppercase tracking-wide">Category</span>
                <span className={`px-2 py-0.5 text-xs rounded font-medium flex items-center ${transaction.category === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                  {transaction.category === 'Credit' ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                     </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                  {transaction.category}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 text-sm uppercase tracking-wide">Recipient/Source</span>
                <span className="font-mono text-slate-700">{transaction.recipient_account}</span>
              </div>

              <div className="mt-4 bg-slate-50 p-4 rounded border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-slate-900 font-medium">{transaction.description}</p>
              </div>

              <div className="mt-2 text-right">
                <span className={`text-2xl font-bold ${transaction.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;