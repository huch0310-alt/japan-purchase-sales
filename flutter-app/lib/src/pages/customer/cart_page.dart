import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

/**
 * 购物车页面（客户端）
 */
class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('购物车'),
        actions: [
          TextButton(
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('确认清空'),
                  content: const Text('确定要清空购物车吗？'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('取消'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('确定'),
                    ),
                  ],
                ),
              );
              if (confirm == true) {
                await ref.read(dioProvider).delete('/cart');
              }
            },
            child: const Text('清空', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: Column(
        children: [
          // 购物车列表
          Expanded(
            child: _buildCartList(context, ref),
          ),
          // 底部结算栏
          _buildBottomBar(context, ref),
        ],
      ),
    );
  }

  Widget _buildCartList(BuildContext context, WidgetRef ref) {
    return FutureBuilder(
      future: ref.read(dioProvider).get('/cart'),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(child: Text('加载失败: ${snapshot.error}'));
        }

        final items = snapshot.data?.data ?? [];

        if (items.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('购物车为空', style: TextStyle(color: Colors.grey)),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          itemBuilder: (context, index) {
            return _buildCartItem(items[index], context, ref);
          },
        );
      },
    );
  }

  Widget _buildCartItem(Map<String, dynamic> item, BuildContext context, WidgetRef ref) {
    final product = item['product'] ?? {};

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // 商品图片
            Container(
              width: 80,
              height: 80,
              color: Colors.grey[200],
              child: product['photoUrl'] != null
                  ? Image.network(product['photoUrl'], fit: BoxFit.cover)
                  : const Icon(Icons.image),
            ),
            const SizedBox(width: 12),
            // 商品信息
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] ?? '',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '¥${product['salePrice'] ?? 0}',
                    style: const TextStyle(color: Color(0xFF1E88E5)),
                  ),
                  const SizedBox(height: 8),
                  // 数量调整
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        onPressed: () async {
                          final newQty = (item['quantity'] as int) - 1;
                          if (newQty <= 0) {
                            await ref.read(dioProvider).delete('/cart/items/${item['id']}');
                          } else {
                            await ref.read(dioProvider).put('/cart/items/${item['id']}', data: {
                              'quantity': newQty,
                            });
                          }
                        },
                      ),
                      Text('${item['quantity']}'),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline),
                        onPressed: () async {
                          await ref.read(dioProvider).put('/cart/items/${item['id']}', data: {
                            'quantity': (item['quantity'] as int) + 1,
                          });
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // 删除按钮
            IconButton(
              icon: const Icon(Icons.delete, color: Colors.red),
              onPressed: () async {
                await ref.read(dioProvider).delete('/cart/items/${item['id']}');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, WidgetRef ref) {
    return FutureBuilder(
      future: ref.read(dioProvider).get('/cart/total'),
      builder: (context, snapshot) {
        final total = snapshot.data?.data ?? {};
        final subtotal = total['subtotal'] ?? 0;
        final taxAmount = total['taxAmount'] ?? 0;
        final totalAmount = total['total'] ?? 0;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 4,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('小计:'),
                    Text('¥$subtotal'),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('消费税:'),
                    Text('¥$taxAmount'),
                  ],
                ),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      '合计:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    Text(
                      '¥$totalAmount',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Color(0xFF1E88E5),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      // TODO: 跳转到下单确认页面
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E88E5),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('下单', style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
