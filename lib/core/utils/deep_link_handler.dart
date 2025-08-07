import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uni_links/uni_links.dart';

part 'deep_link_handler.g.dart';

/// Deep link handler provider
@riverpod
DeepLinkHandler deepLinkHandler(DeepLinkHandlerRef ref) {
  return DeepLinkHandler();
}

/// Deep link handler class
class DeepLinkHandler {
  final StreamController<Uri> _deepLinkStreamController = 
      StreamController<Uri>.broadcast();
      
  /// Stream of deep link events
  Stream<Uri> get deepLinkStream => _deepLinkStreamController.stream;
  
  /// Initialize deep link handling
  Future<void> initializeDeepLinks() async {
    // Handle deep link if app was started by a link
    try {
      final initialLink = await getInitialUri();
      if (initialLink != null) {
        _deepLinkStreamController.add(initialLink);
      }
    } on PlatformException catch (_) {
      // Handle exception if needed
    }
    
    // Listen for deep link events
    uriLinkStream.listen((Uri? uri) {
      if (uri != null) {
        _deepLinkStreamController.add(uri);
      }
    }, onError: (err) {
      // Handle errors
    });
  }
  
  /// Parse deep link URI
  DeepLinkData? parseDeepLink(Uri uri) {
    // Extract path and parameters
    final path = uri.path;
    final queryParams = uri.queryParameters;
    
    // Example patterns:
    // /products - Show product listing
    // /products/{id} - Show specific product
    // /cart - Show cart
    // /profile - Show user profile
    
    if (path.startsWith('/products')) {
      final segments = path.split('/');
      if (segments.length > 2) {
        return DeepLinkData(
          type: DeepLinkType.product,
          id: segments[2],
          parameters: queryParams,
        );
      } else {
        return DeepLinkData(
          type: DeepLinkType.productsList,
          parameters: queryParams,
        );
      }
    } else if (path == '/cart') {
      return DeepLinkData(
        type: DeepLinkType.cart,
        parameters: queryParams,
      );
    } else if (path == '/profile') {
      return DeepLinkData(
        type: DeepLinkType.profile,
        parameters: queryParams,
      );
    } else {
      // Unknown path or home
      return DeepLinkData(
        type: DeepLinkType.home,
        parameters: queryParams,
      );
    }
  }
  
  /// Dispose resources
  void dispose() {
    _deepLinkStreamController.close();
  }
}

/// Deep link data class
class DeepLinkData {
  final DeepLinkType type;
  final String? id;
  final Map<String, String> parameters;
  
  DeepLinkData({
    required this.type,
    this.id,
    this.parameters = const {},
  });
}

/// Deep link type enum
enum DeepLinkType {
  home,
  product,
  productsList,
  cart,
  profile,
}

/// Widget for listening to deep links
class DeepLinkListener extends StatefulWidget {
  final Widget child;
  final void Function(DeepLinkData data) onDeepLink;
  
  const DeepLinkListener({
    super.key,
    required this.child,
    required this.onDeepLink,
  });

  @override
  State<DeepLinkListener> createState() => _DeepLinkListenerState();
}

class _DeepLinkListenerState extends State<DeepLinkListener> {
  StreamSubscription? _subscription;
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final deepLinkHandler = DeepLinkHandler();
    
    // Initialize deep links
    deepLinkHandler.initializeDeepLinks();
    
    // Listen for deep link events
    _subscription = deepLinkHandler.deepLinkStream.listen((Uri uri) {
      final data = deepLinkHandler.parseDeepLink(uri);
      if (data != null) {
        widget.onDeepLink(data);
      }
    });
  }
  
  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}