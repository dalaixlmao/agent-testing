import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uuid/uuid.dart';

import '../../../core/storage/local_storage.dart';
import '../../products/domain/product.dart';
import '../domain/cart_item.dart';

part 'cart_repository.g.dart';

@riverpod
CartRepository cartRepository(CartRepositoryRef ref) {
  final localStorage = ref.watch(hiveStorageProvider);
  return CartRepository(localStorage: localStorage);
}

class CartRepository {
  final HiveStorage _localStorage;
  static const String _cartBox = 'cart';
  static const String _cartItemsKey = 'cart_items';
  
  CartRepository({required HiveStorage localStorage}) : _localStorage = localStorage;
  
  /// Get all cart items
  Future<List<CartItem>> getCartItems() async {
    try {
      final itemsJson = _localStorage.get<List<dynamic>>(_cartBox, _cartItemsKey);
      
      if (itemsJson == null) {
        return [];
      }
      
      final items = itemsJson
          .map((json) => CartItem.fromJson(Map<String, dynamic>.from(json)))
          .toList();
      
      return items;
    } catch (e) {
      // If there's an error parsing, return empty list and clear corrupted data
      await _localStorage.remove(_cartBox, _cartItemsKey);
      return [];
    }
  }
  
  /// Add item to cart
  Future<void> addToCart(Product product, int quantity) async {
    final items = await getCartItems();
    
    // Check if product already exists in cart
    final existingItemIndex = items.indexWhere((item) => item.product.id == product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      final existingItem = items[existingItemIndex];
      final updatedItem = existingItem.copyWith(
        quantity: existingItem.quantity + quantity,
      );
      items[existingItemIndex] = updatedItem;
    } else {
      // Add new item
      final newItem = CartItem(
        id: const Uuid().v4(),
        product: product,
        quantity: quantity,
        addedAt: DateTime.now(),
      );
      items.add(newItem);
    }
    
    // Save to local storage
    await _saveCartItems(items);
  }
  
  /// Update cart item quantity
  Future<void> updateQuantity(String itemId, int quantity) async {
    final items = await getCartItems();
    final itemIndex = items.indexWhere((item) => item.id == itemId);
    
    if (itemIndex >= 0) {
      final item = items[itemIndex];
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        items.removeAt(itemIndex);
      } else {
        // Update quantity
        items[itemIndex] = item.copyWith(quantity: quantity);
      }
      
      // Save to local storage
      await _saveCartItems(items);
    }
  }
  
  /// Remove item from cart
  Future<void> removeItem(String itemId) async {
    final items = await getCartItems();
    items.removeWhere((item) => item.id == itemId);
    
    // Save to local storage
    await _saveCartItems(items);
  }
  
  /// Clear cart
  Future<void> clearCart() async {
    await _localStorage.remove(_cartBox, _cartItemsKey);
  }
  
  /// Calculate cart totals
  Cart calculateCartTotals(List<CartItem> items) {
    if (items.isEmpty) {
      return const Cart();
    }
    
    int totalItems = 0;
    double subtotal = 0;
    
    for (final item in items) {
      totalItems += item.quantity;
      subtotal += item.product.price * item.quantity;
    }
    
    // Calculate tax (example: 8%)
    final tax = subtotal * 0.08;
    
    // Calculate total
    final total = subtotal + tax;
    
    return Cart(
      items: items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      totalItems: totalItems,
    );
  }
  
  /// Helper method to save cart items
  Future<void> _saveCartItems(List<CartItem> items) async {
    final itemsJson = items.map((item) => item.toJson()).toList();
    await _localStorage.put(_cartBox, _cartItemsKey, itemsJson);
  }
}