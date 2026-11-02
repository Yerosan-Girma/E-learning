import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const FAQ_DATA = [
  {
    id: "enroll-1",
    category: "Enrollment",
    question: "How do I enroll in a course on EduLearn?",
    answer:
      "To enroll in any course, browse our catalog and select a course to view its details. If you haven't created an account yet, sign up for free. Free courses unlock immediately upon clicking 'Enroll'. For paid courses, proceed through our secure checkout simulation to activate instant access to all course materials.",
  },
  {
    id: "enroll-2",
    category: "Enrollment",
    question: "Can I take more than one course at a time?",
    answer:
      "Yes! You can enroll in as many courses as you wish. Your progress in each course is tracked individually in your Student Dashboard.",
  },
  {
    id: "enroll-3",
    category: "Enrollment",
    question: "Do course enrollments ever expire?",
    answer:
      "No. Once enrolled in a course, you retain full lifetime access to all lectures, videos, lesson notes, and practice quizzes.",
  },
  {
    id: "pay-1",
    category: "Payment & Refunds",
    question: "What payment methods are supported?",
    answer:
      "EduLearn supports major credit/debit cards (Visa, MasterCard, American Express) and simulated sandbox payment gateways for risk-free testing.",
  },
  {
    id: "pay-2",
    category: "Payment & Refunds",
    question: "What is your refund policy?",
    answer:
      "All paid courses include an unconditional 30-day money-back guarantee. If you are not completely satisfied with your learning experience, contact our support team within 30 days of purchase for a full refund.",
  },
  {
    id: "cert-1",
    category: "Certificates",
    question: "How do I earn a verified certificate?",
    answer:
      "To earn a verified certificate, complete 100% of the lessons in a course and achieve a passing score on the corresponding course quizzes. Once earned, your official certificate appears in your Student Dashboard with a unique verification code.",
  },
  {
    id: "cert-2",
    category: "Certificates",
    question: "Can I download or share my certificate?",
    answer:
      "Yes! Certificates can be downloaded as a PDF, printed in high-resolution, or shared via a unique verification link that anyone can verify online.",
  },
  {
    id: "tech-1",
    category: "Technical",
    question: "What are the device requirements for EduLearn?",
    answer:
      "EduLearn works seamlessly on any modern web browser (Chrome, Edge, Firefox, Safari) across mobile phones, tablets, laptops, and desktop computers. No special software is required.",
  },
  {
    id: "tech-2",
    category: "Technical",
    question: "Can I sign in using my Google account?",
    answer:
      "Yes! EduLearn features one-click Google Sign-In powered by Google Identity Services, allowing quick and secure authentication without creating a separate password.",
  },
];

const CATEGORIES = ["All", "Enrollment", "Payment & Refunds", "Certificates", "Technical"];

