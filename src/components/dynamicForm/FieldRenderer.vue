<template>
    <el-input v-if="field.type === 'INPUT'" :model-value="modelValue" @update:model-value="onUpdate"
        :placeholder="field.placeholder" :maxlength="field.maxLength" :minlength="field.minLength" :disabled="disabled"
        clearable style="width: 100%;" />

    <el-input-number v-else-if="field.type === 'NUMBER'" :model-value="modelValue" @update:model-value="onUpdate"
        :placeholder="field.placeholder" :min="field.min ?? -Infinity" :max="field.max ?? Infinity" :disabled="disabled"
        style="width: 100%;" />

    <el-input v-else-if="field.type === 'TEXTAREA'" :model-value="modelValue" @update:model-value="onUpdate"
        type="textarea" :autosize="{ minRows: field.min ?? 2, maxRows: field.max ?? 4 }"
        :placeholder="field.placeholder" :minlength="field.minLength" :maxlength="field.maxLength" :disabled="disabled"
        style="width: 100%;" />

    <el-rate v-else-if="field.type === 'RATE'" :model-value="modelValue" @update:model-value="onUpdate"
        :max="field.max || 5" :disabled="disabled" />

    <el-select v-else-if="field.type === 'SELECT'" :model-value="modelValue" @update:model-value="onUpdate"
        :placeholder="field.placeholder" :disabled="disabled" clearable style="width: 100%;">
        <el-option v-for="item in field.options || []" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>

    <el-select v-else-if="field.type === 'MULTISELECT'" :model-value="modelValue" @update:model-value="onUpdate"
        :placeholder="field.placeholder" :disabled="disabled" clearable multiple style="width: 100%;">
        <el-option v-for="item in field.options || []" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>

    <el-radio-group v-else-if="field.type === 'RADIO'" :model-value="modelValue" @update:model-value="onUpdate"
        :disabled="disabled" style="width: 100%;">
        <el-radio v-for="item in field.options || []" :key="item.value" :value="item.value">
            {{ item.label }}
        </el-radio>
    </el-radio-group>

    <el-checkbox-group v-else-if="field.type === 'CHECKBOX'" :model-value="modelValue" @update:model-value="onUpdate"
        :disabled="disabled" :min="field.min" :max="field.max" style="width: 100%;">
        <el-checkbox v-for="item in field.options || []" :key="item.value" :value="item.value">
            {{ item.label }}
        </el-checkbox>
    </el-checkbox-group>

    <el-cascader v-else-if="field.type === 'CASCADER'" :model-value="modelValue" @update:model-value="onUpdate"
        :options="field.options" :placeholder="field.placeholder" :disabled="disabled" :props="{ multiple: false }"
        style="width: 100%;" />

    <el-cascader v-else-if="field.type === 'MULTICASCADER'" :model-value="modelValue" @update:model-value="onUpdate"
        :options="field.options" :placeholder="field.placeholder" :disabled="disabled" :props="{ multiple: true }"
        style="width: 100%;" />

    <el-switch v-else-if="field.type === 'SWITCH'" :model-value="modelValue" @update:model-value="onUpdate"
        :disabled="disabled" />

    <el-color-picker v-else-if="field.type === 'COLOR'" :model-value="modelValue" @update:model-value="onUpdate"
        :disabled="disabled" />

    <el-slider v-else-if="field.type === 'SLIDER'" :model-value="modelValue" @update:model-value="onUpdate"
        :min="field.min ?? 0" :max="field.max ?? 100" :disabled="disabled" :show-input="!disabled" show-stops
        show-tooltip style="margin: 0 12px;" />

    <el-date-picker v-else-if="field.type === 'DATE'" :model-value="modelValue" @update:model-value="onUpdate"
        type="date" :placeholder="field.placeholder" :disabled="disabled" value-format="YYYY-MM-DD"
        style="width: 100%;" />

    <el-date-picker v-else-if="field.type === 'DATETIME'" :model-value="modelValue" @update:model-value="onUpdate"
        type="datetime" :placeholder="field.placeholder" :disabled="disabled" value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 100%;" />

    <el-time-picker v-else-if="field.type === 'TIME'" :model-value="modelValue" @update:model-value="onUpdate"
        :placeholder="field.placeholder" :disabled="disabled" value-format="HH:mm:ss" style="width: 100%;" />

    <el-date-picker v-else-if="field.type === 'DATERANGE'" :model-value="modelValue" @update:model-value="onUpdate"
        type="daterange" unlink-panels range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
        :disabled="disabled" value-format="YYYY-MM-DD" style="width: 100%;" />

    <el-upload v-else-if="field.type === 'UPLOAD'" ref="uploadRef" v-model:file-list="uploadFileList"
        :action="uploadAction" :headers="uploadHeaders" name="uploadFile" :disabled="disabled"
        :limit="field.maxLength ?? undefined" :on-success="onUploadSuccess" :on-remove="onUploadRemove"
        :on-error="onUploadError" :on-exceed="onUploadExceed" multiple class="dynamic-form-upload" drag>
        <div class="upload-trigger-area">
            <el-icon class="upload-trigger-icon">
                <Upload />
            </el-icon>
            <div class="upload-trigger-text">
                <span class="upload-trigger-primary">点击或拖拽文件到此处上传</span>
                <span v-if="field.maxLength" class="upload-trigger-hint">最多可上传 {{ field.maxLength }} 个文件</span>
            </div>
        </div>
        <template #file="{ file }">
            <div class="upload-file-card" :class="'is-' + file.status">
                <div class="file-card-icon" :class="'type-' + getFileCategory(file.name)">
                    <el-icon>
                        <component :is="fileTypeIcons[getFileCategory(file.name)] || Files" />
                    </el-icon>
                </div>
                <div class="file-card-body">
                    <div class="file-card-name" :title="file.name"
                        @click="file.url && downloadFile(file.url, file.name)">
                        {{ file.name }}
                    </div>
                    <div class="file-card-meta">
                        <span v-if="getFileMeta(file)?.contentType" class="file-meta-tag">{{
                            getFileMeta(file)?.contentType }}</span>
                        <span v-if="getFileMeta(file)?.size" class="file-meta-size">{{
                            formatFileSize(getFileMeta(file)?.size) }}</span>
                        <span v-else-if="file.status === 'uploading'" class="file-meta-uploading">上传中...</span>
                    </div>
                </div>
                <div class="file-card-actions">
                    <template v-if="file.status === 'uploading'">
                        <el-icon class="is-loading">
                            <Loading />
                        </el-icon>
                    </template>
                    <template v-else>
                        <span v-if="file.url" class="file-action-btn file-action-download"
                            @click.stop="downloadFile(file.url, file.name)" title="下载">
                            <el-icon>
                                <Download />
                            </el-icon>
                        </span>
                        <span v-if="!disabled" class="file-action-btn file-action-remove"
                            @click.stop="handleFileRemove(file)" title="删除">
                            <el-icon>
                                <Close />
                            </el-icon>
                        </span>
                    </template>
                </div>
            </div>
        </template>
    </el-upload>

    <span v-else style="color: var(--el-color-warning);">未支持的字段类型: {{ field.type }}</span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
    Upload, Document, Loading, Download, Close,
    Picture, VideoPlay, Headset, Grid, Box, Monitor,
    Files
} from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import type { FormField } from './types'
import axios from 'axios'
import { CONSTANTS, getToken, alert } from '@/utils'

