import 'package:flutter/material.dart';
import 'package:logger/logger.dart';

/// Custom navigation observer to log route changes
class NavigationObserver extends NavigatorObserver {
  final _logger = Logger();

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    _logger.i('Route pushed: ${route.settings.name}');
    super.didPush(route, previousRoute);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    _logger.i('Route popped: ${route.settings.name}');
    super.didPop(route, previousRoute);
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    _logger.i('Route replaced: ${newRoute?.settings.name}');
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
  }

  @override
  void didRemove(Route<dynamic> route, Route<dynamic>? previousRoute) {
    _logger.i('Route removed: ${route.settings.name}');
    super.didRemove(route, previousRoute);
  }
}