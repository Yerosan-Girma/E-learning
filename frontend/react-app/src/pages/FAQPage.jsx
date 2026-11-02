import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

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

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItem, setOpenItem] = useState(FAQ_DATA[0].id);

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
      <div className="container" style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-semibold mb-2">
            Help Center
          </span>
          <h1 className="fw-bold tracking-tight mb-2">Frequently Asked Questions</h1>
          <p className="text-muted small" style={{ maxWidth: "560px", margin: "0 auto" }}>
            Find quick answers to common questions about course enrollments, payments, quizzes, certificates, and technical support.
          </p>

          {/* Search Box */}
          <div className="mt-4 mx-auto" style={{ maxWidth: "500px" }}>
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
                selectedCategory === cat ? "btn-primary" : "btn-light border"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="d-flex flex-column gap-3 mb-5">
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
                      className={`badge rounded-circle p-2 d-flex align-items-center justify-content-center ${
                        isOpen ? "bg-primary text-white" : "bg-light text-muted border"
                      }`}
                      style={{ width: "32px", height: "32px" }}
                    >
                      <i className={`fas fa-chevron-${isOpen ? "up" : "down"} small`} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="card-body pt-0 px-3.5 px-md-4 pb-4">
                      <p className="text-muted small mb-0" style={{ lineHeight: "1.7" }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-5 card border rounded-4 bg-light p-4">
              <i className="fas fa-magnifying-glass fa-2x text-muted mb-2 opacity-50" />
              <h5 className="fw-bold text-dark mb-1">No matching questions found</h5>
              <p className="text-muted small mb-3">
                Try searching with different keywords or browse our categories.
              </p>
              <div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Still Need Help Banner */}
        <div className="card border-0 rounded-4 shadow-sm p-4 text-center bg-light border">
          <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary mx-auto mb-2">
            <i className="fas fa-headset" />
          </div>
          <h5 className="fw-bold mb-1">Still Have Questions?</h5>
          <p className="text-muted small mb-3">
            Can't find what you're looking for? Reach out to our dedicated support team directly.
          </p>
          <div>
            <Link to="/contact" className="btn btn-primary rounded-pill px-4">
              <i className="fas fa-envelope me-2" /> Contact Our Support Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