const props = defineProps<{
    field: FormField
    modelValue: any
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>()

const onUpdate = (val: any) => {
    emit('update:modelValue', val)
}

// ---------- UPLOAD 文件上传/下载（适配 /file/uploadDynamicForm） ----------

const uploadRef = ref<any>(null)

const fileTypeIcons: Record<string, any> = {
    image: Picture,
    video: VideoPlay,
    audio: Headset,
    spreadsheet: Grid,
    archive: Box,
    document: Document,
    code: Monitor,
    unknown: Files,
}

const handleFileRemove = (file: UploadFile) => {
    uploadRef.value?.handleRemove(file)
}

/** 根据文件名返回文件类型分类 */
const getFileCategory = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'].includes(ext)) return 'image'
    if (['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(ext)) return 'audio'
    if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'spreadsheet'
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'archive'
    if (['doc', 'docx', 'pdf', 'txt', 'md', 'rtf', 'pages'].includes(ext)) return 'document'
    if (['js', 'ts', 'vue', 'jsx', 'tsx', 'html', 'css', 'scss', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'h', 'json', 'xml', 'yaml', 'yml', 'sql'].includes(ext)) return 'code'
    return 'unknown'
}

/** 格式化文件大小 */
const formatFileSize = (bytes?: number): string => {
    if (bytes == null || bytes === 0) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIdx = 0
    while (size >= 1024 && unitIdx < units.length - 1) {
        size /= 1024
        unitIdx++
    }
    return `${size.toFixed(unitIdx === 0 ? 0 : 1)} ${units[unitIdx]}`
}

/** 从 props.modelValue 中获取文件的完整元数据 */
const getFileMeta = (file: UploadFile): any => {
    const fileId = extractFileIdFromUploadFile(file)
    if (!fileId || !Array.isArray(props.modelValue)) return null
    return props.modelValue.find((it: any) => {
        if (typeof it === 'string') return it === fileId
        return (it.id || it.fileId) === fileId
    })
}

/** 通过 axios 携带鉴权下载文件 */
const downloadFile = async (url: string, filename: string) => {
    try {
        const response = await axios.get(url, {
            headers: {
                authorization: `${CONSTANTS.SYSTEM.TOKEN_TYPE} ${getToken()}`,
            },
            responseType: 'blob',
        })
        const blob = new Blob([response.data])
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(downloadUrl)
    } catch {
        alert('文件下载失败', 'error')
    }
}

const uploadAction = computed(() => CONSTANTS.HTTP.BASEURL + '/file/uploadDynamicForm')
const uploadHeaders = computed(() => ({
    authorization: CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken(),
}))

/** 从各种格式的 modelValue 中提取 fileId 列表 */
const extractFileIds = (val: any): string[] => {
    if (!val) return []
    if (Array.isArray(val)) {
        if (val.length === 0) return []
        // 旧格式兼容: [{ name, url, raw }]
        if (val[0]?.raw) {
            return val.map((it: any) => it.raw?.data?.id || it.raw?.id).filter(Boolean)
        }
        // 新格式完整对象: [{ id, filename, contentType, ... }]
        if (val[0]?.id) {
            return val.map((it: any) => it.id)
        }
        // 旧对象格式兼容: [{ fileId, filename }]
        if (val[0]?.fileId) {
            return val.map((it: any) => it.fileId)
        }
        // 字符串数组
        return val.filter((it: any) => typeof it === 'string')
    }
    if (typeof val === 'string') return [val]
    return []
}

/** 从 UploadFile 中提取 fileId */
const extractFileIdFromUploadFile = (file: UploadFile): string | undefined => {
    const resp = file.response as any
    if (resp?.data?.id) return resp.data.id as string
    if (file.url) {
        const match = file.url.match(/[?&]fileId=([^&]+)/)
        if (match) return match[1]
    }
    return undefined
}

/** 根据 modelValue 构建 el-upload 的 file-list */
const buildUploadFileList = (val: any): UploadFile[] => {
    const list: UploadFile[] = []
    if (Array.isArray(val)) {
        if (val.length > 0 && val[0]?.raw) {
            // 旧格式
            val.forEach((it: any, idx: number) => {
                const fileId = it.raw?.data?.id || it.raw?.id
                if (fileId) {
                    list.push({
                        name: it.name || fileId,
                        url: `${CONSTANTS.HTTP.BASEURL}/file/downloadDynamicForm?fileId=${fileId}`,
                        uid: -(idx + 1),
                        status: 'success',
                        percentage: 100,
                    } as UploadFile)
                }
            })
        } else if (val.length > 0 && val[0]?.id) {
            // 新格式完整对象: [{ id, filename, contentType, ... }]
            val.forEach((it: any, idx: number) => {
                list.push({
                    name: it.filename || it.id,
                    url: `${CONSTANTS.HTTP.BASEURL}/file/downloadDynamicForm?fileId=${it.id}`,
                    uid: -(idx + 1),
                    status: 'success',
                    percentage: 100,
                } as UploadFile)
            })
        } else if (val.length > 0 && val[0]?.fileId) {
            // 旧对象格式兼容: [{ fileId, filename }]
            val.forEach((it: any, idx: number) => {
                list.push({
                    name: it.filename || it.fileId,
                    url: `${CONSTANTS.HTTP.BASEURL}/file/downloadDynamicForm?fileId=${it.fileId}`,
                    uid: -(idx + 1),
                    status: 'success',
                    percentage: 100,
                } as UploadFile)
            })
        } else {
            // 字符串数组
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

/** 同步 modelValue -> uploadFileList，避免循环覆盖 */
watch(() => props.modelValue, (val) => {
    const newIds = extractFileIds(val).sort().join(',')
    const currentIds = uploadFileList.value.map(extractFileIdFromUploadFile).filter(Boolean).sort().join(',')
    if (newIds !== currentIds) {
        uploadFileList.value = buildUploadFileList(val)
    }
}, { immediate: true })

const onUploadSuccess = (response: any, file: UploadFile) => {
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
    // 保留已有文件的完整元数据，追加新文件
    const existing = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const normalized = existing
        .map((it: any) => {
            if (typeof it === 'string') return { id: it, filename: it }
            if (it.fileId && !it.id) return { ...it, id: it.fileId }
            return it
        })
        .filter((it: any) => it.id !== fileId)
    normalized.push(data)
    emit('update:modelValue', normalized)
}

const onUploadRemove = (file: UploadFile) => {
    const removedId = extractFileIdFromUploadFile(file)
    if (!removedId) return
    const existing = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const filtered = existing.filter((it: any) => {
        if (typeof it === 'string') return it !== removedId
        return (it.id || it.fileId) !== removedId
    })
    emit('update:modelValue', filtered)
}

const onUploadError = (_error: any, file: UploadFile) => {
    alert(`文件 "${file.name}" 上传失败`, 'error')
    const idx = uploadFileList.value.findIndex(f => f.uid === file.uid)
    if (idx >= 0) uploadFileList.value.splice(idx, 1)
}

const onUploadExceed = () => {
    const limit = props.field.maxLength
    alert(`最多只能上传 ${limit ?? 1} 个文件`, 'warning')
}
</script>

<style scoped lang="scss">
/* ============================================================
   动态表单 · 文件上传组件
   主题变量：--brand-primary, --bg-elevated, --text-primary 等
   适配所有 7 套主题（深色/浅色自动跟随）
   ============================================================ */

.dynamic-form-upload {
    width: 100%;

    /* ---------- 拖拽上传区域 ---------- */
    :deep(.el-upload-dragger) {
        width: 100%;
        padding: var(--space-xl) var(--space-lg);
        background: var(--bg-container);
        border: 2px dashed var(--border-light);
        border-radius: var(--radius-lg);
        transition: all var(--duration-normal) var(--ease-out);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);

        &:hover {
            border-color: var(--brand-primary);
            background: var(--bg-overlay);
        }

        &.is-dragover {
            border-color: var(--brand-primary);
            background: var(--brand-primary-lighter);
            box-shadow: var(--shadow-glow);
        }
    }

    :deep(.el-upload) {
        width: 100%;
    }

    /* ---------- 文件列表网格 ---------- */
    :deep(.el-upload-list) {
        margin-top: var(--space-lg);
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--space-md);

        .el-upload-list__item {
            margin: 0;
            padding: 0;
            border: none;
            transition: none;

            &:hover {
                background: transparent;
            }

            .el-icon--close {
                display: none;
            }
        }
    }

    /* ---------- 禁用状态 ---------- */
    &.is-disabled {
        :deep(.el-upload-dragger) {
            cursor: not-allowed;
            border-color: var(--border-light);
            background: var(--bg-container);
            opacity: 0.6;
        }

        .upload-file-card {
            cursor: default;
            opacity: 0.6;

            &:hover {
                transform: none;
                border-color: var(--border-light);
                box-shadow: none;
            }
        }
    }
}

/* ---------- 上传触发区域 ---------- */
.upload-trigger-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
}

.upload-trigger-icon {
    font-size: 28px;
    color: var(--text-secondary);
    transition: color var(--duration-normal) var(--ease-out);

    .el-upload-dragger:hover & {
        color: var(--brand-primary);
    }
}

.upload-trigger-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.upload-trigger-primary {
    font-size: var(--fs-md);
    color: var(--text-regular);
    font-weight: var(--fw-medium);
}

.upload-trigger-hint {
    font-size: var(--fs-xs);
    color: var(--text-placeholder);
}

/* ---------- 文件卡片 ---------- */
.upload-file-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-elevated);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-normal) var(--ease-out);
    min-width: 0;
    cursor: default;

    &:hover {
        border-color: var(--brand-primary);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
    }

    &.is-uploading {
        opacity: 0.75;

        .file-card-icon {
            animation: upload-pulse 1.5s ease-in-out infinite;
        }
    }
}

