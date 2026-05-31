import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      // save token and user to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-coffee-50 flex items-center justify-center px-4">
      <div className="bg-white border border-coffee-200 rounded-xl p-8 w-full max-w-sm">

        <div className="text-center mb-6">
          <span className="text-4xl">☕</span>
          <h1 className="font-serif text-2xl text-coffee-700 mt-2">Welcome back</h1>
          <p className="font-sans text-coffee-400 text-xs mt-1">Your shelf is waiting</p>
        </div>

        {error && (
          <p className="bg-red-50 border border-red-200 text-red-600 font-sans text-xs px-3 py-2 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs text-coffee-500 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border border-coffee-200 rounded px-3 py-2 font-sans text-sm text-coffee-700 bg-coffee-50 focus:outline-none focus:border-coffee-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-sans text-xs text-coffee-500">Password</label>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full border border-coffee-200 rounded px-3 py-2 font-sans text-sm text-coffee-700 bg-coffee-50 focus:outline-none focus:border-coffee-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coffee-700 text-coffee-100 font-sans text-sm py-2.5 rounded hover:bg-coffee-800 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="font-sans text-xs text-coffee-400 text-center mt-5">
          New here?{' '}
          <Link to="/signup" className="text-coffee-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}