import axios from 'axios'

// Hardcoded to match docker-compose port mapping (8099 on host → 8000 in container)
const API_URL = 'http://localhost:8099'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  console.log(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => {
    console.log(`← ${res.status} ${res.config.url}`)
    return res
  },
  (err) => {
    console.error(`← ERROR ${err.response?.status} ${err.config?.url}:`, err.response?.data)
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──
export const authAPI = {
  register: (email: string, full_name: string, password: string) =>
    api.post('/auth/register', { email, full_name, password }),
  login: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
}

// ── Transactions ──
export const txAPI = {
  list: (params?: { category?: string; month?: number; year?: number }) =>
    api.get('/transactions/', { params }),
  create: (data: {
    description: string
    amount: number
    category?: string
    date: string
    notes?: string
  }) => api.post('/transactions/', data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
  uploadCSV: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/transactions/upload-csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getAnomalies: () => api.get('/transactions/anomalies'),
}

// ── Insights ──
export const insightsAPI = {
  getSummary: () => api.get('/insights/summary'),
  getAISummary: () => api.get('/insights/ai-summary'),
}
