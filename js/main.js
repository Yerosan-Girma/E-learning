// Main JavaScript File for EduLearn Platform
// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("EduLearn Platform loaded");

  // Initialize navbar first
  if (typeof initializeNavbar === "function") {
    initializeNavbar();
  }

  // Initialize all other components
  initStatsCounter();
  loadFeaturedCourses();
  setupModalForms();
  setupCourseFilter();

  // Check if user is logged in (simulated)
  checkLoginStatus();

  // Update navbar login button
  if (typeof updateLoginButton === "function") {
    updateLoginButton();
  }
});
// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("EduLearn Platform loaded");

  // Initialize all components
  initStatsCounter();
  loadFeaturedCourses();
  setupModalForms();
  setupNavbarScroll();
  setupCourseFilter();

  // Check if user is logged in (simulated)
  checkLoginStatus();
});

// ===== ANIMATED STATS COUNTER =====
function initStatsCounter() {
  const counters = document.querySelectorAll(".stats-section h2");
  const speed = 200; // Lower is faster

  counters.forEach((counter) => {
    const updateCount = () => {
      const target = parseInt(
        counter.getAttribute("data-target") ||
          (counter.id === "studentCount"
            ? 50000
            : counter.id === "courseCount"
            ? 1500
            : counter.id === "instructorCount"
            ? 350
            : 120)
      );

      const count = parseInt(counter.innerText);
      const increment = Math.ceil(target / speed);

      if (count < target) {
        counter.innerText = Math.min(
          count + increment,
          target
        ).toLocaleString();
        setTimeout(updateCount, 10);
      }
    };

    // Start counting when element is in viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateCount();
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(counter);
  });
}

