import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import AuthModals from "./components/auth/AuthModals";
import SiteFooter from "./components/layout/SiteFooter";
import SiteNavbar from "./components/layout/SiteNavbar";
import DashboardPage from "./pages/DashboardPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CoursesPage from "./pages/CoursesPage";
import HomePage from "./pages/HomePage";
import LearningPage from "./pages/LearningPage";
import NotFoundPage from "./pages/NotFoundPage";

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
  return <Navigate to={`/learning/${id}`} replace />;
}

function AppShell() {
  const location = useLocation();
  const isLearningPage = location.pathname.startsWith("/learning/");

  return (
    <>
      <ScrollManager />
      {!isLearningPage && <SiteNavbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/learning/:courseId" element={<LearningPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/courses.html" element={<Navigate to="/courses" replace />} />
        <Route path="/course-single.html" element={<LegacyCourseRedirect />} />
        <Route path="/learning.html" element={<LegacyLearningRedirect />} />
        <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!isLearningPage && <SiteFooter />}
      <AuthModals />
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
