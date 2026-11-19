import api from "./api";

const subjectService = {
  getSubjects: (params) => api.get("/subjects", { params }).then((r) => r.data),
  getSubjectById: (id) => api.get(`/subjects/${id}`).then((r) => r.data),
  createSubject: (payload) => api.post("/subjects", payload).then((r) => r.data),
  updateSubject: (id, payload) => api.put(`/subjects/${id}`, payload).then((r) => r.data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`).then((r) => r.data),
};

export default subjectService;
