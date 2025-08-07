import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exceptions.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/utils/connectivity_manager.dart';
import '../domain/product.dart';
import 'products_controller.dart';
import 'widgets/product_grid_item.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  String? _selectedCategoryId;
  String? _searchQuery;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final productsController = ref.read(
        productsControllerProvider(
          categoryId: _selectedCategoryId,
          searchQuery: _searchQuery,
        ).notifier,
      );
      if (productsController.hasMorePages) {
        productsController.loadNextPage();
      }
    }
  }

  void _onCategorySelected(String? categoryId) {
    setState(() {
      _selectedCategoryId = categoryId;
      _searchController.clear();
      _searchQuery = null;
    });
  }

  void _onSearch(String query) {
    setState(() {
      _searchQuery = query.isEmpty ? null : query;
      _selectedCategoryId = null; // Clear category filter when searching
    });
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(
      productsControllerProvider(
        categoryId: _selectedCategoryId,
        searchQuery: _searchQuery,
      ),
    );
    final categoriesAsync = ref.watch(productCategoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search products...',
                  border: InputBorder.none,
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _searchController.clear();
                      _onSearch('');
                      setState(() => _isSearching = false);
                    },
                  ),
                ),
                onSubmitted: _onSearch,
                autofocus: true,
              )
            : const Text('Products'),
        actions: [
          if (!_isSearching)
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () => setState(() => _isSearching = true),
            ),
        ],
      ),
      body: Column(
        children: [
          // Offline banner
          const OfflineBanner(),
          
          // Categories horizontal list
          SizedBox(
            height: 50,
            child: categoriesAsync.when(
              data: (categories) => ListView(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                scrollDirection: Axis.horizontal,
                children: [
                  // "All" category chip
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: FilterChip(
                      label: const Text('All'),
                      selected: _selectedCategoryId == null,
                      onSelected: (_) => _onCategorySelected(null),
                    ),
                  ),
                  ...categories.map((category) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: FilterChip(
                          label: Text(category.name),
                          selected: _selectedCategoryId == category.id,
                          onSelected: (_) => _onCategorySelected(category.id),
                        ),
                      )),
                ],
              ),
              error: (error, _) => Center(
                child: Text(
                  error is ApiException
                      ? error.message
                      : 'Failed to load categories',
                  style: const TextStyle(color: Colors.red),
                ),
              ),
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          ),
          
          // Products grid
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref
                  .read(
                    productsControllerProvider(
                      categoryId: _selectedCategoryId,
                      searchQuery: _searchQuery,
                    ).notifier,
                  )
                  .refresh(),
              child: productsAsync.when(
                data: (products) => products.isEmpty
                    ? const Center(
                        child: Text('No products found'),
                      )
                    : _buildProductsGrid(products),
                error: (error, _) => Center(
                  child: Text(
                    error is ApiException
                        ? error.message
                        : 'Failed to load products',
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
                loading: () => const Center(
                  child: CircularProgressIndicator(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductsGrid(List<Product> products) {
    // Use a GridView.builder for efficient rendering
    return GridView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
      ),
      itemCount: products.length + 1, // +1 for the loading indicator
      itemBuilder: (context, index) {
        if (index == products.length) {
          // Show loading indicator at the end if more pages are available
          return ref
                  .read(
                    productsControllerProvider(
                      categoryId: _selectedCategoryId,
                      searchQuery: _searchQuery,
                    ).notifier,
                  )
                  .hasMorePages
              ? const Center(child: CircularProgressIndicator())
              : const SizedBox.shrink();
        }
        
        return ProductGridItem(
          product: products[index],
          onTap: () => context.go(
            '${AppRoutes.products}/detail/${products[index].id}',
          ),
        );
      },
    );
  }
}