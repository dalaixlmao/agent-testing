# Expense Share - Track and Split Expenses

A comprehensive expense tracking and settlement application built with industry-level code quality. Track expenses, split them among friends, and see optimized settlement recommendations.

## Features

### Authentication
- **Email/Password Authentication**: Secure local authentication with BCrypt password hashing
- **Google OAuth2**: One-click sign-in with Google
- **JWT Token-based Sessions**: Stateless authentication with secure JWT tokens

### Expense Management
- **Add Expenses**: Create expenses with detailed information
- **Custom Splits**: Split expenses in any proportion among multiple people
- **Equal Split**: Quick button to split expenses equally
- **Expense Categories**: Organize expenses by category
- **Notes Support**: Add notes to expenses for context
- **View History**: See all your expenses in chronological order

### Settlement Calculation
- **Smart Algorithm**: Optimized debt simplification algorithm that minimizes the number of transactions
- **Balance Overview**: See your total paid, total owed, and net balance at a glance
- **Settlement Breakdown**: Clear view of who owes whom and how much
- **User-friendly Display**: Visual indicators for debts and credits

### User Interface
- **Modern Design**: Built with Tailwind CSS and Shadcn UI components
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive**: Clean and user-friendly interface
- **Real-time Updates**: Immediate feedback on all actions

## Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** with OAuth2 and JWT
- **Spring Data JPA** with Hibernate
- **H2 Database** (development) / **PostgreSQL** (production ready)
- **Maven** for dependency management
- **Lombok** for reducing boilerplate

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **Shadcn UI** for beautiful components
- **Zustand** for state management
- **Axios** for API calls
- **React Router** for navigation
- **Lucide React** for icons

## Project Structure

```
expense-share/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/expenseshare/
│   │       │   ├── config/          # Security & app configuration
│   │       │   ├── controller/      # REST API endpoints
│   │       │   ├── dto/             # Data Transfer Objects
│   │       │   ├── entity/          # JPA entities
│   │       │   ├── exception/       # Custom exceptions
│   │       │   ├── repository/      # Data access layer
│   │       │   ├── security/        # Security components
│   │       │   └── service/         # Business logic
│   │       └── resources/
│   │           └── application.yml  # App configuration
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── components/         # React components
    │   │   └── ui/            # Shadcn UI components
    │   ├── pages/             # Page components
    │   ├── services/          # API service layer
    │   ├── store/             # State management
    │   ├── types/             # TypeScript types
    │   ├── lib/               # Utility functions
    │   ├── App.tsx            # Main app component
    │   └── main.tsx           # App entry point
    ├── package.json
    └── vite.config.ts
```

## Getting Started

### Prerequisites
- **Java 17** or higher
- **Node.js 18** or higher
- **npm** or **yarn**
- **Maven** (usually comes with IDE)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd expense-share/backend
   ```

2. **Configure Google OAuth2** (Optional):

   Create a Google OAuth2 application at [Google Cloud Console](https://console.cloud.google.com/)

   Update `src/main/resources/application.yml`:
   ```yaml
   spring:
     security:
       oauth2:
         client:
           registration:
             google:
               client-id: YOUR_GOOGLE_CLIENT_ID
               client-secret: YOUR_GOOGLE_CLIENT_SECRET
   ```

3. **Build and run**:
   ```bash
   # Using Maven wrapper
   ./mvnw spring-boot:run

   # Or using Maven
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd expense-share/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### First-time Setup

1. Open your browser and go to `http://localhost:5173`
2. Click "Sign up" to create a new account
3. Fill in your details or use Google OAuth2
4. Start adding expenses!

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /oauth2/authorize/google` - Google OAuth2 login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?query=` - Search users
- `GET /api/users/{id}` - Get user by ID

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all user's expenses
- `GET /api/expenses/{id}` - Get expense by ID
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Settlements
- `GET /api/settlements` - Get user's settlements
- `GET /api/settlements/all` - Get all settlements
- `GET /api/settlements/with/{userId}` - Get settlement with specific user

## Settlement Algorithm

The app uses an optimized debt simplification algorithm that:

1. Calculates net balance for each user (total paid - total owed)
2. Separates users into creditors (positive balance) and debtors (negative balance)
3. Uses a greedy algorithm with priority queues to match debtors with creditors
4. Minimizes the number of transactions needed to settle all debts

**Example**:
- Alice paid $100, owes $30 → Net: +$70
- Bob paid $50, owes $60 → Net: -$10
- Carol paid $30, owes $90 → Net: -$60

**Result**: Carol pays Alice $60, Bob pays Alice $10 (2 transactions instead of potentially many more)

## Security Features

- **Password Hashing**: BCrypt with salt
- **JWT Tokens**: Secure, stateless authentication
- **CORS Protection**: Configured for allowed origins
- **OAuth2**: Industry-standard authentication
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: JPA with parameterized queries
- **XSS Protection**: React's built-in XSS prevention

## Database Schema

### Users
- ID, Name, Email, Password, Provider, Provider ID, Image URL, Email Verified, Roles, Timestamps

### Expenses
- ID, Description, Amount, Paid By User, Expense Date, Category, Notes, Timestamps

### Expense Shares
- ID, Expense ID, User ID, Share Amount, Settled Status

## Development

### Backend Development

The backend uses Spring Boot DevTools for hot reload. Just save your files and the app will restart automatically.

### Frontend Development

Vite provides instant HMR (Hot Module Replacement). Changes appear immediately in the browser.

### Code Quality

- **Backend**: Uses Lombok to reduce boilerplate, follows Spring best practices
- **Frontend**: TypeScript for type safety, ESLint for code quality
- **Architecture**: Clean separation of concerns, SOLID principles
- **Comments**: Comprehensive Javadoc and TSDoc comments

## Production Deployment

### Backend

1. Switch to PostgreSQL in `application.yml`
2. Set strong JWT secret
3. Configure production Google OAuth2 credentials
4. Build: `mvn clean package`
5. Run: `java -jar target/expense-share-backend-1.0.0.jar`

### Frontend

1. Update API URLs if needed
2. Build: `npm run build`
3. Deploy `dist` folder to your hosting service

## Environment Variables

### Backend
- `GOOGLE_CLIENT_ID`: Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth2 client secret
- `JWT_SECRET`: Secret key for JWT signing

### Frontend
No environment variables needed for development. For production, configure your hosting service.

## Contributing

This is a demonstration project showcasing industry-level code quality. Feel free to use it as a reference or starting point for your own projects.

## License

MIT License - feel free to use this code for your own projects.

## Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Spring Boot, React, and TypeScript**
