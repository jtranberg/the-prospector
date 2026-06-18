import { Link } from "react-router-dom";

export default function TermsOfServicePage() {
  return (
    <main className="app-shell">
      <Link to="/" className="button-link">
        ← Back to Dashboard
      </Link>

      <section className="dashboard-card">
        <h1>Terms of Service</h1>

        <p>
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <p>
          Welcome to The Prospector. By accessing or using this platform, you
          agree to comply with these Terms of Service. If you do not agree with
          these terms, you should discontinue use of the platform.
        </p>

        <h2>Use of the Platform</h2>

        <p>
          The Prospector is a hockey scouting and intelligence platform designed
          to assist with prospect evaluation, research, and player analysis.
        </p>

        <h2>User Responsibilities</h2>

        <p>
          Users are responsible for ensuring that their use of the platform
          complies with applicable laws, regulations, and organizational
          policies.
        </p>

        <h2>Data and Information</h2>

        <p>
          Prospect information may be sourced from public, licensed, or
          authorized hockey data providers. While reasonable efforts are made to
          maintain accuracy, no guarantee is provided regarding the completeness
          or accuracy of any data.
        </p>

        <h2>Intellectual Property</h2>

        <p>
          The Prospector, its software, design, branding, and original content
          are the property of App Intelligence unless otherwise stated.
        </p>

        <h2>Limitation of Liability</h2>

        <p>
          The Prospector is provided on an "as available" basis. App
          Intelligence shall not be liable for any losses, damages, or business
          decisions made based on information presented within the platform.
        </p>

        <h2>Service Changes</h2>

        <p>
          Features, functionality, and content may be updated, modified, or
          removed at any time without prior notice.
        </p>

        <h2>Contact</h2>

        <p>
          Questions regarding these Terms of Service may be directed through the
          contact information provided on the Contact page.
        </p>
      </section>
    </main>
  );
}