# E2E 测试报告

**项目：** 日本采销管理系统
**测试日期：** 2026-03-24
**测试环境：** http://43.153.155.76
**测试框架：** Playwright

---

## 执行摘要

| 指标 | 数值 |
|------|------|
| 总测试数 | 28 |
| 通过 | 4 |
| 失败 | 24 |
| 通过率 | 14.3% |

---

## 测试结果详情

### ✅ 通过的测试 (4/28)

#### 认证测试 (4/4)
| 测试用例 | 状态 | 耗时 |
|---------|------|------|
| super_admin 登录成功 | ✅ 通过 | 841ms |
| admin 登录成功 | ✅ 通过 | 720ms |
| sales 登录成功 | ✅ 通过 | 733ms |
| 无效凭据登录失败 | ✅ 通过 | 519ms |

### ❌ 失败的测试 (24/28)

#### 员工管理测试 (4/4)
| 测试用例 | 状态 | 原因 |
|---------|------|------|
| 创建新员工 | ❌ 失败 | 后端返回500错误 |
| 编辑员工信息 | ❌ 失败 | 后端返回500错误 |
| 删除员工 | ❌ 失败 | 后端返回500错误 |
| 按角色筛选员工 | ❌ 失败 | 后端返回500错误 |

#### 客户管理测试 (4/4)
| 测试用例 | 状态 | 原因 |
|---------|------|------|
| 创建新客户 | ❌ 失败 | 后端返回500错误 |
| 编辑客户信息 | ❌ 失败 | 后端返回500错误 |
| 删除客户 | ❌ 失败 | 后端返回500错误 |
| 按名称搜索客户 | ❌ 失败 | 后端返回500错误 |

#### 分类和商品管理测试 (5/5)
| 测试用例 | 状态 | 原因 |
|---------|------|------|
| 创建商品分类 | ❌ 失败 | 后端返回500错误 |
| 创建商品 | ❌ 失败 | 后端返回500错误 |
| 编辑商品 | ❌ 失败 | 后端返回500错误 |
| 按分类筛选商品 | ❌ 失败 | 后端返回500错误 |
| 商品上架/下架 | ❌ 失败 | 后端返回500错误 |

#### 订单管理测试 (5/5)
| 测试用例 | 状态 | 原因 |
|---------|------|------|
| 查看订单列表 | ❌ 失败 | 后端返回500错误 |
| 按状态筛选订单 | ❌ 失败 | 后端返回500错误 |
| 查看订单详情 | ❌ 失败 | 后端返回500错误 |
| 创建新订单 | ❌ 失败 | 后端返回500错误 |
| 确认订单 | ❌ 失败 | 后端返回500错误 |
| 完成订单 | ❌ 失败 | 后端返回500错误 |

#### 账单请求书测试 (5/5)
| 测试用例 | 状态 | 原因 |
|---------|------|------|
| 查看请求书列表 | ❌ 失败 | 后端返回500错误 |
| 按状态筛选请求书 | ❌ 失败 | 后端返回500错误 |
| 查看请求书详情 | ❌ 失败 | 后端返回500错误 |
| 生成请求书 | ❌ 失败 | 后端返回500错误 |
| 标记请求书为已付款 | ❌ 失败 | 后端返回500错误 |

---

## 根本原因分析

### 核心 Bug：UUID 空字符串验证失败

**错误信息：**
```
QueryFailedError: invalid input syntax for type uuid: ""
```

**问题复现：**
1. 登录系统后访问员工管理页面
2. 点击"新增员工"按钮
3. 填写表单并点击确认
4. 前端发送 POST 请求到 `/api/staff`

**请求 Payload（有问题）：**
```json
{
  "id": "",
  "username": "testuser5555",
  "password": "Test123!",
  "name": "测试用户",
  "phone": "",
  "role": "super_admin"
}
```

**问题分析：**
- `id: ""` - 空字符串不能作为 PostgreSQL UUID 类型
- `phone: ""` - 空字符串可能也有问题
- 后端没有对空字符串进行验证/转换

**影响范围：**
- 员工创建/编辑 (POST /api/staff)
- 客户创建/编辑 (POST /api/customers)
- 商品创建/编辑 (POST /api/products)
- 订单创建 (POST /api/orders)
- 账单创建 (POST /api/invoices)

---

## 测试环境信息

### 服务器信息
- **服务器地址：** 43.153.155.76
- **后端 API：** http://43.153.155.76:3001
- **前端地址：** http://43.153.155.76

### Docker 容器状态
```
japan-sales-web        Up 2 hours
japan-sales-backend    Up 2 hours
japan-sales-pgadmin    Up 2 hours
japan-sales-postgres   Up 2 hours (healthy)
```

### 测试文件位置
- **本地：** `C:\Users\Administrator\japan-purchase-sales\tests\e2e\`
- **远程：** `/opt/e2e-tests/`

### 已验证可正常访问的页面
- ✅ 登录页 `/login`
- ✅ 仪表板 `/dashboard`
- ✅ 订单列表 `/order`
- ✅ 员工列表 `/staff`

---

## 修复建议

### 方案 1：前端修复（推荐）
在表单提交前移除空字符串的 `id` 和 `phone` 字段：

```javascript
// 在发送请求前处理
const submitData = {
  username: form.username,
  password: form.password,
  name: form.name,
  role: form.role,
};
if (form.phone) submitData.phone = form.phone;
// 不要发送 id 字段（让后端自动生成）
```

### 方案 2：后端修复
在实体保存前过滤空字符串：

```typescript
// StaffService.create()
if (data.id === '') delete data.id;
if (data.phone === '') delete data.phone;
```

---

## 后续步骤

1. **修复空字符串 UUID bug**
   - 修复前端表单提交逻辑
   - 或修复后端数据验证

2. **重新运行完整测试套件**
   ```bash
   cd /opt/e2e-tests
   npx playwright test --reporter=list
   ```

3. **补充缺失的测试数据**
   - 创建测试用客户
   - 创建测试用商品
   - 创建测试用订单

---

## 测试执行命令

```bash
# 在远程服务器上运行
ssh -i ~/.ssh/id_rsa root@43.153.155.76
cd /opt/e2e-tests

# 运行所有测试
npx playwright test --reporter=list --timeout=60000

# 运行特定测试文件
npx playwright test auth.spec.ts --reporter=list

# 运行特定测试用例
npx playwright test --grep "登录成功" --reporter=list
```

---

**报告生成时间：** 2026-03-24
**报告生成工具：** Claude Code
