import { useEffect, useMemo, useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { COURSE_CATEGORIES } from "../../data/courses";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function SiteNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, dashboardPath, logout } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState(COURSE_CATEGORIES);
  const [isScrolled, setIsScrolled] = useState(false);

  const navRef = useRef(null);
  const isHome = location.pathname === "/";

  // Detect scroll for navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories from backend on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await api.listCourses({ limit: 100 });
        const uniqueCategories = new Set(data.courses?.map((course) => course.category).filter(Boolean));
        const fetchedCategories = Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
        if (fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsCoursesOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleNavAction = () => {
    setIsMobileOpen(false);
    setIsCoursesOpen(false);
    setIsUserMenuOpen(false);
  };

  // User initials & display name
  const userName = user?.full_name || user?.name || user?.email?.split("@")[0] || "User";
  const userInitials = useMemo(() => {
    if (!userName) return "U";
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return userName.slice(0, 2).toUpperCase();
  }, [userName]);

  const userRoleBadge = useMemo(() => {
    const r = (user?.role || "student").toLowerCase();
    if (r === "admin") return { label: "Admin", bg: "bg-danger text-white" };
    if (r === "teacher" || r === "instructor") return { label: "Instructor", bg: "bg-success text-white" };
    return { label: "Student", bg: "bg-primary text-white" };
  }, [user?.role]);

  return (
    <nav
      ref={navRef}
      className={`navbar navbar-expand-lg fixed-top transition-all ${
        isScrolled ? "navbar-scrolled" : "bg-white shadow-sm"
      }`}
    >
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={handleNavAction}>
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            }}
          >
            <i className="fas fa-graduation-cap" style={{ fontSize: "1.1rem" }} />
          </div>
          <span className="fw-bold tracking-tight text-dark fs-4">
            Edu<span className="text-primary">Learn</span>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 p-2 shadow-none"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Navbar Links & Actions */}
        <div className={`collapse navbar-collapse ${isMobileOpen ? "show" : ""}`}>
          {/* Mobile User Card when logged in */}
          {isLoggedIn && isMobileOpen && (
            <div className="mobile-user-card d-lg-none mt-3 mb-2">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-initials flex-shrink-0">{userInitials}</div>
                <div className="overflow-hidden">
                  <div className="fw-bold text-dark text-truncate">{userName}</div>
                  <div className="small text-muted text-truncate">{user?.email}</div>
                </div>
                <span className={`badge ${userRoleBadge.bg} ms-auto`}>
                  {userRoleBadge.label}
                </span>
              </div>
            </div>
          )}

          <ul className="navbar-nav me-auto align-items-lg-center ps-lg-3">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={handleNavAction}
              >
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/courses"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={handleNavAction}
              >
                Courses
              </NavLink>
            </li>

            {/* Categories Dropdown */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => setIsCoursesOpen(true)}
              onMouseLeave={() => setIsCoursesOpen(false)}
            >
              <button
                type="button"
                className="nav-link dropdown-toggle btn btn-link border-0 text-start"
                onClick={() => setIsCoursesOpen((prev) => !prev)}
                aria-expanded={isCoursesOpen}
              >
                Categories
              </button>
              <ul className={`dropdown-menu shadow-sm border-0 rounded-3 mt-1 ${isCoursesOpen ? "show" : ""}`}>
                <li>
                  <button
                    className="dropdown-item py-2 fw-medium"
                    type="button"
                    onClick={() => {
                      navigate("/courses");
                      handleNavAction();
                    }}
                  >
                    <i className="fas fa-layer-group text-primary me-2" /> All Categories
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider my-1" />
                </li>
                {categories.map((category) => (
                  <li key={category}>
                    <button
                      className="dropdown-item py-2"
                      type="button"
                      onClick={() => {
                        navigate(`/courses?category=${encodeURIComponent(category)}`);
                        handleNavAction();
                      }}
                    >
                      {category}
                    </button>
                  </li>
                ))}
                <li>
                  <hr className="dropdown-divider my-1" />
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 text-success fw-medium"
                    type="button"
                    onClick={() => {
                      navigate("/courses?price=free");
                      handleNavAction();
                    }}
                  >
                    <i className="fas fa-gift text-success me-2" /> Free Courses
                  </button>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <NavLink
                to="/about"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={handleNavAction}
              >
                About
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={handleNavAction}
              >
                Contact
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/faq"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={handleNavAction}
              >
                FAQ
              </NavLink>
            </li>
          </ul>

          {/* Right Action Items */}
          <div className="d-flex align-items-lg-center gap-2 mt-3 mt-lg-0">
            {!isLoggedIn ? (
              <>
                <Link
                  className="btn btn-outline-primary px-3 w-100 w-lg-auto"
                  to="/login"
                  onClick={handleNavAction}
                >
                  <i className="fas fa-arrow-right-to-bracket me-1" /> Sign In
                </Link>
                <Link
                  className="btn btn-primary px-3 w-100 w-lg-auto"
                  to="/login?tab=signup"
                  onClick={handleNavAction}
                >
                  Get Started Free
                </Link>
              </>
            ) : (
              <>
                {/* Desktop User Menu Dropdown */}
                <div
                  className="nav-item dropdown d-none d-lg-block"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <button
                    type="button"
                    className="nav-user-badge btn p-1 pe-3 border d-flex align-items-center gap-2"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="nav-user-avatar">{userInitials}</div>
                    <span className="fw-medium text-dark small text-truncate" style={{ maxWidth: "120px" }}>
                      {userName}
                    </span>
                    <span className={`badge ${userRoleBadge.bg}`} style={{ fontSize: "0.65rem" }}>
                      {userRoleBadge.label}
                    </span>
                    <i className="fas fa-chevron-down text-muted small ms-1" style={{ fontSize: "0.7rem" }} />
                  </button>

                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1 py-2 ${
                      isUserMenuOpen ? "show" : ""
                    }`}
                    style={{ minWidth: "220px" }}
                  >
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-bold text-dark text-truncate">{userName}</div>
                      <div className="small text-muted text-truncate">{user?.email}</div>
                    </li>
                    {user?.role === "admin" ? (
                      <>
                        <li>
                          <Link className="dropdown-item py-2 fw-semibold text-danger" to="/dashboard/admin" onClick={handleNavAction}>
                            <i className="fas fa-shield-halved me-2" /> Admin Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2" to="/dashboard/student" onClick={handleNavAction}>
                            <i className="fas fa-graduation-cap text-primary me-2" /> Student View
                          </Link>
                        </li>
                      </>
                    ) : (
                      <li>
                        <Link className="dropdown-item py-2 mt-1" to={dashboardPath} onClick={handleNavAction}>
                          <i className="fas fa-gauge text-primary me-2" /> My Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link className="dropdown-item py-2" to="/courses" onClick={handleNavAction}>
                        <i className="fas fa-compass text-secondary me-2" /> Browse Catalog
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider my-1" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 text-danger"
                        type="button"
                        onClick={() => {
                          handleNavAction();
                          logout();
                        }}
                      >
                        <i className="fas fa-arrow-right-from-bracket me-2" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Mobile Direct Buttons */}
                <div className="d-flex flex-column gap-2 w-100 d-lg-none">
                  {user?.role === "admin" ? (
                    <>
                      <Link
                        to="/dashboard/admin"
                        className="btn btn-danger text-white d-flex align-items-center justify-content-center gap-2"
                        onClick={handleNavAction}
                      >
                        <i className="fas fa-shield-halved" /> Admin Dashboard
                      </Link>
                      <Link
                        to="/dashboard/student"
                        className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                        onClick={handleNavAction}
                      >
                        <i className="fas fa-graduation-cap" /> Student View
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={dashboardPath}
                      className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                      onClick={handleNavAction}
                    >
                      <i className="fas fa-gauge" /> My Dashboard
                    </Link>
                  )}
                  <button
                    className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
                    type="button"
                    onClick={() => {
                      handleNavAction();
                      logout();
                    }}
                  >
                    <i className="fas fa-arrow-right-from-bracket" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
