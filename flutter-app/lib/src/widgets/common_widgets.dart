import 'package:flutter/material.dart';

/**
 * 通用组件
 */

// 加载中组件
class LoadingWidget extends StatelessWidget {
  final String? message;

  const LoadingWidget({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(message!, style: const TextStyle(color: Colors.grey)),
          ],
        ],
      ),
    );
  }
}

// 空数据组件
class EmptyWidget extends StatelessWidget {
  final String message;
  final IconData? icon;

  const EmptyWidget({
    super.key,
    this.message = '暂无数据',
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon ?? Icons.inbox,
            size: 64,
            color: Colors.grey,
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: const TextStyle(color: Colors.grey, fontSize: 16),
          ),
        ],
      ),
    );
  }
}

// 错误组件
class ErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const ErrorWidget({
    super.key,
    required this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.red,
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: const TextStyle(color: Colors.red, fontSize: 16),
            textAlign: TextAlign.center,
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
              child: const Text('重试'),
            ),
          ],
        ],
      ),
    );
  }
}

// 状态标签组件
class StatusTag extends StatelessWidget {
  final String status;
  final Map<String, Color> colorMap;
  final Map<String, String> textMap;

  const StatusTag({
    super.key,
    required this.status,
    this.colorMap = const {},
    this.textMap = const {},
  });

  @override
  Widget build(BuildContext context) {
    final color = colorMap[status] ?? Colors.grey;
    final text = textMap[status] ?? status;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: TextStyle(color: color, fontSize: 12),
      ),
    );
  }
}

// 价格显示组件
class PriceText extends StatelessWidget {
  final double price;
  final String? prefix;
  final bool showTax;
  final TextStyle? style;

  const PriceText({
    super.key,
    required this.price,
    this.prefix = '¥',
    this.showTax = false,
    this.style,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      '$prefix${price.toStringAsFixed(0)}${showTax ? ' (税拔)' : ''}',
      style: style ?? const TextStyle(
        color: Color(0xFF1E88E5),
        fontWeight: FontWeight.bold,
        fontSize: 16,
      ),
    );
  }
}

// 数量输入组件
class QuantityInput extends StatelessWidget {
  final int quantity;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;

  const QuantityInput({
    super.key,
    required this.quantity,
    required this.onChanged,
    this.min = 1,
    this.max = 999,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.remove_circle_outline),
          onPressed: quantity > min ? () => onChanged(quantity - 1) : null,
          color: const Color(0xFF1E88E5),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            quantity.toString(),
            style: const TextStyle(fontSize: 16),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.add_circle_outline),
          onPressed: quantity < max ? () => onChanged(quantity + 1) : null,
          color: const Color(0xFF1E88E5),
        ),
      ],
    );
  }
}
