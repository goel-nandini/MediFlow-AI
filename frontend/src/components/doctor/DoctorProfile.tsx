"use client";

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Award, Clock, Star, CalendarDays, Activity } from 'lucide-react';
import { dashboardApi } from '@/lib/api';

export default function DoctorProfile() {
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalPatients: 0, appointments: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mediflow_doctor_user');
      if (stored) {
        const u = JSON.parse(stored);
        setDoctorUser(u);
        
        // Fetch real stats
        dashboardApi.summary({ doctorId: u.id })
          .then(res => {
            const backendStats = res.data?.stats || {};
            setStats({
              totalPatients: backendStats.totalPatients || 0,
              appointments: backendStats.todayAppointments || 0
            });
          })
          .catch(() => {});
      }
    } catch { /* ignore */ }
  }, []);

  if (!doctorUser) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    );
  }

  const initials = (doctorUser.name || '?').split(' ').filter((_: any, i: number) => i < 2).map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="main-content">
      {/* Cover Profile Area */}
      <div className="card" style={{ overflow: 'hidden', padding: 0, border: 'none', boxShadow: 'var(--shadow-md)' }}>
        <div style={{
          height: 160,
          background: 'linear-gradient(135deg, var(--primary) 0%, #2d6a96 60%, var(--secondary) 100%)',
          position: 'relative'
        }}>
          {/* Decorative shapes */}
          <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', right: 100, bottom: -80, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        </div>
        
        <div style={{ padding: '0 32px 32px', position: 'relative', marginTop: -60 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%', background: '#fff',
                padding: 6, boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'var(--accent)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', fontWeight: 800
                }}>
                  {initials}
                </div>
              </div>
              <div style={{ paddingBottom: 10 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {doctorUser.name}
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 600, margin: '4px 0 0' }}>
                  {doctorUser.specialization || 'General Doctor'}
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Mail size={14} /> {doctorUser.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Phone size={14} /> +91 98765 43210
                  </span>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ alignSelf: 'flex-end', marginBottom: 10 }}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
        
        {/* Left Column: Stats & Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Stats */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center', padding: '24px 16px' }}>
            <div>
              <div style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 800 }}>{stats.totalPatients}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Patients</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <div style={{ color: '#16a34a', fontSize: '2rem', fontWeight: 800 }}>{stats.appointments}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Today's Appts</div>
            </div>
            <div>
              <div style={{ color: '#F59E0B', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                4.9 <Star size={18} fill="#F59E0B" color="#F59E0B" />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Patient Rating</div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="card">
            <div className="card-header" style={{ padding: '20px 24px 16px' }}>
              <div className="section-title">Professional Details</div>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <li style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Experience</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>12+ Years in {doctorUser.specialization || 'Healthcare'}</div>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                    <Activity size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Medical Registration No.</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MCI-{Math.floor(Math.random() * 90000) + 10000}</div>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Consultation Chamber</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Room 402, Block B, MediFlow General Hospital</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header" style={{ padding: '20px 24px 16px' }}>
              <div className="section-title">Weekly Schedule</div>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>Modify</button>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { day: 'Monday - Friday', time: '09:00 AM - 05:00 PM', active: true },
                  { day: 'Saturday', time: '09:00 AM - 01:00 PM', active: true },
                  { day: 'Sunday', time: 'Off Duty', active: false },
                ].map((s, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '12px 16px', background: s.active ? '#f8fafc' : '#f1f5f9', 
                    borderRadius: 8, border: '1px solid var(--border)' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CalendarDays size={18} color={s.active ? 'var(--primary)' : '#94a3b8'} />
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: s.active ? 'var(--text-primary)' : '#94a3b8' }}>
                        {s.day}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: s.active ? '#16a34a' : '#94a3b8' }}>
                      {s.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="card">
             <div className="card-header" style={{ padding: '20px 24px 16px' }}>
              <div className="section-title">Consultation Details</div>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Standard Consultation Fee</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹ 800.00</div>
                </div>
                <div style={{ height: 1, background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Avg. Consultation Time</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} /> 15 Minutes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
