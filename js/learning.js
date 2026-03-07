// learning.js - Course Learning Page
document.addEventListener("DOMContentLoaded", function () {
  console.log("Learning page loaded");

  // Get course ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course") || 1;

  // Load course content
  loadCourseContent(courseId);
  loadCourseNotes(courseId);
  loadCourseResources(courseId);

  // Setup event listeners
  setupLessonNavigation();
  setupNoteTaking();
  setupResourceDownloads();
});

// ===== LOAD COURSE CONTENT =====
function loadCourseContent(courseId) {
  const contentAccordion = document.getElementById("courseContentAccordion");
  const courseTitle = document.getElementById("courseLearningTitle");

  if (!contentAccordion) return;

  // Sample course content structure
  const courseModules = {
    1: {
      title: "Web Development Bootcamp 2024",
      modules: [
        {
          id: "module1",
          title: "Introduction to Web Development",
          duration: "2 hours",
          lessons: [
            {
              id: 1,
              title: "Course Overview",
              type: "video",
              duration: "15:30",
              completed: true,
            },
            {
              id: 2,
              title: "How the Web Works",
              type: "video",
              duration: "20:10",
              completed: true,
            },
            {
              id: 3,
              title: "Setting Up Environment",
              type: "video",
              duration: "25:45",
              completed: false,
            },
            {
              id: 4,
              title: "Introduction to HTML",
              type: "reading",
              duration: "30 min",
              completed: false,
            },
          ],
        },
        {
          id: "module2",
          title: "HTML5 Fundamentals",
          duration: "4 hours",
          lessons: [
            {
              id: 5,
              title: "HTML Document Structure",
              type: "video",
              duration: "18:30",
              completed: false,
            },
            {
              id: 6,
              title: "Text Formatting & Semantics",
              type: "video",
              duration: "32:15",
              completed: false,
            },
            {
              id: 7,
              title: "HTML Forms",
              type: "video",
              duration: "35:20",
              completed: false,
            },
            {
              id: 8,
              title: "HTML5 New Features",
              type: "reading",
              duration: "45 min",
              completed: false,
            },
          ],
        },
        {
          id: "module3",
          title: "CSS3 Styling",
          duration: "6 hours",
          lessons: [
            {
              id: 9,
              title: "CSS Basics",
              type: "video",
              duration: "28:45",
              completed: false,
            },
            {
              id: 10,
              title: "Flexbox Layout",
              type: "video",
              duration: "42:30",
              completed: false,
            },
            {
              id: 11,
              title: "CSS Grid",
              type: "video",
              duration: "48:15",
              completed: false,
            },
            {
              id: 12,
              title: "Responsive Design",
              type: "video",
              duration: "38:20",
              completed: false,
            },
          ],
        },
      ],
    },
  };

  const course = courseModules[courseId] || courseModules[1];

  // Set course title
  if (courseTitle) courseTitle.textContent = course.title;

  // Build modules accordion
  let accordionHTML = "";

  course.modules.forEach((module, moduleIndex) => {
    const isFirst = moduleIndex === 0;

    let lessonsHTML = "";
    module.lessons.forEach((lesson, lessonIndex) => {
      let icon = "fa-play-circle";
      let badgeClass = "bg-primary";

      switch (lesson.type) {
        case "video":
          icon = "fa-play-circle";
          badgeClass = "bg-primary";
          break;
        case "reading":
          icon = "fa-book";
          badgeClass = "bg-success";
          break;
        case "quiz":
          icon = "fa-question-circle";
          badgeClass = "bg-warning";
          break;
      }

      lessonsHTML += `
                <div class="lesson-item d-flex align-items-center p-2 border-bottom ${
                  lesson.completed ? "completed" : ""
                }" 
                     data-lesson-id="${lesson.id}" 
                     data-module-id="${module.id}">
                    <div class="me-3">
                        <input class="form-check-input lesson-checkbox" type="checkbox" 
                               ${lesson.completed ? "checked" : ""} 
                               data-lesson-id="${lesson.id}">
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas ${icon} me-2 text-muted"></i>
                                <span class="lesson-title">${
                                  lesson.title
                                }</span>
                            </div>
                            <small class="text-muted">${lesson.duration}</small>
                        </div>
                    </div>
                </div>
            `;
    });

    accordionHTML += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button ${
                      isFirst ? "" : "collapsed"
                    }" 
                            type="button" data-bs-toggle="collapse" 
                            data-bs-target="#collapse${module.id}">
                        <div class="d-flex justify-content-between w-100 me-3">
                            <span class="fw-bold">${module.title}</span>
                            <span class="text-muted">${module.duration}</span>
                        </div>
                    </button>
                </h2>
                <div id="collapse${module.id}" 
                     class="accordion-collapse collapse ${
                       isFirst ? "show" : ""
                     }" 
                     data-bs-parent="#courseContentAccordion">
                    <div class="accordion-body p-0">
                        ${lessonsHTML}
                    </div>
                </div>
            </div>
        `;
  });

  contentAccordion.innerHTML = accordionHTML;

  // Add click handlers to lessons
  document.querySelectorAll(".lesson-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      if (!e.target.classList.contains("lesson-checkbox")) {
        const lessonId = this.getAttribute("data-lesson-id");
        const moduleId = this.getAttribute("data-module-id");
        loadLessonContent(lessonId, moduleId);
      }
    });
  });

  // Add checkbox handlers
  document.querySelectorAll(".lesson-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const lessonId = this.getAttribute("data-lesson-id");
      const isChecked = this.checked;

      markLessonComplete(lessonId, isChecked);
      updateProgressBar();
    });
  });
}

// ===== LOAD LESSON CONTENT =====
function loadLessonContent(lessonId, moduleId) {
  const videoContainer = document.getElementById("videoContainer");
  const lessonTitle = document.getElementById("currentLessonTitle");
  const moduleTitle = document.getElementById("currentModuleTitle");

  if (!videoContainer) return;

  // Get lesson data
  const lesson = getLessonData(lessonId);

  // Update titles
  if (lessonTitle) lessonTitle.textContent = lesson.title;
  if (moduleTitle) moduleTitle.textContent = lesson.moduleTitle;

  // Display lesson content
  if (lesson.type === "video") {
    videoContainer.innerHTML = `
            <div class="video-wrapper">
                <div class="embed-responsive embed-responsive-16by9">
                    <div class="ratio ratio-16x9">
                        <div class="video-placeholder bg-dark text-white d-flex align-items-center justify-content-center">
                            <div class="text-center">
                                <i class="fas fa-play-circle fa-4x mb-3"></i>
                                <h5>${lesson.title}</h5>
                                <p>Video content would play here</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="video-controls mt-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-backward"></i>
                        </button>
                        <button class="btn btn-primary">
                            <i class="fas fa-play me-2"></i> Play
                        </button>
                        <button class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-forward"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
  } else {
    videoContainer.innerHTML = `
            <div class="reading-content">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${lesson.title}</h5>
                        <div class="content">
                            <p>This is the reading content for ${lesson.title}.</p>
                            <p>Here you would find detailed explanations, code examples, 
                               and important concepts to learn.</p>
                            <p>Take your time to read through this material thoroughly.</p>
                        </div>
                        <div class="mt-4">
                            <button class="btn btn-primary">
                                <i class="fas fa-check-circle me-2"></i> Mark as Read
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  // Mark as viewed
  markLessonViewed(lessonId);

  // Update active lesson in sidebar
  document.querySelectorAll(".lesson-item").forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("data-lesson-id") === lessonId) {
      item.classList.add("active");
    }
  });
}

// ===== COURSE NOTES SYSTEM =====
function loadCourseNotes(courseId) {
  const notesContainer = document.getElementById("courseNotes");
  if (!notesContainer) return;

  // Get notes from localStorage or use sample data
  let userNotes = JSON.parse(localStorage.getItem("userNotes")) || [];
  let courseNotes = userNotes.filter((note) => note.courseId == courseId);

  if (courseNotes.length === 0) {
    // Add sample notes if none exist
    courseNotes = [
      {
        id: 1,
        title: "Important HTML Tags",
        content:
          "Essential HTML tags to remember: <html>, <head>, <body>, <div>, <p>, <a>, <img>",
        tags: ["html", "important"],
        date: new Date().toISOString(),
        courseId: courseId,
      },
      {
        id: 2,
        title: "CSS Box Model",
        content:
          "The CSS box model consists of: margin, border, padding, and content.",
        tags: ["css", "concept"],
        date: new Date().toISOString(),
        courseId: courseId,
      },
    ];

    // Save sample notes
    userNotes = userNotes.concat(courseNotes);
    localStorage.setItem("userNotes", JSON.stringify(userNotes));
  }

  displayNotes(courseNotes);
}

function displayNotes(notes) {
  const container = document.getElementById("courseNotes");
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="fas fa-sticky-note fa-3x text-muted mb-3"></i>
                <h5>No notes yet</h5>
                <p class="text-muted">Add your first note using the button above</p>
            </div>
        `;
    return;
  }

  let html = "";
  notes.forEach((note) => {
    html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card note-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="fw-bold mb-0">${note.title}</h6>
                            <button class="btn btn-sm btn-link text-danger delete-note" 
                                    data-note-id="${note.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <p class="text-muted small mb-3">${note.content.substring(
                          0,
                          100
                        )}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                ${
                                  note.tags
                                    ? note.tags
                                        .map(
                                          (tag) =>
                                            `<span class="badge bg-light text-dark me-1">${tag}</span>`
                                        )
                                        .join("")
                                    : ""
                                }
                            </div>
                            <small class="text-muted">
                                ${new Date(note.date).toLocaleDateString()}
                            </small>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-primary w-100 edit-note" 
                                    data-note-id="${note.id}">
                                <i class="fas fa-edit me-1"></i> Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  });

  container.innerHTML = html;

  // Add event listeners
  document.querySelectorAll(".edit-note").forEach((btn) => {
    btn.addEventListener("click", function () {
      const noteId = this.getAttribute("data-note-id");
      editNote(noteId);
    });
  });

  document.querySelectorAll(".delete-note").forEach((btn) => {
    btn.addEventListener("click", function () {
      const noteId = this.getAttribute("data-note-id");
      deleteNote(noteId);
    });
  });
}

