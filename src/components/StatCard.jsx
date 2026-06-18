function StatCard({
  label,
  value,
  compact = false,
  valueStyle = {},
}) {
  return (
    <div className={`stat-card ${compact ? "compact-stat" : ""}`}>
      <span>{label}</span>
      <strong style={valueStyle}>{value}</strong>
    </div>
  );
}

export default StatCard;