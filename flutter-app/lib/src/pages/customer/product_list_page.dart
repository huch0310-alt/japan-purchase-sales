import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../providers/auth_provider.dart';
import 'product_detail_page.dart';

// 商品列表状态
class ProductListState {
  final List<dynamic> products;
  final bool isLoading;
  final String? error;
  final String? categoryId;

  ProductListState({
    this.products = const [],
    this.isLoading = false,
    this.error,
    this.categoryId,
  });

  ProductListState copyWith({
    List<dynamic>? products,
    bool? isLoading,
    String? error,
    String? categoryId,
  }) {
    return ProductListState(
      products: products ?? this.products,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      categoryId: categoryId ?? this.categoryId,
    );
  }
}

// 商品列表Provider
final productListProvider = StateNotifierProvider<ProductListNotifier, ProductListState>((ref) {
  return ProductListNotifier(ref);
});

class ProductListNotifier extends StateNotifier<ProductListState> {
  final Ref _ref;

  ProductListNotifier(this._ref) : super(ProductListState()) {
    loadProducts();
  }

  Future<void> loadProducts({String? categoryId}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final dio = _ref.read(dioProvider);
      String query = '/products/active';
      if (categoryId != null && categoryId.isNotEmpty) {
        query = '/products/active?categoryId=$categoryId';
      }
      final res = await dio.get(query);
      state = state.copyWith(
        products: res.data ?? [],
        isLoading: false,
        categoryId: categoryId,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void selectCategory(String? categoryId) {
    loadProducts(categoryId: categoryId);
  }
}

/**
 * 商品列表页面（客户端）
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
          SizedBox(
            width: 80,
            child: _CategoryList(),
          ),
          // 右侧商品列表
          Expanded(
            child: _ProductGrid(),
          ),
        ],
      ),
    );
  }
}

class _CategoryList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentCategory = ref.watch(productListProvider).categoryId;

    final categories = [
      {'id': '', 'name': '全部'},
      {'id': '7d40fba5-bff1-4150-84b8-c7b44250fe0d', 'name': 'カテゴリ3666'},
      {'id': 'e5d24c9a-d942-4467-b105-94da6daf88cf', 'name': 'カテゴリ3949'},
      {'id': '84d3f4ab-ed7a-462d-9b35-70f12d1b6f49', 'name': 'カテゴリ5566'},
      {'id': 'f7bd9e49-0c20-4bbd-97a6-d22e7779540d', 'name': 'カテゴリ6557'},
      {'id': 'a4ec5e78-ce23-45ea-b62e-01a1afe7ead2', 'name': 'カテゴリ9470'},
    ];

    return Container(
      color: Colors.grey[100],
      child: ListView.builder(
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = currentCategory == category['id'];
          return ListTile(
            dense: true,
            title: Text(
              category['name']!,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? const Color(0xFF1E88E5) : Colors.black87,
              ),
              textAlign: TextAlign.center,
            ),
            selected: isSelected,
            selectedTileColor: Colors.blue[50],
            onTap: () {
              ref.read(productListProvider.notifier).selectCategory(category['id']);
            },
          );
        },
      ),
    );
  }
}

class _ProductGrid extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(productListProvider);

    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('加载失败: ${state.error}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                ref.read(productListProvider.notifier).loadProducts();
              },
              child: const Text('重试'),
            ),
          ],
        ),
      );
    }

    if (state.products.isEmpty) {
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
      itemCount: state.products.length,
      itemBuilder: (context, index) {
        return _ProductCard(product: state.products[index]);
      },
    );
  }
}

class _ProductCard extends ConsumerStatefulWidget {
  final Map<String, dynamic> product;

  const _ProductCard({required this.product});

  @override
  ConsumerState<_ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends ConsumerState<_ProductCard> {
  bool _isLoading = false;

  Future<void> _addToCart() async {
    if (_isLoading) return;

    setState(() => _isLoading = true);

    try {
      final dio = ref.read(dioProvider);
      await dio.post('/cart/items', data: {
        'productId': widget.product['id'],
        'quantity': 1,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('已添加到购物车')),
        );
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '添加失败';
        if (e is DioException && e.response != null) {
          final data = e.response?.data;
          if (data is Map) {
            errorMsg = data['message'] ?? data['error'] ?? errorMsg;
          } else if (e.response?.statusCode == 401) {
            errorMsg = '请重新登录';
          }
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

  void _openDetail() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductDetailPage(product: widget.product),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 商品图片 - 点击打开详情
          Expanded(
            flex: 3,
            child: GestureDetector(
              onTap: _openDetail,
              child: product['photoUrl'] != null
                  ? Image.network(
                      product['photoUrl'],
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Colors.grey[200],
                          child: const Icon(Icons.image, size: 40, color: Colors.grey),
                        );
                      },
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          color: Colors.grey[200],
                          child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        );
                      },
                    )
                  : Container(
                      color: Colors.grey[200],
                      child: const Icon(Icons.image, size: 40, color: Colors.grey),
                    ),
            ),
          ),
          // 商品信息
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // 商品名称 - 点击打开详情
                  GestureDetector(
                    onTap: _openDetail,
                    child: Text(
                      product['name'] ?? '',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  // 价格
                  Text(
                    '¥${product['salePrice'] ?? 0}',
                    style: const TextStyle(
                      color: Color(0xFF1E88E5),
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  // 加入购物车按钮
                  SizedBox(
                    height: 26,
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _addToCart,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E88E5),
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.zero,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text('加入购物车', style: TextStyle(fontSize: 11)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
