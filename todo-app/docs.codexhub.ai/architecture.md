# Todo App Architecture

## Overview

This application follows a modern client-server architecture with a React frontend, Express backend, and MongoDB database.

## System Design

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │<─────│ Express Backend │<─────│ MongoDB Database│
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Frontend Architecture

The React frontend is organized using a feature-based approach:

- **components/**: Reusable UI components
- **features/**: Feature-specific components and logic
  - **auth/**: Authentication related components
  - **todos/**: Todo management components
- **hooks/**: Custom React hooks
- **services/**: API service calls
- **utils/**: Utility functions
- **types/**: TypeScript type definitions

## Backend Architecture

The Express backend follows a modular structure:

- **controllers/**: Request handlers
- **models/**: MongoDB/Mongoose schemas
- **routes/**: API route definitions
- **middleware/**: Express middleware (auth, validation, etc.)
- **utils/**: Utility functions
- **config/**: Configuration files

## Database Schema

The MongoDB database has the following collections:

1. **Users**: Store user information
   - _id: ObjectId
   - email: String (unique)
   - password: String (hashed)
   - name: String
   - createdAt: Date

2. **Todos**: Store todo items
   - _id: ObjectId
   - title: String
   - description: String
   - status: String (enum: "pending", "in-progress", "completed")
   - priority: String (enum: "low", "medium", "high")
   - category: String
   - dueDate: Date
   - userId: ObjectId (reference to Users)
   - createdAt: Date
   - updatedAt: Date

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login a user
- GET /api/auth/me - Get current user info

### Todos
- GET /api/todos - Get all todos for current user
- GET /api/todos/:id - Get a specific todo
- POST /api/todos - Create a new todo
- PUT /api/todos/:id - Update a todo
- DELETE /api/todos/:id - Delete a todo

## Authentication Flow

1. User registers or logs in
2. Backend validates credentials and issues a JWT
3. Frontend stores JWT in localStorage
4. JWT is sent in Authorization header for authenticated requests
5. Backend middleware validates JWT for protected routes