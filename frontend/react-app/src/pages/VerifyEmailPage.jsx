import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isLoggedIn, dashboardPath, notify } = useAuth();

  const [status, setStatus] = useState(token ? "verifying" : "no-token"); // "verifying" | "success" | "error" | "no-token"
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const runVerification = async () => {
      try {
        const result = await api.verifyEmail(token);
        if (isMounted) {
          setStatus("success");
          setMessage(result.message || "Your email address has been verified successfully!");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setMessage(err.message || "Invalid or expired verification link.");
        }
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      notify("Please enter your email address.", "danger");
      return;
    }

    setResending(true);
    try {
      await api.resendVerification(resendEmail);
      setResendSuccess(true);
      notify("A new verification link has been sent to your email!", "success");
    } catch (err) {
      notify(err.message || "Failed to resend verification email.", "danger");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5 text-center">
              <Link to="/" className="text-decoration-none">
                <span className="fw-bold fs-4 text-primary">
                  <i className="fas fa-graduation-cap me-2" />EduLearn
                </span>
              </Link>

              {status === "verifying" && (
                <div className="py-4">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Verifying...</span>
                  </div>
                  <h5 className="fw-bold mb-1">Verifying Your Email</h5>
                  <p className="text-muted small">Please wait while we confirm your account...</p>
                </div>
              )}

              {status === "success" && (
                <div className="py-3">
                  <div
                    className="alert alert-success border-0 shadow-sm rounded-4 p-4 mb-4"
                    style={{ background: "#ecfdf5", color: "#065f46" }}
                  >
                    <i className="fas fa-check-circle fa-3x mb-3 text-success d-block" />
                    <h5 className="fw-bold mb-2">Email Verified!</h5>
                    <p className="small mb-0 opacity-90">{message}</p>
                  </div>
                  <Link
                    to={isLoggedIn ? dashboardPath : "/login"}
                    className="btn btn-primary w-100 py-2 fw-semibold"
                  >
                    {isLoggedIn ? "Go to My Dashboard" : "Sign In to EduLearn"}
                  </Link>
                </div>
              )}

              {(status === "error" || status === "no-token") && (
                <div className="py-3">
                  <div
                    className="alert alert-warning border-0 shadow-sm rounded-4 p-3 mb-4"
                    style={{ background: "#fffbeb", color: "#92400e" }}
                  >
                    <i className="fas fa-exclamation-triangle fa-2x mb-2 text-warning d-block" />
                    <h6 className="fw-bold mb-1">Verification Link Issue</h6>
                    <p className="small mb-0">{message || "The verification link is missing or expired."}</p>
                  </div>

                  {resendSuccess ? (
                    <div className="alert alert-info small mb-3">
                      A fresh verification link has been sent to <strong>{resendEmail}</strong>. Please check your inbox.
                    </div>
                  ) : (
                    <form onSubmit={handleResend} className="text-start">
                      <label className="form-label small fw-medium">Resend verification link</label>
                      <div className="input-group mb-3">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Your email address"
                          required
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                        />
                        <button type="submit" className="btn btn-outline-primary" disabled={resending}>
                          {resending ? "Sending..." : "Resend"}
                        </button>
                      </div>
                    </form>
                  )}

                  <Link to="/login" className="btn btn-outline-secondary w-100 mt-2">
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
