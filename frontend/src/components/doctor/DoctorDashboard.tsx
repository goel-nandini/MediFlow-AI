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

  // Live data
  const [summary, setSummary]         = useState<DashboardSummary | null>(null);
  const [visitData, setVisitData]     = useState<MonthlyVisit[]>([]);
  const [caseDist, setCaseDist]       = useState<CaseDistribution[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [doctors, setDoctors]         = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError('');
      try {
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

        if (cancelled) return;

        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.stats);
        if (visitsRes.status   === 'fulfilled') setVisitData(visitsRes.value.data || []);
        if (distRes.status     === 'fulfilled') {
          const raw = distRes.value.data || [];
          // Ensure each item has a color
          setCaseDist(raw.map(c => ({ ...c, color: c.color || CASE_COLORS[c.name] || '#6b9ab8' })));
        }
        if (patientsRes.status === 'fulfilled') setPatients(patientsRes.value.patients || []);
        if (doctorsRes.status  === 'fulfilled') setDoctors(doctorsRes.value.doctors || []);
        if (apptRes.status     === 'fulfilled') setAppointments(apptRes.value.appointments || []);

        // If every request failed, show an error
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
    return () => { cancelled = true; };
  }, []);

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
      label: "Today's Appointments",
      value: summary ? String(summary.todayAppointments) : '—',
      trend: '',
      up: true,
      icon: Calendar,
      iconBg: '#dcfce7', iconColor: '#16a34a', bar: '#16A34A',
    },
    {
      label: 'Emergency Cases',
      value: summary ? String(summary.emergencyPatients) : '—',
      trend: '',
      up: false,
      icon: AlertTriangle,
      iconBg: '#fee2e2', iconColor: '#dc2626', bar: '#DC2626',
    },
    {
      label: 'Available Doctors',
      value: summary ? String(summary.availableDoctors) : '—',
      trend: '',
      up: true,
      icon: Stethoscope,
      iconBg: '#fef3c7', iconColor: '#b45309', bar: '#F59E0B',
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
            { val: summary ? String(summary.availableDoctors)  : '—', label: 'Doctors On Duty'  },
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

      {/* 4 ── Patient History Table + Today's Appointments */}
      <div className="two-col animate-in">

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

        {/* Today's Appointments */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Today&apos;s Appointments</div>
              <div className="section-sub">{appointments.length} scheduled</div>
            </div>
            <button className="btn btn-primary btn-sm" id="add-appointment-btn">
              <Plus size={13} /> Book
            </button>
          </div>
          <div className="appt-list">
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No appointments today.
              </div>
            ) : appointments.map((a, i) => {
              const { hour, min } = parseApptTime(a.dateTime);
              const priority = a.priority === 'emergency' ? 'emergency' : a.priority === 'warning' ? 'warning' : 'success';
              const cfg = PRIORITY_CONFIG[priority];
              return (
                <div key={a._id || i} className="appt-item" id={`appt-${i}`}>
                  <div className="appt-time">
                    <div className="appt-time-hour">{hour}:{min}</div>
                    <div className="appt-time-min">{parseInt(hour) < 12 ? 'AM' : 'PM'}</div>
                  </div>
                  <div className="appt-info">
                    <div className="appt-name">{a.patientName || 'Patient'}</div>
                    <div className="appt-type">{a.doctorName ? `Dr. ${a.doctorName.replace('Dr. ', '')}` : 'Doctor'} · {a.reason || 'Consultation'}</div>
                    {/* Inline history preview */}
                    {(a.patient?.conditions?.length > 0 || a.patient?.allergies) && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {a.patient?.conditions?.slice(0, 2).map((c: string, idx: number) => (
                          <span key={idx} style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>{c}</span>
                        ))}
                        {a.patient?.allergies && <span style={{ color: '#dc2626' }}>⚠ Allergies</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`badge ${cfg.cls}`}>
                      <span className={`status-dot dot-${priority}`} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5 ── Available Doctors */}
      <div className="two-col animate-in">
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div>
              <div className="section-title">Available Doctors</div>
              <div className="section-sub">Staff directory &amp; availability</div>
            </div>
            <button className="btn btn-primary btn-sm" id="book-all-btn">
              <Plus size={13} /> New Booking
            </button>
          </div>
          <div className="doctor-grid">
            {doctors.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No doctors found.
              </div>
            ) : doctors.map((d, i) => (
              <div key={d._id || i} className="doctor-item" id={`doctor-${i}`}>
                <div className="avatar avatar-md" style={{ background: '#5FA8D3' }}>
                  {(d.name || '?').split(' ').filter((_,j) => j < 2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="doctor-info">
                  <div className="doctor-name">{d.name}</div>
                  <div className="doctor-spec">
                    {d.specialization} ·{' '}
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {d.totalPatients ?? 0} Patients
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className={`doctor-avail ${d.available ? 'avail-yes' : 'avail-no'}`}>
                    {d.available ? '● Available' : '○ Busy'}
                  </span>
                  {d.available && (
                    <button
                      id={`book-dr-${i}`}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                    >
                      Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
