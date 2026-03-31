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
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: createHeaders(token, body !== undefined),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Unable to reach the server. Check the deployed backend URL and allowed origins.')
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {}
  const responseText = contentType.includes('application/json') ? '' : await response.text().catch(() => '')

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}.`
    if (payload && Array.isArray(payload.detail)) {
      errorMessage = payload.detail.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ')
    } else if (payload) {
      errorMessage = payload.detail || payload.message || payload.error_description || responseText || errorMessage
    } else {
      errorMessage = responseText || errorMessage
    }

    throw new Error(errorMessage)
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
  trackComplaint: (refId) => request(`/api/v1/complaints/track/${encodeURIComponent(refId)}`),
}
