const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("stemaccess_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("stemaccess_token", token);
  else localStorage.removeItem("stemaccess_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty body is fine
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Auth (FR1)
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  // Profile (FR2)
  getProfile: () => request("/profile"),
  updateProfile: (payload) => request("/profile", { method: "PUT", body: payload }),

  // Opportunities (FR3, FR7)
  listOpportunities: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/opportunities${qs ? `?${qs}` : ""}`, { auth: false });
  },
  getOpportunity: (id) => request(`/opportunities/${id}`, { auth: false }),
  actOnOpportunity: (id, status) => request(`/opportunities/${id}/action`, { method: "POST", body: { status } }),
  createOpportunity: (payload) => request("/opportunities", { method: "POST", body: payload }),
  updateOpportunity: (id, payload) => request(`/opportunities/${id}`, { method: "PUT", body: payload }),
  deleteOpportunity: (id) => request(`/opportunities/${id}`, { method: "DELETE" }),

  // Recommendations (FR4)
  getRecommendations: () => request("/recommendations"),
  getSkillGaps: () => request("/recommendations/skill-gaps"),
  getRoadmap: () => request("/recommendations/roadmap"),

  // Mentors (FR5)
  listMentors: () => request("/mentors"),
  requestMentor: (mentorId, message) => request(`/mentors/${mentorId}/request`, { method: "POST", body: { message } }),
  respondToRequest: (requestId, status) => request(`/mentors/requests/${requestId}`, { method: "PUT", body: { status } }),
  myMentorshipRequests: () => request("/mentors/requests/mine"),
  listMessages: (requestId) => request(`/mentors/requests/${requestId}/messages`),
  sendMessage: (requestId, body) => request(`/mentors/requests/${requestId}/messages`, { method: "POST", body: { body } }),

  // Applications / Dashboard (FR6)
  myApplications: () => request("/applications"),
  dashboard: () => request("/applications/dashboard"),

  // Notifications (FR8)
  listNotifications: () => request("/notifications"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "PUT" }),

  // Admin (FR9)
  adminListUsers: () => request("/admin/users"),
  adminUpdateUser: (id, payload) => request(`/admin/users/${id}`, { method: "PUT", body: payload }),
  adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  adminPendingOpportunities: () => request("/admin/opportunities/pending"),
  adminSetOpportunityStatus: (id, status) => request(`/admin/opportunities/${id}/status`, { method: "PUT", body: { status } }),
  adminReports: () => request("/admin/reports"),
};
