// Course Filtering and Search Functionality
// This file handles all filtering, searching, and sorting of courses

document.addEventListener("DOMContentLoaded", function () {
  console.log("Course Filter initialized");

  // Initialize course filtering system
  initCourseFiltering();

  // Load all courses
  loadAllCourses();

  // Initialize search functionality
  initSearch();

  // Initialize sorting
  initSorting();
});

// ===== INITIALIZE COURSE FILTERING =====
function initCourseFiltering() {
  // Get all filter elements
  const categoryCheckboxes = document.querySelectorAll(
    'input[name="category"]'
  );
  const levelRadios = document.querySelectorAll('input[name="level"]');
  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  const freeCoursesCheckbox = document.getElementById("freeCourses");
  const applyFiltersBtn = document.querySelector('.btn-primary[type="button"]');
  const resetFiltersBtn = document.querySelector(".btn-outline-secondary");

  // Update price range display
  if (priceRange && priceValue) {
    priceRange.addEventListener("input", function () {
      priceValue.textContent = `$${this.value}`;
    });
  }

  // Apply filters when button is clicked
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters);
  }

  // Apply filters when any filter changes (auto-apply)
  categoryCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters);
  });

  levelRadios.forEach((radio) => {
    radio.addEventListener("change", applyFilters);
  });

  if (priceRange) {
    priceRange.addEventListener("change", applyFilters);
  }

  if (freeCoursesCheckbox) {
    freeCoursesCheckbox.addEventListener("change", applyFilters);
  }

  // Reset filters
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetFilters);
  }
}

// ===== LOAD ALL COURSES =====
function loadAllCourses() {
  const coursesContainer = document.getElementById("coursesGrid");
  if (!coursesContainer) return;

  // Sample course data (in real app, this would come from an API)
  const courses = [
    {
      id: 1,
      title: "Web Development Bootcamp 2024",
      instructor: "Sarah Johnson",
      rating: 4.8,
      reviews: 1247,
      duration: "42 hours",
      lectures: 320,
      level: "Beginner",
      price: 89.99,
      discountPrice: 64.99,
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Web Development",
      isFeatured: true,
      isFree: false,
      students: 8500,
    },
    {
      id: 2,
      title: "Data Science & Machine Learning",
      instructor: "Dr. Michael Chen",
      rating: 4.9,
      reviews: 892,
      duration: "56 hours",
      lectures: 420,
      level: "Intermediate",
      price: 99.99,
      discountPrice: 74.99,
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Data Science",
      isFeatured: true,
      isFree: false,
      students: 5600,
    },
    {
      id: 3,
      title: "Digital Marketing Masterclass",
      instructor: "Alex Rodriguez",
      rating: 4.7,
      reviews: 654,
      duration: "38 hours",
      lectures: 280,
      level: "All Levels",
      price: 79.99,
      discountPrice: 59.99,
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Marketing",
      isFeatured: true,
      isFree: false,
      students: 4200,
    },
    {
      id: 4,
      title: "Mobile App Development with React Native",
      instructor: "Maria Gonzalez",
      rating: 4.6,
      reviews: 523,
      duration: "35 hours",
      lectures: 240,
      level: "Intermediate",
      price: 74.99,
      discountPrice: 54.99,
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Mobile Development",
      isFeatured: false,
      isFree: false,
      students: 3200,
    },
    {
      id: 5,
      title: "Python for Beginners",
      instructor: "David Wilson",
      rating: 4.5,
      reviews: 987,
      duration: "28 hours",
      lectures: 180,
      level: "Beginner",
      price: 0,
      discountPrice: 0,
      image:
        "https://images.unsplash.com/photo-1526379879527-8559ecfcaec5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Programming",
      isFeatured: false,
      isFree: true,
      students: 12500,
    },
    {
      id: 6,
      title: "UI/UX Design Fundamentals",
      instructor: "Emma Thompson",
      rating: 4.8,
      reviews: 432,
      duration: "32 hours",
      lectures: 210,
      level: "Beginner",
      price: 69.99,
      discountPrice: 49.99,
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Design",
      isFeatured: false,
      isFree: false,
      students: 3800,
    },
    {
      id: 7,
      title: "Business Analytics & Excel",
      instructor: "Robert Kim",
      rating: 4.4,
      reviews: 321,
      duration: "24 hours",
      lectures: 150,
      level: "Beginner",
      price: 59.99,
      discountPrice: 39.99,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Business",
      isFeatured: false,
      isFree: false,
      students: 2700,
    },
    {
      id: 8,
      title: "Advanced JavaScript Patterns",
      instructor: "Kevin Patel",
      rating: 4.9,
      reviews: 289,
      duration: "45 hours",
      lectures: 310,
      level: "Advanced",
      price: 89.99,
      discountPrice: 69.99,
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Web Development",
      isFeatured: false,
      isFree: false,
      students: 1900,
    },
    {
      id: 9,
      title: "Cybersecurity Fundamentals",
      instructor: "Lisa Anderson",
      rating: 4.7,
      reviews: 198,
      duration: "40 hours",
      lectures: 280,
      level: "Intermediate",
      price: 94.99,
      discountPrice: 74.99,
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Security",
      isFeatured: false,
      isFree: false,
      students: 2100,
    },
    {
      id: 10,
      title: "Graphic Design with Adobe Suite",
      instructor: "Tom Harris",
      rating: 4.6,
      reviews: 456,
      duration: "50 hours",
      lectures: 350,
      level: "All Levels",
      price: 84.99,
      discountPrice: 64.99,
      image:
        "https://images.unsplash.com/photo-1561070791-4c9b95a9e2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Design",
      isFeatured: false,
      isFree: false,
      students: 3100,
    },
    {
      id: 11,
      title: "Cloud Computing with AWS",
      instructor: "Sophia Martinez",
      rating: 4.8,
      reviews: 367,
      duration: "48 hours",
      lectures: 320,
      level: "Intermediate",
      price: 99.99,
      discountPrice: 79.99,
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Cloud",
      isFeatured: false,
      isFree: false,
      students: 2900,
    },
    {
      id: 12,
      title: "Project Management Professional (PMP)",
      instructor: "James Wilson",
      rating: 4.5,
      reviews: 512,
      duration: "36 hours",
      lectures: 240,
      level: "All Levels",
      price: 89.99,
      discountPrice: 69.99,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: "Business",
      isFeatured: false,
      isFree: false,
      students: 3400,
    },
  ];

  // Store courses in global variable for filtering
  window.allCourses = courses;

  // Display initial courses
  displayCourses(courses);
}

