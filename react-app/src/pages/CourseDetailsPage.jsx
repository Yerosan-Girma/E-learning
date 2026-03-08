import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CourseCard from "../components/common/CourseCard";
import { useAuth } from "../context/AuthContext";
import { COURSES, COURSES_BY_ID, getCurriculumByCourseId } from "../data/courses";
import { api } from "../services/api";
import { formatNumber, formatPrice, starsFromRating } from "../utils/format";
import {
  addPaymentRecord,
  getCourseEnrollment,
  upsertEnrollment,
} from "../utils/storage";

function PaymentModal({ show, onClose, onSubmit, form, setForm, course }) {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Complete Enrollment</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <h6>
                  <i className="fas fa-info-circle me-2" /> Payment Instructions
                </h6>
                <p className="mb-2">
                  Submit payment details and screenshot for admin verification.
                </p>
                <p className="mb-0">
                  Course: <strong>{course.title}</strong> | Amount: <strong>{formatPrice(course.discountPrice || course.price)}</strong>
                </p>
              </div>

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="paymentMethod" className="form-label">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    className="form-select"
                    required
                    value={form.method}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, method: event.target.value }))
                    }
                  >
                    <option value="">Select Payment Method</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="manual">Manual Proof Upload</option>
                    <option value="mock">Mock Gateway (Testing)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="transactionId" className="form-label">
                    Transaction ID
                  </label>
                  <input
                    id="transactionId"
                    type="text"
                    className="form-control"
                    placeholder="Enter transaction reference number"
                    value={form.transactionId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, transactionId: event.target.value }))
                    }
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="paymentScreenshot" className="form-label">
                    Upload Payment Screenshot *
                  </label>
                  <input
                    id="paymentScreenshot"
                    type="file"
                    className="form-control"
                    accept="image/*"
                    required={form.method === "manual"}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setForm((prev) => ({ ...prev, screenshot: file || null }));
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="paymentNotes" className="form-label">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="paymentNotes"
                    className="form-control"
                    rows="2"
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  <i className="fas fa-paper-plane me-2" /> Submit for Approval
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, role, user, notify } = useAuth();

  const courseId = Number(id);
  const course = COURSES_BY_ID[courseId];

  const [activeTab, setActiveTab] = useState("overview");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    method: "",
    transactionId: "",
    screenshot: null,
    notes: "",
  });
  const [enrollment, setEnrollment] = useState(() => getCourseEnrollment(courseId));

  useEffect(() => {
    setEnrollment(getCourseEnrollment(courseId));
  }, [courseId]);

  const curriculum = useMemo(() => getCurriculumByCourseId(courseId), [courseId]);

  const relatedCourses = useMemo(() => {
    if (!course) return [];

    return COURSES.filter(
      (item) => item.id !== course.id && (item.category === course.category || item.isFeatured)
    ).slice(0, 3);
  }, [course]);

  if (!course) {
    return (
      <div className="container py-5 mt-5">
        <div className="alert alert-warning">Course not found.</div>
        <Link to="/courses" className="btn btn-primary">
          Back to Courses
        </Link>
      </div>
    );
  }

  const effectivePrice = course.discountPrice || course.price;
  const discount =
    course.price > 0 && course.discountPrice > 0
      ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
      : 0;
  const stars = starsFromRating(course.rating);

  const isApproved = enrollment?.status === "approved";
  const isPending = enrollment?.status === "pending";

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      notify("Please log in before enrolling.", "warning");
      navigate("/login");
      return;
    }

    if (role !== "student") {
      notify("Only student accounts can enroll in courses.", "warning");
      return;
    }

    if (isApproved) {
      navigate(`/learning/${course.id}`);
      return;
    }

    if (course.isFree || effectivePrice === 0) {
      api
        .enrollCourse(course.id)
        .then((data) => {
          const record = data.enrollment || {
            id: course.id,
            title: course.title,
            status: "approved",
            enrollmentDate: new Date().toISOString(),
            progress: 0,
            lastAccessed: new Date().toISOString(),
          };
          upsertEnrollment(record);
          setEnrollment(record);
          notify("Free course enrolled successfully.", "success");
          navigate(`/learning/${course.id}`);
        })
        .catch((error) => notify(error.message || "Failed to enroll", "danger"));
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!paymentForm.method) {
      notify("Please select payment method.", "danger");
      return;
    }

    if (paymentForm.method === "manual" && !paymentForm.screenshot) {
      notify("Please upload payment screenshot.", "danger");
      return;
    }

    try {
      let status = "pending";
      let transactionId = paymentForm.transactionId || "";

      if (paymentForm.method === "manual") {
        const data = await api.submitManualProof(course.id, {
          screenshot: paymentForm.screenshot,
          transactionId: paymentForm.transactionId,
          notes: paymentForm.notes,
        });
        transactionId = data.paymentId || transactionId;
        status = "pending";
      } else {
        const data = await api.initializePayment(course.id, paymentForm.method || "mock");
        transactionId = data.transactionId || transactionId;
        status = data.status === "completed" ? "approved" : "pending";
      }

      const paymentRecord = {
        id: Date.now(),
        courseId: course.id,
        courseTitle: course.title,
        amount: effectivePrice,
        method: paymentForm.method,
        transactionId,
        screenshot: paymentForm.screenshot?.name || "",
        notes: paymentForm.notes,
        status,
        date: new Date().toISOString(),
        userEmail: user?.email || "",
        userName: user?.name || "",
      };
      addPaymentRecord(paymentRecord);

      const enrollmentRecord = {
        id: course.id,
        title: course.title,
        status,
        enrollmentDate: new Date().toISOString(),
        progress: 0,
        lastAccessed: null,
      };

      upsertEnrollment(enrollmentRecord);
      setEnrollment(enrollmentRecord);

      setPaymentForm({ method: "", transactionId: "", screenshot: null, notes: "" });
      setShowPaymentModal(false);
      notify(
        status === "approved"
          ? "Payment completed. You can start learning now."
          : "Payment submitted. Your enrollment is pending approval.",
        "success"
      );
    } catch (error) {
      notify(error.message || "Payment submission failed.", "danger");
    }
  };

  return (
    <>
      <div className="course-single-hero">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/courses">Courses</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-3">{course.title}</h1>
              <p className="lead mb-4">{course.shortDescription}</p>

              <div className="d-flex align-items-center flex-wrap gap-3 mb-4">
                <div className="d-flex align-items-center">
                  <div className="course-rating me-2">
                    {Array.from({ length: stars.full }).map((_, idx) => (
                      <i key={`full-${idx}`} className="fas fa-star text-warning" />
                    ))}
                    {stars.hasHalf && <i className="fas fa-star-half-alt text-warning" />}
                  </div>
                  <span className="fw-bold me-2">{course.rating}</span>
                  <span className="text-muted">({formatNumber(course.reviews)} reviews)</span>
                </div>

                <span className="text-muted">
                  <i className="fas fa-user-graduate me-1" /> {formatNumber(course.students)} students
                </span>
                <span className="badge bg-success">{course.level}</span>
                <span className="text-muted">
                  <i className="far fa-clock me-1" /> {course.durationHours} hours
                </span>
              </div>

              <div className="instructor-card d-inline-flex align-items-center p-3 mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/32.jpg"
                  alt="Instructor"
                  className="rounded-circle me-3"
                  width="60"
                />
                <div>
                  <h6 className="fw-bold mb-1">Created by {course.instructor}</h6>
                  <p className="text-muted small mb-0">Senior Instructor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mb-5 mb-lg-0">
            <ul className="nav nav-tabs mb-4" role="tablist">
              {["overview", "curriculum", "instructor", "reviews"].map((tab) => (
                <li className="nav-item" role="presentation" key={tab}>
                  <button
                    className={`nav-link ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                </li>
              ))}
            </ul>

            {activeTab === "overview" && (
              <div>
                <h4 className="fw-bold mb-4">What You Will Learn</h4>
                <div className="row mb-5">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      {course.whatYouLearn.slice(0, 3).map((item) => (
                        <li className="mb-3" key={item}>
                          <i className="fas fa-check text-success me-2" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      {course.whatYouLearn.slice(3).map((item) => (
                        <li className="mb-3" key={item}>
                          <i className="fas fa-check text-success me-2" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <h4 className="fw-bold mb-3">Description</h4>
                <p>{course.fullDescription}</p>

                <div className="mt-5">
                  <h4 className="fw-bold mb-4">Course Requirements</h4>
                  <ul className="list-unstyled">
                    {course.requirements.map((item) => (
                      <li className="mb-2" key={item}>
                        <i className="fas fa-check-circle text-primary me-2" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="accordion curriculum-accordion">
                {curriculum.map((module) => (
                  <div className="accordion-item" key={module.id}>
                    <div className="accordion-button">
                      <div className="d-flex justify-content-between w-100 me-3">
                        <span>{module.title}</span>
                        <span className="text-muted">{module.duration}</span>
                      </div>
                    </div>
                    <div className="accordion-body">
                      {module.lessons.map((lesson) => (
                        <div className="curriculum-item" key={lesson}>
                          <span>
                            <i className="far fa-play-circle me-2" /> {lesson}
                          </span>
                          <small className="text-muted">Preview</small>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "instructor" && (
              <div className="row">
                <div className="col-md-3 text-center mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="Instructor"
                    className="rounded-circle mb-3"
                    width="120"
                  />
                  <h5 className="fw-bold">{course.instructor}</h5>
                  <p className="text-muted">Senior Instructor</p>
                </div>
                <div className="col-md-9">
                  <h6 className="fw-bold">About the Instructor</h6>
                  <p>{course.instructorBio}</p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {course.reviewsList.map((review) => (
                  <div className="card border-0 shadow-sm mb-3" key={review.id}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold mb-0">{review.author}</h6>
                        <small className="text-muted">{review.date}</small>
                      </div>
                      <div className="mb-2 text-warning">
                        {Array.from({ length: review.rating }).map((_, idx) => (
                          <i key={`r-${review.id}-${idx}`} className="fas fa-star" />
                        ))}
                      </div>
                      <p className="mb-0 text-muted">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="sticky-sidebar">
              <div className="card enrollment-card">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-primary fw-bold">{formatPrice(effectivePrice)}</h3>
                    {course.price > 0 && course.discountPrice > 0 && (
                      <>
                        <s className="text-muted">{formatPrice(course.price)}</s>
                        <span className="badge bg-danger ms-2">{discount}% OFF</span>
                      </>
                    )}
                    <p className="text-muted small mt-2">30-Day Money-Back Guarantee</p>
                  </div>

                  <div className="d-grid gap-2 mb-3">
                    <button
                      className={`btn btn-lg ${isPending ? "btn-warning" : "btn-primary"}`}
                      type="button"
                      onClick={handleEnrollClick}
                      disabled={isPending}
                    >
                      {isApproved ? (
                        <>
                          <i className="fas fa-play-circle me-2" /> Continue Learning
                        </>
                      ) : isPending ? (
                        <>
                          <i className="fas fa-clock me-2" /> Pending Approval
                        </>
                      ) : (
                        <>
                          <i className="fas fa-shopping-cart me-2" /> Enroll Now
                        </>
                      )}
                    </button>

                    <button className="btn btn-outline-primary btn-lg" type="button">
                      <i className="far fa-heart me-2" /> Add to Wishlist
                    </button>
                  </div>

                  <h6 className="fw-bold mb-3">This course includes:</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fas fa-video text-primary me-2" /> {course.durationHours} hours on-demand video
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-file-alt text-primary me-2" /> 12 articles and resources
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-download text-primary me-2" /> 15 downloadable resources
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-infinity text-primary me-2" /> Full lifetime access
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-trophy text-primary me-2" /> Certificate of completion
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card mt-3 border-0 bg-light">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Your Progress</h6>
                  <div className="progress mb-2" style={{ height: "8px" }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${enrollment?.progress || 0}%` }} />
                  </div>
                  <small className="text-muted">
                    {isApproved
                      ? `${enrollment?.progress || 0}% completed`
                      : isPending
                      ? "Enrollment pending approval"
                      : "Not enrolled yet"}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-5 bg-light">
        <div className="container">
          <h3 className="fw-bold mb-4">Students also bought</h3>
          <div className="row">
            {relatedCourses.map((related) => (
              <CourseCard key={related.id} course={related} />
            ))}
          </div>
        </div>
      </section>

      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePaymentSubmit}
        form={paymentForm}
        setForm={setPaymentForm}
        course={course}
      />
    </>
  );
}
