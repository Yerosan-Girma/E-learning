// Enhanced Dashboard JavaScript
document.addEventListener("DOMContentLoaded", function () {
  console.log("Enhanced Dashboard loaded");

  // Load user data
  loadUserData();

  // Load all sections
  loadProgressChart();
  loadStreakCalendar();
  loadQuizzes();
  loadExams();
  loadAssignments();
  loadDiscussions();
  loadCertificates();
  loadEnrolledCourses();

  // Setup event listeners
  setupDashboardNavigation();
  setupLogoutButton();
  setupQuickActions();
  setupDiscussionModal();

  // Update stats periodically
  updateLiveStats();

  // Load dashboard notes
  loadDashboardNotes();
});

// ===== LOAD USER DATA =====
function loadUserData() {
  // Get user from localStorage or use default
  const userName = localStorage.getItem("userName") || "John Doe";
  const userEmail = localStorage.getItem("userEmail") || "student@edulearn.com";

  // Update UI
  document.getElementById("userName").textContent = userName;
  document.getElementById("dashboardUserName").textContent = userName;
  document.getElementById("dashboardUserEmail").textContent = userEmail;

  // Update overall progress
  const overallProgress = Math.floor(Math.random() * 30) + 70; // 70-100%
  document.getElementById("overallProgress").textContent =
    overallProgress + "%";
  document.querySelector(".progress-bar").style.width = overallProgress + "%";
}

