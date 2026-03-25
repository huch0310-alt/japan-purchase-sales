import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../providers/auth_provider.dart';
import '../../models/product.dart';
import 'package:dio/dio.dart';

/**
 * 商品采集页面（采购端）
 * 拍照 → 填写信息 → 提交
 */
class ProductCollectPage extends ConsumerStatefulWidget {
  const ProductCollectPage({super.key});

  @override
  ConsumerState<ProductCollectPage> createState() => _ProductCollectPageState();
}

class _ProductCollectPageState extends ConsumerState<ProductCollectPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _quantityController = TextEditingController(text: '1');
  final _purchasePriceController = TextEditingController();
  final _descriptionController = TextEditingController();
  String? _selectedUnit;
  String? _selectedCategoryId;
  File? _photo;
  bool _isLoading = false;

  final List<String> _units = [
    '个', '袋', '箱', 'kg', 'g', '本', '盒', 'pack',
    'ケース', '枚', 'セット', '瓶', '罐', 'ml', 'L'
  ];

  final List<Map<String, String>> _categories = [
    {'id': '1', 'name': '肉类'},
    {'id': '2', 'name': '蛋品'},
    {'id': '3', 'name': '生鲜蔬果'},
    {'id': '4', 'name': '酒水饮料'},
    {'id': '5', 'name': '零食点心'},
    {'id': '6', 'name': '调味品'},
    {'id': '7', 'name': '冷冻食品'},
    {'id': '8', 'name': '日用品'},
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _quantityController.dispose();
    _purchasePriceController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      setState(() => _photo = File(image.path));
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_photo == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请拍摄商品照片')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dio = ref.read(dioProvider);

      // 先上传图片
      String? photoUrl;
      if (_photo != null) {
        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(_photo!.path),
        });
        final uploadRes = await dio.post('/upload', data: formData);
        photoUrl = uploadRes.data['url'];
      }

      // 再提交商品数据
      final productData = {
        'name': _nameController.text,
        'quantity': int.tryParse(_quantityController.text) ?? 1,
        'unit': _selectedUnit ?? '个',
        'categoryId': _selectedCategoryId,
        'description': _descriptionController.text,
        'purchasePrice': double.tryParse(_purchasePriceController.text) ?? 0,
        if (photoUrl != null) 'photoUrl': photoUrl,
      };

      await dio.post('/products', data: productData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('提交成功，等待审核')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '提交失败';
        if (e is DioException && e.response != null) {
          final data = e.response?.data;
          if (data is Map) {
            errorMsg = data['message'] ?? data['error'] ?? errorMsg;
          }
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMsg)),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('商品采集'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 照片拍摄
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: _photo != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(_photo!, fit: BoxFit.cover),
                      )
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.camera_alt, size: 48, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('点击拍摄商品照片'),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),
            // 商品名称
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: '商品名称 *',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '请输入商品名称';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            // 分类
            DropdownButtonFormField<String>(
              value: _selectedCategoryId,
              decoration: const InputDecoration(
                labelText: '分类',
                border: OutlineInputBorder(),
              ),
              items: _categories.map((c) => DropdownMenuItem(
                value: c['id'],
                child: Text(c['name']!),
              )).toList(),
              onChanged: (value) {
                setState(() => _selectedCategoryId = value);
              },
            ),
            const SizedBox(height: 16),
            // 数量和单位
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextFormField(
                    controller: _quantityController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: '数量',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 3,
                  child: DropdownButtonFormField<String>(
                    value: _selectedUnit,
                    decoration: const InputDecoration(
                      labelText: '单位',
                      border: OutlineInputBorder(),
                    ),
                    items: _units.map((u) => DropdownMenuItem(
                      value: u,
                      child: Text(u),
                    )).toList(),
                    onChanged: (value) {
                      setState(() => _selectedUnit = value);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // 采购价
            TextFormField(
              controller: _purchasePriceController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: '采购价 (¥)',
                border: OutlineInputBorder(),
                prefixText: '¥ ',
              ),
            ),
            const SizedBox(height: 16),
            // 说明
            TextFormField(
              controller: _descriptionController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: '说明',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 24),
            // 提交按钮
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E88E5),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('提交', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
