# Todo App Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Start the backend server:

```bash
# Development mode with hot reloading
npm run dev

# Production build
npm run build
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Running the Application

1. Start MongoDB (if using local installation):

```bash
mongod
```

2. Start the backend server:

```bash
cd backend
npm run dev
```

3. Start the frontend server:

```bash
cd frontend
npm run dev
```

4. Access the application:

Open your browser and navigate to `http://localhost:5173`

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Docker Setup (Optional)

The application can also be run using Docker and Docker Compose:

1. Make sure Docker and Docker Compose are installed

2. Build and run the containers:

```bash
docker-compose up --build
```

3. Access the application at `http://localhost:5173`