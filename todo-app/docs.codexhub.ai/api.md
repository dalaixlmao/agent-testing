# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication Endpoints

### Register a new user

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login a user

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get current user info

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Todo Endpoints

### Get all todos for current user

**Endpoint:** `GET /todos`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, in-progress, completed)
- `priority` (optional): Filter by priority (low, medium, high)
- `category` (optional): Filter by category
- `search` (optional): Search todos by title or description

**Response (200 OK):**
```json
{
  "todos": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Complete project",
      "description": "Finish the React project",
      "status": "in-progress",
      "priority": "high",
      "category": "Work",
      "dueDate": "2025-08-15T00:00:00.000Z",
      "createdAt": "2025-08-01T00:00:00.000Z",
      "updatedAt": "2025-08-01T00:00:00.000Z"
    },
    // More todos...
  ]
}
```

### Get a specific todo

**Endpoint:** `GET /todos/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "todo": {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Complete project",
    "description": "Finish the React project",
    "status": "in-progress",
    "priority": "high",
    "category": "Work",
    "dueDate": "2025-08-15T00:00:00.000Z",
    "createdAt": "2025-08-01T00:00:00.000Z",
    "updatedAt": "2025-08-01T00:00:00.000Z"
  }
}
```

### Create a new todo

**Endpoint:** `POST /todos`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the React project",
  "status": "in-progress",
  "priority": "high",
  "category": "Work",
  "dueDate": "2025-08-15T00:00:00.000Z"
}
```

**Response (201 Created):**
```json
{
  "todo": {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Complete project",
    "description": "Finish the React project",
    "status": "in-progress",
    "priority": "high",
    "category": "Work",
    "dueDate": "2025-08-15T00:00:00.000Z",
    "createdAt": "2025-08-01T00:00:00.000Z",
    "updatedAt": "2025-08-01T00:00:00.000Z"
  }
}
```

### Update a todo

**Endpoint:** `PUT /todos/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:** (Include only fields to update)
```json
{
  "title": "Updated project title",
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "todo": {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Updated project title",
    "description": "Finish the React project",
    "status": "completed",
    "priority": "high",
    "category": "Work",
    "dueDate": "2025-08-15T00:00:00.000Z",
    "createdAt": "2025-08-01T00:00:00.000Z",
    "updatedAt": "2025-08-11T00:00:00.000Z"
  }
}
```

### Delete a todo

**Endpoint:** `DELETE /todos/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "message": "Todo deleted successfully"
}
```