// ===== DISPLAY COURSES =====
function displayCourses(courses) {
  const coursesContainer = document.getElementById("coursesGrid");
  if (!coursesContainer) return;

  let coursesHTML = "";

  if (courses.length === 0) {
    coursesHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-search fa-4x text-muted mb-4"></i>
            <h3 class="text-muted">No courses found</h3>
            <p class="text-muted">Try adjusting your filters or search terms</p>
            <button class="btn btn-primary mt-3" onclick="resetFilters()">Reset All Filters</button>
        </div>
        `;
  } else {
    courses.forEach((course) => {
      const discountPercentage =
        course.discountPrice && course.price > 0
          ? Math.round(
              ((course.price - course.discountPrice) / course.price) * 100
            )
          : 0;

      coursesHTML += `
            <div class="col-lg-4 col-md-6 mb-4 course-card-item" 
                 data-category="${course.category
                   .toLowerCase()
                   .replace(" ", "-")}"
                 data-level="${course.level.toLowerCase()}"
                 data-price="${course.discountPrice || course.price}"
                 data-free="${course.isFree}">
                <div class="card course-card h-100 shadow-sm">
                    <div class="position-relative">
                        <img src="${
                          course.image
                        }" class="card-img-top course-img" alt="${
        course.title
      }" loading="lazy">
                        <span class="course-badge">${course.category}</span>
                        ${
                          discountPercentage > 0
                            ? `
                            <span class="position-absolute bottom-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded">
                                ${discountPercentage}% OFF
                            </span>
                        `
                            : ""
                        }
                        ${
                          course.isFree
                            ? `
                            <span class="position-absolute top-0 start-0 bg-success text-white px-2 py-1 m-2 rounded">
                                FREE
                            </span>
                        `
                            : ""
                        }
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="mb-2">
                            <span class="badge bg-light text-dark me-1">${
                              course.level
                            }</span>
                            ${
                              course.isFeatured
                                ? '<span class="badge bg-warning text-dark"><i class="fas fa-star me-1"></i>Featured</span>'
                                : ""
                            }
                        </div>
                        <h5 class="card-title fw-bold">${course.title}</h5>
                        <p class="text-muted small mb-2">By ${
                          course.instructor
                        }</p>
                        
                        <div class="d-flex align-items-center mb-3">
                            <div class="course-rating me-2">
                                ${generateStarRating(course.rating)}
                            </div>
                            <span class="text-muted small">(${course.reviews.toLocaleString()})</span>
                        </div>
                        
                        <div class="course-meta d-flex justify-content-between mb-3">
                            <span><i class="far fa-clock"></i> ${
                              course.duration
                            }</span>
                            <span><i class="far fa-play-circle"></i> ${
                              course.lectures
                            } lectures</span>
                            <span><i class="fas fa-users"></i> ${course.students.toLocaleString()}</span>
                        </div>
                        
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <div>
                                ${
                                  course.isFree
                                    ? `
                                    <span class="course-price text-success fw-bold">FREE</span>
                                `
                                    : course.discountPrice
                                    ? `
                                    <span class="text-decoration-line-through text-muted me-2">$${course.price.toFixed(
                                      2
                                    )}</span>
                                    <span class="course-price text-dark fw-bold">$${course.discountPrice.toFixed(
                                      2
                                    )}</span>
                                `
                                    : `
                                    <span class="course-price text-dark fw-bold">$${course.price.toFixed(
                                      2
                                    )}</span>
                                `
                                }
                            </div>
                            <a href="course-single.html?id=${
                              course.id
                            }" class="btn btn-primary btn-sm">
                                <i class="fas fa-shopping-cart me-1"></i> Enroll
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            `;
    });
  }

  coursesContainer.innerHTML = coursesHTML;

  // Update course count
  updateCourseCount(courses.length);

  // Add click handlers to course cards
  document.querySelectorAll(".course-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (!e.target.closest(".btn") && !e.target.closest(".course-badge")) {
        const link = this.querySelector("a.btn");
        if (link) window.location.href = link.href;
      }
    });
  });
}

// ===== GENERATE STAR RATING =====
function generateStarRating(rating) {
  let stars = "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += '<i class="fas fa-star text-warning"></i>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    } else {
      stars += '<i class="far fa-star text-warning"></i>';
    }
  }

  return stars;
}

// ===== APPLY FILTERS =====
function applyFilters() {
  if (!window.allCourses) return;

  // Get selected filters
  const selectedCategories = [];
  document.querySelectorAll('input[name="category"]:checked').forEach((cb) => {
    selectedCategories.push(cb.value.toLowerCase().replace(" ", "-"));
  });

  const selectedLevel = document.querySelector('input[name="level"]:checked');
  const levelValue = selectedLevel
    ? selectedLevel.value.toLowerCase()
    : "all levels";

  const priceRange = document.getElementById("priceRange");
  const maxPrice = priceRange ? parseFloat(priceRange.value) : 200;

  const freeCoursesOnly = document.getElementById("freeCourses");
  const freeOnly = freeCoursesOnly ? freeCoursesOnly.checked : false;

  // Filter courses
  const filteredCourses = window.allCourses.filter((course) => {
    // Category filter
    if (selectedCategories.length > 0) {
      const courseCategory = course.category.toLowerCase().replace(" ", "-");
      if (!selectedCategories.includes(courseCategory)) {
        return false;
      }
    }

    // Level filter
    if (
      levelValue !== "all levels" &&
      course.level.toLowerCase() !== levelValue
    ) {
      return false;
    }

    // Price filter
    const coursePrice = course.discountPrice || course.price;
    if (coursePrice > maxPrice) {
      return false;
    }

    // Free courses filter
    if (freeOnly && !course.isFree) {
      return false;
    }

    return true;
  });

  // Apply current sort
  const sortSelect = document.querySelector("select");
  const sortBy = sortSelect ? sortSelect.value : "Most Popular";
  const sortedCourses = sortCourses(filteredCourses, sortBy);

  // Display filtered courses
  displayCourses(sortedCourses);

  // Show filter summary
  showFilterSummary(
    selectedCategories,
    levelValue,
    maxPrice,
    freeOnly,
    filteredCourses.length
  );
}

// ===== RESET FILTERS =====
function resetFilters() {
  // Uncheck all category checkboxes
  document.querySelectorAll('input[name="category"]').forEach((cb) => {
    cb.checked = false;
  });

  // Reset level to "All Levels"
  const levelAll = document.getElementById("levelAll");
  if (levelAll) levelAll.checked = true;

  // Reset price range
  const priceRange = document.getElementById("priceRange");
  if (priceRange) {
    priceRange.value = 200;
    const priceValue = document.getElementById("priceValue");
    if (priceValue) priceValue.textContent = "$200";
  }

  // Uncheck free courses
  const freeCourses = document.getElementById("freeCourses");
  if (freeCourses) freeCourses.checked = false;

  // Reset search
  const searchInput = document.querySelector('input[type="text"]');
  if (searchInput) searchInput.value = "";

  // Reset sort
  const sortSelect = document.querySelector("select");
  if (sortSelect) sortSelect.value = "Most Popular";

  // Apply reset filters
  applyFilters();

  // Show notification
  showNotification("All filters have been reset", "info");
}

// ===== INITIALIZE SEARCH =====
function initSearch() {
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('.btn-primary[type="button"]');

  if (searchInput) {
    // Search on Enter key
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        performSearch(this.value);
      }
    });

    // Search on input (with debounce)
    let searchTimeout;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(this.value);
      }, 500);
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", function () {
      const searchInput = document.querySelector('input[type="text"]');
      if (searchInput) {
        performSearch(searchInput.value);
      }
    });
  }
}

// ===== PERFORM SEARCH =====
function performSearch(searchTerm) {
  if (!window.allCourses) return;

  if (!searchTerm.trim()) {
    // If search is empty, show all courses with current filters
    applyFilters();
    return;
  }

  const term = searchTerm.toLowerCase().trim();

  const filteredCourses = window.allCourses.filter((course) => {
    // Search in title
    if (course.title.toLowerCase().includes(term)) return true;

    // Search in instructor name
    if (course.instructor.toLowerCase().includes(term)) return true;

    // Search in category
    if (course.category.toLowerCase().includes(term)) return true;

    // Search in level
    if (course.level.toLowerCase().includes(term)) return true;

    return false;
  });

  // Apply current sort
  const sortSelect = document.querySelector("select");
  const sortBy = sortSelect ? sortSelect.value : "Most Popular";
  const sortedCourses = sortCourses(filteredCourses, sortBy);

  displayCourses(sortedCourses);

  // Show search results summary
  const resultsCount = document.querySelector(".container .row .col-12 p");
  if (resultsCount && filteredCourses.length > 0) {
    resultsCount.innerHTML = `Showing <strong>${filteredCourses.length}</strong> results for "<strong>${searchTerm}</strong>"`;
  }
}

// ===== INITIALIZE SORTING =====
function initSorting() {
  const sortSelect = document.querySelector("select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      applyFilters();
    });
  }
}

// ===== SORT COURSES =====
function sortCourses(courses, sortBy) {
  const sortedCourses = [...courses];

  switch (sortBy) {
    case "Highest Rated":
      sortedCourses.sort((a, b) => b.rating - a.rating);
      break;

    case "Newest":
      // Assuming newer courses have higher IDs
      sortedCourses.sort((a, b) => b.id - a.id);
      break;

    case "Price: Low to High":
      sortedCourses.sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        return priceA - priceB;
      });
      break;

    case "Price: High to Low":
      sortedCourses.sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        return priceB - priceA;
      });
      break;

    case "Most Popular":
    default:
      sortedCourses.sort((a, b) => b.students - a.students);
      break;
  }

  return sortedCourses;
}

// ===== UPDATE COURSE COUNT =====
function updateCourseCount(count) {
  const countElement = document.querySelector(".container .row .col-12 p");
  if (countElement) {
    countElement.innerHTML = `Showing <strong>${count}</strong> of <strong>${window.allCourses.length}</strong> courses`;
  }
}

// ===== SHOW FILTER SUMMARY =====
function showFilterSummary(categories, level, maxPrice, freeOnly, resultCount) {
  // Create or update filter summary element
  let summaryElement = document.getElementById("filterSummary");

  if (!summaryElement) {
    summaryElement = document.createElement("div");
    summaryElement.id = "filterSummary";
    summaryElement.className = "alert alert-info mb-4";

    const container = document.querySelector(".container .row .col-lg-9");
    if (container) {
      container.insertBefore(summaryElement, container.firstChild);
    }
  }

  // Build summary text
  let summaryText = `<strong>${resultCount} courses</strong> found with filters: `;
  const filters = [];

  if (categories.length > 0) {
    const categoryNames = categories.map((cat) =>
      cat
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
    filters.push(`Category: ${categoryNames.join(", ")}`);
  }

  if (level !== "all levels") {
    filters.push(`Level: ${level.charAt(0).toUpperCase() + level.slice(1)}`);
  }

  if (maxPrice < 200) {
    filters.push(`Max price: $${maxPrice}`);
  }

  if (freeOnly) {
    filters.push("Free courses only");
  }

  if (filters.length > 0) {
    summaryText += filters.join(" • ");
    summaryElement.innerHTML = `
            ${summaryText}
            <button class="btn btn-sm btn-outline-info float-end" onclick="resetFilters()">
                Clear All
            </button>
        `;
    summaryElement.classList.remove("d-none");
  } else {
    summaryElement.classList.add("d-none");
  }
}

// ===== SHOW NOTIFICATION =====
function showNotification(message, type = "info") {
  // Remove existing notification
  const existingNotification = document.querySelector(".filter-notification");
  if (existingNotification) existingNotification.remove();

  // Create notification
  const notification = document.createElement("div");
  notification.className = `filter-notification alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

