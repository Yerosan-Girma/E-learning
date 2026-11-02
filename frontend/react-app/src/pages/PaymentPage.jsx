import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { normalizeCourse } from "../utils/courseAdapter";
import { formatPrice } from "../utils/format";

const GATEWAYS = [
  {
    value: "chapa",
    label: "Chapa (Telebirr / CBE / Awash / Cards)",
    badge: "Recommended",
    badgeColor: "success",
    icon: "fa-bolt",
    subtext: "Instant activation via Telebirr, CBE Birr, Awash, or Debit Card in Ethiopian Birr (ETB).",
  },
  {
    value: "telebirr",
    label: "Telebirr Direct (Simulation)",
    badge: "Instant",
    badgeColor: "primary",
    icon: "fa-mobile-screen-button",
    subtext: "Simulate an instant Telebirr wallet payment.",
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer (Manual)",
    badge: "Manual Verification",
    badgeColor: "secondary",
    icon: "fa-building-columns",
    subtext: "Deposit into CBE, Awash, or BOA account and upload receipt.",
  },
];

export default function PaymentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, role, user, notify, refreshStudentState } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [form, setForm] = useState({
    gateway: "chapa",
    payerName: user?.name || "",
    payerPhone: "",
    payerReference: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

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

  const isCardGateway = form.gateway === "credit_card" || form.gateway === "debit_card";

  const canProceedStep2 = useMemo(() => {
    if (!form.payerName.trim()) return false;
    if (form.gateway === "chapa") {
      return Boolean(form.payerName.trim());
    }
    if (isCardGateway) {
      return form.cardNumber.length >= 12 && form.cardExpiry && form.cardCvc.length >= 3;
    }
    return true;
  }, [form, isCardGateway]);

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

      // If Chapa provided a hosted checkout link, redirect student immediately
      if (payload?.checkoutUrl) {
        notify("Redirecting to Chapa secure payment portal...", "info");
        window.location.href = payload.checkoutUrl;
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
                  <h5 className="fw-bold mb-3">Select Payment Method</h5>

                  <div className="d-flex flex-column gap-3 mb-4">
                    {GATEWAYS.map((gw) => (
                      <div
                        key={gw.value}
                        className={`p-3.5 rounded-4 border cursor-pointer transition-all ${
                          form.gateway === gw.value
                            ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                            : "border-light-subtle bg-white hover-light"
                        }`}
                        onClick={() => setForm((p) => ({ ...p, gateway: gw.value }))}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-2.5">
                            <input
                              type="radio"
                              name="gatewaySelect"
                              checked={form.gateway === gw.value}
                              onChange={() => setForm((p) => ({ ...p, gateway: gw.value }))}
                              className="form-check-input mt-0"
                            />
                            <span className="fw-bold text-dark">{gw.label}</span>
                          </div>
                          <span className={`badge bg-${gw.badgeColor} rounded-pill px-2.5 py-1 small`}>
                            {gw.badge}
                          </span>
                        </div>
                        <p className="text-muted small mb-0 ps-4">
                          {gw.subtext}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Chapa Information Callout */}
                  {form.gateway === "chapa" && (
                    <div className="p-3.5 rounded-4 border bg-light mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="fas fa-shield-halved text-success fa-lg" />
                        <h6 className="fw-bold text-dark mb-0">Chapa Multi-Payment Gateway</h6>
                      </div>
                      <p className="small text-muted mb-2">
                        You will be redirected to Chapa's official payment page to pay in Ethiopian Birr (ETB) using:
                      </p>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span className="badge bg-white text-dark border px-2.5 py-1.5">
                          <i className="fas fa-mobile-screen text-success me-1" /> Telebirr
                        </span>
                        <span className="badge bg-white text-dark border px-2.5 py-1.5">
                          <i className="fas fa-building-columns text-primary me-1" /> CBE Birr
                        </span>
                        <span className="badge bg-white text-dark border px-2.5 py-1.5">
                          <i className="fas fa-university text-warning me-1" /> Awash / BOA / Dashen
                        </span>
                        <span className="badge bg-white text-dark border px-2.5 py-1.5">
                          <i className="fas fa-credit-card text-info me-1" /> Local Debit Cards
                        </span>
                      </div>
                    </div>
                  )}

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
