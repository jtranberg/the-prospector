import LegalLayout from "../../components/trust/LegalLayout";

export default function AccessibilityPage() {
  return (
    <LegalLayout
      eyebrow="Accessibility"
      title="Usable, readable, and approachable."
      intro="The Prospector is designed to be practical and accessible for scouts, analysts, administrators, and hockey operations staff across devices."
    >
      <h2>Readable Interface</h2>
      <p>
        Pages are designed with clear spacing, strong contrast, large headings,
        readable text, and simple navigation patterns.
      </p>

      <h2>Responsive Design</h2>
      <p>
        The platform is intended to work across desktop, tablet, and mobile
        screens so users can research players from different environments.
      </p>

      <h2>Keyboard Navigation</h2>
      <p>
        Interactive elements should remain reachable through keyboard navigation
        wherever practical.
      </p>

      <h2>Semantic Structure</h2>
      <p>
        Pages use headings, sections, links, and readable content structure to
        support assistive technologies and easier scanning.
      </p>

      <h2>Continuous Improvement</h2>
      <p>
        Accessibility is an ongoing process. The platform should continue to
        improve contrast, focus states, labels, mobile usability, and screen
        reader support as features are added.
      </p>

      <h2>Feedback</h2>
      <p>
        Users who experience accessibility issues are encouraged to report them
        through the Contact page so improvements can be reviewed.
      </p>
    </LegalLayout>
  );
}