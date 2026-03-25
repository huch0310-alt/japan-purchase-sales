import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

/**
 * 商品审核页面（销售端）
 * 审核采购提交的商品
 */
class ProductAuditPage extends ConsumerStatefulWidget {
  const ProductAuditPage({super.key});

  @override
  ConsumerState<ProductAuditPage> createState() => _ProductAuditPageState();
}

class _ProductAuditPageState extends ConsumerState<ProductAuditPage> {
  Future<List<dynamic>>? _futureProducts;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  void _loadProducts() {
    _futureProducts = ref.read(dioProvider).get('/products/pending').then((res) => res.data);
  }

  Future<void> _refreshProducts() async {
    setState(() {
      _loadProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('商品审核'),
      ),
      body: FutureBuilder(
        future: _futureProducts,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('加载失败: ${snapshot.error}'));
          }

          final products = snapshot.data ?? [];

          if (products.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle, size: 64, color: Colors.green),
                  SizedBox(height: 16),
                  Text('暂无待审核商品', style: TextStyle(color: Colors.grey)),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _refreshProducts,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return _buildAuditCard(context, product);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildAuditCard(BuildContext context, Map<String, dynamic> product) {
    final priceController = TextEditingController();

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 商品信息
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 照片
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: product['photoUrl'] != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            product['photoUrl'],
                            fit: BoxFit.cover,
                          ),
                        )
                      : const Icon(Icons.image, size: 32),
                ),
                const SizedBox(width: 12),
                // 详情
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product['name'] ?? '',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text('数量: ${product['quantity'] ?? 0} ${product['unit'] ?? ''}'),
                      Text('采购价: ¥${product['purchasePrice'] ?? '0'}'),
                      if (product['description'] != null)
                        Text(
                          product['description'],
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.grey),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // 销售价格输入
            Row(
              children: [
                const Text('销售价（税拔）: ¥'),
                SizedBox(
                  width: 100,
                  child: TextField(
                    controller: priceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // 操作按钮
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () async {
                    try {
                      await ref.read(dioProvider).put('/products/${product['id']}/reject');
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('已拒绝')),
                        );
                        // 延迟刷新列表
                        await Future.delayed(const Duration(milliseconds: 500));
                        _refreshProducts();
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('操作失败: $e')),
                        );
                      }
                    }
                  },
                  style: TextButton.styleFrom(foregroundColor: Colors.red),
                  child: const Text('拒绝'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () async {
                    final price = double.tryParse(priceController.text);
                    if (price == null || price <= 0) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('请输入有效的销售价格')),
                      );
                      return;
                    }
                    try {
                      await ref.read(dioProvider).put(
                        '/products/${product['id']}/approve',
                        data: {'salePrice': price},
                      );
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('审核通过')),
                        );
                        // 延迟刷新列表
                        await Future.delayed(const Duration(milliseconds: 500));
                        _refreshProducts();
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('操作失败: $e')),
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('通过'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
