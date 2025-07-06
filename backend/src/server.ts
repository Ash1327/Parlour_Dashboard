import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import taskRoutes from './routes/tasks';
import attendanceRoutes from './routes/attendance';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Parlour API is running' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle punch in/out events
  socket.on('punch-in', (data) => {
    console.log('Punch in event:', data);
    // Broadcast to all connected clients
    io.emit('attendance-update', {
      type: 'punch-in',
      employeeId: data.employeeId,
      timestamp: new Date()
    });
  });

  socket.on('punch-out', (data) => {
    console.log('Punch out event:', data);
    // Broadcast to all connected clients
    io.emit('attendance-update', {
      type: 'punch-out',
      employeeId: data.employeeId,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parlour-dashboard';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize default users
const initializeDefaultUsers = async () => {
  try {
    const User = require('./models/User').default;
    
    // Check if default users exist
    const superAdminExists = await User.findOne({ email: 'superadmin@parlour.com' });
    const adminExists = await User.findOne({ email: 'admin@parlour.com' });

    if (!superAdminExists) {
      await User.create({
        email: 'superadmin@parlour.com',
        password: 'superadmin123',
        name: 'Super Admin',
        role: 'super_admin'
      });
      console.log('Super Admin user created');
    }

    if (!adminExists) {
      await User.create({
        email: 'admin@parlour.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin'
      });
      console.log('Admin user created');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await initializeDefaultUsers();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
    console.log(`WebSocket URL: http://localhost:${PORT}`);
  });
};

startServer().catch(console.error);

export { io }; 