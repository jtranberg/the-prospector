export default function StatusBadge({
  title,
  status,
  description,
}) {
  const online = status === "Operational";

  return (
    <article className="status-card">
      <div className="status-header">
        <h3>{title}</h3>

        <span className={online ? "status-online" : "status-warning"}>
          {status}
        </span>
      </div>

      <p>{description}</p>
    </article>
  );
}