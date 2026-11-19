import api from "./api";

const attendanceService = {
  getAttendance: (params) => api.get("/attendance", { params }).then((r) => r.data),
  getStudentAttendance: (studentId, params) =>
    api.get(`/attendance/student/${studentId}`, { params }).then((r) => r.data),
  getStudentsForMarking: (params) =>
    api.get("/attendance/students-for-marking", { params }).then((r) => r.data),
  markAttendance: (payload) => api.post("/attendance", payload).then((r) => r.data),
  markSelfAttendance: (payload) => api.post("/attendance/self", payload).then((r) => r.data),
  bulkMarkAttendance: (payload) => api.post("/attendance/bulk", payload).then((r) => r.data),
  updateAttendance: (id, payload) => api.put(`/attendance/${id}`, payload).then((r) => r.data),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`).then((r) => r.data),
};

export default attendanceService;
