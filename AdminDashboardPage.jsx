import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminService } from "../../services/admin.js";
import { fmt } from "../../data/extras.js";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([AdminService.analytics(), AdminService.bookings()])
      .then(([a, b]) => {
        setData(a);
        setBookings(b.bookings.slice(0, 5));
      })
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <div className="state-block">Loading...</div>;

  const { totals } = data;

  return (
    <div>
      <h1 className="disp" style={{ fontSize: 28, marginBottom: 20 }}>Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card"><div className="label">Fleet size</div><div className="value mono">{totals.fleetSize}</div></div>
        <div className="stat-card"><div className="label">Total bookings</div><div className="value mono">{totals.totalBookings}</div></div>
        <div className="stat-card"><div className="label">Revenue</div><div className="value mono">{fmt(totals.revenue)}</div></div>
        <div className="stat-card"><div className="label">Fleet available</div><div className="value mono">{totals.fleetAvailablePct}%</div></div>
      </div>

      <div className="card panel-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 className="disp" style={{ fontSize: 18, margin: 0 }}>Recent bookings</h2>
          <Link to="/admin/bookings" style={{ fontSize: 13, color: "var(--accent)" }}>View all</Link>
        </div>
        <table className="table">
          <thead>
            <tr><th>Reference</th><th>Vehicle</th><th>Dates</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td className="mono">{b.ref}</td>
                <td>{b.carName}</td>
                <td className="mono">{b.pickupDate} → {b.dropoffDate}</td>
                <td className="mono">{fmt(b.total)}</td>
                <td><span className={"badge badge-" + b.status}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
