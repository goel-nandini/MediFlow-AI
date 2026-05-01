'use client';

export default function StatCard({ icon: Icon, label, value, valueColor, subtitle, iconBg }) {
  // Translate standard tailwind backgrounds to the global theme if needed
  const getBgStyle = () => {
    if (iconBg.includes('red')) return { backgroundColor: 'var(--danger-bg)' };
    if (iconBg.includes('green')) return { backgroundColor: 'var(--success-bg)' };
    return { backgroundColor: 'rgba(95, 168, 211, 0.15)' }; // soft secondary
  };

  return (
    <div className="card card-pad flex items-center gap-16" style={{ minHeight: '120px' }}>
      <div className="avatar avatar-lg" style={getBgStyle()}>
        <Icon size={24} style={{ color: valueColor }} />
      </div>
      <div className="flex flex-col">
        <p className="section-sub font-bold uppercase tracking-wide m-0 mb-1">{label}</p>
        <p className="m-0 leading-none" style={{ fontSize: '28px', fontWeight: 800, color: valueColor }}>{value}</p>
        <p className="section-sub m-0" style={{ fontWeight: 500, marginTop: '6px' }}>{subtitle}</p>
      </div>
    </div>
  );
}
