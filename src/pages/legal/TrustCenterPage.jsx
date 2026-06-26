import "../../styles/trust.css";
import TrustCard from "../../components/trust/TrustCard";
import TrustMetric from "../../components/trust/TrustMetric";
import StatusBadge from "../../components/trust/StatusBadge";

const trustItems = [
  {
    title: "Privacy Policy",
    description:
      "How The Prospector handles user information, scouting notes, and platform data.",
    to: "/privacy",
  },
  {
    title: "Security",
    description:
      "Infrastructure, authentication, encryption, and platform protection practices.",
    to: "/security",
  },
  {
    title: "Responsible AI",
    description:
      "Human-first scouting intelligence with explainable, assistive AI workflows.",
    to: "/responsible-ai",
  },
  {
    title: "Data Sources",
    description:
      "Where player information, scouting data, enrichment, and analytics come from.",
    to: "/data-sources",
  },
  {
    title: "Compliance",
    description:
      "Privacy, accessibility, copyright, data requests, and responsible platform use.",
    to: "/compliance",
  },
  {
    title: "Accessibility",
    description:
      "Our commitment to readable, usable, keyboard-friendly software experiences.",
    to: "/accessibility",
  },
  {
    title: "Terms of Service",
    description:
      "Rules for using The Prospector and responsibilities for platform users.",
    to: "/terms",
  },
  {
    title: "Release Notes",
    description:
      "Milestones, improvements, and the evolution of The Prospector platform.",
    to: "/release-notes",
  },
  {
  title: "System Architecture",
  description:
    "How the frontend, API, database, analytics, enrichment, and trust layers work together.",
  to: "/system-architecture",
},
];

export default function TrustCenterPage() {
  return (
    <main className="trust-page">
      <section className="trust-hero">
        <p className="eyebrow">Trust Center</p>

        <h1>Built for responsible hockey intelligence.</h1>

        <p className="trust-hero-text">
          Dave Hall&apos;s Prospector is designed to support scouting,
          evaluation, research, and hockey operations through transparent data
          practices, responsible AI, and secure platform design.
        </p>
      </section>

      <section className="trust-metrics" aria-label="Platform trust metrics">
        <TrustMetric
          label="Database"
          value="226,000+"
          detail="Global prospect records"
        />

        <TrustMetric
          label="Coverage"
          value="100+"
          detail="Countries represented"
        />

        <TrustMetric
          label="Status"
          value="Operational"
          detail="Platform actively maintained"
        />

        <TrustMetric
          label="Version"
          value="1.0"
          detail="Trust Center launched"
        />
      </section>

      <section className="status-section">
        <p className="eyebrow">Platform Status</p>

        <div className="status-grid">
          <StatusBadge
            title="Application"
            status="Operational"
            description="Frontend services running normally."
          />

          <StatusBadge
            title="API"
            status="Operational"
            description="Prospect search and enrichment services available."
          />

          <StatusBadge
            title="Database"
            status="Operational"
            description="MongoDB synchronized and available."
          />

          <StatusBadge
            title="AI Services"
            status="Operational"
            description="AI-assisted platform features available."
          />
        </div>
      </section>

      <section className="trust-grid" aria-label="Trust Center sections">
        {trustItems.map((item) => (
          <TrustCard
            key={item.title}
            title={item.title}
            description={item.description}
            to={item.to}
          />
        ))}
      </section>

      <section className="trust-statement">
        <p className="eyebrow">The Dave Hall Standard</p>

        <h2>Data helps identify patterns. Scouts provide the judgment.</h2>

        <p>
          The Prospector exists to help hockey organizations discover talent
          more efficiently. It does not replace human scouting, player context,
          development judgment, or organizational decision-making.
        </p>
      </section>
    </main>
  );
}