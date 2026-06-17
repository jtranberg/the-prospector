/* eslint-disable no-undef */
import express from "express";
import fetch from "node-fetch";
import { getCache, setCache } from "../utils/cache.js";
import Prospect from "../models/Prospect.js";

const router = express.Router();

const ELITE_BASE_URL = "https://api.eliteprospects.com/v1";

// Small pause helper so bulk sync does not hammer Elite's API.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Maps either a thin /players record or richer /players/:id record
// into the clean Mongo/UI shape we control.
function mapElitePlayer(player) {
  const latestStats = player.latestStats || {};
  const stats = latestStats.regularStats || {};
  const team = latestStats.team || {};
  const league = latestStats.league || {};

  return {
    id: player.id,

    name:
      player.name ||
      `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
      "Unknown Player",

    team:
      player.latestStats?.teamName ||
      player.latestStats?.team?.name ||
      player.latestTeam?.name ||
      player.team?.name ||
      "Team unavailable",

    league:
      player.latestStats?.leagueName ||
      player.latestStats?.league?.name ||
      player.latestLeague?.name ||
      player.league?.name ||
      "League unavailable",

    position: player.position || player.detailedPosition?.[0] || "N/A",

    playerType: player.playerType || "N/A",
    statusText: player.status || "N/A",
    gameStatus: player.gameStatus || "N/A",

    age: player.age || 0,
    yearOfBirth: player.yearOfBirth || null,
    dateOfBirth: player.dateOfBirth || null,

    nationality: player.nationality?.name || player.nationality || "Unknown",
    secondaryNationality: player.secondaryNationality?.name || null,
    placeOfBirth: player.placeOfBirth || null,

    shoots: player.shoots || player.catches || "N/A",
    handednessLabel: player.catches ? "Catches" : "Shoots",

    height: player.height?.metrics || null,
    heightImperial: player.height?.imperial || null,
    weight: player.weight?.metrics || null,
    weightImperial: player.weight?.imperial || null,

    games: stats.GP ?? 0,
    goals: stats.G ?? 0,
    assists: stats.A ?? 0,
    points: stats.PTS ?? 0,
    pim: stats.PIM ?? 0,
    ppg: stats.PPG ?? null,
    plusMinus: stats.PM ?? null,

    season: latestStats.season?.slug || "N/A",
    jerseyNumber: latestStats.jerseyNumber || null,
    leagueLevel: league.leagueLevel || null,
    leagueType: latestStats.leagueType || league.leagueType || null,
    teamCountry: team.country?.name || null,

    imageUrl: player.imageUrl || null,
    eliteUrl:
      player.links?.eliteprospectsUrl ||
      player._links?.eliteprospectsUrl ||
      null,
    updatedAt: player.updatedAt || null,

    status: "Watch",
    upside: "Medium",
    source: "elite_prospects",
  };
}

// Preserves both our clean mapped fields AND the full Elite payload.
// This is important while discovering what the API returns.
function normalizeProspectForMongo(player) {
  const mapped = mapElitePlayer(player);

  return {
    eliteId: String(mapped.id),
    ...mapped,

    rawElite: player,
    rawEliteKeys: Object.keys(player || {}),

    syncedAt: new Date(),
  };
}

// Shared helper for one Elite /players page.
// Used by both /sync and /sync-range.
async function syncElitePage({ limit, offset }) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    status: "active",
    apiKey: process.env.ELITE_PROSPECTS_API_KEY,
  });

  const url = `${ELITE_BASE_URL}/players?${query.toString()}`;

  console.log(
    "🔄 Syncing Elite prospects:",
    url.replace(process.env.ELITE_PROSPECTS_API_KEY, "***"),
  );

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const rawText = await response.text();

  console.log("Elite sync status:", response.status);

  if (!response.ok) {
    throw new Error(`Elite API error: ${response.status} ${rawText}`);
  }

  const data = JSON.parse(rawText);
  const rawPlayers = data?.data || data?.items || data?.players || [];

  const total =
    data?.total ||
    data?.meta?.total ||
    data?.pagination?.total ||
    data?.count ||
    null;

  const operations = rawPlayers.map((player) => {
    const prospect = normalizeProspectForMongo(player);

    return {
      updateOne: {
        filter: {
          eliteId: prospect.eliteId,
          enriched: { $ne: true },
        },
        update: {
          $setOnInsert: prospect,
          $set: {
            syncedAt: new Date(),
          },
        },
        upsert: true,
      },
    };
  });

  let result = null;

  if (operations.length) {
    result = await Prospect.bulkWrite(operations);
  }

  return {
    fetched: rawPlayers.length,
    upserted: result?.upsertedCount || 0,
    modified: result?.modifiedCount || 0,
    matched: result?.matchedCount || 0,
    total,
    limit: Number(limit),
    offset: Number(offset),
  };
}

// Manual one-page sync.
// Example: POST /api/prospects/sync?limit=100&offset=0
router.post("/sync", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 100);
    const offset = Number(req.query.offset || 0);

    const cacheKey = `elite-sync-${limit}-${offset}`;
    const cached = getCache(cacheKey);

    if (cached) {
      console.log("⚡ Sync skipped from cache:", cacheKey);
      return res.json(cached);
    }

    const result = await syncElitePage({ limit, offset });

    const payload = {
      success: true,
      source: "elite_prospects",
      ...result,
    };

    setCache(cacheKey, payload, 10 * 60 * 1000);

    res.json(payload);
  } catch (error) {
    console.error("Prospect sync error:", error.message);

    res.status(500).json({
      error: "Prospect sync failed",
      message: error.message,
    });
  }
});

// Controlled bulk importer.
// Example: POST /api/prospects/sync-range?limit=100&start=0&pages=5
// That imports 500 records using 5 Elite API calls.
router.post("/sync-range", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 100);
    const start = Number(req.query.start || 0);
    const pages = Number(req.query.pages || 1);
    const delayMs = Number(req.query.delayMs || 7000);

    // Safety rails for the Explorer plan.
    // Keeps us from accidentally burning the monthly quota.
    const safeLimit = Math.min(limit, 100);
    const safePages = Math.min(pages, 10);

    const batches = [];
    let totalFetched = 0;
    let totalUpserted = 0;
    let totalModified = 0;
    let totalMatched = 0;
    let apiReportedTotal = null;

    for (let page = 0; page < safePages; page += 1) {
      const offset = start + page * safeLimit;

      const result = await syncElitePage({
        limit: safeLimit,
        offset,
      });

      batches.push(result);

      totalFetched += result.fetched;
      totalUpserted += result.upserted;
      totalModified += result.modified;
      totalMatched += result.matched;

      if (result.total && !apiReportedTotal) {
        apiReportedTotal = result.total;
      }

      // Stop early if Elite returns an empty page.
      if (result.fetched === 0) {
        break;
      }

      // Delay between calls to respect 10 requests/minute.
      if (page < safePages - 1) {
        await sleep(delayMs);
      }
    }

    res.json({
      success: true,
      source: "elite_prospects",
      action: "sync_range",
      start,
      limit: safeLimit,
      requestedPages: pages,
      processedPages: batches.length,
      delayMs,
      totalFetched,
      totalUpserted,
      totalModified,
      totalMatched,
      apiReportedTotal,
      nextOffset: start + batches.length * safeLimit,
      batches,
    });
  } catch (error) {
    console.error("Prospect sync range error:", error.message);

    res.status(500).json({
      error: "Prospect sync range failed",
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { q, league, team, position, limit = 50, page = 1 } = req.query;

    const filter = {};

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    if (league) filter.league = league;
    if (team) filter.team = team;
    if (position) filter.position = position;

    const safeLimit = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * safeLimit;

    const [players, total] = await Promise.all([
      Prospect.find(filter)
        .sort({ points: -1, goals: -1, assists: -1, name: 1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Prospect.countDocuments(filter),
    ]);

    res.json({
      source: "mongo",
      count: players.length,
      total,
      page: Number(page),
      limit: safeLimit,
      players,
    });
  } catch (error) {
    console.error("Mongo prospects error:", error.message);

    res.status(500).json({
      error: "Prospects unavailable",
      message: error.message,
      players: [],
    });
  }
});

router.get("/live", async (req, res) => {
  try {
    const limit = req.query.limit || 25;

    const cacheKey = `live-prospects-active-2007-${limit}`;
    const cached = getCache(cacheKey);

    if (cached) {
      console.log("⚡ Serving live prospects from cache:", cacheKey);
      return res.json(cached);
    }

    console.log("🔍 Cache miss - calling Elite:", cacheKey);

    const response = await fetch(
      `${ELITE_BASE_URL}/players?limit=${limit}&status=active&yearOfBirth=2007&apiKey=${process.env.ELITE_PROSPECTS_API_KEY}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const rawText = await response.text();

    console.log("Elite status:", response.status);

    if (!response.ok) {
      throw new Error(`Elite API error: ${response.status} ${rawText}`);
    }

    const data = JSON.parse(rawText);
    const rawPlayers = data?.data || data?.items || data?.players || [];
    const players = rawPlayers.map(mapElitePlayer);

    const payload = {
      source: "elite_prospects",
      count: players.length,
      players,
    };

    setCache(cacheKey, payload, 60 * 60 * 1000);

    res.json(payload);
  } catch (error) {
    console.error("Live prospects error:", error.message);

    res.status(500).json({
      error: "Unable to load live prospects",
      message: error.message,
      players: [],
    });
  }
});

