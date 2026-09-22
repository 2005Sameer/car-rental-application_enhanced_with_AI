import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

// Revoked-token registry, keyed by the token's jti (JWT ID) claim. This is
// what makes "logout" actually invalidate a token server-side instead of
// just deleting it client-side — a stolen bearer token can otherwise be
// replayed until it naturally expires. In-memory here (fine for this data
// layer); a real deployment would back this with Redis (with a TTL equal
// to the token's remaining life) so it survives restarts and works across
// multiple server instances.
const revoked = new Map(); // jti -> expiry epoch seconds

setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of revoked) {
    if (exp < now) revoked.delete(jti);
  }
}, 60 * 60 * 1000).unref();

export function signToken(payload) {
  const jti = nanoid(16);
  return jwt.sign({ ...payload, jti }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function revokeToken(payload) {
  if (payload?.jti && payload?.exp) revoked.set(payload.jti, payload.exp);
}

export function isRevoked(payload) {
  return Boolean(payload?.jti && revoked.has(payload.jti));
}
