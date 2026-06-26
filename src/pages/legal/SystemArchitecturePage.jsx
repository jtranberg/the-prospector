import LegalLayout from "../../components/trust/LegalLayout";

const layers = [
  {
    title: "Frontend Application",
    items: ["React", "Vite", "Responsive UI", "Player Cards", "Dashboard Views"],
  },
  {
    title: "API Layer",
    items: ["Node.js", "Express", "Search Routes", "Enrichment Routes", "Stats Routes"],
  },
  {
    title: "Data Layer",
    items: ["MongoDB", "Prospect Records", "Country Stats", "Position Stats", "Scouting Notes"],
  },
  {
    title: "Intelligence Layer",
    items: ["Prospect Scoring", "Pipeline Summary", "AI-Assisted Enrichment", "Hidden Gem Detection"],
  },
  {
    title: "Visualization Layer",
    items: ["World Map", "Charts", "War Room Metrics", "Recruiting Rink", "Digital Player Cards"],
  },
  {
    title: "Trust Layer",
    items: ["Privacy", "Security", "Responsible AI", "Data Sources", "Compliance"],
  },
];

export default function SystemArchitecturePage() {
  return (
    <LegalLayout
      eyebrow="System Architecture"
      title="A modern hockey intelligence platform."
      intro="The Prospector combines a responsive React interface, secure API services, MongoDB data storage, scouting analytics, enrichment workflows, and trust documentation into one professional platform."
    >
      <div className="architecture-stack">
        {layers.map((layer, index) => (
          <section className="architecture-layer" key={layer.title}>
            <div className="architecture-step">{index + 1}</div>

            <div>
              <h2>{layer.title}</h2>

              <ul>
                {layer.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <h2>Design Philosophy</h2>
      <p>
        The system is designed to separate interface, API, database, analytics,
        and trust responsibilities. This makes the platform easier to improve,
        expand, secure, and explain as new scouting workflows are added.
      </p>

      <h2>Scalable Foundation</h2>
      <p>
        The architecture supports a growing global prospect database, additional
        enrichment sources, organization-specific scouting workflows, exportable
        digital assets, and future AI-assisted intelligence features.
      </p>

      <h2>Responsible Engineering</h2>
      <p>
        The Prospector is built to balance speed, usability, data transparency,
        and responsible decision support. The goal is not simply to store player
        records, but to help hockey staff make better-informed evaluations.
      </p>
    </LegalLayout>
  );
}