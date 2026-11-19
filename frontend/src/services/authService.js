import api from "./api";

const authService = {
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
  changePassword: (payload) => api.post("/auth/change-password", payload).then((r) => r.data),
  forgotPassword: (payload) => api.post("/auth/forgot-password", payload).then((r) => r.data),
  resetPassword: (payload) => api.post("/auth/reset-password", payload).then((r) => r.data),
};

export default authService;
