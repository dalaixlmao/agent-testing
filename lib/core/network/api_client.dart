import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../utils/connectivity_manager.dart';
import 'api_exceptions.dart';

part 'api_client.g.dart';

/// Base URL for API requests
const String _baseUrl = 'https://api.example.com/v1';

/// API client for handling network requests
@riverpod
ApiClient apiClient(ApiClientRef ref) {
  final dio = Dio(BaseOptions(
    baseUrl: _baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));
  
  return ApiClient(dio: dio);
}

class ApiClient {
  final Dio dio;

  ApiClient({required this.dio});

  /// Generic GET request method
  Future<T> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic data) fromJson,
  }) async {
    try {
      final response = await dio.get(
        endpoint,
        queryParameters: queryParameters,
      );
      return fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw UnexpectedException(e.toString());
    }
  }

  /// Generic POST request method
  Future<T> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic data) fromJson,
  }) async {
    try {
      final response = await dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
      );
      return fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw UnexpectedException(e.toString());
    }
  }

  /// Generic PUT request method
  Future<T> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic data) fromJson,
  }) async {
    try {
      final response = await dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
      );
      return fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw UnexpectedException(e.toString());
    }
  }

  /// Generic DELETE request method
  Future<T> delete<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic data) fromJson,
  }) async {
    try {
      final response = await dio.delete(
        endpoint,
        queryParameters: queryParameters,
      );
      return fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      throw UnexpectedException(e.toString());
    }
  }

  /// Helper method to handle Dio exceptions
  ApiException _handleDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return TimeoutException('Connection timeout');
      case DioExceptionType.badResponse:
        return _handleStatusCode(e.response);
      case DioExceptionType.cancel:
        return RequestCancelledException('Request cancelled');
      case DioExceptionType.connectionError:
        return NoInternetException('No internet connection');
      case DioExceptionType.badCertificate:
        return BadCertificateException('Bad certificate');
      case DioExceptionType.unknown:
      default:
        if (e.error is SocketException) {
          return NoInternetException('No internet connection');
        }
        return UnexpectedException(e.message ?? 'Unexpected error occurred');
    }
  }

  /// Helper method to handle HTTP status codes
  ApiException _handleStatusCode(Response? response) {
    final statusCode = response?.statusCode;
    final responseData = response?.data;
    final message = responseData is Map ? responseData['message'] : null;

    switch (statusCode) {
      case 400:
        return BadRequestException(message ?? 'Bad request');
      case 401:
        return UnauthorizedException(message ?? 'Unauthorized');
      case 403:
        return ForbiddenException(message ?? 'Forbidden');
      case 404:
        return NotFoundException(message ?? 'Resource not found');
      case 409:
        return ConflictException(message ?? 'Conflict');
      case 422:
        return ValidationException(message ?? 'Validation error', responseData);
      case 429:
        return TooManyRequestsException(message ?? 'Too many requests');
      case 500:
      case 501:
      case 502:
      case 503:
        return ServerException(message ?? 'Server error');
      default:
        return UnexpectedException(message ?? 'Unexpected error occurred');
    }
  }
}