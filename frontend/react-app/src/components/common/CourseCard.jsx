import { Link } from "react-router-dom";
import { formatNumber, formatPrice } from "../../utils/format";
import { normalizeCourse } from "../../utils/courseAdapter";

export default function CourseCard({ course }) {
  const normalized = normalizeCourse(course);

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card course-card h-100 shadow-sm">
        <div className="position-relative">
          <img
            src={normalized.image}
            className="card-img-top course-img"
            alt={normalized.title}
            loading="lazy"
          />
          <span className="course-badge">{normalized.category}</span>
          {normalized.isFree && (
            <span className="position-absolute top-0 start-0 bg-success text-white px-2 py-1 m-2 rounded">
              FREE
            </span>
          )}
          {!normalized.isFree && (
            <span className="position-absolute top-0 start-0 bg-dark text-white px-2 py-1 m-2 rounded">
              PAID
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-light text-dark">{normalized.level}</span>
            <small className="text-muted">
              {normalized.isFree ? "FREE" : normalized.courseType.toUpperCase()}
            </small>
          </div>

          <h5 className="card-title fw-bold">{normalized.title}</h5>
          <p className="text-muted small mb-2">By {normalized.instructor}</p>

          <div className="course-meta d-flex justify-content-between mb-3">
            <span>
              <i className="far fa-play-circle" /> {normalized.lessonCount} lessons
            </span>
            <span>
              <i className="far fa-user" /> {formatNumber(normalized.enrolledStudents)}
            </span>
          </div>

          <p className="text-muted small">{normalized.shortDescription}</p>

          <div className="mt-auto d-flex justify-content-between align-items-center">
            <div>
              {normalized.isFree ? (
                <span className="course-price text-success fw-bold">Free</span>
              ) : (
                <span className="course-price text-dark">{formatPrice(normalized.effectivePrice)}</span>
              )}
            </div>

            <Link to={`/courses/${normalized.id}`} className="btn btn-primary btn-sm">
              <i className="fas fa-arrow-right me-1" /> View Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
