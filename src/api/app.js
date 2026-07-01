import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});
import express from "express";
import cors from "cors";

import prospectsRoutes from "./routes/prospects.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://the-prospector.netlify.app"],
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "The Prospector API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/prospects", prospectsRoutes);

app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/prospects", prospectsRoutes);

app.use(errorHandler);

export default app;