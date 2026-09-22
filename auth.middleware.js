import { verifyToken, isRevoked } from "../utils/jwt.js";
import { UsersRepo } from "../data/store.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    const payload = verifyToken(token);
    if (isRevoked(payload)) return res.status(401).json({ error: "Session has been logged out" });
    const user = await UsersRepo.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid session" });
    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Attaches req.user if a valid token is present, but never rejects the
// request — for endpoints that behave differently for guests vs. logged-in
// users (e.g. AI chat, recommendations) without requiring a login.
export async function attachUserIfPresent(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    if (isRevoked(payload)) return next();
    const user = await UsersRepo.findById(payload.sub);
    if (user) {
      req.user = user;
      req.tokenPayload = payload;
    }
  } catch {
    // Invalid/expired token on an optional-auth route — proceed as guest.
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
