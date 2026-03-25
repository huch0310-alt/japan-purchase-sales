import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

/**
 * 本地化字符串映射
 */
class AppLocalizations {
  static Map<String, Map<String, String>> _localizedValues = {
    'ja': {
      'app_name': '日本調達管理システム',
      'login': 'ログイン',
      'username': 'ユーザー名',
      'password': 'パスワード',
      'login_button': 'ログイン',
      'staff_login': 'スタッフログイン',
      'customer_login': '顧客ログイン',
      'home': 'ホーム',
      'products': '商品',
      'orders': '注文',
      'cart': 'カート',
      'profile': 'プロフィール',
      'logout': 'ログアウト',
      'product_collect': '商品調達',
      'my_collection': '私の収集',
      'product_audit': '商品審査',
      'product_manage': '商品管理',
      'order_manage': '注文管理',
      'submit': '提出',
      'cancel': 'キャンセル',
      'confirm': '確認',
      'delete': '削除',
      'edit': '編集',
      'save': '保存',
      'price': '価格',
      'quantity': '数量',
      'total': '合計',
      'subtotal': '小計',
      'tax': '消費税',
      'tax_included': '税込',
      'pending': '保留中',
      'confirmed': '確認済み',
      'completed': '完了',
      'rejected': '拒否',
      'active': 'アクティブ',
      'inactive': '非アクティブ',
      'approve': '承認',
      'reject': '拒否',
      'no_data': 'データがありません',
      'loading': '読み込み中...',
      'error': 'エラー',
      'success': '成功',
      'category': 'カテゴリー',
      'description': '説明',
      'unit': '単位',
      'photo': '写真',
      'take_photo': '写真を撮る',
    },
    'zh': {
      'app_name': '日本采销管理系统',
      'login': '登录',
      'username': '账号',
      'password': '密码',
      'login_button': '登录',
      'staff_login': '员工登录',
      'customer_login': '客户登录',
      'home': '首页',
      'products': '商品',
      'orders': '订单',
      'cart': '购物车',
      'profile': '我的',
      'logout': '退出登录',
      'product_collect': '商品采集',
      'my_collection': '我的采集',
      'product_audit': '商品审核',
      'product_manage': '商品管理',
      'order_manage': '订单管理',
      'submit': '提交',
      'cancel': '取消',
      'confirm': '确认',
      'delete': '删除',
      'edit': '编辑',
      'save': '保存',
      'price': '价格',
      'quantity': '数量',
      'total': '合计',
      'subtotal': '小计',
      'tax': '消费税',
      'tax_included': '含税',
      'pending': '待处理',
      'confirmed': '已确认',
      'completed': '已完成',
      'rejected': '已拒绝',
      'active': '上架',
      'inactive': '下架',
      'approve': '通过',
      'reject': '拒绝',
      'no_data': '暂无数据',
      'loading': '加载中...',
      'error': '错误',
      'success': '成功',
      'category': '分类',
      'description': '说明',
      'unit': '单位',
      'photo': '照片',
      'take_photo': '拍照',
    },
  };

  static String get(String key) {
    final locale = WidgetsBinding.instance.platformDispatcher.locale.languageCode;
    return _localizedValues[locale]?[key] ?? _localizedValues['ja']?[key] ?? key;
  }
}

/**
 * 应用本地化代理
 */
class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['ja', 'zh'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations();
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

// 导出 delegate 给 MaterialApp 使用
const LocalizationsDelegate<AppLocalizations> appLocalizationsDelegate =
    _AppLocalizationsDelegate();
