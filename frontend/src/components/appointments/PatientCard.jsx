'use client';

import { Clock, ArrowRight } from 'lucide-react';

export default function PatientCard({ patient, onSelect }) {
  const getBadgeClass = (status) => {
    if (status === 'Urgent') return 'badge badge-danger';
    if (status === 'Upcoming') return 'badge badge-info';
    if (status === 'Completed') return 'badge badge-success';
    return 'badge';
  };

  return (
    <div 
      className="card card-pad flex flex-col justify-between" 
      style={{ minHeight: '180px', cursor: 'pointer' }} 
      onClick={() => onSelect(patient)}
    >
      {/* Top Row */}
      <div className="flex justify-between items-start" style={{ marginBottom: '20px' }}>
        <div className="flex items-center gap-12">
          <div className={`avatar avatar-lg ${patient.avatarColor} ${patient.avatarText}`}>
            {patient.initials}
          </div>
          <div className="flex flex-col">
            <h3 className="section-title m-0 leading-tight">{patient.name}</h3>
            <p className="section-sub m-0 mt-1">{patient.age}, {patient.gender}</p>
          </div>
        </div>
        <div className={getBadgeClass(patient.status)}>
          {patient.status}
        </div>
      </div>

      {/* Middle */}
      <div className="flex flex-col" style={{ marginBottom: '20px' }}>
        <p className="section-sub font-bold uppercase tracking-wider m-0 mb-1" style={{ fontSize: '11px' }}>Symptoms</p>
        <p className="m-0 leading-relaxed overflow-hidden" style={{ fontSize: '14px', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {patient.symptomsShort}
        </p>
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-center" style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <div className="flex items-center gap-8 section-sub" style={{ fontWeight: 500 }}>
          <Clock size={16} />
          <span>{patient.time}</span>
        </div>
        <button className="btn" style={{ background: 'transparent', padding: 0, color: 'var(--secondary)' }}>
          View Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
