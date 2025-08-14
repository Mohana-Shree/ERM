import React from 'react';
import { 
  Home, 
  FileText, 
  Clock, 
  Award, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();

  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'apply', label: 'Apply for Position', icon: FileText },
    { id: 'status', label: 'Application Status', icon: Clock },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <aside className="bg-white dark:bg-gray-800 w-64 h-full shadow-sm border-r border-gray-200 dark:border-gray-700">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 border-r-2 border-blue-500'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;