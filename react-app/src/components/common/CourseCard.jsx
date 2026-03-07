import { Link } from "react-router-dom";
import { formatNumber, formatPrice, starsFromRating } from "../../utils/format";

export default function CourseCard({ course }) {
  const finalPrice = course.discountPrice || course.price;
  const discount = course.price > 0 && course.discountPrice > 0
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  const stars = starsFromRating(course.rating);

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card course-card h-100 shadow-sm">
        <div className="position-relative">
          <img src={course.image} className="card-img-top course-img" alt={course.title} loading="lazy" />
          <span className="course-badge">{course.category}</span>
          {discount > 0 && (
            <span className="position-absolute bottom-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded">
              {discount}% OFF
            </span>
          )}
          {course.isFree && (
            <span className="position-absolute top-0 start-0 bg-success text-white px-2 py-1 m-2 rounded">
              FREE
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          <div className="mb-2">
            <span className="badge bg-light text-dark">{course.level}</span>
          </div>

          <h5 className="card-title fw-bold">{course.title}</h5>
          <p className="text-muted small mb-2">By {course.instructor}</p>

          <div className="d-flex align-items-center mb-2">
            <div className="course-rating me-2">
              {Array.from({ length: stars.full }).map((_, idx) => (
                <i key={`full-${idx}`} className="fas fa-star" />
              ))}
              {stars.hasHalf && <i className="fas fa-star-half-alt" />}
              {Array.from({ length: stars.empty }).map((_, idx) => (
                <i key={`empty-${idx}`} className="far fa-star" />
              ))}
            </div>
            <span className="text-muted small">({formatNumber(course.reviews)})</span>
          </div>

          <div className="course-meta d-flex justify-content-between mb-3">
            <span>
              <i className="far fa-clock" /> {course.durationHours} hours
            </span>
            <span>
              <i className="far fa-play-circle" /> {course.lectures} lectures
            </span>
          </div>

          <p className="text-muted small">{course.shortDescription}</p>

          <div className="mt-auto d-flex justify-content-between align-items-center">
            <div>
              {course.discountPrice > 0 && course.price > 0 && (
                <span className="text-decoration-line-through text-muted me-2">
                  {formatPrice(course.price)}
                </span>
              )}
              <span className="course-price text-dark">{formatPrice(finalPrice)}</span>
            </div>

            <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
              <i className="fas fa-shopping-cart me-1" /> Enroll
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
