import { useState } from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="footer text-white py-5 mt-5" style={{ backgroundColor: "#0f172a" }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6 mb-2">
            <Link to="/" className="d-flex align-items-center gap-2 text-white text-decoration-none mb-3">
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-3"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                }}
              >
                <i className="fas fa-graduation-cap" />
              </div>
              <span className="fw-bold fs-4 tracking-tight">
                Edu<span className="text-primary">Learn</span>
              </span>
            </Link>
            <p className="text-light text-opacity-75 small mb-4" style={{ maxWidth: "340px" }}>
              Empowering learners worldwide with accessible, high-quality, and interactive online education.
            </p>
            <div className="social-icons d-flex align-items-center gap-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: "36px", height: "36px" }}
                aria-label="Twitter"
              >
                <i className="fab fa-x-twitter" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: "36px", height: "36px" }}
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: "36px", height: "36px" }}
                aria-label="GitHub"
              >
                <i className="fab fa-github" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: "36px", height: "36px" }}
                aria-label="YouTube"
              >
                <i className="fab fa-youtube" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-lg-2 col-md-3 mb-2">
            <h6 className="fw-bold text-uppercase text-white small letter-spacing-1 mb-3">Platform</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/courses" className="text-light text-opacity-75 text-decoration-none hover-white">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?price=free" className="text-light text-opacity-75 text-decoration-none hover-white">
                  Free Courses
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-light text-opacity-75 text-decoration-none hover-white">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-light text-opacity-75 text-decoration-none hover-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="col-6 col-lg-2 col-md-3 mb-2">
            <h6 className="fw-bold text-uppercase text-white small letter-spacing-1 mb-3">Support</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/contact#faq" className="text-light text-opacity-75 text-decoration-none hover-white">
                  FAQ & Help
                </Link>
              </li>
              <li>
                <Link to="/contact#contact-form" className="text-light text-opacity-75 text-decoration-none hover-white">
                  Contact Support
                </Link>
              </li>
              <li>
                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 py-1 px-2">
                  <i className="fas fa-circle me-1" style={{ fontSize: "0.5rem" }} /> Systems Normal
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="col-lg-3 col-md-6 mb-2">
            <h6 className="fw-bold text-uppercase text-white small letter-spacing-1 mb-3">Stay Updated</h6>
            <p className="text-light text-opacity-75 small mb-3">
              Subscribe to get announcements on new courses and features.
            </p>
            {subscribed ? (
              <div className="alert alert-success py-2 px-3 small border-0 rounded-3">
                <i className="fas fa-check-circle me-1" /> Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="d-flex flex-column gap-2">
                <div className="input-group">
                  <input
                    type="email"
                    required
                    className="form-control form-control-sm bg-dark text-white border-secondary"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <button className="btn btn-primary btn-sm px-3" type="submit">
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <hr className="border-secondary my-4 opacity-50" />

        <div className="row align-items-center g-2 small text-light text-opacity-75">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} EduLearn. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <span className="me-3">Verified Academic Platform</span>
            <span>Security & Privacy Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
