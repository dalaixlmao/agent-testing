import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index';
import User from '../models/User';
import Todo from '../models/Todo';

let mongoServer: MongoMemoryServer;
let token: string;
let userId: string;

// Setup MongoDB Memory Server before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create a test user for all todo tests
  const response = await request(app).post('/api/auth/register').send({
    name: 'Todo Test User',
    email: 'todo-test@example.com',
    password: 'password123',
  });

  token = response.body.token;
  userId = response.body.user._id;
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear todos between tests
beforeEach(async () => {
  await Todo.deleteMany({});
});

describe('Todos API', () => {
  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        category: 'Work',
        dueDate: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send(todoData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('todo');
      expect(response.body.todo).toHaveProperty('title', todoData.title);
      expect(response.body.todo).toHaveProperty('description', todoData.description);
      expect(response.body.todo).toHaveProperty('status', todoData.status);
      expect(response.body.todo).toHaveProperty('userId', userId);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Missing title',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/todos', () => {
    beforeEach(async () => {
      // Create test todos
      await Todo.create([
        {
          title: 'Work Todo',
          description: 'Work related task',
          status: 'pending',
          priority: 'high',
          category: 'Work',
          userId: mongoose.Types.ObjectId(userId),
        },
        {
          title: 'Personal Todo',
          description: 'Personal task',
          status: 'in-progress',
          priority: 'medium',
          category: 'Personal',
          userId: mongoose.Types.ObjectId(userId),
        },
        {
          title: 'Completed Todo',
          description: 'Finished task',
          status: 'completed',
          priority: 'low',
          category: 'Work',
          userId: mongoose.Types.ObjectId(userId),
        },
      ]);
    });

    it('should get all todos for the current user', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('todos');
      expect(response.body.todos).toHaveLength(3);
    });

    it('should filter todos by status', async () => {
      const response = await request(app)
        .get('/api/todos?status=completed')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].status).toBe('completed');
    });

    it('should filter todos by priority', async () => {
      const response = await request(app)
        .get('/api/todos?priority=high')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].priority).toBe('high');
    });

    it('should filter todos by category', async () => {
      const response = await request(app)
        .get('/api/todos?category=Personal')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].category).toBe('Personal');
    });

    it('should search todos by title or description', async () => {
      const response = await request(app)
        .get('/api/todos?search=Personal')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].title).toBe('Personal Todo');
    });
  });

  describe('PUT & DELETE /api/todos/:id', () => {
    let todoId: string;

    beforeEach(async () => {
      // Create a test todo
      const todo = await Todo.create({
        title: 'Update Test Todo',
        description: 'Todo to be updated',
        status: 'pending',
        priority: 'medium',
        category: 'Test',
        userId: mongoose.Types.ObjectId(userId),
      });
      todoId = todo._id.toString();
    });

    it('should update a todo', async () => {
      const updateData = {
        title: 'Updated Title',
        status: 'completed',
      };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.todo).toHaveProperty('title', updateData.title);
      expect(response.body.todo).toHaveProperty('status', updateData.status);
      expect(response.body.todo).toHaveProperty('description', 'Todo to be updated');
    });

    it('should delete a todo', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Todo deleted successfully');

      // Verify todo is actually deleted
      const todos = await Todo.find({});
      expect(todos).toHaveLength(0);
    });

    it('should not allow unauthorized updates', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
        });

      // Try to update todo with other user's token
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${otherUserResponse.body.token}`)
        .send({ title: 'Unauthorized Update' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Not authorized');
    });
  });
});