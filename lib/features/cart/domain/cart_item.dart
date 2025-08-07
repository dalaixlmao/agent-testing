import 'package:freezed_annotation/freezed_annotation.dart';

import '../../products/domain/product.dart';

part 'cart_item.freezed.dart';
part 'cart_item.g.dart';

@freezed
class CartItem with _$CartItem {
  const factory CartItem({
    required String id,
    required Product product,
    required int quantity,
    DateTime? addedAt,
  }) = _CartItem;

  factory CartItem.fromJson(Map<String, dynamic> json) => _$CartItemFromJson(json);
}

@freezed
class Cart with _$Cart {
  const factory Cart({
    @Default([]) List<CartItem> items,
    @Default(0) double subtotal,
    @Default(0) double tax,
    @Default(0) double total,
    @Default(0) int totalItems,
  }) = _Cart;

  factory Cart.fromJson(Map<String, dynamic> json) => _$CartFromJson(json);
}