function setupNoteTaking() {
  const addNoteBtn = document.getElementById("addNoteBtn");
  const noteForm = document.getElementById("noteForm");

  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", function () {
      const modal = new bootstrap.Modal(
        document.getElementById("addNoteModal")
      );
      modal.show();
    });
  }

  if (noteForm) {
    noteForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const title = document.getElementById("noteTitle").value;
      const content = document.getElementById("noteContent").value;
      const tags = document.getElementById("noteTags").value;

      if (!title || !content) {
        showAlert("Please fill in all required fields", "danger");
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get("course") || 1;

      saveNote(title, content, tags, courseId);
    });
  }
}

function saveNote(title, content, tags, courseId) {
  let userNotes = JSON.parse(localStorage.getItem("userNotes")) || [];

  const newNote = {
    id: Date.now(),
    title: title,
    content: content,
    tags: tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag),
    date: new Date().toISOString(),
    courseId: courseId,
  };

  userNotes.push(newNote);
  localStorage.setItem("userNotes", JSON.stringify(userNotes));

  // Close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addNoteModal")
  );
  if (modal) modal.hide();

  // Reset form
  document.getElementById("noteForm").reset();

  // Refresh notes display
  loadCourseNotes(courseId);

  showAlert("Note saved successfully!", "success");
}

