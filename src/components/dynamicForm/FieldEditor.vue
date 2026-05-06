<template>
    <el-dialog v-model="visible" :title="isEdit ? '编辑字段' : '添加字段'" width="720px"
        :close-on-click-modal="false" destroy-on-close>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
            <el-row :gutter="16">
                <el-col :span="12">
                    <el-form-item label="字段 ID" prop="fieldId">
                        <el-input v-model="form.fieldId" placeholder="同一表单内不可重复">
                            <template #append>
                                <el-button type="primary" @click="form.fieldId = randomId('field_')">随机</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="标题" prop="title">
                        <el-input v-model="form.title" placeholder="请输入标题" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="字段类型" prop="type">
                        <el-select v-model="form.type" :disabled="isEdit && form.type !== originalType"
                            @change="onTypeChange" style="width: 100%">
                            <el-option v-for="item in FIELD_TYPE_OPTIONS" :key="item.value"
                                :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="布局宽度 (1-24)" prop="span">
                        <el-input-number v-model="form.span" :min="1" :max="24" style="width: 100%" />
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="是否必填">
                        <el-switch v-model="form.required" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="提示文案" prop="placeholder">
                        <el-input v-model="form.placeholder" placeholder="可选" />
                    </el-form-item>
                </el-col>

                <el-col :span="24" v-if="hasOptions">
                    <el-form-item label="选项管理">
                        <el-button type="primary" plain @click="optionsDialog = true">
                            <el-icon><Setting /></el-icon>
                            <span>打开选项管理器（已配置 {{ form.options?.length || 0 }} 项）</span>
                        </el-button>
                    </el-form-item>
                </el-col>

                <!-- 默认值（按类型分支） -->
                <el-col :span="24" v-if="['INPUT', 'TEXTAREA'].includes(form.type)">
                    <el-form-item label="默认值">
                        <el-input v-model="form.defaultValue" placeholder="可选" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.type === 'NUMBER'">
                    <el-form-item label="默认值">
                        <el-input-number v-model="form.defaultValue" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'SELECT' || form.type === 'RADIO'">
                    <el-form-item label="默认值">
                        <el-select v-model="form.defaultValue" clearable style="width: 100%">
                            <el-option v-for="item in form.options || []" :key="item.value"
                                :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'MULTISELECT' || form.type === 'CHECKBOX'">
                    <el-form-item label="默认值">
                        <el-select v-model="form.defaultValue" clearable multiple style="width: 100%">
                            <el-option v-for="item in form.options || []" :key="item.value"
                                :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'SWITCH'">
                    <el-form-item label="默认值">
                        <el-switch v-model="form.defaultValue" />
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'COLOR'">
                    <el-form-item label="默认值">
                        <el-color-picker v-model="form.defaultValue" />
                    </el-form-item>
                </el-col>

                <!-- 长度限制（INPUT/TEXTAREA） -->
                <el-col :span="12" v-if="['INPUT', 'TEXTAREA'].includes(form.type)">
                    <el-form-item label="最小长度">
                        <el-input-number v-model="form.minLength" :min="0" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="['INPUT', 'TEXTAREA'].includes(form.type)">
                    <el-form-item label="最大长度">
                        <el-input-number v-model="form.maxLength" :min="0" style="width: 100%" />
                    </el-form-item>
                </el-col>

                <!-- 数值范围（NUMBER/SLIDER/RATE/CHECKBOX） -->
                <el-col :span="12" v-if="['NUMBER', 'SLIDER', 'RATE'].includes(form.type)">
                    <el-form-item label="最小值">
                        <el-input-number v-model="form.min" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="['NUMBER', 'SLIDER', 'RATE'].includes(form.type)">
                    <el-form-item label="最大值">
                        <el-input-number v-model="form.max" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.type === 'CHECKBOX'">
                    <el-form-item label="最少勾选">
                        <el-input-number v-model="form.min" :min="0" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.type === 'CHECKBOX'">
                    <el-form-item label="最多勾选">
                        <el-input-number v-model="form.max" :min="0" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.type === 'TEXTAREA'">
                    <el-form-item label="显示最小行">
                        <el-input-number v-model="form.min" :min="1" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.type === 'TEXTAREA'">
                    <el-form-item label="显示最大行">
                        <el-input-number v-model="form.max" :min="1" style="width: 100%" />
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="正则校验">
                        <el-input v-model="form.pattern" placeholder="例：^[一-龥]{2,4}$" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="校验提示">
                        <el-input v-model="form.patternTips" placeholder="例：格式不正确" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <template #footer>
            <el-button type="primary" @click="onSubmit">确定</el-button>
            <el-button @click="visible = false">取消</el-button>
        </template>

        <el-dialog v-model="optionsDialog" title="选项管理" width="60%" append-to-body destroy-on-close>
            <OptionsMaker v-model:options="form.options" :type="form.type" />
            <template #footer>
                <el-button type="primary" @click="optionsDialog = false">完成</el-button>
            </template>
        </el-dialog>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { alert, randomId } from '@/utils'
