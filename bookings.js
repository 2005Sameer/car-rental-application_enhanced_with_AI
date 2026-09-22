import { api } from "./api.js";

export const BookingsService = {
  create: (payload) => api.post("/bookings", payload, { auth: true }),
  mine: () => api.get("/bookings", { auth: true }),
  get: (id) => api.get(`/bookings/${id}`, { auth: true }),
  addMessage: (id, text) => api.post(`/bookings/${id}/messages`, { text }, { auth: true }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`, {}, { auth: true }),
};
