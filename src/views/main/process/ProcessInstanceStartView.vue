<template>
  <div class="process-instance-start">
    <!-- 流程定义概览 -->
    <div v-if="def" class="def-summary">
      <div class="summary-icon">
        <el-icon>
          <Document />
        </el-icon>
      </div>
      <div class="summary-main">
        <div class="summary-title">{{ def.processName || def.processKey }}</div>
        <div class="summary-meta">
          <span v-if="def.processCategory" class="meta-item">
            <el-icon>
              <Folder />
            </el-icon>
            {{ def.processCategory }}
          </span>
          <span v-if="def.version" class="meta-item">
            <el-icon>
              <CollectionTag />
            </el-icon>
            v{{ def.version }}
          </span>
          <span v-if="def.processKey" class="meta-item mono">
            <el-icon>
              <Link />
            </el-icon>
            {{ def.processKey }}
          </span>
        </div>
        <div v-if="def.processDescription" class="summary-desc">
          {{ def.processDescription }}
        </div>
      </div>
    </div>

    <!-- 草稿基础信息 -->
    <div v-if="draftInfo" class="draft-info">
      <div class="info-header">
        <el-icon><DocumentChecked /></el-icon>
        <span>草稿信息</span>
      </div>
      <div class="info-body">
        <div class="info-item">
          <span class="info-label">草稿 ID</span>
          <span class="info-value">{{ draftInfo.id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">状态</span>
          <el-tag size="small" type="info">草稿</el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ draftInfo.createTime || '-' }}</span>
        </div>
        <div v-if="draftInfo.updateTime && draftInfo.updateTime !== draftInfo.createTime" class="info-item">
          <span class="info-label">更新时间</span>
          <span class="info-value">{{ draftInfo.updateTime }}</span>
        </div>
      </div>
    </div>

    <!-- 表单区：占位待接入 -->
    <div class="form-placeholder">
      <el-icon class="placeholder-icon">
        <Edit />
      </el-icon>
      <p>表单内容待接入</p>
      <span>后续在此处填入用户表单</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, DocumentChecked, Edit, Folder, CollectionTag, Link } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import { ref } from 'vue'

const props = defineProps<{
  def: any | null
}>()

const emit = defineEmits<{
  (e: 'success', instance: any): void
  (e: 'saved'): void
}>()

const submit = async (): Promise<boolean> => {
  if (!props.def?.id) {
    alert('请选择要发起的流程定义', 'warning')
    return false
  }
  const result = await http.post('/processInstance/start', undefined, {
    params: { processDefinitionId: props.def.id },
    raw: true,
  })
  if (result.code === 200) {
    alert(result.msg || '发起成功', 'success')
    emit('success', result.data)
    return true
  }
  return false
}

const draftId = ref<number | null>(null)
const draftInfo = ref<any | null>(null)

const loadDraft = async (id: number | string) => {
  if (!id) return
  draftInfo.value = await http.post('/processInstance/info', undefined, {
    params: { id },
  })
  draftId.value = draftInfo.value?.id ?? null
}

const saveDraft = async (): Promise<boolean> => {
  if (!props.def?.id) {
    alert('请选择要保存草稿的流程定义', 'warning')
    return false
  }
  const result = await http.post('/processInstance/saveDraft', undefined, {
    params: {
      ...(draftId.value ? { id: draftId.value } : {}),
      processDefinitionId: props.def.id,
    },
    raw: true,
  })
  if (result.code === 200) {
    alert(result.msg || '保存草稿成功', 'success')
    draftId.value = result.data?.id ?? null
    await loadDraft(draftId.value!)
    emit('saved')
    return true
  }
  return false
}

const reset = () => {
  draftId.value = null
  draftInfo.value = null
}

defineExpose({ submit, saveDraft, loadDraft, reset })
</script>

<style scoped lang="scss">
.process-instance-start {
  .def-summary {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    border-radius: var(--radius-lg);
    background: var(--brand-gradient-soft);
    border: 1px solid var(--border-light);
    margin-bottom: 20px;

    .summary-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--brand-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .el-icon {
        font-size: 22px;
        color: var(--text-on-brand);
      }
    }

    .summary-main {
      flex: 1;
      min-width: 0;

      .summary-title {
        font-size: var(--fs-lg);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
        margin-bottom: 6px;
        word-break: break-all;
      }

      .summary-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 16px;
        font-size: var(--fs-sm);
        color: var(--text-secondary);
        margin-bottom: 8px;

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 13px;
          }

          &.mono {
            font-family: 'Courier New', monospace;
          }
        }
      }

      .summary-desc {
        font-size: var(--fs-sm);
        color: var(--text-secondary);
        line-height: 1.5;
        word-break: break-all;
      }
    }
  }

  .draft-info {
    background: var(--bg-container);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px;
    margin-bottom: 20px;

    .info-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: var(--fs-md);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);

      .el-icon {
        font-size: 18px;
        color: var(--brand-primary);
      }
    }

    .info-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 16px;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .info-label {
          font-size: var(--fs-sm);
          color: var(--text-secondary);
        }

        .info-value {
          font-size: var(--fs-md);
          color: var(--text-primary);
          word-break: break-all;
        }
      }
    }
  }

  .form-placeholder {
    border: 1px dashed var(--border-light);
    border-radius: var(--radius-lg);
    background: var(--bg-overlay);
    padding: 48px 20px;
    text-align: center;
    color: var(--text-secondary);

    .placeholder-icon {
      font-size: 36px;
      color: var(--brand-primary);
      margin-bottom: 12px;
    }

    p {
      margin: 0 0 6px;
      font-size: var(--fs-lg);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
    }

    span {
      font-size: var(--fs-sm);
    }
  }
}
</style>
