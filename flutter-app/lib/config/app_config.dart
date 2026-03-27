/// 应用配置
class AppConfig {
  /// API基础URL
  /// TODO: 生产环境必须配置HTTPS证书后改为 https://43.153.155.76/api
  /// 当前临时使用HTTP，生产部署时必须启用HTTPS
  static const String apiBaseUrl = 'http://43.153.155.76:3001/api';

  /// 应用名称
  static const String appName = '日本采销管理系统';

  /// 应用版本
  static const String appVersion = '1.0.0';

  /// 请求超时时间（毫秒）
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;

  /// 订单取消时间限制（分钟）
  static const int orderCancelTimeLimit = 30;

  /// 消费税率
  static const double taxRate = 0.1;

  /// 默认账期（天）
  static const int defaultPaymentDays = 30;

  /// 消息提醒提前天数
  static const int invoiceReminderDays = 3;
}