import OptionsMaker from './OptionsMaker.vue'
import {
    FIELD_TYPE_OPTIONS,
    type FormField,
    type FormFieldType,
} from './types'

const props = defineProps<{
    modelValue: boolean
    field?: FormField | null
    existingFieldIds: string[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'submit', field: FormField): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
})

const isEdit = computed(() => !!props.field)
const originalType = ref<FormFieldType>('INPUT')

interface FormState {
    fieldId: string
    title: string
    type: FormFieldType
    required: boolean
    defaultValue: any
    placeholder: string
    options: any[]
    minLength: number | undefined
    maxLength: number | undefined
    min: number | undefined
    max: number | undefined
    pattern: string
    patternTips: string
    span: number
}

const buildEmpty = (): FormState => ({
    fieldId: randomId('field_'),
    title: '',
    type: 'INPUT',
    required: false,
    defaultValue: null,
    placeholder: '',
    options: [],
    minLength: undefined,
    maxLength: undefined,
    min: undefined,
    max: undefined,
    pattern: '',
    patternTips: '',
    span: 24,
})

const form = ref<FormState>(buildEmpty())

watch(
    () => [props.modelValue, props.field],
    ([open, field]) => {
        if (!open) return
        if (field) {
            const f = field as FormField
            originalType.value = f.type
            form.value = {
                fieldId: f.fieldId,
                title: f.title,
                type: f.type,
                required: f.required === '1',
                defaultValue: f.defaultValue ?? null,
                placeholder: f.placeholder ?? '',
                options: f.options ? JSON.parse(JSON.stringify(f.options)) : [],
                minLength: f.minLength,
                maxLength: f.maxLength,
                min: f.min,
                max: f.max,
                pattern: f.pattern ?? '',
                patternTips: f.patternTips ?? '',
                span: f.span ?? 24,
            }
        } else {
            originalType.value = 'INPUT'
            form.value = buildEmpty()
        }
    },
    { immediate: true },
)

const hasOptions = computed(() =>
    ['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER'].includes(form.value.type),
)

const optionsDialog = ref(false)

const onTypeChange = () => {
    // 切换类型时清空与类型强相关的属性
    form.value.defaultValue = null
    form.value.options = []
    form.value.min = undefined
    form.value.max = undefined
    form.value.minLength = undefined
    form.value.maxLength = undefined
}

const formRef = ref<FormInstance>()

const rules = computed<FormRules>(() => ({
    fieldId: [
        { required: true, message: 'fieldId 不能为空', trigger: 'change' },
        {
            validator: (_r, value, cb) => {
                if (!/^[a-zA-Z][a-zA-Z0-9_]{0,31}$/.test(value)) {
                    cb(new Error('以字母开头，仅含字母数字下划线，最长 32'))
                    return
                }
                const dup = props.existingFieldIds.some(
                    id => id === value && (!props.field || props.field.fieldId !== value),
                )
                if (dup) cb(new Error('该 fieldId 已存在'))
                else cb()
            },
            trigger: 'change',
        },
    ],
    title: [
        { required: true, message: '标题不能为空', trigger: 'change' },
        { min: 1, max: 32, message: '长度 1-32', trigger: 'change' },
    ],
    type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
}))

const onSubmit = async () => {
    if (!formRef.value) return
    try {
        await formRef.value.validate()
    } catch {
        alert('请检查字段配置', 'warning')
        return
    }
    if (hasOptions.value && (!form.value.options || form.value.options.length === 0)) {
        alert('请添加至少一个选项', 'warning')
        return
    }
    const f: FormField = {
        fieldId: form.value.fieldId,
        title: form.value.title,
        type: form.value.type,
        required: form.value.required ? '1' : '0',
        defaultValue: form.value.defaultValue,
        placeholder: form.value.placeholder || undefined,
        options: hasOptions.value ? form.value.options : undefined,
        minLength: form.value.minLength,
        maxLength: form.value.maxLength,
        min: form.value.min,
        max: form.value.max,
        pattern: form.value.pattern || undefined,
        patternTips: form.value.patternTips || undefined,
        span: form.value.span,
    }
    emit('submit', f)
    visible.value = false
}
</script>
