import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Navigation2, Baby, Check, ArrowRight } from "lucide-react";
import { CarsService } from "../services/cars.js";
import { BookingsService } from "../services/bookings.js";
import CarThumb from "../components/CarThumb.jsx";
import { EXTRAS, daysBetween, fmt } from "../data/extras.js";

const ICONS = { insurance: Shield, gps: Navigation2, seat: Baby };

export default function CheckoutPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const pickup = params.get("pickup");
  const dropoff = params.get("dropoff");

  const [car, setCar] = useState(null);
  const [extras, setExtras] = useState(new Set());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    CarsService.get(id).then(res => setCar(res.car)).catch(err => setError(err.message));
  }, [id]);

  const days = useMemo(() => (pickup && dropoff ? daysBetween(pickup, dropoff) : 1), [pickup, dropoff]);

  function toggleExtra(extraId) {
    setExtras(prev => {
      const next = new Set(prev);
      next.has(extraId) ? next.delete(extraId) : next.add(extraId);
      return next;
    });
  }

  const extrasTotal = [...extras].reduce((sum, eid) => sum + EXTRAS.find(e => e.id === eid).price, 0) * days;
  const carSubtotal = car ? car.price * days : 0;
  const subtotal = carSubtotal + extrasTotal;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  async function confirm() {
    setSubmitting(true);
    setError("");
    try {
      const res = await BookingsService.create({
        carId: id,
        pickupDate: pickup,
        dropoffDate: dropoff,
        extras: [...extras],
      });
      navigate(`/confirmation/${res.booking.id}`, { state: { booking: res.booking } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!car) return <div className="page state-block">{error || "Loading..."}</div>;

  return (
    <div className="page-narrow">
      <h1 className="disp" style={{ fontSize: 34, marginBottom: 20 }}>Checkout</h1>
      <div className="form-card">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 80 }}><CarThumb car={car} size={80} /></div>
          <div>
            <h2 className="disp" style={{ margin: 0, fontSize: 24 }}>{car.name}</h2>
            <p className="mono" style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>
              {pickup} → {dropoff} · {days} day{days > 1 ? "s" : ""} · {car.location}
            </p>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Add extras</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {EXTRAS.map(ex => {
              const on = extras.has(ex.id);
              const Icon = ICONS[ex.id];
              return (
                <div
                  key={ex.id}
                  onClick={() => toggleExtra(ex.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid " + (on ? "var(--accent)" : "var(--edge)"), background: on ? "rgba(255,176,32,0.06)" : "transparent", borderRadius: 8, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <Icon size={16} style={{ color: on ? "var(--accent)" : "var(--muted)" }} />
                    {ex.label}
                    <span className="mono" style={{ color: "var(--muted-2)" }}>+{fmt(ex.price)}/day</span>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid " + (on ? "var(--accent)" : "var(--edge)"), background: on ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-ink)" }}>
                    {on && <Check size={12} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
            <span>{fmt(car.price)} × {days} days</span><span className="mono">{fmt(carSubtotal)}</span>
          </div>
          {extras.size > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
              <span>Extras</span><span className="mono">{fmt(extrasTotal)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
            <span>Taxes & fees</span><span className="mono">{fmt(tax)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, borderTop: "1px solid var(--edge)", paddingTop: 10, marginTop: 4 }}>
            <span>Total</span><span className="mono">{fmt(total)}</span>
          </div>
        </div>

        {car.source === "owner" && (
          <div className="alert" style={{ background: "rgba(63,214,196,0.08)", borderColor: "rgba(63,214,196,0.4)", color: "var(--teal)" }}>
            This car is hosted by {car.ownerName} — your request goes to them for approval instead of confirming instantly.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary btn-block" onClick={confirm} disabled={submitting}>
          {submitting ? "Sending..." : car.source === "owner" ? "Send request" : "Confirm booking"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
