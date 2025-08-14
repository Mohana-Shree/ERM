import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Timer } from 'lucide-react';

interface AttendanceRecord {
  date: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'partial';
}

const AttendanceTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  const attendanceHistory: AttendanceRecord[] = [
    { date: '2024-01-19', checkIn: '09:00', checkOut: '17:30', hoursWorked: 8.5, status: 'present' },
    { date: '2024-01-18', checkIn: '09:15', checkOut: '17:00', hoursWorked: 7.75, status: 'present' },
    { date: '2024-01-17', checkIn: '10:00', checkOut: '15:00', hoursWorked: 5, status: 'partial' },
    { date: '2024-01-16', checkIn: undefined, checkOut: undefined, hoursWorked: 0, status: 'absent' },
  ];

  const internshipDetails = {
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    totalDays: 180,
    workingDays: 126,
    completedDays: 5,
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    const now = new Date();
    setIsCheckedIn(true);
    setTodayRecord({
      date: now.toISOString().split('T')[0],
      checkIn: now.toTimeString().split(' ')[0].substring(0, 5),
      hoursWorked: 0,
      status: 'partial'
    });
  };

  const handleCheckOut = () => {
    if (todayRecord) {
      const now = new Date();
      const checkInTime = new Date(`${todayRecord.date}T${todayRecord.checkIn}:00`);
      const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      
      setTodayRecord({
        ...todayRecord,
        checkOut: now.toTimeString().split(' ')[0].substring(0, 5),
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        status: hoursWorked >= 8 ? 'present' : 'partial'
      });
      setIsCheckedIn(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <Timer className="h-5 w-5 text-amber-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const daysLeft = internshipDetails.workingDays - internshipDetails.completedDays;
  const progressPercentage = (internshipDetails.completedDays / internshipDetails.workingDays) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Current Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Clock className="mr-3 h-6 w-6" />
            Attendance Tracker
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentTime.toLocaleTimeString()}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Current Time</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {daysLeft}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Days Remaining</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {internshipDetails.completedDays}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Days Completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Internship Progress</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Check In/Out Buttons */}
          <div className="flex justify-center space-x-4">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Check In
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Check Out
              </button>
            )}
          </div>

          {/* Today's Record */}
          {todayRecord && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Today's Record</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Check In</p>
                  <p className="font-medium">{todayRecord.checkIn || '--'}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Check Out</p>
                  <p className="font-medium">{todayRecord.checkOut || '--'}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Hours Worked</p>
                  <p className="font-medium">{todayRecord.hoursWorked.toFixed(1)}h</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <div className="flex items-center">
                    {getStatusIcon(todayRecord.status)}
                    <span className="ml-1 capitalize">{todayRecord.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Attendance History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {attendanceHistory.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {record.checkIn || '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {record.checkOut || '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {record.hoursWorked}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                        {record.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;