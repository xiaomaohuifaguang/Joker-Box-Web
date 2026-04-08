<template>
    <div class="dynamic-form-container">
        <el-form ref="formRef" :model="modelValue" :rules="formRules" label-width="100px" label-position="top">
            <el-row :gutter="20">
                <template v-for="(field, index) in fields" :key="field.id || index">
                    <el-col :span="field.span || 24">
                        <el-form-item :label="field.title" :prop="field.id" :rules="field.rules">
                            <!-- 文本输入框 -->
                            <el-input v-if="field.type === 'input'" v-model="modelValue[field.id]"
                                :placeholder="field.placeholder" clearable style="width: 100%;"
                                :disabled="field.disabled" :maxlength="field.maxLength"
                                :show-word-limit="field.showWordLimit" :prefix-icon="field.prefixIcon"
                                :suffix-icon="field.suffixIcon" :type="field.inputType || 'text'" />

                            <!-- 数字输入框 -->
                            <el-input-number v-else-if="field.type === 'number'" v-model="modelValue[field.id]"
                                :defaultValue="0" :placeholder="field.placeholder" style="width: 100%;" :min="field.min"
                                :max="field.max" :step="field.step" :precision="field.precision"
                                :controls-position="field.controlsPosition" />

                            <!-- 下拉选择框 -->
                            <el-select v-else-if="field.type === 'select'" v-model="modelValue[field.id]"
                                :placeholder="field.placeholder" clearable :multiple="field.multiple"
                                :filterable="field.filterable" :allow-create="field.allowCreate" :remote="field.remote"
                                :remote-method="field.remoteMethod" :loading="field.loading">
                                <el-option v-for="item in field.options || []" :key="item.value" :label="item.label"
                                    :value="item.value" style="width: 100%;" />
                            </el-select>

                            <!-- 单选按钮组 -->
                            <el-radio-group v-else-if="field.type === 'radio'" v-model="modelValue[field.id]"
                                style="width: 100%;" :size="field.size" :border="field.border" :button="field.button">
                                <el-radio v-for="item in field.options || []" :key="item.value" :value="item.value"
                                    :label="item.label" :disabled="item.disabled">
                                    {{ item.label }}
                                </el-radio>
                            </el-radio-group>

                            <!-- 多选框 -->
                            <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="modelValue[field.id]"
                                style="width: 100%;" :min="field.minChecked" :max="field.maxChecked">
                                <el-checkbox v-for="item in field.options || []" :key="item.value" :value="item.value"
                                    :label="item.label" :disabled="item.disabled">
                                    {{ item.label }}
                                </el-checkbox>
                            </el-checkbox-group>

                            <!-- 日期选择器 -->
                            <el-date-picker v-else-if="field.type === 'date'" v-model="modelValue[field.id]" type="date"
                                :placeholder="field.placeholder" value-format="YYYY-MM-DD" style="width: 100%;"
                                :disabled-date="field.disabledDate" :shortcuts="field.shortcuts"
                                :start-placeholder="field.startPlaceholder" :end-placeholder="field.endPlaceholder"
                                :range-separator="field.rangeSeparator" />

                            <!-- 日期时间选择器 -->
                            <el-date-picker v-else-if="field.type === 'datetime'" v-model="modelValue[field.id]"
                                type="datetime" :placeholder="field.placeholder" value-format="YYYY-MM-DD HH:mm:ss"
                                style="width: 100%;" :disabled-date="field.disabledDate" :shortcuts="field.shortcuts" />

                            <!-- 时间选择器 -->
                            <el-time-picker v-else-if="field.type === 'time'" v-model="modelValue[field.id]"
                                :placeholder="field.placeholder" value-format="HH:mm:ss" style="width: 100%;"
                                :disabled-hours="field.disabledHours" :disabled-minutes="field.disabledMinutes"
                                :disabled-seconds="field.disabledSeconds" />

                            <!-- 开关 -->
                            <el-switch v-else-if="field.type === 'switch'" v-model="modelValue[field.id]"
                                style="width: 100%;" :active-text="field.activeText" :inactive-text="field.inactiveText"
                                :active-value="field.activeValue" :inactive-value="field.inactiveValue" />

                            <!-- 文本域 -->
                            <el-input v-else-if="field.type === 'textarea'" v-model="modelValue[field.id]"
                                type="textarea" :rows="field.rows || 4" :placeholder="field.placeholder"
                                style="width: 100%;" :maxlength="field.maxLength" :show-word-limit="field.showWordLimit"
                                :resize="field.resize" />

                            <!-- 文件上传 -->
                            <el-upload v-else-if="field.type === 'upload'" :action="field.action"
                                :multiple="field.multiple" :limit="field.limit" :accept="field.accept"
                                :before-upload="field['beforeUpload']" :on-success="field['onSuccess']"
                                :on-error="field['onError']" :on-exceed="field['onExceed']"
                                :file-list="modelValue[field.id]" :auto-upload="field.autoUpload !== false"
                                :drag="field.drag" :list-type="field.listType || 'text'" style="width: 100%;">
                                <el-button type="primary" v-if="!field.drag">点击上传</el-button>
                                <div v-else class="el-upload__text">
                                    将文件拖到此处，或<em>点击上传</em>
                                </div>
                                <template #tip>
                                    <div class="el-upload__tip" v-if="field.tip">{{ field.tip }}</div>
                                </template>
                            </el-upload>

                            <!-- 评分 -->
                            <el-rate v-else-if="field.type === 'rate'" v-model="modelValue[field.id]"
                                :max="field.max || 5" :allow-half="field.allowHalf" :show-text="field.showText"
                                :show-score="field.showScore" :texts="field.texts"
                                :score-template="field.scoreTemplate" />

                            <!-- 滑块 -->
                            <el-slider v-else-if="field.type === 'slider'" v-model="modelValue[field.id]"
                                :min="field.min || 0" :max="field.max || 100" :step="field.step || 1"
                                :show-input="field.showInput" :show-input-controls="field.showInputControls"
                                :range="field.range" :marks="field.marks" />

                            <!-- 颜色选择器 -->
                            <el-color-picker v-else-if="field.type === 'color'" v-model="modelValue[field.id]"
                                :show-alpha="field.showAlpha" :color-format="field.colorFormat"
                                :predefine="field.predefineColors" />

                            <!-- 级联选择器 -->
                            <el-cascader v-else-if="field.type === 'cascader'" v-model="modelValue[field.id]"
                                :options="field.options" :props="field.props" :show-all-levels="field.showAllLevels"
                                :filterable="field.filterable" :separator="field.separator"
                                :placeholder="field.placeholder" style="width: 100%;" />

                            <!-- 自定义插槽 -->
                            <slot v-else-if="field.type === 'slot'" :name="field.slotName" :field="field"
                                :value="modelValue[field.id]"></slot>
                        </el-form-item>
                    </el-col>
                </template>
            </el-row>

            <!-- 表单操作按钮 -->
            <el-form-item v-if="showButtons">
                <el-button type="primary" @click="submitForm">提交</el-button>
                <el-button @click="resetForm">重置</el-button>
                <el-button v-if="editable" type="success" @click="addField">添加字段</el-button>
            </el-form-item>
        </el-form>

        <!-- 添加字段的对话框 -->
        <el-dialog v-model="dialogVisible" title="添加新字段" width="70%" top="5vh">
            <el-form :model="newField" label-width="120px">
                <el-form-item label="字段标题" prop="title" required>
                    <el-input v-model="newField.title" placeholder="请输入字段标题" />
                </el-form-item>

                <el-form-item label="字段类型" prop="type" required>
                    <el-select v-model="newField.type" placeholder="请选择字段类型" style="width: 100%;">
                        <el-option v-for="type in fieldTypes" :key="type.value" :label="type.label"
                            :value="type.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="字段ID" prop="id" required>
                    <el-input v-model="newField.id" placeholder="请输入字段唯一ID" />
                </el-form-item>

                <el-form-item label="提示文本" prop="placeholder">
                    <el-input v-model="newField.placeholder" placeholder="请输入提示文本" />
                </el-form-item>

                <el-form-item label="宽度(1-24)" prop="span">
                    <el-input-number v-model="newField.span" :min="1" :max="24" />
                </el-form-item>

                <el-form-item label="是否禁用" prop="disabled">
                    <el-switch v-model="newField.disabled" />
                </el-form-item>

                <el-form-item label="默认值" prop="defaultValue">
                    <el-input v-model="newField.defaultValue" placeholder="请输入默认值" />
                </el-form-item>

                <!-- 验证规则配置 -->
                <el-form-item label="验证规则">
                    <el-checkbox v-model="newField.required">必填</el-checkbox>
                    <el-checkbox v-model="newField.showValidation">显示验证</el-checkbox>

                    <div v-if="newField.showValidation" style="margin-top: 10px;">
                        <el-form-item label="最小长度" v-if="['input', 'textarea'].includes(newField.type)">
                            <el-input-number v-model="newField.minLength" :min="0" />
                        </el-form-item>

                        <el-form-item label="最大长度" v-if="['input', 'textarea'].includes(newField.type)">
                            <el-input-number v-model="newField.maxLength" :min="1" />
                        </el-form-item>

                        <el-form-item label="最小值" v-if="['number', 'slider'].includes(newField.type)">
                            <el-input-number v-model="newField.min" />
                        </el-form-item>

                        <el-form-item label="最大值" v-if="['number', 'slider'].includes(newField.type)">
                            <el-input-number v-model="newField.max" />
                        </el-form-item>

                        <el-form-item label="正则表达式" v-if="['input', 'textarea'].includes(newField.type)">
                            <el-input v-model="newField.pattern" placeholder="请输入正则表达式" />
                        </el-form-item>

                        <el-form-item label="错误提示" v-if="newField.required">
                            <el-input v-model="newField.errorMessage" placeholder="请输入必填错误提示" />
                        </el-form-item>
                    </div>
                </el-form-item>

                <!-- 选项配置 -->
                <el-form-item label="选项" prop="options" v-if="hasOptions(newField.type)">
                    <div v-for="(option, idx) in newField.options" :key="idx" class="option-item">
                        <el-input v-model="option.label" placeholder="显示文本" style="width: 45%; margin-right: 10px;" />
                        <el-input v-model="option.value" placeholder="实际值" style="width: 45%;" />
                        <el-button type="danger" circle @click="removeOption(idx)" style="margin-left: 10px;">
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </el-button>
                    </div>
                    <el-button type="primary" @click="addOption">添加选项</el-button>
                </el-form-item>

                <!-- 类型特定配置 -->
                <template v-if="newField.type === 'select'">
                    <el-form-item label="是否多选" prop="multiple">
                        <el-switch v-model="newField.multiple" />
                    </el-form-item>

                    <el-form-item label="是否可筛选" prop="filterable">
                        <el-switch v-model="newField.filterable" />
                    </el-form-item>
                </template>

                <template v-if="newField.type === 'checkbox'">
                    <el-form-item label="最少选择" prop="minChecked">
                        <el-input-number v-model="newField.minChecked" :min="0" />
                    </el-form-item>

                    <el-form-item label="最多选择" prop="maxChecked">
                        <el-input-number v-model="newField.maxChecked" :min="1" />
                    </el-form-item>
                </template>

                <template v-if="newField.type === 'date' || newField.type === 'datetime'">
                    <el-form-item label="快捷选项" prop="shortcuts">
                        <el-checkbox-group v-model="newField.shortcuts">
                            <el-checkbox label="today">今天</el-checkbox>
                            <el-checkbox label="yesterday">昨天</el-checkbox>
                            <el-checkbox label="aWeekAgo">一周前</el-checkbox>
                            <el-checkbox label="aMonthAgo">一个月前</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </template>

                <template v-if="newField.type === 'upload'">
                    <el-form-item label="上传地址" prop="action">
                        <el-input v-model="newField.action" placeholder="请输入上传接口地址" />
                    </el-form-item>

                    <el-form-item label="最大数量" prop="limit">
                        <el-input-number v-model="newField.limit" :min="1" />
                    </el-form-item>

                    <el-form-item label="拖拽上传" prop="drag">
                        <el-switch v-model="newField.drag" />
                    </el-form-item>
                </template>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmAddField">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, FormItemRule } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

