import api from "./api";

const settingsService = {
  getSettings: () => api.get("/settings").then((r) => r.data),
  updateSettings: (payload) => api.put("/settings", payload).then((r) => r.data),
  updateAdminProfile: (payload) => api.put("/settings/profile", payload).then((r) => r.data),
};

export default settingsService;
