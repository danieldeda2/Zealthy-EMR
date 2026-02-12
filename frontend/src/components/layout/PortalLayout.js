import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, CalendarDays, Pill, LayoutDashboard, LogOut } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import './PortalLayout.css';

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/appointments', icon: CalendarDays, label: 'Appointments' },
    { to: '/prescriptions', icon: Pill, label: 'Medications' },
  ];

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-logo">
            <div className="portal-logo-icon">
              <Activity size={16} color="#fff" />
            </div>
            <span className="portal-logo-text">Zealthy</span>
          </div>

          <nav className="portal-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `portal-nav-link ${isActive ? 'portal-nav-link-active' : ''}`
                }
              >
                <item.icon size={16} />
                <span className="portal-nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="portal-user">
            <div className="portal-user-info">
              <p className="portal-user-name">{user?.name}</p>
              <p className="portal-user-email">{user?.email}</p>
            </div>
            <div className="portal-avatar">{getInitials(user?.name)}</div>
            <button onClick={handleLogout} className="portal-logout-btn" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  );
}
