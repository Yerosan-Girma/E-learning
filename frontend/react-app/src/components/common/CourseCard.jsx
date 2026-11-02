import { Link } from "react-router-dom";
import { formatNumber, formatPrice } from "../../utils/format";
import { normalizeCourse } from "../../utils/courseAdapter";

export default function CourseCard({ course, columnClass = "col-lg-4 col-md-6 mb-4" }) {
  const normalized = normalizeCourse(course);

  // Level badge style
  const levelClass =
    normalized.level?.toLowerCase() === "beginner"
      ? "badge-soft-success"
      : normalized.level?.toLowerCase() === "advanced"
      ? "badge-soft-warning"
      : "badge-soft-primary";

  return (
    <div className={columnClass}>
      <div className="card course-card h-100 shadow-sm border-0 d-flex flex-column">
        {/* Course Thumbnail & Badges */}
        <div className="position-relative overflow-hidden" style={{ aspectRatio: "16 / 9", backgroundColor: "#f1f5f9" }}>
          <img
            src={normalized.image}
            className="w-100 h-100 course-img"
            alt={normalized.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/images/onlineimage.avif";
            }}
          />

          {/* Top-Right Category Pill */}
          {normalized.category && (
            <span className="course-badge">
              {normalized.category}
            </span>
          )}

          {/* Top-Left Pricing Tag */}
          <span
            className={`position-absolute top-0 start-0 m-2 px-2.5 py-1 rounded-pill small fw-semibold shadow-sm ${
              normalized.isFree
                ? "bg-success text-white"
                : "bg-dark text-white"
            }`}
            style={{ fontSize: "0.75rem" }}
          >
            {normalized.isFree ? "FREE" : "PAID"}
          </span>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column p-3 p-md-4">
          {/* Level & Type row */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className={`badge ${levelClass} small`}>
              {normalized.level || "All Levels"}
            </span>
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.75rem" }}>
              {normalized.isFree ? "Free Course" : normalized.courseType || "Certificate"}
            </small>
          </div>

          {/* Course Title (2 lines clamp with stable height) */}
          <h5
            className="card-title fw-bold text-dark mb-2 text-truncate-2"
            title={normalized.title}
            style={{ minHeight: "2.75rem", lineHeight: "1.35" }}
          >
            <Link to={`/courses/${normalized.id}`} className="text-dark text-decoration-none hover-primary">
              {normalized.title}
            </Link>
          </h5>

          {/* Instructor */}
          <p className="text-muted small mb-3 text-truncate">
            <i className="fas fa-chalkboard-user text-primary opacity-75 me-1" />
            <span>By <strong>{normalized.instructor}</strong></span>
          </p>

          {/* Course Meta: Lessons & Students */}
          <div className="course-meta d-flex justify-content-between py-2 border-top border-bottom border-light-subtle mb-3 small text-muted">
            <span className="d-flex align-items-center gap-1">
              <i className="far fa-play-circle text-primary" />
              <span>{normalized.lessonCount} lessons</span>
            </span>
            <span className="d-flex align-items-center gap-1">
              <i className="far fa-user text-primary" />
              <span>{formatNumber(normalized.enrolledStudents)} learners</span>
            </span>
          </div>

          {/* Description */}
          <p className="text-muted small text-truncate-2 mb-3" style={{ minHeight: "2.4rem" }}>
            {normalized.shortDescription}
          </p>

          {/* Card Footer: Price & CTA */}
          <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
            <div>
              {normalized.isFree ? (
                <div className="d-flex flex-column">
                  <span className="text-success fw-bold fs-5 lh-1">Free</span>
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>Instant Access</small>
                </div>
              ) : (
                <div className="d-flex flex-column">
                  <span className="text-dark fw-bold fs-5 lh-1">{formatPrice(normalized.effectivePrice)}</span>
                  {normalized.discountPrice && (
                    <small className="text-muted text-decoration-line-through" style={{ fontSize: "0.75rem" }}>
                      {formatPrice(normalized.price)}
                    </small>
                  )}
                </div>
              )}
            </div>

            <Link
              to={`/courses/${normalized.id}`}
              className="btn btn-outline-primary btn-sm px-3 d-flex align-items-center gap-1 rounded-pill"
            >
              <span>View</span>
              <i className="fas fa-arrow-right small" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
