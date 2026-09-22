import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { BookingsService } from "../services/bookings.js";
import MessageThread from "../components/MessageThread.jsx";
import { fmt } from "../data/extras.js";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [openThread, setOpenThread] = useState(null);

  function load() {
    setLoading(true);
    BookingsService.mine()
      .then(res => setBookings(res.bookings))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancel(id) {
    setBusyId(id);
    try {
      await BookingsService.cancel(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="disp" style={{ fontSize: 32, marginBottom: 20 }}>My bookings</h1>
      {loading && <div className="state-block">Loading...</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && bookings.length === 0 && <div className="state-block">No bookings yet. Head to the fleet to book your first car.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {bookings.map(b => (
          <div key={b.id} className="card panel-pad">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 className="disp" style={{ margin: 0, fontSize: 20 }}>{b.carName}</h3>
                <p className="mono" style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>
                  {b.pickupDate} → {b.dropoffDate} · {b.days} day{b.days > 1 ? "s" : ""} · {b.ref}
                  {b.carOwnerName ? ` · Hosted by ${b.carOwnerName}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className={"badge badge-" + b.status}>{b.status}</span>
                <b className="mono">{fmt(b.total)}</b>
                {(b.status === "confirmed" || b.status === "pending") && (
                  <button className="btn btn-danger btn-sm" disabled={busyId === b.id} onClick={() => cancel(b.id)}>
                    {busyId === b.id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
                {b.carOwnerId && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setOpenThread(openThread === b.id ? null : b.id)}>
                    <MessageSquare size={14} /> Message host
                  </button>
                )}
              </div>
            </div>
            {openThread === b.id && (
              <div style={{ marginTop: 14 }}>
                <MessageThread bookingId={b.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
