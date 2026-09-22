import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Car, ClipboardList, BarChart3 } from "lucide-react";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/fleet", label: "Fleet", icon: Car },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
          <Icon size={16} /> {label}
        </NavLink>
      ))}
    </div>
  );
}
