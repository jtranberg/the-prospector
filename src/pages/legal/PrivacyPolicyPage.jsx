
import "../../styles/legal.css";
import LegalLayout from "../../components/trust/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      eyebrow="Privacy Policy"
      title="Privacy-first scouting intelligence."
      intro="Dave Hall's Prospector is designed to support hockey research, scouting notes, player evaluation, and team workflows while respecting user privacy and responsible data handling."
    >
      <h2>Information We Collect</h2>
      <p>
        The platform may collect account information, scouting notes, saved
        searches, prospect tags, watch lists, and usage information needed to
        operate and improve the service.
      </p>

      <h2>Player Information</h2>
      <p>
        Player records may include publicly available hockey information,
        licensed data, profile links, statistics, team information, and
        enrichment fields used for scouting and evaluation.
      </p>

      <h2>User-Generated Notes</h2>
      <p>
        Scouting notes, manual evaluations, tags, rankings, and internal
        comments belong to the authorized user or organization that created them.
      </p>

      <h2>Cookies and Analytics</h2>
      <p>
        The platform may use cookies or analytics tools to maintain sessions,
        improve performance, understand usage, and support security.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        The Prospector may rely on infrastructure, hosting, database, analytics,
        authentication, and data providers to operate the service.
      </p>

      <h2>Security</h2>
      <p>
        Reasonable technical and organizational safeguards are used to protect
        platform data, including secure connections, access controls, and
        managed database infrastructure.
      </p>

      <h2>Data Retention</h2>
      <p>
        Data is retained only as long as needed to operate the platform, support
        legitimate scouting workflows, meet contractual requirements, or comply
        with applicable obligations.
      </p>

      <h2>Data Requests</h2>
      <p>
        Users may request correction, review, export, or deletion of eligible
        account-related information by contacting the platform operator.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions, data requests, or correction requests can be sent to
        the platform operator through the Contact page.
      </p>
    </LegalLayout>
  );
}