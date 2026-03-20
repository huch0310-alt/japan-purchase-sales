import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

/**
 * 订单管理页面（销售端）
 * 订单查看、确认、打印
 */
class OrderManagePage extends ConsumerStatefulWidget {
  const OrderManagePage({super.key});

  @override
  ConsumerState<OrderManagePage> createState() => _OrderManagePageState();
}

class _OrderManagePageState extends ConsumerState<OrderManagePage> {
  String _filterStatus = 'all';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('订单管理'),
        actions: [
          IconButton(
            icon: const Icon(Icons.print),
            onPressed: () {
              // TODO: 一键打印
            },
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
                  _buildFilterChip('待确认', 'pending'),
                  const SizedBox(width: 8),
                  _buildFilterChip('已确认', 'confirmed'),
                  const SizedBox(width: 8),
                  _buildFilterChip('已完成', 'completed'),
                ],
              ),
            ),
          ),
          // 订单列表
          Expanded(
            child: _buildOrderList(),
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

  Widget _buildOrderList() {
    String query = '/orders?status=${_filterStatus == 'all' ? '' : _filterStatus}';

    return FutureBuilder(
      future: ref.read(dioProvider).get(query),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(child: Text('加载失败: ${snapshot.error}'));
        }

        final orders = snapshot.data?.data ?? [];

        if (orders.isEmpty) {
          return const Center(child: Text('暂无订单'));
        }

        return RefreshIndicator(
          onRefresh: () async {
            setState(() {});
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: orders.length,
            itemBuilder: (context, index) {
              return _buildOrderCard(orders[index]);
            },
          ),
        );
      },
    );
  }

  Widget _buildOrderCard(Map<String, dynamic> order) {
    final status = order['status'] ?? 'pending';
    final statusText = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消',
    }[status] ?? status;

    final statusColor = {
      'pending': Colors.orange,
      'confirmed': Colors.blue,
      'completed': Colors.green,
      'cancelled': Colors.red,
    }[status] ?? Colors.grey;

    final customer = order['customer'] ?? {};

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          // TODO: 跳转到订单详情
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 订单号和状态
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    order['orderNo'] ?? '',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
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
              const SizedBox(height: 8),
              // 客户信息
              Text('客户: ${customer['companyName'] ?? ''}'),
              Text('收货人: ${order['contactPerson'] ?? ''}'),
              Text('电话: ${order['contactPhone'] ?? ''}'),
              Text('地址: ${order['deliveryAddress'] ?? ''}'),
              const Divider(),
              // 金额
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '金额: ¥${order['totalAmount'] ?? 0}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  // 待确认时显示确认按钮
                  if (status == 'pending')
                    ElevatedButton(
                      onPressed: () async {
                        try {
                          await ref.read(dioProvider).put('/orders/${order['id']}/confirm');
                          setState(() {});
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('已确认订单')),
                            );
                          }
                        } catch (e) {
                          if (mounted) {
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
                      child: const Text('确认'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
