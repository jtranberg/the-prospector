import { useEffect, useMemo, useState } from "react";

import StatCard from "../components/StatCard";
import ProspectCard from "../components/ProspectCard";
import ProspectCharts from "../components/ProspectCharts";

import { getProspectScore, getPPG } from "../lib/prospectScoring";
import { getScoutXP, getScoutLevel } from "../lib/gamification";
import {
  loadProspectById,
  searchProspects,
  enrichProspectById,
  loadProspectStats,
} from "../lib/liveProspects";

function DashboardPage({ prospects = [] }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Database-level stats come from /api/prospects/stats.
  // These represent the real MongoDB collection, not just the loaded page list.
  const [dbStats, setDbStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  // Search state controls the prospect selector.
  // When search results exist, the dropdown switches to those results.
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Enrichment state gives the button a proper loading state.
  const [enrichLoading, setEnrichLoading] = useState(false);

  // Search results become the active working list when present.
  // Otherwise we use the loaded prospects passed into the dashboard.
  const selectableProspects = searchResults.length ? searchResults : prospects;

  // True Mongo player count.
  const dbPlayerCount = dbStats?.total ?? null;
  const playerCountDisplay = statsError
    ? "Unavailable"
    : dbPlayerCount ?? "Loading...";

  const loadedPlayerCount = prospects.length;
  const searchResultCount = searchResults.length;

  // Selected player can come from search results or the default loaded list.
  const selectedPlayer = selectableProspects.find(
    (player) =>
      String(player.eliteId || player.id) === String(selectedPlayerId),
  );

  // If full Mongo detail has been loaded, use it.
  // Otherwise show the lighter selected player record.
  const displayPlayer = selectedPlayerDetail || selectedPlayer;

  // Scout XP is currently based on loaded records.
  // Later this can become DB-level reviewed/enriched totals.
  const scoutXP = getScoutXP(prospects);
  const scoutLevel = getScoutLevel(scoutXP);

  // Turns raw prospect records into dashboard intelligence.
  const intelligence = useMemo(() => {
    const scoredProspects = prospects.map((player) => {
      const score = getProspectScore(player);
      const ppg = Number(getPPG(player)) || 0;

      return {
        ...player,
        scoutScore: score,
        scoutPPG: ppg,
      };
    });

    const inviteNow = scoredProspects.filter(
      (player) => player.scoutScore >= 80,
    );

    const watchClosely = scoredProspects.filter(
      (player) => player.scoutScore >= 60 && player.scoutScore < 80,
    );

    const needsData = scoredProspects.filter(
      (player) => !player.enriched || player.games === 0,
    );

    const hiddenGems = scoredProspects.filter(
      (player) => player.scoutPPG >= 1 && player.scoutScore >= 70,
    );

    const topProspect = scoredProspects.reduce((best, player) => {
      if (!best) return player;
      return player.scoutScore > best.scoutScore ? player : best;
    }, null);

    const topScorer = scoredProspects.reduce((best, player) => {
      if (!best) return player;
      return (player.points ?? 0) > (best.points ?? 0) ? player : best;
    }, null);

    const bestPPG = scoredProspects.reduce((best, player) => {
      if (!best) return player;
      return player.scoutPPG > best.scoutPPG ? player : best;
    }, null);

    const enrichedCount = scoredProspects.filter((player) => player.enriched)
      .length;

    const coveragePercent = loadedPlayerCount
      ? Math.round((enrichedCount / loadedPlayerCount) * 100)
      : 0;

    return {
      scoredProspects,
      inviteNow,
      watchClosely,
      needsData,
      hiddenGems,
      topProspect,
      topScorer,
      bestPPG,
      enrichedCount,
      coveragePercent,
    };
  }, [prospects, loadedPlayerCount]);

  const decisionMessage =
    intelligence.inviteNow.length > 0
      ? `${intelligence.inviteNow.length} players are showing invite-level signals.`
      : "No invite-level signals yet. Keep enriching and reviewing.";

  const missionMessage =
    intelligence.hiddenGems.length > 0
      ? `${intelligence.hiddenGems.length} possible hidden gems are worth a second look.`
      : "The board is waiting for more enriched profiles to reveal hidden gems.";

  // Load database stats once when the dashboard opens.
  useEffect(() => {
    async function loadStats() {
      try {
        setStatsError(false);

        const stats = await loadProspectStats();
        setDbStats(stats);
      } catch (error) {
        console.error("Unable to load DB stats:", error);
        setStatsError(true);
      }
    }

    loadStats();
  }, []);

  // Runs a Mongo-backed prospect search.
  async function handleSearch() {
    try {
      const results = await searchProspects(searchTerm, 100);
      setSearchResults(results);
    } catch (error) {
      console.error("Unable to search prospects:", error);
      setSearchResults([]);
    }
  }

  // Enriches the selected player, reloads detail, then refreshes DB stats.
  async function handleEnrich() {
    if (!selectedPlayerId) return;

    try {
      setEnrichLoading(true);

      await enrichProspectById(selectedPlayerId);

      const detail = await loadProspectById(selectedPlayerId);
      setSelectedPlayerDetail(detail);

      const stats = await loadProspectStats();
      setDbStats(stats);
      setStatsError(false);
    } catch (error) {
      console.error("Unable to enrich player:", error);
    } finally {
      setEnrichLoading(false);
    }
  }

  // Loads full Mongo player detail when a prospect is selected.
  useEffect(() => {
    if (!selectedPlayerId) return;

    let cancelled = false;

    async function loadDetail() {
      try {
        setDetailLoading(true);

        const detail = await loadProspectById(selectedPlayerId);

        if (!cancelled) {
          setSelectedPlayerDetail(detail);
        }
      } catch (error) {
        console.error("Unable to load Mongo player detail:", error);
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedPlayerId]);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">App Intelligence for Hockey Operations</p>

        <h1>ScoutBoard Intelligence</h1>

        <p>
          Turn raw Elite Prospects data into hockey decisions: invite targets,
          watch-list players, hidden gems, and profiles that need more data.
        </p>
      </section>

      <section className="stats-grid">
        <StatCard label="Mongo Players" value={playerCountDisplay} />
        <StatCard label="Loaded List" value={loadedPlayerCount} />
        <StatCard label="Search Results" value={searchResultCount} />
        <StatCard label="Invite Now" value={intelligence.inviteNow.length} />

        <StatCard
          label="Top Score"
          value={
            intelligence.topProspect
              ? getProspectScore(intelligence.topProspect)
              : 0
          }
        />

        <StatCard label="Scout XP" value={scoutXP} />
        <StatCard label="Scout Level" value={scoutLevel} compact />
      </section>

      <section className="dashboard-card intelligence-card">
        <div className="section-header">
          <h2>Decision Intelligence</h2>
          <p>{decisionMessage}</p>
        </div>

        <div className="selected-stat-grid">
          <StatCard label="Invite Now" value={intelligence.inviteNow.length} compact />
          <StatCard label="Watch Closely" value={intelligence.watchClosely.length} compact />
          <StatCard label="Needs Data" value={intelligence.needsData.length} compact />
          <StatCard label="Hidden Gems" value={intelligence.hiddenGems.length} compact />
        </div>
      </section>

      <section className="dashboard-card scout-mission-card">
        <div className="section-header">
          <h2>Scout Mission</h2>
          <p>{missionMessage}</p>
        </div>

        <div className="selected-stat-grid">
          <StatCard label="Scout XP" value={scoutXP} compact />
          <StatCard label="Scout Level" value={scoutLevel} compact />
          <StatCard label="Intel Coverage" value={`${intelligence.coveragePercent}%`} compact />
          <StatCard label="Enriched Loaded" value={intelligence.enrichedCount} compact />
        </div>
      </section>

      <section className="dashboard-card player-selector-card">
        <div className="section-header">
          <h2>Scouting Intelligence Center</h2>

          <p>
            {playerCountDisplay} Players • {loadedPlayerCount} Loaded •{" "}
            {searchResultCount} Search Results
          </p>
        </div>

        <div className="selected-stat-grid">
          <StatCard label="Players" value={playerCountDisplay} compact />

          <StatCard
            label="Countries"
            value={
              statsError ? "Unavailable" : dbStats?.countries ?? "Loading..."
            }
            compact
          />

          <StatCard
            label="DB Enriched"
            value={statsError ? "Unavailable" : dbStats?.enriched ?? 0}
            compact
          />

          <StatCard
            label="Duplicates"
            value={statsError ? "Unavailable" : dbStats?.duplicateCount ?? 0}
            compact
          />
        </div>

        <div className="search-row">
          <input
            className="scout-input"
            placeholder="Search by name, country, team, or position..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <button className="button-link" type="button" onClick={handleSearch}>
            Search
          </button>
        </div>

        <select
          className="scout-input"
          value={selectedPlayerId}
          onChange={(event) => {
            setSelectedPlayerDetail(null);
            setSelectedPlayerId(event.target.value);
          }}
        >
          <option value="">Choose a prospect...</option>

          {selectableProspects.map((player) => {
            const playerId = player.eliteId || player.id;
            const score = getProspectScore(player);

            return (
              <option key={playerId} value={String(playerId)}>
                #{playerId} — {player.name || "Unknown Player"} — Score {score}{" "}
                — {player.nationality || "Nationality unavailable"} —{" "}
                {player.position || "N/A"}
              </option>
            );
          })}
        </select>
      </section>

      {detailLoading && (
        <section className="dashboard-card">
          <p>Loading Mongo player detail...</p>
        </section>
      )}

      {/* Selected player view.
          ProspectCard is now the single source of truth for player detail,
          so the old duplicate player-detail-card has been removed. */}
      {displayPlayer && (
        <section className="prospect-grid single-prospect-grid">
          <ProspectCard
            player={displayPlayer}
            getProspectScore={getProspectScore}
          />

          <div className="dashboard-card">
            <div className="section-header">
              <h2>Player Actions</h2>

              <p>
                Enrich this player from Elite Prospects when you need deeper
                profile data before making a scouting decision.
              </p>
            </div>

            <button
              className="button-link"
              type="button"
              onClick={handleEnrich}
              disabled={enrichLoading}
            >
              {enrichLoading ? "Enriching..." : "Enrich Selected Player"}
            </button>

            {displayPlayer.eliteUrl && (
              <a
                href={displayPlayer.eliteUrl}
                target="_blank"
                rel="noreferrer"
                className="button-link"
              >
                View Elite Prospects Profile
              </a>
            )}
          </div>
        </section>
      )}

      {/* Global prospect charts.
          This keeps the second chart set only,
          using the loaded/scored prospect list instead of a single selected player. */}
      <ProspectCharts
        prospects={intelligence.scoredProspects}
        getProspectScore={getProspectScore}
      />
    </main>
  );
}

export default DashboardPage;