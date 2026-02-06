import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup/', data),
  login: (data) => api.post('/auth/login/', data),
  getUser: () => api.get('/auth/me/'),
};

export const profileAPI = {
  getProfile: () => api.get('/profiles/me/'),
  updateProfile: (data) => api.patch('/profiles/me/', data),
  
  getEducation: () => api.get('/education/'),
  createEducation: (data) => api.post('/education/', data),
  updateEducation: (id, data) => api.patch(`/education/${id}/`, data),
  deleteEducation: (id) => api.delete(`/education/${id}/`),
  
  getProjects: () => api.get('/projects/'),
  createProject: (data) => api.post('/projects/', data),
  updateProject: (id, data) => api.patch(`/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/projects/${id}/`),
  
  getExperience: () => api.get('/experience/'),
  createExperience: (data) => api.post('/experience/', data),
  updateExperience: (id, data) => api.patch(`/experience/${id}/`, data),
  deleteExperience: (id) => api.delete(`/experience/${id}/`),
  
  getCertifications: () => api.get('/certifications/'),
  createCertification: (data) => api.post('/certifications/', data),
  
  getVolunteering: () => api.get('/volunteering/'),
  createVolunteering: (data) => api.post('/volunteering/', data),
  
  getSkills: () => api.get('/skills/'),
  addSkill: (data) => api.post('/skills/', data),
};

export const jobAPI = {
  getJobs: () => api.get('/jobs/'),
  getJob: (id) => api.get(`/jobs/${id}/`),
  getPillars: () => api.get('/pillars/'),
  getSkills: () => api.get('/skills/'),
};

export const readinessAPI = {
  getScores: () => api.get('/scores/'),
  calculate: (jobRoleId, companyLevel = 'startup') => 
    api.post('/readiness/calculate/', { 
      job_role_id: jobRoleId, 
      company_level: companyLevel 
    }),
};

export default api;
