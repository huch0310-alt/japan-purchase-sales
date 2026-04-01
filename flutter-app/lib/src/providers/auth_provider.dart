import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
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

  // 添加拦截器：自动处理 Token
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      // 从安全存储读取 Token
      final token = await _secureStorage.read(key: 'auth_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (error, handler) {
      // 401 错误时清除认证信息
      if (error.response?.statusCode == 401) {
        _secureStorage.delete(key: 'auth_token');
      }
      return handler.next(error);
    },
  ));

  return dio;
});

// 安全存储实例（用于存储敏感Token）
const _secureStorage = FlutterSecureStorage(
  aOptions: AndroidOptions(
    encryptedSharedPreferences: true,
  ),
  iOptions: IOSOptions(
    accessibility: KeychainAccessibility.first_unlock_this_device,
  ),
);

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
      // 使用安全存储读取 Token
      final token = await _secureStorage.read(key: 'auth_token');
      // 用户信息可以放在 SharedPreferences（非敏感数据）
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user');

      if (token != null && userJson != null) {
        // Token 由拦截器自动处理
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

      debugPrint('Login attempt: $endpoint with username: $username');

      final response = await dio.post(endpoint, data: {
        'username': username,
        'password': password,
      });

      final data = response.data;
      final token = data['access_token'];
      final user = data['user'] as Map<String, dynamic>;

      // 使用安全存储保存 Token（防止 XSS 攻击读取）
      await _secureStorage.write(key: 'auth_token', value: token);
      // 用户信息保存在 SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', json.encode(user));

      // Token 由拦截器自动处理
      state = AsyncValue.data(AuthState(token: token, user: user));
    } catch (e, st) {
      debugPrint('Login error: $e');
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    // 清除安全存储中的 Token
    await _secureStorage.delete(key: 'auth_token');
    // 清除 SharedPreferences 中的用户信息
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    state = AsyncValue.data(AuthState());
  }
}
