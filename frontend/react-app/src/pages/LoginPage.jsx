import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { accessLearner, login, notify, isLoggedIn, dashboardPath } = useAuth();

  const [activeTab, setActiveTab] = useState("student");
  const [loading, setLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [staffForm, setStaffForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(dashboardPath);
    }
  }, [dashboardPath, isLoggedIn, navigate]);

  const handleStudentSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await accessLearner(studentForm);
      if (result?.success) {
        navigate(result.redirectTo);
      }
    } catch (error) {
      notify(error.message || "Could not access student account", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await login(staffForm);
      if (result?.success) {
        navigate(result.redirectTo);
      }
    } catch (error) {
      notify(error.message || "Login failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-xl-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">Account Access</h2>
              </div>

              <ul className="nav nav-pills nav-fill mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "student" ? "active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab("student")}
                  >
                    Student
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "staff" ? "active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab("staff")}
                  >
                    Admin / Teacher
                  </button>
                </li>
              </ul>

              {activeTab === "student" ? (
                <form onSubmit={handleStudentSubmit}>
                  <div className="mb-3">
                    <label htmlFor="studentName" className="form-label">
                      Full Name
                    </label>
                    <input
                      id="studentName"
                      type="text"
                      className="form-control"
                      required
                      value={studentForm.fullName}
                      onChange={(event) =>
                        setStudentForm((prev) => ({ ...prev, fullName: event.target.value }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="studentEmail" className="form-label">
                      Email
                    </label>
                    <input
                      id="studentEmail"
                      type="email"
                      className="form-control"
                      required
                      value={studentForm.email}
                      onChange={(event) =>
                        setStudentForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="studentPassword" className="form-label">
                      Password <span className="text-muted">(Optional - login with email only)</span>
                    </label>
                    <input
                      id="studentPassword"
                      type="password"
                      className="form-control"
                      value={studentForm.password}
                      onChange={(event) =>
                        setStudentForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                    {loading ? "Please wait..." : "Continue"}
                  </button>

                  <div className="text-center mb-3">
                    <span className="text-muted">or</span>
                  </div>

                  <a
                    href="http://localhost:5000/api/auth/google"
                    className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </a>
                </form>
              ) : (
                <form onSubmit={handleStaffSubmit}>
                  <div className="mb-3">
                    <label htmlFor="staffEmail" className="form-label">
                      Email
                    </label>
                    <input
                      id="staffEmail"
                      type="email"
                      className="form-control"
                      required
                      value={staffForm.email}
                      onChange={(event) =>
                        setStaffForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="staffPassword" className="form-label">
                      Password <span className="text-muted">(Required for Admin, Optional for Teachers)</span>
                    </label>
                    <input
                      id="staffPassword"
                      type="password"
                      className="form-control"
                      value={staffForm.password}
                      onChange={(event) =>
                        setStaffForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </button>

                  <div className="text-center mb-3">
                    <span className="text-muted">or</span>
                  </div>

                  <a
                    href="http://localhost:5000/api/auth/google"
                    className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </a>
                </form>
              )}

              <div className="text-center mt-4">
                <Link to="/" className="text-decoration-none">
                  <i className="fas fa-arrow-left me-2" /> Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
