import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GOOGLE_AUTH_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
    : "http://localhost:5000") + "/api/auth/google";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, notify, isLoggedIn, dashboardPath } = useAuth();

  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
  });

  useEffect(() => {
    if (isLoggedIn) navigate(dashboardPath);
  }, [isLoggedIn, dashboardPath, navigate]);

  const switchTab = (next) => {
    setTab(next);
    setShowPwd(false);
    setShowConfirm(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(signInForm);
      if (result?.success) navigate(result.redirectTo);
    } catch (err) {
      notify(err.message || "Login failed. Please check your credentials.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpForm.password !== signUpForm.confirmPassword) {
      notify("Passwords do not match.", "danger");
      return;
    }
    if (signUpForm.password.length < 6) {
      notify("Password must be at least 6 characters.", "danger");
      return;
    }
    setLoading(true);
    try {
      const result = await signup({ ...signUpForm, role: "student" });
      if (result?.success) navigate(result.redirectTo);
    } catch (err) {
      const msg = err.details?.length
        ? err.details.map((d) => d.msg).join(". ")
        : err.message || "Registration failed. Please try again.";
      notify(msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5">

              {/* Logo */}
              <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none">
                  <span className="fw-bold fs-4 text-primary">
                    <i className="fas fa-graduation-cap me-2" />EduLearn
                  </span>
                </Link>
                <p className="text-muted small mt-2 mb-0">
                  {tab === "signin" ? "Sign in to your account" : "Create your account"}
                </p>
              </div>

              {/* Sign In / Sign Up tabs */}
              <ul className="nav nav-pills nav-fill mb-4"
                style={{ background: "#f1f3f5", padding: "4px", borderRadius: "8px" }}>
                <li className="nav-item">
                  <button type="button"
                    className={`nav-link py-2 ${tab === "signin" ? "active shadow-sm" : "text-muted"}`}
                    style={{ borderRadius: "6px", fontWeight: 500 }}
                    onClick={() => switchTab("signin")}>
                    Sign In
                  </button>
                </li>
                <li className="nav-item">
                  <button type="button"
                    className={`nav-link py-2 ${tab === "signup" ? "active shadow-sm" : "text-muted"}`}
                    style={{ borderRadius: "6px", fontWeight: 500 }}
                    onClick={() => switchTab("signup")}>
                    Sign Up
                  </button>
                </li>
              </ul>

              {/* Google */}
              <a href={GOOGLE_AUTH_URL}
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 mb-3">
                <GoogleIcon />
                {tab === "signin" ? "Continue with Google" : "Sign up with Google"}
              </a>

              <div className="d-flex align-items-center mb-3">
                <hr className="flex-grow-1 m-0" />
                <span className="px-3 text-muted small">or</span>
                <hr className="flex-grow-1 m-0" />
              </div>

              {/* ── Sign In form ── */}
              {tab === "signin" && (
                <form onSubmit={handleSignIn} noValidate>
                  <div className="mb-3">
                    <label htmlFor="si-email" className="form-label fw-medium">Email address</label>
                    <input id="si-email" type="email" className="form-control" required
                      autoComplete="email" placeholder="you@example.com"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="si-password" className="form-label fw-medium">Password</label>
                    <div className="input-group">
                      <input id="si-password" type={showPwd ? "text" : "password"}
                        className="form-control" required autoComplete="current-password"
                        placeholder="Your password" value={signInForm.password}
                        onChange={(e) => setSignInForm((p) => ({ ...p, password: e.target.value }))} />
                      <button type="button" className="btn btn-outline-secondary" tabIndex={-1}
                        aria-label={showPwd ? "Hide password" : "Show password"}
                        onClick={() => setShowPwd((v) => !v)}>
                        {showPwd ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Signing in…</>
                      : "Sign In"}
                  </button>
                  <p className="text-center text-muted small mt-3 mb-0">
                    Don't have an account?{" "}
                    <button type="button" className="btn btn-link btn-sm p-0"
                      onClick={() => switchTab("signup")}>Sign up</button>
                  </p>
                </form>
              )}

              {/* ── Sign Up form ── */}
              {tab === "signup" && (
                <form onSubmit={handleSignUp} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Full name</label>
                    <input type="text" className="form-control" required autoComplete="name"
                      placeholder="John Doe" value={signUpForm.fullName}
                      onChange={(e) => setSignUpForm((p) => ({ ...p, fullName: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Email address</label>
                    <input type="email" className="form-control" required autoComplete="email"
                      placeholder="you@example.com" value={signUpForm.email}
                      onChange={(e) => setSignUpForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Password</label>
                    <div className="input-group">
                      <input type={showPwd ? "text" : "password"} className="form-control" required
                        autoComplete="new-password" placeholder="At least 6 characters"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm((p) => ({ ...p, password: e.target.value }))} />
                      <button type="button" className="btn btn-outline-secondary" tabIndex={-1}
                        aria-label={showPwd ? "Hide password" : "Show password"}
                        onClick={() => setShowPwd((v) => !v)}>
                        {showPwd ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Confirm password</label>
                    <div className="input-group">
                      <input type={showConfirm ? "text" : "password"} className="form-control" required
                        autoComplete="new-password" placeholder="Repeat your password"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
                      <button type="button" className="btn btn-outline-secondary" tabIndex={-1}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        onClick={() => setShowConfirm((v) => !v)}>
                        {showConfirm ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Creating account…</>
                      : "Create Account"}
                  </button>
                  <p className="text-center text-muted small mt-3 mb-0">
                    Already have an account?{" "}
                    <button type="button" className="btn btn-link btn-sm p-0"
                      onClick={() => switchTab("signin")}>Sign in</button>
                  </p>
                </form>
              )}

            </div>
          </div>
          <div className="text-center mt-3">
            <Link to="/" className="text-decoration-none text-muted small">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
