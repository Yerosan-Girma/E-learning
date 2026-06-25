import { useRef } from "react";
import { useAuth } from "../../context/AuthContext";

/**
 * PrintableCertificate
 * Props:
 *  - certificate: { student_name, course_title, instructor_name, issue_date, certificate_number, verification_code }
 *  - onClose: () => void
 */
export default function PrintableCertificate({ certificate, onClose }) {
  const printRef = useRef(null);
  const { user } = useAuth();

  // Prefer the name stored on the certificate (from DB join on users table).
  // Fall back to the logged-in user's profile name so it's never blank.
  const studentName =
    certificate.student_name ||
    user?.name ||
    certificate.student_email?.split("@")[0] ||
    "Student";

  const issueDate = certificate.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print styles — only active during window.print() */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cert-printable, #cert-printable * { visibility: visible !important; }
          #cert-printable {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .cert-actions { display: none !important; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ background: "rgba(0,0,0,0.65)", zIndex: 1055 }}
        onClick={onClose}
      >
        <div
          className="d-flex flex-column gap-3"
          style={{ width: "min(860px, 96vw)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Action bar */}
          <div className="cert-actions d-flex justify-content-between align-items-center">
            <span className="text-white fw-semibold fs-5">Certificate of Completion</span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handlePrint}
              >
                <i className="fas fa-print" />
                Print / Save as PDF
              </button>
              <button
                type="button"
                className="btn btn-outline-light d-flex align-items-center gap-2"
                onClick={onClose}
              >
                <i className="fas fa-times" />
                Close
              </button>
            </div>
          </div>

          {/* The certificate itself */}
          <div id="cert-printable" ref={printRef}>
            <div
              style={{
                background: "#fff",
                width: "100%",
                aspectRatio: "1.414 / 1", // A4 landscape ratio
                position: "relative",
                fontFamily: "'Georgia', 'Times New Roman', serif",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
              }}
            >
              {/* Outer gold border */}
              <div
                style={{
                  position: "absolute",
                  inset: "12px",
                  border: "3px solid #b8972a",
                  pointerEvents: "none",
                }}
              />
              {/* Inner thin border */}
              <div
                style={{
                  position: "absolute",
                  inset: "20px",
                  border: "1px solid #d4af37",
                  pointerEvents: "none",
                }}
              />

              {/* Corner ornaments */}
              {["top-0 start-0", "top-0 end-0", "bottom-0 start-0", "bottom-0 end-0"].map(
                (pos, i) => (
                  <div
                    key={i}
                    className={`position-absolute ${pos}`}
                    style={{
                      width: 60,
                      height: 60,
                      margin: 8,
                      border: "2px solid #b8972a",
                      borderRadius:
                        i === 0
                          ? "0 0 100% 0"
                          : i === 1
                          ? "0 0 0 100%"
                          : i === 2
                          ? "0 100% 0 0"
                          : "100% 0 0 0",
                    }}
                  />
                )
              )}

              {/* Content */}
              <div
                className="d-flex flex-column align-items-center justify-content-center h-100 text-center px-5"
                style={{ gap: "0.4em", paddingTop: "2.5%", paddingBottom: "2.5%" }}
              >
                {/* Logo / icon */}
                <div style={{ marginBottom: "0.2em" }}>
                  <i
                    className="fas fa-graduation-cap"
                    style={{ fontSize: "clamp(28px, 4.5vw, 52px)", color: "#1a3a6b" }}
                  />
                </div>

                {/* Platform name */}
                <div
                  style={{
                    fontSize: "clamp(11px, 1.5vw, 16px)",
                    letterSpacing: "0.35em",
                    color: "#b8972a",
                    textTransform: "uppercase",
                    fontFamily: "sans-serif",
                    fontWeight: 600,
                  }}
                >
                  EduLearn Platform
                </div>

                {/* Title */}
                <h1
                  style={{
                    fontSize: "clamp(20px, 3.5vw, 42px)",
                    color: "#1a3a6b",
                    fontWeight: 700,
                    margin: "0.15em 0",
                    letterSpacing: "0.02em",
                  }}
                >
                  Certificate of Completion
                </h1>

                {/* Decorative rule */}
                <div
                  style={{
                    width: "40%",
                    height: "2px",
                    background: "linear-gradient(to right, transparent, #b8972a, transparent)",
                    margin: "0.2em 0",
                  }}
                />

                <p
                  style={{
                    fontSize: "clamp(10px, 1.4vw, 15px)",
                    color: "#555",
                    margin: "0.1em 0",
                    fontStyle: "italic",
                  }}
                >
                  This is to certify that
                </p>

                {/* Student name */}
                <h2
                  style={{
                    fontSize: "clamp(18px, 3vw, 38px)",
                    color: "#b8972a",
                    fontWeight: 700,
                    margin: "0.1em 0",
                    borderBottom: "2px solid #e8d5a3",
                    paddingBottom: "0.15em",
                    minWidth: "40%",
                  }}
                >
                  {studentName}
                </h2>

                <p
                  style={{
                    fontSize: "clamp(10px, 1.4vw, 15px)",
                    color: "#555",
                    margin: "0.1em 0",
                    fontStyle: "italic",
                  }}
                >
                  has successfully completed the course
                </p>

                {/* Course title */}
                <h3
                  style={{
                    fontSize: "clamp(14px, 2.2vw, 26px)",
                    color: "#1a3a6b",
                    fontWeight: 700,
                    margin: "0.1em 0",
                    maxWidth: "70%",
                  }}
                >
                  {certificate.course_title}
                </h3>

                {/* Instructor */}
                {certificate.instructor_name && (
                  <p
                    style={{
                      fontSize: "clamp(9px, 1.2vw, 13px)",
                      color: "#666",
                      margin: "0.15em 0",
                      fontFamily: "sans-serif",
                    }}
                  >
                    Instructed by{" "}
                    <strong style={{ color: "#333" }}>{certificate.instructor_name}</strong>
                  </p>
                )}

                {/* Decorative rule */}
                <div
                  style={{
                    width: "40%",
                    height: "1px",
                    background: "linear-gradient(to right, transparent, #b8972a, transparent)",
                    margin: "0.3em 0",
                  }}
                />

                {/* Footer row */}
                <div
                  className="d-flex justify-content-between w-100"
                  style={{
                    paddingInline: "8%",
                    fontFamily: "sans-serif",
                    marginTop: "0.2em",
                  }}
                >
                  <div className="text-start">
                    <div
                      style={{
                        fontSize: "clamp(8px, 1vw, 11px)",
                        color: "#888",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Issue Date
                    </div>
                    <div
                      style={{
                        fontSize: "clamp(9px, 1.2vw, 13px)",
                        color: "#333",
                        fontWeight: 600,
                      }}
                    >
                      {issueDate}
                    </div>
                  </div>

                  {/* Centre seal */}
                  <div className="text-center">
                    <div
                      style={{
                        width: "clamp(40px, 6vw, 70px)",
                        height: "clamp(40px, 6vw, 70px)",
                        borderRadius: "50%",
                        border: "2px solid #b8972a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fffbf0",
                        margin: "0 auto",
                      }}
                    >
                      <i
                        className="fas fa-award"
                        style={{
                          color: "#b8972a",
                          fontSize: "clamp(16px, 2.5vw, 28px)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-end">
                    <div
                      style={{
                        fontSize: "clamp(8px, 1vw, 11px)",
                        color: "#888",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Certificate No.
                    </div>
                    <div
                      style={{
                        fontSize: "clamp(8px, 1vw, 11px)",
                        color: "#333",
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                    >
                      {certificate.certificate_number}
                    </div>
                  </div>
                </div>

                {/* Verification code */}
                <div
                  style={{
                    fontSize: "clamp(7px, 0.9vw, 10px)",
                    color: "#aaa",
                    fontFamily: "monospace",
                    marginTop: "0.2em",
                  }}
                >
                  Verify at: {window.location.origin}/verify/{certificate.verification_code}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
