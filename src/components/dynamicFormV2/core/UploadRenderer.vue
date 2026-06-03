<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElUpload, ElIcon, ElButton } from 'element-plus'
import { UploadFilled, Download, Close, Loading } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import type { FormField } from '../types'
import { CONSTANTS, getToken, alert } from '@/utils'
import { formatFileSize, getFileTypeInfo } from '../utils/helpers'

interface Props {
  field: FormField
  modelValue?: any
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const uploadRef = ref<any>(null)

/* ── 上传配置 ── */
const uploadAction = computed(() => CONSTANTS.HTTP.BASEURL + '/file/uploadDynamicForm')
const uploadHeaders = computed(() => ({
  authorization: `${CONSTANTS.SYSTEM.TOKEN_TYPE} ${getToken()}`,
}))
const uploadLimit = computed(() => props.field.maxLength ?? undefined)

/* ── 从 modelValue 提取 fileId 列表 ── */
function extractFileIds(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) {
    if (val.length === 0) return []
    if (val[0]?.id) return val.map((it: any) => it.id)
    return val.filter((it: any) => typeof it === 'string')
  }
  if (typeof val === 'string') return [val]
  return []
}

/* ── 从 UploadFile 提取 fileId ── */
function extractFileIdFromUploadFile(file: UploadFile): string | undefined {
  const resp = file.response as any
  if (resp?.data?.id) return resp.data.id as string
  if (file.url) {
    const match = file.url.match(/[?&]fileId=([^&]+)/)
    if (match) return match[1]
  }
  return undefined
}

/* ── 根据 modelValue 构建 el-upload 的 file-list ── */
function buildUploadFileList(val: any): UploadFile[] {
  const list: UploadFile[] = []
  if (Array.isArray(val)) {
    if (val.length > 0 && val[0]?.id) {
      val.forEach((it: any, idx: number) => {
        list.push({
          name: it.filename || it.id,
          url: `${CONSTANTS.HTTP.BASEURL}/file/downloadDynamicForm?fileId=${it.id}`,
          uid: -(idx + 1),
          status: 'success',
          percentage: 100,
        } as UploadFile)
      })
    } else {
      val.forEach((it: any, idx: number) => {
        if (typeof it === 'string') {
          list.push({
            name: it,
            url: `${CONSTANTS.HTTP.BASEURL}/file/downloadDynamicForm?fileId=${it}`,
            uid: -(idx + 1),
            status: 'success',
            percentage: 100,
          } as UploadFile)
        }
      })
    }
  } else if (typeof val === 'string') {
    list.push({
      name: val,
      url: `${CONSTANTS.HTTP.BASEURL}/file/downloadDynamicForm?fileId=${val}`,
      uid: -1,
      status: 'success',
      percentage: 100,
    } as UploadFile)
  }
  return list
}

const uploadFileList = ref<UploadFile[]>([])

/* ── 同步 modelValue -> uploadFileList，避免循环覆盖 ── */
watch(() => props.modelValue, (val) => {
  const newIds = extractFileIds(val).sort().join(',')
  const currentIds = uploadFileList.value.map(extractFileIdFromUploadFile).filter(Boolean).sort().join(',')
  if (newIds !== currentIds) {
    uploadFileList.value = buildUploadFileList(val)
  }
}, { immediate: true })

/* ── 从 modelValue 获取文件元数据 ── */
function getFileMeta(file: UploadFile): any {
  const fileId = extractFileIdFromUploadFile(file)
  if (!fileId || !Array.isArray(props.modelValue)) return null
  return props.modelValue.find((it: any) => {
    if (typeof it === 'string') return it === fileId
    return it.id === fileId
  })
}

/* ── 上传成功 ── */
function onUploadSuccess(response: any, file: UploadFile) {
  const data = response?.data
  const fileId = data?.id
  if (!fileId) {
    alert('上传失败：未获取到文件ID', 'error')
    const idx = uploadFileList.value.findIndex(f => f.uid === file.uid)
    if (idx >= 0) uploadFileList.value.splice(idx, 1)
    return
  }
  const item = uploadFileList.value.find(f => f.uid === file.uid)
  if (item) {
    item.name = data?.filename || item.name
    item.url = `${CONSTANTS.HTTP.BASEURL}/file/downloadDynamicForm?fileId=${fileId}`
  }
  // 保留已有文件元数据，追加新文件
  const existing = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const normalized = existing.filter((it: any) => it.id !== fileId)
  normalized.push(data)
  emit('update:modelValue', normalized)
}

