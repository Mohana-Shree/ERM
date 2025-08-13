import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listMyApplications } from '../../services/applications';
import { listUserDocuments } from '../../services/documents';
import { StatusBadge } from '../ui/StatusBadge';
import { DataTable } from '../ui/DataTable';
import { Plus, FileText, Upload } from 'lucide-react';
import type { Application, Document } from '../../types';
import dayjs from 'dayjs';

export function UserDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Partial<Application>[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsData, docsData] = await Promise.all([
          listMyApplications(),
          listUserDocuments(),
        ]);
        setApplications(appsData);
        setDocuments(docsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const applicationColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <StatusBadge status={value as any} />
      ),
    },
    {
      key: 'applied_at',
      label: 'Applied',
      render: (value: string) => dayjs(value).format('MMM DD, YYYY'),
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: Partial<Application>) => (
        <Link
          to={`/applications/${item.id || ''}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </Link>
      ),
    },
  ];

  const documentColumns = [
    {
      key: 'doc_type',
      label: 'Type',
      render: (value: string) => (
        <span className="capitalize">{value.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'uploaded_at',
      label: 'Uploaded',
      render: (value: string) => dayjs(value).format('MMM DD, YYYY'),
      sortable: true,
    },
    {
      key: 'size_bytes',
      label: 'Size',
      render: (value: number) => {
        if (!value) return '-';
        const kb = value / 1024;
        return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
      },
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-8 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Manage your applications and documents
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/apply"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Apply for Role
          </Link>
          <Link
            to="/upload-document"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applications.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applications.filter(app => 
                      app.status && !['rejected', 'withdrawn'].includes(app.status)
                    ).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documents Uploaded
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {documents.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
          <Link
            to="/applications"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>
        
        <DataTable<Partial<Application>>
          data={applications.slice(0, 5)}
          columns={applicationColumns}
          emptyMessage="No applications yet. Start by applying for a role!"
        />
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Documents</h2>
          <Link
            to="/documents"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>
        
        <DataTable
          data={documents.slice(0, 5)}
          columns={documentColumns}
          emptyMessage="No documents uploaded yet."
        />
      </div>
    </div>
  );
}
