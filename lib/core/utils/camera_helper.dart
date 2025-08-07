import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'camera_helper.g.dart';

/// Provider for available cameras
@riverpod
Future<List<CameraDescription>> availableCameras(AvailableCamerasRef ref) async {
  try {
    return await availableCameraDescriptions();
  } catch (e) {
    return [];
  }
}

/// Get available camera descriptions
Future<List<CameraDescription>> availableCameraDescriptions() async {
  PermissionStatus status = await Permission.camera.status;
  
  if (!status.isGranted) {
    status = await Permission.camera.request();
    if (!status.isGranted) {
      return [];
    }
  }
  
  return await availableCameras();
}

/// Camera helper class for taking photos
class CameraHelper {
  CameraController? controller;
  
  /// Initialize camera controller
  Future<void> initializeCamera(CameraDescription camera) async {
    controller = CameraController(
      camera,
      ResolutionPreset.high,
      enableAudio: false,
    );
    
    await controller!.initialize();
  }
  
  /// Check if camera is initialized
  bool get isInitialized => controller?.value.isInitialized ?? false;
  
  /// Dispose camera controller
  void dispose() {
    controller?.dispose();
    controller = null;
  }
  
  /// Take a picture
  Future<File?> takePicture() async {
    if (controller == null || !controller!.value.isInitialized) {
      return null;
    }
    
    if (controller!.value.isTakingPicture) {
      return null;
    }
    
    try {
      final XFile file = await controller!.takePicture();
      return File(file.path);
    } catch (e) {
      return null;
    }
  }
  
  /// Save image to temporary directory
  Future<File?> saveImageToTemp(File imageFile) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final fileName = DateTime.now().millisecondsSinceEpoch.toString();
      final targetPath = '${tempDir.path}/$fileName.jpg';
      
      return await imageFile.copy(targetPath);
    } catch (e) {
      return null;
    }
  }
}

/// Camera preview widget
class CameraPreviewWidget extends StatelessWidget {
  final CameraController controller;

  const CameraPreviewWidget({
    super.key,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    if (!controller.value.isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }
    
    return AspectRatio(
      aspectRatio: controller.value.aspectRatio,
      child: CameraPreview(controller),
    );
  }
}