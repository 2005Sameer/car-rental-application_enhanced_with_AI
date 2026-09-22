import React, { useEffect, useState } from "react";
import { AdminService } from "../../services/admin.js";
import { fmt } from "../../data/extras.js";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    AdminService.analytics().then(setData).catch(err => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <div className="state-block">Loading...</div>;

  const maxTypeCount = Math.max(1, ...Object.values(data.byType));
  const maxStatusCount = Math.max(1, ...Object.values(data.bookingsByStatus));

  return (
    <div>
      <h1 className="disp" style={{ fontSize: 28, marginBottom: 20 }}>Analytics</h1>
      <div className="stat-grid">
        <div className="stat-card"><div className="label">Revenue</div><div className="value mono">{fmt(data.totals.revenue)}</div></div>
        <div className="stat-card"><div className="label">Active bookings</div><div className="value mono">{data.totals.activeBookings}</div></div>
        <div className="stat-card"><div className="label">Fleet size</div><div className="value mono">{data.totals.fleetSize}</div></div>
        <div className="stat-card"><div className="label">Available now</div><div className="value mono">{data.totals.fleetAvailablePct}%</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card panel-pad">
          <h2 className="disp" style={{ fontSize: 16, margin: "0 0 14px" }}>Fleet by type</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(data.byType).map(([type, count]) => (
              <div key={type}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                  <span>{type}</span><span className="mono">{count}</span>
                </div>
                <div style={{ background: "var(--panel-2)", borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${(count / maxTypeCount) * 100}%`, background: "var(--accent)", height: 8, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel-pad">
          <h2 className="disp" style={{ fontSize: 16, margin: "0 0 14px" }}>Bookings by status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(data.bookingsByStatus).map(([status, count]) => (
              <div key={status}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", marginBottom: 4, textTransform: "capitalize" }}>
                  <span>{status}</span><span className="mono">{count}</span>
                </div>
                <div style={{ background: "var(--panel-2)", borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${(count / maxStatusCount) * 100}%`, background: "var(--teal)", height: 8, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
