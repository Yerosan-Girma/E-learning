import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { normalizeCourse, normalizeLesson } from "../utils/courseAdapter";
import PrintableCertificate from "../components/certificates/PrintableCertificate";

function toQuizAnswers(answerMap) {
  return Object.entries(answerMap).map(([questionId, selectedOption]) => ({
    questionId: Number(questionId),
    selectedOption: Number(selectedOption),
  }));
}

function extractResourceName(url) {
  try {
    const nameParam = new URL(url).searchParams.get("name");
    return nameParam || "Download Resource";
  } catch {
    return "Download Resource";
  }
}

const TABS = [
  { id: "lessons", label: "Step-by-Step Tracker", icon: "fa-list-check" },
  { id: "overview", label: "Course Overview", icon: "fa-info-circle" },
  { id: "resources", label: "Resources", icon: "fa-file-pdf" },
  { id: "quizzes", label: "Quizzes", icon: "fa-clipboard-question" },
  { id: "certificate", label: "Certificate", icon: "fa-award" },
];

export default function LearningPage() {
  const { courseId } = useParams();
  const { notify, dashboardPath, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [accessMode, setAccessMode] = useState("preview_only");
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons");
  const [certificate, setCertificate] = useState(null);
  const [certLoading, setCertLoading] = useState(false);
  const [certGenerating, setCertGenerating] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [markingStep, setMarkingStep] = useState(false);

  async function loadLearningData() {
    setLoading(true);
    try {
      const [courseData, lessonData, quizData] = await Promise.all([
        api.getCourse(courseId),
        api.listCourseLessons(courseId),
        api.listCourseQuizzes(courseId),
      ]);

      const nextLessons = (lessonData.lessons || []).map(normalizeLesson);
      const nextQuizzes = quizData.quizzes || [];

      setCourse(normalizeCourse(courseData.course));
      setLessons(nextLessons);
      setAccessMode(lessonData.accessMode || "preview_only");
      
      // Auto-select first uncompleted lesson if available, or first lesson
      const firstUncompleted = nextLessons.find((l) => !l.completed);
      setActiveLessonId(firstUncompleted ? firstUncompleted.id : nextLessons[0]?.id || null);
      
      setQuizzes(nextQuizzes);
      setActiveQuizId(nextQuizzes[0]?.id || null);
    } catch (error) {
      notify(error.message || "Failed to load course dashboard", "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLearningData();
  }, [courseId]);

  useEffect(() => {
    async function loadQuiz() {
      if (!activeQuizId || accessMode === "preview_only") {
        setActiveQuiz(null);
        return;
      }

      try {
        const data = await api.getQuiz(activeQuizId);
        setActiveQuiz(data);
        setQuizResult(data.latestAttempt || null);
        setQuizAnswers({});
      } catch {
        setActiveQuiz(null);
      }
    }

    loadQuiz();
  }, [activeQuizId, accessMode]);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) || lessons[0] || null,
    [activeLessonId, lessons]
  );

  const completedLessons = useMemo(
    () => lessons.filter((lesson) => lesson.completed).length,
    [lessons]
  );

  const completionPercent =
    lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  const lessonIndex = lessons.findIndex((lesson) => lesson.id === activeLesson?.id);

  const moduleGroups = useMemo(() => {
    const groups = {};
    for (const lesson of lessons) {
      const moduleName = lesson.module_name || "General Curriculum";
      if (!groups[moduleName]) groups[moduleName] = [];
      groups[moduleName].push(lesson);
    }
    return Object.entries(groups);
  }, [lessons]);

  const downloadableResources = useMemo(
    () =>
      lessons
        .filter((lesson) => lesson.attachment_url)
        .map((lesson) => ({
          id: lesson.id,
          title: extractResourceName(lesson.attachment_url),
          lessonTitle: lesson.title,
          moduleName: lesson.module_name || "General",
          url: lesson.attachment_url,
        })),
    [lessons]
  );

  const navigateLesson = (offset) => {
    const nextLesson = lessons[lessonIndex + offset];
    if (nextLesson) {
      setActiveLessonId(nextLesson.id);
      setActiveTab("lessons");
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  // Step-by-Step Complete and advance
  const markCompleteAndNext = async () => {
    if (!activeLesson) return;

    setMarkingStep(true);
    try {
      const data = await api.markLessonCompletion(activeLesson.id, true);
      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === activeLesson.id
            ? { ...lesson, completed: true, completed_at: new Date().toISOString() }
            : lesson
        )
      );

      const nextLesson = lessons[lessonIndex + 1];
      if (nextLesson) {
        notify(`Step ${lessonIndex + 1} completed! Advancing to Step ${lessonIndex + 2}`, "success");
        setActiveLessonId(nextLesson.id);
        window.scrollTo({ top: 120, behavior: "smooth" });
      } else {
        notify(`🎉 Congratulations! You have completed all lessons in this course!`, "success");
        if (quizzes.length > 0) {
          setActiveTab("quizzes");
        } else {
          setActiveTab("certificate");
        }
      }
    } catch (error) {
      notify(error.message || "Could not save lesson completion", "danger");
    } finally {
      setMarkingStep(false);
    }
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    if (!activeQuiz) return;

    setSubmittingQuiz(true);
    try {
      const data = await api.submitQuizAttempt(activeQuiz.quiz.id, toQuizAnswers(quizAnswers));
      setQuizResult(data);
      if (data.passed) {
        notify(`Quiz passed with ${data.score}%! 🎉`, "success");
        if (data.certificateGenerated) {
          const certData = await api.getMyCertificates();
          const found = (certData.certificates || []).find(
            (c) => String(c.course_id) === String(courseId)
          );
          setCertificate(found || null);
        }
      } else {
        notify(`Score: ${data.score}% — need 50% to pass. Try again!`, "warning");
      }
    } catch (error) {
      notify(error.message || "Quiz submission failed", "danger");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Load existing certificate
  useEffect(() => {
    if (activeTab !== "certificate" || accessMode === "preview_only") return;

    async function loadCertificate() {
      setCertLoading(true);
      try {
        const data = await api.getMyCertificates();
        const found = (data.certificates || []).find(
          (c) => String(c.course_id) === String(courseId)
        );
        setCertificate(found || null);
      } catch {
        setCertificate(null);
      } finally {
        setCertLoading(false);
      }
    }

    loadCertificate();
  }, [activeTab, courseId, accessMode]);

  const handleGenerateCertificate = async () => {
    setCertGenerating(true);
    try {
      const data = await api.generateCertificate(courseId);
      setCertificate(data.certificate);
      notify("Certificate generated successfully!", "success");
    } catch (error) {
      notify(error.message || "Could not generate certificate", "danger");
    } finally {
      setCertGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">Loading your course tracker...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5 mt-5">
        <div className="alert alert-warning">Course tracker could not be loaded.</div>
        <Link to="/courses" className="btn btn-primary">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar navbar-light bg-white shadow-sm fixed-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary fs-3" to="/">
            <i className="fas fa-graduation-cap me-2" />
            EduLearn
          </Link>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge ${course.isFree ? "bg-success" : "bg-dark"}`}>
              {course.isFree ? "FREE" : "PAID"}
            </span>
            <Link to={dashboardPath} className="btn btn-outline-primary btn-sm rounded-pill">
              <i className="fas fa-gauge-high me-1" /> My Dashboard
            </Link>
            <Link to={`/courses/${course.id}`} className="btn btn-light btn-sm rounded-pill">
              Course Details
            </Link>
          </div>
        </div>
      </nav>

      <div className="learning-container">
        <div className="container">
          {/* Course Stepper Header */}
          <div className="course-stepper-header">
            <div className="row align-items-center g-3">
              <div className="col-lg-7">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1">
                    {course.category || "Course"}
                  </span>
                  <span className="text-muted small">·</span>
                  <span className="text-muted small">
                    <i className="fas fa-chalkboard-user me-1" />
                    {course.instructor || "Instructor"}
                  </span>
                </div>
                <h3 className="fw-bold mb-1">{course.title}</h3>
                <p className="text-muted mb-0 small">
                  {accessMode === "preview_only"
                    ? "Preview mode — enroll to unlock all steps and tests."
                    : "Full access active — track your progress step-by-step."}
                </p>
              </div>

              {/* Progress Summary */}
              <div className="col-lg-5">
                <div className="p-3 bg-light rounded-4 border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="fw-bold text-dark">
                      <i className="fas fa-bars-progress me-1 text-primary" /> Overall Progress
                    </small>
                    <span className="badge bg-primary rounded-pill px-2">{completionPercent}%</span>
                  </div>
                  <div className="progress mb-2 rounded-pill" style={{ height: "8px" }}>
                    <div
                      className={`progress-bar rounded-pill ${
                        completionPercent === 100 ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center small text-muted">
                    <span>
                      {completedLessons} of {lessons.length} steps completed
                    </span>
                    {completionPercent === 100 ? (
                      <span className="text-success fw-bold">
                        <i className="fas fa-circle-check me-1" /> Course Finished
                      </span>
                    ) : (
                      <span>{lessons.length - completedLessons} steps remaining</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Access Warning if Preview */}
          {accessMode === "preview_only" && (
            <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4 rounded-4 shadow-sm">
              <div>
                <i className="fas fa-lock me-2 text-warning fs-5" />
                <strong>Preview Mode:</strong> You only have access to sample preview lessons. Enroll to unlock the full step-by-step curriculum and certificate.
              </div>
              <Link to={`/courses/${course.id}`} className="btn btn-warning btn-sm fw-semibold rounded-pill px-3">
                Enroll Now
              </Link>
            </div>
          )}

          {/* 100% Completion Celebration Box */}
          {completionPercent === 100 && (
            <div className="celebration-box d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-sm">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "52px", height: "52px", fontSize: "1.5rem" }}
                >
                  <i className="fas fa-award" />
                </div>
                <div>
                  <h5 className="fw-bold text-success mb-1">Course Completed! 🎉</h5>
                  <p className="mb-0 text-muted small">
                    You have finished every lesson step in this course. Claim your official verified certificate!
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-success fw-semibold px-4 py-2 rounded-pill shadow-sm"
                onClick={() => setActiveTab("certificate")}
              >
                <i className="fas fa-certificate me-2" />
                View &amp; Print Certificate
              </button>
            </div>
          )}

          {/* Stepper Tabs */}
          <ul className="nav stepper-nav-tabs mb-4 bg-white p-2 rounded-4 shadow-sm gap-2">
            {TABS.map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  type="button"
                  className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`fas ${tab.icon} me-2`} />
                  {tab.label}
                  {tab.id === "quizzes" && quizzes.length > 0 && (
                    <span className="badge bg-secondary ms-2 rounded-pill">{quizzes.length}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB: LESSONS (STEP-BY-STEP TRACKER) */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "lessons" && (
            <div className="row g-4">
              {/* Left Column: Step-by-Step Curriculum Sidebar */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-3 lecture-sidebar">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0 text-dark">
                      <i className="fas fa-list-ol me-2 text-primary" />
                      Curriculum Steps
                    </h6>
                    <small className="text-muted">
                      {completedLessons}/{lessons.length} Done
                    </small>
                  </div>

                  {moduleGroups.length === 0 ? (
                    <p className="text-muted small">No steps created yet.</p>
                  ) : (
                    moduleGroups.map(([moduleName, moduleLessons], modIdx) => {
                      const modCompleted = moduleLessons.filter((l) => l.completed).length;
                      const isModDone = modCompleted === moduleLessons.length && moduleLessons.length > 0;

                      return (
                        <div className="mb-3" key={moduleName}>
                          <div className="d-flex justify-content-between align-items-center px-1 mb-2">
                            <span className="fw-bold text-uppercase small text-muted" style={{ fontSize: "0.72rem" }}>
                              Module {modIdx + 1}: {moduleName}
                            </span>
                            <span
                              className={`badge rounded-pill ${
                                isModDone ? "bg-success bg-opacity-10 text-success" : "bg-light text-muted"
                              }`}
                              style={{ fontSize: "0.7rem" }}
                            >
                              {modCompleted}/{moduleLessons.length}
                            </span>
                          </div>

                          {moduleLessons.map((lesson) => {
                            const isActive = lesson.id === activeLesson?.id;
                            const globalStepNumber =
                              lessons.findIndex((l) => l.id === lesson.id) + 1;

                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                className={`lecture-stepper-item ${isActive ? "active" : ""}`}
                                onClick={() => setActiveLessonId(lesson.id)}
                              >
                                {/* Step Indicator Icon */}
                                <div
                                  className={`step-num-badge ${
                                    lesson.completed
                                      ? "step-num-completed"
                                      : isActive
                                      ? "step-num-active"
                                      : "step-num-upcoming"
                                  }`}
                                >
                                  {lesson.completed ? (
                                    <i className="fas fa-check" />
                                  ) : (
                                    globalStepNumber
                                  )}
                                </div>

                                <div className="flex-grow-1 overflow-hidden me-2">
                                  <div
                                    className={`small text-truncate ${
                                      isActive ? "fw-bold text-primary" : "text-dark"
                                    }`}
                                  >
                                    {lesson.title}
                                  </div>
                                  <div className="d-flex align-items-center gap-2 mt-1">
                                    <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                                      {lesson.video_url ? (
                                        <span>
                                          <i className="fas fa-play-circle me-1" /> Video
                                        </span>
                                      ) : (
                                        <span>
                                          <i className="fas fa-file-lines me-1" /> Reading
                                        </span>
                                      )}
                                    </small>
                                    {lesson.is_preview && (
                                      <span className="badge bg-info bg-opacity-10 text-info py-0 px-1" style={{ fontSize: "0.68rem" }}>
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {isActive && (
                                  <i className="fas fa-chevron-right text-primary small" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Active Lesson Stage */}
              <div className="col-lg-8">
                {activeLesson ? (
                  <>
                    {/* Lesson Header Breadcrumb */}
                    <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.75rem" }}>
                            <i className="fas fa-circle-dot text-primary me-1" />
                            Step {lessonIndex + 1} of {lessons.length} · {activeLesson.module_name || "General"}
                          </small>
                          <h4 className="fw-bold mb-0 mt-1">{activeLesson.title}</h4>
                        </div>
                        <div>
                          {activeLesson.completed ? (
                            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold">
                              <i className="fas fa-circle-check me-1" /> Step Completed
                            </span>
                          ) : (
                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
                              <i className="fas fa-spinner fa-spin me-1" /> Current Step
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Video Player or Reading View */}
                    <div className="video-container rounded-4 mb-4">
                      <div className="video-wrapper">
                        {activeLesson.video_url ? (
                          <iframe
                            key={activeLesson.video_url}
                            src={activeLesson.video_url}
                            title={activeLesson.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 bg-light text-center p-4">
                            <div>
                              <i className="fas fa-book-open-reader fa-3x text-primary mb-3" />
                              <h5 className="fw-bold mb-1">Reading &amp; Interactive Lesson</h5>
                              <p className="text-muted small mb-0">Study the lesson notes and resources below.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes & Content */}
                    <div className="notes-container rounded-4 mb-4">
                      <h5 className="fw-bold mb-3">
                        <i className="fas fa-file-pen text-primary me-2" />
                        Lesson Notes &amp; Instructions
                      </h5>
                      <div
                        className="lesson-content text-secondary"
                        dangerouslySetInnerHTML={{
                          __html:
                            activeLesson.notes_content ||
                            "<p class='text-muted'>No written notes provided for this lesson.</p>",
                        }}
                      />

                      {/* Download Resource Attachment */}
                      {activeLesson.attachment_url && accessMode !== "preview_only" && (
                        <div className="mt-4 p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-paperclip text-primary fs-5" />
                            <div>
                              <strong className="d-block small">Supplementary Resource</strong>
                              <small className="text-muted">
                                {extractResourceName(activeLesson.attachment_url)}
                              </small>
                            </div>
                          </div>
                          <a
                            href={activeLesson.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm rounded-pill"
                          >
                            <i className="fas fa-download me-1" /> Download
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Bottom Action Bar */}
                    <div className="step-action-bar">
                      <button
                        className="btn btn-outline-secondary rounded-pill px-4"
                        type="button"
                        disabled={lessonIndex <= 0}
                        onClick={() => navigateLesson(-1)}
                      >
                        <i className="fas fa-arrow-left me-2" /> Previous Step
                      </button>

                      <div className="d-flex align-items-center gap-2">
                        {accessMode !== "preview_only" && (
                          <button
                            className={`btn rounded-pill px-4 fw-semibold ${
                              activeLesson.completed ? "btn-success" : "btn-primary shadow-sm"
                            }`}
                            type="button"
                            disabled={markingStep}
                            onClick={markCompleteAndNext}
                          >
                            {markingStep ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Saving...
                              </>
                            ) : activeLesson.completed ? (
                              <>
                                <i className="fas fa-check-double me-2" />
                                {lessonIndex < lessons.length - 1 ? "Next Step →" : "Course Finished ✓"}
                              </>
                            ) : (
                              <>
                                <i className="fas fa-check me-2" />
                                Complete &amp; Next Step →
                              </>
                            )}
                          </button>
                        )}

                        {lessonIndex < lessons.length - 1 && (
                          <button
                            className="btn btn-outline-primary rounded-pill px-3"
                            type="button"
                            onClick={() => navigateLesson(1)}
                            title="Skip to next"
                          >
                            Next <i className="fas fa-arrow-right ms-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <p className="text-muted mb-0">Select a step from the curriculum to begin learning.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB: OVERVIEW */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 p-4">
                  <h5 className="fw-bold mb-3">About this Course</h5>
                  <p className="text-secondary">{course.description || course.shortDescription}</p>

                  <div className="row g-3 mt-3">
                    <div className="col-sm-4">
                      <div className="bg-light rounded-3 p-3 text-center border">
                        <div className="fw-bold fs-3 text-primary">{lessons.length}</div>
                        <small className="text-muted fw-semibold">Total Steps</small>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="bg-light rounded-3 p-3 text-center border">
                        <div className="fw-bold fs-3 text-primary">{moduleGroups.length}</div>
                        <small className="text-muted fw-semibold">Modules</small>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="bg-light rounded-3 p-3 text-center border">
                        <div className="fw-bold fs-3 text-primary">{quizzes.length}</div>
                        <small className="text-muted fw-semibold">Assessments</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-4">
                  <h6 className="fw-bold mb-3">Module Progress Breakdown</h6>
                  {moduleGroups.map(([moduleName, moduleLessons]) => {
                    const done = moduleLessons.filter((l) => l.completed).length;
                    const pct = moduleLessons.length
                      ? Math.round((done / moduleLessons.length) * 100)
                      : 0;

                    return (
                      <div className="mb-3" key={moduleName}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-semibold text-truncate me-2">{moduleName}</span>
                          <span className="text-muted">{pct}%</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: "6px" }}>
                          <div
                            className={`progress-bar rounded-pill ${pct === 100 ? "bg-success" : "bg-primary"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB: RESOURCES */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "resources" && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3">Downloadable Course Resources</h5>
              {downloadableResources.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-folder-open fa-3x mb-3 opacity-50" />
                  <p className="mb-0">No downloadable files attached to this course yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Resource Title</th>
                        <th>Associated Lesson</th>
                        <th>Module</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {downloadableResources.map((resource) => (
                        <tr key={resource.id}>
                          <td className="fw-semibold">
                            <i className="fas fa-file-arrow-down text-primary me-2" />
                            {resource.title}
                          </td>
                          <td className="small text-muted">{resource.lessonTitle}</td>
                          <td className="small text-muted">{resource.moduleName}</td>
                          <td>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            >
                              <i className="fas fa-download me-1" /> Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB: QUIZZES */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "quizzes" && (
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-3">
                  <h6 className="fw-bold mb-3">
                    <i className="fas fa-clipboard-question text-primary me-2" />
                    Available Quizzes
                  </h6>
                  {quizzes.length === 0 ? (
                    <small className="text-muted">No quizzes assigned to this course.</small>
                  ) : (
                    quizzes.map((quiz) => (
                      <button
                        key={quiz.id}
                        type="button"
                        className={`lecture-stepper-item mb-2 ${
                          Number(activeQuizId) === Number(quiz.id) ? "active" : ""
                        }`}
                        onClick={() => setActiveQuizId(quiz.id)}
                      >
                        <div className="flex-grow-1">
                          <strong className="d-block small">{quiz.title}</strong>
                          <small className="text-muted">{quiz.question_count} questions</small>
                          {quiz.latestAttempt && (
                            <small
                              className={`d-block fw-semibold ${
                                Number(quiz.latestAttempt.score) >= 50
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              Score: {Number(quiz.latestAttempt.score).toFixed(0)}%{" "}
                              {Number(quiz.latestAttempt.score) >= 50 ? "✓ (Passed)" : "✗"}
                            </small>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="col-lg-8">
                {accessMode === "preview_only" ? (
                  <div className="alert alert-warning rounded-4 p-4">
                    <i className="fas fa-lock me-2" /> Enroll in this course to take quizzes and earn credit.
                  </div>
                ) : activeQuiz?.quiz ? (
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h4 className="fw-bold mb-0">{activeQuiz.quiz.title}</h4>
                      <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                        Passing Grade: 50%
                      </span>
                    </div>
                    <p className="text-muted mb-4">
                      {activeQuiz.quiz.description || "Complete all questions below to verify your comprehension."}
                    </p>

                    {quizResult && quizResult.passed && (
                      <div className="alert alert-success d-flex align-items-center gap-3 mb-4 rounded-4">
                        <i className="fas fa-trophy fa-2x text-warning" />
                        <div className="flex-grow-1">
                          <strong>Congratulations! You passed with {Number(quizResult.score).toFixed(0)}%!</strong>
                          <br />
                          <small>Your verified certificate has been unlocked.</small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm fw-semibold rounded-pill px-3"
                          onClick={() => setActiveTab("certificate")}
                        >
                          <i className="fas fa-award me-1" /> Claim Certificate
                        </button>
                      </div>
                    )}

                    {quizResult && !quizResult.passed && (
                      <div className="alert alert-warning mb-4 rounded-4">
                        <strong>Score: {Number(quizResult.score).toFixed(0)}%</strong> — You need 50% to pass. You can review your answers and retake below.
                      </div>
                    )}

                    <form onSubmit={submitQuiz}>
                      {activeQuiz.questions.map((question, index) => (
                        <div className="mb-4 p-3 bg-light rounded-3 border" key={question.id}>
                          <h6 className="fw-bold mb-3">
                            <span className="badge bg-primary me-2">{index + 1}</span>
                            {question.question_text}
                          </h6>
                          {question.options.map((option, optionIndex) => (
                            <div className="form-check mb-2" key={`${question.id}-${optionIndex}`}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`question-${question.id}`}
                                id={`question-${question.id}-option-${optionIndex}`}
                                checked={Number(quizAnswers[question.id]) === optionIndex}
                                onChange={() =>
                                  setQuizAnswers((current) => ({
                                    ...current,
                                    [question.id]: optionIndex,
                                  }))
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`question-${question.id}-option-${optionIndex}`}
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      ))}

                      <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-4 fw-semibold"
                        disabled={submittingQuiz}
                      >
                        {submittingQuiz ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                            Evaluating Answers...
                          </>
                        ) : quizResult ? (
                          "Retake Quiz"
                        ) : (
                          "Submit Quiz Answers"
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted">
                    Select a quiz from the list to begin the assessment.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB: CERTIFICATE */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "certificate" && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                {accessMode === "preview_only" ? (
                  <div className="alert alert-warning text-center rounded-4 p-5">
                    <i className="fas fa-lock fa-3x mb-3 text-warning d-block" />
                    <h5>Enrollment Required</h5>
                    <p className="text-muted">Enroll in this course to earn your verified certificate upon completion.</p>
                  </div>
                ) : certLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-3 text-muted">Verifying certificate credentials...</p>
                  </div>
                ) : certificate ? (
                  /* Has Certificate */
                  <div className="card border-0 shadow-sm text-center rounded-4 overflow-hidden">
                    <div
                      className="card-header border-0 py-5 text-white"
                      style={{
                        background: "linear-gradient(135deg, #1e3a8a 0%, #d97706 100%)",
                      }}
                    >
                      <i className="fas fa-award fa-4x mb-3 d-block" />
                      <h3 className="fw-bold mb-1">Official Certificate of Completion</h3>
                      <p className="text-white-50 mb-0">Verified and Issued by EduLearn</p>
                    </div>

                    <div className="card-body p-4">
                      <h4 className="fw-bold mb-1 text-dark">{certificate.course_title}</h4>
                      <p className="text-muted small mb-4">
                        Issued on{" "}
                        {new Date(certificate.issue_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>

                      <div className="bg-light rounded-4 p-3 mb-4 text-start border">
                        <div className="row g-2 small">
                          <div className="col-sm-6">
                            <span className="text-muted">Student:</span>{" "}
                            <strong>{certificate.student_name || user?.name || "Student"}</strong>
                          </div>
                          {certificate.instructor_name && (
                            <div className="col-sm-6">
                              <span className="text-muted">Instructor:</span>{" "}
                              <strong>{certificate.instructor_name}</strong>
                            </div>
                          )}
                          <div className="col-12 mt-2 pt-2 border-top">
                            <span className="text-muted">Certificate ID:</span>{" "}
                            <code className="text-primary fw-bold ms-1">{certificate.certificate_number}</code>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-lg rounded-pill px-5 fw-semibold d-inline-flex align-items-center gap-2 shadow"
                        onClick={() => setShowCertModal(true)}
                      >
                        <i className="fas fa-print" /> View &amp; Print Certificate
                      </button>
                    </div>
                  </div>
                ) : (
                  /* No certificate yet */
                  <div className="card border-0 shadow-sm text-center p-5 rounded-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle mx-auto mb-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className="fas fa-award fa-3x" />
                    </div>
                    <h4 className="fw-bold mb-2">Unlock Your Certificate</h4>
                    <p className="text-muted mx-auto mb-4" style={{ maxWidth: "480px" }}>
                      Complete 100% of the course lessons and pass the course assessment quiz with <strong>50% or higher</strong> to receive your verified certificate.
                    </p>

                    <div className="d-flex justify-content-center gap-3">
                      <button
                        type="button"
                        className="btn btn-primary rounded-pill px-4 fw-semibold"
                        onClick={() => setActiveTab("lessons")}
                      >
                        <i className="fas fa-play me-2" /> Continue Course Steps
                      </button>
                      {quizzes.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-pill px-4 fw-semibold"
                          onClick={() => setActiveTab("quizzes")}
                        >
                          <i className="fas fa-clipboard-question me-2" /> Go to Quizzes
                        </button>
                      )}
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-muted"
                        disabled={certGenerating}
                        onClick={handleGenerateCertificate}
                      >
                        {certGenerating ? "Verifying..." : "Already passed? Click here to generate certificate"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Certificate Modal */}
      {showCertModal && certificate && (
        <PrintableCertificate
          certificate={certificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </>
  );
}
