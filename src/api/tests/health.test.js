import request from "supertest";
import { describe, it, expect } from "vitest";

import app from "../app.js";

describe("Health check", () => {
  it("returns API health status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.service).toBe("The Prospector API");
  });
});