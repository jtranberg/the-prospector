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

function getDatabaseMilestone(total) {
  if (!total) return "Building Dataset";
  if (total >= 100000) return "Global Pro Network";
  if (total >= 70000) return "Elite Global Board";
  if (total >= 50000) return "Major Scout Database";
  return "Prospect Builder";
}

function getPipelineHealth(coveragePercent) {
  if (coveragePercent >= 80) return "Game Ready";
  if (coveragePercent >= 50) return "Strong Board";
  if (coveragePercent >= 25) return "Building Intel";
  return "Needs More Enrichment";
}

function DashboardPage({ prospects = [] }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [dbStats, setDbStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);

  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [enrichLoading, setEnrichLoading] = useState(false);

  const selectableProspects = hasSearched ? searchResults : prospects;

  const totalSearchPages = searchTotal ? Math.ceil(searchTotal / 100) : 1;

  const dbPlayerCount = dbStats?.total ?? null;
  const playerCountDisplay = statsError
    ? "Unavailable"
    : (dbPlayerCount ?? "Loading...");

  const loadedPlayerCount = prospects.length;
  const searchResultCount = searchResults.length;

  const selectedPlayer = selectableProspects.find(
    (player) =>
      String(player.eliteId || player.id) === String(selectedPlayerId),
  );

  const displayPlayer = selectedPlayerDetail || selectedPlayer;

  const scoutXP = getScoutXP(prospects);
  const scoutLevel = getScoutLevel(scoutXP);

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

    const enrichedCount = scoredProspects.filter(
      (player) => player.enriched,
    ).length;

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
      enrichedCount,
      coveragePercent,
    };
  }, [prospects, loadedPlayerCount]);

  const dbEnriched = dbStats?.enriched ?? 0;
  const dbCountries = dbStats?.countries ?? "Loading...";
  const dbDuplicates = dbStats?.duplicateCount ?? 0;

  const dbCoveragePercent =
    dbPlayerCount && dbEnriched
      ? Math.round((dbEnriched / dbPlayerCount) * 100)
      : 0;

  const decisionMessage =
    dbPlayerCount && dbPlayerCount >= 70000
      ? `${dbPlayerCount.toLocaleString()} prospects are now in the global scouting database.`
      : "ScoutBoard is building the global prospect intelligence layer.";

  const missionMessage =
    intelligence.hiddenGems.length > 0
      ? `${intelligence.hiddenGems.length} possible hidden gems are worth a second look.`
      : "Search, enrich, and add scout intel to turn the database into a decision board.";

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

  const databaseMilestone = getDatabaseMilestone(dbPlayerCount);
  const pipelineHealth = getPipelineHealth(dbCoveragePercent);
  const globalProgress = dbPlayerCount
    ? Math.min(Math.round((dbPlayerCount / 100000) * 100), 100)
    : 0;

  async function handleSearch(page = 1) {
    const cleanSearch = searchTerm.trim();

    if (!cleanSearch) {
      setHasSearched(false);
      setSearchResults([]);
      setSearchTotal(0);
      setSearchPage(1);
      setActiveSearchTerm("");
      setSelectedPlayerId("");
      setSelectedPlayerDetail(null);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");
      setHasSearched(true);
      setSelectedPlayerId("");
      setSelectedPlayerDetail(null);

      const data = await searchProspects(cleanSearch, 100, page);

      setSearchResults(data.players);
      setSearchTotal(data.total);
      setSearchPage(data.page);
      setActiveSearchTerm(cleanSearch);
    } catch (error) {
      console.error("Unable to search prospects:", error);
      setSearchResults([]);
      setSearchError("Search unavailable. Check API connection.");
    } finally {
      setSearchLoading(false);
    }
  }

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
      <a
  href="https://appintelligence.ca"
  target="_blank"
  rel="noreferrer"
  className="ai-badge"
>
  Powered by App Intelligence
