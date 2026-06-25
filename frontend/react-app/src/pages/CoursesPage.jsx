import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/common/CourseCard";
import { api } from "../services/api";
import { normalizeCourse } from "../utils/courseAdapter";
import { slugifyCategory, deslugifyCategory } from "../utils/format";

const PAGE_SIZE = 6;

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialFreeOnly = searchParams.get("price") === "free";

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [freeOnly, setFreeOnly] = useState(initialFreeOnly);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Fetch categories independently
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await api.listCourses({ limit: 100 });
        const uniqueCategories = new Set(data.courses?.map((course) => course.category).filter(Boolean));
        const fetchedCategories = Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const resolvedCategory = useMemo(() => {
    if (!selectedCategory) return "";

    // Try deslugifying first
    const deslugified = deslugifyCategory(selectedCategory);
    if (categories.includes(deslugified)) return deslugified;

    // Then try exact match
    if (categories.includes(selectedCategory)) return selectedCategory;

    // Finally try slugified match
    const matchedBySlug = categories.find((category) => slugifyCategory(category) === selectedCategory);
    if (matchedBySlug) return matchedBySlug;

    return "";
  }, [categories, selectedCategory]);

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
        if (selectedLevel !== 'all') params.level = selectedLevel;
        if (freeOnly) params.maxPrice = 0;
        
        // Map sortBy to backend parameters
        if (sortBy === 'newest') {
          params.sortBy = 'created_at';
          params.sortOrder = 'DESC';
        } else if (sortBy === 'students') {
          params.sortBy = 'total_students';
          params.sortOrder = 'DESC';
        } else if (sortBy === 'price-low') {
          params.sortBy = 'price';
          params.sortOrder = 'ASC';
        } else if (sortBy === 'price-high') {
          params.sortBy = 'price';
          params.sortOrder = 'DESC';
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

  // Server-side filtering is now used, so no need for client-side filtering
  const totalPages = pagination.totalPages;

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedLevel("all");
    setFreeOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold mb-2">Explore Courses</h1>
          <p className="text-muted mb-0">
            Browse free and premium courses, then enroll instantly or complete a simulated payment
            to unlock premium content.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Filter Courses</h5>

              <div className="mb-3">
                <label htmlFor="searchCourses" className="form-label">
                  Search
                </label>
                <input
                  id="searchCourses"
                  type="text"
                  className="form-control"
                  placeholder="Course name or instructor"
                  value={searchTerm}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSearchTerm(event.target.value);
                  }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="categoryFilter" className="form-label">
                  Category
                </label>
                <select
                  id="categoryFilter"
                  className="form-select"
                  value={selectedCategory}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSelectedCategory(event.target.value);
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={slugifyCategory(category)}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="levelFilter" className="form-label">
                  Level
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
                  <option value="all levels">All Levels</option>
                </select>
              </div>

              <div className="form-check mb-4">
                <input
                  id="freeOnly"
                  type="checkbox"
                  className="form-check-input"
                  checked={freeOnly}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setFreeOnly(event.target.checked);
                  }}
                />
                <label htmlFor="freeOnly" className="form-check-label">
                  Free courses only
                </label>
              </div>

              <button className="btn btn-outline-secondary w-100" type="button" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <p className="mb-0">
              Showing <strong>{courses.length}</strong> of <strong>{pagination.total}</strong> course
              {pagination.total === 1 ? "" : "s"}
            </p>

            <select
              className="form-select w-auto"
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

          {loading ? (
            <div className="alert alert-info">Loading courses...</div>
          ) : (
            <>
              <div className="row">
                {courses.length > 0 ? (
                  courses.map((course) => <CourseCard key={course.id} course={course} />)
                ) : (
                  <div className="col-12">
                    <div className="alert alert-light border">
                      No courses matched your filters. Try broadening the search or reset filters.
                    </div>
                  </div>
                )}
              </div>

              {pagination.totalPages > 1 && (
                <nav aria-label="Courses pagination" className="mt-4">
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
                        <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                          <button className="page-link" type="button" onClick={() => setCurrentPage(page)}>
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
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
