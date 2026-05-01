'use client';

import { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, Clock, Activity, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PatientDetailsModal({ patient, onClose }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!patient) return null;

  // Custom inline styles for perfect badge rendering bypassing Tailwind misses
  const getBadgeStyle = (status) => {
    if (status === 'Urgent') return { bg: 'var(--danger-bg)', color: 'var(--danger)' };
    if (status === 'Upcoming') return { bg: '#e0f2fe', color: '#0369a1' };
    if (status === 'Completed') return { bg: 'var(--success-bg)', color: 'var(--success)' };
    return { bg: '#f1f5f9', color: '#475569' };
  };

  const getRiskStyle = (risk) => {
    if (risk === 'HIGH') return { bg: 'var(--danger-bg)', color: 'var(--danger)' };
    if (risk === 'MEDIUM') return { bg: 'var(--warning-bg)', color: '#b45309' };
    if (risk === 'LOW') return { bg: 'var(--success-bg)', color: 'var(--success)' };
    return { bg: '#f1f5f9', color: '#475569' };
  };

  const severityColor = patient.severity <= 3 ? 'var(--success)' : patient.severity <= 6 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center" 
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', padding: '20px' }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ 
          width: '100%', maxWidth: '680px', maxHeight: '90vh', 
          display: 'flex', flexDirection: 'column', 
          overflow: 'hidden', borderRadius: '24px',
          transform: mounted ? 'scale(1)' : 'scale(0.95)',
          opacity: mounted ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)', position: 'relative', background: '#F8FAFC' }}>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center" style={{ gap: '20px' }}>
            <div 
              className={`avatar avatar-lg ${patient.avatarColor} ${patient.avatarText}`} 
              style={{ width: '64px', height: '64px', fontSize: '1.25rem' }}
            >
              {patient.initials}
            </div>
            <div>
              <h2 className="section-title" style={{ fontSize: '24px', marginBottom: '6px', color: 'var(--primary)' }}>{patient.name}</h2>
              <p className="section-sub" style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {patient.age} yrs &bull; {patient.gender === 'M' ? 'Male' : 'Female'} &bull; <Clock size={14} /> {patient.time}
              </p>
              
              <div className="flex items-center" style={{ gap: '8px', marginTop: '12px' }}>
                <span className="badge" style={{ background: getRiskStyle(patient.risk).bg, color: getRiskStyle(patient.risk).color, padding: '4px 12px' }}>
                  {patient.risk} RISK
                </span>
                <span className="badge" style={{ background: getBadgeStyle(patient.status).bg, color: getBadgeStyle(patient.status).color, padding: '4px 12px' }}>
                  {patient.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Body (Scrollable) --- */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {/* Triage / Symptoms */}
          <div style={{ marginBottom: '32px' }}>
            <h3 className="section-title flex items-center" style={{ gap: '8px', fontSize: '16px', marginBottom: '12px', color: 'var(--primary)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--accent)' }} /> Chief Complaint
            </h3>
            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {patient.symptomsFull}
              </p>
              
              <div className="flex items-center justify-between" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="section-sub" style={{ fontSize: '11px', marginBottom: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>DURATION</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>{patient.duration}</p>
                </div>
                <div style={{ width: '220px' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                    <p className="section-sub" style={{ fontSize: '11px', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>SEVERITY</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: severityColor }}>{patient.severity} / 10</p>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${patient.severity * 10}%`, height: '100%', background: severityColor, borderRadius: '99px', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div style={{ marginBottom: '32px' }}>
            <h3 className="section-title flex items-center" style={{ gap: '8px', fontSize: '16px', marginBottom: '16px', color: 'var(--primary)' }}>
              <Activity size={18} style={{ color: 'var(--secondary)' }} /> Medical History
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px' }}>
              {/* Conditions */}
              <div>
                <p className="section-sub" style={{ fontSize: '11px', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>CONDITIONS</p>
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                  {patient.history.conditions.map((item, i) => (
                    <span key={i} className="badge" style={{ background: '#e0f2fe', color: '#0369a1', textTransform: 'none', padding: '6px 12px', fontSize: '13px' }}>{item}</span>
                  ))}
                  {patient.history.conditions.length === 0 && <span className="section-sub" style={{ fontSize: '13px' }}>None reported</span>}
                </div>
              </div>
              
              {/* Allergies */}
              <div>
                <p className="section-sub" style={{ fontSize: '11px', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>ALLERGIES</p>
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                  {patient.history.allergies.map((item, i) => (
                    <span key={i} className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', textTransform: 'none', padding: '6px 12px', fontSize: '13px' }}>{item}</span>
                  ))}
                  {patient.history.allergies.length === 0 && <span className="section-sub" style={{ fontSize: '13px' }}>None reported</span>}
                </div>
              </div>

              {/* Medications */}
              <div>
                <p className="section-sub" style={{ fontSize: '11px', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>MEDICATIONS</p>
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                  {patient.history.medications.map((item, i) => (
                    <span key={i} className="badge" style={{ background: '#f3e8ff', color: '#7e22ce', textTransform: 'none', padding: '6px 12px', fontSize: '13px' }}>{item}</span>
                  ))}
                  {patient.history.medications.length === 0 && <span className="section-sub" style={{ fontSize: '13px' }}>None reported</span>}
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div>
            <h3 className="section-title flex items-center" style={{ gap: '8px', fontSize: '16px', marginBottom: '12px', color: 'var(--primary)' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} /> AI Triage Note
            </h3>
            <div style={{ background: 'var(--bg-light)', padding: '16px 20px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <Info size={22} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--primary)', fontWeight: 500, lineHeight: 1.6 }}>
                {patient.recommendation}
              </p>
            </div>
          </div>
          
        </div>

        {/* --- Footer --- */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '12px 28px', background: 'white', fontSize: '14px' }}>
            Cancel
          </button>
          {patient.status !== 'Completed' && (
            <button className="btn btn-primary" onClick={() => router.push(`/doctor/checkup/${patient.id}`)} style={{ padding: '12px 28px', fontSize: '14px' }}>
              Start Checkup
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
