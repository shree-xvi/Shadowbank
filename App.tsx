import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Scoreboard from './components/Scoreboard';
import Challenges from './components/Challenges';
import { User, AppMode } from './types';

const MainApp: React.FC<{
  user: User | null;
  token: string | null;
  mode: AppMode;
  onLogin: (u: User, t: string) => void;
  onLogout: () => void;
  setMode: (m: AppMode) => void;
}> = ({ user, token, mode, onLogin, onLogout, setMode }) => (
  <div className="antialiased text-slate-900">
    {!user ? (
      <Login onLogin={onLogin} mode={mode} setMode={setMode} />
    ) : (
      <Dashboard user={user} token={token!} mode={mode} onLogout={onLogout} />
    )}
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('simulation');

  const handleLogin = (u: User, t: string) => {
    setUser(u);
    setToken(t);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scoreboard" element={<Scoreboard mode={mode} token={token || ''} />} />
        <Route path="/challenges" element={<Challenges mode={mode} token={token || ''} />} />
        <Route
          path="*"
          element={
            <MainApp
              user={user}
              token={token}
              mode={mode}
              onLogin={handleLogin}
              onLogout={handleLogout}
              setMode={setMode}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
