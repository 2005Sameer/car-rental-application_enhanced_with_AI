import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, User } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="nav">
      <Link to="/" className="brand">
        <div className="brand-mark">R</div>
        <div className="brand-name disp">Ridgeline Rentals</div>
      </Link>
      <div className="nav-links">
        <NavLink to="/search" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Fleet</NavLink>
        {user && (
          <NavLink to="/account/bookings" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            My bookings
          </NavLink>
        )}
        {user && (
          <NavLink to="/host/listings" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Host your car
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Admin</NavLink>
        )}
      </div>
      <div className="nav-right">
        {user ? (
          <div className="nav-user" onClick={() => navigate("/account/profile")}>
            <User size={14} /> {user.name.split(" ")[0]}
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login?next=/host/listings")}>Host your car</button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login")}>Log in</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/signup")}>Sign up</button>
          </>
        )}
      </div>
    </div>
  );
}
