# Expense Tracker

A robust expense tracking application backend built with Go. This application helps users manage their finances by tracking expenses, setting budgets, and monitoring spending patterns.

## Features

- **User Authentication**: Secure user registration and authentication with JWT tokens.
- **Expense Management**: Create, update, delete, and retrieve expenses with various filtering options.
- **Categorization**: Organize expenses into custom categories.
- **Budget Planning**: Set and track budgets for different expense categories.
- **Expense Analytics**: View spending patterns and summaries.
- **Concurrency**: Utilizes Go's powerful concurrency features for high performance.
- **RESTful API**: Clean API design following REST principles.

## Technical Architecture

The application follows a clean architecture pattern:

- **API Layer**: HTTP handlers using the Gin framework.
- **Service Layer**: Business logic and coordination between repositories.
- **Repository Layer**: Data access and storage using SQLite database.
- **Model Layer**: Domain entities and data transfer objects.

## Concurrency Patterns

This application demonstrates several Go concurrency patterns:

- **Worker Pools**: Used for processing bulk operations efficiently.
- **Context Management**: All operations respect cancellation signals for proper resource cleanup.
- **Error Groups**: Coordinated error handling across concurrent operations.
- **Safe Concurrent Access**: Thread-safe data access using mutexes and atomic operations.
- **Concurrent API Responses**: Aggregating data from multiple sources in parallel.

## Getting Started

### Prerequisites

- Go 1.21 or higher

### Configuration

1. Copy the sample configuration file:
   ```
   cp api/config.sample.json config.json
   ```

2. Edit the configuration as needed, or set environment variables:
   - `SERVER_PORT`: Server port (default: 8080)
   - `DB_CONNECTION_STRING`: Database connection string (default: ./expense_tracker.db)
   - `JWT_SECRET`: Secret key for JWT tokens

### Running the Application

1. Build the application:
   ```
   go build -o expense-tracker cmd/server/main.go
   ```

2. Run the application:
   ```
   ./expense-tracker
   ```

### API Documentation

See the [API documentation](api/README.md) for details on available endpoints and request/response formats.

## Security Considerations

- Passwords are securely hashed using bcrypt.
- JWT tokens are used for stateless authentication.
- Input validation prevents common security issues.
- Database queries use parameterized statements to prevent SQL injection.

## Testing

Run the tests with:

```
go test -race ./...
```

## Folder Structure

```
expense-tracker/
├── api/             # API documentation and examples
├── cmd/             # Application entry points
│   └── server/      # Main server application
├── internal/        # Internal packages
│   ├── config/      # Configuration
│   ├── handler/     # HTTP request handlers
│   ├── middleware/  # HTTP middleware
│   ├── model/       # Domain models
│   ├── repository/  # Data access
│   └── service/     # Business logic
└── pkg/             # Public packages
    └── utils/       # Utility functions and helpers
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.