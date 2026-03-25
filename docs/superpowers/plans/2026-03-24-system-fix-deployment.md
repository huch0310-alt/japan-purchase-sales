# 日本采销管理系统 - 全系统修复与部署计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复后端bcrypt认证问题、Flutter APP的Dio配置问题、Web Admin的路由问题，并完成生产环境部署测试

**Architecture:** 三层修复策略：1) 后端用bcryptjs替代bcrypt并修复双重哈希bug 2) Flutter统一Dio实例并修复API配置 3) Web Admin修复401路由跳转

**Tech Stack:** NestJS, TypeORM, PostgreSQL, Flutter/Riverpod, Vue3/Pinia, Docker, Nginx

---

## 问题诊断总结

### 后端问题
| 问题 | 文件 | 修复方案 |
|------|------|----------|
| bcrypt原生模块导致Docker进程崩溃 | package.json | 必须从package.json完全移除bcrypt依赖 |
| changePassword双重哈希 | auth.service.ts:133-137 | 移除预哈希，直接传明文给updatePassword |
| DB_SYNCHRONIZE生产风险 | .env | 改为false |

### Flutter问题
| 问题 | 文件 | 修复方案 |
|------|------|----------|
| 两套Dio实例，token只注入一个 | auth_provider.dart, api_service.dart | 统一使用auth_provider的Dio |
| Dio拦截器token注入被注释 | api_service.dart | 启用拦截器 |

### Web Admin问题
| 问题 | 文件 | 修复方案 |
|------|------|----------|
| 401响应使用window.location.href | api/index.js | 改用router.push |

---

## 文件变更映射

### Backend (C:\Users\Administrator\japan-purchase-sales\backend)
```
src/auth/auth.service.ts          - 双重哈希修复(已改为bcryptjs)
src/users/staff.service.ts       - bcryptjs (已改)
src/users/customer.service.ts     - bcryptjs (已改)
package.json                      - 必须完全移除bcrypt依赖
.env                              - DB_SYNCHRONIZE=false
```

### Flutter APP (C:\Users\Administrator\japan-purchase-sales\flutter-app)
```
lib/src/providers/auth_provider.dart  - 统一Dio，添加401拦截器
lib/src/services/api_service.dart    - 重构使用auth_provider的Dio
lib/config/app_config.dart           - 存在且正确，API地址是3000端口
```

### Web Admin (C:\Users\Administrator\japan-purchase-sales\web-admin)
```
src/api/index.js                 - 修复401路由跳转(router.push)
```

---

## 任务分解

### Task 1: 后端 - 确保移除bcrypt并修复双重哈希

**现状:**
- auth.service.ts, staff.service.ts, customer.service.ts **已改为bcryptjs**
- **问题**: package.json 仍包含 `"bcrypt": "^5.1.1"`，Docker构建时会安装原生模块

**Files:**
- Modify: `backend/package.json` (移除bcrypt)
- Modify: `backend/.env` (DB_SYNCHRONIZE=false)
- Modify: `backend/src/auth/auth.service.ts` (修复双重哈希)

- [ ] **Step 1: 验证代码已是bcryptjs**

检查确认以下文件import语句是 `bcryptjs`:
```bash
grep "bcrypt" backend/src/auth/auth.service.ts
grep "bcrypt" backend/src/users/staff.service.ts
grep "bcrypt" backend/src/users/customer.service.ts
```
预期: 所有import都是 `from 'bcryptjs'`

- [ ] **Step 2: 从 package.json 移除 bcrypt 依赖**

编辑 `backend/package.json`，删除:
```json
"bcrypt": "^5.1.1",
```
保留:
```json
"bcryptjs": "^3.0.3",
```

- [ ] **Step 3: 修改 .env 的 DB_SYNCHRONIZE=false**

```
DB_SYNCHRONIZE=false
```

- [ ] **Step 4: 修复 auth.service.ts 双重哈希bug**

检查 `changePassword` 方法(约第133行):
```typescript
// 错误代码:
const newPasswordHash = await bcrypt.hash(newPassword, 10);  // 第一次哈希
if (userType === 'staff') {
  await this.staffService.updatePassword(userId, newPasswordHash);  // updatePassword内部又哈希一次!
}

// 修复为:
if (userType === 'staff') {
  await this.staffService.updatePassword(userId, newPassword);  // 直接传明文
} else {
  await this.customerService.updatePassword(userId, newPassword);
}
```

