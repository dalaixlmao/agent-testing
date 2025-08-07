# E-Commerce App

A Flutter e-commerce application built with clean architecture and Riverpod for state management. The app includes product listing, cart functionality, user authentication, and various platform integrations.

## Features

- **Product Listing**: Browse products with lazy loading and efficient grid rendering
- **Product Details**: View detailed product information with image carousel
- **Cart Management**: Add products to cart, update quantities, and calculate totals
- **User Authentication**: Sign up and login with email/password using Firebase Auth
- **Platform Integrations**:
  - Camera integration for product photos
  - Biometric authentication for secure login
  - Push notifications via Firebase Cloud Messaging
  - Deep linking for direct navigation to specific screens
- **Offline Support**: Local storage for products and cart items
- **Optimized Performance**: Image caching, efficient list rendering, and pagination

## Tech Stack

- **Flutter**: UI framework
- **Riverpod**: State management
- **Go Router**: Navigation and routing
- **Firebase**: Authentication and push notifications
- **Hive & Shared Preferences**: Local storage
- **Dio**: Network requests
- **Cached Network Image**: Image caching and loading
- **Camera**: Native camera integration
- **Local Auth**: Biometric authentication
- **Permission Handler**: Runtime permissions

## Project Structure

The project follows a clean architecture approach with feature-based organization:

```
lib/
├── core/                 # Core functionality
│   ├── di/               # Dependency injection
│   ├── network/          # API client and exceptions
│   ├── router/           # Navigation and routing
│   ├── storage/          # Local storage implementations
│   ├── theme/            # App theme and styling
│   └── utils/            # Utility classes and helpers
├── features/             # App features
│   ├── auth/             # Authentication
│   │   ├── data/         # Repositories
│   │   ├── domain/       # Models and entities
│   │   └── presentation/ # UI and controllers
│   ├── products/         # Product listings
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── cart/             # Shopping cart
│       ├── data/
│       ├── domain/
│       └── presentation/
└── main.dart             # App entry point
```

## Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Android Studio / VS Code with Flutter plugins
- Firebase project (for authentication and notifications)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce_app.git
   cd ecommerce_app
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run code generation for Riverpod, Freezed, etc:
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

4. Run the app:
   ```bash
   flutter run
   ```

## Performance Optimization

The app includes several performance optimizations:

- **Lazy Loading**: Products are loaded in pages as the user scrolls
- **Image Caching**: Images are cached to reduce network requests
- **Efficient List Rendering**: GridView.builder for optimized rendering
- **Memory Management**: Dispose of controllers and resources properly

## Testing

The project includes several types of tests:

- **Unit Tests**: Test individual components like repositories and controllers
- **Widget Tests**: Test UI components in isolation
- **Integration Tests**: Test flows across multiple components

To run tests:

```bash
flutter test
```

## TODOs and Future Improvements

- Implement checkout flow with payment integration
- Add product search with filters and sorting
- Implement user profile management
- Add product reviews and ratings
- Enhance offline capabilities with background sync
- Implement analytics tracking
- Add CI/CD pipeline for automated testing and deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.