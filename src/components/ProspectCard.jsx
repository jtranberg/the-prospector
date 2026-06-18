import { useState } from "react";
import { getPPG } from "../lib/prospectScoring";
import { API_BASE_URL } from "../lib/apiConfig";

// Keeps display values clean and prevents blank/null fields from showing.
function formatValue(value, fallback = "N/A") {
  return value === null || value === undefined || value === ""
    ? fallback
    : value;
}

// Age supports manual scout entry first, then Elite age.
function formatAge(player) {
  if (player.manualAge) return `${player.manualAge} ⭐`;
  return player.age && player.age > 0 ? player.age : "N/A";
}

// Manual scout height wins over Elite height.
function formatHeight(player) {
  if (player.manualHeight) return `${player.manualHeight} ⭐`;
  if (player.heightImperial) return player.heightImperial;
  if (player.height) return `${player.height} cm`;
  return "N/A";
}

// Manual scout weight wins over Elite weight.
function formatWeight(player) {
  if (player.manualWeight) return `${player.manualWeight} ⭐`;
  if (player.weightImperial) return `${player.weightImperial} lb`;
  if (player.weight) return `${player.weight} kg`;
  return "N/A";
}

// Manual scout shoots/catches wins over Elite value.
function formatShoots(player) {
  if (player.manualShoots) return `${player.manualShoots} ⭐`;
  return player.shoots || player.catches || "N/A";
}

// Manual scout birth year wins over Elite value.
function formatBirthYear(player) {
  if (player.manualBirthYear) return `${player.manualBirthYear} ⭐`;
  return player.yearOfBirth || "N/A";
}

// Manual scout DOB wins over Elite value.
function formatDateOfBirth(player) {
  if (player.manualDateOfBirth) return `${player.manualDateOfBirth} ⭐`;
  return player.dateOfBirth || "N/A";
}

// Manual scout plus/minus wins over Elite value.
function formatPlusMinus(player) {
  if (player.manualPlusMinus) return `${player.manualPlusMinus} ⭐`;
  return player.plusMinus ?? "N/A";
}

// Manual scout jersey wins over Elite value.
function formatJersey(player) {
  if (player.manualJerseyNumber) return `${player.manualJerseyNumber} ⭐`;
  return player.jerseyNumber || "N/A";
}

// Measures how complete the profile is.
// Manual scout fields count as completed data.
function getDataQuality(player) {
  const qualityFields = [
    player.manualHeight || player.heightImperial || player.height,
    player.manualWeight || player.weightImperial || player.weight,
    player.manualShoots || player.shoots,
    player.manualBirthYear || player.yearOfBirth,
    player.manualDateOfBirth || player.dateOfBirth,
    player.manualAge || (player.age && player.age > 0),
    player.manualPlusMinus || player.plusMinus,
    player.manualJerseyNumber || player.jerseyNumber,
    player.manualNotes,
    player.enriched,
  ];

  const completed = qualityFields.filter(Boolean).length;

  return Math.round((completed / qualityFields.length) * 100);
}

// Converts the score into a scouting decision bucket.
function getDecision(score) {
  if (score >= 80) return "Invite Now";
  if (score >= 60) return "Watch Closely";
  if (score >= 40) return "Needs Data";
  return "Long Shot";
}

// Creates a simple human-readable scout recommendation.
function getScoutNote(player, score, ppg) {
  if (!player.enriched) return "Basic profile. Enrich before final ranking.";
  if (score >= 80) return "Strong invite signal. Move up the review board.";
  if (ppg >= 1) return "Strong production signal. Worth a deeper look.";
  if ((player.games ?? 0) === 0) return "Missing game sample. Needs more data.";
  return "Watch-list profile. Keep tracking.";
}

// Creates a gamified badge for quick scout feedback.
function getIntelBadge(player, score, ppg) {
  if (score >= 85) return "🏆 Priority Target";
  if (score >= 70 && ppg >= 1) return "💎 Hidden Gem";
  if (player.enriched) return "🔎 Intel Verified";
  if ((player.games ?? 0) === 0) return "🧩 Needs Sample";
  return "📈 Tracking";
}

