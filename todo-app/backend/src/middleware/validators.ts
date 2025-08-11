import { body } from 'express-validator';

// User registration validation rules
export const registerValidation = [
  body('name')
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// User login validation rules
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password').exists().withMessage('Password is required'),
];

// Todo creation validation rules
export const todoValidation = [
  body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be either pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be either low, medium, or high'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category cannot be more than 50 characters')
    .trim(),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
];