export default function ContactPage() {
  const { notify } = useAuth();
  const location = useLocation();

  // Contact form state
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    newsletter: false,
  });

  // FAQ state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItem, setOpenItem] = useState(FAQ_DATA[0].id);

  // Auto-scroll on hash or navigation
  useEffect(() => {
    if (location.hash === "#faq" || location.hash === "#faq-section") {
      const el = document.getElementById("faq-section");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [location.hash]);

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

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-4 py-lg-5">
      <div className="container">
        {/* Unified Hero Header */}
        <div className="text-center mb-5" style={{ maxWidth: "680px", margin: "0 auto" }}>
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-semibold mb-2">
            Support & Help Center
          </span>
          <h1 className="fw-bold tracking-tight mb-3 display-6">
            Contact Us & Frequently Asked Questions
          </h1>
          <p className="text-muted small" style={{ lineHeight: "1.7" }}>
            Have questions about a course, technical issues, certificates, or platform features? 
            Browse our instant answers below or send our support team a direct message.
          </p>

          {/* Quick Jump Buttons */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            <a href="#contact-form" className="btn btn-outline-primary btn-sm rounded-pill px-3.5 py-2">
              <i className="fas fa-paper-plane me-1.5" /> Send a Message
            </a>
            <a href="#direct-channels" className="btn btn-outline-secondary btn-sm rounded-pill px-3.5 py-2">
              <i className="fas fa-headset me-1.5" /> Direct Channels
            </a>
            <a href="#faq-section" className="btn btn-primary btn-sm rounded-pill px-3.5 py-2 shadow-sm">
              <i className="fas fa-question-circle me-1.5" /> Browse FAQs
            </a>
          </div>
        </div>

        {/* Section 1: Contact Form & Direct Channels */}
        <div className="row g-4 mb-5 pb-4 border-bottom">
          {/* Contact Form */}
          <div className="col-lg-7" id="contact-form">
            <div className="card border rounded-4 shadow-sm bg-white p-4 p-md-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="fw-bold text-dark mb-0">Send Us a Message</h4>
                <span className="badge bg-light text-muted border small px-2.5 py-1">Direct Relay</span>
              </div>
              <p className="text-muted small mb-4">
                Fill out the details below and an email notification will be delivered directly to our support desk.
              </p>

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

          {/* Contact Details & Direct Channels */}
          <div className="col-lg-5" id="direct-channels">
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

              {/* Quick FAQ Link Box */}
              <div className="border-top pt-4 mt-auto">
                <div className="p-3 bg-white rounded-3 border">
                  <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                    <i className="fas fa-bolt text-warning" />
                    <span>Need Instant Answers?</span>
                  </h6>
                  <p className="text-muted small mb-3">
                    Check out our frequently asked questions below for immediate guidance on certificates, enrollments, and payments.
                  </p>
                  <a href="#faq-section" className="btn btn-outline-primary btn-sm rounded-pill w-100">
                    <i className="fas fa-arrow-down me-1" /> Jump to FAQs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Frequently Asked Questions (FAQ) */}
        <section id="faq-section" className="pt-3 pb-5">
          <div className="text-center mb-5" style={{ maxWidth: "680px", margin: "0 auto" }}>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-semibold mb-2">
              Instant Self-Help
            </span>
            <h2 className="fw-bold tracking-tight mb-2">Frequently Asked Questions</h2>
            <p className="text-muted small">
              Find quick answers to common questions about course enrollments, payments, quizzes, certificates, and technical support.
            </p>

            {/* FAQ Search Bar */}
            <div className="mt-4 mx-auto" style={{ maxWidth: "520px" }}>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 ps-3">
                  <i className="fas fa-search text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-2.5 ps-1"
                  placeholder="Search questions or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-white border border-start-0 text-muted"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm rounded-pill px-3.5 py-1.5 ${
                  selectedCategory === cat ? "btn-primary shadow-sm" : "btn-light border"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="d-flex flex-column gap-3 mb-5 mx-auto" style={{ maxWidth: "860px" }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openItem === faq.id;
                return (
                  <div key={faq.id} className="card border rounded-4 shadow-sm bg-white overflow-hidden">
                    <button
                      type="button"
                      className="card-header bg-white border-0 p-3.5 p-md-4 text-start d-flex align-items-center justify-content-between w-100"
                      onClick={() => setOpenItem(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="fw-bold text-dark fs-6 pe-3">{faq.question}</span>
                      <span
                        className={`badge rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0 ${
                          isOpen ? "bg-primary text-white" : "bg-light text-muted border"
                        }`}
                        style={{ width: "28px", height: "28px" }}
                      >
                        <i className={`fas ${isOpen ? "fa-minus" : "fa-plus"} fa-xs`} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="card-body px-3.5 px-md-4 pt-0 pb-4 text-muted" style={{ lineHeight: "1.7" }}>
                        <hr className="my-2 text-light" />
                        <p className="mb-0 small">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5 bg-light rounded-4 border">
                <i className="fas fa-question-circle fa-2x text-muted mb-3" />
                <h5 className="fw-bold mb-1">No Matching Questions</h5>
                <p className="text-muted small mb-3">
                  We couldn't find any questions matching "{searchQuery}".
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                  >
                    Reset Filters
                  </button>
                  <a href="#contact-form" className="btn btn-primary btn-sm rounded-pill px-3">
                    Send Us a Message
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Help Banner */}
          <div className="p-4 rounded-4 bg-light border text-center mx-auto" style={{ maxWidth: "860px" }}>
            <h5 className="fw-bold mb-1">Still Have Questions?</h5>
            <p className="text-muted small mb-3">
              Cannot find what you are looking for? Our friendly team is here to assist you 7 days a week.
            </p>
            <a href="#contact-form" className="btn btn-primary btn-sm rounded-pill px-4 py-2">
              <i className="fas fa-paper-plane me-1.5" /> Reach Out Directly
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
