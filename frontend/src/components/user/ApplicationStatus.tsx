import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, FileText, Award, Video } from 'lucide-react';

const ApplicationStatus = () => {
  const [application] = useState({
    id: '1',
    type: 'intern',
    status: 'interview_scheduled',
    applied_at: '2024-01-15T10:00:00Z',
    interview: {
      scheduled_for: '2024-01-22T14:00:00Z',
      duration_minutes: 60,
      meet_link: 'https://meet.google.com/abc-def-ghi'
    },
    offer: {
      stipend: 15000,
      duration_months: 6,
      start_date: '2024-02-01',
      end_date: '2024-07-31'
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'interview_scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'offered':
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'interview_scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'offered':
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="mr-3 h-6 w-6" />
            Application Status
          </h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {application.type} Position
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Applied on {formatDateTime(application.applied_at)}
              </p>
            </div>
            <div className="flex items-center">
              {getStatusIcon(application.status)}
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['submitted', 'under_review', 'interview_scheduled', 'offered', 'accepted'].map((step, index) => {
                const isActive = ['submitted', 'under_review', 'interview_scheduled'].includes(application.status);
                const isCompleted = ['submitted', 'under_review'].includes(step) && application.status !== 'submitted';
                
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : 
                      application.status === step ? 'bg-blue-500' : 
                      'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                      {step.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interview Details */}
          {application.status === 'interview_scheduled' && application.interview && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center mb-3">
                <Video className="mr-2 h-5 w-5" />
                Interview Scheduled
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Date & Time:</strong> {formatDateTime(application.interview.scheduled_for)}</p>
                <p><strong>Duration:</strong> {application.interview.duration_minutes} minutes</p>
                <a 
                  href={application.interview.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </a>
              </div>
            </div>
          )}

          {/* Offer Details */}
          {['offered', 'accepted'].includes(application.status) && application.offer && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-900 dark:text-green-100 flex items-center mb-3">
                <Award className="mr-2 h-5 w-5" />
                Offer Letter
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Position:</strong> {application.type}</p>
                <p><strong>Stipend:</strong> ₹{application.offer.stipend}/month</p>
                <p><strong>Duration:</strong> {application.offer.duration_months} months</p>
                <p><strong>Start Date:</strong> {application.offer.start_date}</p>
                <p><strong>End Date:</strong> {application.offer.end_date}</p>
              </div>
              {application.status === 'offered' && (
                <div className="mt-4 space-x-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Accept Offer
                  </button>
                  <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                    Download Offer Letter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Additional Documents Needed */}
          {application.status === 'accepted' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">
                Additional Documents Required
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                Please submit the following documents to complete your onboarding:
              </p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" />
                  <span className="text-sm">Bank Details (Account Number, IFSC Code)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" />
                  <span className="text-sm">Aadhaar Card</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" />
                  <span className="text-sm">PAN Card</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" />
                  <span className="text-sm">Signed Offer Letter</span>
                </label>
              </div>
              <button className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                Upload Documents
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;