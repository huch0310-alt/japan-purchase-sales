/**
 * 請求書数据模型
 */
class Invoice {
  final String id;
  final String invoiceNo;
  final String customerId;
  final List<String> orderIds;
  final double subtotal;
  final double taxAmount;
  final double totalAmount;
  final DateTime issueDate;
  final DateTime dueDate;
  final String status;
  final String? fileUrl;
  final DateTime? paidAt;
  final DateTime createdAt;

  Invoice({
    required this.id,
    required this.invoiceNo,
    required this.customerId,
    required this.orderIds,
    required this.subtotal,
    required this.taxAmount,
    required this.totalAmount,
    required this.issueDate,
    required this.dueDate,
    required this.status,
    this.fileUrl,
    this.paidAt,
    required this.createdAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] ?? '',
      invoiceNo: json['invoiceNo'] ?? '',
      customerId: json['customerId'] ?? '',
      orderIds: json['orderIds'] != null ? List<String>.from(json['orderIds']) : [],
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      taxAmount: (json['taxAmount'] ?? 0).toDouble(),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      issueDate: json['issueDate'] != null ? DateTime.parse(json['issueDate']) : DateTime.now(),
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate']) : DateTime.now(),
      status: json['status'] ?? 'unpaid',
      fileUrl: json['fileUrl'],
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  String get statusText {
    switch (status) {
      case 'unpaid':
        return '未払い';
      case 'paid':
        return '支払済';
      case 'overdue':
        return '期限超過';
      default:
        return status;
    }
  }

  bool get isOverdue {
    return status == 'unpaid' && dueDate.isBefore(DateTime.now());
  }

  bool get isDueSoon {
    final daysUntilDue = dueDate.difference(DateTime.now()).inDays;
    return status == 'unpaid' && daysUntilDue <= 3 && daysUntilDue >= 0;
  }
}
