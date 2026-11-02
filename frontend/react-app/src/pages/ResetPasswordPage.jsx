import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { notify } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      notify("Invalid or missing password reset token. Please request a new link.", "danger");
      return;
    }

    if (password !== confirmPassword) {
      notify("Passwords do not match.", "danger");
      return;
    }

    if (password.length < 6) {
      notify("Password must be at least 6 characters.", "danger");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      notify("Password reset successfully! You can now log in.", "success");
    } catch (err) {
      notify(err.message || "Failed to reset password. The link may have expired.", "danger");
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
              <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none">
                  <span className="fw-bold fs-4 text-primary">
                    <i className="fas fa-graduation-cap me-2" />EduLearn
                  </span>
                </Link>
                <h4 className="fw-bold mt-3 mb-1">Set New Password</h4>
                <p className="text-muted small mb-0">Choose a strong, memorable password</p>
              </div>

              {!token ? (
                <div className="text-center py-3">
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2" />
                    Missing or invalid reset token.
                  </div>
                  <Link to="/login" className="btn btn-primary w-100 mt-2">
                    Request New Link
                  </Link>
                </div>
              ) : success ? (
                <div className="text-center py-3">
                  <div className="alert alert-success border-0 shadow-sm" style={{ background: "#ecfdf5", color: "#065f46" }}>
                    <i className="fas fa-check-circle fa-3x mb-3 text-success d-block" />
                    <h5 className="fw-bold mb-2">Password Updated!</h5>
                    <p className="small mb-0">
                      Your password has been changed successfully. You can now log in with your new credentials.
                    </p>
                  </div>
                  <Link to="/login" className="btn btn-primary w-100 mt-3">
                    Sign In Now
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-medium">New Password</label>
                    <div className="input-group">
                      <input
                        type={showPwd ? "text" : "password"}
                        className="form-control"
                        required
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        tabIndex={-1}
                        onClick={() => setShowPwd((v) => !v)}
                      >
                        {showPwd ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">Confirm New Password</label>
                    <div className="input-group">
                      <input
                        type={showPwd ? "text" : "password"}
                        className="form-control"
                        required
                        autoComplete="new-password"
                        placeholder="Repeat your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        tabIndex={-1}
                        onClick={() => setShowPwd((v) => !v)}
                      >
                        {showPwd ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Updating Password…
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <Link to="/login" className="text-decoration-none text-muted small">
                      ← Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

