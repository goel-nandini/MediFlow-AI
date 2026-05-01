import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Dashboard from './Dashboard';
import './index.css';
import './layout.css';

const PAGE_META = {
  dashboard:    { title: 'Dashboard',       subtitle: 'Clinical overview & analytics'    },
  patients:     { title: 'Patients',        subtitle: 'Manage patient records'            },
  appointments: { title: 'Appointments',    subtitle: 'Schedule & manage appointments'    },
  records:      { title: 'Medical Records', subtitle: 'Lab reports, prescriptions & more' },
  doctors:      { title: 'Doctors',         subtitle: 'Staff directory & availability'    },
  analytics:    { title: 'Analytics',       subtitle: 'Reports & performance metrics'     },
  settings:     { title: 'Settings',        subtitle: 'System configuration'              },
};

// Placeholder for pages not yet built
function ComingSoon({ page }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16, color: 'var(--text-muted)',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'var(--bg-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem',
      }}>🏗️</div>
      <h2 style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 700 }}>
        {PAGE_META[page]?.title} — Coming Soon
      </h2>
      <p style={{ fontSize: '0.875rem' }}>
        We're building this page next. Stay tuned!
      </p>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const meta = PAGE_META[activePage] || PAGE_META.dashboard;

  return (
    <>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-layout">
        <Topbar title={meta.title} subtitle={meta.subtitle} />

        {activePage === 'dashboard'
          ? <Dashboard />
          : <div className="main-content"><ComingSoon page={activePage} /></div>
        }
      </div>
    </>
  );
}
