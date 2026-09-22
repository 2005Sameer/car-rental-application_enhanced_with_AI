// Central AI layer. Every exported function tries the real Anthropic API
// first (if ANTHROPIC_API_KEY is set) and falls back to a deterministic,
// rule-based implementation otherwise — so the app is fully usable with
// zero external dependencies, and gets smarter the moment a key is added.
import { CarsRepo } from "../data/store.js";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

const blurbCache = new Map();

function hasLLM() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function callClaude({ system, messages, maxTokens = 500 }) {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const textBlock = (data.content || []).find(b => b.type === "text");
  return textBlock ? textBlock.text : "";
}

function catalogSummary(cars) {
  return cars
    .filter(c => c.status === "available")
    .map(c => `${c.name} — ${c.type}, ${c.seats} seats, ${c.rangeLabel}, ${c.location}, $${c.price}/day`)
    .join("\n");
}

/* ------------------------------- CHAT ------------------------------- */

const CHAT_SYSTEM = (cars) => `You are Riley, the friendly booking assistant for Ridgeline Rentals, a car rental company with three hubs: Downtown Hub, Airport North, and Central Station.

Current available fleet:
${catalogSummary(cars)}

Help customers pick a car, explain pricing (day rate + extras: damage waiver $12/day, navigation $5/day, child seat $7/day, plus 8% tax), and answer questions about locations and policies. Only recommend cars that are actually in the fleet list above. Keep replies short — 2-4 sentences, conversational, no markdown headers or bullet spam.`;

function localChatFallback(userMessage, cars) {
  const msg = userMessage.toLowerCase();
  const available = cars.filter(c => c.status === "available");

  if (/hi|hello|hey/.test(msg) && msg.length < 20) {
    return "Hey! I'm Riley from Ridgeline Rentals. Tell me what you're looking for — vehicle type, budget, or which hub works for you — and I'll point you to a good fit.";
  }
  if (/electric|ev\b/.test(msg)) {
    const evs = available.filter(c => c.type === "Electric");
    return evs.length
      ? `We've got ${evs.map(c => `the ${c.name} (${c.rangeLabel} range, $${c.price}/day at ${c.location})`).join(" and ")} available right now.`
      : "We're out of electric vehicles at the moment — check back soon, or I can suggest a fuel-efficient sedan instead.";
  }
  if (/suv|family|seven|7 seat/.test(msg)) {
    const suvs = available.filter(c => c.type === "SUV");
    return suvs.length
      ? `For families, ${suvs.map(c => `the ${c.name} (${c.seats} seats, $${c.price}/day)`).join(" or ")} would work well.`
      : "No SUVs available right now — the Basin Ridge usually covers that slot, worth checking back later.";
  }
  if (/cheap|budget|afford|under \$?\d+/.test(msg)) {
    const cheapest = [...available].sort((a, b) => a.price - b.price).slice(0, 2);
    return cheapest.length
      ? `Best value right now: ${cheapest.map(c => `the ${c.name} at $${c.price}/day`).join(" and ")}.`
      : "Let me know your budget and I'll find the closest match.";
  }
  if (/extra|insurance|gps|child|seat/.test(msg)) {
    return "You can add a damage waiver ($12/day), a navigation unit ($5/day), or a child seat ($7/day) at checkout — pick whichever you need, nothing is bundled by default.";
  }
  if (/location|hub|where/.test(msg)) {
    return "We operate out of three hubs: Downtown Hub, Airport North, and Central Station. Pick whichever's closest when you search — the fleet differs slightly by location.";
  }
  return "Tell me a bit more — a vehicle type (SUV, sedan, electric, sports, compact), a budget, or a pickup location — and I'll match you to a car from our live fleet.";
}

export async function chatWithAssistant(history) {
  const cars = await CarsRepo.list({});
  const lastUserMessage = [...history].reverse().find(m => m.role === "user")?.content || "";

  if (hasLLM()) {
    try {
      const reply = await callClaude({
        system: CHAT_SYSTEM(cars),
        messages: history.map(m => ({ role: m.role, content: m.content })),
        maxTokens: 300,
      });
      if (reply) return { reply, source: "llm" };
    } catch (err) {
      console.error("[ai.service] chat LLM call failed, using fallback:", err.message);
    }
  }
  return { reply: localChatFallback(lastUserMessage, cars), source: "fallback" };
}

/* --------------------------- NL SEARCH PARSE --------------------------- */

const TYPES = ["Sedan", "SUV", "Sports", "Electric", "Compact"];
const LOCATIONS = ["Downtown Hub", "Airport North", "Central Station"];

