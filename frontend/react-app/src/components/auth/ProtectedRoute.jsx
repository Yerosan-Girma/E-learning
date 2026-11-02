import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { isLoggedIn, role, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Administrators have superuser access to view any role dashboard (admin, student, teacher)
  if (role === "admin") {
    return children;
  }

  // If role is not allowed for this route:
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If a student or teacher tried to open an admin dashboard
    if (allowedRoles.includes("admin")) {
      return (
        <div
          className="container py-5 text-center my-auto"
          style={{
            minHeight: "65vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center text-primary rounded-circle bg-primary bg-opacity-10 mb-4"
            style={{ width: "70px", height: "70px" }}
          >
            <i className="fas fa-shield-halved fa-2x text-primary" />
          </div>
          <h3 className="fw-bold text-dark mb-2">Administrator Access Required</h3>
          <p className="text-muted mb-4 small" style={{ maxWidth: "480px" }}>
            You are currently signed in as <strong>{user?.email}</strong> (Role:{" "}
            <span className="badge bg-secondary text-uppercase">{role}</span>). This area is restricted to
            EduLearn platform administrators.
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Link to="/login" className="btn btn-primary px-4 rounded-pill">
              <i className="fas fa-arrow-right-to-bracket me-2" /> Log In with Admin Account
            </Link>
            <Link to="/dashboard/student" className="btn btn-outline-secondary px-4 rounded-pill">
              <i className="fas fa-gauge me-2" /> Go to Student Dashboard
            </Link>
          </div>
        </div>
      );
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
