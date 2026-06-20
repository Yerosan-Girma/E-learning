import React from "react";
import { Award, Download, Calendar, CheckCircle } from "lucide-react";

export default function CertificateCard({ certificate, onView, onDownload }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-white" />
            <h3 className="text-white font-semibold text-lg">Certificate</h3>
          </div>
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
            Verified
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-gray-800 text-lg mb-2">
          {certificate.course_title}
        </h4>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              Issued: {new Date(certificate.issue_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>
              Certificate #: {certificate.certificate_number}
            </span>
          </div>
          {certificate.instructor_name && (
            <div className="text-gray-500">
              Instructor: {certificate.instructor_name}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView(certificate)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Certificate
          </button>
          <button
            onClick={() => onDownload(certificate)}
            className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
