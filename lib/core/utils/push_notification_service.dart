import 'dart:async';
import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'push_notification_service.g.dart';

/// Channel ID for Android notifications
const String _channelId = 'ecommerce_notifications';
/// Channel name for Android notifications
const String _channelName = 'E-Commerce Notifications';
/// Channel description for Android notifications
const String _channelDescription = 'Notifications from the E-Commerce app';

/// Provider for push notification service
@riverpod
PushNotificationService pushNotificationService(PushNotificationServiceRef ref) {
  return PushNotificationService();
}

/// Push notification service for handling FCM notifications
class PushNotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();
  
  /// Stream controller for notification taps
  final StreamController<Map<String, dynamic>> _notificationStreamController =
      StreamController<Map<String, dynamic>>.broadcast();
      
  /// Stream of notification tap events
  Stream<Map<String, dynamic>> get notificationStream => 
      _notificationStreamController.stream;
  
  /// Initialize push notifications
  Future<void> initialize() async {
    // Request permission for iOS
    if (Platform.isIOS) {
      await _requestIOSPermission();
    }
    
    // Initialize local notifications plugin
    await _initializeLocalNotifications();
    
    // Listen for FCM messages
    _setupFirebaseListeners();
    
    // Get FCM token
    await getToken();
  }
  
  /// Request iOS notification permission
  Future<void> _requestIOSPermission() async {
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    
    if (kDebugMode) {
      print('iOS Permission status: ${settings.authorizationStatus}');
    }
  }
  
  /// Initialize local notifications plugin
  Future<void> _initializeLocalNotifications() async {
    // Android initialization
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    // iOS initialization
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    
    // Initialize settings
    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );
    
    await _flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
    
    // Create Android notification channel
    await _createNotificationChannel();
  }
  
  /// Create Android notification channel
  Future<void> _createNotificationChannel() async {
    if (Platform.isAndroid) {
      const AndroidNotificationChannel channel = AndroidNotificationChannel(
        _channelId,
        _channelName,
        description: _channelDescription,
        importance: Importance.high,
      );
      
      await _flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);
    }
  }
  
  /// Set up Firebase message listeners
  void _setupFirebaseListeners() {
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (kDebugMode) {
        print('Got a message whilst in the foreground!');
        print('Message data: ${message.data}');
      }
      
      if (message.notification != null) {
        _showLocalNotification(message);
      }
    });
    
    // Handle background messages opening the app
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (message.data.isNotEmpty) {
        _notificationStreamController.add(message.data);
      }
    });
    
    // Check if the app was opened from a notification
    FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) {
      if (message != null && message.data.isNotEmpty) {
        _notificationStreamController.add(message.data);
      }
    });
  }
  
  /// Show local notification
  void _showLocalNotification(RemoteMessage message) {
    final notification = message.notification;
    final android = message.notification?.android;
    
    if (notification != null) {
      _flutterLocalNotificationsPlugin.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            _channelId,
            _channelName,
            channelDescription: _channelDescription,
            icon: android?.smallIcon ?? '@mipmap/ic_launcher',
            importance: Importance.max,
            priority: Priority.high,
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: message.data.isEmpty ? null : message.data.toString(),
      );
    }
  }
  
  /// Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null && response.payload!.isNotEmpty) {
      try {
        // Parse payload and send to stream
        final data = _parsePayload(response.payload!);
        if (data.isNotEmpty) {
          _notificationStreamController.add(data);
        }
      } catch (e) {
        if (kDebugMode) {
          print('Error parsing notification payload: $e');
        }
      }
    }
  }
  
  /// Parse notification payload
  Map<String, dynamic> _parsePayload(String payload) {
    // Simple string parsing for demonstration
    // In a real app, you would use json.decode
    final data = <String, dynamic>{};
    
    payload = payload.replaceAll('{', '').replaceAll('}', '');
    final pairs = payload.split(',');
    
    for (final pair in pairs) {
      final keyValue = pair.split(':');
      if (keyValue.length == 2) {
        final key = keyValue[0].trim();
        final value = keyValue[1].trim();
        data[key] = value;
      }
    }
    
    return data;
  }
  
  /// Get FCM token
  Future<String?> getToken() async {
    try {
      final token = await _firebaseMessaging.getToken();
      if (kDebugMode && token != null) {
        print('FCM Token: $token');
      }
      return token;
    } catch (e) {
      if (kDebugMode) {
        print('Error getting FCM token: $e');
      }
      return null;
    }
  }
  
  /// Subscribe to a topic
  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }
  
  /// Unsubscribe from a topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }
  
  /// Dispose resources
  void dispose() {
    _notificationStreamController.close();
  }
}