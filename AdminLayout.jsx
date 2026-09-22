import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar.jsx";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
