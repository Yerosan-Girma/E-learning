import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="py-4 py-lg-5">
      {/* Hero Section */}
      <section className="container mb-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-semibold mb-3">
              About EduLearn
            </span>
            <h1 className="display-4 fw-bold mb-3 tracking-tight">
              Democratizing Quality Education for Everyone, <span className="text-primary">Everywhere</span>
            </h1>
            <p className="lead text-muted mb-4 fs-5" style={{ lineHeight: "1.7" }}>
              Founded in 2020, EduLearn is on a mission to bridge the global skills gap by providing world-class, accessible, and verified online education for ambitious learners worldwide.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/courses" className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2 rounded-pill shadow-sm">
                <i className="fas fa-compass" />
                <span>Explore Catalog</span>
              </Link>
              <Link to="/contact" className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center gap-2 rounded-pill">
                <i className="fas fa-envelope" />
                <span>Get in Touch</span>
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="position-relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Students learning together"
                className="img-fluid rounded-4 shadow-lg border w-100"
                style={{ maxHeight: "420px", objectFit: "cover" }}
              />
              <div
                className="position-absolute bottom-0 start-0 m-3 p-3 bg-white bg-opacity-95 rounded-3 shadow border"
                style={{ backdropFilter: "blur(8px)", maxWidth: "260px" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-initials bg-success text-white">
                    <i className="fas fa-award" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Verified Platform</h6>
                    <small className="text-muted">Over 50K verified certificates issued</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-light py-5 border-top border-bottom my-5">
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-semibold mb-2">
              Our Core Pillars
            </span>
            <h2 className="fw-bold mb-2">Why Learners Choose EduLearn</h2>
            <p className="text-muted small">
              We design our educational experiences around practical mastery, flexible scheduling, and recognized credentials.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border rounded-4 shadow-sm p-3 bg-white">
                <div className="card-body">
                  <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary mb-3">
                    <i className="fas fa-chalkboard-user" />
                  </div>
                  <h5 className="fw-bold mb-2">Expert Instructors</h5>
                  <p className="text-muted small mb-0">
                    Learn directly from industry leaders and certified educators who bring real-world practice to every lesson.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border rounded-4 shadow-sm p-3 bg-white">
                <div className="card-body">
                  <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success mb-3">
                    <i className="fas fa-clock-rotate-left" />
                  </div>
                  <h5 className="fw-bold mb-2">Self-Paced Learning</h5>
                  <p className="text-muted small mb-0">
                    Study anytime, anywhere, on any device. Your progress is saved automatically across all your devices.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border rounded-4 shadow-sm p-3 bg-white">
                <div className="card-body">
                  <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning mb-3">
                    <i className="fas fa-list-check" />
                  </div>
                  <h5 className="fw-bold mb-2">Hands-On Practice</h5>
                  <p className="text-muted small mb-0">
                    Reinforce your understanding with interactive quizzes, practice questions, and downloadable resources.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border rounded-4 shadow-sm p-3 bg-white">
                <div className="card-body">
                  <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info mb-3">
                    <i className="fas fa-award" />
                  </div>
                  <h5 className="fw-bold mb-2">Verified Certificates</h5>
                  <p className="text-muted small mb-0">
                    Earn verifiable digital certificates to share on LinkedIn, resumes, and with prospective employers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="container my-5 py-3">
        <div className="card border-0 rounded-4 shadow-sm p-4 p-lg-5 text-white" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" }}>
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <h2 className="display-5 fw-bold mb-1">50K+</h2>
              <span className="text-white-50 small">Active Students</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="display-5 fw-bold mb-1">1,500+</h2>
              <span className="text-white-50 small">Online Courses</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="display-5 fw-bold mb-1">350+</h2>
              <span className="text-white-50 small">Expert Instructors</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="display-5 fw-bold mb-1">120+</h2>
              <span className="text-white-50 small">Countries Reached</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="container my-5 text-center">
        <div className="p-4 p-md-5 rounded-4 bg-light border">
          <h3 className="fw-bold mb-2">Ready to Start Learning?</h3>
          <p className="text-muted mb-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
            Join thousands of students accelerating their careers. Create a free account today with zero commitments.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/courses" className="btn btn-primary btn-lg rounded-pill px-4">
              Browse All Courses
            </Link>
            <Link to="/login?tab=signup" className="btn btn-outline-primary btn-lg rounded-pill px-4">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

