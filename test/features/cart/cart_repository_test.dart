import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:ecommerce_app/core/storage/local_storage.dart';
import 'package:ecommerce_app/features/cart/data/cart_repository.dart';
import 'package:ecommerce_app/features/products/domain/product.dart';
import 'package:ecommerce_app/features/cart/domain/cart_item.dart';

class MockHiveStorage extends Mock implements HiveStorage {}

void main() {
  late CartRepository cartRepository;
  late MockHiveStorage mockStorage;

  final testProduct = Product(
    id: '1',
    title: 'Test Product',
    description: 'Test description',
    price: 99.99,
    brand: 'Test Brand',
    category: 'electronics',
    thumbnail: 'https://example.com/thumbnail.jpg',
  );

  final testCartItem = CartItem(
    id: '123',
    product: testProduct,
    quantity: 2,
    addedAt: DateTime.now(),
  );

  setUp(() {
    mockStorage = MockHiveStorage();
    cartRepository = CartRepository(localStorage: mockStorage);
  });

  group('CartRepository', () {
    test('getCartItems returns empty list when no items exist', () async {
      when(() => mockStorage.get<List<dynamic>>('cart', 'cart_items'))
          .thenReturn(null);

      final result = await cartRepository.getCartItems();
      expect(result, isEmpty);
    });

    test('getCartItems returns list of cart items', () async {
      when(() => mockStorage.get<List<dynamic>>('cart', 'cart_items'))
          .thenReturn([testCartItem.toJson()]);

      final result = await cartRepository.getCartItems();
      expect(result.length, 1);
      expect(result.first.id, testCartItem.id);
      expect(result.first.product.id, testProduct.id);
      expect(result.first.quantity, 2);
    });

    test('addToCart adds new item when product not in cart', () async {
      when(() => mockStorage.get<List<dynamic>>('cart', 'cart_items'))
          .thenReturn([]);
      
      when(() => mockStorage.put('cart', 'cart_items', any()))
          .thenAnswer((_) async {});

      await cartRepository.addToCart(testProduct, 1);

      verify(() => mockStorage.put('cart', 'cart_items', any())).called(1);
    });

    test('calculateCartTotals computes correct values', () {
      final items = [
        CartItem(id: '1', product: testProduct, quantity: 2),
        CartItem(
          id: '2', 
          product: Product(
            id: '2',
            title: 'Another Product',
            description: 'Another description',
            price: 49.99,
            brand: 'Another Brand',
            category: 'clothing',
            thumbnail: 'https://example.com/thumbnail2.jpg',
          ),
          quantity: 3,
        ),
      ];

      final cart = cartRepository.calculateCartTotals(items);
      
      // 2 * 99.99 + 3 * 49.99 = 199.98 + 149.97 = 349.95
      expect(cart.subtotal, 349.95);
      
      // Tax at 8% = 349.95 * 0.08 = 27.996 (rounded in the test for precision)
      expect(cart.tax, closeTo(27.996, 0.001));
      
      // Total = 349.95 + 27.996 = 377.946
      expect(cart.total, closeTo(377.946, 0.001));
      
      // Total items = 2 + 3 = 5
      expect(cart.totalItems, 5);
    });
  });
}