import { useState } from 'react';
import {
  Users, Calendar, FileText, AlertTriangle,
  TrendingUp, TrendingDown, Eye, Download,
  Stethoscope, CheckCircle, Clock, Plus,
  Activity, Heart, Thermometer, Pill
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import './dashboard.css';

/* ─── Mock Data ─────────────────────────────── */
const KPI_DATA = [
  {
    label: 'Total Patients',
    value: '1,284',
    trend: '+8.2%',
    up: true,
    icon: Users,
    iconBg: '#e0f2fe',
    iconColor: '#0369a1',
    bar: '#5FA8D3',
  },
  {
    label: "Today's Appointments",
    value: '38',
    trend: '+3',
    up: true,
    icon: Calendar,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    bar: '#16A34A',
  },
  {
    label: 'Emergency Cases',
    value: '6',
    trend: '+2',
    up: false,
    icon: AlertTriangle,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    bar: '#DC2626',
  },
  {
    label: 'Available Doctors',
    value: '14',
    trend: '-1',
    up: false,
    icon: Stethoscope,
    iconBg: '#fef3c7',
    iconColor: '#b45309',
    bar: '#F59E0B',
  },
];

const PATIENTS = [
  { id: 'P-001', name: 'Ravi Shankar',   age: 62, condition: 'Cardiac Arrest',        doctor: 'Dr. A. Mehta',   last: '30 Apr 2025', priority: 'emergency', status: 'Critical'  },
  { id: 'P-002', name: 'Meena Gupta',    age: 45, condition: 'Type 2 Diabetes',        doctor: 'Dr. S. Khan',    last: '29 Apr 2025', priority: 'warning',   status: 'Stable'    },
  { id: 'P-003', name: 'Arjun Patil',    age: 28, condition: 'Fractured Wrist',        doctor: 'Dr. R. Nair',    last: '28 Apr 2025', priority: 'success',   status: 'Recovering'},
  { id: 'P-004', name: 'Sunita Rao',     age: 55, condition: 'Hypertension',           doctor: 'Dr. A. Mehta',   last: '27 Apr 2025', priority: 'warning',   status: 'Monitored' },
  { id: 'P-005', name: 'Imran Sheikh',   age: 35, condition: 'Appendicitis',           doctor: 'Dr. P. Joshi',   last: '26 Apr 2025', priority: 'emergency', status: 'Surgery'   },
  { id: 'P-006', name: 'Lakshmi Devi',   age: 70, condition: 'Knee Osteoarthritis',    doctor: 'Dr. S. Khan',    last: '25 Apr 2025', priority: 'success',   status: 'Stable'    },
  { id: 'P-007', name: 'Karan Malhotra', age: 40, condition: 'Migraine',               doctor: 'Dr. R. Nair',    last: '24 Apr 2025', priority: 'success',   status: 'Discharged'},
];

const APPOINTMENTS = [
  { hour: '09', min: '00', name: 'Ravi Shankar',   type: 'Follow-up · Cardiology',    priority: 'emergency' },
  { hour: '10', min: '30', name: 'Meena Gupta',    type: 'Review · Endocrinology',    priority: 'warning'   },
  { hour: '11', min: '00', name: 'Priya Desai',    type: 'New Patient · General',     priority: 'success'   },
  { hour: '12', min: '15', name: 'Deepak Sharma',  type: 'Lab Review · Internal Med', priority: 'success'   },
  { hour: '14', min: '00', name: 'Sunita Rao',     type: 'BP Check · Cardiology',     priority: 'warning'   },
  { hour: '15', min: '30', name: 'Amit Verma',     type: 'Consultation · Ortho',      priority: 'success'   },
];

const DOCTORS = [
  { name: 'Dr. Anil Mehta',    spec: 'Cardiologist',    avail: true,  patients: 12, initials: 'AM', color: '#5FA8D3' },
  { name: 'Dr. Sarah Khan',    spec: 'Endocrinologist', avail: true,  patients: 8,  initials: 'SK', color: '#62B6CB' },
  { name: 'Dr. Rohit Nair',    spec: 'Orthopedic',      avail: false, patients: 10, initials: 'RN', color: '#1B4965' },
  { name: 'Dr. Priya Joshi',   spec: 'General Surgery', avail: true,  patients: 6,  initials: 'PJ', color: '#16A34A' },
  { name: 'Dr. Vinod Kumar',   spec: 'Neurologist',     avail: false, patients: 9,  initials: 'VK', color: '#F59E0B' },
];

const RECORDS = [
  { title: 'Blood Report — CBC',       patient: 'Ravi Shankar',   date: '30 Apr',  icon: Activity, iconBg: '#fee2e2', iconColor: '#dc2626', type: 'Lab'       },
  { title: 'ECG Report',               patient: 'Ravi Shankar',   date: '30 Apr',  icon: Heart,    iconBg: '#fce7f3', iconColor: '#be185d', type: 'Diagnostic' },
  { title: 'Prescription — Metformin', patient: 'Meena Gupta',    date: '29 Apr',  icon: Pill,     iconBg: '#dcfce7', iconColor: '#16a34a', type: 'Rx'        },
  { title: 'X-Ray Wrist (Right)',      patient: 'Arjun Patil',    date: '28 Apr',  icon: Thermometer, iconBg: '#e0f2fe', iconColor: '#0369a1', type: 'Imaging' },
  { title: 'BP Monitoring Log',        patient: 'Sunita Rao',     date: '27 Apr',  icon: Activity, iconBg: '#fef3c7', iconColor: '#b45309', type: 'Vitals'    },
];

const VISIT_DATA = [
  { month: 'Nov', visits: 210 },
  { month: 'Dec', visits: 290 },
  { month: 'Jan', visits: 260 },
  { month: 'Feb', visits: 320 },
  { month: 'Mar', visits: 380 },
  { month: 'Apr', visits: 340 },
];

const CASE_DIST = [
  { name: 'Normal',    value: 58, color: '#16A34A' },
  { name: 'Medium',    value: 27, color: '#F59E0B' },
  { name: 'Emergency', value: 15, color: '#DC2626' },
];

/* ─── Priority badge ─────────────────────────── */
const PRIORITY_CONFIG = {
  emergency: { label: 'Emergency', cls: 'badge-danger' },
  warning:   { label: 'High',      cls: 'badge-warning' },
  success:   { label: 'Normal',    cls: 'badge-success' },
};

/* ─── Custom Tooltip ─────────────────────────── */
function ChartTooltip({ active, payload, label }) {
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

/* ─── Dashboard Component ────────────────────── */
export default function Dashboard() {
  const [patientFilter, setPatientFilter] = useState('all');

  const filteredPatients = patientFilter === 'all'
    ? PATIENTS
    : PATIENTS.filter(p => p.priority === patientFilter);

  return (
    <div className="main-content">

      {/* 1 ── Welcome Banner */}
      <div className="welcome-banner animate-in">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="wb-title">Good Evening, Dr. Sarah 👋</div>
          <div className="wb-sub">Here's your clinical overview for today, Wednesday 30 April 2025</div>
        </div>
        <div className="wb-stats">
          {[
            { val: '38',  label: "Today's Patients" },
            { val: '6',   label: 'Emergencies'      },
            { val: '14',  label: 'Doctors On Duty'  },
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
        {KPI_DATA.map((k, i) => {
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
                  {k.trend}
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
      <div className="chart-section animate-in">
        {/* Visits trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Patient Visit Trends</div>
              <div className="section-sub">Monthly outpatient visits (Nov – Apr)</div>
            </div>
            <button className="btn btn-secondary btn-sm">
              <Download size={13} /> Export
            </button>
          </div>
          <div style={{ padding: '16px 8px 12px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={VISIT_DATA}>
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

        {/* Case distribution */}
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
                  data={CASE_DIST}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value"
                >
                  {CASE_DIST.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [`${v}%`, '']}
                  contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem' }}
                />
                <Legend
                  formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* quick stats */}
          <div className="quick-stats" style={{ margin: '0 16px 16px' }}>
            {CASE_DIST.map(c => (
              <div key={c.name} className="qs-item">
                <div className="qs-val" style={{ color: c.color }}>{c.value}%</div>
                <div className="qs-label">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 ── Patient History Table + Upcoming Appointments */}
      <div className="two-col animate-in">

        {/* Patient History */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Patient History</div>
              <div className="section-sub">All registered patients and their latest status</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Filter tabs */}
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
                  <th>Condition</th>
                  <th>Doctor</th>
                  <th>Last Visit</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr
                    key={p.id}
                    className={
                      p.priority === 'emergency' ? 'patient-row-emergency' :
                      p.priority === 'warning'   ? 'patient-row-warning'   : ''
                    }
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="avatar avatar-sm"
                          style={{
                            background:
                              p.priority === 'emergency' ? 'var(--danger)' :
                              p.priority === 'warning'   ? 'var(--warning)' : 'var(--secondary)',
                          }}
                        >
                          {p.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.age} yr</td>
                    <td style={{ fontWeight: 500 }}>{p.condition}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{p.doctor}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.last}</td>
                    <td>
                      <span className={`badge ${PRIORITY_CONFIG[p.priority].cls}`}>
                        <span className={`status-dot dot-${p.priority}`} />
                        {PRIORITY_CONFIG[p.priority].label}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 600,
                        color:
                          p.status === 'Critical' || p.status === 'Surgery' ? 'var(--danger)' :
                          p.status === 'Monitored' ? '#b45309' : 'var(--success)',
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" id={`view-patient-${p.id}`} title="View Record">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Today's Appointments</div>
              <div className="section-sub">{APPOINTMENTS.length} scheduled</div>
            </div>
            <button className="btn btn-primary btn-sm" id="add-appointment-btn">
              <Plus size={13} /> Book
            </button>
          </div>
          <div className="appt-list">
            {APPOINTMENTS.map((a, i) => (
              <div key={i} className="appt-item" id={`appt-${i}`}>
                {/* Time block */}
                <div className="appt-time">
                  <div className="appt-time-hour">{a.hour}:{a.min}</div>
                  <div className="appt-time-min">
                    {parseInt(a.hour) < 12 ? 'AM' : 'PM'}
                  </div>
                </div>

                {/* Info */}
                <div className="appt-info">
                  <div className="appt-name">{a.name}</div>
                  <div className="appt-type">{a.type}</div>
                </div>

                {/* Priority dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`status-dot dot-${a.priority}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5 ── Medical Records + Book Doctor */}
      <div className="two-col animate-in">

        {/* Medical Records */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Recent Medical Records</div>
              <div className="section-sub">Latest lab reports, prescriptions & imaging</div>
            </div>
            <button className="btn btn-secondary btn-sm" id="view-all-records-btn">
              View All
            </button>
          </div>
          <div className="record-list">
            {RECORDS.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="record-item" id={`record-${i}`}>
                  <div className="record-icon" style={{ background: r.iconBg, color: r.iconColor }}>
                    <Icon size={18} />
                  </div>
                  <div className="record-info">
                    <div className="record-title">{r.title}</div>
                    <div className="record-sub">{r.patient}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className="badge badge-info">{r.type}</span>
                    <span className="record-date">{r.date}</span>
                  </div>
                  <button className="btn-icon" title="Download" style={{ marginLeft: 4 }}>
                    <Download size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Book / Available Doctors */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Book a Doctor</div>
              <div className="section-sub">Available specialists today</div>
            </div>
            <button className="btn btn-primary btn-sm" id="book-all-btn">
              <Plus size={13} /> New Booking
            </button>
          </div>
          <div className="doctor-grid">
            {DOCTORS.map((d, i) => (
              <div key={i} className="doctor-item" id={`doctor-${i}`}>
                <div className="avatar avatar-md" style={{ background: d.color }}>
                  {d.initials}
                </div>
                <div className="doctor-info">
                  <div className="doctor-name">{d.name}</div>
                  <div className="doctor-spec">
                    {d.spec} · <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{d.patients} patients</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className={`doctor-avail ${d.avail ? 'avail-yes' : 'avail-no'}`}>
                    {d.avail ? '● Available' : '○ Busy'}
                  </span>
                  {d.avail && (
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

    </div>/* end main-content */
  );
}
