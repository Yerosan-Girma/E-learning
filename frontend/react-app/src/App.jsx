import { Component, Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SiteFooter from "./components/layout/SiteFooter";
import SiteNavbar from "./components/layout/SiteNavbar";
import { useAuth } from "./context/AuthContext";

// Lazy-loaded Pages for Route Code-Splitting & High Performance
const HomePage = lazy(() => import("./pages/HomePage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailsPage = lazy(() => import("./pages/CourseDetailsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const LearningPage = lazy(() => import("./pages/LearningPage"));
const StudentDashboardPage = lazy(() => import("./pages/StudentDashboardPage"));
const TeacherDashboardPage = lazy(() => import("./pages/TeacherDashboardPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Clean, branded route transition loader
function PageLoader() {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center w-100"
      style={{ minHeight: "65vh" }}
      role="status"
      aria-live="polite"
    >
      <div
        className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm mb-3"
        style={{
          width: "48px",
          height: "48px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        }}
      >
        <i className="fas fa-graduation-cap fa-lg" />
      </div>
      <div className="spinner-border text-primary spinner-border-sm mb-2" role="status">
        <span className="visually-hidden">Loading page...</span>
      </div>
      <small className="text-muted fw-medium">Loading EduLearn...</small>
    </div>
  );
}

// React Error Boundary for resilient route handling
class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Route Error Boundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="container py-5 text-center my-auto"
          style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
        >
          <div
            className="d-flex align-items-center justify-content-center text-danger rounded-circle bg-danger bg-opacity-10 mb-4"
            style={{ width: "70px", height: "70px" }}
          >
            <i className="fas fa-triangle-exclamation fa-2x" />
          </div>
          <h3 className="fw-bold text-dark mb-2">Something went wrong</h3>
          <p className="text-muted mb-4 small" style={{ maxWidth: "460px" }}>
            An unexpected error occurred while rendering this page. You can try refreshing or returning to the home page.
          </p>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-primary px-4 rounded-pill" onClick={this.handleReload}>
              <i className="fas fa-rotate-right me-2" /> Reload Page
            </button>
            <a href="/" className="btn btn-outline-secondary px-4 rounded-pill">
              <i className="fas fa-home me-2" /> Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Robust ScrollManager handling path & hash transitions smoothly
function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      let tries = 0;
      const attemptScroll = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (tries < 10) {
          tries++;
          requestAnimationFrame(attemptScroll);
        }
      };
      attemptScroll();
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

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

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken, notify } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const handleGoogleLogin = async () => {
      try {
        const result = await loginWithToken(token);
        if (result?.success) {
          navigate(result.redirectTo, { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Google OAuth error:", error);
        notify("Failed to login with Google", "danger");
        navigate("/login", { replace: true });
      }
    };

    handleGoogleLogin();
  }, [loginWithToken, navigate, notify, searchParams]);

  return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">Completing Google authentication...</p>
    </div>
  );
}

function AppShell() {
  const location = useLocation();

  // Full-screen pages without main navbar/footer
  const hideLayout =
    (location.pathname.startsWith("/courses/") && location.pathname.endsWith("/dashboard")) ||
    location.pathname.startsWith("/learning/") ||
    location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/verify-email" ||
    location.pathname === "/auth/callback";

  return (
    <>
      <ScrollManager />
      {!hideLayout && <SiteNavbar />}

      <RouteErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Core Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<Navigate to="/contact#faq" replace />} />

            {/* Courses Exploration & Details */}
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailsPage />} />

            {/* Authentication Flow */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />

            {/* Payment Verification */}
            <Route
              path="/payment/:courseId"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />

            {/* Interactive Learning Tracker */}
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

            {/* Role Dashboards */}
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

            {/* Legacy & Shortcut Redirects */}
            <Route path="/pricing" element={<Navigate to="/courses?price=free" replace />} />
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="/courses.html" element={<Navigate to="/courses" replace />} />
            <Route path="/course-single.html" element={<LegacyCourseRedirect />} />
            <Route path="/learning.html" element={<LegacyLearningRedirect />} />
            <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>

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
