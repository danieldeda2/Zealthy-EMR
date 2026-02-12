import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, Activity, Menu, X } from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Mobile Top Bar */}
      <header className="admin-mobile-header">
        <div className="admin-mobile-header-inner">
          <div className="admin-mobile-logo">
            <div className="admin-logo-icon">
              <Activity size={16} color="#fff" />
            </div>
            <div>
              <h1 className="admin-logo-text">Zealthy</h1>
              <p className="admin-logo-sub">EMR Admin</p>
            </div>
          </div>
          <button className="admin-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="admin-mobile-nav animate-fade-in">
            <NavLink to="/admin" end
              className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              <Users size={18} /> Patients
            </NavLink>
          </nav>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon">
            <Activity size={18} color="#fff" />
          </div>
          <div>
            <h1 className="admin-logo-text">Zealthy</h1>
            <p className="admin-logo-sub">EMR Admin</p>
          </div>
        </div>
        <nav className="admin-nav">
          <p className="admin-nav-label">Management</p>
          <NavLink to="/admin" end
            className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`}>
            <Users size={18} /> Patients
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer"><p>Mini-EMR v1.0</p></div>
      </aside>

      <main className="admin-main">
        <div className="admin-content"><Outlet /></div>
      </main>
    </div>
  );
}
