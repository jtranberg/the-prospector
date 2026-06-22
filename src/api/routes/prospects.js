/* eslint-disable no-undef */
import express from "express";
import fetch from "node-fetch";
import { getCache, setCache } from "../utils/cache.js";
import Prospect from "../models/Prospect.js";

const router = express.Router();

const ELITE_BASE_URL = "https://api.eliteprospects.com/v1";

console.log("✅ Prospect routes loaded: /stats registered before /:eliteId");

// Small pause helper so bulk sync does not hammer Elite's API.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Maps Elite player records into our clean Mongo/UI shape.
// Maps Elite player records into our clean Mongo/UI shape.
function mapElitePlayer(player) {
  const latestStats = player.latestStats || {};
  const stats = latestStats.regularStats || {};
  const team = latestStats.team || {};
  const league = latestStats.league || {};

  // Elite sometimes returns blank strings for unknown values.
  // This helper keeps Mongo cleaner by storing null instead of "" or fake values.
  function clean(value) {
    return value === "" || value === undefined ? null : value;
  }

  return {
    id: player.id,

    name:
      clean(player.name) ||
      `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
      "Unknown Player",

    team:
      clean(player.latestStats?.teamName) ||
      clean(player.latestStats?.team?.name) ||
      clean(player.latestTeam?.name) ||
      clean(player.team?.name) ||
      "Team unavailable",

    league:
      clean(player.latestStats?.leagueName) ||
      clean(player.latestStats?.league?.name) ||
      clean(player.latestLeague?.name) ||
      clean(player.league?.name) ||
      "League unavailable",

    position: clean(player.position) || player.detailedPosition?.[0] || "N/A",

    playerType: clean(player.playerType) || null,
    statusText: clean(player.status) || null,
    gameStatus: clean(player.gameStatus) || null,

    // Missing age should be null, not 0.
    age: clean(player.age) || null,
    yearOfBirth: clean(player.yearOfBirth) || null,
    dateOfBirth: clean(player.dateOfBirth) || null,

    nationality:
      clean(player.nationality?.name) || clean(player.nationality) || "Unknown",

    secondaryNationality:
      clean(player.secondaryNationality?.name) ||
      clean(player.secondaryNationality) ||
      null,

    placeOfBirth: clean(player.placeOfBirth) || null,

    // Missing shoots/catches should be null.
    // The UI can display N/A.
    shoots: clean(player.shoots) || clean(player.catches) || null,
    handednessLabel: clean(player.catches) ? "Catches" : "Shoots",

    height: clean(player.height?.metrics) || null,
    heightImperial: clean(player.height?.imperial) || null,
    weight: clean(player.weight?.metrics) || null,
    weightImperial: clean(player.weight?.imperial) || null,

    games: stats.GP ?? 0,
    goals: stats.G ?? 0,
    assists: stats.A ?? 0,
    points: stats.PTS ?? 0,
    pim: stats.PIM ?? 0,
    ppg: stats.PPG ?? null,
    plusMinus: stats.PM ?? null,

    season: clean(latestStats.season?.slug) || "N/A",
    jerseyNumber: clean(latestStats.jerseyNumber) || null,
    leagueLevel: clean(league.leagueLevel) || null,
    leagueType:
      clean(latestStats.leagueType) || clean(league.leagueType) || null,
    teamCountry: clean(team.country?.name) || null,

    imageUrl: clean(player.imageUrl) || null,

    eliteUrl:
      clean(player.links?.eliteprospectsUrl) ||
      clean(player._links?.eliteprospectsUrl) ||
      (player.eliteprospectsUrlPath
        ? `https://www.eliteprospects.com${player.eliteprospectsUrlPath}`
        : null),

    eliteUpdatedAt: clean(player.updatedAt) || null,

    status: "Watch",
    upside: "Medium",
    source: "elite_prospects",
  };
}
// Preserves our mapped fields plus the raw Elite payload.
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
    headers: { Accept: "application/json" },
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
          $set: prospect,
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



// GET /api/prospects/stats
// Dashboard database totals.
// IMPORTANT: This must stay above router.get("/:eliteId").
router.get("/stats", async (req, res) => {
  try {
    const total = await Prospect.countDocuments();

    const uniqueIds = (await Prospect.distinct("eliteId")).filter(
      Boolean,
    ).length;

    const enriched = await Prospect.countDocuments({
      enriched: true,
    });

    const countries = (await Prospect.distinct("nationality")).filter(
      Boolean,
    ).length;

    const duplicateGroups = await Prospect.aggregate([
      {
        $group: {
          _id: "$eliteId",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          _id: { $ne: null },
          count: { $gt: 1 },
        },
      },
      {
        $count: "duplicateCount",
      },
    ]);

    res.json({
      source: "mongo",
      total,
      uniqueIds,
      enriched,
      countries,
      duplicateCount: duplicateGroups[0]?.duplicateCount || 0,
    });
  } catch (error) {
    console.error("Prospect stats error:", error.message);

    res.status(500).json({
      error: "Stats unavailable",
      message: error.message,
    });
  }
});

