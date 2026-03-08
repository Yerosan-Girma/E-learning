import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { COURSES_BY_ID } from "../data/courses";
import {
  ASSIGNMENTS,
  CERTIFICATES,
  DISCUSSIONS,
  EXAM_CHECKLIST,
  QUIZ_RESULTS,
  UPCOMING_QUIZZES,
} from "../data/dashboard";
import { getCoursePayments, getEnrolledCourses, getLectureProgress } from "../utils/storage";
import { formatPrice } from "../utils/format";

function statusClass(status) {
  if (status === "approved" || status === "graded" || status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "submitted") return "info";
  return "secondary";
}

export default function DashboardPage() {
  const { user, notify } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEnrollments: 0,
    approvedEnrollments: 0,
    completedLessons: 0,
  });
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);

  const progress = useMemo(() => getLectureProgress(), []);

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      try {
        const [dashboardData, enrollmentData, paymentData] = await Promise.all([
          api.getDashboard("student"),
          api.myEnrollments(),
          api.myPayments(),
        ]);

        setSummary(dashboardData.summary || summary);
        setEnrollments(enrollmentData.enrollments || []);
        setPayments(paymentData.payments || []);
      } catch (error) {
        notify("Using local dashboard data. " + (error.message || ""), "warning");

        const localEnrollments = getEnrolledCourses();
        const localPayments = getCoursePayments();

        const completedLessons = Object.values(progress)
          .flatMap((courseProgress) => Object.values(courseProgress || {}))
          .filter((entry) => entry?.completed).length;

        setSummary({
          totalEnrollments: localEnrollments.length,
          approvedEnrollments: localEnrollments.filter((item) => item.status === "approved").length,
          completedLessons,
        });
        setEnrollments(localEnrollments);
        setPayments(localPayments);
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [notify, progress]);

  const completedLessons = summary.completedLessons || 0;

  const totalLessons = useMemo(() => {
    return enrollments.reduce((accumulator, enrollment) => {
      const course = COURSES_BY_ID[Number(enrollment.course_id || enrollment.id)];
      return accumulator + (course?.lectures || 0);
    }, 0);
  }, [enrollments]);

  const overallProgress = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;
  const studyHours = (completedLessons * 0.75).toFixed(1);

  return (
    <div className="container py-5 mt-5">
      <div className="row mb-4 align-items-center">
        <div className="col-lg-8">
          <h2 className="fw-bold mb-1">
            Student Dashboard: <span className="text-primary">{user?.name || "Student"}</span>
          </h2>
          <p className="text-muted mb-0">Track your learning activity, progress, and upcoming tasks.</p>
        </div>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading student dashboard...</div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm stats-card h-100">
                <div className="card-body">
                  <small className="text-muted">Enrolled Courses</small>
                  <h3 className="fw-bold mb-0">{summary.totalEnrollments || enrollments.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm stats-card h-100">
                <div className="card-body">
                  <small className="text-muted">Approved Enrollments</small>
                  <h3 className="fw-bold mb-0">{summary.approvedEnrollments || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm stats-card h-100">
                <div className="card-body">
                  <small className="text-muted">Completed Lessons</small>
                  <h3 className="fw-bold mb-0">{completedLessons}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm stats-card h-100">
                <div className="card-body">
                  <small className="text-muted">Study Hours</small>
                  <h3 className="fw-bold mb-0">{studyHours}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0">Overall Progress</h5>
                <span className="small fw-bold">{overallProgress}%</span>
              </div>
              <div className="progress" style={{ height: "10px" }}>
                <div className="progress-bar progress-bar-striped" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">My Courses</h5>

                  {enrollments.length === 0 ? (
                    <div className="text-muted">
                      You have not enrolled in any course yet. <Link to="/courses">Browse courses</Link>.
                    </div>
                  ) : (
                    <div className="row">
                      {enrollments.map((enrollment) => {
                        const courseId = Number(enrollment.course_id || enrollment.id);
                        const course = COURSES_BY_ID[courseId];
                        if (!course) return null;

                        return (
                          <div className="col-md-6 mb-3" key={`course-${enrollment.id || courseId}`}>
                            <div className="card h-100 course-card shadow-sm">
                              <img src={course.image} alt={course.title} className="card-img-top course-img" />
                              <div className="card-body d-flex flex-column">
                                <h6 className="fw-bold">{course.title}</h6>
                                <p className="text-muted small mb-2">{course.instructor}</p>
                                <span className={`badge bg-${statusClass(enrollment.status)} mb-3 text-uppercase`}>
                                  {enrollment.status}
                                </span>

                                <div className="d-flex gap-2 mt-auto">
                                  {enrollment.status === "approved" ? (
                                    <Link to={`/learning/${courseId}`} className="btn btn-primary btn-sm">
                                      Continue
                                    </Link>
                                  ) : (
                                    <button type="button" className="btn btn-warning btn-sm" disabled>
                                      Pending Approval
                                    </button>
                                  )}
                                  <Link to={`/courses/${courseId}`} className="btn btn-outline-primary btn-sm">
                                    Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Assignments</h5>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Assignment</th>
                          <th>Course</th>
                          <th>Due Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ASSIGNMENTS.map((assignment) => (
                          <tr key={assignment.id}>
                            <td>{assignment.title}</td>
                            <td>{assignment.course}</td>
                            <td>{assignment.dueDate}</td>
                            <td>
                              <span className={`badge bg-${statusClass(assignment.status)}`}>
                                {assignment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Recent Discussions</h5>
                  {DISCUSSIONS.map((discussion) => (
                    <div className={`discussion-card ${discussion.type} p-3 border rounded mb-2`} key={discussion.id}>
                      <div className="d-flex justify-content-between">
                        <strong>{discussion.title}</strong>
                        <small className="text-muted">{discussion.lastActivity}</small>
                      </div>
                      <small className="text-muted">{discussion.replies} replies</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Upcoming Quizzes</h6>
                  <div className="list-group list-group-flush">
                    {UPCOMING_QUIZZES.map((quiz) => (
                      <div className="list-group-item border-0 px-0" key={`${quiz.course}-${quiz.topic}`}>
                        <div className="d-flex justify-content-between">
                          <div>
                            <h6 className="small fw-bold mb-0">{quiz.course}</h6>
                            <small className="text-muted">{quiz.topic}</small>
                          </div>
                          <span className="badge bg-warning">{quiz.due}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Latest Quiz Results</h6>
                  <div className="list-group list-group-flush">
                    {QUIZ_RESULTS.map((result) => (
                      <div className="list-group-item border-0 px-0" key={`${result.course}-${result.date}`}>
                        <div className="d-flex justify-content-between">
                          <div>
                            <h6 className="small fw-bold mb-0">{result.course}</h6>
                            <small className="text-muted">{result.date}</small>
                          </div>
                          <span className="fw-bold text-success">{result.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Exam Preparation Checklist</h6>
                  {EXAM_CHECKLIST.map((item) => (
                    <div className="form-check mb-2" key={item}>
                      <input type="checkbox" className="form-check-input" id={`check-${item}`} />
                      <label className="form-check-label" htmlFor={`check-${item}`}>
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Certificates</h6>
                  {CERTIFICATES.map((certificate) => (
                    <div className="border rounded p-3 mb-2" key={certificate.id}>
                      <strong>{certificate.name}</strong>
                      <div className="small text-muted">Issued: {certificate.issuedAt}</div>
                      <div className="small text-muted">Credential: {certificate.credentialId}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Payment Submissions</h6>
                  {payments.length === 0 ? (
                    <small className="text-muted">No payment records yet.</small>
                  ) : (
                    payments.slice(0, 5).map((payment) => (
                      <div className="border rounded p-2 mb-2" key={payment.id}>
                        <div className="small fw-bold">{payment.course_title || payment.courseTitle}</div>
                        <div className="small text-muted">
                          {formatPrice(payment.amount)} via {payment.gateway || payment.method}
                        </div>
                        <span className={`badge bg-${statusClass(payment.status)}`}>{payment.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
