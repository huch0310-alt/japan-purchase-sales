import 'package:intl/intl.dart';

/**
 * 格式化工具类
 */
class FormatUtils {
  // 日期格式化
  static String formatDate(DateTime date) {
    return DateFormat('yyyy/MM/dd').format(date);
  }

  // 日期时间格式化
  static String formatDateTime(DateTime date) {
    return DateFormat('yyyy/MM/dd HH:mm').format(date);
  }

  // 日本日期格式化
  static String formatDateJapanese(DateTime date) {
    return DateFormat('yyyy年MM月dd日').format(date);
  }

  // 金额格式化
  static String formatCurrency(double amount) {
    return NumberFormat('#,###').format(amount);
  }

  // 金额格式化（带日元符号）
  static String formatCurrencyJPY(double amount) {
    return '¥${NumberFormat('#,###').format(amount)}';
  }

  // 百分比格式化
  static String formatPercent(double value) {
    return '${value.toStringAsFixed(0)}%';
  }

  // 手机号格式化
  static String formatPhone(String phone) {
    if (phone.length == 11) {
      return '${phone.substring(0, 3)}-${phone.substring(3, 7)}-${phone.substring(7)}';
    }
    return phone;
  }

  // 订单状态文本
  static String getOrderStatusText(String status) {
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

  // 商品状态文本
  static String getProductStatusText(String status) {
    switch (status) {
      case 'pending':
        return '待审核';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      case 'active':
        return '上架';
      case 'inactive':
        return '下架';
      default:
        return status;
    }
  }

  // 請求書状态文本
  static String getInvoiceStatusText(String status) {
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
}
