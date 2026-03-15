import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineArrowRight,
  HiOutlineAcademicCap,
  HiOutlineGlobe,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { getParticipants } from '../api';
import logoImg from '../assets/logo.png';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const features = [
  {
    icon: HiOutlineUsers,
    title: 'Participant Management',
    desc: 'Add, edit and manage training participant records with full CRUD operations.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
  },
  {
    icon: HiOutlineDocumentText,
    title: 'Certificate Generation',
    desc: 'Generate professional PDF certificates from EASA-standard templates instantly.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Training Modules',
    desc: 'Track completed training modules for recurrent dispatcher certification.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Instant Processing',
    desc: 'Generate certificates in seconds with automatic data population.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'EASA Compliant',
    desc: 'Certificates follow ICAO Doc 10106, Doc 9868, and EASA Part ORO.GEN.110(c).',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
  },
  {
    icon: HiOutlineGlobe,
    title: 'Multi-Type Training',
    desc: 'Supports Dispatch Graduate, Human Factors, and Recurrent training types.',
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50',
  },
];

export default function LandingPage() {
  const { admin } = useAuth();
  const [certTypeCount, setCertTypeCount] = useState('…');

  useEffect(() => {
    // Fetch distinct training types from DB to show live count
    getParticipants()
      .then(res => {
        const types = new Set((res.data || []).map(p => p.training_type).filter(Boolean));
        setCertTypeCount(types.size > 0 ? String(types.size) : '8');
      })
      .catch(() => setCertTypeCount('8'));
  }, []);

  const stats = [
    { value: certTypeCount, label: 'Certificate Types' },
    { value: '12', label: 'Training Modules' },
    { value: 'Regulation', label: 'Compliance' },
    { value: 'PDF', label: 'Export Format' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="IFOA Logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            {admin ? (
              <Link
                to="/admin"
                className="group relative px-5 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-800/25 hover:shadow-xl hover:shadow-primary-800/30 hover:bg-primary-900 transition-all duration-300 flex items-center gap-2"
              >
                Dashboard
                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold transition-colors" style={{ color: '#0000ff' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="group relative px-5 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-800/25 hover:shadow-xl hover:shadow-primary-800/30 hover:bg-primary-900 transition-all duration-300 flex items-center gap-2"
                >
                  Get Started
                  <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(0,0,255,0.08) 0%, rgba(0,0,200,0.04) 100%)' }} />
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(0,0,255,0.06) 0%, rgba(100,100,255,0.03) 100%)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(0,0,255,0.05) 0%, rgba(50,50,200,0.02) 100%)' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)', border: '1.5px solid #000021', color: '#0000ff', letterSpacing: '0.12em' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#0000ff' }} />
                 <span className='text-black'>Training </span> Management System
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight"
            >
              <span style={{ color: '#000021' }}>Automated Certificate</span>
              <span className="block mt-2" style={{ color: '#0000ff' }}>
                Generation System
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg md:text-xl text-primary-500 max-w-2xl mx-auto leading-relaxed"
            >
              Streamline your flight dispatcher training certification process.
              Generate EASA-compliant certificates for Dispatch Graduate, Human Factors,
              and Recurrent training programs in seconds.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center gap-4">
              {admin ? (
                <Link
                  to="/admin"
                  className="group px-8 py-3.5 bg-primary-800 text-white rounded-2xl text-sm font-semibold shadow-xl shadow-primary-800/25 hover:shadow-2xl hover:shadow-primary-800/30 hover:bg-primary-900 transition-all duration-300 flex items-center gap-2"
                >
                  Open Dashboard
                  <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group px-8 py-3.5 bg-primary-800 text-white rounded-2xl text-sm font-semibold shadow-xl shadow-primary-800/25 hover:shadow-2xl hover:shadow-primary-800/30 hover:bg-primary-900 transition-all duration-300 flex items-center gap-2"
                  >
                    Get Started
                    <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300" style={{ border: '2px solid #0000ff', color: '#0000ff', background: 'transparent' }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20 max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                  className="text-center p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow" style={{ border: '1px solid #c0c0ff' }}
                >
                  <p className="text-2xl font-bold" style={{ color: '#000021' }}>{stat.value}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#000021' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #f0f0ff 0%, #ffffff 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4" style={{ background: '#e8e8ff', color: '#0000ff' }}>
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-800">
              Everything you need
            </h2>
            <p className="mt-4 text-primary-500 max-w-xl mx-auto">
              A complete solution for managing flight dispatcher training records and generating professional certificates.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative p-6 rounded-2xl bg-white border border-primary-100 hover:border-primary-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: '#e8e8ff' }}>
                  <feature.icon className="w-6 h-6" style={{ color: '#0000ff' }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#000021' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#4444aa' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center" style={{ background: 'linear-gradient(135deg, #000021 0%, #000021 40%, #000021 100%)' }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-primary-300 text-lg max-w-xl mx-auto mb-8">
                Access the admin panel to manage participants and generate EASA-compliant training certificates.
              </p>
              <Link
                to={admin ? '/admin' : '/signup'}
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-300" style={{ color: '#0000ff' }}
              >
                {admin ? 'Open Dashboard' : 'Get Started'}
                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="IFOA Logo" className="h-8 w-auto object-contain" />
            <span className="text-sm font-semibold" style={{ color: '#0000ff' }}>IFOA Certificate System</span>
          </div>
          <p className="text-xs text-primary-400">
            &copy; {new Date().getFullYear()} International Flight Operations Academy. All rights reserved. 
          </p>
        </div>
      </footer>
    </div>
  );
}
