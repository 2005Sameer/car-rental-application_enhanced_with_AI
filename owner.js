import { api, apiUpload } from "./api.js";

export const OwnerService = {
  listings: () => api.get("/owner/cars", { auth: true }),
  createListing: (payload) => api.post("/owner/cars", payload, { auth: true }),
  updateListing: (id, payload) => api.patch(`/owner/cars/${id}`, payload, { auth: true }),
  deleteListing: (id) => api.delete(`/owner/cars/${id}`, { auth: true }),
  uploadImage: (id, file) => {
    const form = new FormData();
    form.append("image", file);
    return apiUpload(`/owner/cars/${id}/image`, form);
  },
  bookingRequests: () => api.get("/owner/bookings", { auth: true }),
  approveBooking: (id) => api.patch(`/owner/bookings/${id}/approve`, {}, { auth: true }),
  declineBooking: (id) => api.patch(`/owner/bookings/${id}/decline`, {}, { auth: true }),
};
