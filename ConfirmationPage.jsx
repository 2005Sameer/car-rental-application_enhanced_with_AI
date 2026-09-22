import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, Clock } from "lucide-react";
import { fmt } from "../data/extras.js";

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="page-narrow" style={{ textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>Booking {id} submitted. Check "My bookings" for the latest status.</p>
        <button className="btn btn-primary" onClick={() => navigate("/account/bookings")}>Go to my bookings</button>
      </div>
    );
  }

  const isPending = booking.status === "pending";

  return (
    <div className="page-narrow" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: 999, background: isPending ? "var(--accent)" : "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", color: isPending ? "var(--accent-ink)" : "#0a1512" }}>
        {isPending ? <Clock size={26} /> : <Check size={26} />}
      </div>
      <h1 className="disp" style={{ margin: 0, fontSize: 30 }}>{isPending ? "Request sent" : "Booking confirmed"}</h1>
      <p style={{ color: "var(--muted)", margin: 0 }}>
        {isPending
          ? `${booking.carOwnerName || "The host"} needs to approve your request for the ${booking.carName}. You'll see it update in My bookings once they respond.`
          : `${booking.carName} is reserved for ${booking.days} day${booking.days > 1 ? "s" : ""}. Total charged: ${fmt(booking.total)}.`}
      </p>
      <div className="mono" style={{ background: "var(--panel-2)", border: "1px dashed var(--edge)", borderRadius: 6, padding: "10px 16px" }}>
        {booking.ref}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={() => navigate("/search")}>Book another</button>
        <button className="btn btn-primary" onClick={() => navigate("/account/bookings")}>View my bookings</button>
      </div>
    </div>
  );
}
