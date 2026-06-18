import { Link } from "react-router-dom";

export default function ContactPage() {
  return (
    <main className="app-shell">
      <Link to="/" className="button-link">
        ← Back to Dashboard
      </Link>

      <section className="dashboard-card">
        <h1>Contact</h1>

        <p>
          The Prospector is developed and maintained by App Intelligence.
        </p>

        <h2>General Inquiries</h2>

        <p>
          Email:
          <a
  href="mailto:appintelligence.ca@gmail.com"
  className="contact-link"
>
  {" "}appintelligence.ca@gmail.com
</a>
        </p>

        <h2>Platform Information</h2>

        <p>
          Global Hockey Intelligence Platform
        </p>

        <p>
          Scouting database, prospect intelligence, and player evaluation
          tools.
        </p>

        <p>
          Website:
          <a
  href="https://appintelligence.ca"
  target="_blank"
  rel="noopener noreferrer"
  className="contact-link"
>
  App Intelligence
</a>
        </p>
      </section>
    </main>
  );
}