import { Search, Bell, Calendar } from 'lucide-react';
import './layout.css';

export default function Topbar({ title, subtitle }) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="topbar">
      {/* Left — Page title */}
      <div className="topbar-left">
        <span className="topbar-title">{title}</span>
        <span className="topbar-subtitle">{subtitle || today}</span>
      </div>

      {/* Right — actions */}
      <div className="topbar-right">
        {/* Search */}
        <div className="search-bar" id="topbar-search">
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search patients, records..." />
        </div>

        {/* Notification */}
        <button className="notif-btn" id="notif-btn" title="Notifications">
          <Bell size={17} />
          <span className="notif-badge" />
        </button>

        {/* Date chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px',
          background: 'var(--bg-soft)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--primary)',
        }}>
          <Calendar size={14} />
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
