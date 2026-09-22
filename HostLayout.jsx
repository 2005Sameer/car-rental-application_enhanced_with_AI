import React from "react";
import { Outlet } from "react-router-dom";
import HostSidebar from "../../components/HostSidebar.jsx";

export default function HostLayout() {
  return (
    <div className="admin-shell">
      <HostSidebar />
      <div className="admin-content">
        <div style={{ marginBottom: 20 }}>
          <h1 className="disp" style={{ fontSize: 26, margin: 0 }}>Host dashboard</h1>
          <p style={{ color: "var(--muted-2)", fontSize: 13, margin: "4px 0 0" }}>
            List your own car and manage requests from renters.
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
