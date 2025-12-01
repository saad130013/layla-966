
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Hospital, User, Key, Info, LogIn } from 'lucide-react';
import { USERS } from '../constants';
import { User as UserType } from '../types';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AppContext);
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Trim whitespace to prevent copy-paste errors
    const success = login(username.trim(), password.trim());
    if (!success) {
      setError(t('loginError'));
    }
  };

  const handleAutoFill = (u: UserType) => {
    setUsername(u.username);
    setPassword(u.password);
    setError('');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue to-brand-teal p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 my-8">
        <div className="text-center mb-8">
            <div className="inline-block p-4 bg-brand-blue rounded-full mb-4">
                 <Hospital className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-brand-blue-dark dark:text-white">Inspection System</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('login')}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username-input" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('username')}</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                    type="text"
                    id="username-input"
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    className="w-full ps-10 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-teal focus:border-brand-teal transition text-gray-900 dark:text-white"
                    required
                />
            </div>
          </div>
           <div className="mb-6">
            <label htmlFor="password-input" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t('password')}</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Key className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                    type="password"
                    id="password-input"
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full ps-10 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-teal focus:border-brand-teal transition text-gray-900 dark:text-white"
                    required
                />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <button 
            type="submit" 
            className="w-full bg-brand-teal text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue transition-transform transform hover:scale-105 duration-300 focus:outline-none focus:ring-4 focus:ring-brand-teal focus:ring-opacity-50"
          >
            {t('login')}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t dark:border-gray-700">
          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-4">
            <Info size={16} className="me-2" />
            <span className="text-sm font-semibold">Demo Credentials (Click to Fill)</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg text-xs space-y-2 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {USERS.map(u => (
                <div 
                    key={u.id} 
                    onClick={() => handleAutoFill(u)}
                    className="flex justify-between items-center border border-gray-200 dark:border-gray-700 p-2 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors group"
                    title={`Click to login as ${u.name}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-blue">{u.name}</span>
                    <span className="text-gray-500 italic">{u.role}</span>
                  </div>
                  <div className="text-end">
                     <div className="mb-1"><span className="text-gray-500">User:</span> <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-brand-blue font-mono group-hover:bg-blue-100">{u.username}</code></div>
                     <div><span className="text-gray-500">Pass:</span> <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-brand-blue font-mono group-hover:bg-blue-100">{u.password}</code></div>
                  </div>
                  <LogIn size={16} className="text-gray-300 group-hover:text-brand-teal ms-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
