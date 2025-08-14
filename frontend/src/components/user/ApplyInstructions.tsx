import React from 'react';
import { Info, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplyInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center mb-4">
          <Info className="text-blue-500 h-6 w-6 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Application Instructions
          </h2>
        </div>

        {/* Instructions */}
        <div className="text-gray-600 dark:text-gray-300 mb-6 space-y-2">
          <p>Before you apply, please ensure the following:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>You can choose Internship or Full-time Employee position.</li>
            <li>Prepare your resume in PDF format (max 10MB).</li>
            <li>Certificates are optional but recommended.</li>
            <li>Once submitted, you can track your status anytime.</li>
          </ul>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/apply/form')}
            className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            <Send className="mr-2 h-4 w-4" />
            Start Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyInstructions;
