import React from "react";
import { NavLink } from "react-router-dom";
import { Car, Inbox } from "lucide-react";

const LINKS = [
  { to: "/host/listings", label: "My cars", icon: Car },
  { to: "/host/bookings", label: "Booking requests", icon: Inbox },
];

export default function HostSidebar() {
  return (
    <div className="admin-sidebar">
      {LINKS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>
          <Icon size={16} /> {label}
        </NavLink>
      ))}
    </div>
  );
}
