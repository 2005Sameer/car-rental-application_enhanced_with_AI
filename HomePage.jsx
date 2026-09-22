import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Settings2, Search, Sparkles, ArrowRight } from "lucide-react";
import CarGlyph from "../components/CarGlyph.jsx";
import CarCard from "../components/CarCard.jsx";
import { AiService } from "../services/ai.js";

const LOCATIONS = ["Downtown Hub", "Airport North", "Central Station"];
const TYPES = ["All", "Sedan", "SUV", "Sports", "Electric", "Compact"];

export default function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [type, setType] = useState("All");

  const [nlQuery, setNlQuery] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState("");

  const [recs, setRecs] = useState(null);
  const [recsReason, setRecsReason] = useState("");

  useEffect(() => {
    AiService.recommendations()
      .then(res => {
        setRecs(res.cars);
        setRecsReason(res.reason);
      })
      .catch(() => setRecs([]));
  }, []);

  function search() {
    const params = new URLSearchParams({ location, type });
    if (pickup) params.set("pickup", pickup);
    if (dropoff) params.set("dropoff", dropoff);
    navigate(`/search?${params.toString()}`);
  }

  async function nlSearch(e) {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setNlLoading(true);
    setNlError("");
    try {
      const filters = await AiService.parseSearch(nlQuery);
      const params = new URLSearchParams({ location: filters.location || LOCATIONS[0], type: filters.type || "All" });
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      navigate(`/search?${params.toString()}`);
    } catch (err) {
      setNlError(err.message);
    } finally {
      setNlLoading(false);
    }
  }

  return (
    <div>
      <div className="page" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, padding: "56px 32px 40px", alignItems: "center", borderBottom: "1px solid var(--edge)" }}>
        <div>
          <h1 className="disp" style={{ fontSize: 60, lineHeight: 0.95, margin: "0 0 18px" }}>
            Drive off{" "}
            <span style={{
              backgroundImage: "linear-gradient(90deg, var(--accent-bright), var(--accent), var(--accent-bright))",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              animation: "shimmer 4s linear infinite",
            }}>today.</span><br />
            Return whenever.
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 17, maxWidth: "46ch", lineHeight: 1.55, margin: 0 }}>
            Browse a live fleet across three city hubs, lock in a transparent
            price per day, and skip the counter. Keys are ready when you are.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ maxWidth: 420, width: "100%", animation: "floatY 4.5s ease-in-out infinite" }}>
            <CarGlyph tone="amber" />
          </div>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 28 }}>
        <div className="card panel-pad" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) auto", gap: 14, alignItems: "end" }}>
          <div className="field">
            <label>Pickup location</label>
            <div className="field-input">
              <MapPin size={15} />
              <select value={location} onChange={e => setLocation(e.target.value)}>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Pickup date</label>
            <div className="field-input">
              <Calendar size={15} />
              <input type="date" value={pickup} onChange={e => setPickup(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Return date</label>
            <div className="field-input">
              <Calendar size={15} />
              <input type="date" value={dropoff} onChange={e => setDropoff(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Vehicle type</label>
            <div className="field-input">
              <Settings2 size={15} />
              <select value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={search} style={{ height: 42 }}>
            <Search size={16} /> Search
          </button>
        </div>

        <form onSubmit={nlSearch} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "0 4px" }}>
          <Sparkles size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <div className="field-input" style={{ flex: 1 }}>
            <input
              value={nlQuery}
              onChange={e => setNlQuery(e.target.value)}
              placeholder='Or just describe it — "electric car under $80 near downtown"'
            />
          </div>
          <button className="btn btn-outline btn-sm" disabled={nlLoading}>
            {nlLoading ? "Thinking..." : "Ask AI"}
          </button>
        </form>
        {nlError && <div className="alert alert-error" style={{ marginTop: 10 }}>{nlError}</div>}
      </div>

      {recs && recs.length > 0 && (
        <div className="page" style={{ paddingTop: 44 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 className="disp" style={{ fontSize: 24, margin: 0 }}>Recommended for you</h2>
              <p style={{ color: "var(--muted-2)", fontSize: 13, margin: "4px 0 0" }}>{recsReason}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/search")}>
              See all <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {recs.map((car, i) => (
              <div key={car.id} className="grid-fade-item" style={{ animationDelay: `${i * 70}ms` }}>
                <CarCard car={car} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="page" style={{ padding: "50px 32px 70px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[
          { title: "Live fleet", body: "Every car shown is actually available at that hub right now — no bait-and-switch at the counter." },
          { title: "One price, up front", body: "Day rate, extras and tax are totalled before you confirm. What you see is what you pay." },
          { title: "Manage it yourself", body: "Change dates, add extras, or cancel from your account — no phone call required." },
        ].map(f => (
          <div className="card card-lift panel-pad" key={f.title}>
            <h3 className="disp" style={{ fontSize: 20, margin: "0 0 8px" }}>{f.title}</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
