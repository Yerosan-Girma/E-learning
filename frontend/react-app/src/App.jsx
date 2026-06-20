import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SiteFooter from "./components/layout/SiteFooter";
import SiteNavbar from "./components/layout/SiteNavbar";
import { useAuth } from "./context/AuthContext";
import PaymentPage from "./pages/PaymentPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CoursesPage from "./pages/CoursesPage";
import HomePage from "./pages/HomePage";
import LearningPage from "./pages/LearningPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0 });
  }, [location.hash, location.pathname]);

  return null;
}

function LegacyCourseRedirect() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "1";
  return <Navigate to={`/courses/${id}`} replace />;
}

function LegacyLearningRedirect() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("course") || "1";
  return <Navigate to={`/courses/${id}/dashboard`} replace />;
}

function LegacyLearningRouteRedirect() {
  const { courseId } = useParams();
  return <Navigate to={`/courses/${courseId}/dashboard`} replace />;
}

function DashboardRedirect() {
  const { isLoggedIn, dashboardPath } = useAuth();
  return <Navigate to={isLoggedIn ? dashboardPath : "/login"} replace />;
}

function AppShell() {
  const location = useLocation();
  const hideLayout =
    (location.pathname.startsWith("/courses/") && location.pathname.endsWith("/dashboard")) ||
    location.pathname.startsWith("/learning/") ||
    location.pathname === "/login";

  return (
    <>
      <ScrollManager />
      {!hideLayout && <SiteNavbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />

        <Route
          path="/payment/:courseId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:courseId/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <LearningPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning/:courseId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <LegacyLearningRouteRedirect />
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/courses.html" element={<Navigate to="/courses" replace />} />
        <Route path="/course-single.html" element={<LegacyCourseRedirect />} />
        <Route path="/learning.html" element={<LegacyLearningRedirect />} />
        <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!hideLayout && <SiteFooter />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
