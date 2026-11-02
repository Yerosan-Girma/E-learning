import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const rawApiBase =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, "")
    : "http://localhost:5000/api";
const normalizedApiBase = rawApiBase.endsWith("/api") ? rawApiBase : `${rawApiBase}/api`;

const GOOGLE_CLIENT_ID = "846651054103-cjr8t8lun9glgpaba7ad8qqsb381v76f.apps.googleusercontent.com";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, notify, isLoggedIn, dashboardPath, loginWithToken } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      notify("Google sign-in was cancelled or failed. Please try again.", "danger");
    }
  }, [searchParams, notify]);

  const [tab, setTab] = useState("signin"); // "signin" | "signup" | "forgot"
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const gisInitializedRef = useRef(false);

  // Proactively ping backend to warm up Render if it's sleeping, and initialize Google Identity Services
  useEffect(() => {
    fetch(`${normalizedApiBase}/health`, { mode: "cors" }).catch(() => {});

    const initGis = () => {
      if (typeof window === "undefined" || !window.google?.accounts?.id || gisInitializedRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        gisInitializedRef.current = true;
      } catch (err) {
        console.warn("GIS initialization warning:", err.message);
      }
    };

    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      initGis();
    } else {
      const interval = setInterval(() => {
        if (typeof window !== "undefined" && window.google?.accounts?.id) {
          clearInterval(interval);
          initGis();
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) {
      notify("Google sign-in did not return valid credentials. Please try again.", "danger");
      return;
    }

    setGoogleLoading(true);
    setGoogleStatus("Authenticating with Google...");

    const wakeNoticeTimer = setTimeout(() => {
      setGoogleStatus("Connecting to server (waking up Render instance)... Please hold on a moment!");
    }, 2500);

    try {
      const result = await api.googleLoginWithToken(response.credential);
      clearTimeout(wakeNoticeTimer);
      if (result?.token) {
        await loginWithToken(result.token);
      } else {
        throw new Error("No session token received.");
      }
    } catch (err) {
      clearTimeout(wakeNoticeTimer);
      setGoogleLoading(false);
      setGoogleStatus("");
      notify(err.message || "Failed to sign in with Google", "danger");
    }
  };

  const redirectToGoogleDirect = () => {
    setGoogleLoading(true);
    setGoogleStatus("Opening Google sign-in...");
    const returnOrigin = encodeURIComponent(window.location.origin);
    const directGoogleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      "https://e-leraning.onrender.com/api/auth/google/callback"
    )}&scope=profile%20email&prompt=select_account&state=${returnOrigin}`;

    window.location.href = directGoogleAuthUrl;
  };

  const handleGoogleClick = () => {
    if (googleLoading) return;

    // Ping backend in background to warm up for token verification / callback
    try {
      fetch(`${normalizedApiBase}/health`, { mode: "no-cors" }).catch(() => {});
    } catch (_) {}

    // Option 1: Modern Google OAuth Popup Client (no page reload, zero redirect screen)
    if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              setGoogleLoading(true);
              setGoogleStatus("Authenticating with Google...");
              try {
                const result = await api.googleLoginWithToken({ access_token: tokenResponse.access_token });
                if (result?.token) {
                  await loginWithToken(result.token);
                } else {
                  throw new Error("No session token received.");
                }
              } catch (err) {
                setGoogleLoading(false);
                setGoogleStatus("");
                notify(err.message || "Failed to sign in with Google", "danger");
              }
            } else if (tokenResponse?.error) {
              console.warn("Google popup error:", tokenResponse.error);
              redirectToGoogleDirect();
            }
          },
          error_callback: () => {
            redirectToGoogleDirect();
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        console.warn("Could not open Google popup, falling back to direct sign-in:", err);
      }
    }

    // Option 2: Fallback — direct navigation to Google (NEVER to Render!)
    redirectToGoogleDirect();
  };

  useEffect(() => {
    if (isLoggedIn) navigate(dashboardPath);
  }, [isLoggedIn, dashboardPath, navigate]);

  const switchTab = (next) => {
    setTab(next);
    setShowPwd(false);
    setShowConfirm(false);
    setForgotSent(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      notify("Please enter your email address.", "danger");
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(forgotEmail);
      setForgotSent(true);
      notify("Password reset instructions have been sent to your email!", "success");
    } catch (err) {
      notify(err.message || "Failed to request password reset.", "danger");
    } finally {
      setLoading(false);
    }
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <div className="card shadow-sm border rounded-4 bg-white">
            <div className="card-body p-4 p-md-4">

              {/* Logo */}
              <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    }}
                  >
                    <i className="fas fa-graduation-cap" style={{ fontSize: "1.1rem" }} />
                  </div>
                  <span className="fw-bold fs-4 text-dark tracking-tight">
                    Edu<span className="text-primary">Learn</span>
                  </span>
                </Link>
                <p className="text-muted small mt-2 mb-0">
                  {tab === "signin"
                    ? "Welcome back! Sign in to continue learning"
                    : tab === "signup"
                    ? "Create your account and start exploring"
                    : "Reset your account password"}
                </p>
              </div>

              {/* Sign In / Sign Up tabs */}
              {tab !== "forgot" && (
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
              )}

              {/* Google */}
              {tab !== "forgot" && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={googleLoading || loading}
                    className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 mb-3 py-2">
                    {googleLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                        <span className="small">{googleStatus || "Connecting to Google..."}</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        <span>{tab === "signin" ? "Continue with Google" : "Sign up with Google"}</span>
                      </>
                    )}
                  </button>

                  {googleLoading && googleStatus && (
                    <div className="alert alert-info py-2 px-3 small text-center mb-3 border-0 rounded-3 shadow-sm" style={{ background: "#eff6ff", color: "#1e40af" }}>
                      <i className="fas fa-info-circle me-1"></i> {googleStatus}
                    </div>
                  )}

                  <div className="d-flex align-items-center mb-3">
                    <hr className="flex-grow-1 m-0" />
                    <span className="px-3 text-muted small">or</span>
                    <hr className="flex-grow-1 m-0" />
                  </div>
                </>
              )}

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
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="si-password" className="form-label fw-medium mb-0">Password</label>
                      <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none"
                        onClick={() => switchTab("forgot")}>
                        Forgot password?
                      </button>
                    </div>
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

              {/* ── Forgot Password form ── */}
              {tab === "forgot" && (
                <form onSubmit={handleForgotPassword} noValidate>
                  {forgotSent ? (
                    <div className="alert alert-success text-center p-3 mb-4 rounded-3 border-0 shadow-sm" style={{ background: "#ecfdf5", color: "#065f46" }}>
                      <i className="fas fa-check-circle fa-2x mb-2 text-success d-block" />
                      <p className="mb-1 fw-bold fs-6">Reset link sent!</p>
                      <p className="small mb-0 opacity-90">
                        We sent password reset instructions to <strong>{forgotEmail}</strong>. Please check your inbox and follow the link.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-muted small mb-3">
                        Enter your account email and we'll send you a secure link to reset your password.
                      </p>
                      <div className="mb-4">
                        <label htmlFor="fp-email" className="form-label fw-medium">Email address</label>
                        <input
                          id="fp-email"
                          type="email"
                          className="form-control"
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Sending Reset Link…
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </button>
                    </>
                  )}
                  <p className="text-center text-muted small mt-4 mb-0">
                    Remember your password?{" "}
                    <button type="button" className="btn btn-link btn-sm p-0 fw-semibold"
                      onClick={() => switchTab("signin")}>Back to Sign In</button>
                  </p>
                </form>
              )}
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
