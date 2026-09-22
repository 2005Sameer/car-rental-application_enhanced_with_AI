import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthService } from "../services/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("rr_token");
    if (!token) {
      setLoading(false);
      return;
    }
    AuthService.me()
      .then(res => setUser(res.user))
      .catch(() => localStorage.removeItem("rr_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await AuthService.login({ email, password });
    localStorage.setItem("rr_token", res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await AuthService.signup({ name, email, password });
    localStorage.setItem("rr_token", res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    // Best-effort server-side revocation so the token can't be replayed
    // after logout — but local state clears regardless of whether this
    // call succeeds (e.g. the token already expired, or we're offline).
    AuthService.logout().catch(() => {});
    localStorage.removeItem("rr_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
