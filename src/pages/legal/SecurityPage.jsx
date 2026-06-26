import LegalLayout from "../../components/trust/LegalLayout";

export default function SecurityPage() {
  return (
    <LegalLayout
      eyebrow="Security"
      title="Protecting scouting intelligence."
      intro="The Prospector is built with practical security measures designed to protect user accounts, scouting notes, prospect data, and platform workflows."
    >
      <h2>Secure Connections</h2>
      <p>
        The platform is intended to operate over HTTPS so information exchanged
        between the browser and the application is protected in transit.
      </p>

      <h2>Authentication</h2>
      <p>
        Access to protected areas should be limited to authorized users through
        secure login flows, session handling, and account-level permissions.
      </p>

      <h2>Database Security</h2>
      <p>
        Prospect and user data is stored using managed database infrastructure
        with access controls, backups, and provider-level security features.
      </p>

      <h2>API Protection</h2>
      <p>
        API endpoints should use validation, access controls, rate limits, and
        error handling to reduce abuse and protect platform reliability.
      </p>

      <h2>Role-Based Access</h2>
      <p>
        Future team workflows should support role-based permissions so scouts,
        administrators, and organizational users only access the information
        appropriate to their role.
      </p>

      <h2>Monitoring</h2>
      <p>
        Platform health, API usage, errors, and unusual activity should be
        reviewed to support reliability and responsible operation.
      </p>

      <h2>Backups and Recovery</h2>
      <p>
        Backups and recovery planning help protect against accidental data loss,
        infrastructure issues, and unexpected outages.
      </p>

      <h2>Security Roadmap</h2>
      <p>
        Planned improvements include stronger audit logging, expanded role
        controls, data export controls, admin review tools, and security-focused
        operational checklists.
      </p>
    </LegalLayout>
  );
}