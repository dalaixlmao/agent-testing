import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/products/presentation/product_detail_screen.dart';
import '../../features/products/presentation/products_screen.dart';
import '../utils/navigation_observer.dart';
import 'app_routes.dart';
import 'bottom_nav_scaffold.dart';

part 'app_router.g.dart';

@riverpod
GoRouter appRouter(AppRouterRef ref) {
  final rootNavigatorKey = GlobalKey<NavigatorState>();
  final shellNavigatorKey = GlobalKey<NavigatorState>();
  
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: AppRoutes.products,
    debugLogDiagnostics: true,
    observers: [NavigationObserver()],
    routes: [
      // Auth routes (outside bottom navigation)
      GoRoute(
        path: AppRoutes.login,
        name: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
      ),
      
      // Shell route for bottom navigation
      ShellRoute(
        navigatorKey: shellNavigatorKey,
        builder: (context, state, child) => BottomNavScaffold(child: child),
        routes: [
          // Products tab
          GoRoute(
            path: AppRoutes.products,
            name: AppRoutes.products,
            builder: (context, state) => const ProductsScreen(),
            routes: [
              GoRoute(
                path: 'detail/:id',
                name: AppRoutes.productDetail,
                builder: (context, state) => ProductDetailScreen(
                  productId: state.pathParameters['id'] ?? '',
                ),
              ),
            ],
          ),
          
          // Cart tab
          GoRoute(
            path: AppRoutes.cart,
            name: AppRoutes.cart,
            builder: (context, state) => const CartScreen(),
          ),
          
          // Profile tab (to be implemented)
          GoRoute(
            path: AppRoutes.profile,
            name: AppRoutes.profile,
            builder: (context, state) => const Center(
              child: Text('Profile Screen - To be implemented'),
            ),
          ),
        ],
      ),
    ],
    
    // Error handling for invalid routes
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text(
          'Page not found: ${state.location}',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
    ),
    
    // Redirect logic - example for authentication check
    redirect: (context, state) {
      // TODO: Implement authentication check and redirects
      // const isLoggedIn = false;
      // final isGoingToLogin = state.matchedLocation == AppRoutes.login;
      
      // if (!isLoggedIn && !isGoingToLogin) {
      //   return AppRoutes.login;
      // }
      
      return null;
    },
  );
}