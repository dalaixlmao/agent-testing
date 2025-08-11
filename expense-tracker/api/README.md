# Expense Tracker API

This API provides endpoints for managing expenses, categories, budgets, and user accounts.

## Authentication

Authentication is handled via JWT tokens. Include the token in the `Authorization` header with the `Bearer` prefix.

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get authentication token

### User Profile

- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/password` - Change user password
- `DELETE /api/profile` - Delete user account

### Categories

- `GET /api/categories` - List all categories
- `GET /api/categories/{id}` - Get a specific category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

### Expenses

- `GET /api/expenses` - List all expenses (with optional filters)
- `GET /api/expenses/{id}` - Get a specific expense
- `POST /api/expenses` - Create a new expense
- `POST /api/expenses/bulk` - Create multiple expenses in bulk
- `PUT /api/expenses/{id}` - Update an expense
- `DELETE /api/expenses/{id}` - Delete an expense
- `GET /api/expenses/summary` - Get expense summary statistics

### Budgets

- `GET /api/budgets` - List all budgets (with optional active filter)
- `GET /api/budgets/{id}` - Get a specific budget
- `GET /api/budgets/{id}/status` - Get budget status with spending info
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/{id}` - Update a budget
- `DELETE /api/budgets/{id}` - Delete a budget

## Configuration

The API can be configured via the `config.json` file or environment variables:

- `SERVER_PORT` - Server port (default: 8080)
- `DB_CONNECTION_STRING` - Database connection string
- `JWT_SECRET` - Secret key for JWT token generation and validation

See `config.sample.json` for a full list of configuration options.

## Data Models

### User

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-08-11T12:00:00Z",
  "updatedAt": "2025-08-11T12:00:00Z"
}
```

### Category

```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Groceries",
  "description": "Food and household items",
  "createdAt": "2025-08-11T12:00:00Z",
  "updatedAt": "2025-08-11T12:00:00Z"
}
```

### Expense

```json
{
  "id": "uuid",
  "userId": "uuid",
  "categoryId": "uuid",
  "amount": 42.75,
  "description": "Weekly groceries",
  "date": "2025-08-11T12:00:00Z",
  "createdAt": "2025-08-11T12:00:00Z",
  "updatedAt": "2025-08-11T12:00:00Z"
}
```

### Budget

```json
{
  "id": "uuid",
  "userId": "uuid",
  "categoryId": "uuid",
  "amount": 500.00,
  "period": "monthly",
  "startDate": "2025-08-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z",
  "createdAt": "2025-08-11T12:00:00Z",
  "updatedAt": "2025-08-11T12:00:00Z"
}
```