import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const stats = [
  { value: '3', label: 'Certificate Types' },
  { value: '12', label: 'Training Modules' },
  { value: 'EASA', label: 'Compliance' },
  { value: 'PDF', label: 'Export Format' },
];

export default function LandingPage() {
  const { admin } = useAuth();

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center shadow-lg shadow-primary-800/20">
              <span className="text-white font-bold text-sm">IF</span>
            </div>
            <div>
              <span className="text-base font-bold text-primary-800 tracking-tight">IFOA</span>
              <span className="text-[10px] text-primary-400 block -mt-1 font-medium">Flight Operations Academy</span>
            </div>
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
                  className="px-5 py-2.5 text-primary-700 text-sm font-semibold hover:text-primary-900 transition-colors"
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent-200/30 to-accent-100/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-gradient-to-br from-blue-100/40 to-indigo-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-100/30 to-teal-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 border border-accent-200 text-accent-700 text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse" />
                EASA Certified System
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary-800 leading-[1.1] tracking-tight"
            >
              Automated Certificate
              <span className="block mt-2 bg-gradient-to-r from-accent-600 via-accent-500 to-amber-500 bg-clip-text text-transparent">
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
                    className="px-8 py-3.5 border-2 border-primary-200 text-primary-700 rounded-2xl text-sm font-semibold hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
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
                  className="text-center p-4 rounded-2xl bg-white border border-primary-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-2xl font-bold text-primary-800">{stat.value}</p>
                  <p className="text-xs text-primary-400 font-medium mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-600 text-xs font-semibold tracking-wider uppercase mb-4">
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
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-base font-bold text-primary-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-primary-500 leading-relaxed">{feature.desc}</p>
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-800 via-primary-900 to-primary-800 p-12 md:p-16 text-center"
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
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-800 rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
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
            <div className="w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">IF</span>
            </div>
            <span className="text-sm font-semibold text-primary-600">IFOA Certificate System</span>
          </div>
          <p className="text-xs text-primary-400">
            &copy; {new Date().getFullYear()} International Flight Operations Academy. All rights reserved. 
           <p> Made By Arjun</p>
          </p>
        </div>
      </footer>
    </div>
  );
}
