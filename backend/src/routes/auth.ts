import express from 'express';
import { login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router; 