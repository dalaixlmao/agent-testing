import 'dart:convert';

import 'package:hive_flutter/hive_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'local_storage.g.dart';

/// Local storage implementation using SharedPreferences
@riverpod
SharedPreferencesStorage sharedPreferencesStorage(SharedPreferencesStorageRef ref) {
  return SharedPreferencesStorage();
}

class SharedPreferencesStorage {
  SharedPreferences? _prefs;

  /// Initialize SharedPreferences
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  /// Get a value by key
  T? get<T>(String key) {
    if (_prefs == null) return null;

    if (T == String) {
      return _prefs!.getString(key) as T?;
    } else if (T == int) {
      return _prefs!.getInt(key) as T?;
    } else if (T == double) {
      return _prefs!.getDouble(key) as T?;
    } else if (T == bool) {
      return _prefs!.getBool(key) as T?;
    } else if (T == List<String>) {
      return _prefs!.getStringList(key) as T?;
    } else {
      final jsonString = _prefs!.getString(key);
      if (jsonString == null) return null;
      return json.decode(jsonString) as T?;
    }
  }

  /// Set a value by key
  Future<bool> set<T>(String key, T value) async {
    if (_prefs == null) await init();

    if (value is String) {
      return _prefs!.setString(key, value);
    } else if (value is int) {
      return _prefs!.setInt(key, value);
    } else if (value is double) {
      return _prefs!.setDouble(key, value);
    } else if (value is bool) {
      return _prefs!.setBool(key, value);
    } else if (value is List<String>) {
      return _prefs!.setStringList(key, value);
    } else {
      final jsonString = json.encode(value);
      return _prefs!.setString(key, jsonString);
    }
  }

  /// Remove a value by key
  Future<bool> remove(String key) async {
    if (_prefs == null) await init();
    return _prefs!.remove(key);
  }

  /// Clear all values
  Future<bool> clear() async {
    if (_prefs == null) await init();
    return _prefs!.clear();
  }
}

/// Hive storage provider
@riverpod
HiveStorage hiveStorage(HiveStorageRef ref) {
  return HiveStorage();
}

/// Local storage implementation using Hive
class HiveStorage {
  /// Initialize Hive and open boxes
  Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox('products');
    await Hive.openBox('cart');
    await Hive.openBox('user');
  }

  /// Get a value from a box by key
  T? get<T>(String boxName, String key) {
    final box = Hive.box(boxName);
    return box.get(key) as T?;
  }

  /// Get all values from a box
  Map<dynamic, dynamic> getAll(String boxName) {
    final box = Hive.box(boxName);
    final Map<dynamic, dynamic> result = {};
    
    for (var i = 0; i < box.length; i++) {
      final key = box.keyAt(i);
      result[key] = box.get(key);
    }
    
    return result;
  }

  /// Put a value in a box
  Future<void> put(String boxName, String key, dynamic value) async {
    final box = Hive.box(boxName);
    await box.put(key, value);
  }

  /// Put multiple values in a box
  Future<void> putAll(String boxName, Map<String, dynamic> entries) async {
    final box = Hive.box(boxName);
    await box.putAll(entries);
  }

  /// Remove a value from a box
  Future<void> remove(String boxName, String key) async {
    final box = Hive.box(boxName);
    await box.delete(key);
  }

  /// Clear a box
  Future<void> clear(String boxName) async {
    final box = Hive.box(boxName);
    await box.clear();
  }
}