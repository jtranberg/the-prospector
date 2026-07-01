import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";

import app from "../app.js";
import {
  connectTestDb,
  clearTestDb,
  disconnectTestDb,
} from "./testDb.js";

beforeAll(async () => {
  await connectTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

describe("Auth API edge cases", () => {
  it("rejects /me without token", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });

  it("rejects change password without token", async () => {
    await request(app)
      .post("/api/auth/change-password")
      .send({
        currentPassword: "Password123!",
        newPassword: "NewPassword123!",
      })
      .expect(401);
  });

  it("rejects delete my data without token", async () => {
    await request(app).delete("/api/auth/delete-my-data").expect(401);
  });

  it("rejects reset password with bad token", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: "bad-token",
        newPassword: "NewPassword123!",
      })
      .expect(400);

    expect(response.body.error).toBe(
      "Password reset link is invalid or has expired",
    );
  });

  it("rejects reset password with short password", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: "bad-token",
        newPassword: "short",
      })
      .expect(400);

    expect(response.body.error).toBe(
      "New password must be at least 8 characters",
    );
  });

  it("does not reveal unknown forgot-password email", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "unknown@example.com",
      })
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.message).toBe(
      "If an account exists for that email, password reset instructions have been sent.",
    );
  });
});