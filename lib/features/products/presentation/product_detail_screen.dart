import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../../core/network/api_exceptions.dart';
import '../../cart/presentation/cart_controller.dart';
import 'products_controller.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;

  const ProductDetailScreen({
    super.key,
    required this.productId,
  });

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  int _selectedImageIndex = 0;
  int _quantity = 1;

  void _incrementQuantity() {
    setState(() {
      _quantity++;
    });
  }

  void _decrementQuantity() {
    if (_quantity > 1) {
      setState(() {
        _quantity--;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productProvider(widget.productId));
    
    return Scaffold(
      appBar: AppBar(
        title: productAsync.maybeWhen(
          data: (product) => Text(product.title),
          orElse: () => const Text('Product Detail'),
        ),
      ),
      body: productAsync.when(
        data: (product) => Stack(
          children: [
            // Main content
            CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product Images
                      SizedBox(
                        height: 300,
                        child: Stack(
                          children: [
                            // Main image
                            PageView.builder(
                              onPageChanged: (index) {
                                setState(() {
                                  _selectedImageIndex = index;
                                });
                              },
                              itemCount: product.images.isNotEmpty
                                  ? product.images.length
                                  : 1,
                              itemBuilder: (context, index) {
                                final imageUrl = product.images.isNotEmpty
                                    ? product.images[index]
                                    : product.thumbnail;
                                
                                return Hero(
                                  tag: 'product_image_${product.id}',
                                  child: CachedNetworkImage(
                                    imageUrl: imageUrl,
                                    fit: BoxFit.contain,
                                    placeholder: (context, url) => Shimmer.fromColors(
                                      baseColor: Colors.grey[300]!,
                                      highlightColor: Colors.grey[100]!,
                                      child: Container(color: Colors.grey),
                                    ),
                                    errorWidget: (context, url, error) => Container(
                                      color: Colors.grey[300],
                                      child: const Icon(Icons.error_outline),
                                    ),
                                  ),
                                );
                              },
                            ),
                            
                            // Page indicator
                            if (product.images.length > 1)
                              Positioned(
                                bottom: 20,
                                left: 0,
                                right: 0,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: List.generate(
                                    product.images.length,
                                    (index) => Container(
                                      margin: const EdgeInsets.symmetric(horizontal: 4),
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: _selectedImageIndex == index
                                            ? Theme.of(context).colorScheme.primary
                                            : Colors.grey.withOpacity(0.5),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      
                      // Product details
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Title and price
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Title and brand
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        product.title,
                                        style: Theme.of(context).textTheme.headlineSmall,
                                      ),
                                      Text(
                                        product.brand,
                                        style: Theme.of(context).textTheme.titleMedium!.copyWith(
                                          color: Theme.of(context).colorScheme.primary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                
                                // Price
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '\$${product.price.toStringAsFixed(2)}',
                                      style: Theme.of(context).textTheme.headlineSmall!.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Theme.of(context).colorScheme.primary,
                                      ),
                                    ),
                                    if (product.discountPercentage > 0)
                                      Text(
                                        '\$${(product.price / (1 - product.discountPercentage / 100)).toStringAsFixed(2)}',
                                        style: Theme.of(context).textTheme.titleMedium!.copyWith(
                                          decoration: TextDecoration.lineThrough,
                                          color: Colors.grey,
                                        ),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Rating and stock
                            Row(
                              children: [
                                // Rating
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.amber.shade700,
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        Icons.star,
                                        color: Colors.white,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        product.rating.toString(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                
                                const SizedBox(width: 16),
                                
                                // Stock
                                Icon(
                                  product.stock > 0 ? Icons.check_circle : Icons.remove_circle,
                                  color: product.stock > 0 ? Colors.green : Colors.red,
                                  size: 16,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  product.stock > 0
                                      ? 'In Stock (${product.stock})'
                                      : 'Out of Stock',
                                  style: TextStyle(
                                    color: product.stock > 0 ? Colors.green : Colors.red,
                                  ),
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Description
                            Text(
                              'Description',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              product.description,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Category
                            Text(
                              'Category',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            Chip(
                              label: Text(product.category),
                              backgroundColor: Theme.of(context).colorScheme.surfaceVariant,
                            ),
                            
                            // Add extra space at the bottom for the floating button
                            const SizedBox(height: 100),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            // Bottom add to cart bar
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Quantity selector
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove),
                            onPressed: _decrementQuantity,
                            visualDensity: VisualDensity.compact,
                          ),
                          Text(
                            _quantity.toString(),
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          IconButton(
                            icon: const Icon(Icons.add),
                            onPressed: _incrementQuantity,
                            visualDensity: VisualDensity.compact,
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(width: 16),
                    
                    // Add to cart button
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: product.stock > 0
                            ? () {
                                // Add to cart
                                ref.read(cartControllerProvider.notifier)
                                    .addToCart(product, _quantity);
                                
                                // Show success snackbar
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('${product.title} added to cart'),
                                    action: SnackBarAction(
                                      label: 'VIEW CART',
                                      onPressed: () => context.go('/cart'),
                                    ),
                                  ),
                                );
                              }
                            : null,
                        icon: const Icon(Icons.shopping_cart),
                        label: Text(
                          product.stock > 0 ? 'Add to Cart' : 'Out of Stock',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  color: Colors.red,
                  size: 60,
                ),
                const SizedBox(height: 16),
                Text(
                  'Error loading product',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(
                  error is ApiException
                      ? error.message
                      : 'An unexpected error occurred',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () => ref.refresh(productProvider(widget.productId)),
                  child: const Text('Try Again'),
                ),
              ],
            ),
          ),
        ),
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
      ),
    );
  }
}