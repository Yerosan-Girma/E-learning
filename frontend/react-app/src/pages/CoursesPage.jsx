import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/common/CourseCard";
import { COURSES, COURSE_CATEGORIES } from "../data/courses";
import { slugifyCategory } from "../utils/format";

const PAGE_SIZE = 6;

function getInitialCategoryFilters(searchParams) {
  const categorySlug = searchParams.get("category");
  if (!categorySlug) return [];

  const matched = COURSE_CATEGORIES.find((category) => slugifyCategory(category) === categorySlug);
  return matched ? [matched] : [];
}

export default function CoursesPage() {
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(() => getInitialCategoryFilters(searchParams));
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [maxPrice, setMaxPrice] = useState(100);
  const [freeOnly, setFreeOnly] = useState(searchParams.get("price") === "free");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const categoryCounts = useMemo(() => {
    const counts = {};
    COURSE_CATEGORIES.forEach((category) => {
      counts[category] = COURSES.filter((course) => course.category === category).length;
    });
    return counts;
  }, []);

  const filteredCourses = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    const result = COURSES.filter((course) => {
      const effectivePrice = course.discountPrice || course.price;

      const matchesSearch =
        !lowerSearch ||
        course.title.toLowerCase().includes(lowerSearch) ||
        course.instructor.toLowerCase().includes(lowerSearch) ||
        course.category.toLowerCase().includes(lowerSearch);

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(course.category);

      const matchesLevel =
        selectedLevel === "all" || course.level.toLowerCase() === selectedLevel;

      const matchesPrice = freeOnly ? course.isFree : effectivePrice <= maxPrice;

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    const sorted = [...result].sort((a, b) => {
      const aPrice = a.discountPrice || a.price;
      const bPrice = b.discountPrice || b.price;

      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return b.id - a.id;
        case "price-low":
          return aPrice - bPrice;
        case "price-high":
          return bPrice - aPrice;
        case "popular":
        default:
          return b.students - a.students;
      }
    });

    return sorted;
  }, [freeOnly, maxPrice, searchTerm, selectedCategories, selectedLevel, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCourses]);

  const toggleCategory = (category) => {
    setCurrentPage(1);

    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }

      return [...prev, category];
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedLevel("all");
    setMaxPrice(100);
    setFreeOnly(false);
    setSortBy("popular");
    setCurrentPage(1);
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="fw-bold mb-3">Explore Our Courses</h1>
          <p className="text-muted">Browse {COURSES.length}+ practical courses across multiple categories</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Filter Courses</h5>

              <div className="mb-4">
                <label htmlFor="searchCourses" className="form-label">
                  Search
                </label>
                <div className="input-group">
                  <input
                    id="searchCourses"
                    type="text"
                    className="form-control"
                    placeholder="Course name..."
                    value={searchTerm}
                    onChange={(event) => {
                      setCurrentPage(1);
                      setSearchTerm(event.target.value);
                    }}
                  />
                  <button className="btn btn-primary" type="button">
                    <i className="fas fa-search" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Categories</label>
                {COURSE_CATEGORIES.map((category) => (
                  <div className="form-check mb-2" key={category}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`cat-${slugifyCategory(category)}`}
                      name="category"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <label className="form-check-label" htmlFor={`cat-${slugifyCategory(category)}`}>
                      {category} ({categoryCounts[category]})
                    </label>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Level</label>
                {["all", "beginner", "intermediate", "advanced"].map((level) => (
                  <div className="form-check mb-2" key={level}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="level"
                      id={`level-${level}`}
                      checked={selectedLevel === level}
                      onChange={() => {
                        setCurrentPage(1);
                        setSelectedLevel(level);
                      }}
                    />
                    <label className="form-check-label text-capitalize" htmlFor={`level-${level}`}>
                      {level === "all" ? "All Levels" : level}
                    </label>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label htmlFor="priceRange" className="form-label fw-bold">
                  Price
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="200"
                  id="priceRange"
                  value={maxPrice}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setMaxPrice(Number(event.target.value));
                  }}
                />
                <div className="d-flex justify-content-between">
                  <span>$0</span>
                  <span>${maxPrice}</span>
                </div>

                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="freeCourses"
                    checked={freeOnly}
                    onChange={(event) => {
                      setCurrentPage(1);
                      setFreeOnly(event.target.checked);
                    }}
                  />
                  <label className="form-check-label" htmlFor="freeCourses">
                    Free Courses Only
                  </label>
                </div>
              </div>

              <button className="btn btn-primary w-100" type="button" onClick={() => setCurrentPage(1)}>
                Apply Filters
              </button>
              <button className="btn btn-outline-secondary w-100 mt-2" type="button" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Popular Categories</h5>
              <div className="list-group list-group-flush">
                {COURSE_CATEGORIES.slice(0, 5).map((category) => (
                  <button
                    key={`popular-${category}`}
                    type="button"
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    onClick={() => {
                      setSelectedCategories([category]);
                      setCurrentPage(1);
                    }}
                  >
                    {category}
                    <span className="badge bg-primary rounded-pill">{categoryCounts[category]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <p className="mb-0">
              Showing <strong>{filteredCourses.length}</strong> of <strong>{COURSES.length}</strong> courses
            </p>
            <div className="d-flex align-items-center">
              <label htmlFor="sortBy" className="me-2 mb-0">
                Sort by:
              </label>
              <select
                id="sortBy"
                className="form-select w-auto"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="row" id="coursesGrid">
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((course) => <CourseCard key={course.id} course={course} />)
            ) : (
              <div className="col-12 text-center py-5">
                <i className="fas fa-search fa-4x text-muted mb-4" />
                <h3 className="text-muted">No courses found</h3>
                <p className="text-muted">Try adjusting your filters or search terms</p>
                <button className="btn btn-primary mt-3" type="button" onClick={resetFilters}>
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {filteredCourses.length > PAGE_SIZE && (
            <nav aria-label="Page navigation" className="mt-5">
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
        </div>
      </div>
    </div>
  );
}