- [ ] **Step 5: 验证 package-lock.json 也无bcrypt**

检查 `package-lock.json` 中不存在 `bcrypt` (除 bcryptjs):
```bash
grep -c '"bcrypt"' backend/package-lock.json
```
预期: 0

- [ ] **Step 6: 编译验证**

```bash
cd /c/Users/Administrator/japan-purchase-sales/backend
npm run build
```
预期: 编译成功，无错误

### Task 2: 后端 - 重新构建Docker镜像并部署

**Files:**
- Build: `backend/Dockerfile`
- Deploy: `43.153.155.76:/opt/japan-purchase-sales/backend/`

- [ ] **Step 1: 本地清理并重新安装依赖**

```bash
cd /c/Users/Administrator/japan-purchase-sales/backend
rm -f package-lock.json
npm cache clean --force
npm install
```

- [ ] **Step 2: 构建后端**

```bash
npm run build
```

- [ ] **Step 3: 打包上传到服务器**

```bash
cd /c/Users/Administrator/japan-purchase-sales
tar -czf backend-fix.tar.gz --exclude='node_modules' --exclude='dist' --exclude='.git' backend/
scp backend-fix.tar.gz root@43.153.155.76:/tmp/
```

- [ ] **Step 4: 在服务器重新构建Docker镜像**

```bash
ssh root@43.153.155.76
cd /opt/japan-purchase-sales/backend
rm -rf dist node_modules
tar -xzf /tmp/backend-fix.tar.gz
npm install
docker build -t deploy-backend:latest .
```

- [ ] **Step 5: 重启后端容器**

```bash
docker rm -f japan-sales-backend || true
docker run -d --name japan-sales-backend \
  --restart always \
  -e NODE_ENV=production \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres123 \
  -e DB_DATABASE=japan_purchase_sales \
  -e DB_SYNCHRONIZE=false \
  -e JWT_SECRET=your-super-secret-jwt-key-change-this \
  -e JWT_EXPIRES_IN=7d \
  -e PORT=3001 \
  -p 3001:3001 \
  --network japan-purchase-sales_japan-sales-network \
  deploy-backend:latest
```

- [ ] **Step 6: 验证容器稳定运行**

```bash
sleep 10
docker ps | grep backend
docker logs --tail 30 japan-sales-backend
```

### Task 3: Flutter APP - 统一Dio实例

**Files:**
- Modify: `flutter-app/lib/src/providers/auth_provider.dart`
- Modify: `flutter-app/lib/src/services/api_service.dart`

**现状:**
- `app_config.dart` 已存在且API地址正确 (`http://43.153.155.76:3000/api`)
- `api_service.dart` 存在但未正确使用 auth_provider 的Dio
- `auth_provider.dart` 的Dio是主实例

- [ ] **Step 1: 检查 auth_provider.dart 的Dio配置**

确认 `dioProvider` 包含:
- 正确的 baseUrl
- 10秒超时
- Authorization 拦截器(已启用)

- [ ] **Step 2: 修改 api_service.dart 使用 dioProvider**

```dart
// flutter-app/lib/src/services/api_service.dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

// 使用auth_provider的Dio实例
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(ref.watch(dioProvider));
});

class ApiService {
  final Dio _dio;
  ApiService(this._dio);

  // 所有API方法现在使用注入的_dio
  Future<Response> get(String path, {Map<String, dynamic>? params}) async {
    return _dio.get(path, queryParameters: params);
  }

  Future<Response> post(String path, {dynamic data}) async {
    return _dio.post(path, data: data);
  }

  // ... 其他方法
}
```

- [ ] **Step 3: 验证 api_service.dart 导入正确**

确认 import 语句正确引用 `auth_provider.dart` 的 `dioProvider`

### Task 4: Flutter APP - 重新构建APK

**Files:**
- Build: `flutter-app/build/app/outputs/flutter-apk/app-release.apk`

- [ ] **Step 1: 清理并获取依赖**

