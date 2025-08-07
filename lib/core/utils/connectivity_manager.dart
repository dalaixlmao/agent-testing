import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'connectivity_manager.g.dart';

/// Provider to watch network connectivity status
@riverpod
Stream<ConnectivityResult> connectivityStream(ConnectivityStreamRef ref) {
  return Connectivity().onConnectivityChanged;
}

/// Provider to get current network connectivity status
@riverpod
class ConnectivityStatus extends _$ConnectivityStatus {
  @override
  FutureOr<bool> build() async {
    final connectivity = await Connectivity().checkConnectivity();
    return connectivity != ConnectivityResult.none;
  }

  Future<void> checkConnectivity() async {
    final connectivity = await Connectivity().checkConnectivity();
    state = AsyncData(connectivity != ConnectivityResult.none);
  }
}

/// Widget to display a banner when offline
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(connectivityStreamProvider).maybeWhen(
          data: (status) => status != ConnectivityResult.none,
          orElse: () => true,
        );

    if (isOnline) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      color: Colors.red,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: const Center(
        child: Text(
          'You are offline. Some features may be unavailable.',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }
}