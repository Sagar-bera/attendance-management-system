import api from "./api";

const studentService = {
  getStudents: (params) => api.get("/students", { params }).then((r) => r.data),
  getStudentById: (id) => api.get(`/students/${id}`).then((r) => r.data),
  createStudent: (payload) => api.post("/students", payload).then((r) => r.data),
  updateStudent: (id, payload) => api.put(`/students/${id}`, payload).then((r) => r.data),
  deleteStudent: (id) => api.delete(`/students/${id}`).then((r) => r.data),
  resetPassword: (id, newPassword) =>
    api.patch(`/students/${id}/reset-password`, { newPassword }).then((r) => r.data),
  getDepartments: () => api.get("/students/meta/departments").then((r) => r.data),
  getAttendanceSummary: (id) => api.get(`/students/${id}/attendance-summary`).then((r) => r.data),
};

export default studentService;