/* ── 移除文件 ── */
function onUploadRemove(file: UploadFile) {
  const removedId = extractFileIdFromUploadFile(file)
  if (!removedId) return
  const existing = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const filtered = existing.filter((it: any) => {
    if (typeof it === 'string') return it !== removedId
    return it.id !== removedId
  })
  emit('update:modelValue', filtered)
}

/* ── 手动删除 ── */
function handleFileRemove(file: UploadFile) {
  uploadRef.value?.handleRemove(file)
}

/* ── 上传失败 ── */
function onUploadError(_error: any, file: UploadFile) {
  alert(`文件 "${file.name}" 上传失败`, 'error')
  const idx = uploadFileList.value.findIndex(f => f.uid === file.uid)
  if (idx >= 0) uploadFileList.value.splice(idx, 1)
}

/* ── 超出限制 ── */
function onUploadExceed() {
  const limit = props.field.maxLength
  alert(`最多只能上传 ${limit ?? 1} 个文件`, 'warning')
}

/* ── 下载文件（携带鉴权） ── */
async function handleDownload(file: UploadFile) {
  const url = file.url
  if (!url) return
  try {
    const response = await fetch(url, {
      headers: { authorization: `${CONSTANTS.SYSTEM.TOKEN_TYPE} ${getToken()}` },
    })
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(downloadUrl)
  } catch {
    alert('文件下载失败', 'error')
  }
}
</script>

<template>
  <div class="upload-renderer">
    <ElUpload
      ref="uploadRef"
      v-model:file-list="uploadFileList"
      class="upload-renderer__uploader"
      drag
      :action="uploadAction"
      :headers="uploadHeaders"
      name="uploadFile"
      :limit="uploadLimit"
      :disabled="disabled"
      :on-success="onUploadSuccess"
      :on-remove="onUploadRemove"
      :on-error="onUploadError"
      :on-exceed="onUploadExceed"
      multiple
    >
      <div class="upload-renderer__trigger">
        <ElIcon class="upload-renderer__trigger-icon"><UploadFilled /></ElIcon>
        <div class="upload-renderer__trigger-text">
          拖拽文件到此处，或 <em>点击上传</em>
        </div>
        <div v-if="uploadLimit" class="upload-renderer__trigger-hint">
          最多可上传 {{ uploadLimit }} 个文件
        </div>
      </div>

      <template #file="{ file }">
        <div class="upload-renderer__file-card" :class="'is-' + file.status">
          <div
            class="upload-renderer__file-icon"
            :style="{
              backgroundColor: getFileTypeInfo(file.name).color + '1a',
              color: getFileTypeInfo(file.name).color,
            }"
          >
            <ElIcon>
              <component :is="getFileTypeInfo(file.name).icon" />
            </ElIcon>
          </div>
          <div class="upload-renderer__file-info">
            <div class="upload-renderer__file-name" :title="file.name" @click="file.url && handleDownload(file)">
              {{ file.name }}
            </div>
            <div class="upload-renderer__file-meta">
              <span v-if="getFileMeta(file)?.contentType" class="upload-renderer__meta-tag">
                {{ getFileMeta(file)?.contentType }}
              </span>
              <span v-if="getFileMeta(file)?.size" class="upload-renderer__meta-size">
                {{ formatFileSize(getFileMeta(file)?.size) }}
              </span>
              <span v-else-if="file.status === 'uploading'" class="upload-renderer__meta-uploading">
                上传中...
              </span>
            </div>
          </div>
          <div class="upload-renderer__file-actions">
            <template v-if="file.status === 'uploading'">
              <ElIcon class="is-loading"><Loading /></ElIcon>
            </template>
            <template v-else>
              <ElButton
                v-if="file.url"
                type="primary"
                link
                size="small"
                :icon="Download"
                @click.stop="handleDownload(file)"
              />
              <ElButton
                v-if="!disabled"
                type="danger"
                link
                size="small"
                :icon="Close"
                @click.stop="handleFileRemove(file)"
              />
            </template>
          </div>
        </div>
      </template>
    </ElUpload>
  </div>