</a>
      <section className="hero">
        <p className="eyebrow">Global Hockey Intelligence</p>

        <h1>The Prospector</h1>

        <p>
          Turn a global prospect database into today’s shortlist: invite
          targets, watch-list players, hidden gems, and profiles that need scout
          intelligence.
        </p>
      </section>

      <section className="stats-grid">
        <StatCard label="Global Prospects" value={playerCountDisplay} />
        <StatCard
          label="Countries"
          value={statsError ? "Unavailable" : dbCountries}
        />
        <StatCard
          label="DB Enriched"
          value={statsError ? "Unavailable" : dbEnriched}
        />
        <StatCard label="Loaded List" value={loadedPlayerCount} />
        <StatCard label="Search Results" value={searchResultCount} />
        <StatCard label="Scout Level" value={scoutLevel} compact />
      </section>

      <section className="dashboard-card war-room-card">
        <div className="war-room-content">
          <div>
            <p className="eyebrow">ScoutBoard War Room</p>

            <h2>{databaseMilestone}</h2>

            <p>
              {playerCountDisplay} prospects across{" "}
              {statsError ? "multiple" : dbCountries} countries. The board is
              now built for finding today&apos;s best hockey decisions, not just
              storing names.
            </p>
          </div>

          <div className="war-room-meter">
            <div
              className="war-room-ring"
              style={{ "--value": globalProgress }}
            >
              <span>{globalProgress}%</span>
            </div>

            <strong>100k Target</strong>
            <small>{pipelineHealth}</small>
          </div>
        </div>
      </section>

      <section className="dashboard-card intelligence-card">
        <div className="section-header">
          <h2>Global Database Status</h2>
          <p>{decisionMessage}</p>
        </div>

        <div className="selected-stat-grid">
          <StatCard label="Players" value={playerCountDisplay} compact />
          <StatCard
            label="Countries"
            value={statsError ? "Unavailable" : dbCountries}
            compact
          />
          <StatCard
            label="Enriched"
            value={statsError ? "Unavailable" : dbEnriched}
            compact
          />
          <StatCard
            label="DB Coverage"
            value={`${dbCoveragePercent}%`}
            compact
          />
          <StatCard
            label="Duplicates"
            value={statsError ? "Unavailable" : dbDuplicates}
            compact
          />
        </div>
      </section>

      <section className="dashboard-card scout-mission-card">
        <div className="section-header">
          <h2>Prospect Pipeline</h2>
          <p>
            The goal is no longer volume. The goal is finding who deserves a
            scout’s attention today.
          </p>
        </div>

        <section className="dashboard-card rink-pipeline-card">
          <div className="section-header">
            <h2>Recruiting Rink</h2>

            <p>
              A hockey-first view of the player funnel from global pool to
              action-ready targets.
            </p>
          </div>

          <div className="rink-pipeline">
            <div className="rink-zone">
              <span>Total Pool</span>
              <strong>{playerCountDisplay}</strong>
              <small>Global database</small>
            </div>

            <div className="rink-zone">
              <span>Enriched</span>
              <strong>{statsError ? "Unavailable" : dbEnriched}</strong>
              <small>Elite detail files</small>
            </div>

            <div className="rink-zone">
              <span>Watch Closely</span>
              <strong>{intelligence.watchClosely.length}</strong>
              <small>Loaded review set</small>
            </div>

            <div className="rink-zone hot-zone">
              <span>Invite Now</span>
              <strong>{intelligence.inviteNow.length}</strong>
              <small>Action signals</small>
            </div>
          </div>
        </section>

        <div className="selected-stat-grid">
          <StatCard label="Total Pool" value={playerCountDisplay} compact />
          <StatCard
            label="Loaded Review Set"
            value={loadedPlayerCount}
            compact
          />
          <StatCard
            label="Global "
            value={`${dbCountries} Countries`}
            compact
            valueStyle={{
              fontSize: "1rem",
              lineHeight: "1.2",
            }}
          />

          <StatCard
            label="Database Tier"
            value={databaseMilestone}
            compact
            valueStyle={{
              fontSize: "0.95rem",
              lineHeight: "1.2",
            }}
          />

          <StatCard
            label="Invite Now"
            value={intelligence.inviteNow.length}
            compact
          />
          <StatCard
            label="Watch Closely"
            value={intelligence.watchClosely.length}
            compact
          />
          <StatCard
            label="Needs Data"
            value={intelligence.needsData.length}
            compact
          />
          <StatCard
            label="Hidden Gems"
            value={intelligence.hiddenGems.length}
            compact
          />
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
          <StatCard
            label="Loaded Intel Coverage"
            value={`${intelligence.coveragePercent}%`}
            compact
          />
          <StatCard
            label="Enriched Loaded"
            value={intelligence.enrichedCount}
            compact
          />
          <StatCard
            label="Top Loaded Score"
            value={
              intelligence.topProspect
                ? getProspectScore(intelligence.topProspect)
                : 0
            }
            compact
          />
        </div>
      </section>

      <section className="dashboard-card player-selector-card">
        <div className="section-header">
          <h2>Scouting Intelligence Center</h2>

          <p>
            Search the database, select a prospect, enrich the profile, then add
            optional scout intelligence where public data is missing.
          </p>
        </div>

        <div className="search-row">
          <input
            className="scout-input"
            placeholder="Search by name, country, team, or position..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch(1);
              }
            }}
          />

          <button
            className="button-link"
            type="button"
            onClick={() => handleSearch(1)}
          >
            🔍 Find Prospect
          </button>
        </div>

        {searchLoading && <p className="muted">Searching database...</p>}

        {searchError && <p className="error-text">{searchError}</p>}

        {hasSearched && !searchLoading && (
          <p className="muted">
            Showing {searchResults.length} of {searchTotal.toLocaleString()}{" "}
            result{searchTotal === 1 ? "" : "s"} for "{activeSearchTerm}".
          </p>
        )}

        {hasSearched && !searchLoading && searchTotal > 100 && (
          <div className="pagination-row">
            <button
              className="button-link"
              type="button"
              disabled={searchPage <= 1}
              onClick={() => handleSearch(searchPage - 1)}
            >
              ◀ Previous 100
            </button>

            <span className="muted">
              Page {searchPage} of {totalSearchPages}
            </span>

            <button
              className="button-link"
              type="button"
              disabled={searchPage >= totalSearchPages}
              onClick={() => handleSearch(searchPage + 1)}
            >
              Next 100 ▶
            </button>
          </div>
        )}

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

      {displayPlayer && (
        <section className="selected-player-stage">
          <div className="hockey-card-toolbar">
            <div>
              <p className="eyebrow">Selected Prospect</p>
              <h2>{displayPlayer.name || "Unknown Player"}</h2>
              <p>
                {displayPlayer.team || "Unknown Team"} •{" "}
                {displayPlayer.position || "N/A"} •{" "}
                {displayPlayer.nationality || "Nationality unavailable"}
              </p>
            </div>

            <div className="hockey-card-actions">
              <button
                className="button-link"
                type="button"
                onClick={handleEnrich}
                disabled={enrichLoading}
              >
                {enrichLoading ? "Enriching..." : "Enrich Player"}
              </button>

              {displayPlayer.eliteUrl && (
                <a
                  href={displayPlayer.eliteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button-link"
                >
                  Elite Profile
                </a>
              )}
            </div>
          </div>

          <div className="hockey-card-frame">
            <ProspectCard
              player={displayPlayer}
              getProspectScore={getProspectScore}
            />
          </div>
        </section>
      )}

      <ProspectCharts
        prospects={intelligence.scoredProspects}
        getProspectScore={getProspectScore}
      />
      <footer className="dashboard-footer">
  <div>
    <strong>The Prospector  </strong>
    <span>
      Global Hockey Intelligence Platform
    </span>
  </div>

  <div>
    <span>
      {dbPlayerCount?.toLocaleString() || "0"} Prospects •{" "}
      {dbCountries || 0} Countries
    </span>
  </div>

  <div>
    <a
      href="https://appintelligence.ca"
      target="_blank"
      rel="noreferrer"
    >
      Built by App Intelligence
    </a>
  </div>
</footer>
    </main>
    
  );
}

export default DashboardPage;
