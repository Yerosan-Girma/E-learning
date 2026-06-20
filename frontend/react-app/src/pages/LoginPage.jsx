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
                      Password
                    </label>
                    <input
                      id="studentPassword"
                      type="password"
                      className="form-control"
                      required
                      value={studentForm.password}
                      onChange={(event) =>
                        setStudentForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Please wait..." : "Continue"}
                  </button>
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
                      Password
                    </label>
                    <input
                      id="staffPassword"
                      type="password"
                      className="form-control"
                      required
                      value={staffForm.password}
                      onChange={(event) =>
                        setStaffForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </button>
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
