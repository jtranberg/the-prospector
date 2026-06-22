import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  loadNationalityStats,
  loadPositionStats,
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

  const [nationalityStats, setNationalityStats] = useState([]);
  const [positionStats, setPositionStats] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);

  const [manualEliteId, setManualEliteId] = useState("");

  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [enrichLoading, setEnrichLoading] = useState(false);

  const [showGreeting, setShowGreeting] = useState(() => {
    return localStorage.getItem("scoutboard-welcome-dismissed") !== "true";
  });

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

  const positionSummary = useMemo(() => {
    const summary = {
      Forwards: 0,
      Defensemen: 0,
      Goalies: 0,
    };

    positionStats.forEach((item) => {
      const pos = String(item.position || "").toUpperCase();

      if (
        pos === "C" ||
        pos === "LW" ||
        pos === "RW" ||
        pos === "F" ||
        pos.includes("FORWARD")
      ) {
        summary.Forwards += item.count;
      } else if (
        pos === "D" ||
        pos === "LD" ||
        pos === "RD" ||
        pos.includes("DEFENSE")
      ) {
        summary.Defensemen += item.count;
      } else if (pos === "G" || pos === "GÖ" || pos.includes("GOAL")) {
        summary.Goalies += item.count;
      }
    });

    return summary;
  }, [positionStats]);

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

  const databaseMilestone = getDatabaseMilestone(dbPlayerCount);
  const pipelineHealth = getPipelineHealth(dbCoveragePercent);

  const globalProgress = dbPlayerCount
    ? Math.min(Math.round((dbPlayerCount / 200000) * 100), 100)
    : 0;

  useEffect(() => {
    async function loadStats() {
      try {
        setStatsError(false);

        const nationalityData = await loadNationalityStats();
        setNationalityStats(nationalityData);

        const positionData = await loadPositionStats();
        setPositionStats(positionData);

        const stats = await loadProspectStats();
        setDbStats(stats);
      } catch (error) {
        console.error("Unable to load DB stats:", error);
        setStatsError(true);
      }
    }

    loadStats();
  }, []);

  async function handleSearch(page = 1, termOverride = null) {
    const cleanSearch = String(termOverride ?? searchTerm).trim();

    console.log("DASHBOARD SEARCH:", {
      cleanSearch,
      searchTerm,
      termOverride,
      page,
    });

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

      const data = await searchProspects(cleanSearch, 100, page, "name");
      const players = data.players || [];

      setSearchResults(players);
      setSearchTotal(data.total || 0);
      setSearchPage(data.page || page);
      setActiveSearchTerm(cleanSearch);

      // If search finds exactly one prospect, open the card automatically.
      if (players.length === 1) {
        const player = players[0];
        const playerId = String(player.eliteId || player.id);

        setSelectedPlayerId(playerId);

        const detail = await loadProspectById(playerId);
        setSelectedPlayerDetail(detail);
      }
    } catch (error) {
      console.error("Unable to search prospects:", error);

      setSearchResults([]);
      setSearchTotal(0);
      setSelectedPlayerId("");
      setSelectedPlayerDetail(null);
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

  async function handleImportByEliteId() {
    const cleanId = manualEliteId.trim();

    if (!cleanId) return;

    try {
      setEnrichLoading(true);
      setSearchError("");
      setSelectedPlayerId("");
      setSelectedPlayerDetail(null);

      await enrichProspectById(cleanId);

      const detail = await loadProspectById(cleanId);

      setSelectedPlayerId(cleanId);
      setSelectedPlayerDetail(detail);

      setHasSearched(true);
      setSearchResults([detail]);
      setSearchTotal(1);
      setSearchPage(1);
      setActiveSearchTerm(`Elite ID ${cleanId}`);

      const stats = await loadProspectStats();
      setDbStats(stats);
      setStatsError(false);

      setManualEliteId("");
    } catch (error) {
      console.error("Unable to import Elite player:", error);
      setSearchError("Could not import that Elite Prospects ID.");
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
      {showGreeting && (
        <div className="modal-backdrop">
          <section className="case-modal greeting-modal">
            <h2>🏒 Welcome to ScoutBoard</h2>

            <p>
              Welcome to the Dave Hall's Global Hockey Intelligence Platform.
              The Prospector currently contains over{" "}
              <strong>184,000 hockey prospects from 106 countries</strong> and
              continues to grow.
            </p>

            <h3>Getting Started</h3>

            <ul>
              <li>
                🔍 <strong>Use The Dropdown Quick Search</strong> to select a
                player.
              </li>
              <li>
                🔍 <strong>Search</strong> by player name, country, team, or
                position.
              </li>
              <li>
                🆔 <strong>Import by Elite ID</strong> when a known player is
                missing from the local database.
              </li>
              <li>
                📄 Select a player to load their profile from the local
                database.
              </li>
              <li>
                ⚡ Click <strong>Enrich Player</strong> to download additional
                Elite Prospects data into the database.
              </li>
              <li>
                📊 Explore the dashboard charts and scouting analytics to
                identify prospects and hidden gems.
              </li>
            </ul>

            <h3>Demo Notice</h3>

            <p>
              This demonstration is hosted on a free backend. If the server has
              been idle it may take 30–60 seconds to wake up before data becomes
              available.
            </p>

            <div className="modal-actions">
              <button
                className="button-link"
                onClick={() => setShowGreeting(false)}
              >
                Dismiss
              </button>

              <button
                className="button-link"
                onClick={() => {
                  localStorage.setItem("scoutboard-welcome-dismissed", "true");
                  setShowGreeting(false);
                }}
              >
                Don't Show Again
              </button>
            </div>
          </section>
        </div>
      )}

      <section className="hero">
        <p className="eyebrow">Global Hockey Intelligence</p>

        <h1>
          DAVE HALL'S <br />
          Prospector Insights
        </h1>

        <p>
          Turning a global prospect database into today’s shortlist: invite
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
            <p className="eyebrow">Prospector War Room</p>

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

            <strong>200k Target</strong>
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
            label="Global"
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

      <section className="dashboard-card">
        <div className="section-header">
          <h2>Position Distribution</h2>
          <p>Player makeup across the global scouting database.</p>
        </div>

        <div className="selected-stat-grid">
          <StatCard
            label="Forwards"
            value={positionSummary.Forwards.toLocaleString()}
            compact
          />

          <StatCard
            label="Defensemen"
            value={positionSummary.Defensemen.toLocaleString()}
            compact
          />

          <StatCard
            label="Goalies"
            value={positionSummary.Goalies.toLocaleString()}
            compact
          />
        </div>
      </section>

      <section className="dashboard-card player-selector-card">
        <div className="section-header">
          <h2>Scouting Intelligence Center</h2>

          <p>
            Search the database, select a prospect, enrich the profile, or
            import a missing player directly by Elite Prospects ID.
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

        <div className="search-row">
          <input
            className="scout-input"
            placeholder="Import by Elite ID, e.g. 201473..."
            value={manualEliteId}
            onChange={(event) => setManualEliteId(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleImportByEliteId();
              }
            }}
          />

          <button
            className="button-link"
            type="button"
            onClick={handleImportByEliteId}
            disabled={enrichLoading}
          >
            {enrichLoading ? "Importing..." : "Import Elite ID"}
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
              onClick={() => handleSearch(searchPage - 1, activeSearchTerm)}
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
              onClick={() => handleSearch(searchPage + 1, activeSearchTerm)}
            >
              Next 100 ▶
            </button>
          </div>
        )}

        {/* Only show the selector when there is more than one result */}
        {selectableProspects.length > 1 && (
  <select
    className="scout-input"
    value={selectedPlayerId}
    onChange={async (event) => {
      const playerId = event.target.value;

      setSelectedPlayerId(playerId);
      setSelectedPlayerDetail(null);

      if (!playerId) return;

      const detail = await loadProspectById(playerId);
      setSelectedPlayerDetail(detail);
    }}
  >
    <option value="">Choose a prospect...</option>

    {selectableProspects.map((player) => {
      const playerId = player.eliteId || player.id;
      const score = getProspectScore(player);

      return (
        <option key={playerId} value={String(playerId)}>
          #{playerId} — {player.name || "Unknown Player"} — Score {score} —{" "}
          {player.nationality || "Nationality unavailable"} —{" "}
          {player.position || "N/A"}
        </option>
      );
    })}
  </select>
)}
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
        prospects={prospects}
        nationalityStats={nationalityStats}
        getProspectScore={getProspectScore}
      />

      <footer className="dashboard-footer">
        <div className="footer-brand">
          <strong>DAVE HALL&apos;S Prospector</strong>
          <span>Global Hockey Intelligence Platform</span>
        </div>

        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/cookies">Cookie Policy</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-copy">© 2026 App Intelligence</div>
      </footer>
    </main>
  );
}

export default DashboardPage;
