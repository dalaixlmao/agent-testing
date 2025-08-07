import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../data/product_repository.dart';
import '../domain/product.dart';

part 'products_controller.g.dart';

/// Provider for fetching product categories
@riverpod
Future<List<ProductCategory>> productCategories(ProductCategoriesRef ref) {
  return ref.watch(productRepositoryProvider).getCategories();
}

/// Controller for product listings with filtering, pagination, and search
@riverpod
class ProductsController extends _$ProductsController {
  static const int _pageSize = 20;
  
  @override
  FutureOr<List<Product>> build({String? categoryId, String? searchQuery}) async {
    _currentPage = 0;
    _hasMorePages = true;
    
    final products = await _fetchProducts(
      offset: 0,
      category: categoryId,
      query: searchQuery,
    );
    
    // Update if we have more pages
    _hasMorePages = products.length >= _pageSize;
    
    return products;
  }

  /// Private state variables
  int _currentPage = 0;
  bool _hasMorePages = true;

  /// Load the next page of products
  Future<void> loadNextPage() async {
    if (!_hasMorePages || state.isLoading) return;

    state = const AsyncLoading();
    
    final currentProducts = state.valueOrNull ?? [];
    final nextPage = _currentPage + 1;
    
    try {
      final nextProducts = await _fetchProducts(
        offset: nextPage * _pageSize,
        category: categoryId,
        query: searchQuery,
      );
      
      // If we got fewer items than the page size, we've reached the end
      _hasMorePages = nextProducts.length >= _pageSize;
      _currentPage = nextPage;
      
      // Combine current and next products
      state = AsyncData([...currentProducts, ...nextProducts]);
    } catch (error, stackTrace) {
      // Preserve existing data on error, but show error state
      if (currentProducts.isNotEmpty) {
        state = AsyncValue.error(error, stackTrace).copyWithPrevious(AsyncData(currentProducts));
      } else {
        state = AsyncValue.error(error, stackTrace);
      }
    }
  }
  
  /// Refresh products
  Future<void> refresh() async {
    _currentPage = 0;
    _hasMorePages = true;
    
    state = const AsyncLoading();
    
    try {
      final products = await _fetchProducts(
        offset: 0,
        category: categoryId,
        query: searchQuery,
        forceRefresh: true,
      );
      
      _hasMorePages = products.length >= _pageSize;
      state = AsyncData(products);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  /// Helper method to fetch products
  Future<List<Product>> _fetchProducts({
    required int offset,
    String? category,
    String? query,
    bool forceRefresh = false,
  }) {
    return ref.read(productRepositoryProvider).getProducts(
      offset: offset,
      limit: _pageSize,
      category: category,
      query: query,
      forceRefresh: forceRefresh,
    );
  }
  
  /// Check if more pages are available
  bool get hasMorePages => _hasMorePages;
  
  /// Get the selected category ID
  String? get categoryId => ref.filter<String?>().categoryId;
  
  /// Get the current search query
  String? get searchQuery => ref.filter<String?>().searchQuery;
}

/// Provider for fetching a single product by ID
@riverpod
Future<Product> product(ProductRef ref, String id) {
  return ref.watch(productRepositoryProvider).getProductById(id);
}