```bash
cd /c/Users/Administrator/japan-purchase-sales/flutter-app
flutter clean
flutter pub get
```

- [ ] **Step 2: 构建发布版APK**

```bash
flutter build apk --release
```

- [ ] **Step 3: 验证APK存在**

```bash
ls -la build/app/outputs/flutter-apk/app-release.apk
```

### Task 5: Web Admin - 修复401路由跳转

**问题:** `api/index.js` 中的 `window.location.href` 会导致页面完全刷新

**Files:**
- Modify: `web-admin/src/api/index.js`
- Modify: `web-admin/src/main.js` (如需要导出router)

- [ ] **Step 1: 确认 router 可访问**

检查 `web-admin/src/main.js`，确保 router 被正确导出:
```javascript
// main.js 中 router 实例在 createApp 之前创建
const router = createRouter({...})

// 然后在 app.use(router) 之后，需要单独导出
export default router  // 正确: 导出 router，不是 app

// api/index.js 中导入:
import router from '../router'
// 或使用 pinia store 触发跳转
```

- [ ] **Step 2: 修改 api/index.js 的401处理**

```javascript
// web-admin/src/api/index.js
import axios from 'axios';
import router from '../main';  // 添加router导入

// ... 现有配置 ...

// 响应拦截器中:
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');  // 改用Vue路由
}
```

### Task 6: Web Admin - 重新构建并部署

**Files:**
- Build: `web-admin/Dockerfile`
- Deploy: `43.153.155.76:/opt/japan-purchase-sales/web-admin/`

- [ ] **Step 1: 本地构建**

```bash
cd /c/Users/Administrator/japan-purchase-sales/web-admin
npm install
npm run build
```

- [ ] **Step 2: 上传并部署**

```bash
cd /c/Users/Administrator/japan-purchase-sales
tar -czf web-admin-fix.tar.gz --exclude='node_modules' --exclude='dist' --exclude='.git' web-admin/
scp web-admin-fix.tar.gz root@43.153.155.76:/tmp/

ssh root@43.153.155.76 "
  cd /opt/japan-purchase-sales/web-admin
  rm -rf dist
  tar -xzf /tmp/web-admin-fix.tar.gz
  docker build -t japan-purchase-sales_web-admin:latest .
  docker ps | grep web
"
```

### Task 7: 端到端测试验证

**测试场景：**

- [ ] **Test 1: 后端API直接测试 - 员工登录**

```bash
curl -X POST http://43.153.155.76:3001/api/auth/staff/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
预期: 返回 `{"access_token":"ey...","user":{"id":"...","username":"admin",...}}`

- [ ] **Test 2: 后端API直接测试 - 客户登录**

```bash
curl -X POST http://43.153.155.76:3001/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```
预期: 返回有效的 token 和 user 对象

- [ ] **Test 3: Web Admin 登录测试**

1. 打开浏览器访问 http://43.153.155.76
2. 使用 admin/admin123 登录
3. 验证成功跳转首页（无页面刷新）
4. 尝试访问各菜单验证无权限问题

- [ ] **Test 4: Flutter APP 登录测试**

1. 安装新构建的APK到手机
2. 使用 admin/admin123 登录员工账号
3. 验证成功进入采购页面（不闪退）

---

## 部署后验证检查清单

- [ ] 后端容器稳定运行（docker ps 显示 Up 超过1分钟）
- [ ] 后端日志无 "bcrypt" 相关错误
- [ ] POST /api/auth/staff/login 返回200和有效token
- [ ] Web Admin 可登录并访问各页面
- [ ] Flutter APP 可登录并显示首页
- [ ] 数据库连接稳定（无 "connection refused" 错误）

---

## 回滚计划

如果修复失败：
1. 使用 `docker images` 查看保留的旧镜像
2. `docker tag <old-image> deploy-backend:latest` 恢复
3. Flutter 使用之前构建的稳定APK

---

## 预期完成时间

- Task 1 (后端检查): 5分钟
- Task 2 (后端部署): 15分钟
- Task 3 (Flutter Dio): 5分钟
- Task 4 (Flutter构建): 10分钟
- Task 5-6 (Web Admin): 10分钟
- Task 7 (测试): 10分钟
- **总计: 约55分钟**
