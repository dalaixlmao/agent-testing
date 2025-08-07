import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'app_routes.dart';

class BottomNavScaffold extends StatefulWidget {
  final Widget child;

  const BottomNavScaffold({super.key, required this.child});

  @override
  State<BottomNavScaffold> createState() => _BottomNavScaffoldState();
}

class _BottomNavScaffoldState extends State<BottomNavScaffold> {
  int _currentIndex = 0;

  // Define the list of available bottom navigation bar items
  static const List<(String path, String label, IconData icon)> _navigationItems = [
    (AppRoutes.products, 'Products', Icons.storefront),
    (AppRoutes.cart, 'Cart', Icons.shopping_cart),
    (AppRoutes.profile, 'Profile', Icons.person),
  ];

  // Calculate current index based on location
  void _calculateIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    int index = _navigationItems.indexWhere((item) => location.startsWith(item.$1));
    if (index != -1 && index != _currentIndex) {
      setState(() => _currentIndex = index);
    }
  }

  @override
  Widget build(BuildContext context) {
    _calculateIndex(context);
    
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          // Only navigate if index is different
          if (index != _currentIndex) {
            context.go(_navigationItems[index].$1);
          }
        },
        destinations: _navigationItems.map((item) => 
          NavigationDestination(
            icon: Icon(item.$3),
            label: item.$2,
          ),
        ).toList(),
      ),
    );
  }
}