import {
  LayoutDashboard, Calendar, FileText, Stethoscope,
  Settings, Activity, LogOut, ChevronRight
} from 'lucide-react';
import './layout.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', badge: null },
  { icon: Calendar, label: 'Appointments', id: 'appointments', badge: '3' },
];

export default function Sidebar({ activePage, onNavigate }: { activePage: string; onNavigate: (page: string) => void }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Activity size={22} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <h2>MediFlow</h2>
          <span>Healthcare Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Main Menu</div>
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
          style={{ background: 'var(--accent)' }}
        >
          Dr
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">Dr. Sarah Khan</div>
          <div className="sidebar-user-role">Admin · General Physician</div>
        </div>
        <LogOut size={15} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
      </div>
    </aside>
  );
}
