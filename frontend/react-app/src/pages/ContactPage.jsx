import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function ContactPage() {
  const { notify } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    newsletter: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      notify("Please fill out all required fields.", "warning");
      return;
    }

    setLoading(true);
    try {
      await api.submitContactForm(form);
      notify("Thank you for reaching out! Our team will respond shortly.", "success");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        newsletter: false,
      });
    } catch (err) {
      notify(err.message || "Failed to submit message. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 py-lg-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-semibold mb-2">
            Get In Touch
          </span>
          <h1 className="fw-bold tracking-tight mb-2">We're Here to Help</h1>
          <p className="text-muted small">
            Have questions about a course, technical issues, or partnership opportunities? Send us a message and our support team will get back to you promptly.
          </p>
        </div>

        <div className="row g-4">
          {/* Contact Form */}
          <div className="col-lg-7">
            <div className="card border rounded-4 shadow-sm bg-white p-4 p-md-4">
              <h4 className="fw-bold text-dark mb-3">Send Us a Message</h4>
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label small fw-semibold">
                      Your Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      className="form-control rounded-3"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label small fw-semibold">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="form-control rounded-3"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="subject" className="form-label small fw-semibold">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. Question regarding Python course"
                      value={form.subject}
                      onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="message" className="form-label small fw-semibold">
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      className="form-control rounded-3"
                      placeholder="Write your message here..."
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        id="newsletterCheck"
                        type="checkbox"
                        className="form-check-input"
                        checked={form.newsletter}
                        onChange={(e) => setForm((p) => ({ ...p, newsletter: e.target.checked }))}
                      />
                      <label htmlFor="newsletterCheck" className="form-check-label small text-muted">
                        Subscribe to monthly updates on newly released courses
                      </label>
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Details & Office info */}
          <div className="col-lg-5">
            <div className="card border rounded-4 shadow-sm bg-light p-4 h-100">
              <h5 className="fw-bold mb-4">Direct Channels</h5>

              <div className="d-flex flex-column gap-4 mb-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary flex-shrink-0">
                    <i className="fas fa-envelope" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Email Support</h6>
                    <p className="text-muted small mb-0">support@edulearn.com</p>
                    <small className="text-muted">Average response time: &lt; 24 hours</small>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success flex-shrink-0">
                    <i className="fas fa-phone" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Phone Number</h6>
                    <p className="text-muted small mb-0">+251 972 467962</p>
                    <small className="text-muted">Toll-free customer line</small>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning flex-shrink-0">
                    <i className="fas fa-location-dot" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Headquarters</h6>
                    <p className="text-muted small mb-0">123 Learning Street, Education City</p>
                  </div>
                </div>
              </div>

              <div className="border-top pt-4 mt-auto">
                <h6 className="fw-bold mb-2">Looking for Instant Answers?</h6>
                <p className="text-muted small mb-3">
                  Check out our comprehensive FAQ covering enrollments, refunds, quizzes, and certificates.
                </p>
                <Link to="/faq" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  <i className="fas fa-question-circle me-1" /> Visit Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

