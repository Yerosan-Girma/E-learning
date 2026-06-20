import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { normalizeCourse, normalizeLesson } from "../utils/courseAdapter";

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
  { id: "overview", label: "Overview", icon: "fa-info-circle" },
  { id: "lessons", label: "Lessons", icon: "fa-play-circle" },
  { id: "resources", label: "Resources", icon: "fa-file-pdf" },
  { id: "quizzes", label: "Quizzes", icon: "fa-list-check" },
];

export default function LearningPage() {
  const { courseId } = useParams();
  const { notify, dashboardPath } = useAuth();

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
      setActiveLessonId(nextLessons[0]?.id || null);
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
      const moduleName = lesson.module_name || "General";
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
    }
  };

  const markLessonComplete = async () => {
    if (!activeLesson) return;

    try {
      const data = await api.markLessonCompletion(activeLesson.id, true);
      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === activeLesson.id
            ? { ...lesson, completed: true, completed_at: new Date().toISOString() }
            : lesson
        )
      );
      notify(`Lesson marked complete. Overall progress: ${data.progress}%.`, "success");
    } catch (error) {
      notify(error.message || "Could not save lesson completion", "danger");
    }
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    if (!activeQuiz) return;

    setSubmittingQuiz(true);
    try {
      const data = await api.submitQuizAttempt(activeQuiz.quiz.id, toQuizAnswers(quizAnswers));
      setQuizResult(data);
      notify(`Quiz submitted. Score: ${data.score}%`, "success");
    } catch (error) {
      notify(error.message || "Quiz submission failed", "danger");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 mt-5">
        <div className="alert alert-info">Loading course dashboard...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5 mt-5">
        <div className="alert alert-warning">Course dashboard could not be loaded.</div>
        <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar navbar-light bg-white shadow-sm fixed-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary fs-3" to="/">
            <i className="fas fa-graduation-cap me-2" />EduLearn
          </Link>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge ${course.isFree ? "bg-success" : "bg-dark"}`}>
              {course.isFree ? "FREE" : "PAID"}
            </span>
            <Link to={dashboardPath} className="btn btn-outline-primary btn-sm">
              My Dashboard
            </Link>
            <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
              Course Details
            </Link>
          </div>
        </div>
      </nav>

      <div className="learning-container">
        <div className="container">
          <div className="course-header mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <h2 className="fw-bold mb-1">Course Dashboard</h2>
                <h4 className="text-primary mb-1">{course.title}</h4>
                <p className="text-muted mb-0">
                  {accessMode === "preview_only"
                    ? "Preview mode — enroll to unlock all content."
                    : "Full access active — continue your learning journey."}
                </p>
              </div>
              <div className="progress-section" style={{ minWidth: 200 }}>
                <small className="text-muted d-block mb-1">Course Progress</small>
                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <small className="text-muted">
                  {completedLessons}/{lessons.length} lessons · {completionPercent}% complete
                </small>
              </div>
            </div>
          </div>

          {accessMode === "preview_only" && (
            <div className="alert alert-warning">
              Only preview lessons are available.{" "}
              <Link to={`/courses/${course.id}`}>Return to course page</Link> to enroll.
            </div>
          )}

          <ul className="nav nav-tabs mb-4">
            {TABS.map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  type="button"
                  className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`fas ${tab.icon} me-1`} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {activeTab === "overview" && (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">Course Overview</h5>
                    <p>{course.description || course.shortDescription}</p>
                    <div className="row g-3 mt-3">
                      <div className="col-sm-4">
                        <div className="border rounded p-3 text-center">
                          <div className="fw-bold fs-4 text-primary">{lessons.length}</div>
                          <small className="text-muted">Lessons</small>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="border rounded p-3 text-center">
                          <div className="fw-bold fs-4 text-primary">{moduleGroups.length}</div>
                          <small className="text-muted">Modules</small>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="border rounded p-3 text-center">
                          <div className="fw-bold fs-4 text-primary">{quizzes.length}</div>
                          <small className="text-muted">Quizzes</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Module Progress</h6>
                    {moduleGroups.map(([moduleName, moduleLessons]) => {
                      const done = moduleLessons.filter((l) => l.completed).length;
                      const pct = moduleLessons.length
                        ? Math.round((done / moduleLessons.length) * 100)
                        : 0;
                      return (
                        <div className="mb-3" key={moduleName}>
                          <div className="d-flex justify-content-between small mb-1">
                            <span>{moduleName}</span>
                            <span>{done}/{moduleLessons.length}</span>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div className="progress-bar" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "lessons" && (
            <div className="row">
              <div className="col-lg-4">
                <div className="lecture-sidebar mb-4">
                  <h5 className="fw-bold mb-3">Modules & Lessons</h5>
                  {moduleGroups.length === 0 ? (
                    <p className="text-muted mb-0">No lessons published yet.</p>
                  ) : (
                    moduleGroups.map(([moduleName, moduleLessons]) => (
                      <div className="mb-3" key={moduleName}>
                        <h6 className="fw-bold text-primary small mb-2">{moduleName}</h6>
                        {moduleLessons.map((lesson) => {
                          const isActive = lesson.id === activeLesson?.id;
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              className={`lecture-item w-100 text-start ${isActive ? "active" : ""} ${
                                lesson.completed ? "completed" : ""
                              }`}
                              onClick={() => setActiveLessonId(lesson.id)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <strong className="small">{lesson.title}</strong>
                                {lesson.completed ? (
                                  <i className="fas fa-check-circle text-success" />
                                ) : lesson.is_preview ? (
                                  <span className="badge bg-info">Preview</span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="col-lg-8">
                {activeLesson ? (
                  <>
                    <div className="video-container">
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
                          <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                            <div className="text-center p-4">
                              <i className="fas fa-file-lines fa-3x text-primary mb-3" />
                              <p className="mb-0">Text-based lesson — no video attached.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h3 className="fw-bold mb-0">{activeLesson.title}</h3>
                      {activeLesson.completed && (
                        <span className="badge bg-success">Completed</span>
                      )}
                    </div>
                    {activeLesson.module_name && (
                      <p className="text-muted small mb-3">{activeLesson.module_name}</p>
                    )}

                    <div className="notes-container">
                      <h5 className="fw-bold mb-3">Lesson Notes</h5>
                      <div
                        className="lesson-content"
                        dangerouslySetInnerHTML={{
                          __html:
                            activeLesson.notes_content ||
                            "<p class='text-muted'>No lesson notes available.</p>",
                        }}
                      />

                      {activeLesson.attachment_url && accessMode !== "preview_only" && (
                        <div className="mt-3">
                          <a
                            href={activeLesson.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-secondary btn-sm"
                          >
                            <i className="fas fa-download me-1" />
                            Download Lesson Resource
                          </a>
                        </div>
                      )}

                      <div className="d-flex justify-content-between mt-4 flex-wrap gap-2">
                        <button
                          className="btn btn-outline-primary"
                          type="button"
                          disabled={lessonIndex <= 0}
                          onClick={() => navigateLesson(-1)}
                        >
                          Previous
                        </button>
                        <div className="d-flex gap-2">
                          {accessMode !== "preview_only" && !activeLesson.completed && (
                            <button
                              className="btn btn-outline-success"
                              type="button"
                              onClick={markLessonComplete}
                            >
                              Mark Complete
                            </button>
                          )}
                          <button
                            className="btn btn-primary"
                            type="button"
                            disabled={lessonIndex >= lessons.length - 1}
                            onClick={() => navigateLesson(1)}
                          >
                            Next Lesson
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-light border">Select a lesson to begin.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Downloadable Learning Materials</h5>
                {downloadableResources.length === 0 ? (
                  <p className="text-muted mb-0">No downloadable resources for this course yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Resource</th>
                          <th>Lesson</th>
                          <th>Module</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {downloadableResources.map((resource) => (
                          <tr key={resource.id}>
                            <td>
                              <i className="fas fa-file-pdf text-danger me-2" />
                              {resource.title}
                            </td>
                            <td className="small text-muted">{resource.lessonTitle}</td>
                            <td className="small text-muted">{resource.moduleName}</td>
                            <td>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="fas fa-download me-1" />Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Course Quizzes</h6>
                    {quizzes.length === 0 ? (
                      <small className="text-muted">No quizzes available.</small>
                    ) : (
                      quizzes.map((quiz) => (
                        <button
                          key={quiz.id}
                          type="button"
                          className={`lecture-item w-100 text-start mb-2 ${
                            Number(activeQuizId) === Number(quiz.id) ? "active" : ""
                          }`}
                          onClick={() => setActiveQuizId(quiz.id)}
                        >
                          <strong>{quiz.title}</strong>
                          <small className="text-muted d-block">
                            {quiz.question_count} questions
                          </small>
                          {quiz.latestAttempt && (
                            <small className="text-success d-block">
                              Score: {Number(quiz.latestAttempt.score).toFixed(0)}%
                            </small>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                {accessMode === "preview_only" ? (
                  <div className="alert alert-warning">
                    Enroll in the course to access quizzes and assessments.
                  </div>
                ) : activeQuiz?.quiz ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h4 className="fw-bold mb-2">{activeQuiz.quiz.title}</h4>
                      <p className="text-muted">
                        {activeQuiz.quiz.description || "Complete this quiz to test your knowledge."}
                      </p>
                      <p className="small text-muted mb-4">
                        Passing score: {Number(activeQuiz.quiz.passing_score).toFixed(0)}%
                      </p>

                      <form onSubmit={submitQuiz}>
                        {activeQuiz.questions.map((question, index) => (
                          <div className="mb-4" key={question.id}>
                            <h6 className="fw-bold">
                              {index + 1}. {question.question_text}
                            </h6>
                            {question.options.map((option, optionIndex) => (
                              <div className="form-check" key={`${question.id}-${optionIndex}`}>
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

                        <button type="submit" className="btn btn-primary" disabled={submittingQuiz}>
                          {submittingQuiz ? "Submitting..." : "Submit Quiz"}
                        </button>
                      </form>

                      {quizResult && typeof quizResult.score !== "undefined" && (
                        <div className="alert alert-light border mt-4">
                          <h6 className="fw-bold mb-2">Latest Result</h6>
                          <p className="mb-2">
                            Score: <strong>{Number(quizResult.score).toFixed(2)}%</strong>
                          </p>
                          {"passed" in quizResult && (
                            <p className="mb-0">
                              {quizResult.passed ? "Passed" : "Not passed yet"} — Correct:{" "}
                              {quizResult.correctAnswers}/{quizResult.totalQuestions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-light border">Select a quiz to begin.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
