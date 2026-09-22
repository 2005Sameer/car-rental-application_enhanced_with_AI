import { UsersRepo } from "../data/store.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken, revokeToken } from "../utils/jwt.js";
import { isLocked, lockedForMs, registerFailure, registerSuccess } from "../utils/loginAttempts.js";

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await UsersRepo.findByEmail(email);
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await hashPassword(password);
    const user = await UsersRepo.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash });
    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (isLocked(email)) {
      const minutes = Math.ceil(lockedForMs(email) / 60000);
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` });
    }

    const user = await UsersRepo.findByEmail(email);
    const valid = user ? await comparePassword(password, user.passwordHash) : false;

    if (!valid) {
      registerFailure(email);
      // Deliberately identical message whether the email doesn't exist or
      // the password is wrong — distinguishing the two lets an attacker
      // enumerate which emails have accounts.
      return res.status(401).json({ error: "Invalid email or password" });
    }

    registerSuccess(email);
    const token = signToken({ sub: user.id, role: user.role });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function logout(req, res) {
  revokeToken(req.tokenPayload);
  res.status(204).end();
}
