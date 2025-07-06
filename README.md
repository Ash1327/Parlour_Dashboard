# Parlour Admin Dashboard

A full-stack web application for managing a parlour business with role-based access control and real-time attendance tracking.

## Features

- **Role-Based Access Control**: Super Admin and Admin roles with different permissions
- **Employee Management**: Add, edit, delete employees (Super Admin only)
- **Task Management**: Assign and manage tasks (Super Admin only)
- **Real-Time Attendance**: Live punch-in/out system with WebSocket updates
- **Modern UI**: Built with Next.js 15, TypeScript, TailwindCSS, and ShadCN UI

## Project Structure

```
parlour-project/
├── frontend-parlour-dashboard/    # Next.js 15 + TypeScript + ShadCN UI
└── backend-parlour-api/          # Node.js + TypeScript + Express + Socket.IO
```

## Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd parlour-project
```

### 2. Backend Setup

```bash
cd backend-parlour-api

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your MongoDB URI and JWT secret
# MONGODB_URI=mongodb://localhost:27017/parlour-dashboard
# JWT_SECRET=your-super-secret-jwt-key

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend-parlour-dashboard

# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Default Users

The system comes with two default users:

### Super Admin
- Email: superadmin@parlour.com
- Password: superadmin123
- Permissions: Full access (CRUD operations)

### Admin
- Email: admin@parlour.com  
- Password: admin123
- Permissions: View-only access

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Employees (Super Admin only)
- `GET /employees` - Get all employees
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Tasks (Super Admin only)
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Attendance
- `GET /attendance` - Get attendance logs
- `POST /attendance/punch` - Punch in/out (WebSocket)

## WebSocket Events

- `punch-in` - Employee punches in
- `punch-out` - Employee punches out
- `attendance-update` - Real-time attendance updates

## Technologies Used

### Frontend
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI
- Socket.IO Client
- React Hook Form
- Axios

### Backend
- Node.js
- TypeScript
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication
- bcryptjs

## Development

### Backend Commands
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
```

### Frontend Commands
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parlour-dashboard
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

## License

MIT 