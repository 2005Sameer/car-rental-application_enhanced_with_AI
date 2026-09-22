import { api } from "./api.js";

export const AiService = {
  chat: (messages) => api.post("/ai/chat", { messages }, { auth: true }),
  parseSearch: (query) => api.post("/ai/search", { query }),
  blurb: (carId) => api.get(`/ai/blurb/${carId}`),
  recommendations: () => api.get("/ai/recommendations", { auth: true }),
  status: () => api.get("/ai/status"),
};
