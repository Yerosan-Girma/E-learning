import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, notify, isLoggedIn, dashboardPath } = useAuth();

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate(dashboardPath);
    }
  }, [dashboardPath, isLoggedIn, navigate]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await login(loginForm);
      if (result?.success) {
        navigate(result.redirectTo);
      }
    } catch (error) {
      notify(error.message || "Login failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await signup(signupForm);
      if (result?.success) {
        navigate(result.redirectTo);
      }
    } catch (error) {
      notify(error.message || "Registration failed", "danger");
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
                <p className="text-muted mb-0">Login or register to access student, teacher, or admin dashboards.</p>
              </div>

              <ul className="nav nav-pills nav-fill mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "login" ? "active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab("login")}
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "register" ? "active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab("register")}
                  >
                    Register
                  </button>
                </li>
              </ul>

              {activeTab === "login" ? (
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label htmlFor="loginEmailPage" className="form-label">
                      Email
                    </label>
                    <input
                      id="loginEmailPage"
                      type="email"
                      className="form-control"
                      required
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="loginPasswordPage" className="form-label">
                      Password
                    </label>
                    <input
                      id="loginPasswordPage"
                      type="password"
                      className="form-control"
                      required
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit}>
                  <div className="mb-3">
                    <label htmlFor="registerName" className="form-label">
                      Full Name
                    </label>
                    <input
                      id="registerName"
                      type="text"
                      className="form-control"
                      required
                      value={signupForm.fullName}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, fullName: event.target.value }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="registerEmail" className="form-label">
                      Email
                    </label>
                    <input
                      id="registerEmail"
                      type="email"
                      className="form-control"
                      required
                      value={signupForm.email}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="registerRole" className="form-label">
                      Role
                    </label>
                    <select
                      id="registerRole"
                      className="form-select"
                      value={signupForm.role}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, role: event.target.value }))
                      }
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="registerPassword" className="form-label">
                        Password
                      </label>
                      <input
                        id="registerPassword"
                        type="password"
                        className="form-control"
                        required
                        value={signupForm.password}
                        onChange={(event) =>
                          setSignupForm((prev) => ({ ...prev, password: event.target.value }))
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="registerConfirmPassword" className="form-label">
                        Confirm Password
                      </label>
                      <input
                        id="registerConfirmPassword"
                        type="password"
                        className="form-control"
                        required
                        value={signupForm.confirmPassword}
                        onChange={(event) =>
                          setSignupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
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
