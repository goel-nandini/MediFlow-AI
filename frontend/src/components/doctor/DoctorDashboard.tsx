"use client";

import { useState, useEffect } from 'react';
import {
  Users, Calendar, FileText, AlertTriangle,
  TrendingUp, TrendingDown, Eye, Download,
  Stethoscope, Clock, Plus,
  Activity, Heart, Thermometer, Pill
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import './dashboard.css';
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

/* ─── Dashboard Component ── */
export default function Dashboard() {
  const [patientFilter, setPatientFilter] = useState('all');

  // Logged-in doctor info
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // Live data
  const [summary, setSummary]         = useState<DashboardSummary | null>(null);
  const [visitData, setVisitData]     = useState<MonthlyVisit[]>([]);
  const [caseDist, setCaseDist]       = useState<CaseDistribution[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [doctors, setDoctors]         = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Read logged-in doctor info
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mediflow_doctor_user');
      if (stored) setDoctorUser(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError('');
      try {
        const params = doctorUser?.id ? { doctorId: doctorUser.id } : {};

        const [
          summaryRes,
          visitsRes,
          distRes,
          patientsRes,
          doctorsRes,
          apptRes,
        ] = await Promise.allSettled([
          dashboardApi.summary(params),
          dashboardApi.monthlyVisits(params),
          dashboardApi.caseDistribution(params),
          patientsApi.getAll(params),
          doctorsApi.getAll(),
          appointmentsApi.getToday(params),
        ]);

        if (cancelled) return;

        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.stats);
        if (visitsRes.status   === 'fulfilled') setVisitData(visitsRes.value.data || []);
        if (distRes.status     === 'fulfilled') {
          const raw = distRes.value.data || [];
          setCaseDist(raw.map(c => ({ ...c, color: c.color || CASE_COLORS[c.name] || '#6b9ab8' })));
        }
        if (patientsRes.status === 'fulfilled') setPatients((patientsRes.value as any).patients || (patientsRes.value as any).data || []);
        if (doctorsRes.status  === 'fulfilled') setDoctors((doctorsRes.value as any).doctors || (doctorsRes.value as any).data || []);
        if (apptRes.status     === 'fulfilled') setAppointments((apptRes.value as any).data || (apptRes.value as any).appointments || []);

        // Fetch this doctor's appointments
        if (doctorUser?.id) {
          try {
            const myRes = await appointmentsApi.getAll({ doctorId: doctorUser.id });
            if (!cancelled) setMyAppointments(myRes.appointments || []);
          } catch { /* ignore */ }
        }

        const allFailed = [summaryRes, visitsRes, distRes, patientsRes, doctorsRes, apptRes]
          .every(r => r.status === 'rejected');
        if (allFailed) setError('Could not reach backend. Make sure your server is running on http://localhost:5000.');
      } catch {
        if (!cancelled) setError('Unexpected error loading dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();

    // Auto-refresh every 30 seconds for realtime updates
    const interval = setInterval(fetchAll, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [doctorUser]);

  /* ─── Derived KPI cards ── */
  const kpiCards = [
    {
      label: 'Total Patients',
      value: summary ? String(summary.totalPatients) : '—',
      trend: '',
      up: true,
      icon: Users,
      iconBg: '#e0f2fe', iconColor: '#0369a1', bar: '#5FA8D3',
    },
    {
      label: 'Emergency Cases',
      value: summary ? String(summary.emergencyPatients) : '—',
      trend: '',
      up: false,
      icon: AlertTriangle,
      iconBg: '#fee2e2', iconColor: '#dc2626', bar: '#DC2626',
    },
  ];

  const filteredPatients = patientFilter === 'all'
    ? patients
    : patients.filter(p => getPriority(p) === patientFilter);

  /* ─── Loading / Error states ── */
  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
          <p style={{ fontWeight: 600 }}>Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5',
          borderRadius: 16, padding: '24px 32px', maxWidth: 440, textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>⚠ Backend unreachable</p>
          <p style={{ color: '#7f1d1d', fontSize: '0.875rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">

      {/* 1 ── Welcome Banner */}
      <div className="welcome-banner animate-in">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="wb-title">Welcome to MediFlow Dashboard 👋</div>
          <div className="wb-sub">Here&apos;s your clinical overview for today · {new Date().toDateString()}</div>
        </div>
        <div className="wb-stats">
          {[
            { val: summary ? String(summary.todayAppointments) : '—', label: "Today's Patients" },
            { val: summary ? String(summary.emergencyPatients) : '—', label: 'Emergencies'      },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="wb-stat-val">{s.val}</div>
              <div className="wb-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2 ── KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="kpi-card animate-in" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="kpi-bar" style={{ background: k.bar }} />
              <div className="kpi-card-top">
                <div className="kpi-icon" style={{ background: k.iconBg, color: k.iconColor }}>
                  <Icon size={22} />
                </div>
                <div className={`kpi-trend ${k.up ? 'trend-up' : 'trend-down'}`}>
                  {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {k.trend || 'Live'}
                </div>
              </div>
              <div>
                <div className="kpi-value">{k.value}</div>
                <div className="kpi-label">{k.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 ── Analytics Row */}
      {(visitData.length > 0 || caseDist.length > 0) && (
        <div className="chart-section animate-in">
          {/* Visits trend */}
          {visitData.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="section-title">Patient Visit Trends</div>
                  <div className="section-sub">Monthly outpatient visits</div>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Download size={13} /> Export
                </button>
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
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fill: '#6b9ab8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: '#6b9ab8', fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone" dataKey="visits" name="Visits"
                      stroke="#1B4965" strokeWidth={2.5}
                      fill="url(#visitGrad)"
                      dot={{ r: 4, fill: '#1B4965', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Case distribution */}
          {caseDist.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="section-title">Case Distribution</div>
                  <div className="section-sub">By triage priority</div>
                </div>
              </div>
              <div style={{ padding: '8px 0 12px' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={caseDist}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={4} dataKey="value"
                    >
                      {caseDist.map((c, i) => (
                        <Cell key={i} fill={c.color || '#6b9ab8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={v => [`${v}%`, '']}
                      contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem' }}
                    />
                    <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="quick-stats" style={{ margin: '0 16px 16px' }}>
                {caseDist.map(c => (
                  <div key={c.name} className="qs-item">
                    <div className="qs-val" style={{ color: c.color || '#6b9ab8' }}>{c.value}%</div>
                    <div className="qs-label">{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3.5 ── My Patients (doctor-specific) */}
      {doctorUser && myAppointments.length > 0 && (
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="section-title">🩺 My Patients</div>
              <div className="section-sub">
                {myAppointments.filter(a => !['cancelled', 'Cancelled'].includes(a.status)).length} active appointments for Dr. {doctorUser.name?.replace('Dr. ', '')}
              </div>
            </div>
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            {myAppointments
              .filter(a => !['cancelled', 'Cancelled'].includes(a.status))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((apt, i) => {
                const priority = apt.priority === 'emergency' ? 'emergency' : apt.priority === 'warning' ? 'warning' : 'success';
                const cfg = PRIORITY_CONFIG[priority];
                const apptDate = new Date(apt.date);
                const isToday = apptDate.toDateString() === new Date().toDateString();
                return (
                  <div key={apt._id || i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: 12,
                    background: isToday ? '#f0fdf4' : '#fafbfc',
                    border: `1px solid ${isToday ? '#bbf7d0' : 'var(--border)'}`,
                    marginBottom: 10,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div className="avatar avatar-sm" style={{
                        background: priority === 'emergency' ? 'var(--danger)' : priority === 'warning' ? 'var(--warning)' : 'var(--secondary)',
                      }}>
                        {(apt.patientName || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                          {apt.patientName || 'Patient'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {apt.reason || 'Consultation'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          📅 {apptDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          🕐 {apt.timeSlot || '10:00'}
                          {isToday && <span style={{ color: '#16a34a', fontWeight: 700, marginLeft: 8 }}>● TODAY</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`badge ${cfg.cls}`}>
                        <span className={`status-dot dot-${priority}`} />
                        {cfg.label}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        padding: '3px 10px', borderRadius: 20,
                        background: apt.status === 'upcoming' ? '#dbeafe' : '#e0f2fe',
                        color: apt.status === 'upcoming' ? '#1d4ed8' : '#0369a1',
                      }}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            {myAppointments.filter(a => !['cancelled', 'Cancelled'].includes(a.status)).length === 0 && (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                No active appointments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 ── Patient History Table */}
      <div className="animate-in">

        {/* Patient History */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Patient Records</div>
              <div className="section-sub">{patients.length} registered patients</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'emergency', 'warning', 'success'].map(f => (
                <button
                  key={f}
                  id={`filter-${f}`}
                  onClick={() => setPatientFilter(f)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1.5px solid',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: patientFilter === f ? 'var(--primary)' : 'transparent',
                    borderColor: patientFilter === f ? 'var(--primary)' : 'var(--border)',
                    color: patientFilter === f ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {f === 'all' ? 'All' : f === 'emergency' ? '🔴 Emergency' : f === 'warning' ? '🟡 High' : '🟢 Normal'}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Conditions</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No patients found.
                    </td>
                  </tr>
                ) : filteredPatients.map(p => {
                  const priority = getPriority(p);
                  const cfg = PRIORITY_CONFIG[priority];
                  return (
                    <tr
                      key={p._id}
                      className={
                        priority === 'emergency' ? 'patient-row-emergency' :
                        priority === 'warning'   ? 'patient-row-warning'   : ''
                      }
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            className="avatar avatar-sm"
                            style={{
                              background:
                                priority === 'emergency' ? 'var(--danger)' :
                                priority === 'warning'   ? 'var(--warning)' : 'var(--secondary)',
                            }}
                          >
                            {(p.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.age ? `${p.age} yr` : '—'}</td>
                      <td style={{ fontWeight: 500, fontSize: '0.82rem' }}>
                        {(p.conditions || []).slice(0, 2).join(', ') || '—'}
                      </td>
                      <td>
                        <span className={`badge ${cfg.cls}`}>
                          <span className={`status-dot dot-${priority}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" id={`view-patient-${p._id}`} title="View Record">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