// 类型定义
export type FieldType =
    | 'input'
    | 'number'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'datetime'
    | 'time'
    | 'switch'
    | 'textarea'
    | 'upload'
    | 'rate'
    | 'slider'
    | 'color'
    | 'cascader'
    | 'slot'

export interface FormFieldOption {
    label: string
    value: string | number
    disabled?: boolean
}

export interface ValidationRule extends FormItemRule {
    message: string
    trigger?: 'blur' | 'change' | ['blur', 'change']
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: RegExp | string
    validator?: (rule: any, value: any, callback: any) => void
    required?: boolean
}

export interface FormField {
    title: string
    type: FieldType
    id: string
    span?: number
    placeholder?: string
    required?: boolean
    rules?: ValidationRule[]
    options?: FormFieldOption[]
    props?: Record<string, any>
    disabled?: boolean
    defaultValue?: any

    // 输入框特定属性
    inputType?: 'text' | 'password' | 'email' | 'url' | 'tel'
    minLength?: number
    maxLength?: number
    showWordLimit?: boolean
    prefixIcon?: string
    suffixIcon?: string

    pattern?: string
    errorMessage?: string

    // 数字输入框特定属性
    min?: number
    // max?: number
    step?: number
    precision?: number
    controlsPosition?: 'right'

    // 选择器特定属性
    multiple?: boolean
    filterable?: boolean
    allowCreate?: boolean
    remote?: boolean
    remoteMethod?: Function
    loading?: boolean

