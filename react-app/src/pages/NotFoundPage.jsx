import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container py-5 mt-5 text-center">
      <h1 className="display-4 fw-bold mb-3">404</h1>
      <p className="text-muted mb-4">The page you requested could not be found.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
