import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <main className="app-shell">
      <Link to="/" className="button-link">
        ← Back to Dashboard
      </Link>

      <section className="dashboard-card">
        <h1>Privacy Policy</h1>

        <p>
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <p>
          The Prospector respects your privacy and is committed to protecting
          information collected through the platform.
        </p>

        <h2>Information We Collect</h2>

        <p>
          The platform may collect information necessary to operate and improve
          scouting workflows, including search activity, platform usage, and
          user preferences.
        </p>

        <h2>How Information Is Used</h2>

        <p>
          Information is used to improve platform performance, enhance scouting
          intelligence features, maintain security, and support ongoing
          development.
        </p>

        <h2>Prospect Data</h2>

        <p>
          Hockey prospect information displayed within The Prospector may
          originate from public, licensed, or authorized data sources and is
          presented for scouting and evaluation purposes.
        </p>

        <h2>Data Security</h2>

        <p>
          Reasonable measures are taken to protect platform data and user
          information from unauthorized access, disclosure, or misuse.
        </p>

        <h2>Third-Party Services</h2>

        <p>
          The platform may integrate with third-party services that maintain
          their own privacy practices and policies.
        </p>

        <h2>Contact</h2>

        <p>
          Questions regarding this Privacy Policy may be directed through the
          Contact page or App Intelligence.
        </p>
      </section>
    </main>
  );
}