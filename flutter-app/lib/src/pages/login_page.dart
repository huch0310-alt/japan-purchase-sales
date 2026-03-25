import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../providers/auth_provider.dart';

/**
 * 登录页面
 * 支持员工和客户登录
 */
class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  String _loginType = 'staff'; // staff 或 customer

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await ref.read(authProvider.notifier).login(
        _usernameController.text,
        _passwordController.text,
        _loginType,
      );
    } catch (e) {
      if (mounted) {
        String errorMsg = '登录失败';
        if (e is DioException) {
          if (e.response != null) {
            // 服务器返回了错误响应
            final data = e.response?.data;
            if (data is Map) {
              errorMsg = data['message'] ?? data['error'] ?? '登录失败';
            } else {
              errorMsg = '服务器错误: ${e.response?.statusCode}';
            }
          } else if (e.type == DioExceptionType.connectionTimeout) {
            errorMsg = '连接超时，请检查网络';
          } else if (e.type == DioExceptionType.receiveTimeout) {
            errorMsg = '服务器响应超时';
          } else {
            errorMsg = '网络错误: ${e.message}';
          }
        } else {
          errorMsg = '登录失败: ${e.toString()}';
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMsg), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 60),
                // Logo
                const Icon(
                  Icons.storefront,
                  size: 80,
                  color: Color(0xFF1E88E5),
                ),
                const SizedBox(height: 16),
                // 标题
                const Text(
                  '日本采销管理系统',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 48),
                // 登录类型选择
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(
                      value: 'staff',
                      label: Text('员工登录'),
                      icon: Icon(Icons.person),
                    ),
                    ButtonSegment(
                      value: 'customer',
                      label: Text('客户登录'),
                      icon: Icon(Icons.business),
                    ),
                  ],
                  selected: {_loginType},
                  onSelectionChanged: (value) {
                    setState(() => _loginType = value.first);
                  },
                ),
                const SizedBox(height: 24),
                // 用户名
                TextFormField(
                  controller: _usernameController,
                  decoration: const InputDecoration(
                    labelText: '账号',
                    prefixIcon: Icon(Icons.person_outline),
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return '请输入账号';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // 密码
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: '密码',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility : Icons.visibility_off,
                      ),
                      onPressed: () {
                        setState(() => _obscurePassword = !_obscurePassword);
                      },
                    ),
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return '请输入密码';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                // 登录按钮
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E88E5),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('登录', style: TextStyle(fontSize: 16)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