// Enrich one selected player with /players/:id detail data.
// This intentionally costs one Elite call per selected player.
router.post("/enrich/:id", async (req, res) => {
  try {
    const eliteId = req.params.id;

    const cacheKey = `elite-enrich-${eliteId}`;
    const cached = getCache(cacheKey);

    if (cached) {
      console.log("⚡ Enrich skipped from cache:", cacheKey);
      return res.json(cached);
    }

    console.log(`🔎 Enriching Elite player ${eliteId}`);

    const response = await fetch(
      `${ELITE_BASE_URL}/players/${eliteId}?apiKey=${process.env.ELITE_PROSPECTS_API_KEY}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const rawText = await response.text();

    console.log("Elite enrich status:", response.status);

    if (!response.ok) {
      throw new Error(`Elite API error: ${response.status} ${rawText}`);
    }

    const data = JSON.parse(rawText);
    const rawPlayer = data?.data || data;

    const prospect = normalizeProspectForMongo(rawPlayer);

    const saved = await Prospect.findOneAndUpdate(
      { eliteId: String(prospect.eliteId) },
      {
        $set: {
          ...prospect,
          enrichedAt: new Date(),
          enriched: true,
        },
      },
      {
        upsert: true,
        new: true,
      },
    ).lean();

    const payload = {
      success: true,
      source: "elite_prospects",
      action: "enriched",
      eliteId: String(eliteId),
      name: saved.name,
      team: saved.team,
      league: saved.league,
      games: saved.games,
      goals: saved.goals,
      assists: saved.assists,
      points: saved.points,
      enriched: saved.enriched,
      enrichedAt: saved.enrichedAt,
    };

    setCache(cacheKey, payload, 60 * 60 * 1000);

    res.json(payload);
  } catch (error) {
    console.error("Prospect enrich error:", error.message);

    res.status(500).json({
      error: "Prospect enrich failed",
      message: error.message,
    });
  }
});

router.get("/live/:id", async (req, res) => {
  try {
    const cacheKey = `live-player-${req.params.id}`;
    const cached = getCache(cacheKey);

    if (cached) {
      console.log(`⚡ Serving player ${req.params.id} from cache`);
      return res.json(cached);
    }

    console.log(`🔍 Cache miss - calling Elite for player ${req.params.id}`);

    const response = await fetch(
      `${ELITE_BASE_URL}/players/${req.params.id}?apiKey=${process.env.ELITE_PROSPECTS_API_KEY}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Elite API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("PLAYER DETAIL KEYS:", Object.keys(data?.data || data));

    const player = mapElitePlayer(data?.data || data);

    setCache(cacheKey, player, 24 * 60 * 60 * 1000);

    res.json(player);
  } catch (error) {
    console.error("Live player detail error:", error.message);

    res.status(500).json({
      error: "Live player detail unavailable",
    });
  }
});

router.get("/probe", async (req, res) => {
  try {
    const query = new URLSearchParams({
      ...req.query,
      apiKey: process.env.ELITE_PROSPECTS_API_KEY,
    });

    const url = `${ELITE_BASE_URL}/players?${query.toString()}`;

    console.log(
      "🔎 Probe URL:",
      url.replace(process.env.ELITE_PROSPECTS_API_KEY, "***"),
    );

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    res.json({
      status: response.status,
      keys: Object.keys(data?.data?.[0] || data?.data || data),
      sample: data?.data?.slice?.(0, 3) || data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/:eliteId", async (req, res) => {
  try {
    const player = await Prospect.findOne({
      eliteId: String(req.params.eliteId),
    }).lean();

    if (!player) {
      return res.status(404).json({
        error: "Prospect not found",
      });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
export default router;
