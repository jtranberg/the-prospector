export function getProspectBadges(player, score) {
  const badges = [];

  if (score >= 85) badges.push("Hidden Gem");
  if (player.age <= 16) badges.push("Young Upside");
  if (player.points / player.games >= 1) badges.push("Point Producer");
  if (player.position === "C") badges.push("Center Ice Value");
  if (player.pim > 35) badges.push("High Edge / Risk");

  return badges;
}

export function getScoutXP(prospects = []) {
  return prospects.length * 10;
}

export function getScoutLevel(xp) {
  if (xp >= 500) return "Chief Scout";
  if (xp >= 250) return "Regional Scout";
  if (xp >= 100) return "Rookie Scout";
  return "Prospector";
}