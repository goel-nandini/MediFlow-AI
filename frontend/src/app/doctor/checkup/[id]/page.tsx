'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle, Stethoscope, Pill } from 'lucide-react';
import { appointmentsData } from '@/data/appointmentsData';

export default function CheckupPage() {
  const params = useParams();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  
  const patient = appointmentsData.find((p) => p.id === params.id);

  if (!patient) return null;

  return (
    <div style={{ background: '#F0F4F8', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0, overflow: 'hidden' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
        
        {/* --- Header Actions --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
          <button 
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', outline: 'none' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <button 
            onClick={() => setIsCompleted(!isCompleted)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isCompleted ? '#16A34A' : '#1B4965', color: '#FFFFFF', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', outline: 'none', transition: 'all 0.2s ease' }}
          >
            <CheckCircle size={18} /> {isCompleted ? 'Marked as Completed' : 'Mark as Completed'}
          </button>
        </div>

        {/* --- Top Horizontal Patient Summary Bar --- */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            
            {/* Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                {patient.initials}
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0F172A', fontWeight: 700 }}>{patient.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#64748B' }}>
                  <span>{patient.age} yrs &bull; {patient.gender === 'M' ? 'Male' : 'Female'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    <Stethoscope size={14} /> In Consultation
                  </span>
                </div>
              </div>
            </div>

            {/* Vitals Inline */}
            <div style={{ display: 'flex', gap: '28px', background: '#F8FAFC', padding: '14px 28px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>BLOOD PRESSURE</p><p style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>120/80</p></div>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>HEART RATE</p><p style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>72 <span style={{fontSize:'13px', color:'#94A3B8', fontWeight: 500}}>bpm</span></p></div>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>TEMP</p><p style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>98.6 <span style={{fontSize:'13px', color:'#94A3B8', fontWeight: 500}}>°F</span></p></div>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>WEIGHT</p><p style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>165 <span style={{fontSize:'13px', color:'#94A3B8', fontWeight: 500}}>lbs</span></p></div>
            </div>
          </div>
          
          <div style={{ background: '#F1F5F9', padding: '14px 18px', borderRadius: '8px', borderLeft: '4px solid #1B4965' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
              <strong style={{ color: '#0F172A' }}>Chief Complaint:</strong> {patient.symptomsFull || patient.symptomsShort}
            </p>
          </div>
        </div>

        {/* --- Main Notes Area (Fills remaining height) --- */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0, paddingBottom: '24px' }}>
          
          {/* SOAP Notes */}
          <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText size={20} color="#1B4965" />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>Consultation Notes (SOAP)</h3>
            </div>
            <textarea 
              style={{ flex: 1, width: '100%', padding: '20px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '15px', color: '#0F172A', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
              placeholder="Subjective: Patient reports...&#10;Objective: Vitals stable...&#10;Assessment: Suspected...&#10;Plan: Recommend..."
              onFocus={(e) => e.target.style.borderColor = '#94A3B8'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          {/* Prescriptions */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Pill size={20} color="#1B4965" />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>Rx & Recommendations</h3>
            </div>
            <textarea 
              style={{ flex: 1, width: '100%', padding: '20px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '15px', color: '#0F172A', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
              placeholder="1. Amoxicillin 500mg PO TID x 7 days&#10;2. Rest and hydration&#10;3. Follow up in 1 week if no improvement."
              onFocus={(e) => e.target.style.borderColor = '#94A3B8'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

        </div>
        
      </div>
    </div>
  );
}
