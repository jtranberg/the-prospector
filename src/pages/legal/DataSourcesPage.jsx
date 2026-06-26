import LegalLayout from "../../components/trust/LegalLayout";

export default function DataSourcesPage() {
  return (
    <LegalLayout
      eyebrow="Data Sources"
      title="Built on trusted hockey intelligence."
      intro="The Prospector combines publicly available hockey information, licensed data, user-generated scouting intelligence, and AI-assisted enrichment to create a comprehensive scouting platform."
    >
      <h2>Public Hockey Information</h2>

      <p>
        Player profiles may include publicly available information such as names,
        positions, nationalities, teams, leagues, seasons, statistics, and other
        hockey-related information published by recognized organizations.
      </p>

      <h2>Licensed Data</h2>

      <p>
        Where applicable, The Prospector may integrate licensed data from
        approved providers through authorized APIs or commercial agreements.
        Those providers remain the owners of their respective content.
      </p>

      <h2>Scout Intelligence</h2>

      <p>
        Organizations using The Prospector may create private scouting notes,
        rankings, watch lists, player tags, observations, and evaluations.
        These records remain private to the organization unless intentionally
        shared.
      </p>

      <h2>AI-Assisted Enrichment</h2>

      <p>
        AI features may organize information, summarize player profiles,
        identify trends, and assist with research. AI-generated content should
        always be reviewed by qualified hockey personnel before being relied
        upon for decision-making.
      </p>

      <h2>External Links</h2>

      <p>
        Player cards may include links to external websites for additional
        research. Those websites operate independently and maintain their own
        privacy policies, terms, and data practices.
      </p>

      <h2>Data Accuracy</h2>

      <p>
        Although reasonable efforts are made to maintain accurate information,
        player data may change throughout a season. Users are encouraged to
        verify important information through official sources whenever possible.
      </p>

      <h2>Continuous Improvement</h2>

      <p>
        The Prospector continuously improves its data quality through enrichment,
        validation, user feedback, and ongoing platform development to provide
        more complete and reliable hockey intelligence.
      </p>
    </LegalLayout>
  );
}