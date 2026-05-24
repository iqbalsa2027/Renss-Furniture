import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/error-handler.js";
import { registerRoutes } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve(__dirname, "../uploads");

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use("/uploads", express.static(uploadsPath));

  registerRoutes(app);
  app.use(errorHandler);

  return app;
}
