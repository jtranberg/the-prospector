import LegalLayout from "../../components/trust/LegalLayout";

const releases = [
  {
    version: "Version 1.0",
    date: "June 2026",
    updates: [
      "Initial production release of Dave Hall's Prospector",
      "Global hockey prospect database established",
      "Worldwide prospect search",
      "Interactive player intelligence cards",
    ],
  },
  {
    version: "Database Growth",
    date: "June 2026",
    updates: [
      "Expanded to more than 226,000 hockey prospects",
      "Global player coverage across 100+ countries",
      "Continuous data synchronization and enrichment",
    ],
  },
  {
    version: "Intelligence Features",
    date: "June 2026",
    updates: [
      "Player enrichment workflows",
      "Interactive world map",
      "Google research integration",
      "Advanced prospect search",
      "Analytics dashboard",
    ],
  },
  {
    version: "Trust Center",
    date: "June 2026",
    updates: [
      "Privacy Policy",
      "Security documentation",
      "Responsible AI",
      "Data Sources",
      "Standards & Compliance",
      "Terms of Service",
    ],
  },
  {
    version: "Coming Soon",
    date: "Roadmap",
    updates: [
      "Digital Player Card Export",
      "Shareable scouting reports",
      "Organization workspaces",
      "Advanced AI intelligence",
      "Custom dashboards",
      "Additional data integrations",
    ],
  },
];

export default function ReleaseNotesPage() {
  return (
    <LegalLayout
      eyebrow="Release Notes"
      title="The evolution of The Prospector."
      intro="The Prospector is continuously improved through new features, expanded data coverage, performance enhancements, and responsible platform development."
    >
      {releases.map((release) => (
        <section key={release.version} style={{ marginBottom: "42px" }}>
          <h2>{release.version}</h2>

          <p
            style={{
              color: "#9fd3ff",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            {release.date}
          </p>

          <ul>
            {release.updates.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </LegalLayout>
  );
}