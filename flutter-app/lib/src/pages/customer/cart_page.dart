import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import 'checkout_page.dart';

// 购物车状态
class CartState {
  final List<dynamic> items;
  final double subtotal;
  final double taxAmount;
  final double total;
  final bool isLoading;
  final String? error;

  CartState({
    this.items = const [],
    this.subtotal = 0,
    this.taxAmount = 0,
    this.total = 0,
    this.isLoading = false,
    this.error,
  });

  CartState copyWith({
    List<dynamic>? items,
    double? subtotal,
    double? taxAmount,
    double? total,
    bool? isLoading,
    String? error,
  }) {
    return CartState(
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      taxAmount: taxAmount ?? this.taxAmount,
      total: total ?? this.total,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// 购物车Provider
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier(ref);
});

class CartNotifier extends StateNotifier<CartState> {
  final Ref _ref;

  CartNotifier(this._ref) : super(CartState()) {
    loadCart();
  }

  Future<void> loadCart() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final dio = _ref.read(dioProvider);
      final cartRes = await dio.get('/cart');
      final totalRes = await dio.get('/cart/total');

      final items = cartRes.data ?? [];
      final total = totalRes.data ?? {};

      state = state.copyWith(
        items: items,
        subtotal: (total['subtotal'] ?? 0).toDouble(),
        taxAmount: (total['taxAmount'] ?? 0).toDouble(),
        total: (total['total'] ?? 0).toDouble(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> updateQuantity(String itemId, int quantity) async {
    try {
      final dio = _ref.read(dioProvider);
      if (quantity <= 0) {
        await dio.delete('/cart/items/$itemId');
      } else {
        await dio.put('/cart/items/$itemId', data: {'quantity': quantity});
      }
      await loadCart();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> removeItem(String itemId) async {
    try {
      final dio = _ref.read(dioProvider);
      await dio.delete('/cart/items/$itemId');
      await loadCart();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> clearCart() async {
    try {
      final dio = _ref.read(dioProvider);
      await dio.delete('/cart');
      await loadCart();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

/**
 * 购物车页面（客户端）
 */
class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);

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
                await ref.read(cartProvider.notifier).clearCart();
              }
            },
            child: const Text('清空', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: cart.isLoading
          ? const Center(child: CircularProgressIndicator())
          : cart.error != null
              ? Center(child: Text('加载失败: ${cart.error}'))
              : cart.items.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey),
                          SizedBox(height: 16),
                          Text('购物车为空', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    )
                  : Column(
                      children: [
                        Expanded(child: _buildCartList(context, ref, cart)),
                        _buildBottomBar(context, ref, cart),
                      ],
                    ),
    );
  }

  Widget _buildCartList(BuildContext context, WidgetRef ref, CartState cart) {
    return RefreshIndicator(
      onRefresh: () => ref.read(cartProvider.notifier).loadCart(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: cart.items.length,
        itemBuilder: (context, index) {
          return _buildCartItem(cart.items[index], context, ref);
        },
      ),
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
                          await ref.read(cartProvider.notifier).updateQuantity(
                                item['id'],
                                (item['quantity'] as int) - 1,
                              );
                        },
                      ),
                      Text('${item['quantity']}'),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline),
                        onPressed: () async {
                          await ref.read(cartProvider.notifier).updateQuantity(
                                item['id'],
                                (item['quantity'] as int) + 1,
                              );
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
                await ref.read(cartProvider.notifier).removeItem(item['id']);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, WidgetRef ref, CartState cart) {
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
                Text('¥${cart.subtotal}'),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('消费税:'),
                Text('¥${cart.taxAmount}'),
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
                  '¥${cart.total}',
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
                onPressed: cart.items.isEmpty
                    ? null
                    : () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const CheckoutPage(),
                          ),
                        );
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
  }
}
