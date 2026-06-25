import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { COURSE_CATEGORIES } from "../../data/courses";
import { slugifyCategory } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function SiteNavbar() {
  const location = useLocation();
  const { isLoggedIn, dashboardPath, logout } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [categories, setCategories] = useState(COURSE_CATEGORIES);

  const isHome = location.pathname === "/";

  // Fetch categories from backend on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        // Fetch all courses to get all categories (without limit)
        const data = await api.listCourses({ limit: 100 });
        const uniqueCategories = new Set(data.courses?.map((course) => course.category).filter(Boolean));
        const fetchedCategories = Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
        if (fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        // Fallback to static categories if fetch fails
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const handleNavAction = () => {
    setIsMobileOpen(false);
    setIsCoursesOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary fs-3" to="/" onClick={handleNavAction}>
          <i className="fas fa-graduation-cap me-2" />EduLearn
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${isMobileOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={handleNavAction}
              >
                <i className="fas fa-home me-1" /> Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/courses"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={handleNavAction}
              >
                <i className="fas fa-book me-1" /> Courses
              </NavLink>
            </li>

            <li
              className="nav-item dropdown"
              onMouseEnter={() => setIsCoursesOpen(true)}
              onMouseLeave={() => setIsCoursesOpen(false)}
            >
              <button
                type="button"
                className="nav-link dropdown-toggle btn btn-link"
                onClick={() => setIsCoursesOpen((prev) => !prev)}
              >
                <i className="fas fa-filter me-1" /> Categories
              </button>
              <ul className={`dropdown-menu ${isCoursesOpen ? "show" : ""}`}>
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      className="dropdown-item"
                      to={`/courses?category=${encodeURIComponent(category)}`}
                      onClick={handleNavAction}
                    >
                      {category}
                    </Link>
                  </li>
                ))}
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item" to="/courses?price=free" onClick={handleNavAction}>
                    Free Courses
                  </Link>
                </li>
              </ul>
            </li>

            {isHome && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="#about" onClick={handleNavAction}>
                    <i className="fas fa-info-circle me-1" /> About
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#contact" onClick={handleNavAction}>
                    <i className="fas fa-envelope me-1" /> Contact
                  </a>
                </li>
              </>
            )}

            <li className="nav-item">
              <NavLink
                to={isLoggedIn ? dashboardPath : "/login"}
                className={({ isActive }) =>
                  `btn btn-outline-primary ms-lg-2 ${isActive ? "active" : ""}`
                }
                onClick={handleNavAction}
              >
                <i className="fas fa-tachometer-alt me-1" /> Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              {!isLoggedIn ? (
                <Link className="btn btn-primary ms-lg-2" to="/login" onClick={handleNavAction}>
                  <i className="fas fa-sign-in-alt me-1" /> Login
                </Link>
              ) : (
                <button className="btn btn-primary ms-lg-2" type="button" onClick={logout}>
                  <i className="fas fa-sign-out-alt me-1" /> Logout
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
