import { api } from "./api.js";

export const CarsService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "All")
    ).toString();
    return api.get(`/cars${qs ? `?${qs}` : ""}`);
  },
  get: (id) => api.get(`/cars/${id}`),
};
