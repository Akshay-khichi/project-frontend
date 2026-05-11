import axios from 'axios'
import { useStore } from '@/store/useStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // for HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
})

// ── In-memory token (never localStorage) ────────
let _accessToken = null
export const setAccessToken  = (t) => { _accessToken = t }
export const getAccessToken  = ()  => _accessToken
export const clearAccessToken = () => { _accessToken = null }

// ── Request interceptor — attach Bearer token ────
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — silent token refresh ──
let _refreshing    = false
let _refreshQueue  = []

const processQueue = (error, token = null) => {
  _refreshQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else       prom.resolve(token)
  })
  _refreshQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (_refreshing) {
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      _refreshing = true

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken = data.accessToken
        setAccessToken(newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAccessToken()
        useStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        _refreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── API Methods ──────────────────────────────────
export const authAPI = {
  loginGoogle:  ()                => api.get('/auth/google'),
  loginEmail:   (creds)           => api.post('/auth/login', creds),
  register:     (data)            => api.post('/auth/register', data),
  logout:       ()                => api.post('/auth/logout'),
  me:           ()                => api.get('/auth/me'),
  refresh:      ()                => api.post('/auth/refresh'),
}

export const notesAPI = {
  list:         (params)          => api.get('/notes', { params }),
  get:          (id)              => api.get(`/notes/${id}`),
  getSignedUrl: (id)              => api.get(`/notes/${id}/view-url`),
  create:       (formData)        => api.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:       (id, data)        => api.put(`/notes/${id}`, data),
  remove:       (id)              => api.delete(`/notes/${id}`),
  restore:      (id)              => api.post(`/notes/${id}/restore`),
}

export const pyqsAPI = {
  list:         (params)          => api.get('/pyqs', { params }),
  get:          (id)              => api.get(`/pyqs/${id}`),
  getSignedUrl: (id)              => api.get(`/pyqs/${id}/view-url`),
  create:       (formData)        => api.post('/pyqs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:       (id, data)        => api.put(`/pyqs/${id}`, data),
  remove:       (id)              => api.delete(`/pyqs/${id}`),
}

export const categoriesAPI = {
  list:         (params)          => api.get('/categories', { params }),
  create:       (data)            => api.post('/categories', data),
  update:       (id, data)        => api.put(`/categories/${id}`, data),
  remove:       (id)              => api.delete(`/categories/${id}`),
}

export const bookmarksAPI = {
  list:         ()                => api.get('/users/bookmarks'),
  add:          (id)              => api.post(`/users/bookmarks/${id}`),
  remove:       (id)              => api.delete(`/users/bookmarks/${id}`),
}

export const premiumAPI = {
  getPlans:     ()                => api.get('/premium/plans'),
  createOrder:  (planId)          => api.post('/premium/create-order', { planId }),
  verifyPayment:(payload)         => api.post('/premium/verify', payload),
  status:       ()                => api.get('/premium/status'),
}

export const analyticsAPI = {
  overview:     ()                => api.get('/analytics/overview'),
  downloads:    ()                => api.get('/analytics/downloads'),
  topContent:   ()                => api.get('/analytics/top-content'),
  users:        ()                => api.get('/analytics/users'),
}

export const adminUsersAPI = {
  list:         (params)          => api.get('/users', { params }),
  updateRole:   (id, role)        => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, isActive)    => api.patch(`/users/${id}/status`, { isActive }),
  remove:       (id)              => api.delete(`/users/${id}`),
}
