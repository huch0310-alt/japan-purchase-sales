import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

// 商品列表 Provider
final productListProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, status) async {
  final query = status.isEmpty ? '/products' : '/products?status=$status';
  final response = await ref.read(dioProvider).get(query);
  return List<Map<String, dynamic>>.from(response.data['data'] ?? []);
});

/**
 * 商品管理页面（销售端）
 * 商品上下架、价格修改
 */
class ProductManagePage extends ConsumerStatefulWidget {
  const ProductManagePage({super.key});

  @override
  ConsumerState<ProductManagePage> createState() => _ProductManagePageState();
}

class _ProductManagePageState extends ConsumerState<ProductManagePage> {
  String _filterStatus = 'all';
  String? _filterCategoryId;

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productListProvider(_filterStatus));

    return Scaffold(
      appBar: AppBar(
        title: const Text('商品管理'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilter,
          ),
        ],
      ),
      body: Column(
        children: [
          // 筛选条件
          Container(
            padding: const EdgeInsets.all(8),
            color: Colors.grey[100],
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('全部', 'all'),
                  const SizedBox(width: 8),
                  _buildFilterChip('上架', 'active'),
                  const SizedBox(width: 8),
                  _buildFilterChip('下架', 'inactive'),
                ],
              ),
            ),
          ),
          // 商品列表
          Expanded(
            child: productsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('加载失败: $error'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(productListProvider(_filterStatus)),
                      child: const Text('重试'),
                    ),
                  ],
                ),
              ),
              data: (products) {
                if (products.isEmpty) {
                  return const Center(child: Text('暂无商品'));
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(productListProvider(_filterStatus));
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      return _buildProductCard(products[index]);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _filterStatus == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() => _filterStatus = value);
      },
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
    final isActive = product['status'] == 'active';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(8),
          ),
          child: product['photoUrl'] != null
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(product['photoUrl'], fit: BoxFit.cover),
                )
              : const Icon(Icons.image),
        ),
        title: Text(product['name'] ?? ''),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('采购价: ¥${product['purchasePrice'] ?? 0}'),
            Text('销售价: ¥${product['salePrice'] ?? 0}'),
          ],
        ),
        trailing: Switch(
          value: isActive,
          onChanged: (value) async {
            try {
              final endpoint = value
                  ? '/products/${product['id']}/activate'
                  : '/products/${product['id']}/deactivate';
              await ref.read(dioProvider).put(endpoint);
              ref.invalidate(productListProvider(_filterStatus));
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('操作失败: $e')),
                );
              }
            }
          },
        ),
        isThreeLine: true,
      ),
    );
  }

  void _showFilter() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('筛选', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const Text('状态'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _buildFilterChip('全部', 'all'),
                _buildFilterChip('上架', 'active'),
                _buildFilterChip('下架', 'inactive'),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text('应用筛选'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
