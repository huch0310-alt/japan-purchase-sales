import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'src/app.dart';

/**
 * 日本采销管理系统 - 移动端入口文件
 */
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: JapanPurchaseSalesApp(),
    ),
  );
}
