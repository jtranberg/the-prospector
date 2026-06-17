import { useState } from "react";

import StatCard from "../components/StatCard";
import ProspectCard from "../components/ProspectCard";
import ProspectCharts from "../components/ProspectCharts";
import { getProspectScore, getPPG } from "../lib/prospectScoring";
import { getScoutXP, getScoutLevel } from "../lib/gamification";

function DashboardPage({ prospects = [] }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const selectedPlayer = prospects.find(
    (player) =>
      String(player.eliteId || player.id) === String(selectedPlayerId),
  );

  const displayPlayer = selectedPlayer;
  const topProspect = prospects[0];
  const scoutXP = getScoutXP(prospects);
  const scoutLevel = getScoutLevel(scoutXP);

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

        <select
          className="player-select"
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
        >
          <option value="">Choose a prospect...</option>

          {prospects.map((player) => (
            <option key={player.eliteId || player.id} value={String(player.eliteId || player.id)}>
              {player.name || "Unknown Player"} —{" "}
              {player.nationality || "Nationality unavailable"} —{" "}
              {player.position || "N/A"}
            </option>
          ))}
        </select>
      </section>

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
            </div>

            <div className="selected-score">
              <span>Prospect Score</span>
              <strong>{getProspectScore(displayPlayer)}</strong>
            </div>

            <div className="selected-stat-grid">
              <StatCard label="Games" value={displayPlayer.games ?? 0} compact />
              <StatCard label="Goals" value={displayPlayer.goals ?? 0} compact />
              <StatCard label="Assists" value={displayPlayer.assists ?? 0} compact />
              <StatCard label="Points" value={displayPlayer.points ?? 0} compact />
              <StatCard label="PPG" value={displayPlayer.ppg ?? getPPG(displayPlayer)} compact />
              <StatCard label="PIM" value={displayPlayer.pim ?? 0} compact />
              <StatCard label="Nationality" value={displayPlayer.nationality || "N/A"} compact />
              <StatCard label="Height" value={displayPlayer.heightImperial || "N/A"} compact />
              <StatCard
                label="Weight"
                value={
                  displayPlayer.weightImperial
                    ? `${displayPlayer.weightImperial} lb`
                    : "N/A"
                }
                compact
              />
              <StatCard label={displayPlayer.handednessLabel || "Shoots"} value={displayPlayer.shoots || "N/A"} compact />
              <StatCard label="Season" value={displayPlayer.season || "N/A"} compact />
              <StatCard label="Jersey" value={displayPlayer.jerseyNumber || "N/A"} compact />
            </div>

            {displayPlayer.eliteUrl && (
              <a href={displayPlayer.eliteUrl} target="_blank" rel="noreferrer" className="button-link">
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