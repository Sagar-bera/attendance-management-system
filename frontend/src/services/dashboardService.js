import api from "./api";

const dashboardService = {
  getAdminDashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  getStudentDashboard: () => api.get("/student/dashboard").then((r) => r.data),
};

export default dashboardService;
