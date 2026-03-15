import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineArrowRight,
  HiOutlineAcademicCap,
  HiOutlineGlobe,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const features = [
  { icon: HiOutlineUsers,        title: 'Participant Management',  desc: 'Add, edit and manage training participant records with full CRUD operations.',                          bg: 'bg-blue-50',    iconColor: 'text-blue-600'    },
  { icon: HiOutlineDocumentText, title: 'Certificate Generation',  desc: 'Generate professional PDF certificates from official IFOA-approved templates instantly.',               bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { icon: HiOutlineAcademicCap,  title: 'Training Modules',        desc: 'Track completed training modules for recurrent dispatcher certification.',                             bg: 'bg-violet-50',  iconColor: 'text-violet-600'  },
  { icon: HiOutlineLightningBolt,title: 'Instant Processing',      desc: 'Generate certificates in seconds with automatic data population.',                                     bg: 'bg-amber-50',   iconColor: 'text-amber-600'   },
  { icon: HiOutlineShieldCheck,  title: 'Regulation Compliant',          desc: 'Certificates comply with ICAO Doc 10106, Doc 9868, and international aviation training standards.',   bg: 'bg-rose-50',    iconColor: 'text-rose-600'    },
  { icon: HiOutlineGlobe,        title: 'Multi-Type Training',     desc: 'Supports FDI, FDR, FDA, FTL, NDG, HF, GD and TCD training types.',                                   bg: 'bg-cyan-50',    iconColor: 'text-cyan-600'    },
];

// Aviation carousel — real flight images from Unsplash with quotes
const carouselSlides = [
  {
    img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=85',
    overlay: 'linear-gradient(to right, rgba(0,0,33,0.88) 0%, rgba(0,0,33,0.55) 55%, rgba(0,0,33,0.18) 100%)',
    accent: '#60a5fa',
    tag: 'Flight Dispatch',
    quote: 'The sky is not the limit — it is just the beginning of your journey.',
    author: '— IFOA Training Philosophy',
    title: 'Professional Flight Dispatch Training',
    subtitle: 'Internationally recognised certification programmes equipping dispatchers with world-class operational expertise.',
  },
  {
    img: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?auto=format&fit=crop&w=1600&q=85',
    overlay: 'linear-gradient(to right, rgba(0,0,33,0.90) 0%, rgba(0,0,33,0.58) 55%, rgba(0,0,33,0.2) 100%)',
    accent: '#93c5fd',
    tag: 'Aviation Safety',
    quote: 'In aviation, safety is not a priority — it is a prerequisite. It must come before everything else.',
    author: '— ICAO Global Safety Framework',
    title: 'Safety-First Training Culture',
    subtitle: 'Building safety awareness into every module, every assessment, and every certification issued.',
  },
  {
    img: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=1600&q=85',
    overlay: 'linear-gradient(to right, rgba(0,0,33,0.88) 0%, rgba(0,0,33,0.52) 55%, rgba(0,0,33,0.15) 100%)',
    accent: '#a5b4fc',
    tag: 'Cockpit Excellence',
    quote: 'A great dispatcher is the unseen hand that guides every flight from the ground to the sky.',
    author: '— Flight Operations Standards',
    title: 'Cockpit-Ready Dispatchers',
    subtitle: 'Training that closes the gap between ground operations and inflight decision-making excellence.',
  },
  {
    img: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1600&q=85',
    overlay: 'linear-gradient(to right, rgba(0,0,33,0.90) 0%, rgba(0,0,33,0.55) 55%, rgba(0,0,33,0.18) 100%)',
    accent: '#7dd3fc',
    tag: 'Human Factors',
    quote: 'Most aviation incidents are not mechanical failures — they are failures of human judgement, communication and awareness.',
    author: '— Aviation Safety International',
    title: 'Human Factors & CRM Training',
    subtitle: 'Developing safety-critical human competencies that prevent incidents before they occur.',
  },
  {
    img: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1600&q=85',
    overlay: 'linear-gradient(to right, rgba(0,0,33,0.88) 0%, rgba(0,0,33,0.52) 55%, rgba(0,0,33,0.15) 100%)',
    accent: '#bfdbfe',
    tag: 'Certification',
    quote: 'A certificate is not merely a document. It is evidence that someone is truly ready to protect lives in the sky.',
    author: '— International Aviation Standards',
    title: 'IFOA Certified Excellence',
    subtitle: 'Certificates recognised by regulators and trusted by airlines across the globe.',
  },
  {
    img: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1600&q=85',
    overlay: 'linear-gradient(to right, rgba(0,0,33,0.88) 0%, rgba(0,0,33,0.55) 55%, rgba(0,0,33,0.15) 100%)',
    accent: '#6ee7f7',
    tag: 'Regulations',
    quote: 'Compliance with aviation regulations is not a constraint — it is the very foundation of safe skies.',
    author: '— ICAO Global Standards',
    title: 'Fully Regulation Compliant',
    subtitle: 'Every programme aligns with ICAO Doc 10106, Doc 9868 and international aviation requirements.',
  },
  {
    img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&w=1600&q=85',
    overlay: 'linear-gradient(to right, rgba(0,0,33,0.90) 0%, rgba(0,0,33,0.55) 55%, rgba(0,0,33,0.18) 100%)',
    accent: '#86efac',
    tag: 'Night Operations',
    quote: 'Aviation never sleeps. Around-the-clock operations demand round-the-clock competence.',
    author: '— Global Aviation Standards',
    title: '24/7 Operational Readiness',
    subtitle: 'Training programmes designed for the real world — where the sky is always open and standards never lower.',
  },
];

function AviationCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [imgError, setImgError] = useState({});
  const total = carouselSlides.length;

  const go = useCallback((idx, dir) => { setDirection(dir); setCurrent(idx); }, []);
  const next = useCallback(() => go((current + 1) % total, 1), [current, total, go]);
  const prev = useCallback(() => go((current - 1 + total) % total, -1), [current, total, go]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = carouselSlides[current];

  const slideVariants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.75, ease: [0.32, 0.72, 0, 1] } },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.75, ease: [0.32, 0.72, 0, 1] } }),
  };

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55 }}
          className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase bg-white mb-4"
            style={{ borderColor: '#0000ff40' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#0000ff' }} />
            <span style={{ color: '#000021' }}>Aviation</span>
            <span style={{ color: '#0000ff' }}>Gallery</span>
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#000021' }}>
            Trusted by Aviation Professionals
          </h2>
          <p className="mt-3 text-sm sm:text-base text-primary-500 max-w-xl mx-auto">
            From flight dispatch to human factors — IFOA programmes cover the full spectrum of aviation operations.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl select-none"
          style={{ height: 460 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              className="absolute inset-0"
            >
              {/* Background image */}
              {!imgError[current] ? (
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                  onError={() => setImgError(p => ({ ...p, [current]: true }))}
                />
              ) : (
                /* Fallback gradient if image fails */
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#000021 0%,#001a4d 60%,#0000aa 100%)' }} />
              )}

              {/* Dark gradient overlay — strong on left for text, fades right */}
              <div className="absolute inset-0" style={{ background: slide.overlay }} />

              {/* Extra bottom scrim for readability */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />

              {/* ── Text content ── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 flex flex-col justify-end px-6 sm:px-10 md:px-14 pb-10 sm:pb-14"
              >
                {/* Tag pill */}
                <div className="mb-4 sm:mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest"
                    style={{ background: slide.accent + '28', color: slide.accent, border: `1px solid ${slide.accent}55`, backdropFilter: 'blur(4px)' }}
                  >
                    {slide.tag}
                  </span>
                </div>

                {/* Large open-quote glyph */}
                <div
                  className="text-5xl sm:text-6xl font-serif leading-none mb-1 sm:mb-2 select-none"
                  style={{ color: slide.accent, opacity: 0.75, fontFamily: 'Georgia, serif' }}
                >
                  &ldquo;
                </div>

                {/* Quote */}
                <p
                  className="text-lg sm:text-2xl md:text-3xl font-bold leading-snug mb-3 sm:mb-4 max-w-2xl"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 2px 20px rgba(0,0,0,0.7)',
                    fontFamily: "'Georgia', serif",
                    letterSpacing: '-0.01em',
                  }}
                >
                  {slide.quote}
                </p>

                {/* Author */}
                <p className="text-xs sm:text-sm font-semibold mb-5 sm:mb-6 tracking-wide"
                  style={{ color: slide.accent }}>
                  {slide.author}
                </p>

                {/* Thin accent rule */}
                <div className="w-10 h-px mb-4 sm:mb-5" style={{ background: slide.accent }} />

                {/* Title + subtitle */}
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">{slide.title}</h3>
                <p className="text-xs sm:text-sm max-w-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>{slide.subtitle}</p>
              </motion.div>

              {/* Slide counter */}
              <div
                className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                {current + 1} / {total}
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <motion.div
                  key={`pb-${current}-${paused}`}
                  initial={{ width: '0%' }}
                  animate={{ width: paused ? undefined : '100%' }}
                  transition={{ duration: 5.5, ease: 'linear' }}
                  className="h-full"
                  style={{ background: slide.accent }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev arrow */}
          <button
            onClick={prev}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
          >
            <HiOutlineChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Next arrow */}
          <button
            onClick={next}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
          >
            <HiOutlineChevronRight className="w-5 h-5 text-white" />
          </button>
        </motion.div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? 1 : -1)}
              className="transition-all duration-300 rounded-full"
              style={{ width: i === current ? 28 : 8, height: 8, background: i === current ? '#0000ff' : '#d1d5db' }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  { value: '8',    label: 'Training Types' },
  { value: '12',   label: 'Modules' },
  { value: 'Regulation', label: 'Compliant' },
  { value: 'PDF',  label: 'Export' },
];

