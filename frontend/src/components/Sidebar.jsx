import { NavLink, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlusCircle,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

// Admin nav: Dashboard, Airlines (new), Profile
// No Certificates, no Add Record
const adminNavigation = [
  { name: 'Dashboard', href: '/admin',            icon: HiOutlineHome },
  { name: 'Airlines',  href: '/admin/airlines',   icon: HiOutlineOfficeBuilding },
  { name: 'Profile',   href: '/admin/profile',    icon: HiOutlineUserCircle },
];

const airlineNavigation = [
  { name: 'Dashboard',       href: '/admin',                  icon: HiOutlineHome },
  { name: 'My Submissions',  href: '/admin/participants',     icon: HiOutlineUsers },
  { name: 'New Enrollment',  href: '/admin/participants/add', icon: HiOutlinePlusCircle },
  { name: 'Profile',         href: '/admin/profile',          icon: HiOutlineUserCircle },
];

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const { isAdmin, admin } = useAuth();
  const navigation = isAdmin ? adminNavigation : airlineNavigation;

  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-20'
      } sidebar-transition flex flex-col bg-white border-r border-primary-200 shadow-sm relative`}
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-primary-200">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          <img src={logoImg} alt="IFOA Logo" className="h-9 w-auto object-contain flex-shrink-0" />
          {open && (
            <div className="animate-fade-in text-left">
              <p className="text-[10px] text-primary-400 font-medium">
                {isAdmin ? 'Certificate System' : 'Airline Portal'}
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-primary-200 rounded-full flex items-center justify-center shadow-sm hover:bg-primary-50 transition-colors z-10"
      >
        {open ? (
          <HiOutlineChevronLeft className="w-3 h-3 text-primary-500" />
        ) : (
          <HiOutlineChevronRight className="w-3 h-3 text-primary-500" />
        )}
      </button>

      {/* Airline badge */}
      {!isAdmin && open && admin?.airlineName && (
        <div className="mx-3 mt-3 px-3 py-2 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-2 animate-fade-in">
          <HiOutlineOfficeBuilding className="w-4 h-4 text-accent-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-accent-500 font-semibold uppercase tracking-wider">Airline</p>
            <p className="text-xs font-semibold text-accent-800 truncate">{admin.airlineName}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {open && (
          <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider px-3 mb-3">
            {isAdmin ? 'Navigation' : 'My Portal'}
          </p>
        )}
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 shadow-sm font-semibold'
                  : 'text-primary-500 hover:bg-primary-100 hover:text-primary-800'
              }`
            }
            style={({ isActive }) => isActive ? { color: '#0000ff', borderLeft: '3px solid #0000ff' } : {}}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {open && (
              <span className="text-sm font-medium truncate animate-fade-in">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      {open && (
        <div className="p-4 border-t border-primary-200 animate-fade-in">
          <div className="rounded-lg p-3" style={{ background: '#f0f0ff' }}>
            <p className="text-xs font-semibold" style={{ color: '#0000ff' }}>IFOA v1.0</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#6666cc' }}>
              {isAdmin ? 'Administrator' : 'Airline User'}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
