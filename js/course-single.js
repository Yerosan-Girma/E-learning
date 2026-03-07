// ===== ENHANCED ENROLLMENT WITH PAYMENT =====
function setupEnrollment() {
  const enrollBtn = document.getElementById("enrollButton");
  if (!enrollBtn) return;

  enrollBtn.addEventListener("click", function () {
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";

    if (!isLoggedIn) {
      // Show login modal
      const loginModal = new bootstrap.Modal(
        document.getElementById("loginModal")
      );
      loginModal.show();
    } else {
      // Check if already enrolled
      const courseId = getCourseIdFromURL();
      if (isCourseEnrolled(courseId)) {
        showAlert("You are already enrolled in this course!", "info");
        window.location.href = "learning.html?course=" + courseId;
        return;
      }

      // Show payment modal
      showPaymentModal(courseId);
    }
  });
}

function isCourseEnrolled(courseId) {
  const enrolledCourses =
    JSON.parse(localStorage.getItem("enrolledCourses")) || [];
  return enrolledCourses.some(
    (course) => course.id == courseId && course.status === "approved"
  );
}

function showPaymentModal(courseId) {
  const courseTitle = document.getElementById("courseMainTitle").textContent;
  const coursePrice = document.getElementById("coursePrice").textContent;

  // Create payment modal if doesn't exist
  if (!document.getElementById("paymentModal")) {
    const modalHTML = `
      <div class="modal fade" id="paymentModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Complete Enrollment</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-info">
                <h6><i class="fas fa-info-circle me-2"></i>Payment Instructions</h6>
                <p>Please make payment using one of the following methods and upload the screenshot:</p>
                <div class="row mt-3">
                  <div class="col-md-6">
                    <div class="card border-primary">
                      <div class="card-body">
                        <h6 class="fw-bold">Bank Transfer</h6>
                        <p class="mb-1"><strong>Bank:</strong> EduLearn Bank</p>
                        <p class="mb-1"><strong>Account:</strong> 1234567890</p>
                        <p class="mb-0"><strong>Name:</strong> EduLearn Inc.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card border-success">
                      <div class="card-body">
                        <h6 class="fw-bold">Mobile Payment</h6>
                        <p class="mb-1"><strong>CBE Birr:</strong> 0911-223344</p>
                        <p class="mb-1"><strong>Telebirr:</strong> 2519-112233</p>
                        <p class="mb-0"><strong>M-Birr:</strong> 2519-001122</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form id="paymentForm">
                <input type="hidden" id="paymentCourseId" value="${courseId}">
                <input type="hidden" id="paymentCourseTitle" value="${courseTitle}">
                <input type="hidden" id="paymentAmount" value="${coursePrice.replace(
                  "$",
                  ""
                )}">
                
                <div class="mb-3">
                  <label for="paymentMethod" class="form-label">Payment Method</label>
                  <select class="form-select" id="paymentMethod" required>
                    <option value="">Select Payment Method</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cbe">CBE Birr</option>
                    <option value="telebirr">Telebirr</option>
                    <option value="mbirr">M-Birr</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="transactionId" class="form-label">Transaction ID</label>
                  <input type="text" class="form-control" id="transactionId" 
                         placeholder="Enter transaction reference number">
                </div>
                
                <div class="mb-3">
                  <label for="paymentScreenshot" class="form-label">Upload Payment Screenshot *</label>
                  <input type="file" class="form-control" id="paymentScreenshot" 
                         accept="image/*" required>
                  <div class="form-text">Upload clear screenshot of payment confirmation (Max 5MB)</div>
                </div>
                
                <div id="screenshotPreview" class="mb-3"></div>
                
                <div class="mb-3">
                  <label for="paymentNotes" class="form-label">Additional Notes (Optional)</label>
                  <textarea class="form-control" id="paymentNotes" rows="2" 
                            placeholder="Any additional information for admin..."></textarea>
                </div>
                
                <div class="alert alert-warning">
                  <small>
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Your enrollment will be activated within 24 hours after admin verifies your payment.
                  </small>
                </div>
                
                <button type="submit" class="btn btn-primary w-100">
                  <i class="fas fa-paper-plane me-2"></i>Submit for Approval
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  } else {
    // Update existing modal values
    document.getElementById("paymentCourseId").value = courseId;
    document.getElementById("paymentCourseTitle").value = courseTitle;
    document.getElementById("paymentAmount").value = coursePrice.replace(
      "$",
      ""
    );
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

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const courseId = document.getElementById("paymentCourseId").value;
    const courseTitle = document.getElementById("paymentCourseTitle").value;
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
    screenshot: screenshot ? screenshot.name : "No file",
    notes: notes,
    status: "pending",
    date: new Date().toISOString(),
    userEmail: localStorage.getItem("userEmail"),
    userName: localStorage.getItem("userName"),
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
    enrollBtn.innerHTML = '<i class="fas fa-clock me-2"></i> Pending Approval';
    enrollBtn.classList.remove("btn-primary");
    enrollBtn.classList.add("btn-warning");
    enrollBtn.disabled = true;

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("paymentModal")
    );
    if (modal) modal.hide();

    showAlert(
      "Payment submitted successfully! Admin will approve within 24 hours.",
      "success"
    );
  }, 1500);
}

function getCourseIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id") || 1;
}
