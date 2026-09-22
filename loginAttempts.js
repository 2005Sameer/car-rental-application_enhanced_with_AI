// Per-email brute-force lockout, independent of (and complementary to) the
// IP-based rate limiter on the auth routes: the rate limiter stops one IP
// hammering many accounts, this stops many IPs hammering one account.
// In-memory here; a real deployment should back this with Redis so it's
// shared across server instances and survives restarts.
const attempts = new Map(); // email -> { count, lockedUntil }

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;

function key(email) {
  return String(email || "").toLowerCase().trim();
}

export function isLocked(email) {
  const entry = attempts.get(key(email));
  if (!entry?.lockedUntil) return false;
  if (entry.lockedUntil < Date.now()) {
    attempts.delete(key(email));
    return false;
  }
  return true;
}

export function lockedForMs(email) {
  const entry = attempts.get(key(email));
  if (!entry?.lockedUntil) return 0;
  return Math.max(0, entry.lockedUntil - Date.now());
}

export function registerFailure(email) {
  const k = key(email);
  const now = Date.now();
  const entry = attempts.get(k) || { count: 0, firstAt: now };
  if (now - entry.firstAt > WINDOW_MS) {
    entry.count = 0;
    entry.firstAt = now;
  }
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MS;
  }
  attempts.set(k, entry);
}

export function registerSuccess(email) {
  attempts.delete(key(email));
}
