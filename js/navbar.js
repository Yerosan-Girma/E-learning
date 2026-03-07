// Simple Navbar Active State
document.addEventListener("DOMContentLoaded", function () {
  console.log("Navbar loaded");

  // Set active state based on current page
  setActiveNavbar();

  // Add smooth scrolling for anchor links
  setupSmoothScroll();

  // Update login button if user is logged in
  updateLoginButton();
});

// Set active navbar item
function setActiveNavbar() {
  // Get current page
  const currentPage = window.location.pathname;
  const hash = window.location.hash;

  console.log("Current page:", currentPage, "Hash:", hash);

  // Remove active class from all nav links
  document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Remove active class from all buttons
  document.querySelectorAll(".navbar-nav .btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Set active based on current page
  if (
    currentPage.endsWith("index.html") ||
    currentPage === "/" ||
    currentPage === ""
  ) {
    // Home page
    if (hash) {
      // Highlight the anchor link (About, Features, etc.)
      const anchorLink = document.querySelector(
        `.navbar-nav .nav-link[href="${hash}"]`
      );
      if (anchorLink) {
        anchorLink.classList.add("active");
      }
    } else {
      // Highlight Home
      const homeLink = document.querySelector(
        '.navbar-nav .nav-link[href="index.html"]'
      );
      if (homeLink) {
        homeLink.classList.add("active");
      }
    }
  } else if (currentPage.endsWith("courses.html")) {
    // Courses page
    const coursesDropdown = document.querySelector(
      ".navbar-nav .dropdown-toggle"
    );
    if (coursesDropdown) {
      coursesDropdown.classList.add("active");
      coursesDropdown.parentElement.classList.add("active");
    }
  } else if (
    currentPage.endsWith("dashboard.html") ||
    currentPage.endsWith("learning.html")
  ) {
    // Dashboard page
    const dashboardBtn = document.querySelector(
      '.navbar-nav .btn[href="dashboard.html"]'
    );
    if (dashboardBtn) {
      dashboardBtn.classList.add("active");
    }
  }

  // Highlight buttons when clicked
  document.querySelectorAll(".navbar-nav .btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active from all buttons
      document.querySelectorAll(".navbar-nav .btn").forEach((b) => {
        b.classList.remove("active");
      });
      // Add active to clicked button
      this.classList.add("active");
    });
  });
}

// Setup smooth scrolling for anchor links
function setupSmoothScroll() {
  document.querySelectorAll('.navbar-nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Only handle anchor links, not page links
      if (href.startsWith("#") && href.length > 1) {
        e.preventDefault();

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Scroll to element
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for fixed navbar
            behavior: "smooth",
          });

          // Update URL hash without scrolling
          history.pushState(null, null, href);

          // Update active navbar item
          setActiveNavbar();
        }
      }
    });
  });
}

// Update login button based on user status
function updateLoginButton() {
  const loginBtn = document.getElementById("loginBtn");
  const loginText = document.getElementById("loginText");

  if (!loginBtn || !loginText) return;

  // Check if user is logged in (from localStorage)
  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
  const userName = localStorage.getItem("userName");

  if (isLoggedIn && userName) {
    // User is logged in
    loginText.textContent = userName.split(" ")[0]; // First name
    loginBtn.innerHTML =
      '<i class="fas fa-user me-1"></i>' + loginText.textContent;
    loginBtn.href = "dashboard.html";
    loginBtn.removeAttribute("data-bs-toggle");
    loginBtn.removeAttribute("data-bs-target");

    // Change click behavior
    loginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "dashboard.html";
    });
  }
}

// Update navbar on hash change (when clicking anchor links)
window.addEventListener("hashchange", function () {
  setActiveNavbar();
});

// Add scroll effect to navbar
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("navbar-scrolled");
  } else {
    navbar.classList.remove("navbar-scrolled");
  }
});
