import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';
import {
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineUserCircle,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineUserAdd,
  HiOutlineLogout,
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { getParticipants } from '../api';
import { useAuth } from '../context/AuthContext';

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Full detail modal shown when a search result is clicked ─────────────────────────
function ParticipantDetailModal({ record, onClose }) {
  if (!record) return null;
  const ini = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const rows = [
    { label: 'Full Name',      value: record.participant_name },
    { label: 'Airline',        value: record.company },
    { label: 'Department',     value: record.department },
    { label: 'Training Type',  value: record.training_type },
    { label: 'Start Date',     value: fmtDate(record.training_date) },
    { label: 'End Date',       value: record.end_date ? fmtDate(record.end_date) : '—' },
    { label: 'Location',       value: record.online_synchronous ? 'Online Synchronous' : (record.location || '—') },
    { label: 'NDG Subtype',    value: record.training_type === 'NDG' ? (record.ndg_subtype === 'R' ? 'Recurrent' : 'Initial') : null },
    { label: 'NDG Score',      value: record.training_type === 'NDG' && record.ndg_score != null ? `${record.ndg_score}%` : null },
    { label: 'Modules',        value: record.modules || null },
    { label: 'Certificate No', value: record.cert_sequence ? `${record.training_type}-${String(record.cert_sequence).padStart(5,'0')}` : 'Not yet generated' },
    { label: 'Status',         value: record.locked ? 'Locked' : 'Draft' },
  ].filter(r => r.value !== null && r.value !== undefined);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center gap-4 px-5 py-4 border-b border-primary-100">
            <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-600">{ini(record.participant_name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-primary-800 truncate">{record.participant_name}</h2>
              <p className="text-xs text-primary-400 mt-0.5">{record.company} · {record.department}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-400 flex-shrink-0">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          {/* Details */}
          <div className="px-5 py-4 space-y-0 max-h-[55vh] overflow-y-auto">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5 border-b border-primary-50 last:border-0">
                <span className="text-xs font-semibold text-primary-400 uppercase tracking-wide flex-shrink-0 w-28">{label}</span>
                <span className="text-sm text-primary-800 text-right break-words max-w-[200px]">{value}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-primary-50/50 border-t border-primary-100 flex justify-end">
            <button onClick={onClose} className="btn-primary text-sm">Close</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


const defaultNotifications = [
  { id: 1, icon: HiOutlineCheckCircle, color: 'text-emerald-500', title: 'System Ready', desc: 'Certificate system is online and operational.', time: 'Just now', read: false },
  { id: 2, icon: HiOutlineDocumentText, color: 'text-blue-500', title: 'Templates Loaded', desc: 'All 3 certificate templates loaded successfully.', time: '5m ago', read: false },
  { id: 3, icon: HiOutlineUserAdd, color: 'text-violet-500', title: 'New Participant', desc: 'A new participant record was recently added.', time: '1h ago', read: true },
];

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const { admin, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null); // clicked participant detail
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const { isAdmin } = useAuth();
  const initials = admin?.name
    ? admin.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismissNotif = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search dropdown on navigation
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await getParticipants({ search: query.trim() });
        setSearchResults(res.data.slice(0, 8));
        setSearchOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/participants?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleResultClick = (record) => {
    setDetailRecord(record);   // open detail modal — no navigation
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className="h-16 bg-white border-b border-primary-200 flex items-center justify-between px-4 sm:px-6 shadow-sm flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only (desktop uses sidebar's own collapse arrow) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-primary-100 transition-colors flex-shrink-0"
        >
          <HiOutlineMenu className="w-5 h-5 text-primary-600" />
        </button>
        {/* Search — visible on all pages for both admin and airline */}
        <div className="relative hidden sm:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Search participants..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              className="pl-10 pr-4 py-2 w-44 sm:w-56 md:w-72 bg-primary-50 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchOpen(false); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-primary-200 transition-colors"
              >
                <HiOutlineX className="w-3.5 h-3.5 text-primary-400" />
              </button>
            )}
          </form>

          {/* Search results dropdown */}
          {searchOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-96 bg-white rounded-xl border border-primary-200 shadow-xl z-50 overflow-hidden animate-fade-in">
              {searching ? (
                <div className="p-4 flex items-center gap-2 text-primary-400">
                  <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                  <span className="text-sm">Searching...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-sm text-primary-400 text-center">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 bg-primary-50 border-b border-primary-100">
                    <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {searchResults.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => handleResultClick(record)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left border-b border-primary-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-semibold text-primary-600">
                          {record.participant_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-800 truncate">{record.participant_name}</p>
                        <p className="text-[11px] text-primary-400">{record.company} &middot; {record.training_type}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        record.training_type === 'Recurrent'
                          ? 'bg-violet-100 text-violet-700'
                          : record.training_type === 'Human Factors'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {record.training_type}
                      </span>
                    </button>
                  ))}
                  <div className="px-4 py-2 bg-primary-50 text-[10px] text-primary-400 text-center">
                    Click a result to view full details
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Home link — hidden on xs */}
        <button
          onClick={() => navigate('/')}
          className="hidden sm:flex p-2 rounded-lg hover:bg-primary-100 transition-colors"
          title="Back to Home"
        >
          <HiOutlineHome className="w-5 h-5 text-primary-500" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative p-2 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <HiOutlineBell className="w-5 h-5 text-primary-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{unreadCount}</span>
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl border border-primary-200 shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100">
                <p className="text-sm font-semibold text-primary-800">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] font-medium text-accent-600 hover:text-accent-700 transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-primary-400">No notifications</div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-primary-50 last:border-0 transition-colors ${
                        notif.read ? 'bg-white' : 'bg-accent-50/40'
                      }`}
                    >
                      <notif.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${notif.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-800">{notif.title}</p>
                        <p className="text-[11px] text-primary-400 mt-0.5">{notif.desc}</p>
                        <p className="text-[10px] text-primary-300 mt-1">{notif.time}</p>
                      </div>
                      <button
                        onClick={() => dismissNotif(notif.id)}
                        className="p-0.5 rounded hover:bg-primary-100 transition-colors flex-shrink-0"
                        title="Dismiss"
                      >
                        <HiOutlineX className="w-3.5 h-3.5 text-primary-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-primary-100 transition-colors"
          >
            {/* Avatar: logo (airline) or initials (admin/fallback) */}
            {!isAdmin && admin?.logo_url ? (
              <div className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                <img src={admin.logo_url} alt={admin.airlineName}
                  className="w-full h-full object-contain p-0.5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #000021 0%, #0000ff 100%)' }}>
                <span className="text-white text-xs font-bold">
                  {!isAdmin && admin?.airlineName
                    ? admin.airlineName.charAt(0).toUpperCase()
                    : initials
                  }
                </span>
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-primary-800">
                {isAdmin ? (admin?.name || 'Admin') : (admin?.airlineName || admin?.name || 'Airline')}
              </p>
              <p className="text-[10px] text-primary-400">
                {isAdmin ? 'Administrator' : 'Airline User'}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-primary-200 shadow-lg py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-primary-100">
                <p className="text-sm font-semibold text-primary-800">{admin?.name || 'Admin'}</p>
                {!isAdmin && admin?.airlineName && (
                  <p className="text-[10px] font-semibold text-accent-600 mt-0.5">{admin.airlineName}</p>
                )}
                <p className="text-xs text-primary-400">{admin?.email || ''}</p>
              </div>
              <button
                onClick={() => { setProfileOpen(false); navigate('/admin/profile'); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <HiOutlineUserCircle className="w-4 h-4" />
                My Profile
              </button>
              <button
                onClick={() => { setProfileOpen(false); navigate('/admin'); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <HiOutlineCog className="w-4 h-4" />
                Settings
              </button>
              <div className="border-t border-primary-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Participant detail modal — opens when a search result is clicked */}
      <ParticipantDetailModal record={detailRecord} onClose={() => setDetailRecord(null)} />
    </header>
  );
}
