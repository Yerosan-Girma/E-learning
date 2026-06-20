import React from "react";
import { Award, X, Download, Share2 } from "lucide-react";

export default function CertificateView({ certificate, onClose, onDownload }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Certificate</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-8">
          <div className="border-8 border-double border-blue-600 p-8 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Award className="w-16 h-16 text-blue-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Certificate of Completion
                </h1>
                <p className="text-gray-600">This is to certify that</p>
              </div>

              <div className="py-4">
                <h2 className="text-2xl font-bold text-blue-800">
                  {certificate.student_name}
                </h2>
              </div>

              <div className="text-gray-700 space-y-2">
                <p>has successfully completed the course</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {certificate.course_title}
                </h3>
              </div>

              {certificate.instructor_name && (
                <div className="text-gray-600">
                  <p>Instructor: {certificate.instructor_name}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t border-gray-300">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Certificate Number</p>
                  <p className="font-semibold text-gray-800 font-mono">
                    {certificate.certificate_number}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-gray-500">
                  Verification Code: {certificate.verification_code}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => onDownload(certificate)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/verify-certificate/${certificate.verification_code}`
                );
              }}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Share2 className="w-5 h-5" />
              Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
