<template>
  <div class="process-instance-start">
    <!-- 流程定义概览 -->
    <div v-loading="loadingStartInfo" class="def-summary" v-if="!startInfoError">
      <template v-if="displayDef">
        <div class="summary-icon">
          <el-icon>
            <Document />
          </el-icon>
        </div>
        <div class="summary-main">
          <div class="summary-title">{{ displayDef.processName || displayDef.processKey }}</div>
          <div class="summary-meta">
            <span v-if="displayDef.processCategory" class="meta-item">
              <el-icon>
                <Folder />
              </el-icon>
              {{ displayDef.processCategory }}
            </span>
            <span v-if="displayDef.version" class="meta-item">
              <el-icon>
                <CollectionTag />
              </el-icon>
              v{{ displayDef.version }}
            </span>
            <span v-if="displayDef.processKey" class="meta-item mono">
              <el-icon>
                <Link />
              </el-icon>
              {{ displayDef.processKey }}
            </span>
          </div>
          <div v-if="displayDef.processDescription" class="summary-desc">
            {{ displayDef.processDescription }}
          </div>
        </div>
      </template>
    </div>
    <div v-if="startInfoError" class="error-placeholder">
      <el-icon class="error-icon">
        <Warning />
      </el-icon>
      <p>加载流程信息失败</p>
      <span>请稍后重试或联系管理员</span>
    </div>

    <!-- 流程标题 -->
    <div class="title-input-section">
      <el-input v-model="formTitle" placeholder="请输入流程标题（可选）" size="large" clearable maxlength="100" show-word-limit>
        <template #prefix>
          <el-icon>
            <Edit />
          </el-icon>
        </template>
      </el-input>
    </div>

    <!-- 草稿基础信息 -->
    <div v-if="draftInfo" class="draft-info">
      <div class="info-header">
        <el-icon>
          <DocumentChecked />
        </el-icon>
        <span>草稿信息</span>
      </div>
      <div class="info-body">
        <div class="info-item">
          <span class="info-label">草稿 ID</span>
          <span class="info-value">{{ draftInfo.id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">标题</span>
          <span class="info-value">{{ draftInfo.title || '-' }}</span>
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

    <!-- 表单区 -->
    <template v-if="hasForm">
      <!-- 全局表单（继承） -->
      <div v-if="globalForm" class="form-section">
        <div class="form-section-header" @click="globalCollapsed = !globalCollapsed">
          <div class="header-left">
            <el-icon>
              <Collection />
            </el-icon>
            <span>{{ globalForm.name || '全局表单' }}</span>
          </div>
          <el-icon class="collapse-icon" :class="{ collapsed: globalCollapsed }">
            <ArrowDown />
          </el-icon>
        </div>
        <FormMaker v-show="!globalCollapsed" ref="globalFormRef" type="edit" v-model="globalFormData"
          :fields="globalForm.fields" :groups="globalForm.groups" :linkage-rules="globalForm.linkageRules" />
      </div>

      <!-- 节点表单 -->
      <div v-if="nodeForm" class="form-section">
        <div class="form-section-header" @click="nodeCollapsed = !nodeCollapsed">
          <div class="header-left">
            <el-icon>
              <Document />
            </el-icon>
            <span>{{ nodeForm.name || '表单' }}</span>
          </div>
          <el-icon class="collapse-icon" :class="{ collapsed: nodeCollapsed }">
            <ArrowDown />
          </el-icon>
        </div>
        <FormMaker v-show="!nodeCollapsed" ref="nodeFormRef" type="edit" v-model="nodeFormData"
          :fields="nodeForm.fields" :groups="nodeForm.groups" :linkage-rules="nodeForm.linkageRules" />
      </div>
    </template>

    <!-- 无表单占位 -->
    <div v-else-if="!loadingStartInfo && !startInfoError" class="form-placeholder">
      <el-icon class="placeholder-icon">
        <Edit />
      </el-icon>
      <p>该流程未配置表单</p>
      <span>流程发起后直接进入审批环节</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, DocumentChecked, Edit, Folder, CollectionTag, Link, Warning, Collection, ArrowDown } from '@element-plus/icons-vue'
import { http, alert } from '@/utils'
import { computed, ref } from 'vue'
import FormMaker from '@/components/dynamicForm/FormMaker.vue'
import { flattenGroups } from '@/components/dynamicForm/types'

const props = defineProps<{
  def: any | null
}>()

const emit = defineEmits<{
  (e: 'success', instance: any): void
  (e: 'saved'): void
}>()

const startInfo = ref<any | null>(null)
const loadingStartInfo = ref(false)
const startInfoError = ref(false)

const displayDef = computed(() => startInfo.value)

// 表单数据
const nodeFormData = ref<Record<string, any>>({})
const globalFormData = ref<Record<string, any>>({})
const nodeFormRef = ref<InstanceType<typeof FormMaker> | null>(null)
const globalFormRef = ref<InstanceType<typeof FormMaker> | null>(null)

// 表单折叠状态
const globalCollapsed = ref(false)
const nodeCollapsed = ref(false)

const nodeForm = computed(() => startInfo.value?.startForm?.nodeForm)
const globalForm = computed(() => startInfo.value?.startForm?.globalForm)
const hasForm = computed(() => !!nodeForm.value || !!globalForm.value)

// 处理 permission 字段
const applyPermission = (field: any): any => {
  const f = { ...field }
  switch (f.permission) {
    case 'HIDDEN':
      f._hidden = true
      break
    case 'READONLY':
      // disabled 在 FormMaker 渲染层通过 props 传入，这里标记
      f._readonly = true
      break
    case 'REQUIRED':
      f.required = '1'
      break
    case 'VISIBLE':
    default:
      break
  }
  delete f.permission
  return f
}

// 从表单字段初始化数据对象
const initFormData = (fields: any[]): Record<string, any> => {
  const data: Record<string, any> = {}
  const walk = (list: any[]) => {
    list.forEach((f: any) => {
      if (f._hidden) return
      data[f.fieldId] = f.value ?? f.defaultValue ?? null
    })
  }
  // 未分组字段
  walk(fields || [])
  // 分组字段
  fields?.forEach?.((f: any) => {
    if (f.groupId && f.fields) walk(f.fields)
  })
  return data
}

const initForm = (form: any): Record<string, any> => {
  if (!form) return {}
  form.fields = (form.fields || []).map(applyPermission).filter((f: any) => !f._hidden)
  form.groups = (form.groups || []).map((g: any) => ({
    ...g,
    fields: (g.fields || []).map(applyPermission).filter((f: any) => !f._hidden)
  }))
  form.fields = flattenGroups(form.groups).concat(form.fields)
  return initFormData(form.fields)
}

const loadStartInfo = async (processDefinitionId: string | number) => {
  if (!processDefinitionId) return
  loadingStartInfo.value = true
  startInfoError.value = false
  try {
    const result = await http.post('/processDefinition/startInfo', undefined, {
      params: { processDefinitionId },
    })
    startInfo.value = result ?? null

    // 初始化表单数据：处理未分组和分组字段的权限，并扁平化分组字段到 fields
    if (nodeForm.value) nodeFormData.value = initForm(nodeForm.value)
    if (globalForm.value) globalFormData.value = initForm(globalForm.value)
  } catch {
    startInfoError.value = true
    startInfo.value = null
  } finally {
    loadingStartInfo.value = false
  }
}

const submit = async (): Promise<boolean> => {
  if (!props.def?.id) {
    alert('请选择要发起的流程定义', 'warning')
    return false
  }

  // 校验表单
  const nodeValid = nodeFormRef.value ? await nodeFormRef.value.verify() : true
  const globalValid = globalFormRef.value ? await globalFormRef.value.verify() : true
  if (!nodeValid || !globalValid) {
    alert('请检查表单填写是否正确', 'warning')
    return false
  }

  const result = await http.post('/processInstance/start', {
    processDefinitionId: props.def.id,
    processInstanceId: draftId.value,
    title: formTitle.value || undefined,
    nodeFormData: nodeFormData.value,
    globalFormData: globalFormData.value,
  }, { raw: true })
  if (result.code === 200) {
    alert(result.msg || '发起成功', 'success')
    emit('success', result.data)
    return true
  }
  return false
}

const draftId = ref<number | null>(null)
const draftInfo = ref<any | null>(null)
const formTitle = ref('')

const loadDraft = async (id: number | string) => {
  if (!id) return
  loadingStartInfo.value = true
  startInfoError.value = false
  try {
    draftInfo.value = await http.post('/processInstance/info', undefined, {
      params: { id },
    })
    draftId.value = draftInfo.value?.id ?? null
    formTitle.value = draftInfo.value?.title ?? ''

    // 把 taskForm 映射为 startForm 结构，复用表单渲染逻辑
    const taskForm = draftInfo.value?.taskForm
    if (taskForm) {
      startInfo.value = {
        ...draftInfo.value,
        processName: draftInfo.value?.processDefinitionName,
        startForm: taskForm,
      }
      if (nodeForm.value) nodeFormData.value = initForm(nodeForm.value)
      if (globalForm.value) globalFormData.value = initForm(globalForm.value)
    }
  } catch {
    startInfoError.value = true
    startInfo.value = null
  } finally {
    loadingStartInfo.value = false
  }
}

const saveDraft = async (): Promise<boolean> => {
  if (!props.def?.id) {
    alert('请选择要保存草稿的流程定义', 'warning')
    return false
  }
  const result = await http.post('/processInstance/saveDraft', {
    ...(draftId.value ? { processInstanceId: draftId.value } : {}),
    processDefinitionId: props.def.id,
    title: formTitle.value || undefined,
    nodeFormData: nodeFormData.value,
    globalFormData: globalFormData.value,
  }, { raw: true })
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
  startInfo.value = null
  nodeFormData.value = {}
  globalFormData.value = {}
  draftId.value = null
  draftInfo.value = null
  formTitle.value = ''
}

defineExpose({ submit, saveDraft, loadDraft, loadStartInfo, reset })
</script>

<style scoped lang="scss">
.process-instance-start {
  .title-input-section {
    margin-bottom: 20px;

    :deep(.el-input__wrapper) {
      border-radius: var(--radius-lg);
      padding-left: 12px;
    }

    .el-icon {
      color: var(--text-secondary);
      margin-right: 4px;
    }
  }

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

  .form-section {
    margin-bottom: 24px;

    .form-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 16px;
      font-size: var(--fs-md);
      font-weight: var(--fw-semibold);
      color: var(--text-primary);
      padding: 10px 14px;
      background: var(--bg-overlay);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      cursor: pointer;
      user-select: none;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          font-size: 18px;
          color: var(--brand-primary);
        }
      }

      .collapse-icon {
        font-size: 16px;
        color: var(--text-secondary);
        transition: transform 0.2s ease;

        &.collapsed {
          transform: rotate(-90deg);
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

  .error-placeholder {
    border: 1px dashed var(--el-color-danger-light-5);
    border-radius: var(--radius-lg);
    background: var(--el-color-danger-light-9);
    padding: 48px 20px;
    text-align: center;
    color: var(--el-color-danger);
    margin-bottom: 20px;

    .error-icon {
      font-size: 36px;
      margin-bottom: 12px;
    }

    p {
      margin: 0 0 6px;
      font-size: var(--fs-lg);
      font-weight: var(--fw-semibold);
    }

    span {
      font-size: var(--fs-sm);
      opacity: 0.8;
    }
  }
}
</style>
