import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:convert';

class AddMealScreen extends StatefulWidget {
  const AddMealScreen({Key? key}) : super(key: key);

  @override
  State<AddMealScreen> createState() => _AddMealScreenState();
}

class _AddMealScreenState extends State<AddMealScreen> {
  final _mealNameController = TextEditingController();
  final _priceController = TextEditingController();
  File? _selectedImage;
  bool _isLoading = false;
  String? _errorMessage;

  final ImagePicker _imagePicker = ImagePicker();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // استبدل هذه بـ upload_preset الخاص بك من Cloudinary
  static const String _cloudinaryUploadPreset = 'YOUR_UPLOAD_PRESET';
  static const String _cloudinaryCloudName = 'YOUR_CLOUD_NAME';
  static const String _cloudinaryUrl =
      'https://api.cloudinary.com/v1_1/$_cloudinaryCloudName/image/upload';

  @override
  void dispose() {
    _mealNameController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final XFile? pickedFile =
          await _imagePicker.pickImage(source: ImageSource.gallery);
      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
          _errorMessage = null;
        });
      }
    } catch (e) {
      _showError('خطأ في اختيار الصورة: $e');
    }
  }

  Future<String?> _uploadImageToCloudinary() async {
    if (_selectedImage == null) return null;

    try {
      final request = http.MultipartRequest('POST', Uri.parse(_cloudinaryUrl));

      request.fields['upload_preset'] = _cloudinaryUploadPreset;
      request.files.add(
        await http.MultipartFile.fromPath('file', _selectedImage!.path),
      );

      final response = await request.send().timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('انتهت مهلة الرفع - تحقق من اتصال الإنترنت');
        },
      );

      if (response.statusCode == 200) {
        final responseData = await response.stream.toBytes();
        final jsonResponse = json.decode(utf8.decode(responseData));
        return jsonResponse['secure_url'];
      } else {
        throw Exception('فشل رفع الصورة: ${response.statusCode}');
      }
    } catch (e) {
      _showError('خطأ في رفع الصورة: $e');
      return null;
    }
  }

  Future<void> _saveMeal() async {
    if (_mealNameController.text.isEmpty ||
        _priceController.text.isEmpty ||
        _selectedImage == null) {
      _showError('يرجى ملء جميع الحقول واختيار صورة');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // رفع الصورة إلى Cloudinary
      final imageUrl = await _uploadImageToCloudinary();

      if (imageUrl == null) {
        setState(() => _isLoading = false);
        return;
      }

      // حفظ البيانات في Firestore
      await _firestore.collection('meals').add({
        'name': _mealNameController.text,
        'price': double.parse(_priceController.text),
        'imageUrl': imageUrl,
        'createdAt': FieldValue.serverTimestamp(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم إضافة الوجبة بنجاح')),
        );
        _resetForm();
      }
    } catch (e) {
      _showError('خطأ في حفظ الوجبة: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _resetForm() {
    _mealNameController.clear();
    _priceController.clear();
    setState(() => _selectedImage = null);
  }

  void _showError(String message) {
    setState(() => _errorMessage = message);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    }
  }

  bool _isFormValid() {
    return _mealNameController.text.isNotEmpty &&
        _priceController.text.isNotEmpty &&
        _selectedImage != null &&
        !_isLoading;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إضافة وجبة جديدة'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // حقل اسم الوجبة
            TextField(
              controller: _mealNameController,
              decoration: InputDecoration(
                labelText: 'اسم الوجبة',
                hintText: 'مثال: فول سوداني',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                enabled: !_isLoading,
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 16),

            // حقل السعر
            TextField(
              controller: _priceController,
              decoration: InputDecoration(
                labelText: 'السعر (جنيه سوداني)',
                hintText: '0.00',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                enabled: !_isLoading,
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 24),

            // عرض الصورة المختارة
            if (_selectedImage != null)
              Container(
                height: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey),
                ),
                child: Image.file(
                  _selectedImage!,
                  fit: BoxFit.cover,
                ),
              )
            else
              Container(
                height: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey),
                  color: Colors.grey[100],
                ),
                child: const Center(
                  child: Text('لم يتم اختيار صورة'),
                ),
              ),
            const SizedBox(height: 16),

            // زر اختيار الصورة
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _pickImage,
              icon: const Icon(Icons.image),
              label: const Text('اختر صورة من المعرض'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
            const SizedBox(height: 24),

            // زر الحفظ
            ElevatedButton(
              onPressed: _isFormValid() ? _saveMeal : null,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                backgroundColor: Colors.green,
                disabledBackgroundColor: Colors.grey,
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text(
                      'حفظ الوجبة',
                      style: TextStyle(fontSize: 16, color: Colors.white),
                    ),
            ),

            // رسالة الخطأ
            if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red[100],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
