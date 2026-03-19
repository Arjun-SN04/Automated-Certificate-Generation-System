import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineOfficeBuilding,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePhotograph,
  HiOutlineX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { signup, airlineSignup, uploadAirlineLogo } from '../api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('role') === 'airline' ? 'airline' : 'admin';
  const [tab, setTab]   = useState(defaultTab);
  const [form, setForm] = useState({
    name: '', airlineName: '', email: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [logoFile, setLogoFile]         = useState(null);   // File object
  const [logoPreview, setLogoPreview]   = useState(null);   // blob URL for preview
  const [uploading, setUploading]       = useState(false);  // logo upload in progress
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setForm({ name: '', airlineName: '', email: '', password: '', confirmPassword: '' });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields'); return;
    }
    if (tab === 'airline' && !form.airlineName) {
      toast.error('Please enter your airline name'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }

    try {
      setLoading(true);

      if (tab === 'admin') {
        const res = await signup({ name: form.name, email: form.email, password: form.password });
        loginAdmin(res.data.token, { ...res.data.admin, role: 'admin' });
        toast.success('Admin account created!');
        navigate('/admin');
      } else {
        // Step 1: upload logo to Cloudinary if provided
        let logo_url = null;
        if (logoFile) {
          setUploading(true);
          toast.loading('Uploading logo…', { id: 'logo-upload' });
          try {
            const uploadRes = await uploadAirlineLogo(logoFile);
            logo_url = uploadRes.data.logo_url;
            toast.success('Logo uploaded!', { id: 'logo-upload' });
          } catch {
            toast.error('Logo upload failed — continuing without logo', { id: 'logo-upload' });
          }
          setUploading(false);
        }

        // Step 2: create airline account with logo_url
        const res = await airlineSignup({
          name:        form.name,
          airlineName: form.airlineName,
          email:       form.email,
          password:    form.password,
          logo_url,
        });
        loginAdmin(res.data.token, { ...res.data.admin, role: 'airline' });
        toast.success(`Airline account created for ${form.airlineName}!`);
        navigate('/airline');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
      setUploading(false);
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
        {/* IFOA Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={logoImg} alt="IFOA Logo" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-xl shadow-primary-800/5 p-5 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary-800">Create account</h1>
            <p className="text-sm text-primary-400 mt-1">Register for access to the IFOA portal</p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-primary-50 rounded-xl p-1 mb-6">
            {[
              { val: 'airline', label: '✈ Airline Account' },
              { val: 'admin',   label: '🛡 Admin Account'  },
            ].map(t => (
              <button key={t.val} type="button" onClick={() => handleTabSwitch(t.val)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  tab === t.val ? 'bg-white text-primary-800 shadow-sm' : 'text-primary-400 hover:text-primary-600'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Contact / Full Name */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">
                {tab === 'airline' ? 'Contact Name' : 'Full Name'}
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={tab === 'airline' ? 'Your full name' : 'John Doe'}
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" />
              </div>
            </div>

            {/* Airline Name */}
            {tab === 'airline' && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">Airline Name</label>
                <div className="relative">
                  <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input type="text" value={form.airlineName}
                    onChange={e => setForm({ ...form, airlineName: e.target.value })}
                    placeholder="e.g. Emirates Airlines"
                    className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" />
                </div>
              </div>
            )}

            {/* Company Logo — airline only */}
            {tab === 'airline' && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">
                  Company Logo <span className="text-primary-400 font-normal">(optional)</span>
                </label>
                {logoPreview ? (
                  /* Preview state */
                  <div className="flex items-center gap-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
                    <img src={logoPreview} alt="Logo preview"
                      className="w-14 h-14 object-contain rounded-lg border border-primary-200 bg-white" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary-800 truncate">{logoFile?.name}</p>
                      <p className="text-xs text-primary-400 mt-0.5">
                        {(logoFile?.size / 1024).toFixed(0)} KB — will upload on registration
                      </p>
                    </div>
                    <button type="button" onClick={removeLogo}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-primary-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Upload trigger */
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-2 py-5 border-2 border-dashed border-primary-200 rounded-xl hover:border-accent-400 hover:bg-accent-50/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 group-hover:bg-accent-100 flex items-center justify-center transition-colors">
                      <HiOutlinePhotograph className="w-5 h-5 text-primary-400 group-hover:text-accent-600 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary-600 group-hover:text-accent-700 transition-colors">
                        Click to upload logo
                      </p>
                      <p className="text-xs text-primary-400 mt-0.5">PNG, JPG, SVG · max 2 MB</p>
                    </div>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handleLogoChange} className="hidden" />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder={tab === 'airline' ? 'ops@yourairline.com' : 'admin@ifoa.com'}
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" />
              </div>
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
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

            {/* Submit */}
            <button type="submit" disabled={loading || uploading}
              className="w-full py-3 bg-accent-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-600/25 hover:bg-accent-700 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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
            <Link to="/login" className="text-accent-600 font-semibold hover:text-accent-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
