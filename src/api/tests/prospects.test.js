import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";

import app from "../app.js";
import Prospect from "../models/Prospect.js";
import {
  connectTestDb,
  clearTestDb,
  disconnectTestDb,
} from "./testDb.js";

function getList(body) {
  return body.prospects || body.players || body.results || body.data || [];
}

beforeAll(async () => {
  await connectTestDb();
});

beforeEach(async () => {
  await clearTestDb();

  await Prospect.create([
    {
      eliteId: "1001",
      id: 1001,
      name: "Connor Test",
      nationality: "Canada",
      position: "F",
      league: "BCHL",
      season: "2025-2026",
      goals: 20,
      assists: 30,
      points: 50,
      source: "test",
    },
    {
      eliteId: "1002",
      id: 1002,
      name: "Lukas Sample",
      nationality: "Sweden",
      position: "D",
      league: "J20 Nationell",
      season: "2025-2026",
      goals: 5,
      assists: 25,
      points: 30,
      source: "test",
    },
    {
      eliteId: "1003",
      id: 1003,
      name: "Mason Goalie",
      nationality: "USA",
      position: "G",
      league: "USHL",
      season: "2025-2026",
      goals: 0,
      assists: 2,
      points: 2,
      source: "test",
    },
  ]);
});

afterAll(async () => {
  await disconnectTestDb();
});

describe("Prospects API", () => {
  it("returns prospects from the database", async () => {
    const response = await request(app)
      .get("/api/prospects?limit=10&page=1")
      .expect(200);

    const results = getList(response.body);

    expect(results.length).toBe(3);
  });

  it("searches prospects by name", async () => {
    const response = await request(app)
      .get("/api/prospects/search?q=Connor&limit=10&page=1")
      .expect(200);

    const results = getList(response.body);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe("Connor Test");
  });

  it("searches prospects by nationality", async () => {
    const response = await request(app)
      .get("/api/prospects/search?q=Canada&limit=10&page=1")
      .expect(200);

    const results = getList(response.body);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nationality).toBe("Canada");
  });

  it("searches prospects by elite id", async () => {
    const response = await request(app)
      .get("/api/prospects/search?q=1002&limit=10&page=1")
      .expect(200);

    const results = getList(response.body);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].eliteId).toBe("1002");
  });

  it("filters prospects by position", async () => {
    const response = await request(app)
      .get("/api/prospects?position=G&limit=10&page=1")
      .expect(200);

    const results = getList(response.body);

    expect(results.length).toBe(1);
    expect(results[0].position).toBe("G");
  });

  it("returns stats", async () => {
    const response = await request(app)
      .get("/api/prospects/stats")
      .expect(200);

    expect(response.body.total).toBe(3);
  });
});