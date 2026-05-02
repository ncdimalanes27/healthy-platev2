import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  LayoutDashboard, User, Activity, UtensilsCrossed,
  Heart, Settings, LogOut, Leaf, Stethoscope,
  MessageSquare, ClipboardList, BarChart2, Menu, X,
  Users, Shield,
} from 'lucide-react';

const patientNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/health-data', icon: Activity, label: 'Log Food' },
  { to: '/meal-plans', icon: UtensilsCrossed, label: 'Meal Plans' },
  { to: '/monitoring', icon: Heart, label: 'Monitoring' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const dieticianNav = [
  { to: '/dietician', icon: Stethoscope, label: 'Patients' },
  { to: '/dietician/notes', icon: MessageSquare, label: 'Notes' },
  { to: '/dietician/assign', icon: ClipboardList, label: 'Assign Plan' },
  { to: '/dietician/progress', icon: BarChart2, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const nutritionistNav = [
  { to: '/nutritionist', icon: UtensilsCrossed, label: 'Dashboard' },
  { to: '/nutritionist/patients', icon: Users, label: 'Patients' },
  { to: '/nutritionist/notes', icon: MessageSquare, label: 'Notes' },
  { to: '/nutritionist/assign', icon: ClipboardList, label: 'Assign Plan' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminNav = [
  { to: '/admin', icon: Shield, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'dietician': return 'Dietician';
    case 'nutritionist': return 'Nutritionist';
    case 'admin': return 'Administrator';
    default: return 'Patient';
  }
};

const getNav = (role?: string) => {
  switch (role) {
    case 'dietician': return dieticianNav;
    case 'nutritionist': return nutritionistNav;
    case 'admin': return adminNav;
    default: return patientNav;
  }
};

export default function Layout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const nav = getNav(currentUser?.role);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const closeMobile = () => setMobileOpen(false);

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            HealthyPlate
          </span>
        </div>
        {/* Close button — mobile only */}
        <button onClick={closeMobile} className="md:hidden text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User pill */}
      <div className="mx-4 mt-4 mb-2 bg-green-50 rounded-xl px-4 py-3">
        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">
          {getRoleLabel(currentUser?.role)}
        </p>
        <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.name}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dietician' || to === '/nutritionist' || to === '/admin'}
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col shadow-sm shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              HealthyPlate
            </span>
          </div>
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold text-sm">
            {currentUser?.name.charAt(0)}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* ── Mobile bottom nav ── */}
        <nav className="md:hidden flex items-center justify-around bg-white border-t border-gray-100 px-2 py-2 shrink-0">
          {nav.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dietician'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

      </div>
    </div>
  );
}
