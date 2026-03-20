/**
 * 订单数据模型
 */
class Order {
  final String id;
  final String orderNo;
  final String customerId;
  final double subtotal;
  final double discountAmount;
  final double taxAmount;
  final double totalAmount;
  final String status;
  final String? deliveryAddress;
  final String? contactPerson;
  final String? contactPhone;
  final String? remark;
  final DateTime createdAt;
  final DateTime? confirmedAt;
  final DateTime? completedAt;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.orderNo,
    required this.customerId,
    required this.subtotal,
    required this.discountAmount,
    required this.taxAmount,
    required this.totalAmount,
    required this.status,
    this.deliveryAddress,
    this.contactPerson,
    this.contactPhone,
    this.remark,
    required this.createdAt,
    this.confirmedAt,
    this.completedAt,
    this.items = const [],
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? '',
      orderNo: json['orderNo'] ?? '',
      customerId: json['customerId'] ?? '',
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      discountAmount: (json['discountAmount'] ?? 0).toDouble(),
      taxAmount: (json['taxAmount'] ?? 0).toDouble(),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      deliveryAddress: json['deliveryAddress'],
      contactPerson: json['contactPerson'],
      contactPhone: json['contactPhone'],
      remark: json['remark'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      confirmedAt: json['confirmedAt'] != null ? DateTime.parse(json['confirmedAt']) : null,
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
      items: json['items'] != null
          ? (json['items'] as List).map((e) => OrderItem.fromJson(e)).toList()
          : [],
    );
  }

  String get statusText {
    switch (status) {
      case 'pending':
        return '待确认';
      case 'confirmed':
        return '已确认';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  }

  bool get canCancel {
    // 30分钟内且待确认时可取消
    if (status != 'pending') return false;
    final diff = DateTime.now().difference(createdAt);
    return diff.inMinutes <= 30;
  }
}

/**
 * 订单明细
 */
class OrderItem {
  final String id;
  final String orderId;
  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  final double discount;

  OrderItem({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.discount,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? '',
      orderId: json['orderId'] ?? '',
      productId: json['productId'] ?? '',
      productName: json['productName'] ?? '',
      quantity: json['quantity'] ?? 0,
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
    );
  }

  double get subtotal => unitPrice * quantity - discount;
}
