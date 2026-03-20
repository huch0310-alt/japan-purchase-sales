import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'src/pages/splash_page.dart';
import 'src/pages/login_page.dart';
import 'src/pages/home_page.dart';
import 'src/pages/customer/home_page.dart';
import 'src/providers/auth_provider.dart';
import 'i18n/app_localizations.dart';

/**
 * 应用主组件
 * 根据用户类型跳转到不同首页
 */
class JapanPurchaseSalesApp extends ConsumerWidget {
  const JapanPurchaseSalesApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: '日本采销管理系统',
      debugShowCheckedModeBanner: false,
      locale: const Locale('ja', 'JP'),
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ja', 'JP'),
        Locale('zh', 'CN'),
      ],
      theme: ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF1E88E5),
        scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E88E5),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E88E5),
          primary: const Color(0xFF1E88E5),
        ),
      ),
      home: authState.when(
        data: (user) {
          if (user == null) {
            return const LoginPage();
          }
          // 根据用户类型跳转到不同首页
          if (user['type'] == 'customer') {
            return const CustomerHomePage();
          }
          return const HomePage();
        },
        loading: () => const SplashPage(),
        error: (_, __) => const LoginPage(),
      ),
    );
  }
}
