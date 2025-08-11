# Scalable Todo Management Application

A modern, scalable, and cloud-native Todo Management application built with Spring Boot, Spring Cloud, and microservices architecture.

## Architecture Overview

This application is built using a microservices architecture with the following components:

1. **Todo Service**: Core service for managing todo items and categories
2. **User Service**: Handles user authentication, registration, and profile management
3. **API Gateway**: Entry point for all client requests with routing and security
4. **Service Registry**: Service discovery with Netflix Eureka
5. **Config Server**: Centralized configuration management
6. **Infrastructure Services**: PostgreSQL, Redis, Kafka, Prometheus, and Grafana

## Features

- User registration and authentication with JWT
- Todo management (create, read, update, delete)
- Todo categorization with custom categories
- Searching and filtering todos
- RESTful API design with proper pagination and sorting
- Caching with Redis for improved performance
- Resilience patterns (Circuit Breaker, Retry, Rate Limiting)
- Full monitoring with Prometheus and Grafana
- Docker and Docker Compose support

## Technology Stack

- **Java 21**: Latest LTS Java version with virtual threads support
- **Spring Boot 3.2.0**: Latest Spring Boot version
- **Spring Cloud 2023.0.0**: Latest Spring Cloud release
- **Spring Data JPA**: For database access
- **Spring Security**: For authentication and authorization
- **PostgreSQL**: Main database
- **Redis**: Caching layer
- **Kafka**: Event processing
- **Resilience4j**: Fault tolerance
- **Docker & Docker Compose**: Containerization and orchestration
- **Prometheus & Grafana**: Monitoring and metrics

## Getting Started

### Prerequisites

- JDK 21
- Maven
- Docker and Docker Compose

### Running the Application

1. Clone the repository
2. Build the application:

```bash
mvn clean package -DskipTests
```

3. Start the infrastructure services and application using Docker Compose:

```bash
cd docker
docker-compose up -d
```

4. Access the API Gateway at http://localhost:8765

## API Documentation

### Todo Service API Endpoints

- `POST /api/v1/todos` - Create a new todo
- `GET /api/v1/todos/{id}` - Get a todo by ID
- `PUT /api/v1/todos/{id}` - Update a todo
- `DELETE /api/v1/todos/{id}` - Delete a todo
- `GET /api/v1/todos/user` - Get all todos for a user (paginated)
- `GET /api/v1/todos/user/status/{status}` - Get todos by status
- `GET /api/v1/todos/user/category/{categoryId}` - Get todos by category
- `GET /api/v1/todos/user/overdue` - Get overdue todos
- `GET /api/v1/todos/user/due-range` - Get todos in date range
- `GET /api/v1/todos/user/search` - Search todos
- `PATCH /api/v1/todos/{id}/status` - Update todo status

### Category API Endpoints

- `POST /api/v1/categories` - Create a new category
- `GET /api/v1/categories/{id}` - Get a category by ID
- `PUT /api/v1/categories/{id}` - Update a category
- `DELETE /api/v1/categories/{id}` - Delete a category
- `GET /api/v1/categories/user` - Get all categories for a user

## Monitoring

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

## Scalability Features

This Todo Management Application includes several scalability features:

1. **Microservices Architecture**: Individual services can be scaled independently
2. **Database Optimization**: Efficient queries and indexes
3. **Caching Layer**: Redis caching to reduce database load
4. **Asynchronous Processing**: Kafka for event-driven communication
5. **Load Balancing**: Through Spring Cloud Gateway and Eureka
6. **Container Orchestration**: Docker Compose (can be extended to Kubernetes)
7. **Circuit Breaking**: Prevents cascading failures with Resilience4j
8. **Rate Limiting**: Protects services from overload
9. **Monitoring**: Comprehensive metrics with Prometheus and Grafana

## License

This project is licensed under the MIT License.