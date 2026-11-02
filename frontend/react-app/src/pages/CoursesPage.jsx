import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/common/CourseCard";
import { api } from "../services/api";
import { normalizeCourse } from "../utils/courseAdapter";
import { deslugifyCategory } from "../utils/format";

const PAGE_SIZE = 6;

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [freeOnly, setFreeOnly] = useState(searchParams.get("price") === "free");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state whenever URL searchParams change (e.g. user clicked category in navbar)
  useEffect(() => {
    const cat = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const free = searchParams.get("price") === "free";

    setSelectedCategory(cat);
    setSearchTerm(search);
    setFreeOnly(free);
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch unique categories from available courses
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await api.listCourses({ limit: 100 });
        const uniqueCategories = new Set(
          data.courses?.map((course) => course.category).filter(Boolean)
        );
        const fetchedCategories = Array.from(uniqueCategories).sort((a, b) =>
          a.localeCompare(b)
        );
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Resolve category name (handles exact, case-insensitive, or slugified match)
  const resolvedCategory = useMemo(() => {
    if (!selectedCategory) return "";

    // 1. Direct match
    if (categories.includes(selectedCategory)) return selectedCategory;

    // 2. Case-insensitive match
    const matchedCase = categories.find(
      (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
    );
    if (matchedCase) return matchedCase;

    // 3. Deslugified match (e.g. web-development -> Web Development)
    const deslugified = deslugifyCategory(selectedCategory);
    const matchedSlug = categories.find(
      (cat) => cat.toLowerCase() === deslugified.toLowerCase()
    );
    if (matchedSlug) return matchedSlug;

    // 4. Default: return selectedCategory directly so backend filters it
    return selectedCategory;
  }, [categories, selectedCategory]);

  // Load courses whenever search, category, level, or page changes
  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: PAGE_SIZE,
        };

        if (searchTerm) params.search = searchTerm;
        if (resolvedCategory) params.category = resolvedCategory;
        if (selectedLevel !== "all") params.level = selectedLevel;
        if (freeOnly) params.maxPrice = 0;

        if (sortBy === "newest") {
          params.sortBy = "created_at";
          params.sortOrder = "DESC";
        } else if (sortBy === "students") {
          params.sortBy = "total_students";
          params.sortOrder = "DESC";
        } else if (sortBy === "price-low") {
          params.sortBy = "price";
          params.sortOrder = "ASC";
        } else if (sortBy === "price-high") {
          params.sortBy = "price";
          params.sortOrder = "DESC";
        }

        const data = await api.listCourses(params);
        setCourses((data.courses || []).map(normalizeCourse));
        setPagination(data.pagination || { total: 0, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [currentPage, searchTerm, resolvedCategory, selectedLevel, freeOnly, sortBy]);

  const totalPages = pagination.totalPages;

  const activeFiltersCount = useMemo(() => {
    return [
      Boolean(resolvedCategory),
      Boolean(searchTerm),
      selectedLevel !== "all",
      freeOnly,
    ].filter(Boolean).length;
  }, [resolvedCategory, searchTerm, selectedLevel, freeOnly]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedLevel("all");
    setFreeOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (cat) {
      nextParams.set("category", cat);
    } else {
      nextParams.delete("category");
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="container py-4 py-lg-5">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold mb-2">Explore Courses</h1>
          <p className="text-muted mb-0">
            Browse free and premium courses by category, level, or topic to accelerate your learning.
          </p>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="d-lg-none mb-3">
        <button
          type="button"
          className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-white shadow-sm"
          onClick={() => setMobileFilterOpen((prev) => !prev)}
        >
          <span className="d-flex align-items-center gap-2">
            <i className="fas fa-sliders text-primary" />
            <span className="fw-semibold text-dark">Filters & Search</span>
            {activeFiltersCount > 0 && (
              <span className="badge bg-primary rounded-pill small px-2">
                {activeFiltersCount}
              </span>
            )}
          </span>
          <span className="small text-muted d-flex align-items-center gap-1">
            <span>{mobileFilterOpen ? "Hide" : "Show"}</span>
            <i className={`fas fa-chevron-${mobileFilterOpen ? "up" : "down"}`} />
          </span>
        </button>
      </div>

      <div className="row">
        {/* Filter Sidebar (Always visible on lg+, collapsible on mobile) */}
        <div className={`col-lg-3 ${mobileFilterOpen ? "d-block" : "d-none"} d-lg-block mb-4`}>
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title fw-bold mb-0">Filter Courses</h5>
                {(resolvedCategory || searchTerm || selectedLevel !== "all" || freeOnly) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                    onClick={resetFilters}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-3">
                <label htmlFor="searchCourses" className="form-label small fw-semibold">
                  Search
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted small" />
                  </span>
                  <input
                    id="searchCourses"
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Topic, title or author..."
                    value={searchTerm}
                    onChange={(event) => {
                      setCurrentPage(1);
                      const term = event.target.value;
                      setSearchTerm(term);
                      const nextParams = new URLSearchParams(searchParams);
                      if (term) nextParams.set("search", term);
                      else nextParams.delete("search");
                      setSearchParams(nextParams);
                    }}
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="mb-3">
                <label htmlFor="categoryFilter" className="form-label small fw-semibold">
                  Category
                </label>
                <select
                  id="categoryFilter"
                  className="form-select"
                  value={resolvedCategory || selectedCategory}
                  onChange={(event) => handleCategorySelect(event.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Dropdown */}
              <div className="mb-3">
                <label htmlFor="levelFilter" className="form-label small fw-semibold">
                  Difficulty Level
                </label>
                <select
                  id="levelFilter"
                  className="form-select"
                  value={selectedLevel}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSelectedLevel(event.target.value);
                  }}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Free Only Checkbox */}
              <div className="form-check mb-4">
                <input
                  id="freeOnly"
                  type="checkbox"
                  className="form-check-input"
                  checked={freeOnly}
                  onChange={(event) => {
                    setCurrentPage(1);
                    const checked = event.target.checked;
                    setFreeOnly(checked);
                    const nextParams = new URLSearchParams(searchParams);
                    if (checked) nextParams.set("price", "free");
                    else nextParams.delete("price");
                    setSearchParams(nextParams);
                  }}
                />
                <label htmlFor="freeOnly" className="form-check-label small">
                  Free courses only
                </label>
              </div>

              <button
                className="btn btn-outline-secondary w-100 rounded-pill btn-sm"
                type="button"
                onClick={resetFilters}
              >
                <i className="fas fa-rotate-left me-1" /> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Right Courses Grid */}
        <div className="col-lg-9">
          {/* Active Category Filter Pill Banner */}
          {resolvedCategory && (
            <div className="alert alert-primary bg-primary bg-opacity-10 border-0 d-flex align-items-center justify-content-between py-2 px-3 mb-3 rounded-pill">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-filter text-primary" />
                <span className="small text-dark">
                  Category: <strong>{resolvedCategory}</strong>
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-primary text-decoration-none p-0 fw-bold"
                onClick={() => handleCategorySelect("")}
              >
                Clear &times;
              </button>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <p className="mb-0 text-muted small">
              Showing <strong>{courses.length}</strong> of <strong>{pagination.total}</strong> course
              {pagination.total === 1 ? "" : "s"}
              {resolvedCategory && <span> in <strong>{resolvedCategory}</strong></span>}
            </p>

            <div className="d-flex align-items-center gap-2">
              <small className="text-muted text-nowrap">Sort by:</small>
              <select
                className="form-select form-select-sm w-auto rounded-pill"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="newest">Newest</option>
                <option value="students">Most Enrolled</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading courses...</span>
              </div>
              <p className="mt-3 text-muted">Finding courses...</p>
            </div>
          ) : (
            <>
              <div className="row">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <CourseCard key={course.id} course={course} columnClass="col-md-6 col-xl-4 mb-4" />
                  ))
                ) : (
                  <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                      <i className="fas fa-folder-open fa-3x mb-3 text-muted opacity-50" />
                      <h5 className="fw-bold text-dark mb-1">No courses found</h5>
                      <p className="small mb-3">
                        {resolvedCategory
                          ? `There are currently no courses published under "${resolvedCategory}".`
                          : "No courses matched your filters."}
                      </p>
                      <div>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm rounded-pill px-4"
                          onClick={resetFilters}
                        >
                          View All Courses
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav aria-label="Courses pagination" className="mt-5">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      return (
                        <li
                          key={page}
                          className={`page-item ${currentPage === page ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            type="button"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
