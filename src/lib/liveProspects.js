export async function loadLiveProspects() {
  const response = await fetch(
    "http://localhost:5050/api/prospects/live?limit=10"
  );

  if (!response.ok) {
    throw new Error("Live prospects unavailable");
  }

  const data = await response.json();

  console.log("LIVE PROSPECTS RESPONSE:", data);

  return data.players || [];
}

export async function loadLiveProspectById(id) {
  console.log("LOADING PLAYER ID:", id);

  const response = await fetch(
    `http://localhost:5050/api/prospects/live/${id}`
  );

  if (!response.ok) {
    throw new Error("Live prospect detail unavailable");
  }

  const data = await response.json();

  console.log("DETAIL RESPONSE:", data);

  return data.player || data;
}