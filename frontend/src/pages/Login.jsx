import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const res = await login(form);
      loginAdmin(res.data.token, res.data.admin);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50/30 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center shadow-lg shadow-primary-800/20">
              <span className="text-white font-bold text-lg">IF</span>
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-primary-800 tracking-tight block">IFOA</span>
              <span className="text-xs text-primary-400 font-medium -mt-1 block">Flight Operations Academy</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-xl shadow-primary-800/5 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary-800">Welcome back</h1>
            <p className="text-sm text-primary-400 mt-1">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@ifoa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-800/25 hover:bg-primary-900 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-primary-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-accent-600 font-semibold hover:text-accent-700 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
