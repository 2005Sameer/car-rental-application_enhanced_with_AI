import { Router } from "express";
import { signup, login, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { validateBody, rules } from "../middleware/validate.js";

const router = Router();

router.post(
  "/signup",
  authLimiter,
  validateBody({
    name: [rules.required("Name"), rules.isString("Name", { min: 2, max: 80 })],
    email: [rules.required("Email"), rules.isEmail()],
    password: [rules.required("Password"), rules.isString("Password", { min: 10, max: 128 }), rules.isStrongPassword()],
  }),
  signup
);

router.post(
  "/login",
  authLimiter,
  validateBody({
    email: [rules.required("Email"), rules.isEmail()],
    password: [rules.required("Password")],
  }),
  login
);

router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);

export default router;
