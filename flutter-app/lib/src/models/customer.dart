/**
 * 客户数据模型
 */
class Customer {
  final String id;
  final String username;
  final String companyName;
  final String? address;
  final String? contactPerson;
  final String? phone;
  final double vipDiscount;
  final String? invoiceName;
  final String? invoiceAddress;
  final String? invoicePhone;
  final String? invoiceBank;
  final bool isActive;
  final DateTime createdAt;

  Customer({
    required this.id,
    required this.username,
    required this.companyName,
    this.address,
    this.contactPerson,
    this.phone,
    required this.vipDiscount,
    this.invoiceName,
    this.invoiceAddress,
    this.invoicePhone,
    this.invoiceBank,
    required this.isActive,
    required this.createdAt,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'] ?? '',
      username: json['username'] ?? '',
      companyName: json['companyName'] ?? '',
      address: json['address'],
      contactPerson: json['contactPerson'],
      phone: json['phone'],
      vipDiscount: (json['vipDiscount'] ?? 100).toDouble(),
      invoiceName: json['invoiceName'],
      invoiceAddress: json['invoiceAddress'],
      invoicePhone: json['invoicePhone'],
      invoiceBank: json['invoiceBank'],
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'companyName': companyName,
      'address': address,
      'contactPerson': contactPerson,
      'phone': phone,
      'vipDiscount': vipDiscount,
      'invoiceName': invoiceName,
      'invoiceAddress': invoiceAddress,
      'invoicePhone': invoicePhone,
      'invoiceBank': invoiceBank,
      'isActive': isActive,
    };
  }
}
