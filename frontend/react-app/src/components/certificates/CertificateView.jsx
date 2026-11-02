import React, { useState, useEffect } from "react";
import { Award, X, Download, Share2, Check } from "lucide-react";

export default function CertificateView({ certificate, onClose, onDownload }) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!certificate) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/verify-certificate/${certificate.verification_code || certificate.certificate_number}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDate = certificate.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Verified on record";

  return (
    <div
      className="certificate-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="certificate-modal-dialog">
        {/* Modal Top Bar */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white sticky-top rounded-top-4">
          <div className="d-flex align-items-center gap-2">
            <Award className="text-warning" size={24} />
            <h5 className="fw-bold mb-0 text-dark">Official Certificate</h5>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-outline-secondary rounded-circle p-1 d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Certificate Document */}
        <div className="p-4 p-md-5 bg-light">
          <div className="certificate-paper text-center">
            {/* Seal Icon */}
            <div className="certificate-seal mx-auto">
              <Award size={38} className="text-white" />
            </div>

            <div className="mb-4">
              <p className="text-uppercase text-muted fw-bold mb-1 letter-spacing-1 small">
                EduLearn Academic Credential
              </p>
              <h2 className="fw-bold text-dark mb-2">Certificate of Completion</h2>
              <p className="text-muted fst-italic mb-0">This is to proudly certify that</p>
            </div>

            {/* Recipient Name */}
            <div className="my-3 py-2 border-bottom border-top border-primary-subtle d-inline-block px-5">
              <h3 className="fw-bold text-primary mb-0" style={{ letterSpacing: "-0.01em" }}>
                {certificate.student_name || "Valued Learner"}
              </h3>
            </div>

            <div className="mt-3 mb-4">
              <p className="text-muted mb-1">has successfully completed all required modules and assessments for</p>
              <h4 className="fw-bold text-dark mb-2">{certificate.course_title}</h4>
              {certificate.instructor_name && (
                <p className="small text-muted mb-0">
                  Course Instructor: <strong>{certificate.instructor_name}</strong>
                </p>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="row g-3 pt-4 border-top text-start">
              <div className="col-sm-6">
                <small className="text-muted d-block text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                  Issue Date
                </small>
                <strong className="text-dark">{formattedDate}</strong>
              </div>
              <div className="col-sm-6 text-sm-end">
                <small className="text-muted d-block text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                  Certificate Number
                </small>
                <code className="text-primary fw-bold" style={{ fontSize: "0.9rem" }}>
                  {certificate.certificate_number}
                </code>
              </div>
            </div>

            {certificate.verification_code && (
              <div className="mt-3 pt-2 text-center">
                <span className="badge bg-light text-secondary border small">
                  Verification Code: {certificate.verification_code}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
            <button
              type="button"
              onClick={() => onDownload(certificate)}
              className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
            >
              <Download size={18} />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4"
            >
              {copied ? <Check size={18} className="text-success" /> : <Share2 size={18} />}
              <span>{copied ? "Link Copied!" : "Share Link"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-light px-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
