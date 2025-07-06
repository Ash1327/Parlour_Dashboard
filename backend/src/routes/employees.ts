import express from 'express';
import {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes accessible by both Admin and Super Admin
router.get('/', requireAdmin, getAllEmployees);
router.get('/:id', requireAdmin, getEmployee);

// Routes accessible only by Super Admin
router.post('/', requireSuperAdmin, createEmployee);
router.put('/:id', requireSuperAdmin, updateEmployee);
router.delete('/:id', requireSuperAdmin, deleteEmployee);

export default router; 