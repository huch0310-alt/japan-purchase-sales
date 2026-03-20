/**
 * 商品数据模型
 */
class Product {
  final String id;
  final String name;
  final int quantity;
  final String? unit;
  final double purchasePrice;
  final double salePrice;
  final String? photoUrl;
  final String? description;
  final String status;
  final String? categoryId;
  final DateTime createdAt;

  Product({
    required this.id,
    required this.name,
    required this.quantity,
    this.unit,
    required this.purchasePrice,
    required this.salePrice,
    this.photoUrl,
    this.description,
    required this.status,
    this.categoryId,
    required this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      quantity: json['quantity'] ?? 0,
      unit: json['unit'],
      purchasePrice: (json['purchasePrice'] ?? 0).toDouble(),
      salePrice: (json['salePrice'] ?? 0).toDouble(),
      photoUrl: json['photoUrl'],
      description: json['description'],
      status: json['status'] ?? 'pending',
      categoryId: json['categoryId'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'quantity': quantity,
      'unit': unit,
      'purchasePrice': purchasePrice,
      'salePrice': salePrice,
      'photoUrl': photoUrl,
      'description': description,
      'status': status,
      'categoryId': categoryId,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isActive => status == 'active';
  bool get isPending => status == 'pending';
  bool get isApproved => status == 'approved';
}
