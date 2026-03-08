import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function TeacherDashboardPage() {
  const { user, notify } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalCourses: 0, totalLessons: 0, totalStudents: 0 });
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "",
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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getDashboard("teacher");
        setSummary(data.summary || { totalCourses: 0, totalLessons: 0, totalStudents: 0 });
        setCourses(data.courses || []);
      } catch (error) {
        notify(error.message || "Failed to load teacher dashboard", "danger");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [notify]);

  const canSubmitLesson = useMemo(
    () => lessonForm.courseId && lessonForm.title,
    [lessonForm.courseId, lessonForm.title]
  );

  const handleCreateLesson = async (event) => {
    event.preventDefault();

    if (!canSubmitLesson) {
      notify("Select course and lesson title.", "warning");
      return;
    }

    try {
      await api.createLesson(lessonForm.courseId, {
        title: lessonForm.title,
        lessonType: lessonForm.lessonType,
        videoUrl: lessonForm.videoUrl || null,
        notesContent: lessonForm.notesContent || null,
        isPreview: lessonForm.isPreview,
      });

      notify("Lesson created successfully.", "success");

      setLessonForm({
        courseId: lessonForm.courseId,
        title: "",
        lessonType: "mixed",
        videoUrl: "",
        notesContent: "",
        isPreview: false,
      });

      const data = await api.getDashboard("teacher");
      setSummary(data.summary || summary);
    } catch (error) {
      notify(error.message || "Failed to create lesson", "danger");
    }
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    if (!courseForm.title || !courseForm.category) {
      notify("Course title and category are required.", "warning");
      return;
    }

    try {
      await api.createCourse({
        title: courseForm.title,
        category: courseForm.category,
        description: courseForm.description,
        price: Number(courseForm.price || 0),
        discountPrice: courseForm.discountPrice ? Number(courseForm.discountPrice) : null,
        thumbnailUrl: courseForm.thumbnailUrl || null,
      });

      notify("Course created successfully.", "success");

      setCourseForm({
        title: "",
        category: "",
        description: "",
        price: "",
        discountPrice: "",
        thumbnailUrl: "",
      });

      const data = await api.getDashboard("teacher");
      setSummary(data.summary || summary);
      setCourses(data.courses || []);
    } catch (error) {
      notify(error.message || "Failed to create course", "danger");
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Teacher Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {user?.name}</p>
        </div>
        <Link to="/courses" className="btn btn-outline-primary">
          <i className="fas fa-book me-2" /> Browse Courses
        </Link>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading teacher dashboard...</div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">My Courses</small>
                  <h3 className="fw-bold mb-0">{summary.totalCourses}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Total Lessons</small>
                  <h3 className="fw-bold mb-0">{summary.totalLessons}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <small className="text-muted">Enrolled Students</small>
                  <h3 className="fw-bold mb-0">{summary.totalStudents}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">My Courses</h5>
                  {courses.length === 0 ? (
                    <p className="text-muted mb-0">No courses found for this teacher account.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course) => (
                            <tr key={course.id}>
                              <td>{course.title}</td>
                              <td>{course.category}</td>
                              <td>${Number(course.discount_price || course.price || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
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
                          setCourseForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={courseForm.category}
                        onChange={(event) =>
                          setCourseForm((prev) => ({ ...prev, category: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        value={courseForm.description}
                        onChange={(event) =>
                          setCourseForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                      />
                    </div>
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={courseForm.price}
                          onChange={(event) =>
                            setCourseForm((prev) => ({ ...prev, price: event.target.value }))
                          }
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label">Discount Price</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={courseForm.discountPrice}
                          onChange={(event) =>
                            setCourseForm((prev) => ({ ...prev, discountPrice: event.target.value }))
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
                          setCourseForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))
                        }
                      />
                    </div>

                    <button type="submit" className="btn btn-outline-primary w-100">
                      <i className="fas fa-plus me-2" /> Create Course
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
                          setLessonForm((prev) => ({ ...prev, courseId: event.target.value }))
                        }
                        required
                      >
                        <option value="">Select course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
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
                          setLessonForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={lessonForm.lessonType}
                        onChange={(event) =>
                          setLessonForm((prev) => ({ ...prev, lessonType: event.target.value }))
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
                          setLessonForm((prev) => ({ ...prev, videoUrl: event.target.value }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        rows="4"
                        className="form-control"
                        value={lessonForm.notesContent}
                        onChange={(event) =>
                          setLessonForm((prev) => ({ ...prev, notesContent: event.target.value }))
                        }
                      />
                    </div>
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isPreviewLesson"
                        checked={lessonForm.isPreview}
                        onChange={(event) =>
                          setLessonForm((prev) => ({ ...prev, isPreview: event.target.checked }))
                        }
                      />
                      <label className="form-check-label" htmlFor="isPreviewLesson">
                        Make preview lesson
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                      <i className="fas fa-plus me-2" /> Create Lesson
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
