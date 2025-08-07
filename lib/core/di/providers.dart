import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'providers.g.dart';

/// Application logger provider
@riverpod
Logger logger(LoggerRef ref) {
  return Logger(
    printer: PrettyPrinter(
      methodCount: 2,
      errorMethodCount: 8,
      lineLength: 120,
      colors: true,
      printEmojis: true,
      printTime: true,
    ),
    level: kDebugMode ? Level.verbose : Level.warning,
  );
}

/// Application flavor provider
@riverpod
String appFlavor(AppFlavorRef ref) {
  // Default to 'development' flavor
  return const String.fromEnvironment('FLAVOR', defaultValue: 'development');
}

/// Build configuration provider
@riverpod
Map<String, dynamic> buildConfig(BuildConfigRef ref) {
  final flavor = ref.watch(appFlavorProvider);
  
  // Define configuration based on flavor
  switch (flavor) {
    case 'production':
      return {
        'apiBaseUrl': 'https://api.example.com/v1',
        'enableLogging': false,
        'cacheExpirationMinutes': 60,
      };
    case 'staging':
      return {
        'apiBaseUrl': 'https://staging-api.example.com/v1',
        'enableLogging': true,
        'cacheExpirationMinutes': 30,
      };
    case 'development':
    default:
      return {
        'apiBaseUrl': 'https://dev-api.example.com/v1',
        'enableLogging': true,
        'cacheExpirationMinutes': 15,
      };
  }
}