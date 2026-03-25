# E2E 测试报告总结

## 测试结果

| 项目 | 结果 |
|------|------|
| 总测试数 | 28 |
| 通过 | 4 |
| 失败 | 24 |
| 通过率 | 14.3% |

## 通过的测试 (4)

- ✅ super_admin 登录成功
- ✅ admin 登录成功
- ✅ sales 登录成功
- ✅ 无效凭据登录失败

## 阻塞问题

**根本原因：** 前端表单提交时发送 `{"id":""}` 导致后端 UUID 验证失败

**错误信息：**
```
QueryFailedError: invalid input syntax for type uuid: ""
```

**请求内容：**
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

## 修复建议

1. **前端修复**：在表单提交前移除空字符串的 `id` 字段
2. **后端修复**：在实体保存前过滤空字符串 UUID

## 测试文件

- 报告位置：`tests/e2e/reports/2026-03-24-e2e-test-report.md`
- 测试代码：`/opt/e2e-tests/`
