import { useState } from "react";
import { getPPG } from "../lib/prospectScoring";
import { API_BASE_URL } from "../lib/apiConfig";
import { getCountryCode } from "../lib/countryFlags";

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

// Applies score-based styling classes.
function getScoreClass(score) {
  if (score >= 90) return "score-elite";
  if (score >= 80) return "score-great";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-watch";
  return "score-low";
}

// Converts score into the visual card tier class.
function getCardTier(score) {
  if (score >= 90) return "platinum";
  if (score >= 80) return "diamond";
  if (score >= 60) return "gold";
  if (score >= 40) return "silver";
  return "bronze";
}

// Converts score into a display ribbon.
function getTierLabel(score) {
  if (score >= 90) return "👑 Platinum Elite";
  if (score >= 80) return "💎 Diamond Target";
  if (score >= 60) return "🏅 Gold Prospect";
  if (score >= 40) return "🥈 Silver Watch";
  return "🥉 Bronze File";
}

// Keeps gauge values between 0 and 100.
function clampGauge(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

// Converts PPG into a gauge percentage.
// 2.00 PPG or higher becomes 100%.
function getProductionGauge(ppg) {
  return clampGauge((ppg / 2) * 100);
}

// Turns scout XP into a display label.
function getXPLevel(cardXP) {
  if (cardXP >= 90) return "Franchise Watch";
  if (cardXP >= 70) return "Top Target";
  if (cardXP >= 50) return "Scout Follow";
  return "Developing File";
}

// Converts compact position values into readable labels.
function getPositionLabel(position) {
  const pos = String(position || "").toUpperCase();

  if (pos === "D") return "🛡 DEFENSEMAN";
  if (pos === "G") return "🥅 GOALTENDER";
  return "🏒 FORWARD";
}

// Creates an in-app podcast brief using only known Mongo/player data.
// This gives Dave a useful talking-point card even when Google finds very little.
function getPodcastBrief(player, ppg, score, decision, intelBadge) {
  const position = player.position || "N/A";
  const team = player.team || "Unknown Team";
  const league = player.league || "Unknown League";
  const birthplace = player.placeOfBirth || player.nationality || "Unknown hometown";

  const knownForParts = [];

  if (formatHeight(player) !== "N/A") {
    knownForParts.push(formatHeight(player));
  }

  if (formatShoots(player) !== "N/A") {
    knownForParts.push(`${formatShoots(player).toLowerCase()} shot`);
  }

  if (position !== "N/A") {
    knownForParts.push(position);
  }

  const knownFor =
    knownForParts.length > 0
      ? `${knownForParts.join(" ")} with ${ppg} PPG.`
      : `Developing ${position} with ${ppg} PPG.`;

  const storyAngle = `${birthplace} prospect currently developing with ${team} in ${league}.`;

  const talkingPoints = [
    `Age: ${formatAge(player)}`,
    `Position: ${position}`,
    `Team: ${team}`,
    `League: ${league}`,
    `Birthplace: ${player.placeOfBirth || "N/A"}`,
    `Size: ${formatHeight(player)}, ${formatWeight(player)}`,
    `Shoots/Catches: ${formatShoots(player)}`,
    `Production: ${player.points ?? 0} points in ${player.games ?? 0} games`,
    `Prospect score: ${score}`,
    `Recommendation: ${decision}`,
    `Intel badge: ${intelBadge}`,
  ];

  return {
    knownFor,
    storyAngle,
    talkingPoints,
  };
}

function ProspectCard({ player, getProspectScore }) {
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [savedManual, setSavedManual] = useState(null);
  const [manualForm, setManualForm] = useState(() => buildManualForm(player));

  // Do not render the card if no player was provided.
  if (!player) return null;

  // Use the latest parent player data, then overlay the latest saved manual data.
  // This lets the card update immediately after saving scout intel.
  const activePlayer = {
    ...player,
    ...(savedManual || {}),
  };

  // Converts nationality name into a country code, then builds the FlagCDN image URL.
  // Example: Canada -> CA -> https://flagcdn.com/w40/ca.png
  const countryCode = getCountryCode(activePlayer.nationality);

  const flagUrl = countryCode
    ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
    : null;

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

  const cardTier = getCardTier(score);
  const tierLabel = getTierLabel(score);

  // Builds the podcast brief once per render from the active player data.
  const podcastBrief = getPodcastBrief(
    activePlayer,
    ppg,
    score,
    decision,
    intelBadge,
  );

  // Saves manual scout intelligence back to MongoDB.
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

      // Save returned prospect data locally so the UI updates immediately.
      setSavedManual(data.prospect);
      setManualForm(buildManualForm(data.prospect));
      setManualFormOpen(false);
    } catch (error) {
      console.error("Unable to save manual scout data:", error);
    } finally {
      setManualSaving(false);
    }
  }

  // Opens a targeted Google search for podcast research.
  // This is intentionally external for now; later it can become a Gemini/backend endpoint.
  function handleStoryFinder() {
    const query = encodeURIComponent(
      [
        `"${activePlayer.name}"`,
        "hockey",
        activePlayer.team,
        activePlayer.league,
        "(interview OR biography OR profile OR hometown OR family OR story)",
      ]
        .filter(Boolean)
        .join(" "),
    );

    window.open(
      `https://www.google.com/search?q=${query}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className={`prospect-card hockey-card ${cardTier}`}>
      <div className="hockey-card-inner">
        <div className="hockey-card-ribbon">{tierLabel}</div>

        <div className="prospect-position">
          {getPositionLabel(player.position)}
        </div>

       <div className="hockey-card-photo">
  {activePlayer.imageUrl?.length > 0 ? (
    <img
      src={activePlayer.imageUrl}
      alt={activePlayer.name || "Player"}
    />
  ) : (
    <div className="hockey-card-placeholder">🏒</div>
  )}
</div>

<div className="hockey-card-nameplate">
  <h3>{activePlayer.name || "Unknown Player"}</h3>

  <span>
    {activePlayer.team || "Unknown Team"} •{" "}
    {activePlayer.position || "N/A"}
  </span>

  <p>{activePlayer.league || "Unknown League"}</p>
</div>

<div className={`hockey-card-score ${getScoreClass(score)}`}>
  <span>Draft Signal</span>
  <strong>{score}</strong>
</div>

        <div className="hockey-card-meta">
          <span>
            {flagUrl && (
              <img
                src={flagUrl}
                alt={`${activePlayer.nationality} flag`}
                className="country-flag"
              />
            )}
            {formatValue(activePlayer.nationality, "N/A")}
          </span>

          <span>Age {formatAge(activePlayer)}</span>
          <span>{formatHeight(activePlayer)}</span>
          <span>{formatWeight(activePlayer)}</span>
        </div>

        <div className="hockey-card-stats">
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
        </div>

        <div className="hockey-card-badges">
          <span>{intelBadge}</span>
          <span>{decision}</span>
          <span>{activePlayer.enriched ? "Verified Intel" : "Basic File"}</span>
        </div>

        <div className="scout-note hockey-card-note">
          <span>Scout Recommendation</span>
          <p>{scoutNote}</p>
        </div>

        <button
          className="intel-button"
          type="button"
          onClick={() => setManualFormOpen((open) => !open)}
        >
          {manualFormOpen ? "Close Intel" : "Add Scout Intel ⭐"}
        </button>

        <button
          className="story-button"
          type="button"
          onClick={() => setBriefOpen((open) => !open)}
        >
          🎙 {briefOpen ? "Close Podcast Brief" : "Podcast Brief"}
        </button>

        <button
          className="story-button"
          type="button"
          onClick={handleStoryFinder}
        >
          🔍 Research Online
        </button>
      </div>

      {briefOpen && (
        <div className="podcast-brief-panel">
          <span className="podcast-brief-title">🎙 Podcast Brief</span>

          <h4>{activePlayer.name || "Unknown Player"}</h4>

          <p className="podcast-brief-subtitle">
            {activePlayer.position || "N/A"} •{" "}
            {activePlayer.team || "Unknown Team"} •{" "}
            {activePlayer.league || "Unknown League"}
          </p>

          <div className="podcast-brief-grid">
            <div>
              <span>Age</span>
              <strong>{formatAge(activePlayer)}</strong>
            </div>

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
              <span>Birthplace</span>
              <strong>{activePlayer.placeOfBirth || "N/A"}</strong>
            </div>

            <div>
              <span>Nationality</span>
              <strong>{activePlayer.nationality || "N/A"}</strong>
            </div>
          </div>

          <div className="podcast-brief-section">
            <strong>Known For</strong>
            <p>{podcastBrief.knownFor}</p>
          </div>

          <div className="podcast-brief-section">
            <strong>Story Angle</strong>
            <p>{podcastBrief.storyAngle}</p>
          </div>

          <div className="podcast-brief-section">
            <strong>Talking Points</strong>
            <ul>
              {podcastBrief.talkingPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <button
            className="story-button"
            type="button"
            onClick={handleStoryFinder}
          >
            🔍 Research Online
          </button>
        </div>
      )}

      <details className="hockey-card-details" open>
        <summary>Full Scouting File</summary>

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

        <div className="prospect-footer">
          <span className="status-pill">{activePlayer.status || "Watch"}</span>

          <span className="upside-pill">
            {activePlayer.upside || "Medium"} Upside
          </span>
        </div>

        <div className="hockey-gauge-grid">
          <div className="hockey-gauge-card">
            <div className="radial-gauge" style={{ "--value": scoreGauge }}>
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
            <div className="radial-gauge" style={{ "--value": qualityGauge }}>
              <span>{qualityGauge}%</span>
            </div>

            <strong>Intel Quality</strong>
            <small>
              {activePlayer.enriched ? "Verified Intel" : "Needs enrich"}
            </small>
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
      </details>

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
    </div>
  );
}

export default ProspectCard;