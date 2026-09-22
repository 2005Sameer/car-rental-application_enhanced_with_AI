import React, { useEffect, useState } from "react";
import { AdminService } from "../../services/admin.js";
import { fmt } from "../../data/extras.js";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.bookings()
      .then(res => setBookings(res.bookings))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="disp" style={{ fontSize: 28, marginBottom: 20 }}>All bookings</h1>
      {loading && <div className="state-block">Loading...</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && (
        <div className="card panel-pad">
          <table className="table">
            <thead>
              <tr><th>Reference</th><th>Vehicle</th><th>Dates</th><th>Extras</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="mono">{b.ref}</td>
                  <td>{b.carName}</td>
                  <td className="mono">{b.pickupDate} → {b.dropoffDate}</td>
                  <td className="mono">{b.extras.length ? b.extras.join(", ") : "—"}</td>
                  <td className="mono">{fmt(b.total)}</td>
                  <td><span className={"badge badge-" + b.status}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
