const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

function createHeaders(token, hasBody) {
  const headers = {}

  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: createHeaders(token, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.detail || payload.message || 'Request failed.')
  }

  return payload
}

function queryString(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const built = search.toString()
  return built ? `?${built}` : ''
}

export const api = {
  signUp: (body) => request('/api/v1/auth/sign-up', { method: 'POST', body }),
  signIn: (body) => request('/api/v1/auth/sign-in', { method: 'POST', body }),
  getMe: (token) => request('/api/v1/auth/me', { token }),
  getMyComplaints: (token) => request('/api/v1/complaints', { token }),
  getMyComplaintStats: (token) => request('/api/v1/complaints/stats', { token }),
  createComplaint: (token, body) => request('/api/v1/complaints', { method: 'POST', token, body }),
  getAdminComplaints: (token, params) =>
    request(`/api/v1/admin/complaints${queryString(params)}`, { token }),
  getAdminStats: (token) => request('/api/v1/admin/stats', { token }),
  updateComplaint: (token, complaintId, body) =>
    request(`/api/v1/admin/complaints/${complaintId}`, { method: 'PATCH', token, body }),
  addComplaintNote: (token, complaintId, body) =>
    request(`/api/v1/admin/complaints/${complaintId}/notes`, { method: 'POST', token, body }),
}
