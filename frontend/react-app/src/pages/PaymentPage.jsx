import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { normalizeCourse } from "../utils/courseAdapter";
import { formatPrice } from "../utils/format";

const GATEWAYS = [
  { value: "credit_card", label: "Credit Card", icon: "fa-credit-card" },
  { value: "debit_card", label: "Debit Card", icon: "fa-credit-card" },
  { value: "telebirr", label: "Telebirr", icon: "fa-mobile-alt" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "fa-university" },
];

export default function PaymentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, role, notify, refreshStudentState } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [form, setForm] = useState({
    gateway: "credit_card",
    payerName: "",
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

  const isCardGateway = form.gateway === "credit_card" || form.gateway === "debit_card";

  const canProceedStep2 = useMemo(() => {
    if (!form.payerName.trim()) return false;
    if (isCardGateway) {
      return form.cardNumber.length >= 12 && form.cardExpiry && form.cardCvc.length >= 3;
    }
    return form.payerPhone.trim().length >= 6;
  }, [form, isCardGateway]);

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      const data = await api.initializePayment(courseId, {
        gateway: form.gateway,
        payerName: form.payerName,
        payerPhone: form.payerPhone || form.cardNumber.slice(-4),
        payerReference: form.payerReference || `Simulated ${form.gateway} payment`,
      });
      await refreshStudentState();
      setPaymentResult(data);
      setStep(3);
      notify("Payment completed successfully!", "success");
    } catch (error) {
      notify(error.message || "Payment failed", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const goToDashboard = () => {
    navigate(`/courses/${courseId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="container py-5 mt-5">
        <div className="alert alert-info">Loading payment details...</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container py-5 mt-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/courses/${courseId}`}>{course.title}</Link>
          </li>
          <li className="breadcrumb-item active">Payment</li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h2 className="fw-bold mb-0">Course Payment</h2>
                <div className="d-flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`badge rounded-pill ${step >= s ? "bg-primary" : "bg-secondary"}`}
                    >
                      Step {s}
                    </span>
                  ))}
                </div>
              </div>

              {step === 1 && (
                <div>
                  <h5 className="fw-bold mb-3">Order Summary</h5>
                  <div className="border rounded p-3 mb-4">
                    <div className="d-flex gap-3 align-items-center">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="rounded"
                        style={{ width: 80, height: 60, objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="fw-bold mb-1">{course.title}</h6>
                        <small className="text-muted">{course.instructor} · {course.level}</small>
                      </div>
                      <div className="ms-auto text-end">
                        <span className="badge bg-dark mb-1">PAID</span>
                        <div className="fw-bold text-primary fs-5">
                          {formatPrice(course.effectivePrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mb-4">
                    <i className="fas fa-info-circle me-2" />
                    This is a simulated payment — no real charges will be made.
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={() => setStep(2)}
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h5 className="fw-bold mb-3">Payment Method & Details</h5>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Select Payment Method</label>
                    <div className="row g-2">
                      {GATEWAYS.map((gw) => (
                        <div className="col-6 col-md-3" key={gw.value}>
                          <button
                            type="button"
                            className={`btn w-100 ${form.gateway === gw.value ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setForm((prev) => ({ ...prev, gateway: gw.value }))}
                          >
                            <i className={`fas ${gw.icon} me-1`} />
                            {gw.label}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-control"
                        value={form.payerName}
                        onChange={(e) => setForm((p) => ({ ...p, payerName: e.target.value }))}
                        placeholder="Cardholder or payer name"
                        required
                      />
                    </div>
                    {!isCardGateway && (
                      <div className="col-md-6">
                        <label className="form-label">Phone / Account</label>
                        <input
                          className="form-control"
                          value={form.payerPhone}
                          onChange={(e) => setForm((p) => ({ ...p, payerPhone: e.target.value }))}
                          placeholder="09xxxxxxxx or account number"
                        />
                      </div>
                    )}
                  </div>

                  {isCardGateway && (
                    <div className="border rounded p-3 mb-3 bg-light">
                      <h6 className="fw-bold mb-3">
                        <i className="fas fa-credit-card me-2" />
                        Mock Card Details
                      </h6>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Card Number</label>
                          <input
                            className="form-control"
                            value={form.cardNumber}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16),
                              }))
                            }
                            placeholder="4242 4242 4242 4242"
                            maxLength={16}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Expiry (MM/YY)</label>
                          <input
                            className="form-control"
                            value={form.cardExpiry}
                            onChange={(e) => setForm((p) => ({ ...p, cardExpiry: e.target.value }))}
                            placeholder="12/28"
                            maxLength={5}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">CVC</label>
                          <input
                            className="form-control"
                            value={form.cardCvc}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                cardCvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                              }))
                            }
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="form-label">Reference Note (optional)</label>
                    <input
                      className="form-control"
                      value={form.payerReference}
                      onChange={(e) => setForm((p) => ({ ...p, payerReference: e.target.value }))}
                      placeholder="Optional payment note"
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary flex-grow-1"
                      disabled={!canProceedStep2 || submitting}
                      onClick={handleConfirmPayment}
                    >
                      {submitting ? "Processing..." : `Pay ${formatPrice(course.effectivePrice)}`}
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

                  <div className="border rounded p-3 mb-4 text-start">
                    <div className="row g-2 small">
                      <div className="col-6"><strong>Amount:</strong></div>
                      <div className="col-6">{formatPrice(course.effectivePrice)}</div>
                      <div className="col-6"><strong>Gateway:</strong></div>
                      <div className="col-6 text-capitalize">
                        {paymentResult.gateway?.replace("_", " ")}
                      </div>
                      <div className="col-6"><strong>Transaction ID:</strong></div>
                      <div className="col-6">{paymentResult.transactionId}</div>
                      <div className="col-6"><strong>Status:</strong></div>
                      <div className="col-6">
                        <span className="badge bg-success">{paymentResult.status}</span>
                      </div>
                    </div>
                  </div>

                  <button type="button" className="btn btn-primary btn-lg w-100" onClick={goToDashboard}>
                    Go to Course Dashboard
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
