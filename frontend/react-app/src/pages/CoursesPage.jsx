import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/common/CourseCard";
import { api } from "../services/api";
import { normalizeCourse } from "../utils/courseAdapter";
import { slugifyCategory } from "../utils/format";

const PAGE_SIZE = 6;

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialFreeOnly = searchParams.get("price") === "free";

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [freeOnly, setFreeOnly] = useState(initialFreeOnly);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const data = await api.listCourses();
        setCourses((data.courses || []).map(normalizeCourse));
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(courses.map((course) => course.category).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const resolvedCategory = useMemo(() => {
    if (!selectedCategory) return "";

    return (
      categories.find((category) => slugifyCategory(category) === selectedCategory) ||
      categories.find((category) => category === selectedCategory) ||
      ""
    );
  }, [categories, selectedCategory]);

  const filteredCourses = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    const result = courses.filter((course) => {
      const matchesSearch =
        !lowerSearch ||
        course.title.toLowerCase().includes(lowerSearch) ||
        course.instructor.toLowerCase().includes(lowerSearch) ||
        course.category.toLowerCase().includes(lowerSearch);

      const matchesCategory = !resolvedCategory || course.category === resolvedCategory;
      const matchesLevel =
        selectedLevel === "all" || course.level.toLowerCase() === selectedLevel.toLowerCase();
      const matchesPrice = freeOnly ? course.isFree : true;

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") return a.effectivePrice - b.effectivePrice;
      if (sortBy === "price-high") return b.effectivePrice - a.effectivePrice;
      if (sortBy === "students") return b.enrolledStudents - a.enrolledStudents;
      return Number(b.id) - Number(a.id);
    });
  }, [courses, freeOnly, resolvedCategory, searchTerm, selectedLevel, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCourses]);

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
              Showing <strong>{filteredCourses.length}</strong> course
              {filteredCourses.length === 1 ? "" : "s"}
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
                {paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course) => <CourseCard key={course.id} course={course} />)
                ) : (
                  <div className="col-12">
                    <div className="alert alert-light border">
                      No courses matched your filters. Try broadening the search or reset filters.
                    </div>
                  </div>
                )}
              </div>

              {filteredCourses.length > PAGE_SIZE && (
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
