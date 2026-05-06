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
        :min="field.min ?? 0" :max="field.max ?? 100" :disabled="disabled" show-input />

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
        :action="CONSTANTS.HTTP.BASEURL + '/file/upload'"
        :headers="{ authorization: CONSTANTS.SYSTEM.TOKEN_TYPE + ' ' + getToken() }"
        name="uploadFile"
        :disabled="disabled"
        :file-list="uploadList"
        :on-success="onUploadSuccess"
        :on-remove="onUploadRemove"
        multiple>
        <el-button type="primary" :disabled="disabled">
            <el-icon><Upload /></el-icon>
            <span style="margin-left: 6px;">点击上传</span>
        </el-button>
    </el-upload>

    <span v-else style="color: var(--el-color-warning);">未支持的字段类型: {{ field.type }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import type { FormField } from './types'
import { CONSTANTS, getToken } from '@/utils'

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

// UPLOAD: modelValue 为文件项数组（保留服务端返回结果）
const uploadList = computed(() => Array.isArray(props.modelValue) ? props.modelValue : [])

const onUploadSuccess = (response: any, file: any) => {
    const item = { name: file.name, url: response?.data?.url || response?.url || '', raw: response }
    const next = [...uploadList.value, item]
    emit('update:modelValue', next)
}

const onUploadRemove = (file: any) => {
    const next = uploadList.value.filter((it: any) => it.name !== file.name)
    emit('update:modelValue', next)
}
</script>
