<template>
    <el-input v-if="field.type === 'INPUT'" :model-value="modelValue" @update:model-value="onUpdate"
        :placeholder="field.placeholder" :maxlength="field.maxLength" :minlength="field.minLength"
        :disabled="disabled" clearable style="width: 100%;" />

    <el-input-number v-else-if="field.type === 'NUMBER'" :model-value="modelValue" @update:model-value="onUpdate"
        :placeholder="field.placeholder" :min="field.min ?? -Infinity" :max="field.max ?? Infinity"
        :disabled="disabled" style="width: 100%;" />

    <el-input v-else-if="field.type === 'TEXTAREA'" :model-value="modelValue" @update:model-value="onUpdate"
        type="textarea" :autosize="{ minRows: field.min ?? 2, maxRows: field.max ?? 4 }"
        :placeholder="field.placeholder" :minlength="field.minLength" :maxlength="field.maxLength"
        :disabled="disabled" style="width: 100%;" />

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
        :options="field.options" :placeholder="field.placeholder" :disabled="disabled"
        :props="{ multiple: false }" style="width: 100%;" />

    <el-cascader v-else-if="field.type === 'MULTICASCADER'" :model-value="modelValue" @update:model-value="onUpdate"
        :options="field.options" :placeholder="field.placeholder" :disabled="disabled"
        :props="{ multiple: true }" style="width: 100%;" />

    <el-switch v-else-if="field.type === 'SWITCH'" :model-value="modelValue" @update:model-value="onUpdate"
        :disabled="disabled" />

    <el-color-picker v-else-if="field.type === 'COLOR'" :model-value="modelValue" @update:model-value="onUpdate"
        :disabled="disabled" />

    <el-slider v-else-if="field.type === 'SLIDER'" :model-value="modelValue" @update:model-value="onUpdate"
        :min="field.min ?? 0" :max="field.max ?? 100" :disabled="disabled"
        :show-input="!disabled" show-stops show-tooltip style="margin: 0 12px;" />

    <el-date-picker v-else-if="field.type === 'DATE'" :model-value="modelValue" @update:model-value="onUpdate"
        type="date" :placeholder="field.placeholder" :disabled="disabled"
        value-format="YYYY-MM-DD" style="width: 100%;" />

    <el-date-picker v-else-if="field.type === 'DATETIME'" :model-value="modelValue" @update:model-value="onUpdate"
        type="datetime" :placeholder="field.placeholder" :disabled="disabled"
        value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" />

    <el-time-picker v-else-if="field.type === 'TIME'" :model-value="modelValue" @update:model-value="onUpdate"
        :placeholder="field.placeholder" :disabled="disabled"
        value-format="HH:mm:ss" style="width: 100%;" />

    <el-date-picker v-else-if="field.type === 'DATERANGE'" :model-value="modelValue" @update:model-value="onUpdate"
        type="daterange" unlink-panels range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
        :disabled="disabled" value-format="YYYY-MM-DD" style="width: 100%;" />

    <el-upload v-else-if="field.type === 'UPLOAD'"
        ref="uploadRef"
        v-model:file-list="uploadFileList"
        :action="uploadAction"
        :headers="uploadHeaders"
        name="uploadFile"
        :disabled="disabled"
        :limit="field.maxLength ?? undefined"
        :on-success="onUploadSuccess"
        :on-remove="onUploadRemove"
        :on-error="onUploadError"
        :on-exceed="onUploadExceed"
        multiple
        class="dynamic-form-upload">
        <el-button type="primary" :disabled="disabled">
            <el-icon><Upload /></el-icon>
            <span style="margin-left: 6px;">点击上传</span>
        </el-button>
        <template #file="{ file }">
            <div class="upload-file-item" :class="'is-' + file.status">
                <div class="file-icon-wrap">
                    <el-icon><Document /></el-icon>
                </div>
                <span class="file-name" @click="file.url && downloadFile(file.url, file.name)">
                    <span :title="file.name">{{ file.name }}</span>
                </span>
                <div class="file-actions">
                    <el-icon v-if="file.status === 'uploading'" class="is-loading"><Loading /></el-icon>
                    <template v-else>
                        <span v-if="file.url" class="file-action-btn file-download" @click="downloadFile(file.url, file.name)" title="下载">
                            <el-icon><Download /></el-icon>
                        </span>
                        <span v-if="!disabled" class="file-action-btn file-remove" @click="handleFileRemove(file)" title="删除">
                            <el-icon><Close /></el-icon>
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
import { Upload, Document, Loading, Download, Close } from '@element-plus/icons-vue'
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

const handleFileRemove = (file: UploadFile) => {
    uploadRef.value?.handleRemove(file)
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
        // 对象格式兼容: [{ fileId, filename }]
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
        } else if (val.length > 0 && val[0]?.fileId) {
            // 对象格式
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
    const fileId = response?.data?.id
    const filename = response?.data?.filename
    if (!fileId) {
        alert('上传失败：未获取到文件ID', 'error')
        const idx = uploadFileList.value.findIndex(f => f.uid === file.uid)
        if (idx >= 0) uploadFileList.value.splice(idx, 1)
        return
    }
    const item = uploadFileList.value.find(f => f.uid === file.uid)
    if (item) {
        item.name = filename || item.name
        item.url = `${CONSTANTS.HTTP.BASEURL}/file/downloadDynamicForm?fileId=${fileId}`
    }
    const ids = uploadFileList.value.map(extractFileIdFromUploadFile).filter(Boolean) as string[]
    emit('update:modelValue', ids)
}

const onUploadRemove = (_file: UploadFile) => {
    // v-model:file-list 已自动同步删除后的列表
    const ids = uploadFileList.value.map(extractFileIdFromUploadFile).filter(Boolean) as string[]
    emit('update:modelValue', ids)
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
.dynamic-form-upload {
    width: 100%;

    :deep(.el-upload) {
        display: inline-flex;
    }

    :deep(.el-upload-list) {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

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

    &.is-disabled {
        :deep(.el-upload-list) {
            opacity: 0.75;
        }

        .upload-file-item {
            background: var(--el-fill-color-lighter);
            border-color: var(--el-border-color-lighter);
            box-shadow: none;
            cursor: default;

            &:hover {
                transform: none;
                background: var(--el-fill-color-lighter);
                border-color: var(--el-border-color-lighter);
            }

            .file-name {
                cursor: default;

                &:hover {
                    color: var(--el-text-color-primary);
                }
            }
        }
    }
}

.upload-file-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    max-width: 100%;
    min-width: 0;

    &:hover {
        background: var(--el-fill-color-light);
        border-color: var(--el-border-color);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        transform: scale(1.005);
    }

    .file-icon-wrap {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 13px;
    }

    .file-name {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--el-text-color-primary);
        cursor: pointer;
        font-size: 13px;
        flex: 1;
        min-width: 0;

        span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 180px;
        }

        &:hover {
            color: var(--el-color-primary);
        }
    }

    .file-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
        margin-left: 2px;
    }

    .file-action-btn {
        width: 22px;
        height: 22px;
        border-radius: 5px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        transition: all 0.2s;

        &:hover {
            background: var(--el-fill-color);
        }

        &.file-download:hover {
            color: var(--el-color-success);
            background: var(--el-color-success-light-9);
        }

        &.file-remove:hover {
            color: var(--el-color-danger);
            background: var(--el-color-danger-light-9);
        }
    }
}

/* 设计模式（disabled）下操作按钮隐藏 */
.dynamic-form-upload.is-disabled .file-actions {
    display: none;
}
</style>
