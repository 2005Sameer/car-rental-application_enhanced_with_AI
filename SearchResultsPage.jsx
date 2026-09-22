import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { CarsService } from "../services/cars.js";
import CarCard from "../components/CarCard.jsx";
import { fmt } from "../data/extras.js";

const TYPES = ["All", "Sedan", "SUV", "Sports", "Electric", "Compact"];
const LOCATIONS = ["Downtown Hub", "Airport North", "Central Station"];

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [sort, setSort] = useState("recommended");

  const location = params.get("location") || LOCATIONS[0];
  const type = params.get("type") || "All";
  const maxPrice = Number(params.get("maxPrice") || 200);

  useEffect(() => {
    setLoading(true);
    setError("");
    CarsService.list({ location, type, maxPrice, availableOnly: true })
      .then(res => setCars(res.cars))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [location, type, maxPrice]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  }

  function toggleFavorite(id) {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const sorted = useMemo(() => {
    let list = [...cars];
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [cars, sort]);

  return (
    <div className="page" style={{ paddingTop: 24, paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div className="field">
          <label>Location</label>
          <div className="field-input" style={{ minWidth: 200 }}>
            <select value={location} onChange={e => updateParam("location", e.target.value)}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TYPES.map(t => (
            <button
              key={t}
              className="btn btn-sm"
              style={{
                background: type === t ? "var(--accent)" : "transparent",
                color: type === t ? "var(--accent-ink)" : "var(--muted)",
                border: "1px solid " + (type === t ? "var(--accent)" : "var(--edge)"),
                borderRadius: 999,
              }}
              onClick={() => updateParam("type", t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 13 }}>
            <SlidersHorizontal size={14} />
            <span>Up to {fmt(maxPrice)}/day</span>
            <input type="range" min="30" max="200" step="5" value={maxPrice} onChange={e => updateParam("maxPrice", e.target.value)} style={{ accentColor: "var(--accent)" }} />
          </div>
          <div className="field-input" style={{ padding: "8px 10px" }}>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {loading && <div className="state-block">Loading vehicles...</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && sorted.length === 0 && (
        <div className="state-block">No vehicles match those filters at {location}. Try raising the price cap or a different type.</div>
      )}
      {!loading && !error && sorted.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {sorted.map((car, i) => (
            <div key={car.id} className="grid-fade-item" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <CarCard car={car} favorite={favorites.has(car.id)} onToggleFavorite={toggleFavorite} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
