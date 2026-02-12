import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/admin')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const patientsAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

export const appointmentsAPI = {
  getByPatient: (patientId) => api.get(`/patients/${patientId}/appointments`),
  create: (patientId, data) => api.post(`/patients/${patientId}/appointments`, data),
  update: (patientId, appointmentId, data) =>
    api.put(`/patients/${patientId}/appointments/${appointmentId}`, data),
  delete: (patientId, appointmentId) =>
    api.delete(`/patients/${patientId}/appointments/${appointmentId}`),
};

export const prescriptionsAPI = {
  getByPatient: (patientId) => api.get(`/patients/${patientId}/prescriptions`),
  create: (patientId, data) => api.post(`/patients/${patientId}/prescriptions`, data),
  update: (patientId, prescriptionId, data) =>
    api.put(`/patients/${patientId}/prescriptions/${prescriptionId}`, data),
  delete: (patientId, prescriptionId) =>
    api.delete(`/patients/${patientId}/prescriptions/${prescriptionId}`),
};

export const referenceAPI = {
  getMedications: () => api.get('/reference/medications'),
  getDosages: () => api.get('/reference/dosages'),
};

export default api;
