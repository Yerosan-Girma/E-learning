import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { normalizeCourse } from "../utils/courseAdapter";
import { formatCurrency } from "../utils/format";

export default function TeacherDashboardPage() {
  const { user, notify } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalCourses: 0,
    totalLessons: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    totalQuizzes: 0,
  });
  const [courses, setCourses] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "",
    level: "All Levels",
    description: "",
    price: "",
    discountPrice: "",
    thumbnailUrl: "",
  });

  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    title: "",
    lessonType: "mixed",
    videoUrl: "",
    notesContent: "",
    isPreview: false,
  });

  const [quizForm, setQuizForm] = useState({
    courseId: "",
    title: "",
    description: "",
    passingScore: 60,
  });

  const [questionForm, setQuestionForm] = useState({
    courseId: "",
    quizId: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "0",
    explanation: "",
  });

  async function loadData() {
    setLoading(true);
    try {
      const data = await api.getDashboard("teacher");
      setSummary(data.summary || summary);
      setCourses((data.courses || []).map(normalizeCourse));
      setRecentPayments(data.recentPayments || []);
    } catch (error) {
      const errorMessage = typeof error.message === 'string' 
        ? error.message 
        : (error.message ? JSON.stringify(error.message) : "Failed to load instructor dashboard");
      notify(errorMessage, "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    async function loadQuizzesForCourse() {
      if (!questionForm.courseId) {
        setAvailableQuizzes([]);
        return;
      }

      try {
        const data = await api.listCourseQuizzes(questionForm.courseId);
        setAvailableQuizzes(data.quizzes || []);
      } catch (error) {
        setAvailableQuizzes([]);
      }
    }

    loadQuizzesForCourse();
  }, [questionForm.courseId]);

  const selectedCourseOptions = useMemo(
    () => courses.map((course) => ({ value: String(course.id), label: course.title })),
    [courses]
  );

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    try {
      await api.createCourse({
        ...courseForm,
        price: Number(courseForm.price || 0),
        discountPrice: courseForm.discountPrice ? Number(courseForm.discountPrice) : null,
      });

      notify("Course created successfully.", "success");
      setCourseForm({
        title: "",
        category: "",
        level: "All Levels",
        description: "",
        price: "",
        discountPrice: "",
        thumbnailUrl: "",
      });
      await loadData();
    } catch (error) {
      notify(error.message || "Failed to create course", "danger");
    }
  };

  const handleCreateLesson = async (event) => {
    event.preventDefault();

    try {
      await api.createLesson(lessonForm.courseId, {
        title: lessonForm.title,
        lessonType: lessonForm.lessonType,
        videoUrl: lessonForm.videoUrl || null,
        notesContent: lessonForm.notesContent || null,
        isPreview: lessonForm.isPreview,
      });

      notify("Lesson created successfully.", "success");
      setLessonForm((current) => ({
        ...current,
        title: "",
        lessonType: "mixed",
        videoUrl: "",
        notesContent: "",
        isPreview: false,
      }));
      await loadData();
    } catch (error) {
      notify(error.message || "Failed to create lesson", "danger");
    }
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();

    try {
      await api.createQuiz(quizForm.courseId, {
        title: quizForm.title,
        description: quizForm.description,
        passingScore: Number(quizForm.passingScore || 60),
      });

      notify("Quiz created successfully.", "success");
      setQuizForm({
        courseId: "",
        title: "",
        description: "",
        passingScore: 60,
      });
      await loadData();
    } catch (error) {
      notify(error.message || "Failed to create quiz", "danger");
    }
  };

  const handleCreateQuestion = async (event) => {
    event.preventDefault();

    try {
      await api.createQuizQuestion(questionForm.quizId, {
        questionText: questionForm.questionText,
        options: [
          questionForm.optionA,
          questionForm.optionB,
          questionForm.optionC,
          questionForm.optionD,
        ].filter(Boolean),
        correctOption: Number(questionForm.correctOption),
        explanation: questionForm.explanation,
      });

      notify("Quiz question created successfully.", "success");
      setQuestionForm((current) => ({
        ...current,
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "0",
        explanation: "",
      }));
    } catch (error) {
      notify(error.message || "Failed to create quiz question", "danger");
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Instructor Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {user?.name}. Manage courses, lessons, quizzes, and revenue.</p>
        </div>
        <Link to="/courses" className="btn btn-outline-primary">
          Browse Live Catalog
        </Link>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading instructor dashboard...</div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-4 col-xl-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Courses</small>
                  <h3 className="fw-bold mb-0">{summary.totalCourses}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-xl-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Lessons</small>
                  <h3 className="fw-bold mb-0">{summary.totalLessons}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-xl-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Students</small>
                  <h3 className="fw-bold mb-0">{summary.totalStudents}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-xl-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Enrollments</small>
                  <h3 className="fw-bold mb-0">{summary.totalEnrollments}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-xl-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Quizzes</small>
                  <h3 className="fw-bold mb-0">{summary.totalQuizzes}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-xl-2">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Revenue</small>
                  <h3 className="fw-bold mb-0">{formatCurrency(summary.totalRevenue)}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">My Courses</h5>
              {courses.length === 0 ? (
                <p className="text-muted mb-0">Create your first course to start publishing lessons and quizzes.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Type</th>
                        <th>Lessons</th>
                        <th>Quizzes</th>
                        <th>Students</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td>
                            <div className="fw-bold">{course.title}</div>
                            <small className="text-muted">{course.category}</small>
                          </td>
                          <td className="text-uppercase">{course.courseType}</td>
                          <td>{course.lessonCount}</td>
                          <td>{course.quizCount}</td>
                          <td>{course.enrolledStudents}</td>
                          <td>{formatCurrency(course.revenue_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Create Course</h5>
                  <form onSubmit={handleCreateCourse}>
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={courseForm.title}
                        onChange={(event) =>
                          setCourseForm((current) => ({ ...current, title: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category</label>
                        <input
                          type="text"
                          className="form-control"
                          value={courseForm.category}
                          onChange={(event) =>
                            setCourseForm((current) => ({ ...current, category: event.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Level</label>
                        <select
                          className="form-select"
                          value={courseForm.level}
                          onChange={(event) =>
                            setCourseForm((current) => ({ ...current, level: event.target.value }))
                          }
                        >
                          <option value="All Levels">All Levels</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        rows="4"
                        className="form-control"
                        value={courseForm.description}
                        onChange={(event) =>
                          setCourseForm((current) => ({ ...current, description: event.target.value }))
                        }
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={courseForm.price}
                          onChange={(event) =>
                            setCourseForm((current) => ({ ...current, price: event.target.value }))
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Discount Price</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={courseForm.discountPrice}
                          onChange={(event) =>
                            setCourseForm((current) => ({ ...current, discountPrice: event.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thumbnail URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={courseForm.thumbnailUrl}
                        onChange={(event) =>
                          setCourseForm((current) => ({ ...current, thumbnailUrl: event.target.value }))
                        }
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Create Course
                    </button>
                  </form>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Create Lesson</h5>
                  <form onSubmit={handleCreateLesson}>
                    <div className="mb-3">
                      <label className="form-label">Course</label>
                      <select
                        className="form-select"
                        value={lessonForm.courseId}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, courseId: event.target.value }))
                        }
                        required
                      >
                        <option value="">Select course</option>
                        {selectedCourseOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Lesson Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={lessonForm.title}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, title: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Lesson Type</label>
                      <select
                        className="form-select"
                        value={lessonForm.lessonType}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, lessonType: event.target.value }))
                        }
                      >
                        <option value="mixed">Mixed</option>
                        <option value="video">Video</option>
                        <option value="note">Note</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Video URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={lessonForm.videoUrl}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, videoUrl: event.target.value }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Notes / Files Description</label>
                      <textarea
                        rows="4"
                        className="form-control"
                        value={lessonForm.notesContent}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, notesContent: event.target.value }))
                        }
                      />
                    </div>
                    <div className="form-check mb-3">
                      <input
                        id="previewLesson"
                        type="checkbox"
                        className="form-check-input"
                        checked={lessonForm.isPreview}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, isPreview: event.target.checked }))
                        }
                      />
                      <label htmlFor="previewLesson" className="form-check-label">
                        Make this a preview lesson
                      </label>
                    </div>
                    <button type="submit" className="btn btn-outline-primary w-100">
                      Add Lesson
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Create Quiz</h5>
                  <form onSubmit={handleCreateQuiz}>
                    <div className="mb-3">
                      <label className="form-label">Course</label>
                      <select
                        className="form-select"
                        value={quizForm.courseId}
                        onChange={(event) =>
                          setQuizForm((current) => ({ ...current, courseId: event.target.value }))
                        }
                        required
                      >
                        <option value="">Select course</option>
                        {selectedCourseOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quiz Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={quizForm.title}
                        onChange={(event) =>
                          setQuizForm((current) => ({ ...current, title: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        value={quizForm.description}
                        onChange={(event) =>
                          setQuizForm((current) => ({ ...current, description: event.target.value }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Passing Score</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        value={quizForm.passingScore}
                        onChange={(event) =>
                          setQuizForm((current) => ({ ...current, passingScore: event.target.value }))
                        }
                      />
                    </div>
                    <button type="submit" className="btn btn-outline-primary w-100">
                      Add Quiz
                    </button>
                  </form>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Add Quiz Question</h5>
                  <form onSubmit={handleCreateQuestion}>
                    <div className="mb-3">
                      <label className="form-label">Course</label>
                      <select
                        className="form-select"
                        value={questionForm.courseId}
                        onChange={(event) =>
                          setQuestionForm((current) => ({
                            ...current,
                            courseId: event.target.value,
                            quizId: "",
                          }))
                        }
                        required
                      >
                        <option value="">Select course</option>
                        {selectedCourseOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quiz</label>
                      <select
                        className="form-select"
                        value={questionForm.quizId}
                        onChange={(event) =>
                          setQuestionForm((current) => ({ ...current, quizId: event.target.value }))
                        }
                        required
                      >
                        <option value="">Select quiz</option>
                        {availableQuizzes.map((quiz) => (
                          <option key={quiz.id} value={quiz.id}>
                            {quiz.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Question</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        value={questionForm.questionText}
                        onChange={(event) =>
                          setQuestionForm((current) => ({ ...current, questionText: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <input
                          className="form-control"
                          placeholder="Option A"
                          value={questionForm.optionA}
                          onChange={(event) =>
                            setQuestionForm((current) => ({ ...current, optionA: event.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <input
                          className="form-control"
                          placeholder="Option B"
                          value={questionForm.optionB}
                          onChange={(event) =>
                            setQuestionForm((current) => ({ ...current, optionB: event.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <input
                          className="form-control"
                          placeholder="Option C"
                          value={questionForm.optionC}
                          onChange={(event) =>
                            setQuestionForm((current) => ({ ...current, optionC: event.target.value }))
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <input
                          className="form-control"
                          placeholder="Option D"
                          value={questionForm.optionD}
                          onChange={(event) =>
                            setQuestionForm((current) => ({ ...current, optionD: event.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Correct Option</label>
                      <select
                        className="form-select"
                        value={questionForm.correctOption}
                        onChange={(event) =>
                          setQuestionForm((current) => ({ ...current, correctOption: event.target.value }))
                        }
                      >
                        <option value="0">Option A</option>
                        <option value="1">Option B</option>
                        <option value="2">Option C</option>
                        <option value="3">Option D</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Explanation</label>
                      <textarea
                        rows="2"
                        className="form-control"
                        value={questionForm.explanation}
                        onChange={(event) =>
                          setQuestionForm((current) => ({ ...current, explanation: event.target.value }))
                        }
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Add Question
                    </button>
                  </form>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Recent Revenue Events</h5>
                  {recentPayments.length === 0 ? (
                    <p className="text-muted mb-0">No completed payments yet.</p>
                  ) : (
                    recentPayments.map((payment) => (
                      <div className="border rounded p-3 mb-2" key={payment.id}>
                        <strong>{payment.course_title}</strong>
                        <div className="small text-muted">
                          {payment.user_name} paid {formatCurrency(payment.amount)} via{" "}
                          {payment.gateway.replace("_", " ")}
                        </div>
                        <div className="small text-muted">Transaction: {payment.transaction_id}</div>
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
