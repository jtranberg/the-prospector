import LegalLayout from "../../components/trust/LegalLayout";

export default function ResponsibleAIPage() {
  return (
    <LegalLayout
      eyebrow="Responsible AI"
      title="AI assists. Scouts decide."
      intro="The Prospector uses AI-assisted workflows to support discovery, organization, enrichment, and analysis while keeping human scouting judgment at the center."
    >
      <h2>Human-First Scouting</h2>
      <p>
        AI features are designed to support scouts and hockey staff, not replace
        their experience, context, or final decision-making.
      </p>

      <h2>Explainable Intelligence</h2>
      <p>
        Scores, summaries, and recommendations should be understandable,
        reviewable, and connected to visible player information whenever
        possible.
      </p>

      <h2>No Automatic Player Decisions</h2>
      <p>
        The platform should not be used as the only basis for recruiting,
        signing, ranking, or rejecting a player.
      </p>

      <h2>Bias Awareness</h2>
      <p>
        AI-assisted tools can reflect limitations in source data. The Prospector
        encourages review, context, and human judgment to reduce unfair or
        incomplete evaluations.
      </p>

      <h2>Data Quality</h2>
      <p>
        AI output depends on the quality and completeness of the information
        available. Scouts should verify important details before making
        decisions.
      </p>

      <h2>Continuous Improvement</h2>
      <p>
        Responsible AI practices should evolve as the platform grows, including
        better explanations, feedback loops, correction tools, and review
        workflows.
      </p>
    </LegalLayout>
  );
}