</template>

<style scoped>
.upload-renderer {
  width: 100%;
}

.upload-renderer__uploader {
  width: 100%;
}

.upload-renderer__uploader :deep(.el-upload) {
  width: 100%;
}

.upload-renderer__uploader :deep(.el-upload-dragger) {
  width: 100%;
  padding: var(--df-space-md);
  border-color: var(--df-border);
  border-radius: var(--df-radius-md);
  background: var(--df-bg-card);
  transition: border-color var(--df-transition-fast), background var(--df-transition-fast);
}

.upload-renderer__uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--df-primary);
  background: var(--df-primary-light);
}

.upload-renderer__trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--df-space-xs);
}

.upload-renderer__trigger-icon {
  font-size: 32px;
  color: var(--df-text-tertiary);
  margin-bottom: var(--df-space-xs);
}

.upload-renderer__uploader :deep(.el-upload-dragger:hover) .upload-renderer__trigger-icon {
  color: var(--df-primary);
}

.upload-renderer__trigger-text {
  font-size: 14px;
  color: var(--df-text-secondary);
  line-height: 22px;
}

.upload-renderer__trigger-text em {
  color: var(--df-primary);
  font-style: normal;
  font-weight: 500;
}

.upload-renderer__trigger-hint {
  font-size: 12px;
  color: var(--df-text-tertiary);
  line-height: 18px;
}

/* 文件列表网格 */
.upload-renderer__uploader :deep(.el-upload-list) {
  margin-top: var(--df-space-sm);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--df-space-sm);
}

.upload-renderer__uploader :deep(.el-upload-list__item) {
  margin: 0;
  padding: 0;
  border: none;
  transition: none;
}

.upload-renderer__uploader :deep(.el-upload-list__item:hover) {
  background: transparent;
}

.upload-renderer__uploader :deep(.el-upload-list .el-icon--close) {
  display: none;
}

/* 文件卡片 */
.upload-renderer__file-card {
  display: flex;
  align-items: center;
  gap: var(--df-space-sm);
  padding: var(--df-space-sm);
  background: var(--df-bg-card);
  border: 1px solid var(--df-border);
  border-radius: var(--df-radius-md);
  transition: box-shadow var(--df-transition-fast), border-color var(--df-transition-fast);
  min-width: 0;
}

.upload-renderer__file-card:hover {
  border-color: var(--df-primary-lighter);
  box-shadow: var(--df-shadow-sm);
}

.upload-renderer__file-card.is-uploading {
  opacity: 0.75;
}

.upload-renderer__file-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
}

.upload-renderer__file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.upload-renderer__file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--df-text-primary);
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: color var(--df-transition-fast);
}

.upload-renderer__file-name:hover {
  color: var(--df-primary);
}

.upload-renderer__file-meta {
  display: flex;
  align-items: center;
  gap: var(--df-space-xs);
  flex-wrap: wrap;
}

.upload-renderer__meta-tag {
  font-size: 11px;
  color: var(--df-text-secondary);
  background: var(--df-bg-hover);
  padding: 1px 6px;
  border-radius: 999px;
  line-height: 1.4;
  white-space: nowrap;
}

.upload-renderer__meta-size {
  font-size: 11px;
  color: var(--df-text-tertiary);
  white-space: nowrap;
}

.upload-renderer__meta-uploading {
  font-size: 11px;
  color: var(--df-primary);
  white-space: nowrap;
}

.upload-renderer__file-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--df-transition-fast);
}

.upload-renderer__file-card:hover .upload-renderer__file-actions {
  opacity: 1;
}

/* 禁用状态 */
.upload-renderer__uploader.is-disabled :deep(.el-upload-dragger) {
  cursor: not-allowed;
  border-color: var(--df-border);
  background: var(--df-bg-card);
  opacity: 0.6;
}

.upload-renderer__uploader.is-disabled .upload-renderer__file-card {
  cursor: default;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .upload-renderer__uploader :deep(.el-upload-list) {
    grid-template-columns: 1fr;
  }
}
</style>
