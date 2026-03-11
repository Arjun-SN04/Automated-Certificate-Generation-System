import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineUserCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlusCircle,
} from 'react-icons/hi';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HiOutlineHome },
  { name: 'Participants', href: '/admin/participants', icon: HiOutlineUsers },
  { name: 'Add Record', href: '/admin/participants/add', icon: HiOutlinePlusCircle },
  { name: 'Certificates', href: '/admin/certificates', icon: HiOutlineDocumentText },
  { name: 'Profile', href: '/admin/profile', icon: HiOutlineUserCircle },
];

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-20'
      } sidebar-transition flex flex-col bg-white border-r border-primary-200 shadow-sm relative`}
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-primary-200">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary-800 flex items-center justify-center flex-shrink-0 hover:bg-primary-900 transition-colors">
            <span className="text-white font-bold text-sm">IF</span>
          </div>
          {open && (
            <div className="animate-fade-in text-left">
              <h1 className="text-sm font-bold text-primary-800 leading-tight">IFOA</h1>
              <p className="text-[10px] text-primary-400 font-medium">Certificate System</p>
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

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {open && (
          <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider px-3 mb-3">
            Navigation
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
                  ? 'bg-primary-800 text-white shadow-md'
                  : 'text-primary-500 hover:bg-primary-100 hover:text-primary-800'
              }`
            }
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
          <div className="bg-primary-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-primary-700">IFOA v1.0</p>
            <p className="text-[10px] text-primary-400 mt-0.5">Certificate Management</p>
          </div>
        </div>
      )}
    </aside>
  );
}
