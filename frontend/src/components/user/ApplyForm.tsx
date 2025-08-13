import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApplication } from '../../services/applications';

import { Select } from '../ui/Select';
import { FileUpload } from '../ui/FileUpload';
import type { ApplicationType } from '../../types';

export function ApplyForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '' as ApplicationType | '',
    coverLetter: '',
  });
  const [resumeFile, setResumeFile] = useState<File[]>([]);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applicationTypeOptions = [
    { value: 'intern', label: 'Internship' },
    { value: 'employee', label: 'Full-time Employee' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.type || !resumeFile.length) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await createApplication({
        type: formData.type as ApplicationType,
        coverLetter: formData.coverLetter,
        resumeFile: resumeFile[0],
        certificates: certificateFiles.length > 0 ? certificateFiles : undefined,
      });

      navigate('/dashboard', { 
        state: { message: 'Application submitted successfully!' }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Apply for Role</h1>
        <p className="mt-2 text-gray-600">
          Submit your application for an internship or full-time position
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <Select
          label="Position Type"
          name="type"
          value={formData.type}
          onChange={(value) => handleInputChange('type', value)}
          options={applicationTypeOptions}
          placeholder="Select position type"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Letter <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.coverLetter}
            onChange={(e) => handleInputChange('coverLetter', e.target.value)}
            rows={6}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us why you're interested in this role and what makes you a great candidate..."
            required
          />
        </div>

        <FileUpload
          label="Resume/CV"
          name="resume"
          accept=".pdf,.doc,.docx"
          maxSize={5 * 1024 * 1024} // 5MB
          value={resumeFile}
          onChange={setResumeFile}
          required
        />

        <FileUpload
          label="Certificates (Optional)"
          name="certificates"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          maxSize={10 * 1024 * 1024} // 10MB
          value={certificateFiles}
          onChange={setCertificateFiles}
        />

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
