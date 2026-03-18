import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineOfficeBuilding,
  HiOutlineEye,
  HiOutlineEyeOff,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { login, airlineLogin } from '../api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function Login() {
  const [tab, setTab] = useState('airline'); // 'airline' | 'admin'
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setForm({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      if (tab === 'admin') {
        const res = await login({ email: form.email, password: form.password });
        loginAdmin(res.data.token, { ...res.data.admin, role: 'admin' });
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        const res = await airlineLogin({ email: form.email, password: form.password });
        loginAdmin(res.data.token, { ...res.data.admin, role: 'airline' });
        toast.success(`Welcome, ${res.data.admin.airlineName}!`);
        navigate('/airline');
      }
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary-800">Welcome back</h1>
            <p className="text-sm text-primary-400 mt-1">Sign in to your account</p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-primary-50 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => handleTabSwitch('airline')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === 'airline'
                  ? 'bg-white text-primary-800 shadow-sm'
                  : 'text-primary-400 hover:text-primary-600'
              }`}
            >
              ✈ Airline Portal
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('admin')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === 'admin'
                  ? 'bg-white text-primary-800 shadow-sm'
                  : 'text-primary-400 hover:text-primary-600'
              }`}
            >
              🛡 Admin Access
            </button>
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
                  placeholder={tab === 'admin' ? 'admin@ifoa.com' : 'your@airline.com'}
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
                  placeholder="Enter your password"
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
              className="w-full py-3 bg-accent-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-600/25 hover:bg-accent-700 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {tab === 'admin' ? 'Sign In as Admin' : 'Sign In as Airline'}
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {tab === 'admin' ? (
              <p className="text-center text-sm text-primary-400">
                Don&apos;t have an admin account?{' '}
                <Link to="/signup" className="text-accent-600 font-semibold hover:text-accent-700 transition-colors">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-center text-sm text-primary-400">
                New airline?{' '}
                <Link to="/signup?role=airline" className="text-accent-600 font-semibold hover:text-accent-700 transition-colors">
                  Register your airline
                </Link>
              </p>
            )}

            {tab === 'airline' && (
              <p className="text-xs text-center text-primary-400 bg-primary-50 rounded-xl p-3">
                ℹ Once submitted, enrollment records are locked. Only admins can make changes or issue certificates.
              </p>
            )}

            {tab === 'admin' && (
              <p className="text-xs text-center text-primary-400 bg-accent-50 border border-accent-100 rounded-xl p-3">
                🔑 Demo: admin@ifoa.com / admin123
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
