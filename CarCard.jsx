import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Users, Gauge, Zap, Fuel, Heart, ArrowRight } from "lucide-react";
import CarGlyph from "./CarGlyph.jsx";
import { fmt } from "../data/extras.js";

export default function CarCard({ car, favorite, onToggleFavorite }) {
  const navigate = useNavigate();
  return (
    <div className="card card-lift car-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="car-media" style={{ background: "var(--panel-2)", padding: car.imageUrl ? 0 : "22px 18px 8px", position: "relative", minHeight: 130, height: car.imageUrl ? 150 : "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ position: "absolute", top: 12, left: 12, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", background: "rgba(20,23,26,0.6)", border: "1px solid var(--edge)", padding: "4px 9px", borderRadius: 999, zIndex: 1 }}>
          {car.type}
        </span>
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(car.id)}
            aria-label="Save vehicle"
            className="fav-btn"
            style={{ position: "absolute", top: 12, right: 12, background: "rgba(20,23,26,0.6)", border: "1px solid var(--edge)", borderRadius: 999, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: favorite ? "var(--danger)" : "var(--muted)", zIndex: 1 }}
          >
            <Heart size={15} fill={favorite ? "currentColor" : "none"} />
          </button>
        )}
        {car.imageUrl ? (
          <img className="car-media-img" src={car.imageUrl} alt={car.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="car-media-img" style={{ maxWidth: 220 }}>
            <CarGlyph tone={car.tone} type={car.type} />
          </div>
        )}
      </div>
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h3 className="disp" style={{ fontSize: 22, margin: 0 }}>{car.name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
            <Star size={14} fill="currentColor" style={{ color: "var(--accent)" }} />
            {car.rating} <span className="mono">({car.reviews})</span>
          </div>
        </div>
        <div className="mono" style={{ display: "flex", gap: 14, color: "var(--muted)", fontSize: 12.5, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={14} />{car.seats}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Gauge size={14} />{car.power}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {car.type === "Electric" ? <Zap size={14} /> : <Fuel size={14} />}{car.rangeLabel}
          </span>
          <span>{car.trans}</span>
        </div>
        {car.source === "owner" && (
          <span style={{ alignSelf: "flex-start", fontSize: 11.5, color: "var(--teal)", border: "1px solid var(--teal)", padding: "2px 9px", borderRadius: 999 }}>
            Hosted by {car.ownerName}
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--edge)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <b className="mono" style={{ fontSize: 20 }}>{fmt(car.price)}</b>
            <span style={{ fontSize: 12, color: "var(--muted-2)" }}>/ day</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/cars/${car.id}`)}>
            View <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
