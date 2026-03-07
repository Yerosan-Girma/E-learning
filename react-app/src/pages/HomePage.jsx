import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CourseCard from "../components/common/CourseCard";
import { FEATURED_COURSES } from "../data/courses";
import { useAuth } from "../context/AuthContext";

const statsTargets = {
  students: 50000,
  courses: 1500,
  instructors: 350,
  countries: 120,
};

export default function HomePage() {
  const { notify, openSignupModal } = useAuth();
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

  const handleContactSubmit = (event) => {
    event.preventDefault();

    notify("Thanks for contacting EduLearn. Our support team will reach out soon.", "success");

    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      newsletter: false,
    });
  };

  return (
    <>
      <section className="hero-section py-5 mt-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Learn Anything, <span className="text-primary">Anytime</span>, Anywhere
              </h1>
              <p className="lead mb-4">
                Join 50,000+ students from around the world. Master new skills with expert-led courses and interactive learning experiences.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/courses" className="btn btn-primary btn-lg px-4">
                  <i className="fas fa-play-circle me-2" /> Start Learning Free
                </Link>
                <a href="#courses" className="btn btn-outline-primary btn-lg px-4">
                  <i className="fas fa-eye me-2" /> Browse Courses
                </a>
              </div>
              <div className="mt-4">
                <small className="text-muted">
                  <i className="fas fa-check-circle text-success me-2" /> No credit card required
                </small>
                <small className="text-muted ms-3">
                  <i className="fas fa-check-circle text-success me-2" /> 7-day free trial
                </small>
              </div>
            </div>
            <div className="col-lg-6">
              <img src="/images/onlineimage.avif" alt="Online Learning" className="img-fluid rounded shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 col-6 mb-4">
              <h2 className="display-4 fw-bold text-primary">{formattedStats.students}</h2>
              <p className="text-muted">Active Students</p>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <h2 className="display-4 fw-bold text-primary">{formattedStats.courses}</h2>
              <p className="text-muted">Online Courses</p>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <h2 className="display-4 fw-bold text-primary">{formattedStats.instructors}</h2>
              <p className="text-muted">Expert Instructors</p>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <h2 className="display-4 fw-bold text-primary">{formattedStats.countries}</h2>
              <p className="text-muted">Countries</p>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="courses-section py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">Featured Courses</h2>
              <p className="text-muted">Start learning from world-class instructors</p>
            </div>
          </div>

          <div className="row">
            {FEATURED_COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center mt-4">
            <Link to="/courses" className="btn btn-outline-primary btn-lg">
              View All Courses <i className="fas fa-arrow-right ms-2" />
            </Link>
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
              <h3 className="fw-bold mb-4">Our Mission: Democratize Quality Education</h3>
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

              <button type="button" className="btn btn-primary" onClick={openSignupModal}>
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

                    <button type="submit" className="btn btn-primary btn-lg">
                      <i className="fas fa-paper-plane me-2" /> Send Message
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
                        <p className="text-muted mb-0">+1 (555) 123-4567</p>
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

          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card border-0 h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">How do I enroll in a course?</h5>
                  <p className="text-muted mb-0">
                    Open any course details page and click Enroll. Free courses enroll instantly; paid courses go through payment verification.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card border-0 h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Can I get a refund?</h5>
                  <p className="text-muted mb-0">Yes, paid enrollments include a 30-day money-back guarantee.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card border-0 h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">How do I access my courses?</h5>
                  <p className="text-muted mb-0">Visit your dashboard to access enrolled courses and progress.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="card border-0 h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Do you offer certificates?</h5>
                  <p className="text-muted mb-0">Yes, certificates are available after eligible course completion.</p>
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
              <button type="button" className="btn btn-light btn-lg px-5" onClick={openSignupModal}>
                Get Started Free <i className="fas fa-arrow-right ms-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
