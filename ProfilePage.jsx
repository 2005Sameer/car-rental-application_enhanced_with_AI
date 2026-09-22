import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="page-narrow">
      <h1 className="disp" style={{ fontSize: 32, marginBottom: 20 }}>Profile</h1>
      <div className="form-card">
        <div className="field"><label>Name</label><div className="field-input">{user.name}</div></div>
        <div className="field"><label>Email</label><div className="field-input">{user.email}</div></div>
        <div className="field"><label>Role</label><div className="field-input" style={{ textTransform: "capitalize" }}>{user.role}</div></div>
        <button className="btn btn-danger btn-block" onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
}
