<template>
  <el-dialog
    v-model="dialog.open"
    title="发起流程"
    width="max(60vw, min(1400px, 90vw))"
    destroy-on-close
    :close-on-click-modal="false"
    class="create-dialog"
    @open="queryDeployList"
  >
    <div class="create-body" v-loading="dialog.loading" element-loading-text="加载中...">
      <div class="create-toolbar">
        <el-input v-model="dialog.search" placeholder="搜索流程名称、分类、描述..." size="large" clearable
          class="create-search">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button size="large" @click="queryDeployList">
          <el-icon><Refresh /></el-icon>
          <span>刷新</span>
        </el-button>
      </div>

      <div v-if="filteredList.length > 0" class="def-grid">
        <div v-for="def in filteredList" :key="def.id" class="def-card" @click="handleSelect(def)">
          <div class="def-icon" :style="{ background: getIconBg(def) }">
            <el-icon><Document /></el-icon>
          </div>
          <div class="def-main">
            <div class="def-title-row">
              <span class="def-title">{{ def.processName || '未命名流程' }}</span>
              <el-tag v-if="def.processCategory" size="small" effect="plain" round>
                {{ def.processCategory }}
              </el-tag>
            </div>
            <p v-if="def.processDescription" class="def-desc">
              {{ def.processDescription }}
            </p>
            <div class="def-meta">
              <span class="meta-item">
                <el-icon><Link /></el-icon>
                v{{ def.version || '1' }}
              </span>
              <span class="meta-item">
                <el-icon><UserFilled /></el-icon>
                {{ def.createByName || def.createBy || '-' }}
              </span>
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ def.createTime || '-' }}
              </span>
            </div>
          </div>
          <div class="def-action">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <div v-else-if="!dialog.loading" class="empty-state">
        <div class="empty-icon">
          <el-icon><DocumentDelete /></el-icon>
        </div>
        <h3>{{ dialog.search ? '没有匹配的流程' : '暂无可发起的流程' }}</h3>
        <p>{{ dialog.search ? '换个关键词试试吧' : '请联系管理员发布流程定义' }}</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Document, Search, Refresh, Link, UserFilled, Clock, ArrowRight, DocumentDelete } from '@element-plus/icons-vue'
import { http } from '@/utils'

const emit = defineEmits<{
  (e: 'select', def: any): void
}>()

const dialog = ref<{
  open: boolean
  loading: boolean
  search: string
  list: any[]
}>({
  open: false,
  loading: false,
  search: '',
  list: [],
})

const open = () => {
  dialog.value.open = true
  dialog.value.search = ''
}

const queryDeployList = async () => {
  dialog.value.loading = true
  try {
    const result = await http.post('/processDefinition/deployList')
    dialog.value.list = result ?? []
  } finally {
    dialog.value.loading = false
  }
}

const filteredList = computed(() => {
  const kw = dialog.value.search.trim().toLowerCase()
  if (!kw) return dialog.value.list
  return dialog.value.list.filter(d =>
    [d.processName, d.processCategory, d.processDescription, d.processKey]
      .filter(Boolean)
      .some((s: string) => String(s).toLowerCase().includes(kw))
  )
})

const ICON_PALETTE = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
]

const getIconBg = (item: any) => {
  const id = Number(item?.id ?? 0)
  return ICON_PALETTE[Math.abs(id) % ICON_PALETTE.length]
}

const handleSelect = (def: any) => {
  dialog.value.open = false
  emit('select', def)
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.create-dialog {
  :deep(.el-dialog__header) {
    background: var(--brand-gradient);
    margin: 0;
    padding: 18px 24px;

    .el-dialog__title {
      color: var(--text-on-brand);
      font-weight: var(--fw-semibold);
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: var(--text-on-brand);
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.create-body {
  .create-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    .create-search {
      flex: 1;
    }
  }

  .def-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .def-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    background: var(--bg-overlay);
    cursor: pointer;
    transition: transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out);

    &:hover {
      transform: scale(1.01);
      border-color: var(--brand-primary);
      box-shadow: var(--shadow-md);

      .def-action .el-icon {
        color: var(--brand-primary);
      }
    }

    .def-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .el-icon {
        font-size: 22px;
        color: #fff;
      }
    }

    .def-main {
      flex: 1;
      min-width: 0;

      .def-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        flex-wrap: wrap;

        .def-title {
          font-size: var(--fs-md);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
      }

      .def-desc {
        margin: 0 0 8px;
        font-size: var(--fs-sm);
        color: var(--text-secondary);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .def-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: var(--fs-sm);
        color: var(--text-secondary);

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 13px;
          }
        }
      }
    }

    .def-action {
      align-self: center;
      flex-shrink: 0;

      .el-icon {
        font-size: 18px;
        color: var(--text-secondary);
        transition: color var(--duration-normal) var(--ease-out);
      }
    }
  }

  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: var(--text-secondary);

    .empty-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 12px;
      border-radius: 50%;
      background: var(--bg-overlay);
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 32px;
        color: var(--text-secondary);
      }
    }

    h3 {
      margin: 0 0 6px;
      font-size: var(--fs-lg);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--fs-md);
    }
  }
}

@media (max-width: 768px) {
  .create-body .def-grid {
    grid-template-columns: 1fr;
  }
}
</style>
