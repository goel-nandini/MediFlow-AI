"use client";

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import '../doctor/index.css';
import '../doctor/layout.css';

export default function AdminApp() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div style={{ background: 'var(--bg-light)', minHeight: '100vh' }}>
      <AdminSidebar activePage={activePage} onNavigate={setActivePage} />
      <main style={{ marginLeft: 'var(--sidebar-w)' }}>
         <AdminDashboard activeTab={activePage} />
      </main>
    </div>
  );
}