@keyframes upload-pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* ---------- 文件类型图标 ---------- */
.file-card-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
    transition: all var(--duration-normal) var(--ease-out);

    &.type-image {
        background: var(--info-bg);
        color: var(--info);
    }

    &.type-video {
        background: var(--danger-bg);
        color: var(--danger);
    }

    &.type-audio {
        background: var(--warning-bg);
        color: var(--warning);
    }

    &.type-spreadsheet {
        background: var(--success-bg);
        color: var(--success);
    }

    &.type-archive {
        background: var(--info-bg);
        color: var(--info);
    }

    &.type-document {
        background: var(--brand-primary-lighter);
        color: var(--brand-primary);
    }

    &.type-code {
        background: var(--info-bg);
        color: var(--info);
    }

    &.type-unknown {
        background: var(--bg-overlay);
        color: var(--text-secondary);
    }
}

/* ---------- 文件信息主体 ---------- */
.file-card-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.file-card-name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-medium);
    color: var(--text-primary);
    line-height: var(--lh-snug);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);

    &:hover {
        color: var(--brand-primary);
    }
}

.file-card-meta {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex-wrap: wrap;
}

.file-meta-tag {
    font-size: 11px;
    color: var(--text-secondary);
    background: var(--bg-overlay);
    padding: 1px 6px;
    border-radius: var(--radius-pill);
    line-height: 1.4;
    white-space: nowrap;
}

.file-meta-size {
    font-size: 11px;
    color: var(--text-placeholder);
    white-space: nowrap;
}

.file-meta-uploading {
    font-size: 11px;
    color: var(--brand-primary);
    white-space: nowrap;
}

/* ---------- 操作按钮 ---------- */
.file-card-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex-shrink: 0;
}

.file-action-btn {
    width: 26px;
    height: 26px;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-secondary);
    background: transparent;
    transition: all var(--duration-fast) var(--ease-out);
    flex-shrink: 0;

    &:hover {
        background: var(--bg-overlay);
    }

    &.file-action-download:hover {
        color: var(--success);
        background: var(--success-bg);
    }

    &.file-action-remove:hover {
        color: var(--danger);
        background: var(--danger-bg);
    }
}

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
    .dynamic-form-upload :deep(.el-upload-list) {
        grid-template-columns: 1fr;
    }
}
</style>
