import { api, apiUpload } from "./api.js";

export const AdminService = {
  fleet: () => api.get("/admin/cars", { auth: true }),
  createCar: (payload) => api.post("/admin/cars", payload, { auth: true }),
  updateCar: (id, payload) => api.patch(`/admin/cars/${id}`, payload, { auth: true }),
  deleteCar: (id) => api.delete(`/admin/cars/${id}`, { auth: true }),
  uploadCarImage: (id, file) => {
    const form = new FormData();
    form.append("image", file);
    return apiUpload(`/admin/cars/${id}/image`, form);
  },
  bookings: () => api.get("/admin/bookings", { auth: true }),
  analytics: () => api.get("/admin/analytics", { auth: true }),
};
