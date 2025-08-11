import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

import Todo from '../models/Todo';

// @desc    Get all todos for current user
// @route   GET /api/todos
// @access  Private
export const getTodos = async (req: Request, res: Response) => {
  try {
    const { status, priority, category, search } = req.query;
    
    // Base query: find todos for the current user
    const queryObj: any = { userId: (req as any).user.id };
    
    // Add filters if they exist
    if (status) queryObj.status = status;
    if (priority) queryObj.priority = priority;
    if (category) queryObj.category = category;
    
    // Text search in title or description
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      queryObj.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    const todos = await Todo.find(queryObj).sort({ createdAt: -1 });

    res.json({ todos });
  } catch (error) {
    console.error(`Error in getTodos: ${error}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single todo
// @route   GET /api/todos/:id
// @access  Private
export const getTodo = async (req: Request, res: Response) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if the todo belongs to the user
    if (todo.userId.toString() !== (req as any).user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ todo });
  } catch (error) {
    console.error(`Error in getTodo: ${error}`);
    
    // Check if the error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid todo ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private
export const createTodo = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, status, priority, category, dueDate } = req.body;

    // Create todo
    const todo = await Todo.create({
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      userId: (req as any).user.id,
    });

    res.status(201).json({ todo });
  } catch (error) {
    console.error(`Error in createTodo: ${error}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find todo by ID
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if the todo belongs to the user
    if (todo.userId.toString() !== (req as any).user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update todo
    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ todo });
  } catch (error) {
    console.error(`Error in updateTodo: ${error}`);
    
    // Check if the error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid todo ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    // Find todo by ID
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if the todo belongs to the user
    if (todo.userId.toString() !== (req as any).user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete todo
    await Todo.findByIdAndDelete(req.params.id);

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(`Error in deleteTodo: ${error}`);
    
    // Check if the error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid todo ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};