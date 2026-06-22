import { useEffect, useMemo, useState } from "react";

import ProspectTable from "../components/ProspectTable";
import StatCard from "../components/StatCard";
import { getProspectScore, getPPG } from "../lib/prospectScoring";
import { loadProspectStats, loadProspectPage } from "../lib/liveProspects";

const PAGE_SIZE = 50;

function ProspectsPage() {
  const [dbStats, setDbStats] = useState(null);
  const [prospects, setProspects] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("points");
  const [loadingPage, setLoadingPage] = useState(false);

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

  useEffect(() => {
    async function loadPage() {
      try {
        setLoadingPage(true);

        const data = await loadProspectPage({
          page,
          limit: PAGE_SIZE,
          sort,
        });

        setProspects(data.players || data.prospects || []);
      } catch (error) {
        console.error("Unable to load prospect page:", error);
        setProspects([]);
      } finally {
        setLoadingPage(false);
      }
    }

    loadPage();
  }, [page, sort]);

  const totalPages = useMemo(() => {
    if (!dbStats?.total) return 1;
    return Math.ceil(dbStats.total / PAGE_SIZE);
  }, [dbStats]);

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

  function handleSortChange(event) {
    setSort(event.target.value);
    setPage(1);
  }

  function goToPreviousPage() {
    setPage((current) => Math.max(current - 1, 1));
  }

  function goToNextPage() {
    setPage((current) => Math.min(current + 1, totalPages));
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">ScoutBoard Database</p>

        <h1>Prospect Database</h1>

        <p>
          MongoDB-backed prospect database synced from Elite Prospects, with
          paginated browsing, local scoring, and selected player enrichment.
        </p>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Mongo Prospects"
          value={dbStats?.total ?? "Loading..."}
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
          label="Top Points"
          value={topScorer ? (topScorer.points ?? 0) : 0}
        />

        <StatCard
          label="Top Loaded Score"
          value={topProspect ? getProspectScore(topProspect) : 0}
        />

        <StatCard
          label="Best Loaded PPG"
          value={topPPG ? getPPG(topPPG) : "0.00"}
        />
      </section>

      <section className="dashboard-card">
        <div className="section-header">
          <div>
            <h2>All Synced Prospects</h2>

            <p>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, dbStats?.total || 0)}
              {" • "}
              Page {page} of {totalPages}
              {" • "}
              {dbStats?.total?.toLocaleString() ?? "Loading..."} Total Prospects
            </p>
          </div>

          <div className="pagination-controls">
            <label className="sort-control">
              <span>Sort</span>

              <select value={sort} onChange={handleSortChange}>
                <option value="points">Points</option>
                <option value="goals">Goals</option>
                <option value="assists">Assists</option>
                <option value="ppg">PPG</option>
                <option value="age">Age</option>
                <option value="name">Name A-Z</option>
                <option value="recent">Recently Synced</option>
              </select>
            </label>

            <button
              type="button"
              className="button-link"
              onClick={goToPreviousPage}
              disabled={page === 1 || loadingPage}
            >
              ← Previous
            </button>

            <span>
              Page <strong>{page}</strong> / {totalPages}
            </span>

            <button
              type="button"
              className="button-link"
              onClick={goToNextPage}
              disabled={page === totalPages || loadingPage}
            >
              Next →
            </button>
          </div>
        </div>

        {loadingPage ? (
          <p className="muted">Loading prospects...</p>
        ) : (
          <ProspectTable prospects={prospects} />
        )}
      </section>
    </main>
  );
}

export default ProspectsPage;