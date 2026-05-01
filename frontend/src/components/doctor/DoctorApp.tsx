import { useState } from 'react';
import DoctorSidebar from './DoctorSidebar';
import DoctorTopbar from './DoctorTopbar';
import DoctorDashboard from './DoctorDashboard';
import AppointmentList from '@/components/appointments/AppointmentList';
import './index.css';
import './layout.css';

const PAGE_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Clinical overview & analytics' },
  appointments: { title: 'Appointments', subtitle: 'Schedule & manage appointments' },
  records: { title: 'Medical Records', subtitle: 'Lab reports, prescriptions & more' },
  doctors: { title: 'Doctors', subtitle: 'Staff directory & availability' },
  analytics: { title: 'Analytics', subtitle: 'Reports & performance metrics' },
  settings: { title: 'Settings', subtitle: 'System configuration' },
};

// Placeholder for pages not yet built
function ComingSoon({ page }: { page: string }) {
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
        {PAGE_META[page as keyof typeof PAGE_META]?.title} — Coming Soon
      </h2>
      <p style={{ fontSize: '0.875rem' }}>
        We're building this page next. Stay tuned!
      </p>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const meta = PAGE_META[activePage as keyof typeof PAGE_META] || PAGE_META.dashboard;

  return (
    <>
      <DoctorSidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-layout">
        <DoctorTopbar title={meta.title} subtitle={meta.subtitle} />

        {activePage === 'dashboard' ? (
          <DoctorDashboard />
        ) : activePage === 'appointments' ? (
          <div className="main-content"><AppointmentList /></div>
        ) : (
          <div className="main-content"><ComingSoon page={activePage} /></div>
        )}
      </div>
    </>
  );
}
