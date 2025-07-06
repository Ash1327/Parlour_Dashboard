'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Clock, User, CheckCircle, XCircle } from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  email: string;
  position: string;
  department: string;
}

interface AttendanceStatus {
  [key: string]: {
    punchedIn: boolean;
    punchedOut: boolean;
    punchInTime?: string;
    punchOutTime?: string;
  };
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('attendance-update', (data) => {
      console.log('Attendance update received:', data);
      // Update attendance status based on WebSocket events
      setAttendanceStatus(prev => ({
        ...prev,
        [data.employeeId]: {
          ...prev[data.employeeId],
          punchedIn: data.type === 'punch-in',
          punchedOut: data.type === 'punch-out',
          [data.type === 'punch-in' ? 'punchInTime' : 'punchOutTime']: data.timestamp
        }
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  };

  const fetchEmployees = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
      
      // Initialize attendance status
      const status: AttendanceStatus = {};
      response.data.forEach((employee: Employee) => {
        status[employee._id] = {
          punchedIn: false,
          punchedOut: false
        };
      });
      setAttendanceStatus(status);
    } catch (error: any) {
      setError('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePunchInOut = async (employeeId: string) => {
    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/punch`,
        { employeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { action, attendance } = response.data;
      
      // Update local state
      setAttendanceStatus(prev => ({
        ...prev,
        [employeeId]: {
          punchedIn: !!attendance.punchIn && !attendance.punchOut,
          punchedOut: !!attendance.punchOut,
          punchInTime: attendance.punchIn || prev[employeeId]?.punchInTime,
          punchOutTime: attendance.punchOut || prev[employeeId]?.punchOutTime
        }
      }));

      // Emit WebSocket event
      if (socket) {
        socket.emit(action === 'punch-in' ? 'punch-in' : 'punch-out', {
          employeeId,
          timestamp: new Date()
        });
      }

      setSuccess(`${action === 'punch-in' ? 'Punched in' : 'Punched out'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to punch in/out');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getEmployeeStatus = (employeeId: string) => {
    const status = attendanceStatus[employeeId];
    if (!status) return 'unknown';
    
    if (status.punchedOut) return 'punched-out';
    if (status.punchedIn) return 'punched-in';
    return 'not-punched';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'punched-in':
        return 'bg-green-100 text-green-800';
      case 'punched-out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'punched-in':
        return 'Working';
      case 'punched-out':
        return 'Left';
      default:
        return 'Not Punched In';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Parlour Attendance
          </h1>
          <p className="text-gray-600">
            Punch in or out for today's work
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => {
            const status = getEmployeeStatus(employee._id);
            const isWorking = status === 'punched-in';
            const hasLeft = status === 'punched-out';
            
            return (
              <Card key={employee._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Department:</span>
                      <span className="text-sm font-medium">{employee.department}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={getStatusColor(status)}>
                        {getStatusText(status)}
                      </Badge>
                    </div>

                    {attendanceStatus[employee._id]?.punchInTime && (
                      <div className="text-xs text-gray-500">
                        Punched in: {new Date(attendanceStatus[employee._id].punchInTime!).toLocaleTimeString()}
                      </div>
                    )}

                    {attendanceStatus[employee._id]?.punchOutTime && (
                      <div className="text-xs text-gray-500">
                        Punched out: {new Date(attendanceStatus[employee._id].punchOutTime!).toLocaleTimeString()}
                      </div>
                    )}

                    <Button
                      onClick={() => handlePunchInOut(employee._id)}
                      disabled={hasLeft}
                      className={`w-full ${
                        isWorking 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : hasLeft 
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {isWorking ? 'Punch Out' : hasLeft ? 'Already Left' : 'Punch In'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {employees.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h3>
              <p className="text-gray-500">
                No employees have been added to the system yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 