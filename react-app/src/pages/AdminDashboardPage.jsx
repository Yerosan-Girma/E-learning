import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

function badgeClass(status) {
  if (status === "completed" || status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "failed" || status === "rejected") return "danger";
  return "secondary";
}

export default function AdminDashboardPage() {
  const { notify } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashboard, enrollmentData] = await Promise.all([
        api.getDashboard("admin"),
        api.allEnrollments(),
      ]);

      setSummary(dashboard.summary || null);
      setPayments(dashboard.recentPayments || []);
      setEnrollments(enrollmentData.enrollments || []);
    } catch (error) {
      notify(error.message || "Failed to load admin dashboard", "danger");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Admin Dashboard</h2>
        <p className="text-muted mb-0">System-level overview of users, courses, payments, and enrollments.</p>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading admin dashboard...</div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
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
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Platform Stats</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Courses</span>
                    <strong>{summary?.totalCourses || 0}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Enrollments</span>
                    <strong>{enrollments.length}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Recent Payments</span>
                    <strong>{payments.length}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
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
              <h5 className="fw-bold mb-3">Enrollment Management</h5>
              {enrollments.length === 0 ? (
                <p className="text-muted mb-0">No enrollments found.</p>
              ) : (
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
                      {enrollments.slice(0, 20).map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td>
                            <div className="fw-bold">{enrollment.student_name}</div>
                            <small className="text-muted">{enrollment.student_email}</small>
                          </td>
                          <td>{enrollment.course_title}</td>
                          <td>
                            <span className={`badge bg-${badgeClass(enrollment.status)} text-uppercase`}>
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
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Recent Payments</h5>
              {payments.length === 0 ? (
                <p className="text-muted mb-0">No payments found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Course</th>
                        <th>Amount</th>
                        <th>Gateway</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.user_name || payment.email}</td>
                          <td>{payment.course_title}</td>
                          <td>${Number(payment.amount || 0).toFixed(2)}</td>
                          <td className="text-uppercase">{payment.gateway}</td>
                          <td>
                            <span className={`badge bg-${badgeClass(payment.status)} text-uppercase`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
