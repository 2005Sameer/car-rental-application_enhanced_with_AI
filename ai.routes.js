import { Router } from "express";
import { attachUserIfPresent } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";
import { chat, search, blurb, recommendations, status } from "../controllers/ai.controller.js";

const router = Router();

router.use(aiLimiter);
router.get("/status", status);
router.post("/chat", attachUserIfPresent, chat);
router.post("/search", search);
router.get("/blurb/:id", blurb);
router.get("/recommendations", attachUserIfPresent, recommendations);

export default router;
