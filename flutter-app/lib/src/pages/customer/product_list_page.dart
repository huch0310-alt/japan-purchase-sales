import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

/**
 * 商品列表页面（客户端）
 * 分类 + 商品列表
 */
class ProductListPage extends ConsumerWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('商品列表'),
      ),
      body: Row(
        children: [
          // 左侧分类导航
          Container(
            width: 80,
            color: Colors.grey[100],
            child: _buildCategoryList(),
          ),
          // 右侧商品列表
          Expanded(
            child: _buildProductGrid(),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryList() {
    final categories = [
      {'id': '1', 'name': '肉类'},
      {'id': '2', 'name': '蛋品'},
      {'id': '3', 'name': '生鲜蔬果'},
      {'id': '4', 'name': '酒水饮料'},
      {'id': '5', 'name': '零食点心'},
      {'id': '6', 'name': '调味品'},
      {'id': '7', 'name': '冷冻食品'},
      {'id': '8', 'name': '日用品'},
    ];

    return ListView.builder(
      itemCount: categories.length,
      itemBuilder: (context, index) {
        final category = categories[index];
        return ListTile(
          title: Text(
            category['name']!,
            style: const TextStyle(fontSize: 12),
            textAlign: TextAlign.center,
          ),
          onTap: () {
            // 切换分类
          },
        );
      },
    );
  }

  Widget _buildProductGrid() {
    return FutureBuilder(
      future: ref.read(dioProvider).get('/products/active'),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(child: Text('加载失败: ${snapshot.error}'));
        }

        final products = snapshot.data?.data ?? [];

        if (products.isEmpty) {
          return const Center(child: Text('暂无商品'));
        }

        return GridView.builder(
          padding: const EdgeInsets.all(8),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.7,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: products.length,
          itemBuilder: (context, index) {
            return _buildProductCard(products[index], context, ref);
          },
        );
      },
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product, BuildContext context, WidgetRef ref) {
    return Card(
      child: InkWell(
        onTap: () {
          // TODO: 跳转到商品详情
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 商品图片
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                color: Colors.grey[200],
                child: product['photoUrl'] != null
                    ? Image.network(
                        product['photoUrl'],
                        fit: BoxFit.cover,
                      )
                    : const Icon(Icons.image, size: 48),
              ),
            ),
            // 商品信息
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product['name'] ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    Text(
                      '¥${product['salePrice'] ?? 0}',
                      style: const TextStyle(
                        color: Color(0xFF1E88E5),
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const Text(
                      '税拔',
                      style: TextStyle(fontSize: 10, color: Colors.grey),
                    ),
                    const SizedBox(height: 4),
                    // 添加到购物车按钮
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          try {
                            await ref.read(dioProvider).post('/cart/items', data: {
                              'productId': product['id'],
                              'quantity': 1,
                            });
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('已添加到购物车')),
                              );
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('添加失败: $e')),
                              );
                            }
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1E88E5),
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.zero,
                        ),
                        child: const Text('加入购物车', style: TextStyle(fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
