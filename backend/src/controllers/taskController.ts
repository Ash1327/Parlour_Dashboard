import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import Employee from '../models/Employee';
import { AuthRequest } from '../middlewares/auth';

// Get all tasks
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single task
export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create task (Super Admin only)
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate
    } = req.body;

    // Validate assigned employee exists
    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      return res.status(400).json({ message: 'Assigned employee not found' });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user!._id,
      priority,
      dueDate
    });

    await task.save();
    
    // Populate the created task
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    return res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update task (Super Admin only)
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
      completedAt
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If status is being updated to completed, set completedAt
    let updateData: any = {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate
    };

    if (status === 'completed' && !task.completedAt) {
      updateData.completedAt = new Date();
    } else if (status !== 'completed') {
      updateData.completedAt = null;
    }

    // If completedAt is explicitly provided
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('assignedBy', 'name email');

    return res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete task (Super Admin only)
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 