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
        const errorMessage = typeof error.message === 'string' 
          ? error.message 
          : (error.message ? JSON.stringify(error.message) : "Failed to load student dashboard");
        notify(errorMessage, "danger");
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [notify]);

  useEffect(() => {
    if (!loading && summary.totalEnrollments === 0) {
      navigate("/courses", { replace: true });
    }
  }, [loading, navigate, summary.totalEnrollments]);

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
      })),
    [enrollments]
  );

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleDownloadCertificate = (certificate) => {
    notify("Certificate download feature coming soon", "info");
  };

  const handleCloseCertificateView = () => {
    setSelectedCertificate(null);
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row mb-4 align-items-center">
        <div className="col-lg-8">
          <h2 className="fw-bold mb-1">
            Student Dashboard: <span className="text-primary">{user?.name || "Student"}</span>
          </h2>
          <p className="text-muted mb-0">
            Track your enrollments, payments, course progress, and quiz activity.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading student dashboard...</div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Enrolled Courses</small>
                  <h3 className="fw-bold mb-0">{summary.totalEnrollments}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Approved Access</small>
                  <h3 className="fw-bold mb-0">{summary.approvedEnrollments}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Completed Lessons</small>
                  <h3 className="fw-bold mb-0">{summary.completedLessons}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Total Spent</small>
                  <h3 className="fw-bold mb-0">{formatCurrency(summary.totalSpent)}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">My Courses</h5>

                  {normalizedEnrollments.length === 0 ? (
                    <div className="text-muted">
                      You have not enrolled in any course yet. <Link to="/courses">Browse courses</Link>.
                    </div>
                  ) : (
                    <div className="row">
                      {normalizedEnrollments.map((enrollment) => (
                        <div className="col-md-6 mb-3" key={enrollment.id}>
                          <div className="card h-100 course-card shadow-sm">
                            <img src={enrollment.image} alt={enrollment.title} className="card-img-top course-img" />
                            <div className="card-body d-flex flex-column">
                              <h6 className="fw-bold">{enrollment.title}</h6>
                              <p className="text-muted small mb-2">{enrollment.instructor}</p>
                              <span className={`badge bg-${enrollmentBadgeClass(enrollment.status)} mb-3 text-uppercase`}>
                                {enrollment.status}
                              </span>
                              <div className="progress mb-2" style={{ height: "8px" }}>
                                <div className="progress-bar" style={{ width: `${enrollment.progress}%` }} />
                              </div>
                              <small className="text-muted mb-3">{enrollment.progress}% completed</small>

                              <div className="d-flex gap-2 mt-auto">
                                {enrollment.status === "approved" ? (
                                  <Link to={`/courses/${enrollment.id}/dashboard`} className="btn btn-primary btn-sm">
                                    Continue
                                  </Link>
                                ) : (
                                  <Link to={`/courses/${enrollment.id}`} className="btn btn-warning btn-sm">
                                    Complete Access
                                  </Link>
                                )}
                                <Link to={`/courses/${enrollment.id}`} className="btn btn-outline-primary btn-sm">
                                  Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Payment History</h5>
                  {payments.length === 0 ? (
                    <p className="text-muted mb-0">No payment records yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Gateway</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Transaction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td>{payment.course_title}</td>
                              <td className="text-capitalize">{payment.gateway.replace("_", " ")}</td>
                              <td>{formatCurrency(payment.amount)}</td>
                              <td>
                                <span className={`badge bg-${enrollmentBadgeClass(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td>{payment.transaction_id}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Quiz Activity</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Attempts</span>
                    <strong>{summary.totalQuizAttempts}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Average Score</span>
                    <strong>{Number(summary.averageQuizScore || 0).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">My Certificates</h6>
                  {certificates.length === 0 ? (
                    <small className="text-muted">
                      Complete course progress and pass quizzes to earn certificates.
                    </small>
                  ) : (
                    <div className="space-y-3">
                      {certificates.slice(0, 3).map((certificate) => (
                        <CertificateCard
                          key={certificate.id}
                          certificate={certificate}
                          onView={handleViewCertificate}
                          onDownload={handleDownloadCertificate}
                        />
                      ))}
                      {certificates.length > 3 && (
                        <small className="text-muted">
                          +{certificates.length - 3} more certificates
                        </small>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Recent Quiz Results</h6>
                  {quizAttempts.length === 0 ? (
                    <small className="text-muted">No quiz attempts yet.</small>
                  ) : (
                    quizAttempts.map((attempt) => (
                      <div className="border rounded p-3 mb-2" key={attempt.id}>
                        <strong>{attempt.quiz_title}</strong>
                        <div className="small text-muted">{attempt.course_title}</div>
                        <div className="small">
                          Score: {Number(attempt.score).toFixed(2)}% - {attempt.correct_answers}/
                          {attempt.total_questions}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
