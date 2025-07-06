import { Request, Response } from 'express';
import Employee, { IEmployee } from '../models/Employee';
import { AuthRequest } from '../middlewares/auth';

// Get all employees
export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await Employee.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single employee
export const getEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    return res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create employee (Super Admin only)
export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      position,
      department,
      hireDate,
      salary,
      avatar
    } = req.body;

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const employee = new Employee({
      name,
      email: email.toLowerCase(),
      phone,
      position,
      department,
      hireDate: hireDate || new Date(),
      salary,
      avatar
    });

    await employee.save();
    return res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update employee (Super Admin only)
export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      position,
      department,
      hireDate,
      salary,
      avatar,
      isActive
    } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email: email ? email.toLowerCase() : employee.email,
        phone,
        position,
        department,
        hireDate,
        salary,
        avatar,
        isActive
      },
      { new: true, runValidators: true }
    );

    return res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete employee (Super Admin only)
export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete - set isActive to false
    employee.isActive = false;
    await employee.save();

    return res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 