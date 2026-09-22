import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(params.get("next") || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-narrow">
      <h1 className="disp" style={{ fontSize: 32, marginBottom: 20 }}>Log in</h1>
      <form className="form-card" onSubmit={onSubmit}>
        <div className="field">
          <label>Email</label>
          <div className="field-input"><Mail size={15} /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        </div>
        <div className="field">
          <label>Password</label>
          <div className="field-input"><Lock size={15} /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? "Logging in..." : "Log in"}</button>
        <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", margin: 0 }}>
          No account? <Link to="/signup" style={{ color: "var(--accent)" }}>Sign up</Link>
        </p>
        <p style={{ fontSize: 12, color: "var(--muted-2)", textAlign: "center", margin: 0 }}>
          Admin demo: admin@ridgeline.dev / admin1234
        </p>
      </form>
    </div>
  );
}
