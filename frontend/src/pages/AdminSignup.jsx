import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { signup } from '../api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function AdminSignup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    try {
      setLoading(true);
      const res = await signup({ name: form.name, email: form.email, password: form.password });
      loginAdmin(res.data.token, { ...res.data.admin, role: 'admin' });
      toast.success('Admin account created!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={logoImg} alt="IFOA Logo" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-primary-100 shadow-xl shadow-primary-800/5 p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #000021 0%, #0000ff 100%)' }}>
              <HiOutlineShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-800">Create Admin Account</h1>
              <p className="text-sm text-primary-400">IFOA administrator registration</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@ifoa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors">
                  {showConfirm ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #000021 0%, #0000ff 100%)' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Admin Account <HiOutlineArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            <p className="text-center text-sm text-primary-400">
              Already have an admin account?{' '}
              <Link to="/admin-login" className="text-accent-600 font-semibold hover:text-accent-700">Sign in</Link>
            </p>
            <p className="text-xs text-center text-primary-400 bg-primary-50 rounded-xl p-3">
              🔒 This page is for authorised IFOA administrators only.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
