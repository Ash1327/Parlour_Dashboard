'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  email: string;
  position: string;
  department: string;
}

interface AttendanceRecord {
  _id: string;
  employee: Employee;
  date: string;
  punchIn: string;
  punchOut?: string;
  totalHours?: number;
  status: string;
}

interface AttendanceSummary {
  totalEmployees: number;
  present: number;
  absent: number;
  punchedOut: number;
  stillWorking: number;
  attendance: AttendanceRecord[];
}

export default function DashboardAttendancePage() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayAttendance();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket for attendance updates');
    });

    newSocket.on('attendance-update', (data) => {
      console.log('Attendance update received:', data);
      // Refresh attendance data when updates are received
      fetchTodayAttendance();
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  };

  const fetchTodayAttendance = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/today`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummary(response.data);
    } catch (error: any) {
      setError('Failed to fetch attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No attendance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today's Attendance</h1>
        <p className="text-gray-600">Real-time attendance overview for today</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.present}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalEmployees > 0 ? Math.round((summary.present / summary.totalEmployees) * 100) : 0}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Still Working</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.stillWorking}</div>
            <p className="text-xs text-muted-foreground">
              Currently at work
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Left for Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.punchedOut}</div>
            <p className="text-xs text-muted-foreground">
              Completed work
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Attendance Records - {formatDate(new Date().toISOString())}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Punch In</TableHead>
                <TableHead>Punch Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.attendance.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {record.employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{record.employee.name}</div>
                        <div className="text-sm text-gray-500">{record.employee.position}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.status)}
                  </TableCell>
                  <TableCell>
                    {record.punchIn ? formatTime(record.punchIn) : '-'}
                  </TableCell>
                  <TableCell>
                    {record.punchOut ? formatTime(record.punchOut) : '-'}
                  </TableCell>
                  <TableCell>
                    {record.totalHours ? `${record.totalHours}h` : '-'}
                  </TableCell>
                  <TableCell>
                    {record.employee.department}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {summary.attendance.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
              <p className="text-gray-500">
                No attendance records found for today.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={fetchTodayAttendance}
        >
          <Clock className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
        <Button
          onClick={() => window.open('/attendance', '_blank')}
        >
          <User className="mr-2 h-4 w-4" />
          Open Punch Page
        </Button>
      </div>
    </div>
  );
} 