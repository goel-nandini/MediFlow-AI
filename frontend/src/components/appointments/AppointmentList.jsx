'use client';

import { useState } from 'react';
import { Users, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { appointmentsData } from '@/data/appointmentsData';
import StatCard from './StatCard';
import PatientCard from './PatientCard';
import PatientDetailsModal from './PatientDetailsModal';

export default function AppointmentList() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const stats = {
    total: appointmentsData.length,
    urgent: appointmentsData.filter(p => p.status === 'Urgent').length,
    upcoming: appointmentsData.filter(p => p.status === 'Upcoming').length,
    completed: appointmentsData.filter(p => p.status === 'Completed').length,
  };

  const filtered = activeFilter === 'All'
    ? appointmentsData
    : appointmentsData.filter(p => p.status === activeFilter);

  const filters = ['All', 'Urgent', 'Upcoming', 'Completed'];

  return (
    <div className="w-full" style={{ paddingBottom: '40px' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div className="flex flex-col">
          <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '4px' }}>Appointments</h1>
          <p className="section-sub m-0">Manage your patients and schedule</p>
        </div>
        <button className="btn btn-secondary" style={{ background: 'white' }}>
          <Calendar size={18} />
          Today's Schedule
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24" style={{ marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats.total.toString()}
          valueColor="var(--primary)"
          subtitle="Patients Scheduled"
          iconBg="bg-blue-100"
        />
        <StatCard
          icon={AlertCircle}
          label="Urgent Cases"
          value={`${stats.urgent.toString().padStart(2, '0')} Red`}
          valueColor="var(--danger)"
          subtitle="Active priority"
          iconBg="bg-red-100"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming"
          value={stats.upcoming.toString()}
          valueColor="var(--primary)"
          subtitle="Next 4 hours"
          iconBg="bg-blue-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed.toString()}
          valueColor="var(--success)"
          subtitle="Finished today"
          iconBg="bg-green-100"
        />
      </div>

      {/* Filter Tabs */}
      <div style={{ paddingBottom: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center flex-wrap gap-12">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={activeFilter === f ? 'btn btn-primary' : 'btn btn-secondary'}
              style={activeFilter !== f ? { background: 'white' } : {}}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {filtered.map(patient => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onSelect={setSelectedPatient}
          />
        ))}
        {filtered.length === 0 && (
          <div className="card flex flex-col items-center justify-center" style={{ gridColumn: '1 / -1', padding: '80px 20px', borderStyle: 'dashed' }}>
            <Calendar size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
            <p className="section-title" style={{ margin: '0 0 4px 0' }}>No appointments found</p>
            <p className="section-sub" style={{ margin: 0 }}>There are no matching appointments for "{activeFilter}".</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
