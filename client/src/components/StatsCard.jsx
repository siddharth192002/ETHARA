import './StatsCard.css';

export default function StatsCard({ icon, label, value, color = 'purple', subtext }) {
  return (
    <div className={`stats-card stats-${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-info">
        <span className="stats-value">{value}</span>
        <span className="stats-label">{label}</span>
        {subtext && <span className="stats-sub">{subtext}</span>}
      </div>
    </div>
  );
}
