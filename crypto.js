// AES-256-GCM field-level encryption for sensitive freeform text stored in
// the data layer (currently: booking messages). This is encryption AT
// REST for application data — it's separate from, and doesn't replace,
// TLS/HTTPS for encryption IN TRANSIT, which has to terminate at a reverse
// proxy or hosting platform in front of this server (see README).
import crypto from "crypto";

const ALGO = "aes-256-gcm";

function getKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "insecure-dev-fallback-key";
  // Always derive a 32-byte key regardless of the raw secret's length/format,
  // so ENCRYPTION_KEY can be any passphrase or a proper hex key.
  return crypto.createHash("sha256").update(String(secret)).digest();
}

export function encryptText(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptText(payload) {
  if (typeof payload !== "string" || payload.split(":").length !== 3) return payload;
  try {
    const [ivHex, tagHex, dataHex] = payload.split(":");
    const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return "[unable to decrypt message]";
  }
}