// ===== ENHANCE CHECKBOXES AND RADIOS =====
function enhanceFilterUI() {
  // Add custom styling to checkboxes and radios
  const checkboxes = document.querySelectorAll(".form-check-input");
  checkboxes.forEach((checkbox) => {
    // Add custom class for styling
    checkbox.parentElement.classList.add("custom-control");

    // Add visual feedback on change
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        this.parentElement.classList.add("active-filter");
      } else {
        this.parentElement.classList.remove("active-filter");
      }
    });
  });
}

// ===== PAGINATION FUNCTIONS =====
function setupPagination(totalCourses, coursesPerPage = 6) {
  const totalPages = Math.ceil(totalCourses / coursesPerPage);

  // Generate pagination HTML
  let paginationHTML = `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item disabled" id="prevPage">
                    <a class="page-link" href="#" tabindex="-1">Previous</a>
                </li>
    `;

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
            <li class="page-item ${i === 1 ? "active" : ""}" data-page="${i}">
                <a class="page-link" href="#">${i}</a>
            </li>
        `;
  }

  paginationHTML += `
                <li class="page-item" id="nextPage">
                    <a class="page-link" href="#">Next</a>
                </li>
            </ul>
        </nav>
    `;

  // Insert pagination
  const coursesGrid = document.getElementById("coursesGrid");
  if (coursesGrid) {
    coursesGrid.insertAdjacentHTML("afterend", paginationHTML);

    // Add event listeners
    setupPaginationEvents(coursesPerPage);
  }
}

function setupPaginationEvents(coursesPerPage) {
  const pageItems = document.querySelectorAll(".page-item[data-page]");
  let currentPage = 1;

  pageItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all pages
      pageItems.forEach((page) => page.classList.remove("active"));

      // Add active class to clicked page
      this.classList.add("active");
      currentPage = parseInt(this.getAttribute("data-page"));

      // Show courses for this page
      showPage(currentPage, coursesPerPage);

      // Update prev/next buttons
      updatePaginationButtons(currentPage, pageItems.length);
    });
  });

  // Previous button
  const prevBtn = document.getElementById("prevPage");
  if (prevBtn) {
    prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (currentPage > 1) {
        const prevPage = document.querySelector(
          `.page-item[data-page="${currentPage - 1}"]`
        );
        if (prevPage) prevPage.click();
      }
    });
  }

  // Next button
  const nextBtn = document.getElementById("nextPage");
  if (nextBtn) {
    nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (currentPage < pageItems.length) {
        const nextPage = document.querySelector(
          `.page-item[data-page="${currentPage + 1}"]`
        );
        if (nextPage) nextPage.click();
      }
    });
  }
}

function showPage(pageNumber, coursesPerPage) {
  if (!window.allCourses) return;

  const startIndex = (pageNumber - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const pageCourses = window.allCourses.slice(startIndex, endIndex);

  displayCourses(pageCourses);
}

function updatePaginationButtons(currentPage, totalPages) {
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (prevBtn) {
    if (currentPage === 1) {
      prevBtn.classList.add("disabled");
    } else {
      prevBtn.classList.remove("disabled");
    }
  }

  if (nextBtn) {
    if (currentPage === totalPages) {
      nextBtn.classList.add("disabled");
    } else {
      nextBtn.classList.remove("disabled");
    }
  }
}

// ===== INITIALIZE ON PAGE LOAD =====
function initializeCoursePage() {
  // Add CSS for active filters
  const style = document.createElement("style");
  style.textContent = `
        .active-filter {
            background-color: rgba(67, 97, 238, 0.1) !important;
            border-radius: 5px;
            padding: 5px 10px;
        }
        .filter-notification {
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .course-card {
            transition: all 0.3s ease;
        }
        .course-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .form-check-input:checked {
            background-color: #4361ee;
            border-color: #4361ee;
        }
    `;
  document.head.appendChild(style);

  // Enhance UI
  enhanceFilterUI();

  // Show initial notification
  setTimeout(() => {
    showNotification("Use filters to find your perfect course!", "info");
  }, 1000);
}

// Run initialization when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCoursePage);
} else {
  initializeCoursePage();
}

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.CourseFilter = {
  applyFilters,
  resetFilters,
  performSearch,
  showNotification,
};