// ===== LOAD FEATURED COURSES =====
function loadFeaturedCourses() {
  const coursesContainer = document.getElementById("featuredCourses");
  if (!coursesContainer) return;

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
      category: "Development",
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
    },
  ];

  let coursesHTML = "";

  courses.forEach((course) => {
    const discountPercentage = Math.round(
      ((course.price - course.discountPrice) / course.price) * 100
    );

    coursesHTML += `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card course-card h-100 shadow-sm">
                <div class="position-relative">
                    <img src="${
                      course.image
                    }" class="card-img-top course-img" alt="${course.title}">
                    <span class="course-badge">${course.category}</span>
                    ${
                      course.discountPrice
                        ? `<span class="position-absolute bottom-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded">${discountPercentage}% OFF</span>`
                        : ""
                    }
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="mb-2">
                        <span class="badge bg-light text-dark">${
                          course.level
                        }</span>
                    </div>
                    <h5 class="card-title fw-bold">${course.title}</h5>
                    <p class="text-muted small mb-2">By ${course.instructor}</p>
                    
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
                    </div>
                    
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <div>
                            ${
                              course.discountPrice
                                ? `
                                <span class="text-decoration-line-through text-muted me-2">$${course.price}</span>
                                <span class="course-price text-dark">$${course.discountPrice}</span>
                            `
                                : `<span class="course-price text-dark">$${course.price}</span>`
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

  coursesContainer.innerHTML = coursesHTML;

  // Add click handlers to course cards
  document.querySelectorAll(".course-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (!e.target.closest(".btn")) {
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
      stars += '<i class="fas fa-star"></i>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }

  return stars;
}

// ===== SETUP MODAL FORMS =====
function setupModalForms() {
  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      // Simulate login
      if (email && password) {
        // Store login status in localStorage
        localStorage.setItem("userLoggedIn", "true");
        localStorage.setItem("userEmail", email);

        // Show success message
        showAlert("Login successful! Redirecting...", "success");

        // Redirect after delay
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        showAlert("Please fill in all fields", "danger");
      }
    });
  }

  // Signup Form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validate form
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showAlert("Please fill in all fields", "danger");
        return;
      }

      if (password !== confirmPassword) {
        showAlert("Passwords do not match", "danger");
        return;
      }

      if (password.length < 6) {
        showAlert("Password must be at least 6 characters", "danger");
        return;
      }

      // Simulate signup
      localStorage.setItem("userLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", `${firstName} ${lastName}`);

      showAlert(
        "Account created successfully! Welcome to EduLearn.",
        "success"
      );

      // Close modal and redirect
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("signupModal")
      );
      if (modal) modal.hide();

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
    });
  }
}

// ===== SHOW ALERT MESSAGE =====
function showAlert(message, type = "info") {
  // Remove existing alerts
  const existingAlert = document.querySelector(".alert-dismissible");
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.classList.remove("show");
      setTimeout(() => alertDiv.remove(), 300);
    }
  }, 5000);
}

// ===== NAVBAR SCROLL EFFECT =====
function setupNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      navbar.classList.add("navbar-scrolled");
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
      navbar.style.backdropFilter = "blur(10px)";
    } else {
      navbar.classList.remove("navbar-scrolled");
      navbar.style.backgroundColor = "";
      navbar.style.backdropFilter = "";
    }
  });
}

// ===== CHECK LOGIN STATUS =====
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";

  // Update login button if user is logged in
  const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
  if (loginBtn && isLoggedIn) {
    const userName = localStorage.getItem("userName") || "My Account";
    loginBtn.innerHTML = `<i class="fas fa-user me-2"></i>${
      userName.split(" ")[0]
    }`;
    loginBtn.setAttribute("href", "dashboard.html");
    loginBtn.removeAttribute("data-bs-toggle");
    loginBtn.removeAttribute("data-bs-target");
  }
}

// ===== COURSE FILTER FUNCTIONALITY =====
function setupCourseFilter() {
  const filterForm = document.getElementById("filterForm");
  if (!filterForm) return;

  const categoryCheckboxes = filterForm.querySelectorAll(
    'input[name="category"]'
  );
  const levelRadios = filterForm.querySelectorAll('input[name="level"]');
  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");

  // Update price range display
  if (priceRange && priceValue) {
    priceRange.addEventListener("input", function () {
      priceValue.textContent = `$${this.value}`;
    });
  }

  // Filter courses when form changes
  const filterInputs = [...categoryCheckboxes, ...levelRadios];
  filterInputs.forEach((input) => {
    input.addEventListener("change", filterCourses);
  });

  if (priceRange) {
    priceRange.addEventListener("change", filterCourses);
  }
}

function filterCourses() {
  const activeFilters = {
    categories: [],
    level: "",
    maxPrice: document.getElementById("priceRange")?.value || 100,
  };

  // Get selected categories
  document.querySelectorAll('input[name="category"]:checked').forEach((cb) => {
    activeFilters.categories.push(cb.value);
  });

  // Get selected level
  const selectedLevel = document.querySelector('input[name="level"]:checked');
  if (selectedLevel) {
    activeFilters.level = selectedLevel.value;
  }

  // Filter course cards (this would be more complex with real data)
  console.log("Active filters:", activeFilters);
  // In a real app, you would make an API call or filter client-side data
}

// ===== SAVE COURSE PROGRESS =====
function saveProgress(courseId, lessonId, progress) {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const progressKey = `progress_${userEmail}_${courseId}`;
  let courseProgress = JSON.parse(localStorage.getItem(progressKey)) || {};

  courseProgress[lessonId] = {
    completed: progress.completed || false,
    timestamp: new Date().toISOString(),
    score: progress.score || 0,
  };

  localStorage.setItem(progressKey, JSON.stringify(courseProgress));
  updateProgressBar(courseId);
}

// ===== UPDATE PROGRESS BAR =====
function updateProgressBar(courseId) {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const progressKey = `progress_${userEmail}_${courseId}`;
  const courseProgress = JSON.parse(localStorage.getItem(progressKey)) || {};

  const totalLessons = 10; // This should come from course data
  const completedLessons = Object.values(courseProgress).filter(
    (p) => p.completed
  ).length;
  const percentage = Math.round((completedLessons / totalLessons) * 100);

  // Update progress bar if exists
  const progressBar = document.querySelector(
    `.progress-bar[data-course="${courseId}"]`
  );
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;

    const progressText = progressBar.closest(".progress").nextElementSibling;
    if (progressText && progressText.classList.contains("progress-text")) {
      progressText.textContent = `${completedLessons} of ${totalLessons} lessons completed`;
    }
  }
}

// ===== LOAD USER PROFILE =====
function loadUserProfile() {
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  if (userName) {
    document.querySelectorAll(".user-name").forEach((el) => {
      el.textContent = userName;
    });
  }

  if (userEmail) {
    document.querySelectorAll(".user-email").forEach((el) => {
      el.textContent = userEmail;
    });
  }
}

// ===== LOGOUT FUNCTION =====
function logout() {
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");

  showAlert("Logged out successfully", "info");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// ===== INITIALIZE DASHBOARD =====
function initDashboard() {
  loadUserProfile();

  // Load enrolled courses
  loadEnrolledCourses();

  // Setup logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// ===== LOAD ENROLLED COURSES =====
function loadEnrolledCourses() {
  const container = document.getElementById("enrolledCourses");
  if (!container) return;

  // This would typically come from an API
  const courses = [
    { id: 1, title: "Web Development Bootcamp 2024", progress: 65 },
    { id: 2, title: "JavaScript Advanced Concepts", progress: 30 },
    { id: 3, title: "React & Redux Masterclass", progress: 10 },
  ];

  let html = "";
  courses.forEach((course) => {
    html += `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${course.title}</h5>
                        <div class="d-flex align-items-center">
                            <div class="progress flex-grow-1 me-3" style="height: 8px; width: 200px;">
                                <div class="progress-bar" role="progressbar" style="width: ${course.progress}%"></div>
                            </div>
                            <small class="text-muted">${course.progress}%</small>
                        </div>
                    </div>
                    <a href="learning.html?course=${course.id}" class="btn btn-primary btn-sm">
                        Continue <i class="fas fa-arrow-right ms-1"></i>
                    </a>
                </div>
            </div>
        </div>
        `;
  });

  container.innerHTML = html;
}

// ===== EXPORT FUNCTIONS FOR USE IN OTHER FILES =====
window.EduLearn = {
  saveProgress,
  logout,
  showAlert,
  initDashboard,
};

// ===== CONTACT FORM HANDLING =====
function setupContactForm() {
  const contactForm = document.getElementById("contactFormHome");
  if (!contactForm) return;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (!name || !email || !message) {
      showAlert("Please fill in all required fields", "danger");
      return;
    }

    // Simulate form submission
    showAlert(
      "Thank you for your message! We will get back to you within 24 hours.",
      "success"
    );

    // Reset form
    contactForm.reset();

    // In a real app, send data to your server:
    // fetch('/api/contact', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({name, email, message})
    // })
  });
}

// Initialize contact form when DOM loads
document.addEventListener("DOMContentLoaded", function () {
  // ... your existing code ...
  setupContactForm(); // Add this line

  // Also update your navbar.js to handle #contact link
  setupNavbarScroll(); // Make sure this exists
});

// Update navbar active state for #contact
function setActiveNavbar() {
  // ... your existing code ...

  // Add this for contact link
  if (hash === "#contact") {
    const contactLink = document.querySelector(
      '.navbar-nav .nav-link[href="#contact"]'
    );
    if (contactLink) {
      contactLink.classList.add("active");
    }
  }
}

// ADD NEW FEARURE ON MAIN
// ===== PAYMENT & ENROLLMENT SYSTEM =====
function setupPaymentSystem() {
  // In your payment submission function in main.js:
  // let enrolledCourses =
  //   JSON.parse(localStorage.getItem("enrolledCourses")) || [];
  // enrolledCourses.push({
  //   id: courseId,
  //   title: courseTitle,
  //   progress: 0,
  //   status: "pending", // or "approved" after admin approves
  //   enrollmentDate: new Date().toISOString(),
  //   category: "Web Development",
  // });
  // localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
  // Get payment modal if exists
  const paymentModal = document.getElementById("paymentModal");
  if (!paymentModal) return;

  const paymentForm = document.getElementById("paymentForm");
  const fileInput = document.getElementById("paymentScreenshot");
  const previewContainer = document.getElementById("screenshotPreview");

  // File input change handler
  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        previewScreenshot(file, previewContainer);
      }
    });
  }

  // Payment form submission
  if (paymentForm) {
    paymentForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const courseId = document.getElementById("paymentCourseId").value;
      const amount = document.getElementById("paymentAmount").value;
      const screenshot = fileInput.files[0];

      if (!screenshot) {
        showAlert("Please upload a payment screenshot", "danger");
        return;
      }

      processPayment(courseId, amount, screenshot);
    });
  }
}

function previewScreenshot(file, container) {
  container.innerHTML = "";

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "img-thumbnail mt-2";
      img.style.maxWidth = "200px";
      img.style.maxHeight = "200px";

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn btn-sm btn-danger ms-2";
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.onclick = function () {
        container.innerHTML = "";
        document.getElementById("paymentScreenshot").value = "";
      };

      container.appendChild(img);
      container.appendChild(removeBtn);
    };
    reader.readAsDataURL(file);
  }
}

function processPayment(courseId, amount, screenshot) {
  showAlert("Processing payment... Please wait for admin approval.", "info");

  // Simulate payment processing
  setTimeout(() => {
    // Store payment info in localStorage
    const paymentData = {
      courseId: courseId,
      amount: amount,
      status: "pending",
      screenshot: screenshot.name,
      date: new Date().toISOString(),
      userId: localStorage.getItem("userEmail"),
    };

    // Save to localStorage
    let payments = JSON.parse(localStorage.getItem("coursePayments")) || [];
    payments.push(paymentData);
    localStorage.setItem("coursePayments", JSON.stringify(payments));

    // Update UI
    document.getElementById("enrollButton").innerHTML =
      '<i class="fas fa-clock me-2"></i> Pending Approval';
    document.getElementById("enrollButton").classList.remove("btn-primary");
    document.getElementById("enrollButton").classList.add("btn-warning");
    document.getElementById("enrollButton").disabled = true;

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("paymentModal")
    );
    if (modal) modal.hide();

    showAlert(
      "Payment submitted! Admin will approve within 24 hours.",
      "success"
    );
  }, 2000);
}

// ===== COURSE NOTES SYSTEM =====
function setupCourseNotes() {
  // This would be called from dashboard when viewing a course
  const notesContainer = document.getElementById("courseNotes");
  if (!notesContainer) return;

  const courseId = getCurrentCourseId(); // Get from URL or localStorage

  loadCourseNotes(courseId);
}

function loadCourseNotes(courseId) {
  // Sample course notes data
  const courseNotes = {
    1: [
      {
        id: 1,
        title: "Introduction to Web Development",
        content:
          "Web development involves building and maintaining websites...",
        type: "lecture",
        duration: "15 min",
        fileUrl: "#",
        date: "2024-03-10",
      },
      {
        id: 2,
        title: "HTML Basics Cheat Sheet",
        content: "Essential HTML tags and their usage...",
        type: "pdf",
        duration: "PDF (2MB)",
        fileUrl: "#",
        date: "2024-03-10",
      },
      {
        id: 3,
        title: "CSS Fundamentals Notes",
        content: "CSS selectors, properties, and box model explained...",
        type: "note",
        duration: "8 pages",
        fileUrl: "#",
        date: "2024-03-11",
      },
    ],
    2: [
      // Data Science notes...
    ],
  };

  displayNotes(courseNotes[courseId] || []);
}

function displayNotes(notes) {
  const container = document.getElementById("courseNotes");
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
        <h5>No notes available</h5>
        <p class="text-muted">Notes will be added by the instructor</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Course Materials</h5>
          <button class="btn btn-sm btn-outline-primary" id="downloadAllNotes">
            <i class="fas fa-download me-1"></i> Download All
          </button>
        </div>
      </div>
    </div>
  `;

  html += '<div class="row">';

  notes.forEach((note) => {
    let icon = "fa-file-alt";
    let badgeClass = "bg-primary";

    switch (note.type) {
      case "pdf":
        icon = "fa-file-pdf";
        badgeClass = "bg-danger";
        break;
      case "video":
        icon = "fa-video";
        badgeClass = "bg-success";
        break;
      case "lecture":
        icon = "fa-chalkboard-teacher";
        badgeClass = "bg-info";
        break;
    }

    html += `
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card note-card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span class="badge ${badgeClass}">${note.type}</span>
              </div>
              <small class="text-muted">${note.duration}</small>
            </div>
            
            <h6 class="fw-bold mb-2">${note.title}</h6>
            <p class="text-muted small mb-3">${note.content.substring(
              0,
              100
            )}...</p>
            
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="far fa-calendar me-1"></i> ${note.date}
              </small>
              <div>
                <button class="btn btn-sm btn-outline-primary view-note" data-note-id="${
                  note.id
                }">
                  <i class="fas fa-eye me-1"></i> View
                </button>
                <button class="btn btn-sm btn-primary ms-1 download-note" data-note-url="${
                  note.fileUrl
                }">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;

  // Add event listeners
  document.querySelectorAll(".view-note").forEach((btn) => {
    btn.addEventListener("click", function () {
      const noteId = this.getAttribute("data-note-id");
      openNoteViewer(noteId);
    });
  });

  document.querySelectorAll(".download-note").forEach((btn) => {
    btn.addEventListener("click", function () {
      const fileUrl = this.getAttribute("data-note-url");
      downloadNote(fileUrl);
    });
  });

  // Download all button
  const downloadAllBtn = document.getElementById("downloadAllNotes");
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener("click", downloadAllNotes);
  }
}

function openNoteViewer(noteId) {
  // Create modal for viewing notes
  const modalHTML = `
    <div class="modal fade" id="noteViewerModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Note Viewer</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="noteContent">
              Loading note...
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">
              <i class="fas fa-download me-1"></i> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to body if not exists
  if (!document.getElementById("noteViewerModal")) {
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  // Load note content
  const noteContent = document.getElementById("noteContent");
  noteContent.innerHTML = `
    <div class="text-center py-4">
      <i class="fas fa-book-reader fa-3x text-muted mb-3"></i>
      <h5>Course Note</h5>
      <p>Detailed content would appear here...</p>
    </div>
  `;

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("noteViewerModal"));
  modal.show();
}

function downloadNote(fileUrl) {
  showAlert("Downloading note...", "info");
  // In real app, this would trigger file download
  setTimeout(() => {
    showAlert("Note downloaded successfully!", "success");
  }, 1000);
}

function downloadAllNotes() {
  showAlert("Preparing all notes for download...", "info");
  // Simulate zip file creation
  setTimeout(() => {
    showAlert("All notes have been downloaded as a ZIP file!", "success");
  }, 2000);
}

// Add to existing DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // ... existing code ...

  // Initialize new systems
  setupPaymentSystem();
  // setupCourseNotes(); // Will be called from course page
});

/// ADD TOO  PAYMENT
// Enhanced Enrollment System
function setupEnrollment() {
  const enrollBtn = document.getElementById("enrollButton");
  if (!enrollBtn) return;

  enrollBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Get course details
    const courseId = getCourseIdFromURL();
    const courseTitle =
      document.getElementById("courseMainTitle")?.textContent || "Course";
    const coursePrice =
      document.getElementById("coursePrice")?.textContent || "$0";

    // Check if already enrolled
    if (isCourseEnrolled(courseId)) {
      showAlert("You are already enrolled in this course!", "info");
      window.location.href = "dashboard.html";
      return;
    }

    // Check if logged in
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";

    if (!isLoggedIn) {
      // Show login modal first
      const loginModal = new bootstrap.Modal(
        document.getElementById("loginModal")
      );
      loginModal.show();

      // After login, show payment modal
      document.getElementById("loginForm")?.addEventListener(
        "submit",
        function (e) {
          e.preventDefault();
          loginModal.hide();
          showPaymentModal(courseId, courseTitle, coursePrice);
        },
        { once: true }
      );
    } else {
      showPaymentModal(courseId, courseTitle, coursePrice);
    }
  });
}

