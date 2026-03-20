import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

/**
 * 我的采集记录页面（采购端）
 * 显示采集的商品及其状态
 */
class MyCollectPage extends ConsumerWidget {
  const MyCollectPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('我的采集记录'),
      ),
      body: FutureBuilder(
        future: ref.read(dioProvider).get('/products?createdBy=me'),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('加载失败: ${snapshot.error}'));
          }

          final products = snapshot.data?.data ?? [];

          if (products.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inbox, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('暂无采集记录', style: TextStyle(color: Colors.grey)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return _buildProductCard(context, product, ref);
            },
          );
        },
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, Map<String, dynamic> product, WidgetRef ref) {
    final status = product['status'] ?? 'pending';
    final statusText = {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已拒绝',
      'active': '已上架',
      'inactive': '已下架',
    }[status] ?? status;

    final statusColor = {
      'pending': Colors.orange,
      'approved': Colors.green,
      'rejected': Colors.red,
      'active': Colors.blue,
      'inactive': Colors.grey,
    }[status] ?? Colors.grey;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: product['photoUrl'] != null
            ? Image.network(
                product['photoUrl'],
                width: 50,
                height: 50,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 50,
                  height: 50,
                  color: Colors.grey[200],
                  child: const Icon(Icons.image),
                ),
              )
            : Container(
                width: 50,
                height: 50,
                color: Colors.grey[200],
                child: const Icon(Icons.image),
              ),
        title: Text(product['name'] ?? ''),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('采集时间: ${product['createdAt'] ?? ''}'),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(color: statusColor, fontSize: 12),
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: status == 'pending'
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit),
                    onPressed: () {
                      // TODO: 编辑
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete),
                    onPressed: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('确认删除'),
                          content: const Text('确定要删除这条采集记录吗？'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text('取消'),
                            ),
                            TextButton(
                              onPressed: () => Navigator.pop(context, true),
                              child: const Text('删除'),
                            ),
                          ],
                        ),
                      );
                      if (confirm == true) {
                        // TODO: 调用删除API
                      }
                    },
                  ),
                ],
              )
            : null,
        isThreeLine: true,
      ),
    );
  }
}
