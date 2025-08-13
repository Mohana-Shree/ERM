import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAllApplicationsForAdmin } from '../../services/applications';
import { StatusBadge } from '../ui/StatusBadge';
import { DataTable } from '../ui/DataTable';
import { Select } from '../ui/Select';
import { Eye, Users, FileText, Clock } from 'lucide-react';
import type { Application } from '../../types';
import dayjs from 'dayjs';

export function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (statusFilter) {
      setFilteredApplications(
        applications.filter(app => app.status === statusFilter)
      );
    } else {
      setFilteredApplications(applications);
    }
  }, [applications, statusFilter]);

  const fetchApplications = async () => {
    try {
      const data = await listAllApplicationsForAdmin({});
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'offered', label: 'Offered' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ];

  const columns = [
    {
      key: 'user',
      label: 'Applicant',
      render: (_: any, item: Application) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.user?.name || 'Unknown'}
          </div>
          <div className="text-sm text-gray-500">
            {item.user?.email || 'No email'}
          </div>
        </div>
      ),
    },
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
      render: (_: any, item: Application) => (
        <Link
          to={`/admin/applicants/${item.id}`}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Link>
      ),
    },
  ];

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    applications.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-8 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage job applications and candidates
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-400" />
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
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Under Review
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statusCounts.under_review || 0}
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
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Interview Scheduled
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statusCounts.interview_scheduled || 0}
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
                    Offered
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statusCounts.offered || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">All Applications</h2>
          <div className="flex items-center space-x-3">
            <Select
              label=""
              name="statusFilter"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              className="w-48"
            />
          </div>
        </div>
        
        <DataTable
          data={filteredApplications}
          columns={columns}
          emptyMessage="No applications found."
          onRowClick={(item) => {
            // Navigate to applicant detail
            window.location.href = `/admin/applicants/${item.id}`;
          }}
        />
      </div>
    </div>
  );
}