export default function LandingPage() {
  const { admin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logoImg} alt="IFOA Logo" className="h-9 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            {admin ? (
              <Link to="/admin" className="group px-4 py-2 bg-primary-800 text-white rounded-xl text-sm font-semibold hover:bg-primary-900 transition-all flex items-center gap-2 shadow-md">
                Dashboard <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="group px-4 py-2 bg-primary-800 text-white rounded-xl text-sm font-semibold hover:bg-primary-900 transition-all flex items-center gap-2 shadow-md">
                  Get Started <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(o => !o)}
          >
            {mobileMenuOpen
              ? <HiOutlineX className="w-6 h-6 text-primary-700" />
              : <HiOutlineMenu className="w-6 h-6 text-primary-700" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            {admin ? (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-800 text-white rounded-xl text-sm font-semibold">
                Dashboard <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 border border-primary-200 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-800 text-white rounded-xl text-sm font-semibold">
                  Get Started <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        )}
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto relative">
          <motion.div variants={stagger} initial="hidden" animate="show" className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase bg-white"
                style={{ borderColor: '#0000ff40' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#0000ff' }} />
                <span style={{ color: '#000021' }}>Training</span>
                <span style={{ color: '#0000ff' }}>Management System</span>
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeUp}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
              <span style={{ color: '#000021' }}>Automated Certificate</span>
              <span className="block mt-1 sm:mt-2" style={{ color: '#0000ff' }}>Generation System</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp}
              className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-primary-500 max-w-2xl mx-auto leading-relaxed px-2">
              Streamline your flight dispatcher training certification process.
              Generate internationally recognised certificates in seconds.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              {admin ? (
                <Link to="/admin"
                  className="group w-full sm:w-auto px-8 py-3.5 bg-primary-800 text-white rounded-2xl text-sm font-semibold shadow-xl hover:bg-primary-900 transition-all duration-300 flex items-center justify-center gap-2">
                  Open Dashboard
                  <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link to="/signup"
                    className="group w-full sm:w-auto px-8 py-3.5 bg-primary-800 text-white rounded-2xl text-sm font-semibold shadow-xl hover:bg-primary-900 transition-all duration-300 flex items-center justify-center gap-2">
                    Get Started
                    <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login"
                    className="group w-full sm:w-auto px-8 py-3.5 border-2 border-primary-200 text-primary-700 rounded-2xl text-sm font-semibold hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 flex items-center justify-center">
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-14 sm:mt-20 max-w-2xl mx-auto px-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                  className="text-center p-3 sm:p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xl sm:text-2xl font-bold text-primary-800">{stat.value}</p>
                  <p className="text-xs font-medium mt-1 text-primary-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 bg-primary-100 text-primary-600">
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800">Everything you need</h2>
            <p className="mt-4 text-primary-500 max-w-xl mx-auto text-sm sm:text-base">
              A complete solution for managing flight dispatcher training records and generating professional certificates.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group p-5 sm:p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 border"
                style={{ borderColor: '#0000ff18' }}>
                {/* Icon box */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: '#0000ff0d', border: '1px solid #0000ff30' }}>
                  <feature.icon className="w-5 h-5" style={{ color: '#0000ff' }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#000021' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed text-primary-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Aviation Carousel ── */}
      <AviationCarousel />

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-primary-800 p-8 sm:p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-primary-300 text-sm sm:text-lg max-w-xl mx-auto mb-6 sm:mb-8">
                Access the admin panel to manage participants and generate Regulation-compliant training certificates.
              </p>
              <Link to={admin ? '/admin' : '/signup'}
                className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-primary-800 rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-300">
                {admin ? 'Open Dashboard' : 'Get Started'}
                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="IFOA Logo" className="h-7 w-auto object-contain" />
            <span className="text-sm font-semibold text-primary-800">IFOA Certificate System</span>
          </div>
          <p className="text-xs text-primary-400">
            &copy; {new Date().getFullYear()} International Flight Operations Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
