import LegalLayout from "../../components/trust/LegalLayout";

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      eyebrow="Terms of Service"
      title="Rules for responsible platform use."
      intro="These terms explain the expected use of Dave Hall's Prospector, including account responsibilities, acceptable use, data ownership, and platform limitations."
    >
      <h2>Use of the Platform</h2>
      <p>
        The Prospector is intended for scouting research, player discovery,
        evaluation support, analytics, and hockey operations workflows.
      </p>

      <h2>User Responsibilities</h2>
      <p>
        Users are responsible for maintaining accurate account information,
        protecting login credentials, and using the platform in a lawful,
        respectful, and professional manner.
      </p>

      <h2>Acceptable Use</h2>
      <p>
        Users may not misuse the platform, attempt unauthorized access, disrupt
        service availability, copy protected content unlawfully, or use platform
        data in a misleading or harmful way.
      </p>

      <h2>Scouting Decisions</h2>
      <p>
        The Prospector provides research and intelligence tools only. Final
        scouting, recruiting, roster, signing, or development decisions remain
        the responsibility of qualified hockey personnel and organizations.
      </p>

      <h2>Data Ownership</h2>
      <p>
        User-created scouting notes, tags, evaluations, and internal comments
        remain associated with the user or organization that created them,
        subject to any applicable agreement.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        The software, interface, documentation, analytics, branding, and original
        platform features are owned by App Intelligence unless otherwise stated.
      </p>

      <h2>Third-Party Data and Links</h2>
      <p>
        External data providers, public sources, and linked websites maintain
        their own rights, terms, policies, and responsibilities.
      </p>

      <h2>Availability</h2>
      <p>
        The platform may change, improve, experience interruptions, or require
        maintenance. Reasonable efforts are made to maintain reliable operation.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        These terms may be updated as the platform grows, adds features, or
        changes operational requirements.
      </p>
    </LegalLayout>
  );
}