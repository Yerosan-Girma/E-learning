import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { normalizeCourse } from "../utils/courseAdapter";
import { formatPrice } from "../utils/format";

export default function PaymentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, role, user, notify, refreshStudentState } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [pendingTx, setPendingTx] = useState(null);
  const [awaitingChapa, setAwaitingChapa] = useState(null);
  const [manualChecking, setManualChecking] = useState(false);
  const [form, setForm] = useState({
    gateway: "chapa",
    payerName: user?.name || "",
    payerPhone: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("edulearn_pending_chapa_tx");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.txRef && (String(parsed.courseId) === String(courseId) || !parsed.courseId)) {
          setPendingTx(parsed);
        }
      }
    } catch (e) {}
  }, [courseId]);

  useEffect(() => {
    if (!isLoggedIn) {
      notify("Please log in before making a payment.", "warning");
      navigate("/login");
      return;
    }

    if (role !== "student") {
      notify("Only student accounts can purchase courses.", "warning");
      navigate(`/courses/${courseId}`);
      return;
    }

    async function loadCourse() {
      setLoading(true);
      try {
        const data = await api.getCourse(courseId);
        const normalized = normalizeCourse(data.course);

        if (normalized.isFree) {
          notify("This course is free. No payment is required.", "info");
          navigate(`/courses/${courseId}`);
          return;
        }

        if (data.access?.hasAccess) {
          navigate(`/courses/${courseId}/dashboard`);
          return;
        }

        setCourse(normalized);
      } catch (error) {
        notify(error.message || "Failed to load course", "danger");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId, isLoggedIn, role, navigate, notify]);

  // Sync user name into form if not set
  useEffect(() => {
    if (user?.name && !form.payerName) {
      setForm((p) => ({ ...p, payerName: user.name }));
    }
  }, [user?.name]);

  const canProceedStep2 = useMemo(() => {
    return Boolean(form.payerName && form.payerName.trim());
  }, [form.payerName]);

  // Live background polling while awaiting payment on Chapa
  useEffect(() => {
    if (!awaitingChapa?.txRef) return;
    let isCancelled = false;
    let pollCount = 0;

    const interval = setInterval(async () => {
      pollCount += 1;
      if (pollCount > 50) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await api.verifyChapaPayment(awaitingChapa.txRef);
        if (isCancelled) return;

        if (res?.data?.status === "completed" || res?.status === "success") {
          clearInterval(interval);
          try {
            localStorage.removeItem("edulearn_pending_chapa_tx");
          } catch (e) {}
          await refreshStudentState();
          setPaymentResult({
            gateway: "chapa",
            transactionId: awaitingChapa.txRef,
            status: "completed",
          });
          setAwaitingChapa(null);
          setStep(3);
          notify("Payment verified! Welcome to your course.", "success");
        }
      } catch (err) {
        // Still pending on Chapa, keep waiting
      }
    }, 3500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [awaitingChapa, refreshStudentState, notify]);

  const handleManualVerify = async () => {
    if (!awaitingChapa?.txRef) return;
    setManualChecking(true);
    try {
      const res = await api.verifyChapaPayment(awaitingChapa.txRef);
      if (res?.data?.status === "completed" || res?.status === "success") {
        try {
          localStorage.removeItem("edulearn_pending_chapa_tx");
        } catch (e) {}
        await refreshStudentState();
        setPaymentResult({
          gateway: "chapa",
          transactionId: awaitingChapa.txRef,
          status: "completed",
        });
        setAwaitingChapa(null);
        setStep(3);
        notify("Payment verified! Welcome to your course.", "success");
      } else {
        notify("Payment not yet confirmed on Chapa. Please complete the payment first.", "warning");
      }
    } catch (err) {
      notify(err.message || "Payment not yet confirmed. Please complete the payment on Chapa first.", "warning");
    } finally {
      setManualChecking(false);
    }
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      const data = await api.initializePayment(courseId, {
        gateway: form.gateway,
        payerName: form.payerName,
        payerPhone: form.payerPhone || form.cardNumber.slice(-4),
        payerReference: form.payerReference || `EduLearn course purchase`,
      });

      const payload = data?.data || data;

      // If Chapa provided a hosted checkout link, open it and wait for completion
      if (payload?.checkoutUrl) {
        try {
          localStorage.setItem(
            "edulearn_pending_chapa_tx",
            JSON.stringify({
              txRef: payload.transactionId,
              courseId,
              time: Date.now(),
            })
          );
        } catch (e) {}

        const win = window.open(payload.checkoutUrl, "_blank");
        const isBlocked = !win || win.closed || typeof win.closed === "undefined";

        setAwaitingChapa({
          txRef: payload.transactionId,
          checkoutUrl: payload.checkoutUrl,
          popupBlocked: isBlocked,
        });

        notify("Chapa payment window opened. Complete your payment to activate access.", "info");
        return;
      }

      await refreshStudentState();
      setPaymentResult(payload);
      setStep(3);
      notify("Payment completed successfully!", "success");
    } catch (error) {
      notify(error.message || "Payment initialization failed", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const goToDashboard = () => {
    navigate(`/courses/${courseId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="container py-4 py-lg-5">
        <div className="alert alert-info">Loading payment details...</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container py-4 py-lg-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/courses/${courseId}`}>{course.title}</Link>
          </li>
          <li className="breadcrumb-item active">Checkout</li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="fw-bold mb-1">Course Checkout</h2>
                  <p className="text-muted small mb-0">Secure course enrollment in Ethiopian Birr (ETB)</p>
                </div>
                <div className="d-flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`badge rounded-pill px-3 py-1.5 ${
                        step === s
                          ? "bg-primary text-white"
                          : step > s
                          ? "bg-success text-white"
                          : "bg-light text-muted border"
                      }`}
                    >
                      Step {s}
                    </span>
                  ))}
                </div>
              </div>

              {pendingTx && !awaitingChapa && (
                <div className="alert alert-warning border-0 rounded-4 shadow-sm mb-4 p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <div className="fw-bold d-flex align-items-center gap-2 text-dark">
                      <i className="fas fa-receipt text-warning fa-lg" />
                      <span>Already completed payment on Chapa?</span>
                    </div>
                    <small className="text-muted d-block mt-0.5">
                      If you finished paying and remained on Chapa's receipt page, verify now to unlock access.
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/payment/verify?tx_ref=${encodeURIComponent(pendingTx.txRef)}&course_id=${encodeURIComponent(courseId)}`}
                      className="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm"
                    >
                      <i className="fas fa-check-double me-1" /> Verify & Unlock
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill px-2.5"
                      onClick={() => {
                        try {
                          localStorage.removeItem("edulearn_pending_chapa_tx");
                        } catch (e) {}
                        setPendingTx(null);
                      }}
                      title="Dismiss notice"
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>
                </div>
              )}

              {awaitingChapa ? (
                <div className="text-center py-4">
                  <div className="mb-4 position-relative d-inline-block">
                    <div className="spinner-grow text-success" style={{ width: "4.5rem", height: "4.5rem", opacity: 0.2 }} />
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <i className="fas fa-shield-halved text-success fa-2x" />
                    </div>
                  </div>

                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-1.5 rounded-pill small fw-semibold mb-2">
                    Waiting for Payment Confirmation
                  </span>
                  <h3 className="fw-bold mb-2">Complete Payment on Chapa</h3>
                  <p className="text-muted small mx-auto mb-4" style={{ maxWidth: "480px", lineHeight: "1.7" }}>
                    We opened Chapa in a separate tab so you don't lose your place. Complete your Telebirr, CBE Birr, or card payment. <strong>This screen will automatically detect your payment and unlock the course!</strong>
                  </p>

                  {awaitingChapa.popupBlocked && (
                    <div className="alert alert-warning border-0 rounded-4 shadow-sm mb-4 text-start small">
                      <div className="fw-bold mb-1">
                        <i className="fas fa-exclamation-triangle me-1" /> Browser blocked the payment tab?
                      </div>
                      <div>Click the button below to open Chapa checkout directly.</div>
                    </div>
                  )}

                  <div className="p-3 bg-light rounded-4 text-start small mb-4 border font-monospace">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Transaction ID:</span>
                      <span className="fw-bold text-dark">{awaitingChapa.txRef}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Course:</span>
                      <span className="fw-semibold text-dark">{course.title}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Amount:</span>
                      <span className="fw-bold text-primary">{formatPrice(course.effectivePrice)}</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 mb-3">
                    <button
                      type="button"
                      className="btn btn-success btn-lg rounded-pill shadow-sm py-2.5"
                      onClick={handleManualVerify}
                      disabled={manualChecking}
                    >
                      {manualChecking ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Checking payment status with Chapa...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-circle-check me-2" /> I've Finished Paying — Unlock Course Now
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary rounded-pill"
                      onClick={() => window.open(awaitingChapa.checkoutUrl, "_blank")}
                    >
                      <i className="fas fa-arrow-up-right-from-square me-2" /> Open Chapa Payment Tab Again
                    </button>

                    <button
                      type="button"
                      className="btn btn-link text-muted small"
                      onClick={() => setAwaitingChapa(null)}
                    >
                      Choose another payment method or cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {step === 1 && (
                <div>
                  <h5 className="fw-bold mb-3">Order Summary</h5>
                  <div className="border rounded-4 p-3.5 mb-4 bg-light">
                    <div className="d-flex gap-3 align-items-center flex-wrap flex-sm-nowrap">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="rounded-3 shadow-sm"
                        style={{ width: 100, height: 75, objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <span className="badge bg-primary bg-opacity-10 text-primary mb-1">
                          {course.category}
                        </span>
                        <h6 className="fw-bold mb-1 text-dark">{course.title}</h6>
                        <small className="text-muted d-block">
                          Instructor: {course.instructor} · {course.level}
                        </small>
                      </div>
                      <div className="ms-sm-auto text-sm-end w-100 w-sm-auto pt-2 pt-sm-0 border-top border-sm-top-0">
                        <span className="badge bg-dark mb-1">PREMIUM</span>
                        <div className="fw-bold text-primary fs-4">
                          {formatPrice(course.effectivePrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 p-3 rounded-3 bg-light border mb-4 text-muted small">
                    <i className="fas fa-lock text-success" />
                    <span>
                      256-bit encrypted checkout. All course materials, certificates, and future updates are included.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm"
                    onClick={() => setStep(2)}
                  >
                    Continue to Payment Options <i className="fas fa-arrow-right ms-2" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h5 className="fw-bold mb-3">Chapa Secure Checkout</h5>

                  <div className="p-4 rounded-4 border bg-light mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-success bg-opacity-10 p-2 text-success d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                          <i className="fas fa-shield-halved fa-lg" />
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-0">Chapa Payment Gateway</h6>
                          <small className="text-muted">Official Ethiopian payment platform in Birr (ETB)</small>
                        </div>
                      </div>
                      <span className="badge bg-success rounded-pill px-3 py-1.5 small">
                        <i className="fas fa-bolt me-1" /> Instant Activation
                      </span>
                    </div>

                    <p className="small text-muted mb-2">
                      Pay instantly in Ethiopian Birr using any of the following options on Chapa:
                    </p>

                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-white text-dark border px-3 py-2 shadow-sm">
                        <i className="fas fa-mobile-screen text-success me-1.5" /> Telebirr
                      </span>
                      <span className="badge bg-white text-dark border px-3 py-2 shadow-sm">
                        <i className="fas fa-building-columns text-primary me-1.5" /> CBE Birr
                      </span>
                      <span className="badge bg-white text-dark border px-3 py-2 shadow-sm">
                        <i className="fas fa-university text-warning me-1.5" /> Awash / BOA / Dashen
                      </span>
                      <span className="badge bg-white text-dark border px-3 py-2 shadow-sm">
                        <i className="fas fa-credit-card text-info me-1.5" /> Local Bank Cards
                      </span>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Payer Full Name <span className="text-danger">*</span></label>
                      <input
                        className="form-control rounded-3"
                        value={form.payerName}
                        onChange={(e) => setForm((p) => ({ ...p, payerName: e.target.value }))}
                        placeholder="e.g. Yerosan Girma"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Phone Number (Telebirr / Mobile)
                      </label>
                      <input
                        className="form-control rounded-3"
                        value={form.payerPhone}
                        onChange={(e) => setForm((p) => ({ ...p, payerPhone: e.target.value }))}
                        placeholder="09xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg flex-grow-1 rounded-pill shadow-sm"
                      disabled={!canProceedStep2 || submitting}
                      onClick={handleConfirmPayment}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          <span>Connecting to Payment Gateway...</span>
                        </>
                      ) : form.gateway === "chapa" ? (
                        <>
                          <i className="fas fa-bolt me-2" /> Pay {formatPrice(course.effectivePrice)} via Chapa
                        </>
                      ) : (
                        `Pay ${formatPrice(course.effectivePrice)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && paymentResult && (
                <div className="text-center py-3">
                  <div className="mb-3">
                    <i className="fas fa-check-circle text-success" style={{ fontSize: "4rem" }} />
                  </div>
                  <h4 className="fw-bold text-success mb-2">Payment Confirmed!</h4>
                  <p className="text-muted mb-4">
                    You have been automatically enrolled in <strong>{course.title}</strong>.
                  </p>

                  <div className="border rounded-4 p-3.5 mb-4 text-start bg-light">
                    <div className="row g-2 small">
                      <div className="col-6"><strong>Amount:</strong></div>
                      <div className="col-6">{formatPrice(course.effectivePrice)}</div>
                      <div className="col-6"><strong>Gateway:</strong></div>
                      <div className="col-6 text-capitalize">
                        {paymentResult.gateway?.replace("_", " ")}
                      </div>
                      <div className="col-6"><strong>Transaction ID:</strong></div>
                      <div className="col-6 font-monospace">{paymentResult.transactionId}</div>
                      <div className="col-6"><strong>Status:</strong></div>
                      <div className="col-6">
                        <span className="badge bg-success">{paymentResult.status}</span>
                      </div>
                    </div>
                  </div>

                  <button type="button" className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm" onClick={goToDashboard}>
                    <i className="fas fa-play me-2" /> Go to Course Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
