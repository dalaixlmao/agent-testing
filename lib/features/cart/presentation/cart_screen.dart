import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/utils/connectivity_manager.dart';
import '../../products/presentation/products_screen.dart';
import 'cart_controller.dart';
import 'widgets/cart_item_tile.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartAsync = ref.watch(cartControllerProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Cart'),
        actions: [
          cartAsync.maybeWhen(
            data: (cart) => cart.items.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () => _showClearCartDialog(context, ref),
                  )
                : const SizedBox.shrink(),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Offline banner
          const OfflineBanner(),
          
          // Cart content
          Expanded(
            child: cartAsync.when(
              data: (cart) => cart.items.isEmpty
                  ? _buildEmptyCart(context)
                  : _buildCartItems(context, ref, cart),
              error: (error, stackTrace) => Center(
                child: Text('Error: ${error.toString()}'),
              ),
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 100,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 24),
          Text(
            'Your cart is empty',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          const Text(
            'Browse our products and add items to your cart',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () => context.go('/products'),
            icon: const Icon(Icons.shopping_bag_outlined),
            label: const Text('Start Shopping'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItems(BuildContext context, WidgetRef ref, cart) {
    return Column(
      children: [
        // Cart items list
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: cart.items.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final item = cart.items[index];
              return CartItemTile(
                key: ValueKey(item.id),
                item: item,
                onIncrement: () => ref
                    .read(cartControllerProvider.notifier)
                    .incrementQuantity(item.id),
                onDecrement: () => ref
                    .read(cartControllerProvider.notifier)
                    .decrementQuantity(item.id),
                onRemove: () => ref
                    .read(cartControllerProvider.notifier)
                    .removeItem(item.id),
              );
            },
          ),
        ),
        
        // Cart summary
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: Column(
            children: [
              // Subtotal
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Subtotal'),
                  Text('\$${cart.subtotal.toStringAsFixed(2)}'),
                ],
              ),
              const SizedBox(height: 8),
              
              // Tax
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Tax (8%)'),
                  Text('\$${cart.tax.toStringAsFixed(2)}'),
                ],
              ),
              const SizedBox(height: 8),
              
              const Divider(),
              
              // Total
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Text(
                    '\$${cart.total.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleLarge!.copyWith(
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Checkout button
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: () {
                    // TODO: Implement checkout flow
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Checkout not implemented yet')),
                    );
                  },
                  icon: const Icon(Icons.payment),
                  label: const Text('Checkout'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showClearCartDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cart'),
        content: const Text('Are you sure you want to remove all items from your cart?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              ref.read(cartControllerProvider.notifier).clearCart();
              Navigator.of(context).pop();
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }
}