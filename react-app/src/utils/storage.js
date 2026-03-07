const AUTH_KEYS = {
  loggedIn: "userLoggedIn",
  name: "userName",
  email: "userEmail",
};

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAuthUser() {
  const loggedIn = localStorage.getItem(AUTH_KEYS.loggedIn) === "true";
  if (!loggedIn) return null;

  const email = localStorage.getItem(AUTH_KEYS.email) || "student@edulearn.com";
  const name = localStorage.getItem(AUTH_KEYS.name) || "Student";

  return { name, email };
}

export function setAuthUser(user) {
  localStorage.setItem(AUTH_KEYS.loggedIn, "true");
  localStorage.setItem(AUTH_KEYS.name, user.name);
  localStorage.setItem(AUTH_KEYS.email, user.email);
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_KEYS.loggedIn);
  localStorage.removeItem(AUTH_KEYS.name);
  localStorage.removeItem(AUTH_KEYS.email);
}

export function getEnrolledCourses() {
  return readJson("enrolledCourses", []);
}

export function setEnrolledCourses(courses) {
  writeJson("enrolledCourses", courses);
}

export function getCoursePayments() {
  return readJson("coursePayments", []);
}

export function setCoursePayments(payments) {
  writeJson("coursePayments", payments);
}

export function getLectureProgress() {
  return readJson("lectureProgress", {});
}

export function setLectureProgress(progress) {
  writeJson("lectureProgress", progress);
}

export function getViewedLectures() {
  return readJson("viewedLectures", {});
}

export function setViewedLectures(viewed) {
  writeJson("viewedLectures", viewed);
}

export function getCourseEnrollment(courseId) {
  const enrollments = getEnrolledCourses();
  return enrollments.find((item) => Number(item.id) === Number(courseId)) || null;
}

export function upsertEnrollment(record) {
  const enrollments = getEnrolledCourses();
  const index = enrollments.findIndex((item) => Number(item.id) === Number(record.id));

  if (index === -1) {
    enrollments.push(record);
  } else {
    enrollments[index] = { ...enrollments[index], ...record };
  }

  setEnrolledCourses(enrollments);
  return enrollments;
}

export function addPaymentRecord(record) {
  const payments = getCoursePayments();
  payments.unshift(record);
  setCoursePayments(payments);
  return payments;
}
