import { Link } from "react-router-dom";

export default function TrustCard({
  title,
  description,
  to,
  icon,
}) {
  return (
    <Link to={to} className="trust-card">
      <div className="trust-card-top">
        {icon && (
          <div className="trust-card-icon">
            {icon}
          </div>
        )}

        <h2>{title}</h2>
      </div>

      <p>{description}</p>

      <div className="trust-card-footer">
        <span>Learn More</span>

        <span className="trust-arrow">
          →
        </span>
      </div>
    </Link>
  );
}