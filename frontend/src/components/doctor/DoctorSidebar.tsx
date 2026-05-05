import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, FileText, Stethoscope,
  Settings, Activity, LogOut, ChevronRight
} from 'lucide-react';
import './layout.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', badge: null },
  { icon: Calendar, label: 'Appointments', id: 'appointments', badge: '3' },
  { icon: Settings, label: 'My Profile', id: 'profile', badge: null },
];

export default function Sidebar({ activePage, onNavigate }: { activePage: string; onNavigate: (page: string) => void }) {
  const [doctorName, setDoctorName] = useState('Doctor');
  const [doctorSpec, setDoctorSpec] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mediflow_doctor_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.name) setDoctorName(u.name);
        if (u?.specialization) setDoctorSpec(u.specialization);
      }
    } catch { }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('mediflow_doctor_token');
      localStorage.removeItem('mediflow_doctor_user');
    } catch { }
    window.location.href = '/demo/doctor/auth';
  };

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
          style={{ background: 'var(--accent)', cursor: 'default' }}
        >
          {doctorName.split(' ').filter((_,i) => i < 2).map(n => n[0]).join('').toUpperCase() || 'Dr'}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{doctorName}</div>
          <div className="sidebar-user-role">{doctorSpec || 'Doctor'}</div>
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
