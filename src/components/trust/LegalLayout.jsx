import { Link } from "react-router-dom";
import "../../styles/legal.css";

export default function LegalLayout({ eyebrow, title, intro, children }) {
  return (
    <main className="legal-page">
      <Link to="/trust" className="legal-back-link">
        ← Back to Trust Center
      </Link>

      <section className="legal-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>

      <section className="legal-content">{children}</section>
    </main>
  );
}