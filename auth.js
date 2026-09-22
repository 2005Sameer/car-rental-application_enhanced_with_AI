import { api } from "./api.js";

export const AuthService = {
  signup: (payload) => api.post("/auth/signup", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me", { auth: true }),
  logout: () => api.post("/auth/logout", {}, { auth: true }),
};
