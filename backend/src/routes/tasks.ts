import express from 'express';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes accessible by both Admin and Super Admin
router.get('/', requireAdmin, getAllTasks);
router.get('/:id', requireAdmin, getTask);

// Routes accessible only by Super Admin
router.post('/', requireSuperAdmin, createTask);
router.put('/:id', requireSuperAdmin, updateTask);
router.delete('/:id', requireSuperAdmin, deleteTask);

export default router; 