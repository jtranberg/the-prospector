import { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import ProspectCard from "../components/ProspectCard";
import ProspectCharts from "../components/ProspectCharts";

import { getProspectScore, getPPG } from "../lib/prospectScoring";
import { getScoutXP, getScoutLevel } from "../lib/gamification";
import {
  loadProspectById,
  searchProspects,
  enrichProspectById,
} from "../lib/liveProspects";

function DashboardPage({ prospects = [] }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [enrichLoading, setEnrichLoading] = useState(false);

  const selectedPlayer = prospects.find(
    (player) =>
      String(player.eliteId || player.id) === String(selectedPlayerId),
  );

  const displayPlayer = selectedPlayerDetail || selectedPlayer;
  const topProspect = prospects[0];
  const scoutXP = getScoutXP(prospects);
  const scoutLevel = getScoutLevel(scoutXP);

  const selectableProspects = searchResults.length ? searchResults : prospects;

  async function handleSearch() {
    const results = await searchProspects(searchTerm, 100);
    setSearchResults(results);
  }

  async function handleEnrich() {
    if (!selectedPlayerId) return;

    try {
      setEnrichLoading(true);
      await enrichProspectById(selectedPlayerId);

      const detail = await loadProspectById(selectedPlayerId);
      setSelectedPlayerDetail(detail);
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

        console.log("MONGO DETAIL LOADED:", detail);

        if (!cancelled) {
          console.log("SETTING DETAIL:", detail);
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

  console.log("SELECTED ID:", selectedPlayerId);
  console.log("SELECTED PLAYER:", selectedPlayer);
  console.log("SELECTED DETAIL:", selectedPlayerDetail);
  console.log("DISPLAY PLAYER:", displayPlayer);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">App Intelligence for Hockey Operations</p>
        <p>
          Prospect tracking, player intelligence, and junior hockey workflow in
          one clean dashboard.
        </p>
      </section>

      <section className="stats-grid">
        <StatCard label="Total Prospects" value={prospects.length} />
        <StatCard
          label="Invite Targets"
          value={prospects.filter((p) => p.status === "Invite").length}
        />
        <StatCard
          label="Top Score"
          value={topProspect ? getProspectScore(topProspect) : 0}
        />
        <StatCard label="Scout XP" value={scoutXP} />
        <StatCard label="Scout Level" value={scoutLevel} compact />
      </section>

      <section className="dashboard-card player-selector-card">
        <div className="section-header">
          <h2>Scouting Intelligence Center</h2>
          <p>{prospects.length} Mongo Prospects • Local Database</p>
        </div>

        <div className="search-row">
          <input
            className="player-select"
            placeholder="Search by name or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="button-link" type="button" onClick={handleSearch}>
            Search
          </button>
        </div>

        <select
          className="player-select"
          value={selectedPlayerId}
          onChange={(e) => {
            console.log("SELECTED PLAYER ID:", e.target.value);

            setSelectedPlayerDetail(null);
            setSelectedPlayerId(e.target.value);
          }}
        >
          <option value="">Choose a prospect...</option>

          {selectableProspects.map((player) => {
            const playerId = player.eliteId || player.id;

            return (
              <option key={playerId} value={String(playerId)}>
                #{playerId} — {player.name || "Unknown Player"} —{" "}
                {player.nationality || "Nationality unavailable"} —{" "}
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
        <>
          <section className="prospect-grid single-prospect-grid">
            <ProspectCard
              player={displayPlayer}
              getProspectScore={getProspectScore}
            />
          </section>

          <section className="dashboard-card player-detail-card">
            <div className="section-header">
              <h2>{displayPlayer.name || "Unknown Player"}</h2>
              <p>
                {displayPlayer.team || "Team unavailable"} •{" "}
                {displayPlayer.league || "League unavailable"} •{" "}
                {displayPlayer.position || "N/A"} • Age{" "}
                {displayPlayer.age || "N/A"}
              </p>
              <button
                className="button-link"
                type="button"
                onClick={handleEnrich}
                disabled={enrichLoading}
              >
                {enrichLoading ? "Enriching..." : "Enrich Selected Player"}
              </button>
            </div>

            <div className="selected-score">
              <span>Prospect Score</span>
              <strong>{getProspectScore(displayPlayer)}</strong>
            </div>

            <div className="selected-stat-grid">
              <StatCard
                label="Games"
                value={displayPlayer.games ?? 0}
                compact
              />
              <StatCard
                label="Goals"
                value={displayPlayer.goals ?? 0}
                compact
              />
              <StatCard
                label="Assists"
                value={displayPlayer.assists ?? 0}
                compact
              />
              <StatCard
                label="Points"
                value={displayPlayer.points ?? 0}
                compact
              />
              <StatCard
                label="PPG"
                value={displayPlayer.ppg ?? getPPG(displayPlayer)}
                compact
              />
              <StatCard label="PIM" value={displayPlayer.pim ?? 0} compact />
              <StatCard
                label="Nationality"
                value={displayPlayer.nationality || "N/A"}
                compact
              />
              <StatCard
                label="Height"
                value={displayPlayer.heightImperial || "N/A"}
                compact
              />
              <StatCard
                label="Weight"
                value={
                  displayPlayer.weightImperial
                    ? `${displayPlayer.weightImperial} lb`
                    : "N/A"
                }
                compact
              />
              <StatCard
                label={displayPlayer.handednessLabel || "Shoots"}
                value={displayPlayer.shoots || "N/A"}
                compact
              />
              <StatCard
                label="Season"
                value={displayPlayer.season || "N/A"}
                compact
              />
              <StatCard
                label="Jersey"
                value={displayPlayer.jerseyNumber || "N/A"}
                compact
              />
            </div>

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
          </section>

          <ProspectCharts
            prospects={[displayPlayer]}
            getProspectScore={getProspectScore}
          />
        </>
      )}
    </main>
  );
}

export default DashboardPage;
