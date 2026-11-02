import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container py-5 text-center my-auto" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div
        className="d-flex align-items-center justify-content-center text-primary rounded-circle bg-primary bg-opacity-10 mb-4"
        style={{ width: "90px", height: "90px" }}
      >
        <i className="fas fa-compass fa-2x" />
      </div>
      <h1 className="display-4 fw-bold mb-2 text-dark">Page Not Found</h1>
      <p className="text-muted mb-4 fs-5" style={{ maxWidth: "460px" }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="d-flex gap-2">
        <Link to="/" className="btn btn-primary px-4 rounded-pill">
          <i className="fas fa-home me-2" /> Back to Home
        </Link>
        <Link to="/courses" className="btn btn-outline-secondary px-4 rounded-pill">
          <i className="fas fa-book me-2" /> Explore Courses
        </Link>
      </div>
    </div>
  );
}
