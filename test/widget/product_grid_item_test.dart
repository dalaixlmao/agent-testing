import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ecommerce_app/features/products/domain/product.dart';
import 'package:ecommerce_app/features/products/presentation/widgets/product_grid_item.dart';

void main() {
  final mockProduct = Product(
    id: '1',
    title: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    discountPercentage: 20,
    rating: 4.5,
    stock: 42,
    brand: 'Test Brand',
    category: 'electronics',
    thumbnail: 'https://example.com/thumbnail.jpg',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  );

  testWidgets('ProductGridItem displays product information correctly', (WidgetTester tester) async {
    bool tapped = false;

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: ProductGridItem(
          product: mockProduct,
          onTap: () {
            tapped = true;
          },
        ),
      ),
    ));

    // Verify product title is displayed
    expect(find.text('Test Product'), findsOneWidget);
    
    // Verify product brand is displayed
    expect(find.text('Test Brand'), findsOneWidget);
    
    // Verify price is displayed
    expect(find.text('\$99.99'), findsOneWidget);
    
    // Verify discount is displayed (20%)
    expect(find.text('-20%'), findsOneWidget);
    
    // Verify rating is displayed
    expect(find.text('4.5'), findsOneWidget);
    
    // Test tap behavior
    await tester.tap(find.byType(InkWell));
    expect(tapped, true);
  });
}