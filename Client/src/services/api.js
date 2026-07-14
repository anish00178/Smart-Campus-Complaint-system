import axios from "axios";

export const BASE_URL = "https://smart-campus-complaint-system-pnz7.onrender.com";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data, {
  headers: { "Content-Type": "multipart/form-data" },
});

export const adminLogin = (data) => API.post("/auth/admin/login", data);
export const adminRegister = (data) => API.post("/auth/admin/register", data);

export const getPendingStudents = (token) =>
  API.get("/auth/admin/students/pending", { headers: { Authorization: `Bearer ${token}` } });

export const getAllStudents = (token) =>
  API.get("/auth/admin/students/all", { headers: { Authorization: `Bearer ${token}` } });

export const approveStudent = (id, token) =>
  API.put(`/auth/admin/students/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const rejectStudent = (id, token) =>
  API.delete(`/auth/admin/students/${id}/reject`, { headers: { Authorization: `Bearer ${token}` } });

export const getProfile = (token) =>
  API.get("/auth/profile", { headers: { Authorization: `Bearer ${token}` } });

export const updateProfile = (data, token) =>
  API.put("/auth/profile", data, { headers: { Authorization: `Bearer ${token}` } });

export const getComplaints = (token) =>
  API.get("/complaints", { headers: { Authorization: `Bearer ${token}` } });

export const createComplaint = (data, token) =>
  API.post("/complaints", data, { headers: { Authorization: `Bearer ${token}` } });

export const updateStatus = (id, status, token) =>
  API.put(`/complaints/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });

export const getAdminStats = (token) =>
  API.get("/complaints/admin/stats", { headers: { Authorization: `Bearer ${token}` } });