    // 单选/多选特定属性
    button?: boolean
    border?: boolean
    size?: 'large' | 'default' | 'small'
    minChecked?: number
    maxChecked?: number

    // 日期时间特定属性
    shortcuts?: string[]
    disabledDate?: (date: Date) => boolean
    disabledHours?: number[]
    disabledMinutes?: number[]
    disabledSeconds?: number[]
    startPlaceholder?: string
    endPlaceholder?: string
    rangeSeparator?: string

    // 开关特定属性
    activeText?: string
    inactiveText?: string
    activeValue?: any
    inactiveValue?: any

    // 文本域特定属性
    rows?: number
    resize?: 'none' | 'both' | 'horizontal' | 'vertical'

    // 上传特定属性
    action?: string
    limit?: number
    accept?: string
    drag?: boolean
    tip?: string
    listType?: 'text' | 'picture' | 'picture-card'
    autoUpload?: boolean

    // 评分特定属性
    max?: number
    allowHalf?: boolean
    showText?: boolean
    showScore?: boolean
    texts?: string[]
    scoreTemplate?: string

    // 滑块特定属性
    range?: boolean
    showInput?: boolean
    showInputControls?: boolean
    marks?: Record<number, string>

    // 颜色选择器特定属性
    showAlpha?: boolean
    colorFormat?: 'hsl' | 'hsv' | 'hex' | 'rgb'
    predefineColors?: string[]

