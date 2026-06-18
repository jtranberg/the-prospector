import { useEffect, useState } from "react";

import ProspectTable from "../components/ProspectTable";
import StatCard from "../components/StatCard";
import { getProspectScore, getPPG } from "../lib/prospectScoring";
import { loadProspectStats } from "../lib/liveProspects";

function ProspectsPage({ prospects = [] }) {
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await loadProspectStats();
        setDbStats(stats);
      } catch (error) {
        console.error("Unable to load prospect stats:", error);
      }
    }

    loadStats();
  }, []);

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
    return Number(getPPG(player)) > Number(getPPG(best)) ? player : best;
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
        <StatCard
          label="Mongo Prospects"
          value={dbStats?.total ?? "Loading..."}
        />
        <StatCard
  label="Top Points"
  value={topScorer ? topScorer.points ?? 0 : 0}
/>

        <StatCard
          label="Countries"
          value={dbStats?.countries ?? "Loading..."}
        />

        <StatCard
          label="DB Enriched"
          value={dbStats?.enriched ?? "Loading..."}
        />

        <StatCard label="Loaded Page" value={prospects.length} />

        <StatCard
          label="Top Loaded Score"
          value={
            topProspect ? getProspectScore(topProspect) : 0
          }
        />

        <StatCard
          label="Best Loaded PPG"
          value={topPPG ? getPPG(topPPG) : "0.00"}
        />
      </section>

      <section className="dashboard-card">
        <div className="section-header">
          <h2>All Synced Prospects</h2>

          <p>
            Showing loaded Mongo page • Total database:{" "}
            {dbStats?.total ?? "Loading..."} prospects.
          </p>
        </div>

        <ProspectTable prospects={prospects} />
      </section>
    </main>
  );
}

export default ProspectsPage;