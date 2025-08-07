import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:local_auth/error_codes.dart' as auth_error;
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'biometrics_helper.g.dart';

@riverpod
BiometricsHelper biometricsHelper(BiometricsHelperRef ref) {
  return BiometricsHelper();
}

class BiometricsHelper {
  final LocalAuthentication _auth = LocalAuthentication();
  
  /// Check if device supports biometric authentication
  Future<bool> isBiometricsAvailable() async {
    try {
      // Check if biometrics are available on this device
      return await _auth.canCheckBiometrics;
    } on PlatformException catch (_) {
      return false;
    }
  }
  
  /// Get available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } on PlatformException catch (_) {
      return [];
    }
  }
  
  /// Authenticate with biometrics
  Future<BiometricResult> authenticate({
    String localizedReason = 'Please authenticate to continue',
    bool useErrorDialogs = true,
    bool stickyAuth = true,
  }) async {
    try {
      // Check if biometrics or secure storage is available
      final isDeviceSupported = await _auth.isDeviceSupported();
      if (!isDeviceSupported) {
        return BiometricResult(
          success: false,
          error: BiometricError.unsupported,
          message: 'Device does not support biometric authentication',
        );
      }
      
      // Attempt authentication
      final authenticated = await _auth.authenticate(
        localizedReason: localizedReason,
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          biometricOnly: true,
        ),
      );
      
      if (authenticated) {
        return BiometricResult(success: true);
      } else {
        return BiometricResult(
          success: false,
          error: BiometricError.failed,
          message: 'Authentication failed',
        );
      }
    } on PlatformException catch (e) {
      return _handlePlatformException(e);
    } catch (e) {
      return BiometricResult(
        success: false,
        error: BiometricError.unknown,
        message: e.toString(),
      );
    }
  }
  
  /// Handle platform exceptions during biometric authentication
  BiometricResult _handlePlatformException(PlatformException exception) {
    String message;
    BiometricError error;
    
    switch (exception.code) {
      case auth_error.notAvailable:
        message = 'Biometrics not available on this device';
        error = BiometricError.unavailable;
        break;
      case auth_error.notEnrolled:
        message = 'No biometrics enrolled on this device';
        error = BiometricError.notEnrolled;
        break;
      case auth_error.lockedOut:
        message = 'Biometrics locked out due to too many attempts';
        error = BiometricError.lockedOut;
        break;
      case auth_error.permanentlyLockedOut:
        message = 'Biometrics permanently locked out';
        error = BiometricError.permanentlyLockedOut;
        break;
      case auth_error.passcodeNotSet:
        message = 'Device security not enabled (no PIN/pattern/password)';
        error = BiometricError.passcodeNotSet;
        break;
      default:
        message = exception.message ?? 'Unknown biometric error';
        error = BiometricError.unknown;
    }
    
    return BiometricResult(
      success: false,
      error: error,
      message: message,
    );
  }
}

/// Result of biometric authentication
class BiometricResult {
  final bool success;
  final BiometricError? error;
  final String? message;
  
  BiometricResult({
    required this.success,
    this.error,
    this.message,
  });
}

/// Types of biometric errors
enum BiometricError {
  unsupported,
  unavailable,
  notEnrolled,
  lockedOut,
  permanentlyLockedOut,
  passcodeNotSet,
  failed,
  unknown,
}