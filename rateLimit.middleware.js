import rateLimit from "express-rate-limit";

// General throttle across the whole API — a backstop against scraping,
// runaway client bugs, or casual abuse. Specific routers layer stricter
// limits on top of this for endpoints that are more expensive or more
// security-sensitive (auth, AI calls).
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this network — please slow down and try again shortly." },
});

// Login/signup: the classic brute-force surface. Paired with the
// per-account lockout in utils/loginAttempts.js, which catches attackers
// spreading attempts across many IPs against a single account.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts from this network — try again in a few minutes." },
});

// AI endpoints proxy to a paid LLM API when a key is configured — this
// exists as much to protect the API bill as it does the app.
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI feature rate limit reached — try again shortly." },
});
