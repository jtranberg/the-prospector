import { Link } from "react-router-dom";

export default function CookiePolicyPage() {
  return (
    <main className="app-shell">
      <Link to="/" className="button-link">
        ← Back to Dashboard
      </Link>

      <section className="dashboard-card">
        <h1>Cookie Policy</h1>

        <p>
          The Prospector uses cookies and local browser storage to improve
          performance, remember preferences, and enhance the scouting
          experience.
        </p>

        <h2>What We Store</h2>

        <ul>
          <li>User preferences and interface settings</li>
          <li>Session and navigation information</li>
          <li>Performance and analytics information</li>
        </ul>

        <h2>Third-Party Services</h2>

        <p>
          External services may use cookies according to their own privacy
          policies.
        </p>

        <h2>Contact</h2>

        <p>
          Questions regarding cookies may be directed to App Intelligence.
        </p>
      </section>
    </main>
  );
}