function editNote(noteId) {
  const userNotes = JSON.parse(localStorage.getItem("userNotes")) || [];
  const note = userNotes.find((n) => n.id == noteId);

  if (!note) return;

  // Populate modal with note data
  document.getElementById("noteTitle").value = note.title;
  document.getElementById("noteContent").value = note.content;
  document.getElementById("noteTags").value = note.tags
    ? note.tags.join(", ")
    : "";

  // Update form submit handler
  const noteForm = document.getElementById("noteForm");
  const originalSubmit = noteForm.onsubmit;

  noteForm.onsubmit = function (e) {
    e.preventDefault();

    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    const tags = document.getElementById("noteTags").value;

    // Update note
    note.title = title;
    note.content = content;
    note.tags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    note.date = new Date().toISOString();

    // Save back to localStorage
    localStorage.setItem("userNotes", JSON.stringify(userNotes));

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addNoteModal")
    );
    if (modal) modal.hide();

    // Refresh display
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("course") || 1;
    loadCourseNotes(courseId);

    showAlert("Note updated!", "success");

    // Restore original handler
    noteForm.onsubmit = originalSubmit;
  };

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("addNoteModal"));
  modal.show();
}

function deleteNote(noteId) {
  if (!confirm("Are you sure you want to delete this note?")) return;

  let userNotes = JSON.parse(localStorage.getItem("userNotes")) || [];
  userNotes = userNotes.filter((note) => note.id != noteId);
  localStorage.setItem("userNotes", JSON.stringify(userNotes));

  // Refresh display
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course") || 1;
  loadCourseNotes(courseId);

  showAlert("Note deleted!", "info");
}

