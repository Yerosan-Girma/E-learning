import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { enrollmentBadgeClass, getEffectivePrice } from "../utils/courseAdapter";
import { formatCurrency } from "../utils/format";

export default function AdminDashboardPage() {
  const { notify } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [dashboard, teacherData] = await Promise.all([
        api.getDashboard("admin"),
        api.listPendingTeachers(),
      ]);
      setSummary(dashboard.summary || null);
      setPayments(Array.isArray(dashboard.recentPayments) ? dashboard.recentPayments : []);
      setEnrollments(Array.isArray(dashboard.recentEnrollments) ? dashboard.recentEnrollments : []);
      setUsers(Array.isArray(dashboard.users) ? dashboard.users : []);
      setCourses(Array.isArray(dashboard.courses) ? dashboard.courses : []);
      setPendingTeachers(Array.isArray(teacherData.teachers) ? teacherData.teachers : []);
    } catch (error) {
      const errorMessage = typeof error.message === 'string'
        ? error.message
        : (error.message ? JSON.stringify(error.message) : "Failed to load admin dashboard");
      notify(errorMessage, "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleEnrollmentStatus = async (enrollmentId, status) => {
    try {
      await api.updateEnrollmentStatus(enrollmentId, status);
      notify(`Enrollment ${status}.`, "success");
      await loadAdminData();
    } catch (error) {
      notify(error.message || "Failed to update enrollment status", "danger");
    }
  };

  const handleUserStatus = async (userId, status) => {
    try {
      await api.updateUserStatus(userId, status);
      notify(`User status updated to ${status}.`, "success");
      await loadAdminData();
    } catch (error) {
      notify(error.message || "Failed to update user status", "danger");
    }
  };

  const handlePaymentStatus = async (paymentId, status) => {
    try {
      await api.updatePaymentStatus(paymentId, status);
      notify(`Payment ${status}.`, "success");
      await loadAdminData();
    } catch (error) {
      notify(error.message || "Failed to update payment status", "danger");
    }
  };

  const handleApproveTeacher = async (userId) => {
    try {
      await api.approveTeacher(userId);
      notify("Teacher application approved. Account is now active.", "success");
      await loadAdminData();
    } catch (error) {
      notify(error.message || "Failed to approve teacher", "danger");
    }
  };

  const handleRejectTeacher = async (userId) => {
    try {
      await api.rejectTeacher(userId);
      notify("Teacher application rejected.", "warning");
      await loadAdminData();
    } catch (error) {
      notify(error.message || "Failed to reject teacher", "danger");
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Admin Dashboard</h2>
        <p className="text-muted mb-0">
          Monitor users, courses, enrollments, payments, and premium access across the platform.
        </p>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading admin dashboard...</div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Users by Role</h6>
                  {(summary?.usersByRole || []).map((entry) => (
                    <div className="d-flex justify-content-between mb-2" key={entry.role}>
                      <span className="text-capitalize">{entry.role}</span>
                      <strong>{entry.total}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Platform Totals</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Courses</span>
                    <strong>{summary?.totalCourses || 0}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Enrollments</span>
                    <strong>{summary?.totalEnrollments || 0}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Quizzes</span>
                    <strong>{summary?.totalQuizzes || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Revenue</h6>
                  <h3 className="fw-bold mb-2">{formatCurrency(summary?.totalRevenue || 0)}</h3>
                  <small className="text-muted">Completed simulated payments</small>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Payments by Status</h6>
                  {(summary?.paymentsByStatus || []).map((entry) => (
                    <div className="d-flex justify-content-between mb-2" key={entry.status}>
                      <span className="text-capitalize">{entry.status}</span>
                      <strong>{entry.total}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  Teacher Applications
                  {pendingTeachers.length > 0 && (
                    <span className="badge bg-warning text-dark ms-2">{pendingTeachers.length} pending</span>
                  )}
                </h5>
              </div>
              {pendingTeachers.length === 0 ? (
                <p className="text-muted mb-0">No pending teacher applications.</p>
              ) : (
                <div className="row g-3">
                  {pendingTeachers.map((teacher) => (
                    <div className="col-lg-6" key={teacher.id}>
                      <div className="border rounded p-3 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold mb-0">{teacher.full_name}</h6>
                            <small className="text-muted">{teacher.email}</small>
                          </div>
                          <span className="badge bg-warning text-dark">Pending</span>
                        </div>
                        {teacher.specialization && (
                          <p className="small mb-1">
                            <strong>Specialization:</strong> {teacher.specialization}
                          </p>
                        )}
                        {teacher.proposed_course && (
                          <p className="small mb-1">
                            <strong>Proposed course:</strong> {teacher.proposed_course}
                          </p>
                        )}
                        {teacher.bio && (
                          <p className="small text-muted mb-3" style={{ maxHeight: 80, overflow: "hidden" }}>
                            {teacher.bio}
                          </p>
                        )}
                        <div className="d-flex gap-2 mt-auto">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleApproveTeacher(teacher.id)}
                          >
                            <i className="fas fa-check me-1" />Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRejectTeacher(teacher.id)}
                          >
                            <i className="fas fa-times me-1" />Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">User Management</h5>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td className="text-capitalize">{user.role}</td>
                        <td>
                          <span className={`badge bg-${enrollmentBadgeClass(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              user.status === "active" ? "btn-outline-danger" : "btn-outline-success"
                            }`}
                            onClick={() =>
                              handleUserStatus(user.id, user.status === "active" ? "inactive" : "active")
                            }
                          >
                            {user.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Enrollment Management</h5>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>
                          <div className="fw-bold">{enrollment.student_name}</div>
                          <small className="text-muted">{enrollment.student_email}</small>
                        </td>
                        <td>{enrollment.course_title}</td>
                        <td>
                          <span className={`badge bg-${enrollmentBadgeClass(enrollment.status)} text-uppercase`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => handleEnrollmentStatus(enrollment.id, "approved")}
                              disabled={enrollment.status === "approved"}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleEnrollmentStatus(enrollment.id, "rejected")}
                              disabled={enrollment.status === "rejected"}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Payment Management</h5>
                  {payments.length === 0 ? (
                    <p className="text-muted mb-0">No payments found.</p>
                  ) : (
                    payments.map((payment) => (
                      <div className="border rounded p-3 mb-2" key={payment.id}>
                        <strong>{payment.course_title}</strong>
                        <div className="small text-muted">
                          {payment.user_name} paid {formatCurrency(payment.amount)} via{" "}
                          {payment.gateway.replace("_", " ")}
                        </div>
                        <div className="small text-muted">
                          Status: {payment.status} - {payment.transaction_id}
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handlePaymentStatus(payment.id, "completed")}
                            disabled={payment.status === "completed"}
                          >
                            Approve Payment
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handlePaymentStatus(payment.id, "failed")}
                            disabled={payment.status === "failed"}
                          >
                            Reject Payment
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Course Catalog Monitor</h5>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Instructor</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.id}>
                            <td>{course.title}</td>
                            <td>{course.instructor_name}</td>
                            <td>{getEffectivePrice(course) <= 0 ? "Free" : "Paid"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
