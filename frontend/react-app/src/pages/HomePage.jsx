import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CourseCard from "../components/common/CourseCard";
import { FEATURED_COURSES } from "../data/courses";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const statsTargets = {
  students: 50000,
  courses: 1500,
  instructors: 350,
  countries: 120,
};

export default function HomePage() {
  const { notify } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, courses: 0, instructors: 0, countries: 0 });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    newsletter: false,
  });

  useEffect(() => {
    const totalSteps = 40;
    const timer = setInterval(() => {
      setStats((prev) => {
        const nextStep = {
          students: Math.min(statsTargets.students, prev.students + Math.ceil(statsTargets.students / totalSteps)),
          courses: Math.min(statsTargets.courses, prev.courses + Math.ceil(statsTargets.courses / totalSteps)),
          instructors: Math.min(
            statsTargets.instructors,
            prev.instructors + Math.ceil(statsTargets.instructors / totalSteps)
          ),
          countries: Math.min(statsTargets.countries, prev.countries + Math.ceil(statsTargets.countries / totalSteps)),
        };

        const completed =
          nextStep.students === statsTargets.students &&
          nextStep.courses === statsTargets.courses &&
          nextStep.instructors === statsTargets.instructors &&
          nextStep.countries === statsTargets.countries;

        if (completed) {
          clearInterval(timer);
        }

        return nextStep;
      });
    }, 35);

    return () => clearInterval(timer);
  }, []);

  const formattedStats = useMemo(
    () => ({
      students: stats.students.toLocaleString("en-US"),
      courses: stats.courses.toLocaleString("en-US"),
      instructors: stats.instructors.toLocaleString("en-US"),
      countries: stats.countries.toLocaleString("en-US"),
    }),
    [stats]
  );

  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setContactLoading(true);

    try {
      await api.submitContactForm(contactForm);
      notify("Thanks for reaching out! Your message has been sent to our team.", "success");
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        newsletter: false,
      });
    } catch (err) {
      notify(err.message || "Failed to send message. Please try again.", "danger");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <>
      <section className="hero-section py-4 py-lg-5">
        <div className="container py-3 py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-primary bg-opacity-10 text-primary small fw-semibold mb-3">
                <i className="fas fa-sparkles text-primary" />
                <span>Modern, Self-Paced E-Learning Platform</span>
              </div>
              <h1 className="display-4 fw-bold mb-3 tracking-tight">
                Learn Anything, <span className="text-primary">Anytime</span>, Anywhere
              </h1>
              <p className="lead text-muted mb-4 fs-5" style={{ lineHeight: "1.6" }}>
                Join thousands of students mastering top skills with expert-led courses, interactive quizzes, and verified graduation certificates.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/courses?price=free" className="btn btn-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2 shadow-sm">
                  <i className="fas fa-play-circle" />
                  <span>Start Learning Free</span>
                </Link>
                <button
                  type="button"
                  onClick={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="fas fa-compass" />
                  <span>Explore Featured</span>
                </button>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-4 text-muted small pt-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-check-circle text-success" />
                  <span>Free enrollment option</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-check-circle text-success" />
                  <span>Verified credentials</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-check-circle text-success" />
                  <span>Learn at your own pace</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img
                  src="/images/onlineimage.avif"
                  alt="Online Learning"
                  className="img-fluid rounded-4 shadow-lg border w-100"
                  style={{ maxHeight: "440px", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section py-4 py-lg-5 bg-white border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-lg-3">
              <div className="p-3 rounded-4 bg-light h-100 d-flex flex-column align-items-center justify-content-center border">
                <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary mb-2">
                  <i className="fas fa-users" />
                </div>
                <h2 className="fw-bold text-dark mb-1">{formattedStats.students}</h2>
                <span className="text-muted small fw-medium">Active Students</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-3 rounded-4 bg-light h-100 d-flex flex-column align-items-center justify-content-center border">
                <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success mb-2">
                  <i className="fas fa-book-open" />
                </div>
                <h2 className="fw-bold text-dark mb-1">{formattedStats.courses}</h2>
                <span className="text-muted small fw-medium">Online Courses</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-3 rounded-4 bg-light h-100 d-flex flex-column align-items-center justify-content-center border">
                <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning mb-2">
                  <i className="fas fa-chalkboard-user" />
                </div>
                <h2 className="fw-bold text-dark mb-1">{formattedStats.instructors}</h2>
                <span className="text-muted small fw-medium">Expert Instructors</span>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="p-3 rounded-4 bg-light h-100 d-flex flex-column align-items-center justify-content-center border">
                <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info mb-2">
                  <i className="fas fa-earth-americas" />
                </div>
                <h2 className="fw-bold text-dark mb-1">{formattedStats.countries}</h2>
                <span className="text-muted small fw-medium">Countries Reached</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="courses-section py-5">
        <div className="container">
          <div className="row mb-4 align-items-end justify-content-between">
            <div className="col-md-8">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill small fw-semibold mb-2">
                Handpicked Curriculum
              </span>
              <h2 className="fw-bold mb-1">Featured Courses</h2>
              <p className="text-muted mb-0">Start learning from world-class instructors today</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <Link to="/courses" className="btn btn-outline-primary rounded-pill px-3">
                View All Courses <i className="fas fa-arrow-right ms-1" />
              </Link>
            </div>
          </div>

          <div className="row">
            {FEATURED_COURSES.map((course) => (
              <CourseCard key={course.id} course={course} columnClass="col-md-6 col-lg-4 mb-4" />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about-section py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">About EduLearn</h2>
              <p className="text-muted">Transforming Education Since 2020</p>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="about-image-container position-relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Students Learning Together"
                  className="img-fluid rounded shadow-lg"
                />
                <div className="about-stats-card bg-primary text-white p-4 rounded shadow-lg position-absolute bottom-0 end-0">
                  <div className="row text-center">
                    <div className="col-6">
                      <h3 className="fw-bold mb-0">50K+</h3>
                      <small>Students</small>
                    </div>
                    <div className="col-6">
                      <h3 className="fw-bold mb-0">120+</h3>
                      <small>Countries</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <h3 className="fw-bold mb-4">Our Mission: Modernizing Online Education</h3>
              <p className="mb-4">
                EduLearn was founded in 2020 with a simple vision: make high-quality education accessible to everyone, everywhere.
              </p>
              <div className="about-features mb-4">
                <div className="d-flex mb-3">
                  <div className="me-3">
                    <i className="fas fa-check-circle text-primary fa-lg" />
                  </div>
                  <div>
                    <h5 className="fw-bold">Expert-Led Courses</h5>
                    <p className="text-muted mb-0">Learn from industry professionals and experienced educators.</p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="me-3">
                    <i className="fas fa-check-circle text-primary fa-lg" />
                  </div>
                  <div>
                    <h5 className="fw-bold">Flexible Learning</h5>
                    <p className="text-muted mb-0">Study at your own pace, anytime, anywhere.</p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="me-3">
                    <i className="fas fa-check-circle text-primary fa-lg" />
                  </div>
                  <div>
                    <h5 className="fw-bold">Career Support</h5>
                    <p className="text-muted mb-0">Get job-ready with certification and guidance.</p>
                  </div>
                </div>
              </div>

              <button type="button" className="btn btn-primary" onClick={() => navigate("/login")}>
                <i className="fas fa-arrow-right me-2" /> Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">Contact Us</h2>
              <p className="text-muted">Get in touch with our support team</p>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-7 mb-5 mb-lg-0">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4 p-md-5">
                  <h3 className="fw-bold mb-4">Send us a Message</h3>

                  <form onSubmit={handleContactSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="contactName" className="form-label">
                          Your Name *
                        </label>
                        <input
                          id="contactName"
                          type="text"
                          className="form-control"
                          required
                          value={contactForm.name}
                          onChange={(event) =>
                            setContactForm((prev) => ({ ...prev, name: event.target.value }))
                          }
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="contactEmail" className="form-label">
                          Email Address *
                        </label>
                        <input
                          id="contactEmail"
                          type="email"
                          className="form-control"
                          required
                          value={contactForm.email}
                          onChange={(event) =>
                            setContactForm((prev) => ({ ...prev, email: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="contactSubject" className="form-label">
                        Subject
                      </label>
                      <input
                        id="contactSubject"
                        type="text"
                        className="form-control"
                        value={contactForm.subject}
                        onChange={(event) =>
                          setContactForm((prev) => ({ ...prev, subject: event.target.value }))
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="contactMessage" className="form-label">
                        Your Message *
                      </label>
                      <textarea
                        id="contactMessage"
                        rows="5"
                        className="form-control"
                        required
                        value={contactForm.message}
                        onChange={(event) =>
                          setContactForm((prev) => ({ ...prev, message: event.target.value }))
                        }
                      />
                    </div>

                    <div className="mb-3 form-check">
                      <input
                        id="newsletter"
                        className="form-check-input"
                        type="checkbox"
                        checked={contactForm.newsletter}
                        onChange={(event) =>
                          setContactForm((prev) => ({ ...prev, newsletter: event.target.checked }))
                        }
                      />
                      <label htmlFor="newsletter" className="form-check-label">
                        Subscribe to our newsletter for course updates
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={contactLoading}>
                      {contactLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2" /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 bg-light h-100">
                <div className="card-body p-4 p-md-5">
                  <h4 className="fw-bold mb-4">Contact Information</h4>
                  <div className="contact-info mb-4">
                    <div className="d-flex mb-3">
                      <div className="me-3">
                        <i className="fas fa-map-marker-alt text-primary fa-lg" />
                      </div>
                      <div>
                        <h6 className="fw-bold">Our Location</h6>
                        <p className="text-muted mb-0">123 Learning Street, Education City</p>
                      </div>
                    </div>
                    <div className="d-flex mb-3">
                      <div className="me-3">
                        <i className="fas fa-phone text-primary fa-lg" />
                      </div>
                      <div>
                        <h6 className="fw-bold">Phone Number</h6>
                        <p className="text-muted mb-0"> +251 972 467962</p>
                      </div>
                    </div>
                    <div className="d-flex">
                      <div className="me-3">
                        <i className="fas fa-envelope text-primary fa-lg" />
                      </div>
                      <div>
                        <h6 className="fw-bold">Email Address</h6>
                        <p className="text-muted mb-0">support@edulearn.com</p>
                      </div>
                    </div>
                  </div>
                  <h6 className="fw-bold mb-3">Business Hours</h6>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-1">Monday - Friday: 9:00 AM - 6:00 PM</li>
                    <li className="mb-1">Saturday: 10:00 AM - 4:00 PM</li>
                    <li>Sunday: Closed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section py-5 bg-light">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">Frequently Asked Questions</h2>
              <p className="text-muted">Quick answers to common questions</p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border rounded-4 shadow-sm h-100 p-2">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px", fontSize: "1rem" }}>
                      <i className="fas fa-arrow-right-to-bracket" />
                    </div>
                    <h5 className="fw-bold mb-0">How do I enroll in a course?</h5>
                  </div>
                  <p className="text-muted mb-0 small" style={{ lineHeight: "1.6" }}>
                    Open any course details page and click Enroll. Free courses enroll instantly; paid courses go through a quick simulated payment verification.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border rounded-4 shadow-sm h-100 p-2">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success" style={{ width: "36px", height: "36px", fontSize: "1rem" }}>
                      <i className="fas fa-shield-halved" />
                    </div>
                    <h5 className="fw-bold mb-0">Can I get a refund?</h5>
                  </div>
                  <p className="text-muted mb-0 small" style={{ lineHeight: "1.6" }}>
                    Yes, all paid course enrollments include a 30-day money-back guarantee with zero cancellation fees.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border rounded-4 shadow-sm h-100 p-2">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info" style={{ width: "36px", height: "36px", fontSize: "1rem" }}>
                      <i className="fas fa-play" />
                    </div>
                    <h5 className="fw-bold mb-0">How do I access my course materials?</h5>
                  </div>
                  <p className="text-muted mb-0 small" style={{ lineHeight: "1.6" }}>
                    Visit your Student Dashboard anytime to stream video lectures, view lesson notes, take practice quizzes, and download resources.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border rounded-4 shadow-sm h-100 p-2">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning" style={{ width: "36px", height: "36px", fontSize: "1rem" }}>
                      <i className="fas fa-award" />
                    </div>
                    <h5 className="fw-bold mb-0">Do you offer verified certificates?</h5>
                  </div>
                  <p className="text-muted mb-0 small" style={{ lineHeight: "1.6" }}>
                    Yes! Once you complete 100% of the lessons and pass the required assessments, an official verified certificate is generated in your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-3">Start Your Learning Journey Today</h2>
              <p className="mb-0">Join thousands of successful students. No commitment, cancel anytime.</p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <button type="button" className="btn btn-light btn-lg px-5" onClick={() => navigate("/login")}>
                Get Started Free <i className="fas fa-arrow-right ms-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
