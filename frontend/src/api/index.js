// src/api/index.js — centralized API calls

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (method, path, data = null, isFormData = false) => {
  const headers = { ...getAuthHeader() };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const config = { method, headers };
  if (data) config.body = isFormData ? data : JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${path}`, config);

  // Handle token refresh on 401
  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
      const retryRes = await fetch(`${BASE_URL}${path}`, { ...config, headers });
      if (!retryRes.ok) throw await retryRes.json();
      return retryRes.json();
    }
    localStorage.clear();
    window.location.href = '/login';
    return;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw json;
  return json;
};

const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return false;
  const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return true;
  }
  return false;
};

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => request('POST', '/auth/register/', data),
  login: (data) => request('POST', '/auth/login/', data),
  googleOAuth: (data) => request('POST', '/auth/google/', data),
  getProfile: () => request('GET', '/auth/profile/'),
  updateProfile: (data) => request('PATCH', '/auth/profile/', data),
  requestPasswordReset: (data) => request('POST', '/auth/password-reset/request/', data),
  confirmPasswordReset: (data) => request('POST', '/auth/password-reset/confirm/', data),
  changePassword: (data) => request('POST', '/auth/password/change/', data),
};

// ── Crops ─────────────────────────────────────────────────────────
export const cropsAPI = {
  list: (params = '') => request('GET', `/crops/?${params}`),
  get: (id) => request('GET', `/crops/${id}/`),
  create: (data) => request('POST', '/crops/', data),
  update: (id, data) => request('PATCH', `/crops/${id}/`, data),
  delete: (id) => request('DELETE', `/crops/${id}/`),
  uploadMedia: (cropId, formData) => request('POST', `/crops/${cropId}/media/`, formData, true),
  deleteMedia: (cropId, mediaId) => request('DELETE', `/crops/${cropId}/media/`, { media_id: mediaId }),
  mine: () => request('GET', '/crops/mine/'),
  saved: () => request('GET', '/crops/saved/'),
  toggleSave: (cropId) => request('POST', `/crops/${cropId}/save/`),
  categories: () => request('GET', '/crops/categories/'),
  sendInquiry: (data) => request('POST', '/crops/inquiries/send/', data),
  myInquiries: () => request('GET', '/crops/inquiries/received/'),
};

// ── Dashboard ─────────────────────────────────────────────────────
export const dashboardAPI = {
  farmer: () => request('GET', '/dashboard/farmer/'),
  customer: () => request('GET', '/dashboard/customer/'),
};
