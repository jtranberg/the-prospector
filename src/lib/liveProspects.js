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

export async function searchProspects(q, limit = 100, page = 1, sort = "name") {
  const cleanQ = String(q || "").trim();

  const params = new URLSearchParams({
    q: cleanQ,
    limit: String(limit),
    page: String(page),
    sort,
  });

  const url = `${API_BASE}/api/prospects/search?${params.toString()}`;

  console.log("SEARCH TERM:", cleanQ);
  console.log("SEARCH URL:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();

    console.error("SEARCH REQUEST FAILED:", {
      url,
      status: response.status,
      body: text,
    });

    throw new Error("Search unavailable");
  }

  const data = await response.json();

  console.log("SEARCH RESPONSE:", data);

  return data;
}

export async function loadProspectPage({
  page = 1,
  limit = 50,
  sort = "points",
} = {}) {
  const url = `${API_BASE}/api/prospects?page=${page}&limit=${limit}&sort=${sort}`;

  console.log("LOADING PROSPECT PAGE FROM:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();

    console.error("PROSPECT PAGE REQUEST FAILED:", {
      url,
      status: response.status,
      body: text,
    });

    throw new Error("Prospect page unavailable");
  }

  const data = await response.json();

  console.log("MONGO PROSPECT PAGE RESPONSE:", data);

  return data;
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

export async function loadNationalityStats() {
  const url = `${API_BASE}/api/prospects/stats/nationalities`;

  console.log("LOADING NATIONALITY STATS FROM:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();

    console.error("NATIONALITY STATS REQUEST FAILED:", {
      url,
      status: response.status,
      body: text,
    });

    throw new Error("Nationality stats unavailable");
  }

  const data = await response.json();

  console.log("NATIONALITY STATS RESPONSE:", data);

  return data.nationalities || [];
}

export async function loadPositionStats() {
  const url = `${API_BASE}/api/prospects/stats/positions`;

  console.log("LOADING POSITION STATS FROM:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();

    console.error("POSITION STATS REQUEST FAILED:", {
      url,
      status: response.status,
      body: text,
    });

    throw new Error("Position stats unavailable");
  }

  const data = await response.json();

  console.log("POSITION STATS RESPONSE:", data);

  return data.positions || [];
}