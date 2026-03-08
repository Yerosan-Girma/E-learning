import { getAuthToken } from "../utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", token, body, isFormData = false } = {}) {
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const authToken = token || getAuthToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (networkError) {
    const error = new Error(
      `Cannot connect to backend API at ${API_BASE_URL}. Start backend and verify port/CORS.`
    );
    error.status = 0;
    throw error;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    error.details = payload.details || null;
    throw error;
  }

  return payload.data || {};
}

export const api = {
  baseUrl: API_BASE_URL,
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  profile: () => request("/auth/me"),

  getDashboard: (role) => request(`/dashboard/${role}`),

  listCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/courses${query ? `?${query}` : ""}`);
  },
  getCourse: (courseId) => request(`/courses/${courseId}`),
  createCourse: (payload) => request("/courses", { method: "POST", body: payload }),

  listCourseLessons: (courseId) => request(`/courses/${courseId}/lessons`),
  createLesson: (courseId, payload) =>
    request(`/courses/${courseId}/lessons`, { method: "POST", body: payload }),
  getLesson: (lessonId) => request(`/lessons/${lessonId}`),
  markLessonCompletion: (lessonId, completed) =>
    request(`/lessons/${lessonId}/completion`, {
      method: "PATCH",
      body: { completed },
    }),

  enrollCourse: (courseId) => request(`/enrollments/${courseId}`, { method: "POST" }),
  myEnrollments: () => request("/enrollments/me/list"),
  allEnrollments: (status = "") =>
    request(`/enrollments${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  updateEnrollmentStatus: (enrollmentId, status) =>
    request(`/enrollments/${enrollmentId}/status`, {
      method: "PATCH",
      body: { status },
    }),

  initializePayment: (courseId, gateway) =>
    request(`/payments/courses/${courseId}/initialize`, {
      method: "POST",
      body: { gateway },
    }),
  submitManualProof: (courseId, { screenshot, transactionId, notes }) => {
    const form = new FormData();
    form.append("screenshot", screenshot);
    if (transactionId) form.append("transactionId", transactionId);
    if (notes) form.append("notes", notes);

    return request(`/payments/courses/${courseId}/manual-proof`, {
      method: "POST",
      isFormData: true,
      body: form,
    });
  },
  myPayments: () => request("/payments/me"),
  allPayments: () => request("/payments"),
};
