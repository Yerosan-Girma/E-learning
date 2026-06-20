import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { normalizeCourse } from "../utils/courseAdapter";
import { formatNumber, formatPrice } from "../utils/format";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, role, notify, refreshStudentState } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [access, setAccess] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const dashboardPath = `/courses/${id}/dashboard`;

  async function loadCourse() {
    setLoading(true);
    try {
      const data = await api.getCourse(id);
      setCourse(normalizeCourse(data.course));
      setAccess(data.access || null);
      setLessons(data.lessons || []);
      setQuizzes(data.quizzes || []);
    } catch (error) {
      notify(error.message || "Failed to load course", "danger");
      setCourse(null);
      setAccess(null);
      setLessons([]);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourse();
  }, [id]);

  const accessLabel = useMemo(() => {
    if (!access) return "Sign in to enroll";
    if (access.hasAccess) return "Access active";
    if (access.enrollment?.status === "pending") return "Enrollment pending";
    if (course?.isFree) return "Free course";
    return "Paid course";
  }, [access, course]);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      notify("Please log in before enrolling.", "warning");
      navigate("/login");
      return;
    }

    if (role !== "student") {
      notify("Only student accounts can enroll in courses.", "warning");
      return;
    }

    if (access?.hasAccess) {
      navigate(dashboardPath);
      return;
    }

    if (course?.isFree) {
      try {
        console.log("Enrolling in free course:", id);
        const result = await api.enrollCourse(id);
        console.log("Enrollment result:", result);
        await refreshStudentState();
        notify("Enrolled successfully! Welcome to the course.", "success");
        navigate(dashboardPath);
      } catch (error) {
        console.error("Enrollment error:", error);
        notify(error.message || "Could not enroll in free course", "danger");
      }
      return;
    }

    navigate(`/payment/${id}`);
  };

  const moduleGroups = useMemo(() => {
    const groups = {};
    for (const lesson of lessons) {
      const moduleName = lesson.module_name || "General";
      if (!groups[moduleName]) groups[moduleName] = [];
      groups[moduleName].push(lesson);
    }
    return Object.entries(groups);
  }, [lessons]);

  if (loading) {
    return (
      <div className="container py-5 mt-5">
        <div className="alert alert-info">Loading course details...</div>
      </div>
    );
  }

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

          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className={`badge ${course.isFree ? "bg-success" : "bg-dark"} mb-3`}>
                {course.isFree ? "FREE" : "PAID"}
              </span>
              <h1 className="display-5 fw-bold mb-3">{course.title}</h1>
              <p className="lead mb-4">{course.shortDescription}</p>

              <div className="d-flex flex-wrap gap-3 text-muted mb-4">
                <span>
                  <i className="fas fa-user-tie me-2" /> {course.instructor}
                </span>
                <span>
                  <i className="fas fa-layer-group me-2" /> {course.level}
                </span>
                <span>
                  <i className="fas fa-play-circle me-2" /> {lessons.length} lessons
                </span>
                <span>
                  <i className="fas fa-users me-2" /> {formatNumber(course.enrolledStudents)} enrolled
                </span>
                <span>
                  <i className="fas fa-list-check me-2" /> {quizzes.length} quizzes
                </span>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card enrollment-card shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center mb-3">
                    <h3 className={`fw-bold mb-1 ${course.isFree ? "text-success" : "text-primary"}`}>
                      {course.isFree ? "Free" : formatPrice(course.effectivePrice)}
                    </h3>
                    <small className="text-muted">{accessLabel}</small>
                  </div>

                  <div className="d-grid gap-2">
                    <button className="btn btn-primary btn-lg" type="button" onClick={handleEnroll}>
                      {access?.hasAccess ? "Go to Course Dashboard" : "Enroll Now"}
                    </button>
                    <Link to="/courses" className="btn btn-outline-primary btn-lg">
                      Browse More Courses
                    </Link>
                  </div>

                  <div className="alert alert-light border mt-3 mb-0">
                    {course.isFree
                      ? "Free courses enroll instantly once you sign in."
                      : "Paid courses require login and a simulated payment to unlock content."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3">Course Overview</h4>
                <p className="mb-0">{course.description || course.shortDescription}</p>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="fw-bold mb-3">Course Modules & Lessons</h4>
                {lessons.length === 0 ? (
                  <p className="text-muted mb-0">Lessons will appear here when published.</p>
                ) : (
                  moduleGroups.map(([moduleName, moduleLessons]) => (
                    <div className="mb-4" key={moduleName}>
                      <h6 className="fw-bold text-primary mb-2">{moduleName}</h6>
                      <div className="list-group list-group-flush">
                        {moduleLessons.map((lesson, index) => (
                          <div className="list-group-item px-0" key={lesson.id}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>
                                  {index + 1}. {lesson.title}
                                </strong>
                                <div className="small text-muted text-uppercase">{lesson.lesson_type}</div>
                              </div>
                              {lesson.is_preview ? (
                                <span className="badge bg-info">Preview</span>
                              ) : (
                                <span className="badge bg-secondary">Locked</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h4 className="fw-bold mb-3">Assessments</h4>
                {quizzes.length === 0 ? (
                  <p className="text-muted mb-0">No quizzes have been added yet.</p>
                ) : (
                  quizzes.map((quiz) => (
                    <div className="border rounded p-3 mb-3" key={quiz.id}>
                      <h6 className="fw-bold mb-1">{quiz.title}</h6>
                      <small className="text-muted">
                        {quiz.question_count} questions · Passing score{" "}
                        {Number(quiz.passing_score).toFixed(0)}%
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-bold mb-3">What You'll Get</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2" /> Structured modules with video lessons
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2" /> Downloadable PDF resources
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2" /> Lesson notes and practice quizzes
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2" /> Progress tracking dashboard
                  </li>
                  <li>
                    <i className="fas fa-check text-success me-2" /> Completion status per lesson
                  </li>
                </ul>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Enrollment Rules</h5>
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="fas fa-sign-in-alt text-primary me-2" /> Login required to enroll
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-gift text-success me-2" /> Free courses enroll instantly
                  </li>
                  <li>
                    <i className="fas fa-credit-card text-primary me-2" /> Paid courses use simulated payment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
