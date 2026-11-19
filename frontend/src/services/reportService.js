import api from "./api";

const reportService = {
  getDailyReport: (params) => api.get("/reports/daily", { params }).then((r) => r.data),
  getMonthlyReport: (params) => api.get("/reports/monthly", { params }).then((r) => r.data),
  getStudentReport: (id) => api.get(`/reports/student/${id}`).then((r) => r.data),
  getSubjectReport: (id) => api.get(`/reports/subject/${id}`).then((r) => r.data),
  getLowAttendance: (params) => api.get("/reports/low-attendance", { params }).then((r) => r.data),
};

export default reportService;
