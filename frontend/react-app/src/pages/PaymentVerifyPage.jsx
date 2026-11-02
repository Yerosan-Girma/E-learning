import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshStudentState, notify } = useAuth();

  const txRef = searchParams.get("tx_ref") || searchParams.get("trx_ref") || "";
  const initialCourseId = searchParams.get("course_id") || "";

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!txRef) {
      setVerifying(false);
      setErrorMessage("No transaction reference was provided in the callback URL.");
      return;
    }

    let isMounted = true;

    async function checkVerification() {
      try {
        const response = await api.verifyChapaPayment(txRef);
        if (!isMounted) return;

        if (response?.data?.status === "completed" || response?.data?.courseId) {
          setSuccess(true);
          const resolvedCourseId = response.data.courseId || initialCourseId;
          setCourseId(resolvedCourseId);
          await refreshStudentState();
          notify("Payment verified successfully! Welcome to your course.", "success");
        } else {
          setSuccess(false);
          setErrorMessage(response?.message || "Payment verification could not be completed.");
        }
      } catch (err) {
        if (!isMounted) return;
        setSuccess(false);
        setErrorMessage(err.message || "Failed to verify transaction with Chapa.");
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    }

    checkVerification();

    return () => {
      isMounted = false;
    };
  }, [txRef, initialCourseId, refreshStudentState, notify]);

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container" style={{ maxWidth: "620px" }}>
        <div className="card border-0 rounded-4 shadow-sm p-4 p-md-5 bg-white text-center">
          {verifying ? (
            <div>
              <div className="spinner-border text-primary mb-3" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="fw-bold mb-2">Verifying Payment...</h4>
              <p className="text-muted small mb-0">
                Communicating with Chapa and activating your course enrollment. Please do not close this window.
              </p>
            </div>
          ) : success ? (
            <div>
              <div
                className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: "80px", height: "80px", fontSize: "2.2rem" }}
              >
                <i className="fas fa-circle-check" />
              </div>

              <span className="badge bg-success bg-opacity-10 text-success px-3 py-1.5 rounded-pill small fw-semibold mb-2">
                Enrollment Activated
              </span>
              <h2 className="fw-bold tracking-tight mb-2">Payment Confirmed!</h2>
              <p className="text-muted small mb-4" style={{ lineHeight: "1.7" }}>
                Your payment in Ethiopian Birr (ETB) via Chapa was successfully verified. 
                Your course access, learning materials, and quizzes are now fully unlocked!
              </p>

              <div className="p-3 bg-light rounded-3 text-start small mb-4 border">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Transaction Reference:</span>
                  <span className="font-monospace fw-semibold">{txRef}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Payment Provider:</span>
                  <span className="fw-semibold text-dark">Chapa (Telebirr / CBE / Cards)</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Status:</span>
                  <span className="badge bg-success text-white">Paid & Verified</span>
                </div>
              </div>

              <div className="d-grid gap-2">
                {courseId ? (
                  <Link to={`/courses/${courseId}/dashboard`} className="btn btn-primary btn-lg rounded-pill shadow-sm">
                    <i className="fas fa-play me-2" /> Start Learning Now
                  </Link>
                ) : (
                  <Link to="/dashboard" className="btn btn-primary btn-lg rounded-pill shadow-sm">
                    <i className="fas fa-gauge-high me-2" /> View My Dashboard
                  </Link>
                )}

                <Link to="/courses" className="btn btn-outline-secondary rounded-pill">
                  Explore More Courses
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div
                className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: "80px", height: "80px", fontSize: "2.2rem" }}
              >
                <i className="fas fa-circle-exclamation" />
              </div>

              <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-1.5 rounded-pill small fw-semibold mb-2">
                Payment Verification Notice
              </span>
              <h3 className="fw-bold tracking-tight mb-2">Verification Incomplete</h3>
              <p className="text-muted small mb-4">
                {errorMessage || "We could not confirm payment completion on Chapa. If you were charged, please contact our support team."}
              </p>

              {txRef && (
                <div className="p-3 bg-light rounded-3 text-start small mb-4 border font-monospace text-muted">
                  Ref: {txRef}
                </div>
              )}

              <div className="d-grid gap-2">
                {courseId && (
                  <Link to={`/payment/${courseId}`} className="btn btn-primary rounded-pill">
                    <i className="fas fa-arrow-rotate-left me-1" /> Try Checkout Again
                  </Link>
                )}
                <Link to="/contact" className="btn btn-outline-secondary rounded-pill">
                  <i className="fas fa-headset me-1" /> Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
