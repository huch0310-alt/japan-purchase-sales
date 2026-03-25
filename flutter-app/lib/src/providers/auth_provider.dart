import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../../config/app_config.dart';

// Dio实例
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
    },
  ));
  return dio;
});

// 认证状态
class AuthState {
  final Map<String, dynamic>? user;
  final String? token;

  AuthState({this.user, this.token});

  bool get isAuthenticated => user != null && token != null;
}

// 认证Provider
final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<AuthState>>((ref) {
  return AuthNotifier(ref);
});

class AuthNotifier extends StateNotifier<AsyncValue<AuthState>> {
  final Ref _ref;

  AuthNotifier(this._ref) : super(const AsyncValue.loading()) {
    _loadAuth();
  }

  Future<void> _loadAuth() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final userJson = prefs.getString('user');

      if (token != null && userJson != null) {
        // 设置Dio的Authorization头
        _ref.read(dioProvider).options.headers['Authorization'] = 'Bearer $token';
        state = AsyncValue.data(AuthState(
          token: token,
          user: _parseUser(userJson),
        ));
      } else {
        state = AsyncValue.data(AuthState());
      }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Map<String, dynamic> _parseUser(String userJson) {
    try {
      return json.decode(userJson) as Map<String, dynamic>;
    } catch (e) {
      return {};
    }
  }

  Future<void> login(String username, String password, String loginType) async {
    state = const AsyncValue.loading();
    try {
      final dio = _ref.read(dioProvider);
      final endpoint = loginType == 'staff' ? '/auth/staff/login' : '/auth/customer/login';

      print('Login attempt: $endpoint with username: $username');
      print('API Base URL: ${dio.options.baseUrl}');

      final response = await dio.post(endpoint, data: {
        'username': username,
        'password': password,
      });

      final data = response.data;
      final token = data['access_token'];
      final user = data['user'] as Map<String, dynamic>;

      // 保存到本地存储 - 使用json.encode正确序列化
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setString('user', json.encode(user));

      // 设置Dio的Authorization头
      dio.options.headers['Authorization'] = 'Bearer $token';

      state = AsyncValue.data(AuthState(token: token, user: user));
      print('Login success!');
    } catch (e, st) {
      print('Login error: $e');
      print('Stack trace: $st');
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    _ref.read(dioProvider).options.headers.remove('Authorization');
    state = AsyncValue.data(AuthState());
  }
}
