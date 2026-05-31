import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginPage = ({ onClose }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'signup', 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(formData.email, formData.password);
    setLoading(false);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  const validateSignupPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validateSignupPassword(formData.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await register(formData.username, formData.email, formData.password);
    setLoading(false);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Password reset functionality not implemented yet.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-3xl p-10 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Xplora</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Sign in to explore and share</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-3xl font-light transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-8 border-b-2 border-slate-200 bg-slate-100/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-3 px-4 text-sm font-bold transition-all duration-200 rounded-lg ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 pb-3 px-4 text-sm font-bold transition-all duration-200 rounded-lg ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setActiveTab('forgot')}
            className={`flex-1 pb-3 px-4 text-sm font-bold transition-all duration-200 rounded-lg ${
              activeTab === 'forgot'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Forgot
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">
                ⚠️ {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:shadow-lg shadow-md transition-all font-bold text-base disabled:opacity-50 disabled:cursor-wait transform hover:scale-105"
            >
              {loading ? '🔄 Logging in...' : '🚀 Login'}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">
                ⚠️ {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm"
                placeholder="Choose your username"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs text-slate-600 font-medium">
                ✓ At least 8 characters • ✓ Uppercase & lowercase • ✓ One number
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl hover:shadow-lg shadow-md transition-all font-bold text-base disabled:opacity-50 disabled:cursor-wait transform hover:scale-105"
            >
              {loading ? '🔄 Creating account...' : '✨ Sign Up'}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Enter your email address and we'll send you a password reset link.
            </p>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl hover:shadow-lg shadow-md transition-all font-bold text-base transform hover:scale-105"
            >
              📧 Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;