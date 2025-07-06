import { Request, Response } from 'express';
import Attendance, { IAttendance } from '../models/Attendance';
import Employee from '../models/Employee';
import { AuthRequest } from '../middlewares/auth';

// Get all attendance records
export const getAllAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { date, employee } = req.query;
    
    let filter: any = {};
    
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    if (employee) {
      filter.employee = employee;
    }

    const attendance = await Attendance.find(filter)
      .populate('employee', 'name email position')
      .sort({ date: -1, punchIn: -1 });

    return res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get attendance for specific employee
export const getEmployeeAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    let filter: any = { employee: employeeId };

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(filter)
      .populate('employee', 'name email position')
      .sort({ date: -1 });

    return res.json(attendance);
  } catch (error) {
    console.error('Get employee attendance error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Punch in/out for employee
export const punchInOut = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.body;

    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance record exists for today
    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: today }
    });

    if (!attendance) {
      // Create new attendance record (punch in)
      attendance = new Attendance({
        employee: employeeId,
        date: new Date(),
        punchIn: new Date(),
        status: 'present'
      });
      await attendance.save();

      return res.json({
        message: 'Punched in successfully',
        attendance,
        action: 'punch-in'
      });
    } else if (!attendance.punchOut) {
      // Punch out
      attendance.punchOut = new Date();
      await attendance.save();

      return res.json({
        message: 'Punched out successfully',
        attendance,
        action: 'punch-out'
      });
    } else {
      return res.status(400).json({ message: 'Already punched in and out for today' });
    }
  } catch (error) {
    console.error('Punch in/out error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get today's attendance summary
export const getTodayAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: { $gte: today }
    }).populate('employee', 'name email position department');

    // Get all active employees
    const allEmployees = await Employee.find({ isActive: true });
    
    // Create summary
    const summary = {
      totalEmployees: allEmployees.length,
      present: attendance.filter(a => a.punchIn).length,
      absent: allEmployees.length - attendance.filter(a => a.punchIn).length,
      punchedOut: attendance.filter(a => a.punchOut).length,
      stillWorking: attendance.filter(a => a.punchIn && !a.punchOut).length,
      attendance
    };

    return res.json(summary);
  } catch (error) {
    console.error('Get today attendance error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 