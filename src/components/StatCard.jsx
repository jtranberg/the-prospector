function StatCard({ label, value, compact = false }) {
  return (
    <div className={`stat-card ${compact ? "compact-stat" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default StatCard;