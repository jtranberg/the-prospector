

export function getPPGValue(player) {
  const games = Number(player?.games || 0);
  const points = Number(player?.points || 0);

  if (games <= 0) return 0;

  return points / games;
}

export function getPPG(player) {
  return getPPGValue(player).toFixed(2);
}

export function getProspectScore(player) {
  const ppg = getPPGValue(player);

  const ageBonus = player.age <= 16 ? 20 : player.age === 17 ? 12 : 5;

  const upsideBonus =
    player.upside === "Elite" ? 25 :
    player.upside === "High" ? 15 :
    8;

  const positionBonus =
    player.position === "C" ? 8 :
    player.position === "D" ? 6 :
    player.position === "G" ? 5 :
    3;

  const penaltyRisk = player.pim > 35 ? 8 : 0;

  return Math.round(
    ppg * 40 +
    ageBonus +
    upsideBonus +
    positionBonus -
    penaltyRisk
  );
}

export function getProspectRank(score) {
  if (score >= 90) return "Diamond";
  if (score >= 75) return "Gold";
  if (score >= 60) return "Silver";
  return "Bronze";
}