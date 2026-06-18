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

export async function loadProspectById(id) {
  const response = await fetch(
    `${API_BASE}/api/prospects/${id}`
  );

  if (!response.ok) {
    throw new Error("Mongo prospect detail unavailable");
  }

  const data = await response.json();

  console.log("MONGO DETAIL RESPONSE:", data);

  return data;
}

export async function searchProspects(query, limit = 100, page = 1) {
  const response = await fetch(
    `${API_BASE}/api/prospects?q=${encodeURIComponent(
      query,
    )}&limit=${limit}&page=${page}`,
  );

  if (!response.ok) throw new Error("Prospect search unavailable");

  const data = await response.json();

  return {
    players: data.players || [],
    total: data.total || 0,
    page: data.page || page,
    limit: data.limit || limit,
  };
}

export async function enrichProspectById(id) {
  const response = await fetch(`${API_BASE}/api/prospects/enrich/${id}`, {
    method: "POST",
  });

  if (!response.ok) throw new Error("Prospect enrich unavailable");

  return await response.json();
}

export async function loadProspectStats() {
  const url = `${API_BASE}/api/prospects/stats`;

  console.log("LOADING PROSPECT STATS FROM:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();

    console.error("STATS REQUEST FAILED:", {
      url,
      status: response.status,
      body: text,
    });

    throw new Error("Stats unavailable");
  }

  const data = await response.json();

  console.log("STATS RESPONSE:", data);

  return data;
}