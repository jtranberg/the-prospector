export function getPPGValue(player) {
  const games = Number(player?.games || 0);
  const points = Number(player?.points || 0);

  if (games <= 0) return 0;

  return points / games;
}

export function getPPG(player) {
  return getPPGValue(player).toFixed(2);
}

// Scores the player while reducing tiny-sample noise.
// A 2.00 PPG player over 1 game should look interesting,
// but not outrank a strong player with a real sample.
export function getProspectScore(player) {
  const games = Number(player?.games || 0);
  const ppg = getPPGValue(player);

  const age = Number(player?.age || 99);

  const ageBonus = age <= 16 ? 20 : age === 17 ? 12 : 5;

  const upsideBonus =
    player.upside === "Elite" ? 25 :
    player.upside === "High" ? 15 :
    8;

  const positionBonus =
    player.position === "C" ? 8 :
    player.position === "D" ? 6 :
    player.position === "G" ? 5 :
    3;

  const penaltyRisk = Number(player?.pim || 0) > 35 ? 8 : 0;

  // Confidence increases as game sample grows.
  // 1 game = 25% confidence
  // 5 games = 45%
  // 10 games = 65%
  // 20+ games = full confidence
  const sampleConfidence =
    games >= 20 ? 1 :
    games >= 10 ? 0.65 :
    games >= 5 ? 0.45 :
    games >= 1 ? 0.25 :
    0;

  const productionScore = ppg * 40 * sampleConfidence;

  const rawScore =
    productionScore +
    ageBonus +
    upsideBonus +
    positionBonus -
    penaltyRisk;

  return Math.min(Math.round(rawScore), 100);
}

export function getProspectRank(score) {
  if (score >= 90) return "Diamond";
  if (score >= 75) return "Gold";
  if (score >= 60) return "Silver";
  return "Bronze";
}