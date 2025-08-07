import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/local_storage.dart';
import '../domain/product.dart';

part 'product_repository.g.dart';

@riverpod
ProductRepository productRepository(ProductRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  final localStorage = ref.watch(hiveStorageProvider);
  return ProductRepository(
    apiClient: apiClient,
    localStorage: localStorage,
  );
}

class ProductRepository {
  final ApiClient _apiClient;
  final HiveStorage _localStorage;
  
  static const String _productsBox = 'products';
  static const String _categoriesBox = 'categories';
  static const String _lastFetchKey = 'last_fetch_timestamp';

  ProductRepository({
    required ApiClient apiClient,
    required HiveStorage localStorage,
  }) : _apiClient = apiClient,
       _localStorage = localStorage;

  /// Get all products with pagination and optional caching
  Future<List<Product>> getProducts({
    int offset = 0, 
    int limit = 20,
    String? category,
    String? query,
    bool forceRefresh = false,
  }) async {
    final cacheKey = 'products_${offset}_${limit}_${category ?? ''}_${query ?? ''}';
    
    // Check if we have cached data and it's not expired
    if (!forceRefresh) {
      final cachedData = _localStorage.get<List<dynamic>>(_productsBox, cacheKey);
      final lastFetch = _localStorage.get<int>(_productsBox, _lastFetchKey);
      
      // Use cache if it exists and is less than 30 minutes old
      if (cachedData != null && lastFetch != null) {
        final cacheAge = DateTime.now().millisecondsSinceEpoch - lastFetch;
        if (cacheAge < const Duration(minutes: 30).inMilliseconds) {
          return cachedData
              .map((item) => Product.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
      }
    }
    
    // If no cache or force refresh, fetch from API
    final queryParams = <String, dynamic>{
      'limit': limit,
      'skip': offset,
    };
    
    if (category != null && category.isNotEmpty) {
      queryParams['category'] = category;
    }
    
    if (query != null && query.isNotEmpty) {
      queryParams['q'] = query;
    }
    
    // Endpoint structure is based on DummyJSON API for example
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/products',
      queryParameters: queryParams,
      fromJson: (data) => data as Map<String, dynamic>,
    );
    
    final List<dynamic> productsJson = response['products'] ?? [];
    final List<Product> products = productsJson
        .map((json) => Product.fromJson(json as Map<String, dynamic>))
        .toList();
    
    // Cache the results
    await _localStorage.put(_productsBox, cacheKey, productsJson);
    await _localStorage.put(_productsBox, _lastFetchKey, DateTime.now().millisecondsSinceEpoch);
    
    return products;
  }
  
  /// Get a single product by ID
  Future<Product> getProductById(String id) async {
    // Check cache first
    final cachedData = _localStorage.get<Map<String, dynamic>>(_productsBox, 'product_$id');
    
    if (cachedData != null) {
      return Product.fromJson(cachedData);
    }
    
    // Fetch from API
    final product = await _apiClient.get<Product>(
      '/products/$id',
      fromJson: (data) => Product.fromJson(data as Map<String, dynamic>),
    );
    
    // Cache the result
    await _localStorage.put(_productsBox, 'product_$id', product.toJson());
    
    return product;
  }
  
  /// Get all product categories
  Future<List<ProductCategory>> getCategories() async {
    // Check cache first
    final cachedData = _localStorage.get<List<dynamic>>(_categoriesBox, 'all_categories');
    final lastFetch = _localStorage.get<int>(_categoriesBox, _lastFetchKey);
    
    // Use cache if it exists and is less than 1 hour old
    if (cachedData != null && lastFetch != null) {
      final cacheAge = DateTime.now().millisecondsSinceEpoch - lastFetch;
      if (cacheAge < const Duration(hours: 1).inMilliseconds) {
        return cachedData
            .map((item) => ProductCategory.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    }
    
    // Fetch from API
    final response = await _apiClient.get<List<String>>(
      '/products/categories',
      fromJson: (data) => List<String>.from(data as List),
    );
    
    // Convert to ProductCategory objects
    final categories = response.map((name) => ProductCategory(
      id: name,
      name: _formatCategoryName(name),
    )).toList();
    
    // Cache the results
    await _localStorage.put(_categoriesBox, 'all_categories', 
      categories.map((e) => e.toJson()).toList());
    await _localStorage.put(_categoriesBox, _lastFetchKey, 
      DateTime.now().millisecondsSinceEpoch);
    
    return categories;
  }
  
  /// Helper method to format category name for display
  String _formatCategoryName(String name) {
    return name.split('-').map((word) => 
      word.isEmpty ? '' : word[0].toUpperCase() + word.substring(1)
    ).join(' ');
  }
}