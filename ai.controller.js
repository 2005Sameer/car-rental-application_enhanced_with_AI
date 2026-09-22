import { chatWithAssistant, parseSearchQuery, generateBlurb, recommendCars, hasLLM } from "../services/ai.service.js";
import { CarsRepo, BookingsRepo } from "../data/store.js";

export async function chat(req, res, next) {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }
    const trimmed = messages.slice(-10).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000),
    }));
    const result = await chatWithAssistant(trimmed);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function search(req, res, next) {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "query string is required" });
    }
    const filters = await parseSearchQuery(query.slice(0, 300));
    res.json(filters);
  } catch (err) {
    next(err);
  }
}

export async function blurb(req, res, next) {
  try {
    const car = await CarsRepo.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Vehicle not found" });
    const text = await generateBlurb(car);
    res.json({ blurb: text });
  } catch (err) {
    next(err);
  }
}

export async function recommendations(req, res, next) {
  try {
    const pastBookings = req.user ? await BookingsRepo.listByUser(req.user.id) : [];
    const result = await recommendCars(pastBookings);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function status(req, res) {
  res.json({ llmEnabled: hasLLM() });
}
