import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, FileText, Stethoscope,
  Settings, Activity, LogOut, ShieldCheck, BedDouble
} from 'lucide-react';
import '../doctor/layout.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', id: 'dashboard', badge: null },
  { icon: Stethoscope, label: 'Doctors', id: 'doctors', badge: null },
  { icon: BedDouble, label: 'Beds', id: 'beds', badge: null },
  { icon: Calendar, label: 'Master Schedule', id: 'appointments', badge: null },
];

export default function AdminSidebar({ activePage, onNavigate }: { activePage: string; onNavigate: (page: string) => void }) {
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mediflow_admin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.name) setAdminName(u.name);
      }
    } catch { }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('mediflow_admin_token');
      localStorage.removeItem('mediflow_admin_user');
    } catch { }
    window.location.href = '/demo/admin/auth';
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'var(--accent)' }}>
          <ShieldCheck size={22} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <h2>MediFlow</h2>
          <span>Admin Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Hospital Operations</div>
        {NAV_ITEMS.map(({ icon: Icon, label, id, badge }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`nav-link ${activePage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} className="nav-icon" />
            <span style={{ flex: 1 }}>{label}</span>
            {badge && <span className="nav-link-badge">{badge}</span>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <div
          className="avatar avatar-md"
          style={{ background: 'var(--accent)', cursor: 'default' }}
        >
          {adminName.split(' ').filter((_,i) => i < 2).map(n => n[0]).join('').toUpperCase() || 'AD'}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{adminName}</div>
          <div className="sidebar-user-role">Administrator</div>
        </div>
        <button
          onClick={handleLogout}
          title="Log Out"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <LogOut size={15} style={{ color: 'rgba(255,255,255,0.55)', flexShrink: 0 }} />
        </button>
      </div>
    </aside>
  );
}
