# 流程实例页 API 适配

## 概述

后端 `/processInstance/queryPage` 接口更新，新增 type=4(已办) 和 type=5(我发起的全部)，新增筛选字段 processDefinitionId/processStatus/startTime/endTime，各 type 支持的筛选字段不同。前端需适配。

## 变更清单

### 1. Tab 结构调整

当前4个tab → 5个主tab + 子tab：

| 主Tab | type | 说明 |
|-------|------|------|
| 待办 | 2 | 需要我审批的任务 |
| 待认领 | 3 | 可由我认领的任务 |
| 已办 | 4 | 我处理过的任务 |
| 我发起的 | 1/5 | 子Tab: 进行中(1) / 全部(5) |
| 草稿箱 | 0 | 未提交的草稿 |

### 2. queryParam 扩展

```js
const queryParam = ref({
  type: '2',
  search: '',
  processDefinitionId: null as number | null,
  processStatus: null as string | null,
  startTime: null as string | null,
  endTime: null as string | null,
})
```

### 3. 筛选字段条件显示

根据API文档各type支持情况：

| 字段 | 0 | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|---|
| search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| processDefinitionId | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| processStatus | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| startTime/endTime | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |

- processStatus 和时间筛选在 type=2/3 时隐藏
- 已办(type=4)时间筛选的是任务处理时间，默认查近6个月

### 4. onStartSuccess 调整

发起成功后切到"我发起的-进行中"(type=1)，而非原来的type=1全部。

### 5. tabCounts 扩展

添加 type=4 和 type=5 的计数。

### 6. emptyDesc 补充

添加 type=4(已办) 和 type=5(我发起的全部) 的空状态文案。
