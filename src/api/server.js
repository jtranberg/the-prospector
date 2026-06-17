/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import prospectsRoutes from "./routes/prospects.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://the-prospector.netlify.app",
    ],
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Little Prospector API",
  });
});

app.use("/api/prospects", prospectsRoutes);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(
        `🚀 Little Prospector API running on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error);
    process.exit(1);
  }
}

startServer();