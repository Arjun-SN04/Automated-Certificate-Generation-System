import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { signup, airlineSignup } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('role') === 'airline' ? 'airline' : 'admin';
  const [tab, setTab] = useState(defaultTab);
  const [form, setForm] = useState({
    name: '',
    airlineName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setForm({ name: '', airlineName: '', email: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (tab === 'airline' && !form.airlineName) {
      toast.error('Please enter your airline name');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      if (tab === 'admin') {
        const res = await signup({ name: form.name, email: form.email, password: form.password });
        loginAdmin(res.data.token, { ...res.data.admin, role: 'admin' });
        toast.success('Admin account created!');
        navigate('/admin');
      } else {
        const res = await airlineSignup({
          name: form.name,
          airlineName: form.airlineName,
          email: form.email,
          password: form.password,
        });
        loginAdmin(res.data.token, { ...res.data.admin, role: 'airline' });
        toast.success(`Airline account created for ${form.airlineName}!`);
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50/30 flex items-center justify-center px-4 py-8">
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
            <h1 className="text-2xl font-bold text-primary-800">Create account</h1>
            <p className="text-sm text-primary-400 mt-1">Register for access to the IFOA portal</p>
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
              ✈ Airline Account
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
              🛡 Admin Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                {tab === 'airline' ? 'Contact Name' : 'Full Name'}
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={tab === 'airline' ? 'Your full name' : 'John Doe'}
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Airline Name — only for airline tab */}
            {tab === 'airline' && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">Airline Name</label>
                <div className="relative">
                  <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    value={form.airlineName}
                    onChange={(e) => setForm({ ...form, airlineName: e.target.value })}
                    placeholder="e.g. Emirates Airlines"
                    className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={tab === 'airline' ? 'ops@yourairline.com' : 'admin@ifoa.com'}
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat your password"
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
                  {tab === 'airline' ? 'Register Airline Account' : 'Create Admin Account'}
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-primary-400">
            Already have an account?{' '}
            <Link
              to={`/login${tab === 'airline' ? '' : ''}`}
              className="text-accent-600 font-semibold hover:text-accent-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
