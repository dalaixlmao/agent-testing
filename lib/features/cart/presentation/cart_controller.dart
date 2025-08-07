import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../products/domain/product.dart';
import '../data/cart_repository.dart';
import '../domain/cart_item.dart';

part 'cart_controller.g.dart';

@riverpod
class CartController extends _$CartController {
  @override
  FutureOr<Cart> build() async {
    // Load cart items and calculate totals
    final items = await ref.read(cartRepositoryProvider).getCartItems();
    return ref.read(cartRepositoryProvider).calculateCartTotals(items);
  }
  
  /// Add product to cart
  Future<void> addToCart(Product product, int quantity) async {
    // Optimistic update
    final currentItems = state.valueOrNull?.items ?? [];
    final existingItemIndex = currentItems.indexWhere(
      (item) => item.product.id == product.id,
    );
    
    List<CartItem> updatedItems;
    
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = List.from(currentItems);
      final existingItem = updatedItems[existingItemIndex];
      updatedItems[existingItemIndex] = existingItem.copyWith(
        quantity: existingItem.quantity + quantity,
      );
    } else {
      // Add new item
      updatedItems = List.from(currentItems);
      updatedItems.add(
        CartItem(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          product: product,
          quantity: quantity,
          addedAt: DateTime.now(),
        ),
      );
    }
    
    // Update state optimistically
    final updatedCart = ref.read(cartRepositoryProvider).calculateCartTotals(updatedItems);
    state = AsyncData(updatedCart);
    
    // Persist changes
    await ref.read(cartRepositoryProvider).addToCart(product, quantity);
    
    // Refresh state from storage to ensure consistency
    await _refreshCart();
  }
  
  /// Update item quantity
  Future<void> updateQuantity(String itemId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    
    final currentItems = state.valueOrNull?.items ?? [];
    final itemIndex = currentItems.indexWhere((item) => item.id == itemId);
    
    if (itemIndex >= 0) {
      // Update optimistically
      final updatedItems = List.from(currentItems);
      updatedItems[itemIndex] = updatedItems[itemIndex].copyWith(quantity: quantity);
      
      final updatedCart = ref.read(cartRepositoryProvider).calculateCartTotals(updatedItems);
      state = AsyncData(updatedCart);
      
      // Persist changes
      await ref.read(cartRepositoryProvider).updateQuantity(itemId, quantity);
      
      // Refresh state from storage
      await _refreshCart();
    }
  }
  
  /// Increment item quantity
  Future<void> incrementQuantity(String itemId) async {
    final currentItems = state.valueOrNull?.items ?? [];
    final item = currentItems.firstWhere(
      (item) => item.id == itemId,
      orElse: () => const CartItem(id: '', product: null, quantity: 0),
    );
    
    if (item.product != null) {
      await updateQuantity(itemId, item.quantity + 1);
    }
  }
  
  /// Decrement item quantity
  Future<void> decrementQuantity(String itemId) async {
    final currentItems = state.valueOrNull?.items ?? [];
    final item = currentItems.firstWhere(
      (item) => item.id == itemId,
      orElse: () => const CartItem(id: '', product: null, quantity: 0),
    );
    
    if (item.product != null && item.quantity > 1) {
      await updateQuantity(itemId, item.quantity - 1);
    } else if (item.product != null) {
      await removeItem(itemId);
    }
  }
  
  /// Remove item from cart
  Future<void> removeItem(String itemId) async {
    final currentItems = state.valueOrNull?.items ?? [];
    final updatedItems = currentItems.where((item) => item.id != itemId).toList();
    
    // Update optimistically
    final updatedCart = ref.read(cartRepositoryProvider).calculateCartTotals(updatedItems);
    state = AsyncData(updatedCart);
    
    // Persist changes
    await ref.read(cartRepositoryProvider).removeItem(itemId);
    
    // Refresh state from storage
    await _refreshCart();
  }
  
  /// Clear cart
  Future<void> clearCart() async {
    // Update optimistically
    state = const AsyncData(Cart());
    
    // Persist changes
    await ref.read(cartRepositoryProvider).clearCart();
  }
  
  /// Helper to refresh cart from storage
  Future<void> _refreshCart() async {
    final items = await ref.read(cartRepositoryProvider).getCartItems();
    final updatedCart = ref.read(cartRepositoryProvider).calculateCartTotals(items);
    state = AsyncData(updatedCart);
  }
}