import React from "react";
import { Award, Download, Calendar, CheckCircle, ExternalLink } from "lucide-react";

export default function CertificateCard({ certificate, onView, onDownload }) {
  const issueDateFormatted = certificate?.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently issued";

  return (
    <div className="card certificate-card h-100 shadow-sm border-0">
      <div className="certificate-card-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Award className="text-warning" size={22} />
          <h6 className="text-white fw-bold mb-0">Verified Certificate</h6>
        </div>
        <span className="badge bg-white bg-opacity-25 text-white px-2 py-1 rounded-pill small">
          Official
        </span>
      </div>

      <div className="card-body p-4 d-flex flex-column">
        <h5 className="card-title fw-bold text-dark mb-3 text-truncate-2" title={certificate.course_title}>
          {certificate.course_title}
        </h5>

        <div className="small text-muted mb-4 d-flex flex-column gap-2">
          <div className="d-flex align-items-center gap-2">
            <Calendar size={16} className="text-primary flex-shrink-0" />
            <span>Issued: {issueDateFormatted}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <CheckCircle size={16} className="text-success flex-shrink-0" />
            <span className="text-truncate">
              ID: <code className="text-dark bg-light px-1 py-0.5 rounded">{certificate.certificate_number}</code>
            </span>
          </div>
          {certificate.instructor_name && (
            <div className="text-muted text-truncate ps-1 border-start border-2 border-primary-subtle">
              Instructor: <strong>{certificate.instructor_name}</strong>
            </div>
          )}
        </div>

        <div className="d-flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onView(certificate)}
            className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
          >
            <ExternalLink size={16} />
            <span>View Certificate</span>
          </button>
          <button
            type="button"
            onClick={() => onDownload(certificate)}
            className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center justify-content-center"
            title="Download Certificate"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
