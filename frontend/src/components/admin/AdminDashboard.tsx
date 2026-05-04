"use client";

import { useState, useEffect } from 'react';
import {
  Users, Calendar, AlertTriangle, Stethoscope, BedDouble,
  TrendingUp, TrendingDown, Eye, CheckCircle, Plus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import '../doctor/dashboard.css';
import {
  dashboardApi, patientsApi, doctorsApi, appointmentsApi,
  type DashboardSummary, type MonthlyVisit, type CaseDistribution,
  type Patient, type Doctor, type Appointment,
} from '@/lib/api';

/* ─── Fallback colours for case distribution ── */
const CASE_COLORS: Record<string, string> = {
  Normal:    '#16A34A',
  Medium:    '#F59E0B',
  Emergency: '#DC2626',
};

/* ─── Priority config ── */
const PRIORITY_CONFIG = {
  emergency: { label: 'Emergency', cls: 'badge-danger' },
  warning:   { label: 'High',      cls: 'badge-warning' },
  success:   { label: 'Normal',    cls: 'badge-success' },
};

/* ─── Custom Tooltip ── */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 10, padding: '8px 14px', fontSize: '0.82rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── Helper: derive priority from patient data ── */
function getPriority(p: Patient): 'emergency' | 'warning' | 'success' {
  const conds = (p.conditions || []).join(' ').toLowerCase();
  if (/cardiac|arrest|emergency|critical/.test(conds)) return 'emergency';
  if (/diabetes|hypertension|pressure/.test(conds))   return 'warning';
  return 'success';
}

/* ─── Helper: parse appointment hour/min ── */
function parseApptTime(dateTime?: string): { hour: string; min: string } {
  if (!dateTime) return { hour: '00', min: '00' };
  const d = new Date(dateTime);
  if (isNaN(d.getTime())) return { hour: '09', min: '00' };
  return {
    hour: String(d.getHours()).padStart(2, '0'),
    min:  String(d.getMinutes()).padStart(2, '0'),
  };
}

export default function AdminDashboard({ activeTab }: { activeTab: string }) {
  const [patientFilter, setPatientFilter] = useState('all');

  // Live data
  const [summary, setSummary]         = useState<DashboardSummary | null>(null);
  const [visitData, setVisitData]     = useState<MonthlyVisit[]>([]);
  const [caseDist, setCaseDist]       = useState<CaseDistribution[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [doctors, setDoctors]         = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Hospital Bed Mock State
  const TOTAL_BEDS = 120;
  const [occupiedBeds, setOccupiedBeds] = useState(84);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      // Global data fetch (no doctorId)
      const [
        summaryRes,
        visitsRes,
        distRes,
        patientsRes,
        doctorsRes,
        apptRes,
      ] = await Promise.allSettled([
        dashboardApi.summary(),
        dashboardApi.monthlyVisits(),
        dashboardApi.caseDistribution(),
        patientsApi.getAll(),
        doctorsApi.getAll(),
        appointmentsApi.getToday(),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.stats);
      if (visitsRes.status   === 'fulfilled') setVisitData(visitsRes.value.data || []);
      if (distRes.status     === 'fulfilled') {
        const raw = distRes.value.data || [];
        setCaseDist(raw.map(c => ({ ...c, color: c.color || CASE_COLORS[c.name] || '#6b9ab8' })));
      }
      if (patientsRes.status === 'fulfilled') setPatients((patientsRes.value as any).patients || (patientsRes.value as any).data || []);
      if (doctorsRes.status  === 'fulfilled') setDoctors((doctorsRes.value as any).doctors || (doctorsRes.value as any).data || []);
      if (apptRes.status     === 'fulfilled') setAppointments((apptRes.value as any).data || (apptRes.value as any).appointments || []);

      const allFailed = [summaryRes, visitsRes, distRes, patientsRes, doctorsRes, apptRes]
        .every(r => r.status === 'rejected');
      if (allFailed) setError('Could not reach backend. Make sure your server is running on http://localhost:5000.');
    } catch {
      setError('Unexpected error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDoctorPresence = async (id: string, currentStatus: boolean) => {
    try {
      await doctorsApi.updateAvailability(id, !currentStatus);
      // Optimistic UI update
      setDoctors(doctors.map(d => d._id === id ? { ...d, isAvailable: !currentStatus, available: !currentStatus } : d));
    } catch (e) {
      console.error("Failed to update availability");
    }
  };

  if (loading && !summary) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
          <p style={{ fontWeight: 600 }}>Loading global hospital data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 16, padding: '24px 32px', maxWidth: 440, textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>⚠ Backend unreachable</p>
          <p style={{ color: '#7f1d1d', fontSize: '0.875rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="welcome-banner animate-in" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #764BA2 100%)' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="wb-title">Hospital Administration Portal</div>
          <div className="wb-sub">Global operations overview · {new Date().toDateString()}</div>
        </div>
        <div className="wb-stats">
          {[
            { val: summary ? String(summary.totalPatients) : '—', label: "Total Patients" },
            { val: appointments.length.toString(), label: "Today's Appointments" },
            { val: summary ? String(summary.availableDoctors)  : '—', label: 'Doctors On Duty'  },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="wb-stat-val">{s.val}</div>
              <div className="wb-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="kpi-grid">
            {[
              { label: 'Hospital Beds', value: `${TOTAL_BEDS - occupiedBeds} Available`, icon: BedDouble, bg: '#e0e7ff', color: '#4f46e5', bar: '#4f46e5' },
              { label: "Today's Appts", value: appointments.length.toString(), icon: Calendar, bg: '#dcfce7', color: '#16a34a', bar: '#16A34A' },
              { label: 'Emergencies', value: summary ? String(summary.emergencyPatients) : '—', icon: AlertTriangle, bg: '#fee2e2', color: '#dc2626', bar: '#DC2626' },
              { label: 'Doctors Present', value: summary ? String(summary.availableDoctors) : '—', icon: Stethoscope, bg: '#fef3c7', color: '#b45309', bar: '#F59E0B' },
            ].map((k, i) => {
              const Icon = k.icon;
              return (
                <div key={i} className="kpi-card animate-in" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="kpi-bar" style={{ background: k.bar }} />
                  <div className="kpi-card-top">
                    <div className="kpi-icon" style={{ background: k.bg, color: k.color }}><Icon size={22} /></div>
                  </div>
                  <div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-label">{k.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {(visitData.length > 0 || caseDist.length > 0) && (
            <div className="chart-section animate-in">
              {visitData.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <div><div className="section-title">Hospital Visit Trends</div><div className="section-sub">Monthly outpatient visits</div></div>
                  </div>
                  <div style={{ padding: '16px 8px 12px' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={visitData}>
                        <defs>
                          <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#5FA8D3" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#5FA8D3" stopOpacity={0}    />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b9ab8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b9ab8', fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="visits" name="Visits" stroke="#1B4965" strokeWidth={2.5} fill="url(#visitGrad)" dot={{ r: 4, fill: '#1B4965', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {caseDist.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <div><div className="section-title">Global Case Distribution</div><div className="section-sub">By triage priority</div></div>
                  </div>
                  <div style={{ padding: '8px 0 12px' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={caseDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                          {caseDist.map((c, i) => <Cell key={i} fill={c.color || '#6b9ab8'} />)}
                        </Pie>
                        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem' }} />
                        <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'doctors' && (
        <div className="card animate-in" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div>
              <div className="section-title">Doctor Attendance & Availability</div>
              <div className="section-sub">Manage which doctors are on duty today</div>
            </div>
          </div>
          <div className="doctor-grid">
            {doctors.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No doctors found.</div>
            ) : doctors.map((d, i) => {
              const isAvailable = d.isAvailable ?? d.available;
              return (
                <div key={d._id || i} className="doctor-item" style={{ borderLeft: `4px solid ${isAvailable ? '#16A34A' : '#EF4444'}` }}>
                  <div className="avatar avatar-md" style={{ background: '#5FA8D3' }}>
                    {(d.name || '?').split(' ').filter((_,j) => j < 2).map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="doctor-info">
                    <div className="doctor-name">{d.name}</div>
                    <div className="doctor-spec">{d.specialization}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <button
                      onClick={() => handleToggleDoctorPresence(d._id, isAvailable)}
                      className="btn btn-sm"
                      style={{
                        padding: '4px 12px', fontSize: '0.72rem',
                        background: isAvailable ? '#fef2f2' : '#f0fdf4',
                        color: isAvailable ? '#dc2626' : '#16a34a',
                        border: `1px solid ${isAvailable ? '#fca5a5' : '#bbf7d0'}`
                      }}
                    >
                      {isAvailable ? 'Mark Absent' : 'Mark Present'}
                    </button>
                    <span className={`doctor-avail ${isAvailable ? 'avail-yes' : 'avail-no'}`} style={{ fontSize: '0.7rem' }}>
                      {isAvailable ? '● On Duty' : '○ Absent'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'beds' && (
        <div className="card animate-in">
          <div className="card-header">
            <div><div className="section-title">Hospital Bed Management</div><div className="section-sub">Current occupancy status</div></div>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px', flex: 1, margin: '0 10px' }}>
                <h3 style={{ fontSize: '2rem', color: '#0f172a', margin: 0 }}>{TOTAL_BEDS}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Total Beds</p>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fef2f2', borderRadius: '12px', flex: 1, margin: '0 10px' }}>
                <h3 style={{ fontSize: '2rem', color: '#dc2626', margin: 0 }}>{occupiedBeds}</h3>
                <p style={{ color: '#ef4444', fontSize: '0.9rem', margin: 0 }}>Occupied</p>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '12px', flex: 1, margin: '0 10px' }}>
                <h3 style={{ fontSize: '2rem', color: '#16a34a', margin: 0 }}>{TOTAL_BEDS - occupiedBeds}</h3>
                <p style={{ color: '#22c55e', fontSize: '0.9rem', margin: 0 }}>Available</p>
              </div>
            </div>
            <div style={{ background: '#e2e8f0', height: '24px', borderRadius: '12px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(occupiedBeds/TOTAL_BEDS)*100}%`, background: '#ef4444', height: '100%', transition: 'width 0.5s' }}></div>
              <div style={{ width: `${((TOTAL_BEDS-occupiedBeds)/TOTAL_BEDS)*100}%`, background: '#22c55e', height: '100%', transition: 'width 0.5s' }}></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="card animate-in">
          <div className="card-header">
            <div><div className="section-title">Master Appointment Schedule</div><div className="section-sub">All hospital appointments for today</div></div>
          </div>
          <div className="appt-list" style={{ padding: '0 16px 16px' }}>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No appointments today.</div>
            ) : appointments.map((a, i) => {
              const { hour, min } = parseApptTime(a.dateTime);
              const priority = a.priority === 'emergency' ? 'emergency' : a.priority === 'warning' ? 'warning' : 'success';
              const cfg = PRIORITY_CONFIG[priority];
              return (
                <div key={a._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: '#fafbfc', border: '1px solid var(--border)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className="avatar avatar-sm" style={{ background: priority === 'emergency' ? 'var(--danger)' : priority === 'warning' ? 'var(--warning)' : 'var(--secondary)' }}>
                      {(a.patientName || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{a.patientName || 'Patient'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.reason || 'Consultation'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        🕐 {hour}:{min} {parseInt(hour) < 12 ? 'AM' : 'PM'} · {a.doctorName ? `Dr. ${a.doctorName.replace('Dr. ', '')}` : 'Doctor'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge ${cfg.cls}`}><span className={`status-dot dot-${priority}`} />{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
