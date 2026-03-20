import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

/**
 * 商品详情页面（销售端）
 */
class SalesProductDetailPage extends ConsumerWidget {
  final String productId;

  const SalesProductDetailPage({super.key, required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('商品详情'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: 编辑商品
            },
          ),
        ],
      ),
      body: FutureBuilder(
        future: ref.read(dioProvider).get('/products/$productId'),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('加载失败: ${snapshot.error}'));
          }

          final product = snapshot.data?.data ?? {};

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 商品图片
                Container(
                  width: double.infinity,
                  height: 200,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: product['photoUrl'] != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(product['photoUrl'], fit: BoxFit.cover),
                        )
                      : const Icon(Icons.image, size: 64, color: Colors.grey),
                ),
                const SizedBox(height: 24),
                // 商品信息
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product['name'] ?? '',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const Divider(),
                        _buildInfoRow('分类', product['category']?['name'] ?? '-'),
                        _buildInfoRow('库存', '${product['quantity'] ?? 0} ${product['unit'] ?? ''}'),
                        _buildInfoRow('采购价', '¥${product['purchasePrice'] ?? 0}'),
                        _buildInfoRow('销售价', '¥${product['salePrice'] ?? 0}'),
                        _buildInfoRow('状态', _getStatusText(product['status'])),
                        _buildInfoRow('创建时间', product['createdAt'] ?? ''),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // 商品说明
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('商品说明', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(product['description'] ?? '暂无说明'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: Container(
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
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
                    try {
                      final endpoint = product['status'] == 'active' ? 'deactivate' : 'activate';
                      await ref.read(dioProvider).put('/products/$productId/$endpoint');
                      // Refresh
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('操作失败: $e')),
                        );
                      }
                    }
                  },
                  child: Text(product['status'] == 'active' ? '下架' : '上架'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    // TODO: 修改价格
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E88E5),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('修改价格'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  String _getStatusText(String status) {
    const map = {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已拒绝',
      'active': '上架',
      'inactive': '下架',
    };
    return map[status] ?? status;
  }
}
