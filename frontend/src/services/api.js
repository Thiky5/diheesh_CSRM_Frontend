import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const isAuthEndpoint = config.url && (config.url.startsWith('/auth/') || config.url.startsWith('auth/'));
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('csrm_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error unwrapping
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message =
      error.response?.data?.message ||
      (typeof error.response?.data?.data === 'string' ? error.response.data.data : null);
    if (!message) {
      if (error.response?.status === 403) {
        message = 'Access denied: Action forbidden or session expired. Please sign in again.';
      } else if (error.response?.status === 401) {
        message = 'Authentication required: Please sign in to perform this action.';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const resourceService = {
  getAll: (params) => api.get('/resources', { params }),
  getAvailable: (startTime, endTime) =>
    api.get('/resources/available', {
      params: {
        startTime: startTime ? startTime.toISOString() : undefined,
        endTime: endTime ? endTime.toISOString() : undefined,
      },
    }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

export const bookingService = {
  getAll: () => api.get('/bookings'),
  getMyBookings: () => api.get('/bookings/my'),
  getByResource: (resourceId) => api.get(`/bookings/resource/${resourceId}`),
  create: (data) => api.post('/bookings', data),
  checkConflict: (data) => api.post('/bookings/check-conflict', data),
  modify: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

export const adminService = {
  getUsers: (status) => api.get('/admin/users', { params: { status } }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserStatus: (id, status, role) =>
    api.patch(`/admin/users/${id}/status`, { status, role }),
  updateUserRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, null, { params: { role } }),
  getReports: () => api.get('/admin/reports'),
  getAllBookings: () => api.get('/admin/bookings'),
};

export const auditService = {
  getLogs: (params) => api.get('/audit', { params }),
};

export const notificationService = {
  getMyNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
};

export const serviceRequestService = {
  create: (data) => api.post('/services', data),
  getMy: () => api.get('/services/my'),
  getAll: () => api.get('/services'),
  updateStatus: (id, status, adminNotes) =>
    api.patch(`/services/${id}/status`, { status, adminNotes }),
};

export default api;
