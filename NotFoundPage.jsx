import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page-narrow" style={{ textAlign: "center" }}>
      <h1 className="disp" style={{ fontSize: 40 }}>404</h1>
      <p style={{ color: "var(--muted)" }}>That page doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
}
