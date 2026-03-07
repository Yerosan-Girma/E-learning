import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLearningCourse } from "../data/courses";
import {
  getLectureProgress,
  getViewedLectures,
  setLectureProgress,
  setViewedLectures,
} from "../utils/storage";

function resourceIcon(type) {
  if (type === "pdf") return "fa-file-pdf text-danger";
  if (type === "zip") return "fa-file-archive text-warning";
  if (type === "ppt") return "fa-file-powerpoint text-primary";
  return "fa-file text-primary";
}

export default function LearningPage() {
  const { courseId } = useParams();
  const { notify } = useAuth();

  const course = useMemo(() => getLearningCourse(courseId), [courseId]);
  const [activeLectureId, setActiveLectureId] = useState(course.lectures[0]?.id || null);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    const allProgress = getLectureProgress();
    setProgressMap(allProgress[String(course.courseId)] || {});
  }, [course.courseId]);

  useEffect(() => {
    if (!activeLectureId) return;

    const viewed = getViewedLectures();
    const key = String(course.courseId);
    const nextViewed = { ...viewed };

    if (!Array.isArray(nextViewed[key])) {
      nextViewed[key] = [];
    }

    if (!nextViewed[key].includes(activeLectureId)) {
      nextViewed[key] = [...nextViewed[key], activeLectureId];
      setViewedLectures(nextViewed);
    }
  }, [activeLectureId, course.courseId]);

  const activeLecture = useMemo(
    () => course.lectures.find((lecture) => lecture.id === activeLectureId) || course.lectures[0],
    [activeLectureId, course.lectures]
  );

  const completedCount = Object.values(progressMap).filter((entry) => entry?.completed).length;
  const totalLectures = course.lectures.length;
  const completionPercent = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  const markLectureComplete = (lectureId) => {
    const key = String(course.courseId);
    const allProgress = getLectureProgress();
    const courseProgress = allProgress[key] || {};

    const nextCourseProgress = {
      ...courseProgress,
      [lectureId]: {
        completed: true,
        date: new Date().toISOString(),
      },
    };

    const nextProgress = {
      ...allProgress,
      [key]: nextCourseProgress,
    };

    setLectureProgress(nextProgress);
    setProgressMap(nextCourseProgress);
    notify("Lecture marked as complete.", "success");
  };

  const lectureIndex = course.lectures.findIndex((lecture) => lecture.id === activeLecture?.id);

  const navigateLecture = (direction) => {
    const nextIndex = lectureIndex + direction;

    if (nextIndex >= 0 && nextIndex < course.lectures.length) {
      setActiveLectureId(course.lectures[nextIndex].id);
    }
  };

  const activeLectureResources = activeLecture?.resources || [];

  return (
    <>
      <nav className="navbar navbar-light bg-white shadow-sm fixed-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary fs-3" to="/">
            <i className="fas fa-graduation-cap me-2" />EduLearn
          </Link>
          <div className="d-flex align-items-center">
            <Link to="/dashboard" className="btn btn-outline-primary me-2">
              <i className="fas fa-tachometer-alt me-1" /> Dashboard
            </Link>
            <Link to="/courses" className="btn btn-primary">
              <i className="fas fa-book me-1" /> Courses
            </Link>
          </div>
        </div>
      </nav>

      <div className="learning-container">
        <div className="container">
          <div className="course-header">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h2 className="fw-bold mb-1">{course.title}</h2>
                <p className="text-muted mb-0">Master modern skills step by step</p>
              </div>
              <div className="progress-section">
                <small className="text-muted d-block mb-1">Course Progress</small>
                <div className="progress" style={{ height: "8px" }}>
                  <div className="progress-bar" style={{ width: `${completionPercent}%` }} />
                </div>
                <small className="text-muted">
                  {completedCount}/{totalLectures} lectures completed
                </small>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <div className="lecture-sidebar">
                <h5 className="fw-bold mb-3">Course Lectures</h5>
                <div>
                  {course.lectures.map((lecture, index) => {
                    const isActive = lecture.id === activeLecture?.id;
                    const isCompleted = progressMap[lecture.id]?.completed;

                    return (
                      <button
                        key={lecture.id}
                        type="button"
                        className={`lecture-item w-100 text-start ${isActive ? "active" : ""} ${
                          isCompleted ? "completed" : ""
                        }`}
                        onClick={() => setActiveLectureId(lecture.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <i
                              className={`fas fa-play-circle me-2 ${
                                isCompleted ? "text-success" : "text-primary"
                              }`}
                            />
                            <strong>{lecture.title}</strong>
                          </div>
                          <small className="text-muted">{index + 1}</small>
                        </div>
                        {isCompleted && (
                          <small className="text-success">
                            <i className="fas fa-check me-1" /> Completed
                          </small>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="resources-section">
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-download me-2" /> Download Resources
                </h6>
                {course.resources.map((resource) => (
                  <a key={resource.name} href="#" className="resource-link" onClick={(e) => e.preventDefault()}>
                    <i className={`fas ${resourceIcon(resource.type)} me-3`} />
                    <div>
                      <strong>{resource.name}</strong>
                      <small className="text-muted d-block">
                        {resource.type.toUpperCase()} - {resource.size}
                      </small>
                    </div>
                    <i className="fas fa-download ms-auto" />
                  </a>
                ))}
              </div>
            </div>

            <div className="col-lg-8">
              <div className="video-container">
                <div className="video-wrapper">
                  <iframe
                    key={activeLecture?.youtubeId}
                    src={`https://www.youtube.com/embed/${activeLecture?.youtubeId}`}
                    title={activeLecture?.title || "Lecture"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              <h3 className="fw-bold mb-3">{activeLecture?.title || "Select a lecture"}</h3>

              <div className="notes-container">
                <h5 className="fw-bold mb-3">Lecture Notes</h5>
                <div
                  className="lesson-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      activeLecture?.notes ||
                      "<p class='text-muted'>Select a lecture from the sidebar to view notes and resources.</p>",
                  }}
                />

                {activeLectureResources.length > 0 && (
                  <div className="mt-4">
                    <h6 className="fw-bold mb-2">Lecture Resources</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {activeLectureResources.map((resource) => (
                        <span key={`${activeLecture.id}-${resource.name}`} className="badge bg-light text-dark">
                          {resource.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-4 flex-wrap gap-2">
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    disabled={lectureIndex <= 0}
                    onClick={() => navigateLecture(-1)}
                  >
                    <i className="fas fa-arrow-left me-2" /> Previous
                  </button>
                  <div>
                    <button
                      className="btn btn-outline-success me-2"
                      type="button"
                      onClick={() => markLectureComplete(activeLecture.id)}
                    >
                      <i className="fas fa-check me-2" /> Mark Complete
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={lectureIndex >= course.lectures.length - 1}
                      onClick={() => navigateLecture(1)}
                    >
                      Next <i className="fas fa-arrow-right ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
