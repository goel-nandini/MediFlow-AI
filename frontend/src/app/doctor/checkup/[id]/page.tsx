"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle, Stethoscope, Pill, AlertTriangle } from 'lucide-react';
import { appointmentsApi } from '@/lib/api';

export default function CheckupPage() {
  const params = useParams();
  const router = useRouter();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Prescription States
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [avoidances, setAvoidances] = useState(''); // mapped to recommendedTests in DB
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id) return;
        const res = await appointmentsApi.getById(id);
        if (res.data) {
          setAppointment(res.data);
          // Pre-fill if already exists
          if (res.data.notes) setNotes(res.data.notes);
          if (res.data.prescription) setPrescription(res.data.prescription);
          if (res.data.recommendedTests) setAvoidances(res.data.recommendedTests);
        }
      } catch (error) {
        console.error("Failed to fetch appointment", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointment();
  }, [params.id]);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!id) return;
      
      await appointmentsApi.update(id, {
        status: 'Completed',
        notes,
        prescription,
        recommendedTests: avoidances // Hijacking this field for avoidances
      });
      
      // Optionally route back to dashboard or show success
      router.back();
    } catch (error) {
      console.error("Failed to complete appointment", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F0F4F8' }}>
        <p style={{ color: '#475569', fontWeight: 600 }}>Loading Patient Data...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F0F4F8' }}>
        <p style={{ color: '#DC2626', fontWeight: 600 }}>Appointment not found.</p>
      </div>
    );
  }

  const patient = appointment.patient || {};
  const initials = (patient.name || '?').split(' ').filter((_: any, i: number) => i < 2).map((n: string) => n[0]).join('').toUpperCase();
  const isCompleted = appointment.status === 'Completed';

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
            onClick={handleComplete}
            disabled={isSubmitting || isCompleted}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: isCompleted ? '#16A34A' : '#1B4965', 
              color: '#FFFFFF', border: 'none', padding: '10px 24px', 
              borderRadius: '8px', cursor: (isSubmitting || isCompleted) ? 'not-allowed' : 'pointer', 
              fontWeight: 600, fontSize: '14px', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
              transition: 'all 0.2s ease',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            <CheckCircle size={18} /> {isSubmitting ? 'Saving...' : isCompleted ? 'Completed' : 'Mark as Completed'}
          </button>
        </div>

        {/* --- Top Horizontal Patient Summary Bar --- */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            
            {/* Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                {initials}
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0F172A', fontWeight: 700 }}>{patient.name || 'Unknown Patient'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#64748B' }}>
                  <span>{patient.age ? `${patient.age} yrs` : 'N/A'} &bull; {patient.gender === 'F' ? 'Female' : patient.gender === 'M' ? 'Male' : 'Other'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    <Stethoscope size={14} /> {appointment.timeSlot}
                  </span>
                </div>
              </div>
            </div>

            {/* Mocked Vitals Inline (Could be dynamic if added to schema) */}
            <div style={{ display: 'flex', gap: '28px', background: '#F8FAFC', padding: '14px 28px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>BLOOD PRESSURE</p><p style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>120/80</p></div>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>HEART RATE</p><p style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>72 <span style={{fontSize:'13px', color:'#94A3B8', fontWeight: 500}}>bpm</span></p></div>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>TEMP</p><p style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>98.6 <span style={{fontSize:'13px', color:'#94A3B8', fontWeight: 500}}>°F</span></p></div>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>BLOOD GROUP</p><p style={{ margin: 0, fontSize: '18px', color: '#DC2626', fontWeight: 800 }}>{patient.bloodGroup || 'O+'}</p></div>
            </div>
          </div>
          
          <div style={{ background: '#F1F5F9', padding: '14px 18px', borderRadius: '8px', borderLeft: '4px solid #1B4965' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
              <strong style={{ color: '#0F172A' }}>Chief Complaint:</strong> {appointment.reason || patient.conditions?.join(', ') || 'General Consultation'}
            </p>
          </div>
        </div>

        {/* --- Main Notes Area (Fills remaining height) --- */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0, paddingBottom: '24px' }}>
          
          {/* Left: SOAP Notes / Diagnosis */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText size={20} color="#1B4965" />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>Clinical Diagnosis & Notes</h3>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ flex: 1, width: '100%', padding: '20px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '15px', color: '#0F172A', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
              placeholder="Type your clinical findings, diagnosis, and general notes here..."
              onFocus={(e) => e.target.style.borderColor = '#94A3B8'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          {/* Right: Prescriptions & Avoidances */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Prescriptions */}
            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Pill size={20} color="#16A34A" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>Recommended Medicines</h3>
              </div>
              <textarea 
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                style={{ flex: 1, width: '100%', padding: '20px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '15px', color: '#0F172A', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                placeholder="e.g. Paracetamol 500mg - 1 tablet twice a day after meals&#10;Amoxicillin 250mg - 1 tablet thrice a day for 5 days"
                onFocus={(e) => e.target.style.borderColor = '#16A34A'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>

            {/* Avoidances / Precautions */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <AlertTriangle size={20} color="#F59E0B" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>Precautions & Avoid</h3>
              </div>
              <textarea 
                value={avoidances}
                onChange={(e) => setAvoidances(e.target.value)}
                style={{ flex: 1, width: '100%', padding: '20px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '15px', color: '#92400E', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                placeholder="e.g. Avoid cold water and spicy food. Get plenty of rest."
                onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                onBlur={(e) => e.target.style.borderColor = '#FDE68A'}
              />
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