function localParseSearch(text) {
  const lower = text.toLowerCase();
  const type = TYPES.find(t => lower.includes(t.toLowerCase()))
    || (lower.includes("ev") ? "Electric" : null);

  let location = LOCATIONS.find(l => lower.includes(l.toLowerCase()));
  if (!location) {
    if (lower.includes("airport")) location = "Airport North";
    else if (lower.includes("downtown") || lower.includes("city")) location = "Downtown Hub";
    else if (lower.includes("central") || lower.includes("station")) location = "Central Station";
  }

  const priceMatch = lower.match(/(?:under|below|up to|less than|max)\s*\$?\s*(\d+)/)
    || lower.match(/\$(\d+)/);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : null;

  return { type: type || "All", location: location || null, maxPrice };
}

export async function parseSearchQuery(text) {
  if (hasLLM()) {
    try {
      const raw = await callClaude({
        system: `Extract search filters from a car rental query. Respond with ONLY a JSON object, no prose, no markdown fences, matching this shape exactly:
{"type": one of ["Sedan","SUV","Sports","Electric","Compact","All"], "location": one of ["Downtown Hub","Airport North","Central Station", null], "maxPrice": number or null}`,
        messages: [{ role: "user", content: text }],
        maxTokens: 150,
      });
      const cleaned = raw.trim().replace(/^```json|```$/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        type: TYPES.includes(parsed.type) ? parsed.type : "All",
        location: LOCATIONS.includes(parsed.location) ? parsed.location : null,
        maxPrice: typeof parsed.maxPrice === "number" ? parsed.maxPrice : null,
        source: "llm",
      };
    } catch (err) {
      console.error("[ai.service] search parse LLM call failed, using fallback:", err.message);
    }
  }
  return { ...localParseSearch(text), source: "fallback" };
}

/* ------------------------------ BLURBS ------------------------------ */

function localBlurb(car) {
  const openers = {
    Sports: "Built for the drive itself —",
    SUV: "Room for the whole trip —",
    Sedan: "A comfortable, no-fuss daily driver —",
    Electric: "Quiet, quick, and easy on fuel stops —",
    Compact: "Easy to park, easy on the wallet —",
  };
  const opener = openers[car.type] || "A solid pick —";
  return `${opener} ${car.seats} seats, ${car.power}, and ${car.rangeLabel} out of ${car.location}.`;
}

export async function generateBlurb(car) {
  if (blurbCache.has(car.id)) return blurbCache.get(car.id);

  let blurb;
  if (hasLLM()) {
    try {
      blurb = await callClaude({
        system: "Write a single punchy one-sentence marketing blurb (under 22 words) for a car rental listing, based on the given specs. No quotes, no markdown, just the sentence.",
        messages: [{ role: "user", content: JSON.stringify(car) }],
        maxTokens: 80,
      });
      blurb = blurb.trim();
    } catch (err) {
      console.error("[ai.service] blurb LLM call failed, using fallback:", err.message);
    }
  }
  if (!blurb) blurb = localBlurb(car);

  blurbCache.set(car.id, blurb);
  return blurb;
}

/* --------------------------- RECOMMENDATIONS --------------------------- */

function localRecommend(cars, pastBookings) {
  const available = cars.filter(c => c.status === "available");
  if (!pastBookings.length) {
    return available.filter(c => c.featured).slice(0, 3);
  }
  const typeFreq = {};
  pastBookings.forEach(b => {
    const car = cars.find(c => c.id === b.carId);
    if (car) typeFreq[car.type] = (typeFreq[car.type] || 0) + 1;
  });
  const favoriteType = Object.entries(typeFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bookedIds = new Set(pastBookings.map(b => b.carId));
  const matches = available.filter(c => c.type === favoriteType && !bookedIds.has(c.id));
  return (matches.length ? matches : available.filter(c => c.featured)).slice(0, 3);
}

export async function recommendCars(pastBookings = []) {
  const cars = await CarsRepo.list({});
  const picks = localRecommend(cars, pastBookings);

  if (!hasLLM() || !pastBookings.length) {
    return { cars: picks, reason: pastBookings.length ? "Based on your past bookings" : "Popular picks right now", source: "fallback" };
  }

  try {
    const raw = await callClaude({
      system: `Given a customer's past bookings and the available fleet, pick up to 3 car names from the fleet list that best match their taste, and a short one-sentence reason. Respond with ONLY JSON: {"carNames": ["..."], "reason": "..."}.

Available fleet:
${catalogSummary(cars)}`,
      messages: [{ role: "user", content: `Past bookings: ${pastBookings.map(b => b.carName).join(", ")}` }],
      maxTokens: 150,
    });
    const cleaned = raw.trim().replace(/^```json|```$/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const matched = cars.filter(c => parsed.carNames?.includes(c.name) && c.status === "available");
    if (matched.length) {
      return { cars: matched.slice(0, 3), reason: parsed.reason || "Picked for you", source: "llm" };
    }
  } catch (err) {
    console.error("[ai.service] recommend LLM call failed, using fallback:", err.message);
  }
  return { cars: picks, reason: "Based on your past bookings", source: "fallback" };
}

export { hasLLM };
