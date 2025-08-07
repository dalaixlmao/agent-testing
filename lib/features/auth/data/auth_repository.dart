import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/storage/local_storage.dart';
import '../domain/user.dart';

part 'auth_repository.g.dart';

@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  final localStorage = ref.watch(sharedPreferencesStorageProvider);
  return AuthRepository(
    apiClient: apiClient, 
    localStorage: localStorage,
  );
}

class AuthRepository {
  final ApiClient _apiClient;
  final SharedPreferencesStorage _localStorage;
  final firebase.FirebaseAuth _firebaseAuth = firebase.FirebaseAuth.instance;

  AuthRepository({
    required ApiClient apiClient,
    required SharedPreferencesStorage localStorage,
  }) : _apiClient = apiClient, 
       _localStorage = localStorage;

  /// Sign in with email and password
  Future<User> signInWithEmailAndPassword(String email, String password) async {
    try {
      final credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email, 
        password: password,
      );
      
      if (credential.user == null) {
        throw const UnauthorizedException('Authentication failed');
      }
      
      // Get user profile from backend
      return await _getUserProfile(credential.user!.uid);
    } on firebase.FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    }
  }
  
  /// Register with email and password
  Future<User> registerWithEmailAndPassword(
    String name, 
    String email, 
    String password,
  ) async {
    try {
      final credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email, 
        password: password,
      );
      
      if (credential.user == null) {
        throw const UnauthorizedException('Registration failed');
      }
      
      // Update display name
      await credential.user!.updateDisplayName(name);
      
      // Create user profile on backend
      return await _createUserProfile(credential.user!.uid, name, email);
    } on firebase.FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    }
  }
  
  /// Sign out
  Future<void> signOut() async {
    await _firebaseAuth.signOut();
    await _localStorage.remove('user');
  }
  
  /// Get current authenticated user
  Future<User?> getCurrentUser() async {
    final firebaseUser = _firebaseAuth.currentUser;
    
    if (firebaseUser == null) {
      return null;
    }
    
    // Try to get from local storage first
    final cachedUser = _localStorage.get<Map<String, dynamic>>('user');
    if (cachedUser != null) {
      return User.fromJson(cachedUser);
    }
    
    // If not in local storage, fetch from backend
    try {
      return await _getUserProfile(firebaseUser.uid);
    } catch (_) {
      // If backend fetch fails, return a basic user object from Firebase data
      return User(
        id: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        name: firebaseUser.displayName ?? '',
        photoUrl: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      );
    }
  }

  /// Handle Firebase authentication exceptions
  ApiException _handleFirebaseAuthException(firebase.FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
      case 'wrong-password':
        return const UnauthorizedException('Invalid email or password');
      case 'email-already-in-use':
        return const ConflictException('Email is already in use');
      case 'weak-password':
        return const BadRequestException('Password is too weak');
      case 'invalid-email':
        return const BadRequestException('Invalid email address');
      case 'user-disabled':
        return const ForbiddenException('Account has been disabled');
      case 'too-many-requests':
        return const TooManyRequestsException('Too many login attempts, try again later');
      default:
        return UnexpectedException(e.message ?? 'Authentication error');
    }
  }
  
  /// Get user profile from backend
  Future<User> _getUserProfile(String userId) async {
    final user = await _apiClient.get<User>(
      '/users/$userId',
      fromJson: (data) => User.fromJson(data),
    );
    
    // Cache user data
    await _localStorage.set('user', user.toJson());
    
    return user;
  }
  
  /// Create user profile on backend
  Future<User> _createUserProfile(String userId, String name, String email) async {
    final user = await _apiClient.post<User>(
      '/users',
      data: {
        'id': userId,
        'name': name,
        'email': email,
      },
      fromJson: (data) => User.fromJson(data),
    );
    
    // Cache user data
    await _localStorage.set('user', user.toJson());
    
    return user;
  }
}