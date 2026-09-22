import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Users, Gauge, Zap, Fuel, MapPin, Calendar, Sparkles } from "lucide-react";
import { CarsService } from "../services/cars.js";
import { AiService } from "../services/ai.js";
import CarGlyph from "../components/CarGlyph.jsx";
import { fmt } from "../data/extras.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [error, setError] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [blurb, setBlurb] = useState("");

  useEffect(() => {
    CarsService.get(id)
      .then(res => setCar(res.car))
      .catch(err => setError(err.message));
    AiService.blurb(id).then(res => setBlurb(res.blurb)).catch(() => {});
  }, [id]);

  function proceed() {
    if (!pickup || !dropoff) {
      setError("Choose a pickup and return date first.");
      return;
    }
    const params = new URLSearchParams({ pickup, dropoff });
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/checkout/${id}?${params}`)}`);
      return;
    }
    navigate(`/checkout/${id}?${params}`);
  }

  if (error && !car) return <div className="page state-block">{error}</div>;
  if (!car) return <div className="page state-block">Loading...</div>;

  return (
    <div className="page" style={{ paddingTop: 32, paddingBottom: 60, display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: 32 }}>
      <div>
        <div className="card" style={{ display: "flex", justifyContent: "center", marginBottom: 20, overflow: "hidden", padding: car.imageUrl ? 0 : 20 }}>
          {car.imageUrl ? (
            <img src={car.imageUrl} alt={car.name} style={{ width: "100%", maxHeight: 320, objectFit: "cover" }} />
          ) : (
            <div style={{ maxWidth: 360, width: "100%" }}>
              <CarGlyph tone={car.tone} type={car.type} />
            </div>
          )}
        </div>
        <h1 className="disp" style={{ fontSize: 40, margin: "0 0 8px" }}>{car.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Star size={15} style={{ color: "var(--accent)" }} fill="currentColor" /> {car.rating} ({car.reviews} reviews)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={15} /> {car.location}</span>
          {car.source === "owner" && (
            <span style={{ color: "var(--teal)", border: "1px solid var(--teal)", padding: "2px 10px", borderRadius: 999, fontSize: 12.5 }}>
              Hosted by {car.ownerName}
            </span>
          )}
        </div>
        {blurb && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 20, color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6 }}>
            <Sparkles size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
            <span>{blurb}</span>
          </div>
        )}
        <div className="card panel-pad mono" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, fontSize: 13, color: "var(--muted)" }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}><Users size={16} />{car.seats} seats</span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}><Gauge size={16} />{car.power}</span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>{car.type === "Electric" ? <Zap size={16} /> : <Fuel size={16} />}{car.rangeLabel}</span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>{car.trans}</span>
        </div>
      </div>

      <div className="form-card" style={{ alignSelf: "start" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <b className="mono" style={{ fontSize: 26 }}>{fmt(car.price)}</b>
          <span style={{ color: "var(--muted-2)", fontSize: 13 }}>/ day</span>
        </div>
        <div className="field">
          <label>Pickup date</label>
          <div className="field-input"><Calendar size={15} /><input type="date" value={pickup} onChange={e => setPickup(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Return date</label>
          <div className="field-input"><Calendar size={15} /><input type="date" value={dropoff} onChange={e => setDropoff(e.target.value)} /></div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary btn-block" onClick={proceed}>Continue to checkout</button>
      </div>
    </div>
  );
}