// Lightweight XP value for the selected card.
function getCardXP(player, score, ppg) {
  let xp = 10;

  if (player.enriched) xp += 20;
  if (score >= 60) xp += 15;
  if (score >= 80) xp += 25;
  if (ppg >= 1) xp += 20;
  if ((player.games ?? 0) > 0) xp += 10;

  return xp;
}

// Keeps the manual form shape consistent everywhere.
function buildManualForm(player) {
  return {
    manualHeight: player?.manualHeight || "",
    manualWeight: player?.manualWeight || "",
    manualShoots: player?.manualShoots || "",
    manualBirthYear: player?.manualBirthYear || "",
    manualDateOfBirth: player?.manualDateOfBirth || "",
    manualAge: player?.manualAge || "",
    manualPlusMinus: player?.manualPlusMinus || "",
    manualJerseyNumber: player?.manualJerseyNumber || "",
    manualNotes: player?.manualNotes || "",
  };
}

function getScoreClass(score) {
  if (score >= 90) return "score-elite";
  if (score >= 80) return "score-great";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-watch";
  return "score-low";
}

function clampGauge(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getProductionGauge(ppg) {
  return clampGauge((ppg / 2) * 100);
}

function getXPLevel(cardXP) {
  if (cardXP >= 90) return "Franchise Watch";
  if (cardXP >= 70) return "Top Target";
  if (cardXP >= 50) return "Scout Follow";
  return "Developing File";
}

function ProspectCard({ player, getProspectScore }) {
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [savedManual, setSavedManual] = useState(null);
  const [manualForm, setManualForm] = useState(() => buildManualForm(player));

  if (!player) return null;

  // Use the latest parent player data, then overlay the latest saved manual data.
  // This lets the card update immediately after saving scout intel.
  const activePlayer = {
    ...player,
    ...(savedManual || {}),
  };

  const eliteId = activePlayer.eliteId || activePlayer.id;

  const score = getProspectScore(activePlayer);
  const ppg = Number(getPPG(activePlayer)) || 0;
  const decision = getDecision(score);
  const scoutNote = getScoutNote(activePlayer, score, ppg);
  const intelBadge = getIntelBadge(activePlayer, score, ppg);
  const cardXP = getCardXP(activePlayer, score, ppg);
  const dataQuality = getDataQuality(activePlayer);

  const scoreGauge = clampGauge(score);
  const productionGauge = getProductionGauge(ppg);
  const qualityGauge = clampGauge(dataQuality);
  const xpLevel = getXPLevel(cardXP);

  async function handleManualSave() {
    if (!eliteId) return;

    try {
      setManualSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/prospects/${eliteId}/manual`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(manualForm),
        },
      );

      if (!response.ok) {
        throw new Error("Manual scout update failed");
      }

      const data = await response.json();

      setSavedManual(data.prospect);
      setManualForm(buildManualForm(data.prospect));
      setManualFormOpen(false);
    } catch (error) {
      console.error("Unable to save manual scout data:", error);
    } finally {
      setManualSaving(false);
    }
  }

  return (
    <div className="prospect-card">
      <div className="prospect-card-top">
        <div>
          <p className="prospect-league">
            {activePlayer.league || "Unknown League"}
          </p>

          <h3>{activePlayer.name || "Unknown Player"}</h3>

          <p className="prospect-team">
            {activePlayer.team || "Unknown Team"} •{" "}
            {activePlayer.position || "N/A"}
          </p>

          <p className="prospect-team">
            {formatValue(activePlayer.nationality, "Nationality unavailable")} •
            Age {formatAge(activePlayer)}
          </p>
        </div>

        <div className={`prospect-score ${getScoreClass(score)}`}>
          <span>Score</span>
          <strong>{score}</strong>

          <button
            className="intel-button"
            type="button"
            onClick={() => setManualFormOpen((open) => !open)}
          >
            {manualFormOpen ? "Close Intel" : "Add Scout Intel ⭐"}
          </button>
        </div>
      </div>

      <div className="prospect-footer">
        <span className="status-pill">{decision}</span>

        <span className="upside-pill">
          {activePlayer.enriched ? "Enriched" : "Basic"} Profile
        </span>

        <span className="upside-pill">
          {ppg >= 1 ? "High Production" : "Developing"}
        </span>
      </div>

      <div className="prospect-stats">
        <div>
          <span>Intel Badge</span>
          <strong>{intelBadge}</strong>
        </div>

        <div>
          <span>Card XP</span>
          <strong>+{cardXP}</strong>
        </div>

        <div>
          <span>Data Quality</span>
          <strong>{dataQuality}%</strong>
        </div>

        <div>
          <span>Signal</span>
          <strong>{ppg >= 1 ? "Production" : "Tracking"}</strong>
        </div>

        <div>
          <span>Review Path</span>
          <strong>{decision}</strong>
        </div>
      </div>

      <div className="prospect-stats">
        <div>
          <span>GP</span>
          <strong>{activePlayer.games ?? 0}</strong>
        </div>

        <div>
          <span>G</span>
          <strong>{activePlayer.goals ?? 0}</strong>
        </div>

        <div>
          <span>A</span>
          <strong>{activePlayer.assists ?? 0}</strong>
        </div>

        <div>
          <span>PTS</span>
          <strong>{activePlayer.points ?? 0}</strong>
        </div>

        <div>
          <span>PPG</span>
          <strong>{getPPG(activePlayer)}</strong>
        </div>

        <div>
          <span>PIM</span>
          <strong>{activePlayer.pim ?? 0}</strong>
        </div>
      </div>

      <div className="prospect-stats">
        <div>
          <span>Height</span>
          <strong>{formatHeight(activePlayer)}</strong>
        </div>

        <div>
          <span>Weight</span>
          <strong>{formatWeight(activePlayer)}</strong>
        </div>

        <div>
          <span>Shoots</span>
          <strong>{formatShoots(activePlayer)}</strong>
        </div>

        <div>
          <span>Plus/Minus</span>
          <strong>{formatPlusMinus(activePlayer)}</strong>
        </div>
      </div>

      <div className="prospect-stats">
        <div>
          <span>Birthplace</span>
          <strong>{activePlayer.placeOfBirth || "N/A"}</strong>
        </div>

        <div>
          <span>Birth Year</span>
          <strong>{formatBirthYear(activePlayer)}</strong>
        </div>

        <div>
          <span>DOB</span>
          <strong>{formatDateOfBirth(activePlayer)}</strong>
        </div>

        <div>
          <span>Age</span>
          <strong>{formatAge(activePlayer)}</strong>
        </div>
      </div>

      <div className="prospect-stats">
        <div>
          <span>Season</span>
          <strong>{activePlayer.season || "N/A"}</strong>
        </div>

        <div>
          <span>League Level</span>
          <strong>{activePlayer.leagueLevel || "N/A"}</strong>
        </div>

        <div>
          <span>League Type</span>
          <strong>{activePlayer.leagueType || "N/A"}</strong>
        </div>

        <div>
          <span>Team Country</span>
          <strong>{activePlayer.teamCountry || "N/A"}</strong>
        </div>
      </div>

      <div className="prospect-stats">
        <div>
          <span>Game Status</span>
          <strong>{activePlayer.gameStatus || "N/A"}</strong>
        </div>

        <div>
          <span>Jersey</span>
          <strong>{formatJersey(activePlayer)}</strong>
        </div>

        <div>
          <span>Elite ID</span>
          <strong>{activePlayer.eliteId || activePlayer.id || "N/A"}</strong>
        </div>

        <div>
          <span>Source</span>
          <strong>
            {activePlayer.source === "elite_prospects" ? "Elite" : "CSV"}
          </strong>
        </div>
      </div>

      <div className="scout-note">
        <span>Scout Recommendation</span>
        <p>{scoutNote}</p>
      </div>

      {manualFormOpen && (
        <div className="scout-intel-panel">
          <span className="scout-intel-title">
            Optional Scout Intelligence ⭐
          </span>

          <div className="scout-intel-grid">
            <input
              className="scout-input"
              placeholder="Height, e.g. 6 ft 1 in"
              value={manualForm.manualHeight}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  manualHeight: event.target.value,
                }))
              }
            />

            <input
              className="scout-input"
              placeholder="Weight, e.g. 180 lb"
              value={manualForm.manualWeight}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  manualWeight: event.target.value,
                }))
              }
            />

            <input
              className="scout-input"
              placeholder="Shoots, e.g. Left"
              value={manualForm.manualShoots}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  manualShoots: event.target.value,
                }))
              }
            />
          </div>

          <div className="scout-intel-grid">
            <input
              className="scout-input"
              placeholder="Birth year, e.g. 2007"
              value={manualForm.manualBirthYear}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  manualBirthYear: event.target.value,
                }))
              }
            />

            <input
              className="scout-input"
              placeholder="DOB, e.g. 2007-04-12"
              value={manualForm.manualDateOfBirth}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  manualDateOfBirth: event.target.value,
                }))
              }
            />

            <input
              className="scout-input"
              placeholder="Age, e.g. 18"
              value={manualForm.manualAge}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  manualAge: event.target.value,
                }))
              }
            />
          </div>

          <div className="scout-intel-grid">
            <input
              className="scout-input"
              placeholder="Plus/minus, e.g. +8"
              value={manualForm.manualPlusMinus}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  manualPlusMinus: event.target.value,
                }))
              }
            />

            <input
              className="scout-input"
              placeholder="Jersey, e.g. 2"
              value={manualForm.manualJerseyNumber}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  manualJerseyNumber: event.target.value,
                }))
              }
            />
          </div>

          <textarea
            className="scout-textarea"
            placeholder="Optional scout notes..."
            value={manualForm.manualNotes}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                manualNotes: event.target.value,
              }))
            }
            rows={4}
          />

          <button
            className="scout-save-button"
            type="button"
            onClick={handleManualSave}
            disabled={manualSaving}
          >
            {manualSaving ? "Saving..." : "Save Scout Intel"}
          </button>
        </div>
      )}

      {activePlayer.manualNotes && (
        <div className="scout-note">
          <span>Scout Notes ⭐</span>
          <p>{activePlayer.manualNotes}</p>
        </div>
      )}

      <div className="prospect-footer">
        <span className="status-pill">{activePlayer.status || "Watch"}</span>

        <span className="upside-pill">
          {activePlayer.upside || "Medium"} Upside
        </span>
      </div>
      <div className="hockey-gauge-grid">
  <div className="hockey-gauge-card">
    <div
      className="radial-gauge"
      style={{ "--value": scoreGauge }}
    >
      <span>{scoreGauge}</span>
    </div>

    <strong>Draft Signal</strong>
    <small>{decision}</small>
  </div>

  <div className="hockey-gauge-card">
    <div
      className="radial-gauge"
      style={{ "--value": productionGauge }}
    >
      <span>{productionGauge}%</span>
    </div>

    <strong>Production</strong>
    <small>{getPPG(activePlayer)} PPG</small>
  </div>

  <div className="hockey-gauge-card">
    <div
      className="radial-gauge"
      style={{ "--value": qualityGauge }}
    >
      <span>{qualityGauge}%</span>
    </div>

    <strong>Intel Quality</strong>
    <small>{activePlayer.enriched ? "Verified file" : "Needs enrich"}</small>
  </div>

  <div className="hockey-gauge-card">
    <div
      className="radial-gauge"
      style={{ "--value": clampGauge(cardXP) }}
    >
      <span>{cardXP}</span>
    </div>

    <strong>Scout XP</strong>
    <small>{xpLevel}</small>
  </div>
</div>
    </div>
  );
}

export default ProspectCard;
