import LegalLayout from "../../components/trust/LegalLayout";

export default function CompliancePage() {
  return (
    <LegalLayout
      eyebrow="Standards & Compliance"
      title="Building trust through responsible platform practices."
      intro="Dave Hall's Prospector is developed with a commitment to privacy, transparency, security, accessibility, and responsible AI. As the platform evolves, our governance practices evolve with it."
    >
      <h2>Privacy by Design</h2>

      <p>
        Privacy considerations are incorporated into platform design, feature
        development, and operational workflows whenever practical. User data
        should be collected only when necessary to provide platform
        functionality.
      </p>

      <h2>PIPEDA Alignment</h2>

      <p>
        The Prospector is developed with the principles of Canada's Personal
        Information Protection and Electronic Documents Act (PIPEDA) in mind,
        including transparency, accountability, appropriate safeguards, and
        responsible handling of personal information.
      </p>

      <h2>Responsible AI</h2>

      <p>
        Artificial intelligence is intended to assist research, organization,
        and analysis. AI-generated insights should always complement—not
        replace—the expertise and judgment of scouts, coaches, and hockey
        operations staff.
      </p>

      <h2>Accessibility</h2>

      <p>
        The platform is designed with usability in mind, including readable
        layouts, responsive interfaces, keyboard accessibility, and ongoing
        improvements to support a broad range of users.
      </p>

      <h2>Intellectual Property</h2>

      <p>
        All original software, interface designs, analytics, documentation, and
        proprietary features developed for The Prospector remain the
        intellectual property of App Intelligence unless otherwise stated.
        Third-party trademarks and data remain the property of their respective
        owners.
      </p>

      <h2>Transparency</h2>

      <p>
        Users should understand where information originates, how AI assists the
        platform, and the intended purpose of scoring, enrichment, and analytics
        features.
      </p>

      <h2>Continuous Governance</h2>

      <p>
        Compliance is an ongoing process. Policies, security practices,
        documentation, and operational procedures are reviewed and updated as
        the platform grows and new capabilities are introduced.
      </p>
    </LegalLayout>
  );
}