# 动态表单 - 文件上传/下载接口

> 作者：小猫会发光
> 日期：2026-05-14

## 基本信息

| 项 | 值 |
| --- | --- |
| 上传接口路径 | `/file/uploadDynamicForm` |
| 下载接口路径 | `/file/downloadDynamicForm` |
| 上传请求方式 | `POST` |
| 下载请求方式 | `GET` |
| 上传 Content-Type | `multipart/form-data` |
| Service | `FileService#uploadDynamicForm` / `FileService#downloadDynamicForm` |

> 动态表单 `UPLOAD` 类型字段的文件上传与下载。上传后返回 `FileInfo.id`，前端将该 `fileId` 作为表单 `UPLOAD` 字段的 `val` 提交。

---

## 上传接口

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| uploadFile | MultipartFile | 是 | 文件 |

### 请求示例

```http
POST /file/uploadDynamicForm
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="uploadFile"; filename="report.pdf"
Content-Type: application/pdf

<binary data>
------WebKitFormBoundary--
```

### 响应数据（HttpResult<FileInfo>）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 文件唯一ID，提交表单时作为 `UPLOAD` 字段的 `val` |
| filename | String | 原始文件名 |
| contentType | String | MIME 类型 |
| type | String | `FILE_TYPE_1`（文件） |
| parentId | String | `/动态表单/`（固定值，标识为动态表单文件） |
| size | long | 文件大小（字节） |
| userId | Integer | 上传用户ID |
| createTime | LocalDateTime | 创建时间 |

### 响应示例

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "id": "abc123def456",
    "filename": "report.pdf",
    "contentType": "application/pdf",
    "type": "1",
    "parentId": "/动态表单/",
    "size": 204800,
    "userId": 1,
    "createTime": "2026-05-14 10:30:00"
  }
}
```

### 业务流程

1. 校验文件大小（非管理员限制 100MB）
2. 生成 `fileId`
3. 写入 `file_info` 表，`parentId = "/动态表单/"`
4. 异步上传至 MinIO，路径 `/动态表单/{userId}/{fileId}`
5. 返回 `FileInfo`

---

## 下载接口

### 请求参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| fileId | String | 是 | 文件唯一ID |

### 请求示例

```http
GET /file/downloadDynamicForm?fileId=abc123def456
```

### 响应数据

直接输出文件流，Content-Type 为文件原始 MIME 类型，支持 Range 断点续传。

### 业务流程

1. 根据 `fileId` 查询 `file_info`
2. 不存在或 `parentId != "/动态表单/"` → 返回 404
3. 从 MinIO 读取文件流并输出

---

## 异常情况

| 触发条件 | 异常/响应 |
| --- | --- |
| 文件超过 100MB 且非管理员 | `DTO.error("只有尊贵的VIP才能上传超过100M的文件...")` |
| `fileId` 不存在 | HTTP 404 |
| `fileId` 不是动态表单文件 | HTTP 404 |
| 未登录 | 统一认证拦截 |