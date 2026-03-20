/**
 * 分类数据模型
 */
class Category {
  final String id;
  final String name;
  final int sortOrder;
  final bool isActive;
  final DateTime createdAt;

  Category({
    required this.id,
    required this.name,
    required this.sortOrder,
    required this.isActive,
    required this.createdAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      sortOrder: json['sortOrder'] ?? 0,
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'sortOrder': sortOrder,
      'isActive': isActive,
    };
  }
}

/**
 * 单位数据模型
 */
class Unit {
  final String id;
  final String name;
  final int sortOrder;
  final bool isActive;
  final DateTime createdAt;

  Unit({
    required this.id,
    required this.name,
    required this.sortOrder,
    required this.isActive,
    required this.createdAt,
  });

  factory Unit.fromJson(Map<String, dynamic> json) {
    return Unit(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      sortOrder: json['sortOrder'] ?? 0,
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

/**
 * 系统设置模型
 */
class Setting {
  final String id;
  final String key;
  final String? value;
  final String? description;

  Setting({
    required this.id,
    required this.key,
    this.value,
    this.description,
  });

  factory Setting.fromJson(Map<String, dynamic> json) {
    return Setting(
      id: json['id'] ?? '',
      key: json['key'] ?? '',
      value: json['value'],
      description: json['description'],
    );
  }
}
