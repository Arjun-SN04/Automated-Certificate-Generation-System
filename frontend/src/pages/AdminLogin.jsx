import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await login({ email: form.email, password: form.password });
      loginAdmin(res.data.token, { ...res.data.admin, role: 'admin' });
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={logoImg} alt="IFOA Logo" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-xl shadow-primary-800/5 p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #000021 0%, #0000ff 100%)' }}>
              <HiOutlineShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-800">Admin Access</h1>
              <p className="text-sm text-primary-400">IFOA administrator sign in</p>
            </div>
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
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-10 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #000021 0%, #0000ff 100%)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In as Admin <HiOutlineArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs text-center text-primary-400 bg-primary-50 rounded-xl p-3">
              🔒 This page is for authorised IFOA administrators only.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