// ===== PROGRESS CHART =====
function loadProgressChart() {
  const ctx = document.getElementById("progressChart");
  if (!ctx) return;

  const progressChart = new Chart(ctx.getContext("2d"), {
    type: "line",
    data: {
      labels: [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
      ],
      datasets: [
        {
          label: "Quiz Scores",
          data: [75, 80, 82, 85, 88, 90, 92],
          borderColor: "#4361ee",
          backgroundColor: "rgba(67, 97, 238, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Assignment Scores",
          data: [80, 82, 85, 87, 89, 91, 93],
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Participation",
          data: [70, 72, 75, 78, 80, 82, 85],
          borderColor: "#ff9800",
          backgroundColor: "rgba(255, 152, 0, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 60,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });
}

// ===== STREAK CALENDAR =====
function loadStreakCalendar() {
  const container = document.getElementById("streakDays");
  if (!container) return;

  let html = "";
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const day = date.getDate();
    const isActive = i < 12; // Last 12 days active

    html += `
        <div class="streak-day ${
          isActive ? "active" : ""
        }" title="${date.toLocaleDateString()}">
            <small>${date
              .toLocaleDateString("en-US", { weekday: "short" })
              .charAt(0)}</small>
            <div class="day-circle ${
              isActive ? "bg-success" : "bg-secondary"
            }">${day}</div>
        </div>
        `;
  }

  container.innerHTML = html;
}

// ===== LOAD QUIZZES =====
function loadQuizzes() {
  // Upcoming Quizzes
  const upcomingContainer = document.getElementById("upcomingQuizzes");
  if (upcomingContainer) {
    const upcomingQuizzes = [
      {
        course: "Web Development",
        topic: "JavaScript Functions",
        due: "Today, 2:00 PM",
      },
      {
        course: "Data Science",
        topic: "Python Libraries",
        due: "Tomorrow, 10:00 AM",
      },
      {
        course: "Digital Marketing",
        topic: "SEO Basics",
        due: "Mar 12, 3:00 PM",
      },
    ];

    let html = "";
    upcomingQuizzes.forEach((quiz) => {
      html += `
            <div class="list-group-item border-0 px-0 py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0 small">${quiz.course}</h6>
                        <small class="text-muted">${quiz.topic}</small>
                    </div>
                    <span class="badge bg-warning">${quiz.due}</span>
                </div>
            </div>
            `;
    });
    upcomingContainer.innerHTML = html;
  }

  // Quiz Results
  const resultsContainer = document.getElementById("quizResults");
  if (resultsContainer) {
    const quizResults = [
      { course: "Web Development", score: 92, date: "Mar 5" },
      { course: "Data Science", score: 85, date: "Mar 3" },
      { course: "Digital Marketing", score: 88, date: "Feb 28" },
    ];

    let html = "";
    quizResults.forEach((result) => {
      const scoreColor =
        result.score >= 90
          ? "text-success"
          : result.score >= 80
          ? "text-warning"
          : "text-danger";

      html += `
            <div class="list-group-item border-0 px-0 py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-0 small">${result.course}</h6>
                        <small class="text-muted">${result.date}</small>
                    </div>
                    <span class="fw-bold ${scoreColor}">${result.score}%</span>
                </div>
            </div>
            `;
    });
    resultsContainer.innerHTML = html;
  }

  // Quizzes Table
  const tableContainer = document.getElementById("quizzesTable");
  if (tableContainer) {
    const quizzes = [
      {
        name: "JavaScript Fundamentals",
        course: "Web Development",
        date: "Mar 5, 2024",
        score: 92,
        status: "completed",
      },
      {
        name: "Python Basics Quiz",
        course: "Data Science",
        date: "Mar 3, 2024",
        score: 85,
        status: "completed",
      },
      {
        name: "SEO Concepts",
        course: "Digital Marketing",
        date: "Feb 28, 2024",
        score: 88,
        status: "completed",
      },
      {
        name: "React Components",
        course: "Web Development",
        date: "Mar 12, 2024",
        score: "-",
        status: "upcoming",
      },
      {
        name: "Data Analysis",
        course: "Data Science",
        date: "Mar 15, 2024",
        score: "-",
        status: "upcoming",
      },
    ];

    let html = "";
    quizzes.forEach((quiz) => {
      let statusBadge = "";
      let actionBtn = "";

      if (quiz.status === "completed") {
        statusBadge = '<span class="badge bg-success">Completed</span>';
        actionBtn =
          '<a href="#" class="btn btn-sm btn-outline-primary">Review</a>';
      } else {
        statusBadge = '<span class="badge bg-warning">Upcoming</span>';
        actionBtn = '<a href="#" class="btn btn-sm btn-primary">Start</a>';
      }

      html += `
            <tr>
                <td>${quiz.name}</td>
                <td>${quiz.course}</td>
                <td>${quiz.date}</td>
                <td class="fw-bold">${quiz.score}</td>
                <td>${statusBadge}</td>
                <td>${actionBtn}</td>
            </tr>
            `;
    });

    tableContainer.innerHTML = html;
  }
}

// ===== LOAD EXAMS =====
function loadExams() {
  const container = document.getElementById("examCards");
  if (!container) return;

  const exams = [
    {
      course: "Web Development Bootcamp",
      date: "March 25, 2024",
      duration: "3 hours",
      topics: ["HTML/CSS", "JavaScript", "React", "Node.js"],
      status: "upcoming",
      progress: 75,
    },
    {
      course: "Data Science Fundamentals",
      date: "April 5, 2024",
      duration: "2.5 hours",
      topics: [
        "Python",
        "Statistics",
        "Machine Learning",
        "Data Visualization",
      ],
      status: "upcoming",
      progress: 60,
    },
    {
      course: "Digital Marketing",
      date: "February 20, 2024",
      duration: "2 hours",
      topics: ["SEO", "Content Marketing", "Social Media", "Analytics"],
      status: "completed",
      score: 89,
    },
  ];

  let html = "";
  exams.forEach((exam) => {
    if (exam.status === "upcoming") {
      html += `
            <div class="col-md-6 mb-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 class="fw-bold mb-1">${exam.course}</h6>
                                <small class="text-muted">
                                    <i class="far fa-calendar me-1"></i>${
                                      exam.date
                                    }
                                </small>
                            </div>
                            <span class="badge bg-warning">${
                              exam.duration
                            }</span>
                        </div>
                        
                        <div class="mb-3">
                            <small class="fw-bold d-block mb-1">Topics Covered:</small>
                            <div class="d-flex flex-wrap gap-1">
                                ${exam.topics
                                  .map(
                                    (topic) =>
                                      `<span class="badge bg-light text-dark">${topic}</span>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <small>Preparation Progress</small>
                                <small class="fw-bold">${exam.progress}%</small>
                            </div>
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar" role="progressbar" style="width: ${
                                  exam.progress
                                }%"></div>
                            </div>
                        </div>
                        
                        <div class="d-grid">
                            <button class="btn btn-primary btn-sm">Study Plan</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
    } else {
      html += `
            <div class="col-md-6 mb-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 class="fw-bold mb-1">${exam.course}</h6>
                                <small class="text-muted">
                                    <i class="far fa-calendar me-1"></i>Completed: ${
                                      exam.date
                                    }
                                </small>
                            </div>
                            <span class="badge bg-success">${exam.score}%</span>
                        </div>
                        
                        <div class="mb-3">
                            <small class="fw-bold d-block mb-1">Topics Covered:</small>
                            <div class="d-flex flex-wrap gap-1">
                                ${exam.topics
                                  .map(
                                    (topic) =>
                                      `<span class="badge bg-light text-dark">${topic}</span>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary btn-sm flex-fill">View Results</button>
                            <button class="btn btn-outline-success btn-sm flex-fill">Download Certificate</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
    }
  });

  container.innerHTML = html;
}

// ===== LOAD ASSIGNMENTS =====
function loadAssignments() {
  // Update assignment counts
  document.getElementById("pendingAssignments").textContent = "3";
  document.getElementById("submittedAssignments").textContent = "8";
  document.getElementById("gradedAssignments").textContent = "6";

  // Assignments Table
  const tableContainer = document.getElementById("assignmentsTable");
  if (!tableContainer) return;

  const assignments = [
    {
      name: "Portfolio Website",
      course: "Web Development",
      due: "Mar 15, 2024",
      status: "pending",
      grade: "-",
    },
    {
      name: "Data Analysis Report",
      course: "Data Science",
      due: "Mar 10, 2024",
      status: "submitted",
      grade: "A-",
    },
    {
      name: "Marketing Strategy",
      course: "Digital Marketing",
      due: "Mar 5, 2024",
      status: "graded",
      grade: "92%",
    },
    {
      name: "React Component Library",
      course: "Web Development",
      due: "Mar 20, 2024",
      status: "pending",
      grade: "-",
    },
    {
      name: "Machine Learning Model",
      course: "Data Science",
      due: "Mar 12, 2024",
      status: "submitted",
      grade: "Pending",
    },
  ];

  let html = "";
  assignments.forEach((assignment) => {
    let statusBadge = "";
    let gradeBadge = "";
    let actionBtn = "";

    switch (assignment.status) {
      case "pending":
        statusBadge = '<span class="badge bg-warning">Pending</span>';
        actionBtn = '<a href="#" class="btn btn-sm btn-primary">Submit</a>';
        break;
      case "submitted":
        statusBadge = '<span class="badge bg-info">Submitted</span>';
        actionBtn =
          '<a href="#" class="btn btn-sm btn-outline-secondary">View</a>';
        break;
      case "graded":
        statusBadge = '<span class="badge bg-success">Graded</span>';
        actionBtn =
          '<a href="#" class="btn btn-sm btn-outline-success">Review</a>';
        break;
    }

    if (assignment.grade === "A-") {
      gradeBadge = '<span class="badge bg-success">A-</span>';
    } else if (assignment.grade === "92%") {
      gradeBadge = '<span class="fw-bold text-success">92%</span>';
    } else {
      gradeBadge = assignment.grade;
    }

    html += `
        <tr>
            <td>${assignment.name}</td>
            <td>${assignment.course}</td>
            <td>${assignment.due}</td>
            <td>${statusBadge}</td>
            <td>${gradeBadge}</td>
            <td>${actionBtn}</td>
        </tr>
        `;
  });

  tableContainer.innerHTML = html;
}

// ===== LOAD DISCUSSIONS =====
function loadDiscussions() {
  // Discussion Topics
  const topicsContainer = document.getElementById("discussionTopics");
  if (topicsContainer) {
    const topics = [
      {
        title: "How to optimize React performance?",
        course: "Web Development",
        author: "Sarah Johnson",
        replies: 24,
        views: 156,
        time: "2 hours ago",
        category: "question",
      },
      {
        title: "Best practices for data visualization",
        course: "Data Science",
        author: "Mike Chen",
        replies: 18,
        views: 89,
        time: "5 hours ago",
        category: "discussion",
      },
      {
        title: "SEO vs SEM - Which is better?",
        course: "Digital Marketing",
        author: "Alex Rodriguez",
        replies: 32,
        views: 210,
        time: "1 day ago",
        category: "debate",
      },
      {
        title: "Python libraries for beginners",
        course: "Data Science",
        author: "Maria Garcia",
        replies: 15,
        views: 76,
        time: "2 days ago",
        category: "resource",
      },
    ];

    let html = "";
    topics.forEach((topic) => {
      let categoryBadge = "";
      switch (topic.category) {
        case "question":
          categoryBadge = '<span class="badge bg-primary">Question</span>';
          break;
        case "discussion":
          categoryBadge = '<span class="badge bg-success">Discussion</span>';
          break;
        case "debate":
          categoryBadge = '<span class="badge bg-warning">Debate</span>';
          break;
        case "resource":
          categoryBadge = '<span class="badge bg-info">Resource</span>';
          break;
      }

      html += `
            <div class="col-md-6 mb-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            ${categoryBadge}
                            <small class="text-muted">${topic.time}</small>
                        </div>
                        
                        <h6 class="fw-bold mb-2">${topic.title}</h6>
                        <small class="text-muted d-block mb-2">
                            <i class="fas fa-book me-1"></i>${topic.course}
                        </small>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-user me-1"></i>${topic.author}
                            </small>
                            <div>
                                <small class="text-muted me-3">
                                    <i class="fas fa-comment me-1"></i>${topic.replies}
                                </small>
                                <small class="text-muted">
                                    <i class="fas fa-eye me-1"></i>${topic.views}
                                </small>
                            </div>
                        </div>
                        
                        <div class="d-grid mt-3">
                            <button class="btn btn-outline-primary btn-sm">Join Discussion</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
    });

    topicsContainer.innerHTML = html;
  }

  // My Recent Posts
  const myPostsContainer = document.getElementById("myPosts");
  if (myPostsContainer) {
    const myPosts = [
      {
        title: "Understanding async/await in JavaScript",
        replies: 8,
        lastReply: "1 hour ago",
        status: "active",
      },
      {
        title: "Help with pandas dataframe",
        replies: 3,
        lastReply: "3 hours ago",
        status: "active",
      },
      {
        title: "Project structure best practices",
        replies: 12,
        lastReply: "2 days ago",
        status: "resolved",
      },
    ];

    let html = "";
    myPosts.forEach((post) => {
      let statusBadge =
        post.status === "active"
          ? '<span class="badge bg-success">Active</span>'
          : '<span class="badge bg-secondary">Resolved</span>';

      html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-1">${post.title}</h6>
                        <small class="text-muted">
                            ${post.replies} replies • Last reply: ${post.lastReply}
                        </small>
                    </div>
                    <div>
                        ${statusBadge}
                        <button class="btn btn-sm btn-outline-primary ms-2">View</button>
                    </div>
                </div>
            </div>
            `;
    });

    myPostsContainer.innerHTML = html;
  }
}

// ===== LOAD CERTIFICATES =====
function loadCertificates() {
  const container = document.getElementById("certificatesList");
  if (!container) return;

  const certificates = [
    {
      title: "Web Development Fundamentals",
      date: "February 15, 2024",
      instructor: "Sarah Johnson",
      score: "95%",
      url: "#",
    },
    {
      title: "Python Programming",
      date: "January 20, 2024",
      instructor: "Dr. Michael Chen",
      score: "88%",
      url: "#",
    },
  ];

  // Update certificates count
  document.getElementById("certificates").textContent = certificates.length;

  let html = "";
  certificates.forEach((cert) => {
    const certDate = new Date(cert.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    html += `
        <div class="col-md-6 mb-3">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex align-items-start">
                        <div class="flex-shrink-0">
                            <i class="fas fa-certificate fa-3x text-primary"></i>
                        </div>
                        <div class="flex-grow-1 ms-3">
                            <h5 class="fw-bold mb-1">${cert.title}</h5>
                            <p class="text-muted small mb-1">
                                <i class="far fa-calendar me-1"></i>Issued: ${certDate}
                            </p>
                            <p class="text-muted small mb-2">
                                <i class="fas fa-user-graduate me-1"></i>Instructor: ${cert.instructor}
                            </p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-success">
                                    <i class="fas fa-star me-1"></i>Score: ${cert.score}
                                </span>
                                <div class="d-flex gap-2">
                                    <a href="${cert.url}" class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-eye me-1"></i> View
                                    </a>
                                    <a href="${cert.url}" class="btn btn-sm btn-primary" download>
                                        <i class="fas fa-download me-1"></i> Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
  });

  // If no certificates, show message
  if (certificates.length === 0) {
    html = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-certificate fa-4x text-muted mb-4"></i>
            <h5 class="text-muted">No certificates yet</h5>
            <p class="text-muted">Complete a course to earn your first certificate!</p>
            <a href="courses.html" class="btn btn-primary">Browse Courses</a>
        </div>
        `;
  }

  container.innerHTML = html;
}

// ===== LOAD ENROLLED COURSES =====
function loadEnrolledCourses() {
  const container = document.getElementById("enrolledCoursesList");
  if (!container) return;

  const courses = [
    {
      id: 1,
      title: "Web Development Bootcamp 2024",
      instructor: "Sarah Johnson",
      progress: 78,
      nextLesson: "React Hooks",
      deadline: "Mar 20",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      instructor: "Dr. Michael Chen",
      progress: 65,
      nextLesson: "Machine Learning Basics",
      deadline: "Mar 25",
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "Digital Marketing Masterclass",
      instructor: "Alex Rodriguez",
      progress: 42,
      nextLesson: "Social Media Strategy",
      deadline: "Apr 5",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      title: "UI/UX Design Principles",
      instructor: "Emma Thompson",
      progress: 30,
      nextLesson: "Figma Workshop",
      deadline: "Apr 10",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ];

  // Update enrolled courses count
  document.getElementById("enrolledCourses").textContent = courses.length;

  let html = "";
  courses.forEach((course) => {
    html += `
        <div class="col-md-6 col-lg-3 mb-3">
            <div class="card course-card h-100">
                <img src="${course.image}" class="card-img-top course-img" alt="${course.title}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title fw-bold mb-0">${course.title}</h6>
                        <span class="badge bg-warning">${course.deadline}</span>
                    </div>
                    <p class="text-muted small mb-2">By ${course.instructor}</p>
                    
                    <div class="mb-3">
                        <div class="d-flex justify-content-between small mb-1">
                            <span>Progress</span>
                            <span>${course.progress}%</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar" role="progressbar" style="width: ${course.progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-play-circle me-1"></i> ${course.nextLesson}
                        </small>
                        <a href="learning.html?course=${course.id}" class="btn btn-primary btn-sm">
                            Continue <i class="fas fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;
  });

  container.innerHTML = html;
}

// ===== SETUP DASHBOARD NAVIGATION =====
function setupDashboardNavigation() {
  // Smooth scroll to sections
  document.querySelectorAll(".dashboard-nav .nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const href = this.getAttribute("href");
      if (href.startsWith("#")) {
        // Remove active from all links
        document.querySelectorAll(".dashboard-nav .nav-link").forEach((l) => {
          l.classList.remove("active");
        });

        // Add active to clicked link
        this.classList.add("active");

        // Scroll to section
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }
    });
  });
}

// ===== SETUP LOGOUT BUTTON =====
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to logout?")) {
      // Clear user data from localStorage
      localStorage.removeItem("userLoggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");

      // Show logout message
      showAlert("Logged out successfully. Redirecting to home page...", "info");

      // Redirect to home page
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  });
}

// ===== SETUP QUICK ACTIONS =====
function setupQuickActions() {
  // Continue Learning Button
  const continueBtn = document.getElementById("continueLearningBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Get last active course from localStorage or default
      const lastCourse = localStorage.getItem("lastCourseId") || "1";
      window.location.href = `learning.html?course=${lastCourse}`;
    });
  }

  // Download Progress Report
  const downloadBtn = document.getElementById("downloadProgressBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      showAlert("Generating progress report...", "info");

      // Simulate download
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = "javascript:void(0)";
        link.download = `EduLearn_Progress_Report_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showAlert("Progress report downloaded successfully!", "success");
      }, 2000);
    });
  }

  // Schedule Study Session
  const scheduleBtn = document.getElementById("scheduleStudyBtn");
  if (scheduleBtn) {
    scheduleBtn.addEventListener("click", function () {
      showAlert("Opening study scheduler...", "info");

      // In a real app, this would open a scheduling modal
      setTimeout(() => {
        document.querySelector('a[href="#exams"]').click();
      }, 500);
    });
  }
}

// ===== SETUP DISCUSSION MODAL =====
function setupDiscussionModal() {
  const form = document.getElementById("newDiscussionForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Show success message
    showAlert("Discussion topic posted successfully!", "success");

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("newDiscussionModal")
    );
    if (modal) modal.hide();

    // Reset form
    form.reset();

    // Reload discussions after a delay
    setTimeout(() => {
      loadDiscussions();
    }, 1000);
  });
}

// ===== UPDATE LIVE STATS =====
function updateLiveStats() {
  // Simulate live updates to study hours
  setInterval(() => {
    const currentHours = parseFloat(
      document.getElementById("studyHours").textContent
    );
    const newHours = (currentHours + 0.01).toFixed(2);
    document.getElementById("studyHours").textContent = newHours;
  }, 60000); // Update every minute

  // Update average score randomly
  setInterval(() => {
    const currentScore = parseInt(
      document.getElementById("avgScore").textContent
    );
    const change = Math.random() > 0.5 ? 1 : -1;
    const newScore = Math.max(70, Math.min(98, currentScore + change));
    document.getElementById("avgScore").textContent = newScore + "%";
  }, 300000); // Update every 5 minutes
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

// ===== LOAD DASHBOARD NOTES =====
function loadDashboardNotes() {
  const container = document.getElementById("notesSection");
  if (!container) return;

  // Get user's notes
  const userNotes = JSON.parse(localStorage.getItem("userNotes")) || [];

  if (userNotes.length === 0) {
    container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-sticky-note fa-3x text-muted mb-3"></i>
                <h5>No notes yet</h5>
                <p class="text-muted">Start taking notes in your courses</p>
                <a href="courses.html" class="btn btn-primary mt-2">Browse Courses</a>
            </div>
        `;
    return;
  }

  // Group notes by course
  const notesByCourse = {};
  userNotes.forEach((note) => {
    if (!notesByCourse[note.courseId]) {
      notesByCourse[note.courseId] = [];
    }
    notesByCourse[note.courseId].push(note);
  });

  let html = '<div class="row">';

  for (const courseId in notesByCourse) {
    const notes = notesByCourse[courseId];
    const course = getCourseById(courseId);

    html += `
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="fw-bold mb-0">
                            <i class="fas fa-book me-2"></i>
                            ${course ? course.title : "Course " + courseId}
                            <span class="badge bg-primary ms-2">${
                              notes.length
                            } notes</span>
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            ${notes
                              .slice(0, 3)
                              .map(
                                (note) => `
                                <div class="col-md-4 mb-3">
                                    <div class="card border-0 bg-light h-100">
                                        <div class="card-body">
                                            <h6 class="fw-bold">${
                                              note.title
                                            }</h6>
                                            <p class="text-muted small">${note.content.substring(
                                              0,
                                              80
                                            )}...</p>
                                            <div class="d-flex justify-content-between align-items-center">
                                                <small class="text-muted">
                                                    ${new Date(
                                                      note.date
                                                    ).toLocaleDateString()}
                                                </small>
                                                <a href="learning.html?course=${courseId}" 
                                                   class="btn btn-sm btn-outline-primary">
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                        ${
                          notes.length > 3
                            ? `
                            <div class="text-center mt-3">
                                <a href="learning.html?course=${courseId}" class="btn btn-sm btn-primary">
                                    View All ${notes.length} Notes
                                </a>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        `;
  }

  html += "</div>";
  container.innerHTML = html;
}

// Helper function to get course by ID
function getCourseById(courseId) {
  // This should match the courses from loadEnrolledCourses
  const courses = [
    {
      id: 1,
      title: "Web Development Bootcamp 2024",
      instructor: "Sarah Johnson",
      progress: 78,
      nextLesson: "React Hooks",
      deadline: "Mar 20",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      instructor: "Dr. Michael Chen",
      progress: 65,
      nextLesson: "Machine Learning Basics",
      deadline: "Mar 25",
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "Digital Marketing Masterclass",
      instructor: "Alex Rodriguez",
      progress: 42,
      nextLesson: "Social Media Strategy",
      deadline: "Apr 5",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      title: "UI/UX Design Principles",
      instructor: "Emma Thompson",
      progress: 30,
      nextLesson: "Figma Workshop",
      deadline: "Apr 10",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ];

  return courses.find((course) => course.id == courseId);
}
