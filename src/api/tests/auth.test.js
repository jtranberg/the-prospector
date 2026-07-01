import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";

import app from "../app.js";
import User from "../models/User.js";
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

describe("Auth API", () => {
  it("registers a user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user.role).toBe("SCOUT");
    expect(response.body.token).toBeTruthy();
  });

  it("rejects duplicate email registration", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Another Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(409);

    expect(response.body.error).toBe("An account already exists for that email");
  });

  it("logs in a registered user", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(200);

    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.token).toBeTruthy();
  });

  it("rejects bad login password", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "WrongPassword123!",
      })
      .expect(401);

    expect(response.body.error).toBe("Invalid email or password");
  });

  it("gets current user with token", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registerResponse.body.token}`)
      .expect(200);

    expect(response.body.user.email).toBe("test@example.com");
  });

  it("changes password", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${registerResponse.body.token}`)
      .send({
        currentPassword: "Password123!",
        newPassword: "NewPassword123!",
      })
      .expect(200);

    await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "NewPassword123!",
      })
      .expect(200);
  });

  it("creates a forgot password reset token", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "test@example.com",
      })
      .expect(200);

    const user = await User.findOne({ email: "test@example.com" }).select(
      "+resetPasswordToken +resetPasswordExpires",
    );

    expect(user.resetPasswordToken).toBeTruthy();
    expect(user.resetPasswordExpires).toBeTruthy();
  });

  it("deletes private account data", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Scout",
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    await request(app)
      .delete("/api/auth/delete-my-data")
      .set("Authorization", `Bearer ${registerResponse.body.token}`)
      .expect(200);

    const deletedUser = await User.findOne({ email: "test@example.com" });

    expect(deletedUser).toBeNull();

    await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(401);
  });
});