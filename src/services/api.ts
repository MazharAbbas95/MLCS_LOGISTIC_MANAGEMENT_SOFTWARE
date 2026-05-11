import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mlcs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Token Expiration globally
    if (error.response && error.response.status === 401) {
      console.warn('API returned 401 Unauthorized. Session likely expired.');
      // Dispatch a custom event that AuthContext can listen to
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    const message = error.response?.data?.message || 'Something went wrong';
    const errors = error.response?.data?.errors;
    
    // Create a custom error object that carries the backend validation errors
    const customError = new Error(message);
    (customError as any).errors = errors;
    (customError as any).status = error.response?.status;
    
    return Promise.reject(customError);
  }
);

export const vehicleApi = {
  getAll: (cursor?: number, limit?: number) => 
    api.get('/vehicle-records', { params: { cursor, limit } }).then(res => res.data),
  getById: (id: number) => api.get(`/vehicle-records/${id}`).then(res => res.data.data),
  create: (data: any) => api.post('/vehicle-records', data).then(res => res.data.data),
  update: (id: number, data: any) => api.put(`/vehicle-records/${id}`, data).then(res => res.data.data),
  delete: (id: number) => api.delete(`/vehicle-records/${id}`).then(res => res.data),
};

export const expenseApi = {
  getAll: (cursor?: number, limit?: number) => 
    api.get('/expenses', { params: { cursor, limit } }).then(res => res.data),
  create: (data: any) => api.post('/expenses', data).then(res => res.data.data),
  delete: (id: number) => api.delete(`/expenses/${id}`).then(res => res.data),
};

export const biltyApi = {
  getAll: (cursor?: number, limit?: number, search?: string) => 
    api.get('/bilties', { params: { cursor, limit, search } }).then(res => res.data),
  create: (data: any) => api.post('/bilties', data).then(res => res.data.data),
  delete: (id: number) => api.delete(`/bilties/${id}`).then(res => res.data),
};

export const letterpadApi = {
  getAll: (cursor?: number, limit?: number) => 
    api.get('/letterpads', { params: { cursor, limit } }).then(res => res.data),
  create: (data: any) => api.post('/letterpads', data).then(res => res.data.data),
  delete: (id: number) => api.delete(`/letterpads/${id}`).then(res => res.data),
};

export default api;
