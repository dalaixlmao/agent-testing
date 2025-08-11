import express from 'express';
import {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../controllers/todoController';
import { protect } from '../middleware/auth';
import { todoValidation } from '../middleware/validators';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Routes
router.route('/').get(getTodos).post(todoValidation, createTodo);
router
  .route('/:id')
  .get(getTodo)
  .put(todoValidation, updateTodo)
  .delete(deleteTodo);

export default router;