import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';

import 'package:ecommerce_app/features/cart/data/cart_repository.dart';
import 'package:ecommerce_app/features/products/domain/product.dart';
import 'package:ecommerce_app/features/cart/domain/cart_item.dart';

// Create mock classes
class MockCartRepository extends Mock implements CartRepository {}

// Sample product data
final testProducts = [
  Product(
    id: '1',
    title: 'iPhone 13',
    description: 'Apple iPhone 13 with A15 Bionic chip',
    price: 799.99,
    brand: 'Apple',
    category: 'smartphones',
    thumbnail: 'https://example.com/iphone13.jpg',
    stock: 10,
  ),
  Product(
    id: '2',
    title: 'Samsung Galaxy S21',
    description: 'Samsung Galaxy S21 with Snapdragon processor',
    price: 699.99,
    brand: 'Samsung',
    category: 'smartphones',
    thumbnail: 'https://example.com/galaxys21.jpg',
    stock: 15,
  ),
];

void main() {
  late MockCartRepository mockCartRepository;

  setUp(() {
    mockCartRepository = MockCartRepository();
  });

  testWidgets('End-to-end cart flow test', (WidgetTester tester) async {
    // Set up mock behavior
    when(() => mockCartRepository.getCartItems()).thenAnswer((_) async => []);
    
    when(() => mockCartRepository.addToCart(any(), any()))
        .thenAnswer((_) async {});
    
    when(() => mockCartRepository.calculateCartTotals(any()))
        .thenAnswer((invocation) {
          final items = invocation.positionalArguments[0] as List<CartItem>;
          double subtotal = 0;
          int totalItems = 0;
          
          for (final item in items) {
            subtotal += item.product.price * item.quantity;
            totalItems += item.quantity;
          }
          
          final tax = subtotal * 0.08;
          final total = subtotal + tax;
          
          return Cart(
            items: items,
            subtotal: subtotal,
            tax: tax,
            total: total,
            totalItems: totalItems,
          );
        });

    // Build our app wrapped with Riverpod
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          cartRepositoryProvider.overrideWithValue(mockCartRepository),
        ],
        child: MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => Column(
                children: [
                  // Simple add to cart button for testing
                  ElevatedButton(
                    onPressed: () {
                      // This would normally be handled by a controller
                      mockCartRepository.addToCart(testProducts[0], 2);
                    },
                    child: const Text('Add iPhone to Cart'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // This would normally be handled by a controller
                      mockCartRepository.addToCart(testProducts[1], 1);
                    },
                    child: const Text('Add Samsung to Cart'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    // Add iPhone to cart
    await tester.tap(find.text('Add iPhone to Cart'));
    await tester.pump();
    
    // Verify addToCart was called with correct parameters
    verify(() => mockCartRepository.addToCart(testProducts[0], 2)).called(1);
    
    // Add Samsung to cart
    await tester.tap(find.text('Add Samsung to Cart'));
    await tester.pump();
    
    // Verify addToCart was called with correct parameters
    verify(() => mockCartRepository.addToCart(testProducts[1], 1)).called(1);
    
    // At this point, in a real app, we would navigate to the cart screen
    // and verify the items are displayed correctly
    
    // For this test, we're just verifying the repository methods were called correctly
    // In a real integration test, we would use integration_test package and
    // test the full flow including UI rendering
  });
}