router.get("/countries", async (req, res) => {
  try {
    const countries = await Prospect.aggregate([
      {
        $group: {
          _id: "$nationality",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      totalCountries: countries.length,
      countries,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to load countries",
      message: error.message,
    });
  }
});

// GET /api/prospects/status-summary
// Optional status breakdown endpoint.
router.get("/status-summary", async (req, res) => {
  try {
    const statuses = await Prospect.aggregate([
      {
        $group: {
          _id: "$statusText",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ statuses });
  } catch (error) {
    res.status(500).json({
      error: "Status summary unavailable",
      message: error.message,
    });
  }
});

// GET /api/prospects/stats/nationalities
// Returns all nationality values currently stored in Mongo.
// IMPORTANT: Must stay above router.get("/:eliteId").
router.get("/stats/nationalities", async (req, res) => {
  try {
    const nationalities = await Prospect.aggregate([
      {
        $match: {
          nationality: {
            $exists: true,
          },
        },
      },
      {
        $match: {
          nationality: {
            $ne: null,
          },
        },
      },
      {
        $match: {
          nationality: {
            $ne: "",
          },
        },
      },
      {
        $group: {
          _id: "$nationality",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.json({
      success: true,
      count: nationalities.length,
      nationalities: nationalities.map((item) => ({
        nationality: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    console.error("Nationality stats error:", error.message);

    res.status(500).json({
      error: "Nationality stats failed",
      message: error.message,
    });
  }
});

router.get("/stats/positions", async (req, res) => {
  try {
    const positions = await Prospect.aggregate([
      {
        $group: {
          _id: {
            $ifNull: ["$position", "Unknown"],
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      count: positions.length,
      positions: positions.map((item) => ({
        position: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "Position stats failed",
      message: error.message,
    });
  }
});

// POST /api/prospects/sync
// Manual one-page Mongo import.
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

// POST /api/prospects/sync-range
// Controlled importer for several pages.
router.post("/sync-range", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 100);
    const start = Number(req.query.start || 0);
    const pages = Number(req.query.pages || 1);
    const delayMs = Math.max(Number(req.query.delayMs || 7000), 6500);

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

      // Save total player count reported by Elite API
      if (result.total && !apiReportedTotal) {
        apiReportedTotal = result.total;
      }

      // Stop if no more players returned
      if (result.fetched === 0) {
        break;
      }

      // Respect API rate limits
      if (page < safePages - 1) {
        await sleep(delayMs);
      }
    }

    // Current database count AFTER sync completes
    const dbCount = await Prospect.countDocuments();

    const nextOffset = start + batches.length * safeLimit;

    const progressPercent = apiReportedTotal
      ? Number(((dbCount / apiReportedTotal) * 100).toFixed(2))
      : null;

    const remainingPlayers = apiReportedTotal
      ? Math.max(apiReportedTotal - dbCount, 0)
      : null;

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

      databaseCount: dbCount,
      progressPercent,
      remainingPlayers,

      nextOffset,

      recommendedCommand:
        `/api/prospects/sync-range?limit=${safeLimit}` +
        `&start=${nextOffset}` +
        `&pages=${safePages}` +
        `&delayMs=${delayMs}`,

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

// GET /api/prospects
// Mongo prospect list/search.
// GET /api/prospects
// Mongo prospect list/search.
router.get("/", async (req, res) => {
  try {
    const {
      q,
      league,
      team,
      position,
      sort = "points",
      limit = 50,
      page = 1,
    } = req.query;

    const filter = {};

    if (q && q.trim()) {
      const searchRegex = { $regex: q.trim(), $options: "i" };

      filter.$or = [
        { name: searchRegex },
        { nationality: searchRegex },
        { secondaryNationality: searchRegex },
        { team: searchRegex },
        { position: searchRegex },
        { league: searchRegex },
        { teamCountry: searchRegex },
        { placeOfBirth: searchRegex },
      ];
    }

    if (league) filter.league = league;
    if (team) filter.team = team;
    if (position) filter.position = position;

    const safeLimit = Math.min(Number(limit) || 50, 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    let sortOption = {
      points: -1,
      goals: -1,
      assists: -1,
      name: 1,
    };

    switch (sort) {
      case "goals":
        sortOption = {
          goals: -1,
          points: -1,
          name: 1,
        };
        break;

      case "assists":
        sortOption = {
          assists: -1,
          points: -1,
          name: 1,
        };
        break;

      case "ppg":
        sortOption = {
          ppg: -1,
          points: -1,
          name: 1,
        };
        break;

      case "age":
        sortOption = {
          age: -1,
          points: -1,
          name: 1,
        };
        break;

      case "name":
        sortOption = {
          name: 1,
        };
        break;

      case "recent":
        sortOption = {
          syncedAt: -1,
          name: 1,
        };
        break;

      case "points":
      default:
        sortOption = {
          points: -1,
          goals: -1,
          assists: -1,
          name: 1,
        };
        break;
    }

    console.log("Mongo prospect sort:", {
      sort,
      sortOption,
      page: safePage,
      limit: safeLimit,
    });

    const [players, total] = await Promise.all([
      Prospect.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Prospect.countDocuments(filter),
    ]);

    res.json({
      source: "mongo",
      count: players.length,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
      sort,
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
// GET /api/prospects/live
// Live Elite list. Costs Elite API calls unless cached.
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
        headers: { Accept: "application/json" },
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

// POST /api/prospects/enrich/:id
// Enriches one player and saves detail to Mongo.
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
        headers: { Accept: "application/json" },
      },
    );

    const rawText = await response.text();

    console.log("Elite enrich status:", response.status);

    if (!response.ok) {
      throw new Error(`Elite API error: ${response.status} ${rawText}`);
    }

    const data = JSON.parse(rawText);
    const rawPlayer = data?.data || data;
    console.log("=================================");
    console.log("ELITE DETAIL PLAYER");
    console.log("ID:", eliteId);
    console.log("TOP LEVEL KEYS:");
    console.log(Object.keys(rawPlayer || {}));

    console.log("HEIGHT:");
    console.dir(rawPlayer.height, { depth: 5 });

    console.log("WEIGHT:");
    console.dir(rawPlayer.weight, { depth: 5 });

    console.log("BIRTH:");
    console.log(rawPlayer.dateOfBirth);
    console.log(rawPlayer.yearOfBirth);

    console.log("SHOOTS:");
    console.log(rawPlayer.shoots);

    console.log("FULL PLAYER SAMPLE:");
    console.dir(rawPlayer, { depth: 4 });
    console.log("=================================");

    const prospect = normalizeProspectForMongo(rawPlayer);

    const saved = await Prospect.findOneAndUpdate(
      { eliteId: String(prospect.eliteId) },
      {
        $set: {
          ...prospect,

          // ScoutBoard enrichment metadata
          enriched: true,
          enrichedAt: new Date(),
          lastEliteSyncAt: new Date(),
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

// GET /api/prospects/live/:id
// Live Elite player detail. Does not read Mongo.
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
        headers: { Accept: "application/json" },
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

// GET /api/prospects/probe
// Debug helper for testing Elite API responses.
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
      headers: { Accept: "application/json" },
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

// PATCH /api/prospects/:eliteId/manual
// Saves scout-entered manual data into MongoDB.
// This does NOT update Elite Prospects.
// Manual fields are our app-level scouting intelligence layer.
router.patch("/:eliteId/manual", async (req, res) => {
  try {
    const { eliteId } = req.params;

    const {
      manualHeight,
      manualWeight,
      manualShoots,
      manualBirthYear,
      manualDateOfBirth,
      manualAge,
      manualPlusMinus,
      manualJerseyNumber,
      manualNotes,
    } = req.body;

    const updated = await Prospect.findOneAndUpdate(
      { eliteId: String(eliteId) },
      {
        $set: {
          manualHeight: manualHeight || null,
          manualWeight: manualWeight || null,
          manualShoots: manualShoots || null,
          manualBirthYear: manualBirthYear || null,
          manualDateOfBirth: manualDateOfBirth || null,
          manualAge: manualAge || null,
          manualPlusMinus: manualPlusMinus || null,
          manualJerseyNumber: manualJerseyNumber || null,
          manualNotes: manualNotes || null,
          manualUpdatedAt: new Date(),
        },
      },
      {
        new: true,
      },
    ).lean();

    if (!updated) {
      return res.status(404).json({
        error: "Prospect not found",
      });
    }

    res.json({
      success: true,
      source: "mongo",
      action: "manual_update",
      eliteId: String(eliteId),
      prospect: updated,
    });
  } catch (error) {
    console.error("Manual prospect update error:", error.message);

    res.status(500).json({
      error: "Manual update failed",
      message: error.message,
    });
  }
});

// GET /api/prospects/:eliteId
// Keep this LAST because it catches any single path segment.
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
