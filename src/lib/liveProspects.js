const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

export async function loadProspects(limit = 100, page = 1) {
  const response = await fetch(
    `${API_BASE}/api/prospects?limit=${limit}&page=${page}`
  );

  if (!response.ok) {
    throw new Error("Mongo prospects unavailable");
  }

  const data = await response.json();

  console.log("MONGO PROSPECTS RESPONSE:", data);

  return data.players || [];
}