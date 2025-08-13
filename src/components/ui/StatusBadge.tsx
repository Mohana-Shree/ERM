
import type { ApplicationStatus, InternshipStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus | InternshipStatus;
  className?: string;
}

const statusConfig = {
  // Application statuses
  submitted: { color: 'bg-gray-100 text-gray-800', label: 'Submitted' },
  under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
  interview_scheduled: { color: 'bg-purple-100 text-purple-800', label: 'Interview Scheduled' },
  offered: { color: 'bg-amber-100 text-amber-800', label: 'Offered' },
  accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  withdrawn: { color: 'bg-slate-100 text-slate-800', label: 'Withdrawn' },
  
  // Internship statuses
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
  joined: { color: 'bg-green-100 text-green-800', label: 'Joined' },
  terminated: { color: 'bg-red-100 text-red-800', label: 'Terminated' },
  completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Completed' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 ${className}`}>
        {status}
      </span>
    );
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color} ${className}`}>
      {config.label}
    </span>
  );
}
