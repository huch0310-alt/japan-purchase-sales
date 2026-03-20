/**
 * 购物车项模型
 */
class CartItem {
  final String id;
  final String customerId;
  final String productId;
  final int quantity;
  final CartProduct? product;

  CartItem({
    required this.id,
    required this.customerId,
    required this.productId,
    required this.quantity,
    this.product,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] ?? '',
      customerId: json['customerId'] ?? '',
      productId: json['productId'] ?? '',
      quantity: json['quantity'] ?? 1,
      product: json['product'] != null ? CartProduct.fromJson(json['product']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'productId': productId,
      'quantity': quantity,
    };
  }
}

/**
 * 购物车商品（简化版）
 */
class CartProduct {
  final String id;
  final String name;
  final double salePrice;
  final String? photoUrl;
  final String? unit;

  CartProduct({
    required this.id,
    required this.name,
    required this.salePrice,
    this.photoUrl,
    this.unit,
  });

  factory CartProduct.fromJson(Map<String, dynamic> json) {
    return CartProduct(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      salePrice: (json['salePrice'] ?? 0).toDouble(),
      photoUrl: json['photoUrl'],
      unit: json['unit'],
    );
  }
}

/**
 * 购物车金额计算结果
 */
class CartTotal {
  final double subtotal;
  final double taxAmount;
  final double total;

  CartTotal({
    required this.subtotal,
    required this.taxAmount,
    required this.total,
  });

  factory CartTotal.fromJson(Map<String, dynamic> json) {
    return CartTotal(
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      taxAmount: (json['taxAmount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
    );
  }
}
