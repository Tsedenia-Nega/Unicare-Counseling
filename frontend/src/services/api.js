// services/api.js
import axios from "axios";



const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add your appointment-related API calls here
export const getAppointments = async () => {
  return API.get("/appointment/my-appointments");
};
export const getAppointmentsForCounselor = async () => {
  return await API.get("/appointment/counselor/schedule");
};
export const getAllAppointments = async () => {
  return await API.get("/appointment/allappointments");
};
// services/api.js
// Example implementations:

export const getAvailableSlotsForCounselor = (counselorId) =>{
  return API.get(`/availability/${counselorId}`);}

export const updateAppointmentById = (id, payload) =>{
  return API.put(`/appointment/${id}/reschedule`, payload);}


export const cancelAppointmentById = (id) => {
  return API.put(`/appointment/${id}/cancel`);
};
export const rescheduleAppointmentById = (data) =>
  axios.put("appointment/reschedule", data);

// export const getAvailabilityForCounselor = (counselorId) =>{
//   axios.get(`/availability?counselor_id=${counselorId}`);}

export const getAvailabilityForCounselor = (counselorId) => {
  const token = localStorage.getItem("token");
  return axios.get(`/availability/${counselorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const submitSessionRating = (appointmentId, data) => {
  return axios.post(`appointment/${appointmentId}/rate`, data);
};
// Or if you want to keep them separate (recommended):
export default API;
