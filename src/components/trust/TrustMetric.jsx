export default function TrustMetric({ label, value, detail }) {
  return (
    <article className="trust-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}