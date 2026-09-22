import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 10 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must be at least 10 characters and include a letter and a number");
      return;
    }
    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-narrow">
      <h1 className="disp" style={{ fontSize: 32, marginBottom: 20 }}>Create account</h1>
      <form className="form-card" onSubmit={onSubmit}>
        <div className="field">
          <label>Full name</label>
          <div className="field-input"><User size={15} /><input required value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Rivera" /></div>
        </div>
        <div className="field">
          <label>Email</label>
          <div className="field-input"><Mail size={15} /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        </div>
        <div className="field">
          <label>Password</label>
          <div className="field-input"><Lock size={15} /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 10 characters, with a letter and a number" /></div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? "Creating..." : "Create account"}</button>
        <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", margin: 0 }}>
          Already have an account? <Link to="/login" style={{ color: "var(--accent)" }}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
