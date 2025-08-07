/// Base exception class for API related errors
abstract class ApiException implements Exception {
  final String message;
  final dynamic data;

  const ApiException(this.message, [this.data]);

  @override
  String toString() => message;
}

/// Exception for when there is no internet connection
class NoInternetException extends ApiException {
  const NoInternetException([String message = 'No internet connection']) : super(message);
}

/// Exception for when a request times out
class TimeoutException extends ApiException {
  const TimeoutException([String message = 'Request timeout']) : super(message);
}

/// Exception for when a request is cancelled
class RequestCancelledException extends ApiException {
  const RequestCancelledException([String message = 'Request cancelled']) : super(message);
}

/// Exception for bad certificate issues
class BadCertificateException extends ApiException {
  const BadCertificateException([String message = 'Bad certificate']) : super(message);
}

/// Exception for when the server returns a 400 Bad Request error
class BadRequestException extends ApiException {
  const BadRequestException([String message = 'Bad request']) : super(message);
}

/// Exception for when the server returns a 401 Unauthorized error
class UnauthorizedException extends ApiException {
  const UnauthorizedException([String message = 'Unauthorized']) : super(message);
}

/// Exception for when the server returns a 403 Forbidden error
class ForbiddenException extends ApiException {
  const ForbiddenException([String message = 'Forbidden']) : super(message);
}

/// Exception for when the server returns a 404 Not Found error
class NotFoundException extends ApiException {
  const NotFoundException([String message = 'Resource not found']) : super(message);
}

/// Exception for when the server returns a 409 Conflict error
class ConflictException extends ApiException {
  const ConflictException([String message = 'Conflict']) : super(message);
}

/// Exception for when the server returns a 422 Validation Error
class ValidationException extends ApiException {
  const ValidationException([String message = 'Validation error', dynamic data]) : super(message, data);
}

/// Exception for when the server returns a 429 Too Many Requests error
class TooManyRequestsException extends ApiException {
  const TooManyRequestsException([String message = 'Too many requests']) : super(message);
}

/// Exception for when the server returns a 5XX Server Error
class ServerException extends ApiException {
  const ServerException([String message = 'Server error']) : super(message);
}

/// Exception for unexpected errors
class UnexpectedException extends ApiException {
  const UnexpectedException([String message = 'An unexpected error occurred']) : super(message);
}