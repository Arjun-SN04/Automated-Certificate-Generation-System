import { NavLink, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlinePlusCircle,
  HiOutlineOfficeBuilding,
  HiOutlineX,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin',          icon: HiOutlineHome },
  { name: 'Airlines',  href: '/admin/airlines', icon: HiOutlineOfficeBuilding },
  { name: 'Profile',   href: '/admin/profile',  icon: HiOutlineUserCircle },
];

const airlineNavigation = [
  { name: 'Dashboard',      href: '/admin',                  icon: HiOutlineHome,         exact: true  },
  { name: 'My Submissions', href: '/admin/participants',     icon: HiOutlineUsers,        exact: true  },
  { name: 'New Enrollment', href: '/admin/participants/add', icon: HiOutlinePlusCircle,   exact: true  },
  { name: 'Profile',        href: '/admin/profile',          icon: HiOutlineUserCircle,   exact: false },
];

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const { isAdmin, admin } = useAuth();
  const navigation = isAdmin ? adminNavigation : airlineNavigation;

  return (
    <aside
      className={[
        // Mobile: fixed overlay drawer that slides in/out
        // Desktop (lg+): always static and always visible at full w-64
        'fixed inset-y-0 left-0 z-30',
        'lg:static lg:z-auto lg:translate-x-0 lg:w-64',
        'w-64 flex flex-col bg-white border-r border-gray-200 shadow-sm',
        'sidebar-transition',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <img src={logoImg} alt="IFOA" className="h-8 w-auto object-contain flex-shrink-0" />
          <span className="text-[11px] font-medium text-primary-400 truncate">
            {isAdmin ? 'Certificate System' : 'Airline Portal'}
          </span>
        </button>

        {/* Mobile-only close button */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-primary-400 transition-colors flex-shrink-0"
        >
          <HiOutlineX className="w-5 h-5" />
        </button>
      </div>

      {/* ── Airline badge (airline users only) ── */}
      {!isAdmin && admin?.airlineName && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg flex items-center gap-2 border" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <HiOutlineOfficeBuilding className="w-4 h-4 flex-shrink-0" style={{ color: '#0000ff' }} />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#3b4f9e' }}>Airline</p>
            <p className="text-xs font-semibold truncate" style={{ color: '#000021' }}>{admin.airlineName}</p>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider px-2 py-2">
          {isAdmin ? 'Navigation' : 'My Portal'}
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.exact !== false}
            onClick={() => setOpen(false)} // closes drawer on mobile tap
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-blue-50 font-semibold border-l-4 border-[#0000ff]'
                  : 'text-primary-500 hover:bg-gray-100 hover:text-primary-800',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: isActive ? '#0000ff' : undefined }}
                />
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: isActive ? '#0000ff' : undefined }}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <div className="rounded-lg p-3 bg-gray-50 border border-gray-100">
          <p className="text-xs font-semibold text-primary-700">IFOA v1.0</p>
          <p className="text-[10px] text-primary-400 mt-0.5">
            {isAdmin ? 'Administrator' : 'Airline User'}
          </p>
        </div>
      </div>
    </aside>
  );
}