    // 级联选择器特定属性
    showAllLevels?: boolean
    separator?: string

    // 插槽特定属性
    slotName?: string
}

interface NewField {
    title: string
    type: FieldType
    id: string
    span?: number
    placeholder: string
    options: FormFieldOption[]
    disabled?: boolean
    defaultValue?: any
    required?: boolean
    showValidation?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    errorMessage?: string
    multiple?: boolean
    filterable?: boolean
    minChecked?: number
    maxChecked?: number
    shortcuts?: string[]
    action?: string
    limit?: number
    drag?: boolean
}

// 组件Props
const props = defineProps({
    fields: {
        type: Array as () => FormField[],
        required: true,
        default: () => []
    },
    modelValue: {
        type: Object,
        required: true,
        default: () => ({})
    },
    showButtons: {
        type: Boolean,
        default: true
    },
    editable: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'update:fields', 'submit', 'reset'])

// 表单引用
const formRef = ref<FormInstance>()

// 计算表单规则
const formRules = computed<FormRules>(() => {
    const rules: FormRules = {}
    props.fields.forEach(field => {
        if (field.rules) {
            rules[field.id] = field.rules
        } else {
            // 自动生成基本验证规则
            const fieldRules: ValidationRule[] = []

            if (field['required']) {
                fieldRules.push({
                    required: true,
                    message: field['errorMessage'] || `${field.title}不能为空`,
                    trigger: 'blur'
                })
            }

            if (field['minLength'] !== undefined) {
                fieldRules.push({
                    min: field['minLength'],
                    message: `${field.title}长度不能少于${field['minLength']}个字符`,
                    trigger: 'blur'
                })
            }

            if (field.maxLength !== undefined) {
                fieldRules.push({
                    max: field.maxLength,
                    message: `${field.title}长度不能超过${field.maxLength}个字符`,
                    trigger: 'blur'
                })
            }

            if (field.min !== undefined) {
                fieldRules.push({
                    min: field.min,
                    message: `${field.title}不能小于${field.min}`,
                    trigger: 'blur'
                })
            }

            if (field.max !== undefined) {
                fieldRules.push({
                    max: field.max,
                    message: `${field.title}不能大于${field.max}`,
                    trigger: 'blur'
                })
            }

            if (field['pattern']) {
                fieldRules.push({
                    pattern: new RegExp(field['pattern']),
                    message: `${field.title}格式不正确`,
                    trigger: 'blur'
                })
            }





            if (fieldRules.length > 0) {
                rules[field.id] = fieldRules
            }
        }
    })
    return rules
})

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
        emit('submit', props.modelValue)
        ElMessage.success('表单验证通过')
    } catch (error) {
        ElMessage.error('表单验证失败，请检查输入')
    }
}

