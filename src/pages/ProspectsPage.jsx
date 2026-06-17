import ProspectTable from "../components/ProspectTable";
import StatCard from "../components/StatCard";
import { getProspectScore, getPPG } from "../lib/prospectScoring";

function ProspectsPage({ prospects = [] }) {
  const activeProspects = prospects.filter(
    (player) => player.source === "elite_prospects",
  );

  const topProspect = prospects.reduce((best, player) => {
    if (!best) return player;
    return getProspectScore(player) > getProspectScore(best) ? player : best;
  }, null);

  const topScorer = prospects.reduce((best, player) => {
    if (!best) return player;
    return (player.points ?? 0) > (best.points ?? 0) ? player : best;
  }, null);

  const topPPG = prospects.reduce((best, player) => {
    if (!best) return player;
    return getPPG(player) > getPPG(best) ? player : best;
  }, null);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">ScoutBoard Database</p>

        <h1>Prospect Database</h1>

        <p>
          MongoDB-backed prospect database synced from Elite Prospects, with
          local search and selected player enrichment.
        </p>
      </section>

      <section className="stats-grid">
        <StatCard label="Mongo Prospects" value={activeProspects.length} />
        <StatCard
          label="Top Prospect"
          value={topProspect ? getProspectScore(topProspect) : 0}
        />
        <StatCard
          label="Top Points"
          value={topScorer ? topScorer.points ?? 0 : 0}
        />
        <StatCard
          label="Best PPG"
          value={topPPG ? getPPG(topPPG) : "0.00"}
        />
      </section>

      <section className="dashboard-card">
        <div className="section-header">
          <h2>All Synced Prospects</h2>

          <p>
            Local Mongo records • Elite Prospects source • Detail enrichment
            available for selected players.
          </p>
        </div>

        <ProspectTable prospects={prospects} />
      </section>
    </main>
  );
}

export default ProspectsPage;