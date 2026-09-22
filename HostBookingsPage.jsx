import React, { useEffect, useState } from "react";
import { MessageSquare, Check, X } from "lucide-react";
import { OwnerService } from "../../services/owner.js";
import MessageThread from "../../components/MessageThread.jsx";
import { fmt } from "../../data/extras.js";

export default function HostBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [openThread, setOpenThread] = useState(null);

  function load() {
    setLoading(true);
    OwnerService.bookingRequests().then(res => setBookings(res.bookings)).catch(err => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function respond(id, action) {
    setBusyId(id);
    try {
      action === "approve" ? await OwnerService.approveBooking(id) : await OwnerService.declineBooking(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="disp" style={{ fontSize: 20, marginBottom: 16 }}>Booking requests</h2>
      {loading && <div className="state-block">Loading...</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && bookings.length === 0 && <div className="state-block">No requests yet — they'll show up here once someone books one of your cars.</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {bookings.map(b => (
          <div key={b.id} className="card panel-pad">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 className="disp" style={{ margin: 0, fontSize: 18 }}>{b.carName}</h3>
                <p className="mono" style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>
                  {b.renterName} · {b.pickupDate} → {b.dropoffDate} · {b.ref}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={"badge badge-" + b.status}>{b.status}</span>
                <b className="mono">{fmt(b.total)}</b>
                {b.status === "pending" && (
                  <>
                    <button className="btn btn-primary btn-sm" disabled={busyId === b.id} onClick={() => respond(b.id, "approve")}>
                      <Check size={14} /> Approve
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={busyId === b.id} onClick={() => respond(b.id, "decline")}>
                      <X size={14} /> Decline
                    </button>
                  </>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setOpenThread(openThread === b.id ? null : b.id)}>
                  <MessageSquare size={14} /> Message
                </button>
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
