import express from 'express';
import {
  getAllAttendance,
  getEmployeeAttendance,
  punchInOut,
  getTodayAttendance
} from '../controllers/attendanceController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes accessible by both Admin and Super Admin
router.get('/', requireAdmin, getAllAttendance);
router.get('/today', requireAdmin, getTodayAttendance);
router.get('/employee/:employeeId', requireAdmin, getEmployeeAttendance);

// Public punch in/out endpoint (no role restriction)
router.post('/punch', punchInOut);

export default router; 