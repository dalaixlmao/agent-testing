import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/network/api_exceptions.dart';
import '../data/auth_repository.dart';
import '../domain/user.dart';

part 'auth_controller.g.dart';

@riverpod
class AuthController extends _$AuthController {
  @override
  FutureOr<User?> build() async {
    return _getCurrentUser();
  }

  /// Get current user
  Future<User?> _getCurrentUser() async {
    return await ref.read(authRepositoryProvider).getCurrentUser();
  }

  /// Sign in with email and password
  Future<void> signIn(String email, String password) async {
    state = const AsyncLoading();
    
    try {
      final user = await ref.read(authRepositoryProvider)
        .signInWithEmailAndPassword(email, password);
      state = AsyncData(user);
    } on ApiException catch (e) {
      state = AsyncError(e, StackTrace.current);
    } catch (e, stackTrace) {
      state = AsyncError(e, stackTrace);
    }
  }

  /// Register with email and password
  Future<void> register(String name, String email, String password) async {
    state = const AsyncLoading();
    
    try {
      final user = await ref.read(authRepositoryProvider)
        .registerWithEmailAndPassword(name, email, password);
      state = AsyncData(user);
    } on ApiException catch (e) {
      state = AsyncError(e, StackTrace.current);
    } catch (e, stackTrace) {
      state = AsyncError(e, stackTrace);
    }
  }

  /// Sign out
  Future<void> signOut() async {
    state = const AsyncLoading();
    
    try {
      await ref.read(authRepositoryProvider).signOut();
      state = const AsyncData(null);
    } catch (e, stackTrace) {
      state = AsyncError(e, stackTrace);
    }
  }

  /// Check if user is authenticated
  bool get isAuthenticated => state.valueOrNull != null;
}