import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import carsRoutes from "./routes/cars.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import { seedAdmin } from "./data/store.js";
import { hashPassword } from "./utils/password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fail fast on missing/weak secrets instead of silently signing tokens
// with `undefined` or leaving message encryption on an insecure fallback.
function assertEnv() {
  if (!process.env.JWT_SECRET) {
    console.error("Missing required environment variable JWT_SECRET. Copy .env.example to .env and set it (a long random string).");
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.warn("⚠️  JWT_SECRET is shorter than 32 characters — use a longer random value in production (e.g. `openssl rand -hex 32`).");
  }
  if (!process.env.ENCRYPTION_KEY) {
    console.warn("⚠️  ENCRYPTION_KEY not set — booking-message encryption is falling back to JWT_SECRET. Set a separate ENCRYPTION_KEY in production.");
  }
}

const app = express();

app.set("trust proxy", 1); // correct client IPs behind a reverse proxy, so rate limiting keys on the real caller

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "100kb" })); // small cap — this API has no legitimate reason to receive huge JSON bodies
app.use(morgan("dev"));
app.use("/api", apiLimiter);

// Uploaded car photos — served from disk, e.g. /uploads/cars/<file>.jpg.
// Explicitly relaxed CORP so the client (a different origin without the
// Vite dev proxy, e.g. a production build served elsewhere) can still load
// these images; helmet's default is same-origin.
app.use(
  "/uploads",
  (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../uploads"))
);

app.get("/api/health", (req, res) => res.json({ ok: true, service: "car-rental-server" }));

app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/owner", ownerRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
  assertEnv();

  const passwordHash = await hashPassword("admin1234");
  await seedAdmin({ name: "Fleet Admin", email: "admin@ridgeline.dev", passwordHash });

  app.listen(PORT, () => {
    console.log(`car-rental-server listening on http://localhost:${PORT}`);
    console.log(`seeded admin login -> admin@ridgeline.dev / admin1234`);
  });
}

start();