// 重置表单
const resetForm = () => {
    if (!formRef.value) return
    formRef.value.resetFields()
    emit('reset')
}

// 添加字段相关逻辑
const dialogVisible = ref(false)
const fieldTypes = [
    { label: '文本输入', value: 'INPUT' },
    { label: '数字输入', value: 'NUMBER' },
    { label: '下拉选择', value: 'SELECT' },
    { label: '单选按钮', value: 'RADIO' },
    { label: '多选框', value: 'CHECKBOX' },
    { label: '日期选择', value: 'DATE' },
    { label: '日期时间', value: 'DATETIME' },
    { label: '时间选择', value: 'TIME' },
    { label: '开关', value: 'SWITCH' },
    { label: '文本域', value: 'TEXTAREA' },
    { label: '文件上传', value: 'UPLOAD' },
    { label: '评分', value: 'RATE' },
    { label: '滑块', value: 'SLIDER' },
    { label: '颜色选择', value: 'COLOR' },
    { label: '级联选择', value: 'CASCADER' },
    { label: '自定义插槽', value: 'SLOT' }
]

const newField = reactive<NewField>({
    title: '',
    type: 'input',
    id: '',
    span: 24,
    placeholder: '',
    options: [],
    required: false,
    showValidation: false,
    minLength: 1,
    maxLength: 10,
})

const hasOptions = (type: string) => {
    return ['select', 'radio', 'checkbox', 'cascader'].includes(type)
}

const addField = () => {
    Object.assign(newField, {
        title: '',
        type: 'input',
        id: '',
        span: 24,
        placeholder: '',
        options: [],
        required: false,
        showValidation: false,
        disabled: false,
        defaultValue: ''
    })
    dialogVisible.value = true
}

const addOption = () => {
    newField.options.push({ label: '', value: '' })
}

const removeOption = (index: number) => {
    newField.options.splice(index, 1)
}

const confirmAddField = () => {
    if (!newField.title || !newField.id) {
        ElMessage.warning('请填写字段标题和ID')
        return
    }

    if (props.fields.some(field => field.id === newField.id)) {
        ElMessage.warning('该字段ID已存在，请使用不同的ID')
        return
    }

    const field: FormField = {
        title: newField.title,
        type: newField.type,
        id: newField.id,
        span: newField.span || 24,
        placeholder: newField.placeholder || `请输入${newField.title}`,
        disabled: newField.disabled,
        defaultValue: newField.defaultValue,
        required: newField.required,
        minLength: newField.minLength,
        maxLength: newField.maxLength,
        min: newField.min,
        max: newField.max,
        pattern: newField.pattern,
        errorMessage: newField.errorMessage
    }

    // 类型特定属性
    if (hasOptions(newField.type)) {
        field.options = [...newField.options]
    }

    if (newField.type === 'select') {
        field.multiple = newField.multiple
        field.filterable = newField.filterable
    }

    if (newField.type === 'checkbox') {
        field.minChecked = newField.minChecked
        field.maxChecked = newField.maxChecked
    }

    if (newField.type === 'date' || newField.type === 'datetime') {
        field.shortcuts = newField.shortcuts
    }

    if (newField.type === 'upload') {
        field.action = newField.action
        field.limit = newField.limit
        field.drag = newField.drag
    }

    // 创建新数组并触发更新
    const updatedFields = [...props.fields, field]
    emit('update:fields', updatedFields)

    // 更新表单数据
    const newFormData = { ...props.modelValue }
    switch (field.type) {
        case 'checkbox':
            newFormData[field.id] = []
            break
        case 'number':
            newFormData[field.id] = field.defaultValue || 0
            break
        case 'switch':
            newFormData[field.id] = field.defaultValue || false
            break
        case 'rate':
            newFormData[field.id] = field.defaultValue || 0
            break
        case 'slider':
            newFormData[field.id] = field.defaultValue || 0
            break
        case 'upload':
            newFormData[field.id] = field.defaultValue || []
            break
        default:
            newFormData[field.id] = field.defaultValue || null
    }
    emit('update:modelValue', newFormData)

    dialogVisible.value = false
    ElMessage.success('字段添加成功')
}
</script>

<style scoped>
.dynamic-form-container {
    margin: 20px auto;
    padding: 20px;
}

.option-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.el-form-item {
    margin-bottom: 18px;
}

.el-input,
.el-select,
.el-date-editor,
.el-textarea {
    width: 100%;
}

.el-upload__tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 7px;
}
</style>