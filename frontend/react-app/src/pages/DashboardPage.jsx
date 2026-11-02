import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { enrollmentBadgeClass, normalizeCourse } from "../utils/courseAdapter";
import { formatCurrency } from "../utils/format";
import CertificateCard from "../components/certificates/CertificateCard";
import CertificateView from "../components/certificates/CertificateView";

export default function DashboardPage() {
  const { user, notify } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEnrollments: 0,
    approvedEnrollments: 0,
    completedLessons: 0,
    totalPayments: 0,
    totalSpent: 0,
    totalQuizAttempts: 0,
    averageQuizScore: 0,
  });
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // UI state
  const [courseFilter, setCourseFilter] = useState("all"); // 'all' | 'in_progress' | 'completed' | 'pending'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("courses"); // 'courses' | 'certificates' | 'quizzes' | 'payments'

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      try {
        const dashboardData = await api.getDashboard("student");
        setSummary(dashboardData.summary || summary);
        setEnrollments(dashboardData.enrollments || []);
        setPayments(dashboardData.payments || []);
        setQuizAttempts(dashboardData.quizAttempts || []);

        // Load certificates
        const certificatesData = await api.getMyCertificates();
        setCertificates(certificatesData.certificates || []);
      } catch (error) {
        const errorMessage =
          typeof error.message === "string"
            ? error.message
            : error.message
            ? JSON.stringify(error.message)
            : "Failed to load student dashboard";
        notify(errorMessage, "danger");
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [notify]);

  const normalizedEnrollments = useMemo(
    () =>
      enrollments.map((enrollment) => ({
        ...normalizeCourse({
          id: enrollment.course_id,
          title: enrollment.course_title,
          category: enrollment.category,
          thumbnail_url: enrollment.thumbnail_url,
          price: enrollment.price,
          discount_price: enrollment.discount_price,
          instructor_name: enrollment.instructor_name,
        }),
        status: enrollment.status,
        progress: Number(enrollment.progress || 0),
        total_lessons: Number(enrollment.total_lessons || 0),
        completed_lessons: Number(enrollment.completed_lessons || 0),
      })),
    [enrollments]
  );

  // Filtered courses based on status and search query
  const filteredCourses = useMemo(() => {
    return normalizedEnrollments.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (courseFilter === "in_progress") {
        return course.status === "approved" && course.progress < 100;
      }
      if (courseFilter === "completed") {
        return course.progress === 100;
      }
      if (courseFilter === "pending") {
        return course.status === "pending";
      }
      return true;
    });
  }, [normalizedEnrollments, courseFilter, searchQuery]);

  // Active / resume course (most recently engaged or first in progress)
  const resumeCourse = useMemo(() => {
    return (
      normalizedEnrollments.find(
        (c) => c.status === "approved" && c.progress > 0 && c.progress < 100
      ) ||
      normalizedEnrollments.find((c) => c.status === "approved" && c.progress < 100) ||
      null
    );
  }, [normalizedEnrollments]);

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleDownloadCertificate = (certificate) => {
    notify("Downloading certificate...", "info");
    // Printable / download certificate modal can be opened
    setSelectedCertificate(certificate);
  };

  const handleCloseCertificateView = () => {
    setSelectedCertificate(null);
  };

  const displayName = user?.full_name || user?.name || "Learner";

  return (
    <div className="container py-5 mt-5">
      {/* Hero Welcome Banner */}
      <div className="dashboard-hero">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-white text-primary mb-2 px-3 py-2 fw-semibold">
              <i className="fas fa-graduation-cap me-1" /> Student Learning Hub
            </span>
            <h1 className="fw-bold mb-2">Welcome back, {displayName}!</h1>
            <p className="mb-0 text-white-50 fs-6">
              Track your learning journey step-by-step, achieve course milestones, and earn verified certificates.
            </p>
          </div>
          {resumeCourse && (
            <div className="col-lg-4 mt-4 mt-lg-0">
              <div className="card bg-white bg-opacity-10 border border-white border-opacity-25 text-white p-3 rounded-4 shadow-sm">
                <small className="text-white-50 text-uppercase fw-bold" style={{ fontSize: "0.75rem" }}>
                  <i className="fas fa-bolt text-warning me-1" /> Jump Back In
                </small>
                <h6 className="fw-bold text-truncate mt-1 mb-2">{resumeCourse.title}</h6>
                <div className="progress mb-2 bg-white bg-opacity-25" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: `${resumeCourse.progress}%` }}
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-white-50">{resumeCourse.progress}% complete</small>
                  <Link
                    to={`/courses/${resumeCourse.id}/dashboard`}
                    className="btn btn-warning btn-sm fw-semibold px-3 rounded-pill text-dark shadow-sm"
                  >
                    Resume <i className="fas fa-arrow-right ms-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading dashboard...</span>
          </div>
          <p className="mt-3 text-muted">Gathering your learning progress...</p>
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="row g-4 mb-4">
            <div className="col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100 stat-card-modern">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
                    <i className="fas fa-book-open" />
                  </div>
                  <div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.75rem" }}>
                      My Courses
                    </small>
                    <h3 className="fw-bold mb-0 text-dark">{summary.totalEnrollments}</h3>
                    <small className="text-success">{summary.approvedEnrollments} Active</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100 stat-card-modern">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
                    <i className="fas fa-circle-check" />
                  </div>
                  <div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.75rem" }}>
                      Lessons Completed
                    </small>
                    <h3 className="fw-bold mb-0 text-dark">{summary.completedLessons}</h3>
                    <small className="text-muted">Total steps done</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100 stat-card-modern">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning">
                    <i className="fas fa-award" />
                  </div>
                  <div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.75rem" }}>
                      Certificates
                    </small>
                    <h3 className="fw-bold mb-0 text-dark">{certificates.length}</h3>
                    <small className="text-muted">Credentials earned</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100 stat-card-modern">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info">
                    <i className="fas fa-chart-line" />
                  </div>
                  <div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.75rem" }}>
                      Quiz Average
                    </small>
                    <h3 className="fw-bold mb-0 text-dark">
                      {Number(summary.averageQuizScore || 0).toFixed(0)}%
                    </h3>
                    <small className="text-muted">{summary.totalQuizAttempts} attempts</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Learning Journey Roadmap */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  <i className="fas fa-route text-primary me-2" />
                  Your 4-Step Learning Roadmap
                </h6>
                <small className="text-muted">Follow these steps to complete courses</small>
              </div>

              <div className="row g-3 text-center">
                <div className="col-6 col-md-3">
                  <div
                    className={`p-3 rounded-3 border ${
                      summary.totalEnrollments > 0 ? "border-success bg-success bg-opacity-10" : "bg-light"
                    }`}
                  >
                    <div className="mb-2">
                      <i
                        className={`fas ${
                          summary.totalEnrollments > 0 ? "fa-circle-check text-success" : "fa-circle text-muted"
                        } fs-4`}
                      />
                    </div>
                    <strong className="d-block small">Step 1: Enroll</strong>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {summary.totalEnrollments > 0 ? "Completed" : "Choose a course"}
                    </small>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div
                    className={`p-3 rounded-3 border ${
                      summary.completedLessons > 0 ? "border-success bg-success bg-opacity-10" : "bg-light"
                    }`}
                  >
                    <div className="mb-2">
                      <i
                        className={`fas ${
                          summary.completedLessons > 0 ? "fa-circle-check text-success" : "fa-play-circle text-primary"
                        } fs-4`}
                      />
                    </div>
                    <strong className="d-block small">Step 2: Learn Lessons</strong>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {summary.completedLessons > 0
                        ? `${summary.completedLessons} completed`
                        : "Watch & complete steps"}
                    </small>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div
                    className={`p-3 rounded-3 border ${
                      summary.totalQuizAttempts > 0 ? "border-success bg-success bg-opacity-10" : "bg-light"
                    }`}
                  >
                    <div className="mb-2">
                      <i
                        className={`fas ${
                          summary.totalQuizAttempts > 0 ? "fa-circle-check text-success" : "fa-clipboard-question text-muted"
                        } fs-4`}
                      />
                    </div>
                    <strong className="d-block small">Step 3: Test Knowledge</strong>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {summary.totalQuizAttempts > 0 ? "Quizzes taken" : "Pass course quizzes"}
                    </small>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div
                    className={`p-3 rounded-3 border ${
                      certificates.length > 0 ? "border-success bg-success bg-opacity-10" : "bg-light"
                    }`}
                  >
                    <div className="mb-2">
                      <i
                        className={`fas ${
                          certificates.length > 0 ? "fa-award text-warning" : "fa-award text-muted"
                        } fs-4`}
                      />
                    </div>
                    <strong className="d-block small">Step 4: Get Certified</strong>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {certificates.length > 0 ? `${certificates.length} Certified` : "Earn upon 100% completion"}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Views */}
          <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3">
            <li className="nav-item">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${
                  activeTab === "courses" ? "btn-primary" : "btn-light"
                }`}
                onClick={() => setActiveTab("courses")}
              >
                <i className="fas fa-layer-group me-1" /> My Courses ({normalizedEnrollments.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${
                  activeTab === "certificates" ? "btn-primary" : "btn-light"
                }`}
                onClick={() => setActiveTab("certificates")}
              >
                <i className="fas fa-award me-1" /> Certificates ({certificates.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${
                  activeTab === "quizzes" ? "btn-primary" : "btn-light"
                }`}
                onClick={() => setActiveTab("quizzes")}
              >
                <i className="fas fa-list-check me-1" /> Quiz History ({quizAttempts.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${
                  activeTab === "payments" ? "btn-primary" : "btn-light"
                }`}
                onClick={() => setActiveTab("payments")}
              >
                <i className="fas fa-receipt me-1" /> Payment History ({payments.length})
              </button>
            </li>
          </ul>

          {/* TAB 1: MY COURSES */}
          {activeTab === "courses" && (
            <div>
              {/* Search & Filter Bar */}
              {normalizedEnrollments.length > 0 && (
                <div className="row g-3 align-items-center mb-4">
                  <div className="col-md-7">
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          courseFilter === "all" ? "btn-outline-primary active" : "btn-outline-secondary"
                        }`}
                        onClick={() => setCourseFilter("all")}
                      >
                        All ({normalizedEnrollments.length})
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          courseFilter === "in_progress" ? "btn-outline-primary active" : "btn-outline-secondary"
                        }`}
                        onClick={() => setCourseFilter("in_progress")}
                      >
                        In Progress (
                        {
                          normalizedEnrollments.filter(
                            (c) => c.status === "approved" && c.progress < 100
                          ).length
                        }
                        )
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          courseFilter === "completed" ? "btn-outline-primary active" : "btn-outline-secondary"
                        }`}
                        onClick={() => setCourseFilter("completed")}
                      >
                        Completed (
                        {normalizedEnrollments.filter((c) => c.progress === 100).length}
                        )
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          courseFilter === "pending" ? "btn-outline-primary active" : "btn-outline-secondary"
                        }`}
                        onClick={() => setCourseFilter("pending")}
                      >
                        Pending Access (
                        {normalizedEnrollments.filter((c) => c.status === "pending").length}
                        )
                      </button>
                    </div>
                  </div>

                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fas fa-search text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Course Cards Grid */}
              {normalizedEnrollments.length === 0 ? (
                /* Inspiring Empty State */
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
                  <div className="mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className="fas fa-compass fa-2x" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-2">Start Your Learning Adventure</h4>
                  <p className="text-muted mx-auto mb-4" style={{ maxWidth: "480px" }}>
                    You haven’t enrolled in any courses yet. Browse our comprehensive catalog of technology, business, and creative courses.
                  </p>
                  <div>
                    <Link to="/courses" className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm">
                      <i className="fas fa-magnifying-glass me-2" />
                      Explore Available Courses
                    </Link>
                  </div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No courses match your filter or search query.</p>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setCourseFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredCourses.map((enrollment) => {
                    const isCompleted = enrollment.progress === 100;
                    const isApproved = enrollment.status === "approved";

                    return (
                      <div className="col-md-6 col-lg-4" key={enrollment.id}>
                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden stat-card-modern d-flex flex-column">
                          <div className="position-relative">
                            <img
                              src={enrollment.image}
                              alt={enrollment.title}
                              className="card-img-top"
                              style={{ height: "180px", objectFit: "cover" }}
                            />
                            <div className="position-absolute top-0 start-0 m-3">
                              <span
                                className={`badge bg-${enrollmentBadgeClass(
                                  enrollment.status
                                )} text-uppercase px-2 py-1 shadow-sm`}
                              >
                                {enrollment.status}
                              </span>
                            </div>
                            <div className="position-absolute top-0 end-0 m-3">
                              <span className="badge bg-dark bg-opacity-75 text-white px-2 py-1">
                                {enrollment.category || "General"}
                              </span>
                            </div>
                          </div>

                          <div className="card-body d-flex flex-column p-4">
                            <h6 className="fw-bold mb-1 line-clamp-2" title={enrollment.title}>
                              {enrollment.title}
                            </h6>
                            <small className="text-muted mb-3 d-block">
                              <i className="fas fa-chalkboard-user me-1 text-primary" />
                              {enrollment.instructor}
                            </small>

                            {/* Step Progress Tracker */}
                            <div className="mt-auto">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="fw-semibold text-dark">Course Progress</small>
                                <small className="fw-bold text-primary">{enrollment.progress}%</small>
                              </div>
                              <div className="progress mb-2 rounded-pill" style={{ height: "8px" }}>
                                <div
                                  className={`progress-bar rounded-pill ${
                                    isCompleted ? "bg-success" : "bg-primary"
                                  }`}
                                  style={{ width: `${enrollment.progress}%` }}
                                />
                              </div>

                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                                  <i className="fas fa-list-check me-1" />
                                  {enrollment.completed_lessons > 0 || enrollment.total_lessons > 0
                                    ? `${enrollment.completed_lessons} of ${enrollment.total_lessons} lessons done`
                                    : `${enrollment.progress}% complete`}
                                </small>
                                {isCompleted && (
                                  <span className="badge bg-success bg-opacity-10 text-success small">
                                    <i className="fas fa-check me-1" /> Finished
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="d-flex gap-2">
                                {isApproved ? (
                                  <Link
                                    to={`/courses/${enrollment.id}/dashboard`}
                                    className={`btn btn-sm w-100 fw-semibold rounded-pill ${
                                      isCompleted ? "btn-outline-success" : "btn-primary"
                                    }`}
                                  >
                                    <i className={`fas ${isCompleted ? "fa-rotate-left" : "fa-play"} me-1`} />
                                    {isCompleted ? "Review Course" : "Continue Step"}
                                  </Link>
                                ) : (
                                  <Link
                                    to={`/courses/${enrollment.id}`}
                                    className="btn btn-warning btn-sm w-100 fw-semibold rounded-pill"
                                  >
                                    <i className="fas fa-lock me-1" /> Complete Access
                                  </Link>
                                )}
                                <Link
                                  to={`/courses/${enrollment.id}`}
                                  className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                  title="Course Overview"
                                >
                                  <i className="fas fa-info" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Your Earned Certificates</h5>
                  <p className="text-muted small mb-0">
                    Certificates are awarded upon achieving 100% course progress and passing quizzes.
                  </p>
                </div>
                <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 fs-6 rounded-pill">
                  <i className="fas fa-award me-1" /> {certificates.length} Total
                </span>
              </div>

              {certificates.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-certificate fa-3x mb-3 text-muted opacity-50" />
                  <h6>No certificates earned yet</h6>
                  <p className="small text-muted mb-3">
                    Finish all lessons and quizzes in your enrolled courses to unlock your verified certificates.
                  </p>
                  <button className="btn btn-outline-primary btn-sm rounded-pill" onClick={() => setActiveTab("courses")}>
                    Go to My Courses
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {certificates.map((cert) => (
                    <div className="col-md-6 col-lg-4" key={cert.id}>
                      <CertificateCard
                        certificate={cert}
                        onView={handleViewCertificate}
                        onDownload={handleDownloadCertificate}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUIZ ATTEMPTS */}
          {activeTab === "quizzes" && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Quiz Activity History</h5>
                  <p className="text-muted small mb-0">Review your past quiz scores and test outcomes.</p>
                </div>
                <div className="text-end">
                  <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                    Average: {Number(summary.averageQuizScore || 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              {quizAttempts.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-clipboard-question fa-3x mb-3 text-muted opacity-50" />
                  <h6>No quiz attempts recorded yet</h6>
                  <p className="small text-muted mb-0">
                    Quizzes are embedded inside each course under the Quizzes tab.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Quiz Title</th>
                        <th>Course</th>
                        <th>Score</th>
                        <th>Result</th>
                        <th>Attempt Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizAttempts.map((attempt) => {
                        const score = Number(attempt.score || 0);
                        const passed = score >= 50;
                        return (
                          <tr key={attempt.id}>
                            <td className="fw-semibold">{attempt.quiz_title}</td>
                            <td className="text-muted">{attempt.course_title}</td>
                            <td>
                              <strong>{score.toFixed(1)}%</strong>
                              <span className="text-muted small ms-1">
                                ({attempt.correct_answers}/{attempt.total_questions})
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  passed ? "bg-success" : "bg-danger"
                                } rounded-pill px-2 py-1`}
                              >
                                {passed ? "Passed" : "Needs Review"}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {attempt.attempted_at
                                ? new Date(attempt.attempted_at).toLocaleDateString()
                                : "Recent"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Billing & Transactions</h5>
                  <p className="text-muted small mb-0">Record of all payments and course purchase receipts.</p>
                </div>
                <div className="text-end">
                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                    Total Spent: {formatCurrency(summary.totalSpent)}
                  </span>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-receipt fa-3x mb-3 text-muted opacity-50" />
                  <h6>No payment records yet</h6>
                  <p className="small text-muted mb-0">All course transactions will appear here.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Course</th>
                        <th>Payment Method</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Transaction Ref</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="fw-semibold">{payment.course_title}</td>
                          <td className="text-capitalize">
                            <i className="fas fa-credit-card me-1 text-muted" />
                            {payment.gateway ? payment.gateway.replace("_", " ") : "Card"}
                          </td>
                          <td className="fw-bold text-dark">{formatCurrency(payment.amount)}</td>
                          <td>
                            <span
                              className={`badge bg-${enrollmentBadgeClass(
                                payment.status
                              )} rounded-pill px-2 py-1`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="font-monospace small text-muted">
                            {payment.transaction_id || "N/A"}
                          </td>
                          <td className="text-muted small">
                            {payment.created_at
                              ? new Date(payment.created_at).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Certificate Modal View */}
      {selectedCertificate && (
        <CertificateView
          certificate={selectedCertificate}
          onClose={handleCloseCertificateView}
          onDownload={handleDownloadCertificate}
        />
      )}
    </div>
  );
}