// ===== COURSE RESOURCES =====
function loadCourseResources(courseId) {
  const resourcesContainer = document.getElementById("courseResources");
  if (!resourcesContainer) return;

  // Sample resources
  const resources = [
    {
      id: 1,
      title: "HTML Cheat Sheet",
      type: "pdf",
      size: "2.4 MB",
      url: "#",
      description: "Quick reference for HTML tags",
    },
    {
      id: 2,
      title: "CSS Properties Reference",
      type: "pdf",
      size: "3.1 MB",
      url: "#",
      description: "Complete CSS properties list",
    },
    {
      id: 3,
      title: "JavaScript Basics",
      type: "zip",
      size: "5.2 MB",
      url: "#",
      description: "Code examples and exercises",
    },
    {
      id: 4,
      title: "Project Source Code",
      type: "github",
      size: "GitHub",
      url: "#",
      description: "Complete project files",
    },
  ];

  let html = "";
  resources.forEach((resource) => {
    let icon = "fa-file";
    let badgeClass = "bg-secondary";

    switch (resource.type) {
      case "pdf":
        icon = "fa-file-pdf";
        badgeClass = "bg-danger";
        break;
      case "zip":
        icon = "fa-file-archive";
        badgeClass = "bg-warning";
        break;
      case "github":
        icon = "fa-github";
        badgeClass = "bg-dark";
        break;
    }

    html += `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card resource-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge ${badgeClass}">${resource.type}</span>
                            <small class="text-muted">${resource.size}</small>
                        </div>
                        <h6 class="fw-bold mb-2">${resource.title}</h6>
                        <p class="text-muted small mb-3">${resource.description}</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary flex-fill download-resource" 
                                    data-resource-id="${resource.id}">
                                <i class="fas fa-download me-1"></i> Download
                            </button>
                            <button class="btn btn-sm btn-outline-secondary view-resource" 
                                    data-resource-id="${resource.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  });

  resourcesContainer.innerHTML = html;

  // Add event listeners
  setupResourceDownloads();
}

function setupResourceDownloads() {
  document.querySelectorAll(".download-resource").forEach((btn) => {
    btn.addEventListener("click", function () {
      const resourceId = this.getAttribute("data-resource-id");
      showAlert("Downloading resource...", "info");
      // Simulate download
      setTimeout(() => {
        showAlert("Resource downloaded successfully!", "success");
      }, 1500);
    });
  });
}

// ===== UTILITY FUNCTIONS =====
function getLessonData(lessonId) {
  // This would come from an API in real app
  return {
    id: lessonId,
    title: "Lesson " + lessonId,
    type: "video",
    moduleTitle: "Module " + Math.ceil(lessonId / 4),
  };
}

function markLessonComplete(lessonId, completed) {
  // Save progress to localStorage
  let progress = JSON.parse(localStorage.getItem("lessonProgress")) || {};
  const courseId =
    new URLSearchParams(window.location.search).get("course") || 1;

  if (!progress[courseId]) progress[courseId] = {};
  progress[courseId][lessonId] = {
    completed: completed,
    date: new Date().toISOString(),
  };

  localStorage.setItem("lessonProgress", JSON.stringify(progress));
}

function markLessonViewed(lessonId) {
  let viewed = JSON.parse(localStorage.getItem("viewedLessons")) || [];
  if (!viewed.includes(lessonId)) {
    viewed.push(lessonId);
    localStorage.setItem("viewedLessons", JSON.stringify(viewed));
  }
}

function updateProgressBar() {
  const progressBar = document.querySelector(".progress-bar");
  if (!progressBar) return;

  const courseId =
    new URLSearchParams(window.location.search).get("course") || 1;
  const progress = JSON.parse(localStorage.getItem("lessonProgress")) || {};
  const courseProgress = progress[courseId] || {};

  const totalLessons = 12; // This should be dynamic
  const completedLessons = Object.values(courseProgress).filter(
    (p) => p.completed
  ).length;
  const percentage = Math.round((completedLessons / totalLessons) * 100);

  progressBar.style.width = percentage + "%";
  progressBar.textContent = percentage + "%";
}

function setupLessonNavigation() {
  const prevBtn = document.getElementById("prevLesson");
  const nextBtn = document.getElementById("nextLesson");

  // This would need to track current lesson position
  // For now, just basic functionality
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      showAlert("Previous lesson would load", "info");
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      showAlert("Next lesson would load", "info");
    });
  }
}

function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.classList.remove("show");
      setTimeout(() => alertDiv.remove(), 300);
    }
  }, 5000);
}

// Initialize
updateProgressBar();
