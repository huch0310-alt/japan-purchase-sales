import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import 'procurement/product_collect_page.dart';
import 'procurement/my_collect_page.dart';
import 'sales/product_audit_page.dart';
import 'sales/product_manage_page.dart';
import 'sales/order_manage_page.dart';

/**
 * 员工首页（采购/销售）
 * 根据角色显示不同功能入口
 */
class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.valueOrNull;

    return Scaffold(
      appBar: AppBar(
        title: const Text('日本采销管理系统'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              // 跳转到消息页面
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: '首页',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: '订单',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: '我的',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    // 根据用户角色显示不同功能
    // 这里简化为显示所有功能
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 功能模块选择
          _buildModuleSelector(),
          const SizedBox(height: 24),
          // 显示对应的功能列表
          _buildFeatureGrid(),
        ],
      ),
    );
  }

  Widget _buildModuleSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '功能模块',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildModuleChip('采购', Icons.add_shopping_cart, true),
              const SizedBox(width: 8),
              _buildModuleChip('销售', Icons.sell, false),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildModuleChip(String label, IconData icon, bool isSelected) {
    return FilterChip(
      selected: isSelected,
      label: Text(label),
      avatar: Icon(icon, size: 18),
      selectedColor: const Color(0xFF1E88E5).withOpacity(0.2),
      onSelected: (selected) {
        // 切换模块
      },
    );
  }

  Widget _buildFeatureGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.2,
      children: [
        _buildFeatureCard(
          '商品采集',
          Icons.add_photo_alternate,
          () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ProductCollectPage()),
          ),
        ),
        _buildFeatureCard(
          '我的采集',
          Icons.history,
          () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const MyCollectPage()),
          ),
        ),
        _buildFeatureCard(
          '商品审核',
          Icons.check_circle,
          () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ProductAuditPage()),
          ),
        ),
        _buildFeatureCard(
          '商品管理',
          Icons.inventory,
          () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ProductManagePage()),
          ),
        ),
        _buildFeatureCard(
          '订单管理',
          Icons.receipt_long,
          () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const OrderManagePage()),
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureCard(String title, IconData icon, VoidCallback onTap) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: const Color(0xFF1E88E5)),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