function showPaymentModal(courseId, courseTitle, coursePrice) {
  // Set course details in modal
  document.getElementById("paymentCourseId").value = courseId;
  document.getElementById("paymentCourseTitle").value = courseTitle;
  document.getElementById("paymentAmount").value = coursePrice.replace("$", "");

  // Pre-fill email if logged in
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    document.getElementById("studentEmail").value = userEmail;
  }

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
  modal.show();

  // Setup form submission
  setupPaymentForm();
}

function setupPaymentForm() {
  const form = document.getElementById("paymentForm");
  if (!form) return;

  // File preview
  const fileInput = document.getElementById("paymentScreenshot");
  const preview = document.getElementById("screenshotPreview");

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${e.target.result}" class="img-thumbnail me-3" style="max-width: 150px;">
                        <button type="button" class="btn btn-sm btn-danger" onclick="document.getElementById('paymentScreenshot').value=''; this.parentElement.innerHTML=''">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                `;
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const courseId = document.getElementById("paymentCourseId").value;
    const courseTitle = document.getElementById("paymentCourseTitle").value;
    const email = document.getElementById("studentEmail").value;
    const amount = document.getElementById("paymentAmount").value;
    const method = document.getElementById("paymentMethod").value;
    const transactionId = document.getElementById("transactionId").value;
    const screenshot = document.getElementById("paymentScreenshot").files[0];
    const notes = document.getElementById("paymentNotes").value;

    if (!method) {
      showAlert("Please select payment method", "danger");
      return;
    }

    if (!screenshot) {
      showAlert("Please upload payment screenshot", "danger");
      return;
    }

    // Process payment
    processPaymentSubmission(
      courseId,
      courseTitle,
      email,
      amount,
      method,
      transactionId,
      screenshot,
      notes
    );
  });
}

function processPaymentSubmission(
  courseId,
  courseTitle,
  email,
  amount,
  method,
  transactionId,
  screenshot,
  notes
) {
  showAlert("Submitting payment for admin approval...", "info");

  // Create payment record
  const paymentRecord = {
    id: Date.now(),
    courseId: courseId,
    courseTitle: courseTitle,
    amount: amount,
    method: method,
    transactionId: transactionId,
    screenshot: screenshot.name,
    notes: notes,
    email: email,
    status: "pending",
    date: new Date().toISOString(),
  };

  // Save to localStorage
  let payments = JSON.parse(localStorage.getItem("coursePayments")) || [];
  payments.push(paymentRecord);
  localStorage.setItem("coursePayments", JSON.stringify(payments));

  // Add to enrolled courses (pending status)
  let enrolledCourses =
    JSON.parse(localStorage.getItem("enrolledCourses")) || [];
  enrolledCourses.push({
    id: courseId,
    title: courseTitle,
    status: "pending",
    enrollmentDate: new Date().toISOString(),
    progress: 0,
    lastAccessed: null,
  });
  localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));

  // Update UI
  setTimeout(() => {
    const enrollBtn = document.getElementById("enrollButton");
    if (enrollBtn) {
      enrollBtn.innerHTML =
        '<i class="fas fa-clock me-2"></i> Pending Approval';
      enrollBtn.classList.remove("btn-primary");
      enrollBtn.classList.add("btn-warning");
      enrollBtn.disabled = true;
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("paymentModal")
    );
    if (modal) modal.hide();

    showAlert(
      "Payment submitted successfully! Admin will approve within 24 hours. Check your email for updates.",
      "success"
    );

    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 3000);
  }, 1500);
}

function getCourseIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id") || 1;
}

function isCourseEnrolled(courseId) {
  const enrolledCourses =
    JSON.parse(localStorage.getItem("enrolledCourses")) || [];
  return enrolledCourses.some(
    (course) => course.id == courseId && course.status === "approved"
  );
}

// Initialize enrollment system
document.addEventListener("DOMContentLoaded", function () {
  setupEnrollment();
});
