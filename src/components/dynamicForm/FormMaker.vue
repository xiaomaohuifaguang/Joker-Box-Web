<template>
    <div class="dynamic-form-container">
        <el-form ref="formRef" :model="modelValue" :rules="formRules" label-position="top">
            <el-row :gutter="20" v-if="props.type == 'create'">
                <draggable v-model="newFormFields" item-key="fieldId" class="draggable-row">
                    <template #item="{ element }" style="width: 100%;">
                        <el-col :key="element.fieldId" :span="element.span || 24" class="draggable-col">
                            <div class="form-item-container">
                                <el-form-item :label="element.title" :prop="element.fieldId">
                                    <!-- 文本输入框 -->
                                    <el-input v-if="element.type === 'INPUT'" v-model="modelValue[element.fieldId]"
                                        :placeholder="element.placeholder" clearable style="width: 100%;"
                                        :maxlength="element.maxLength" :minlength="element.minLength" />
                                    <!-- 数字输入框 -->
                                    <el-input-number v-else-if="element.type === 'NUMBER'"
                                        v-model="modelValue[element.fieldId]" :placeholder="element.placeholder"
                                        style="width: 100%;" :min="element.min ?? -Infinity
                                            " :max="element.max ?? Infinity" />
                                    <!-- 文本域 -->
                                    <el-input v-else-if="element.type === 'TEXTAREA'"
                                        v-model="modelValue[element.fieldId]" type="textarea" :autosize="{
                                            minRows: element.min ?? 2,
                                            maxRows: element.max ?? 4
                                        }" :placeholder="element.placeholder" style="width: 100%;"
                                        :minlength="element.minLength" :maxlength="element.maxLength" />

                                    <!-- 评分 -->
                                    <el-rate v-else-if="element.type === 'RATE'" v-model="modelValue[element.fieldId]"
                                        :max="element.max || 5" />

                                    <!-- 下拉选择框单选 -->
                                    <el-select v-else-if="element.type === 'SELECT'"
                                        v-model="modelValue[element.fieldId]" :placeholder="element.placeholder"
                                        clearable>
                                        <el-option v-for="item in element.options || []" :key="item.value"
                                            :label="item.label" :value="item.value" style="width: 100%;" />
                                    </el-select>

                                    <!-- 下拉选择框多选 -->
                                    <el-select v-else-if="element.type === 'MULTISELECT'"
                                        v-model="modelValue[element.fieldId]" :placeholder="element.placeholder"
                                        clearable multiple>
                                        <el-option v-for="item in element.options || []" :key="item.value"
                                            :label="item.label" :value="item.value" style="width: 100%;" />
                                    </el-select>

                                    <!-- 单选按钮组 -->
                                    <el-radio-group v-else-if="element.type === 'RADIO'"
                                        v-model="modelValue[element.fieldId]" style="width: 100%;">
                                        <el-radio v-for="item in element.options || []" :key="item.value"
                                            :value="item.value" :label="item.label">
                                            {{ item.label }}
                                        </el-radio>
                                    </el-radio-group>

                                    <!-- 多选框 -->
                                    <el-checkbox-group v-else-if="element.type === 'CHECKBOX'"
                                        v-model="modelValue[element.fieldId]" style="width: 100%;">
                                        <el-checkbox v-for="item in element.options || []" :key="item.value"
                                            :value="item.value" :label="item.label">
                                            {{ item.label }}
                                        </el-checkbox>
                                    </el-checkbox-group>

                                    <!-- 级联选择 -->
                                    <el-cascader v-else-if="element.type === 'CASCADER'"
                                        v-model="modelValue[element.fieldId]" :options="element.options"
                                        :placeholder="element.placeholder" style="width: 100%;" :props="{
                                            multiple: false,
                                            // emitPath: false
                                        }" />
                                    <el-cascader v-else-if="element.type === 'MULTICASCADER'"
                                        v-model="modelValue[element.fieldId]" :options="element.options"
                                        :placeholder="element.placeholder" style="width: 100%;" :props="{
                                            multiple: true,
                                            // emitPath: false
                                        }" />

                                    <!-- 开关 -->
                                    <el-switch v-else-if="element.type === 'SWITCH'"
                                        v-model="modelValue[element.fieldId]" style="width: 100%;" />

                                    <!-- 颜色选择器 -->
                                    <el-color-picker v-else-if="element.type === 'COLOR'"
                                        v-model="modelValue[element.fieldId]" />

                                    <!-- 滑块 -->
                                    <el-slider v-else-if="element.type === 'SLIDER'"
                                        v-model="modelValue[element.fieldId]" :min="element.min || 0"
                                        :max="element.max || 100" show-input />

                                    <!-- 日期选择器 -->
                                    <el-date-picker v-else-if="element.type === 'DATE'"
                                        v-model="modelValue[element.fieldId]" type="date"
                                        :placeholder="element.placeholder" value-format="YYYY-MM-DD"
                                        style="width: 100%;" />

                                    <!-- 日期时间选择器 -->
                                    <el-date-picker v-else-if="element.type === 'DATETIME'"
                                        v-model="modelValue[element.fieldId]" type="datetime"
                                        :placeholder="element.placeholder" value-format="YYYY-MM-DD HH:mm:ss" />

                                    <!-- 时间选择器 -->
                                    <el-time-picker v-else-if="element.type === 'TIME'"
                                        v-model="modelValue[element.fieldId]" :placeholder="element.placeholder"
                                        value-format="HH:mm:ss" style="width: 100%;" />
                                    <!-- 日期区间选择器 -->
                                    <el-date-picker v-else-if="element.type === 'DATERANGE'"
                                        v-model="modelValue[element.fieldId]" type="daterange" unlink-panels
                                        range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
                                        :placeholder="element.placeholder" value-format="YYYY-MM-DD"
                                        style="width: 100%;" />

                                </el-form-item>
                                <!-- <el-button class="edit-btn" type="warning" size="small" @click.stop="editField()" circle
                                    :icon="Edit" /> -->
                                <el-button class="delete-btn" type="danger" size="small"
                                    @click.stop="removeField(element.fieldId)" circle :icon="Delete" />
                            </div>
                        </el-col>
                    </template>
                </draggable>
            </el-row>
            <el-row :gutter="20" v-else-if="props.type == 'view' || props.type == 'edit'">
                <el-col v-for="(field, index) in newFormFields" :key="field.fieldId" :span="field.span || 24">
                    <div class="form-item-container">
                        <el-form-item :label="field.title" :prop="field.fieldId">
                            <!-- 文本输入框 -->
                            <el-input v-if="field.type === 'INPUT'" v-model="modelValue[field.fieldId]"
                                :placeholder="field.placeholder" clearable style="width: 100%;"
                                :maxlength="field.maxLength" :minlength="field.minLength" />
                            <!-- 数字输入框 -->
                            <el-input-number v-else-if="field.type === 'NUMBER'" v-model="modelValue[field.fieldId]"
                                :placeholder="field.placeholder" style="width: 100%;" :min="field.min ?? -Infinity
                                    " :max="field.max ?? Infinity" />
                            <!-- 文本域 -->
                            <el-input v-else-if="field.type === 'TEXTAREA'" v-model="modelValue[field.fieldId]"
                                type="textarea" :autosize="{
                                    minRows: field.min ?? 2,
                                    maxRows: field.max ?? 4
                                }" :placeholder="field.placeholder" style="width: 100%;" :minlength="field.minLength"
                                :maxlength="field.maxLength" />

                            <!-- 评分 -->
                            <el-rate v-else-if="field.type === 'RATE'" v-model="modelValue[field.fieldId]"
                                :max="field.max || 5" />

                            <!-- 下拉选择框单选 -->
                            <el-select v-else-if="field.type === 'SELECT'" v-model="modelValue[field.fieldId]"
                                :placeholder="field.placeholder" clearable>
                                <el-option v-for="item in field.options || []" :key="item.value" :label="item.label"
                                    :value="item.value" style="width: 100%;" />
                            </el-select>

                            <!-- 下拉选择框多选 -->
                            <el-select v-else-if="field.type === 'MULTISELECT'" v-model="modelValue[field.fieldId]"
                                :placeholder="field.placeholder" clearable multiple>
                                <el-option v-for="item in field.options || []" :key="item.value" :label="item.label"
                                    :value="item.value" style="width: 100%;" />
                            </el-select>

                            <!-- 单选按钮组 -->
                            <el-radio-group v-else-if="field.type === 'RADIO'" v-model="modelValue[field.fieldId]"
                                style="width: 100%;">
                                <el-radio v-for="item in field.options || []" :key="item.value" :value="item.value"
                                    :label="item.label">
                                    {{ item.label }}
                                </el-radio>
                            </el-radio-group>

                            <!-- 多选框 -->
                            <el-checkbox-group v-else-if="field.type === 'CHECKBOX'" v-model="modelValue[field.fieldId]"
                                style="width: 100%;" :min="field.min" :max="field.max">
                                <el-checkbox v-for="item in field.options || []" :key="item.value" :value="item.value"
                                    :label="item.label">
                                    {{ item.label }}
                                </el-checkbox>
                            </el-checkbox-group>

                            <!-- 级联选择 -->
                            <el-cascader v-else-if="field.type === 'CASCADER'" v-model="modelValue[field.fieldId]"
                                :options="field.options" :placeholder="field.placeholder" style="width: 100%;" :props="{
                                    multiple: false,
                                    // emitPath: false
                                }" />
                            <el-cascader v-else-if="field.type === 'MULTICASCADER'" v-model="modelValue[field.fieldId]"
                                :options="field.options" :placeholder="field.placeholder" style="width: 100%;" :props="{
                                    multiple: true,
                                    // emitPath: false
                                }" />

                            <!-- 开关 -->
                            <el-switch v-else-if="field.type === 'SWITCH'" v-model="modelValue[field.fieldId]"
                                style="width: 100%;" />

                            <!-- 颜色选择器 -->
                            <el-color-picker v-else-if="field.type === 'COLOR'" v-model="modelValue[field.fieldId]" />

                            <!-- 滑块 -->
                            <el-slider v-else-if="field.type === 'SLIDER'" v-model="modelValue[field.fieldId]"
                                :min="field.min || 0" :max="field.max || 100" show-input />

                            <!-- 日期选择器 -->
                            <el-date-picker v-else-if="field.type === 'DATE'" v-model="modelValue[field.fieldId]"
                                type="date" :placeholder="field.placeholder" value-format="YYYY-MM-DD"
                                style="width: 100%;" />

                            <!-- 日期时间选择器 -->
                            <el-date-picker v-else-if="field.type === 'DATETIME'" v-model="modelValue[field.fieldId]"
                                type="datetime" :placeholder="field.placeholder" value-format="YYYY-MM-DD HH:mm:ss" />

                            <!-- 时间选择器 -->
                            <el-time-picker v-else-if="field.type === 'TIME'" v-model="modelValue[field.fieldId]"
                                :placeholder="field.placeholder" value-format="HH:mm:ss" style="width: 100%;" />
                            <!-- 日期区间选择器 -->
                            <el-date-picker v-else-if="field.type === 'DATERANGE'" v-model="modelValue[field.fieldId]"
                                type="daterange" unlink-panels range-separator="至" start-placeholder="开始时间"
                                end-placeholder="结束时间" :placeholder="field.placeholder" value-format="YYYY-MM-DD"
                                style="width: 100%;" />

                        </el-form-item>
                    </div>
                </el-col>
            </el-row>
        </el-form>
        <div class="form-actions">
            <el-button type="primary" @click="addFieldOpen" v-if="props.type == 'create'">添加新字段</el-button>
            <el-button type="primary" @click="verify"
                v-if="props.type == 'create' || props.type == 'view'">验证表单</el-button>
        </div>
        <el-dialog v-if="addFiledDialog" v-model="addFiledDialog" title="编辑字段">
            <div class="dialog-content" v-loading="newFieldLoading">
                <el-form ref="newFieldFormRef" :rules="newFieldFormRules" :model="newFieldParams" label-position="top">
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-form-item label="fieldId" prop="fieldId">
                                <el-input v-model="newFieldParams.fieldId" placeholder="" disabled>
                                    <template #append>
                                        <el-button type="primary"
                                            @click="newFieldParams.fieldId = randomId('field_')">重新生成</el-button>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="标题" prop="title">
                                <el-input v-model="newFieldParams.title" placeholder="请填写标题" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="字段类型" prop="type">
                                <el-select v-model="newFieldParams.type" placeholder="请选择字段类型">
                                    <el-option v-for="item in fieldTypes" :label="item.label" :value="item.value" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="提示" prop="placeholder">
                                <el-input v-model="newFieldParams.placeholder" placeholder="提示词" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="必填" prop="required">
                                <el-switch v-model="newFieldParams.required" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="24"
                            v-if="['SELECT', 'MULTISELECT', 'CASCADER', 'MULTICASCADER', 'RADIO', 'CHECKBOX'].includes(newFieldParams.type)">
                            <el-form-item>
                                <el-button type="primary" @click="optionsDialog = true">选项管理器</el-button>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24" v-if="['INPUT', 'TEXTAREA'].includes(newFieldParams.type)">
                            <el-form-item label="默认值" prop="defaultValue">
                                <el-input v-model="newFieldParams.defaultValue" placeholder="填写默认值" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="24" v-if="['SELECT', 'RADIO'].includes(newFieldParams.type)">
                            <el-form-item label="默认值" prop="defaultValue">
                                <el-select v-model="newFieldParams.defaultValue" placeholder="选择默认值" clearable>
                                    <el-option v-for="item in newFieldParams.options" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24" v-if="['MULTISELECT', 'CHECKBOX'].includes(newFieldParams.type)">
                            <el-form-item label="默认值" prop="defaultValue">
                                <el-select v-model="newFieldParams.defaultValue" placeholder="选择默认值" clearable multiple>
                                    <el-option v-for="item in newFieldParams.options" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24" v-if="['CASCADER'].includes(newFieldParams.type)">
                            <el-form-item label="默认值" prop="defaultValue">
                                <!-- 级联选择 -->
                                <el-cascader v-model="newFieldParams.defaultValue" :options="newFieldParams.options"
                                    clearable placeholder="选择默认值" style="width: 100%;" :props="{
                                        multiple: false,
                                        // emitPath: false
                                    }" />

                            </el-form-item>
                        </el-col>
                        <el-col :span="24" v-if="['MULTICASCADER'].includes(newFieldParams.type)">
                            <el-form-item label="默认值" prop="defaultValue">
                                <el-cascader v-model="newFieldParams.defaultValue" :options="newFieldParams.options"
                                    clearable placeholder="选择默认值" style="width: 100%;" :props="{
                                        multiple: true,
                                        // emitPath: false
                                    }" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="默认值" prop="span">
                                <el-input v-model="newFieldParams.span" placeholder="布局宽度1-24" style="width: 100%;" />
                            </el-form-item>

                        </el-col>
                        <el-col :span="12" v-if="['INPUT', 'TEXTAREA'].includes(newFieldParams.type)">
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="最小长度" prop="minLength">
                                        <el-input v-model="newFieldParams.minLength" placeholder="" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="最大长度" prop="maxLength">
                                        <el-input v-model="newFieldParams.maxLength" placeholder="" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-col>
                        <el-col :span="12" v-if="['NUMBER'].includes(newFieldParams.type)">
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="最小值" prop="min">
                                        <el-input v-model="newFieldParams.min" placeholder="" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="最大值" prop="max">
                                        <el-input v-model="newFieldParams.max" placeholder="" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-col>
                        <el-col :span="12" v-if="['TEXTAREA'].includes(newFieldParams.type)">
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="显示最小行数" prop="min">
                                        <el-input v-model="newFieldParams.min" placeholder="" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="显示最大行数" prop="max">
                                        <el-input v-model="newFieldParams.max" placeholder="" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-col>

                        <el-col :span="24">
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="正则验证" prop="pattern">
                                        <el-input v-model="newFieldParams.pattern"
                                            placeholder="例如：^[\u4e00-\u9fa5]{2,4}$" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="正则验证提示" prop="patternTips">
                                        <el-input v-model="newFieldParams.patternTips" placeholder="例：格式不正确" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-form>
                <div style="text-align: center;">
                    <el-button @click="addFieldFun" type="primary">确定</el-button>
                    <el-button @click="addFiledDialog = false" type="info">取消</el-button>
                </div>
            </div>
        </el-dialog>
        <el-dialog v-model="optionsDialog" width="60%">
            <div class="options-manager-container">
                <OptionsMaker v-model:options="newFieldParams.options" :type="newFieldParams.type" />
            </div>
            <template #footer>
                <div style="text-align: center;">
                    <el-button @click="optionsDialog = false" type="info">关闭</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang='ts'>
import { computed, watch } from 'vue';
import { type FormField, FormFieldType } from './types'
import type { FormInstance, FormRules, FormItemRule } from 'element-plus'
import { ref } from 'vue';
import { alert, randomId } from '@/utils';
import OptionsMaker from '@/components/dynamicForm/OptionsMaker.vue';
import draggable from 'vuedraggable'
import { Delete, Edit } from '@element-plus/icons-vue'

const props = defineProps({
    formFields: {
        type: Array as () => FormField[],
        required: true,
        default: () => []
    },
    modelValue: {
        type: Object,
        required: true,
        default: () => ({})
    },
    formId: {
        type: String,
        required: false,
        default: () => null
    },
    formInstanceId: {
        type: String,
        required: false,
        default: () => null
    },
    type: {
        type: String as () => 'view' | 'edit' | 'create',
        required: true,
        default: () => 'view'
    }
})

// 使用计算属性来处理表单字段
const newFormFields = computed({
    get() {
        return props.formFields
    },
    set(value) {
        emit('update:fields', value)
    }
})

// 表单引用
const formRef = ref<FormInstance>()

const emit = defineEmits(['update:fields', 'update:modelValue'])


// 编辑表单项
const editField = () => {
    alert('此功能暂未开发', 'warning')
}

// 删除表单项
const removeField = (fieldId: string) => {
    const updatedFields = props.formFields.filter(field => field.fieldId !== fieldId)
    emit('update:fields', updatedFields)

    // 从modelValue中移除对应的字段
    const newModelValue = { ...props.modelValue }
    delete newModelValue[fieldId]
    emit('update:modelValue', newModelValue)
}

// 规则生成
const formRules = computed<FormRules>(() => {
    const rules: FormRules = {}
    props.formFields.forEach(field => {
        const itemRules: FormItemRule[] = []
        if (field.required && (field.required === true || field.required === "true")) {
            itemRules.push({
                required: true,
                message: field.title + '不能为空',
                trigger: 'change'
            })
        }

        if (field.pattern && field.pattern !== '') {
            itemRules.push({
                pattern: new RegExp(field['pattern']),
                message: field.patternTips ? field.patternTips : `${field.title}格式不正确`,
                trigger: 'change'
            })
        }

        if (!props.modelValue.hasOwnProperty(field.fieldId)) {
            if (field.defaultValue !== undefined) {
                // 更新表单数据
                const newFormData = { ...props.modelValue }
                switch (field.type) {
                    case 'CHECKBOX':
                        newFormData[field.fieldId] = field.defaultValue || []
                        break
                    case 'NUMBER':
                        newFormData[field.fieldId] = Number(field.defaultValue) || 0
                        break
                    case 'SWITCH':
                        newFormData[field.fieldId] = field.defaultValue || false
                        break
                    case 'RATE':
                        newFormData[field.fieldId] = field.defaultValue || 0
                        break
                    case 'SLIDER':
                        newFormData[field.fieldId] = field.defaultValue || 0
                        break
                    default:
                        newFormData[field.fieldId] = field.defaultValue || null
                }
                emit('update:modelValue', newFormData)
            }
        }

        if (itemRules.length > 0) {
            rules[field.fieldId] = itemRules
        }
    })

    return rules
})

// 验证表单
const verify = async () => {
    if (!formRef.value) return
    try {
        await formRef.value.validate();
        return true;
    } catch (error) {
        return false;
    }
}

// 添加修改表单项 
const addFiledDialog = ref(false)
const newFieldFormRef = ref(null)
const newFieldLoading = ref(false)
const fieldTypes = [
    { label: '文本输入', value: 'INPUT' },
    { label: '数字输入', value: 'NUMBER' },
    { label: '下拉选择单选', value: 'SELECT' },
    { label: '下拉选择多选', value: 'MULTISELECT' },
    { label: '勾选框单选', value: 'RADIO' },
    { label: '勾选框复选', value: 'CHECKBOX' },
    { label: '日期选择', value: 'DATE' },
    { label: '日期时间', value: 'DATETIME' },
    { label: '时间选择', value: 'TIME' },
    { label: '开关', value: 'SWITCH' },
    { label: '文本域', value: 'TEXTAREA' },
    { label: '文件上传', value: 'UPLOAD' },
    { label: '评分', value: 'RATE' },
    { label: '滑块', value: 'SLIDER' },
    { label: '颜色选择', value: 'COLOR' },
    { label: '级联选择单选', value: 'CASCADER' },
    { label: '级联选择多选', value: 'MULTICASCADER' },
]

const newFieldParams = ref<{
    fieldId: string;
    type: FormFieldType;
    title: string;
    required: boolean;
    defaultValue: any;
    placeholder: string | null;
    options: any[] | null;
    minLength: number | null;
    maxLength: number | null;
    min: number | null;
    max: number | null;
    pattern: string | null;
    patternTips: string | null;
    span?: number // 宽度
}>({
    fieldId: randomId('field_'),
    type: 'INPUT',
    title: '',
    required: false,
    defaultValue: null,
    placeholder: null,
    options: null,
    minLength: null,
    maxLength: null,
    min: null,
    max: null,
    pattern: null,
    patternTips: null,
    span: 24 // 宽度
})

const optionsDialog = ref(false)
const newFieldFormRules = ref<FormRules>({
    fieldId: [
        { required: true, message: 'id不能为空', trigger: 'change' },
        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'change' }
    ],
    title: [
        { required: true, message: '标题不能为空', trigger: 'change' },
        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'change' }
    ],
    type: [
        { required: true, message: '类型不能为空', trigger: 'change' }
    ]
})

const addFieldOpen = () => {
    addFiledDialog.value = true;
    newFieldParams.value = {
        fieldId: randomId('field_'),
        type: 'INPUT',
        title: '',
        required: false,
        defaultValue: null,
        placeholder: null,
        options: null,
        minLength: null,
        maxLength: null,
        min: null,
        max: null,
        pattern: null,
        patternTips: null,
        span: 24
    }
}

const addFieldFun = async () => {
    newFieldLoading.value = true
    if (!formRef.value) return
    try {
        await newFieldFormRef.value.validate();
        const field: FormField = {
            fieldId: newFieldParams.value.fieldId,
            type: newFieldParams.value.type,
            title: newFieldParams.value.title,
            required: newFieldParams.value.required,
            defaultValue: newFieldParams.value.defaultValue,
            placeholder: newFieldParams.value.placeholder,
            options: newFieldParams.value.options,
            minLength: newFieldParams.value.minLength,
            maxLength: newFieldParams.value.maxLength,
            min: newFieldParams.value.min,
            max: newFieldParams.value.max,
            pattern: newFieldParams.value.pattern,
            patternTips: newFieldParams.value.patternTips,
            span: newFieldParams.value.span
        }
        // 创建新数组并触发更新
        const updatedFields = [...props.formFields, field]
        emit('update:fields', updatedFields)

        // 更新表单数据
        const newFormData = { ...props.modelValue }
        switch (field.type) {
            case 'CHECKBOX':
                newFormData[field.fieldId] = []
                break
            case 'NUMBER':
                newFormData[field.fieldId] = Number(field.defaultValue) || 0
                break
            case 'SWITCH':
                newFormData[field.fieldId] = field.defaultValue || false
                break
            case 'RATE':
                newFormData[field.fieldId] = field.defaultValue || 0
                break
            case 'SLIDER':
                newFormData[field.fieldId] = field.defaultValue || 0
                break
            default:
                newFormData[field.fieldId] = field.defaultValue || null
        }
        emit('update:modelValue', newFormData)

        addFiledDialog.value = false
        return true;

    } catch (error) {
        return false;
    } finally {
        newFieldLoading.value = false
    }
}

defineExpose({
    verify
})
</script>

<style scoped>
/* 主容器样式 */
.dynamic-form-container {
    background-color: var(--el-bg-color);
    padding: 20px;
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
}

/* 表单行样式 */
.el-row {
    margin-bottom: 20px;
}

/* 表单项容器 */
.form-item-container {
    position: relative;
    padding: 1rem;
    margin-bottom: 1rem;
    background-color: var(--el-fill-color-lighter);
    border-radius: var(--el-border-radius-base);
    transition: all 0.3s var(--el-transition-function-ease-in-out-bezier);
    border: 1px solid var(--el-border-color-light);
}

/* 拖拽相关样式 */
.draggable-row {
    display: contents;
}

.draggable-col {
    margin-bottom: 16px;
    transition: all 0.3s;
    padding-left: 8px;
    padding-right: 8px;
}

/* 拖拽时的样式 */
.draggable-col.sortable-chosen {
    background-color: var(--el-color-primary-light-9);
    border: 1px dashed var(--el-color-primary);
    cursor: move;
}

/* 拖拽占位样式 */
.draggable-col.sortable-ghost {
    background-color: var(--el-color-primary-light-8);
    border: 1px dashed var(--el-color-primary-light-3);
    opacity: 0.6;
}

/* 拖拽预览样式 */
.draggable-col.sortable-drag {
    opacity: 0.9;
    box-shadow: var(--el-box-shadow-light);
    transform: scale(1.02);
}


/* 修改按钮样式 */
.edit-btn {
    position: absolute;
    right: 50px;
    top: 55%;
    transform: translateY(-50%);
    background-color: var(--el-color-warning);
    color: white;
    border: none;
    transition: all 0.2s;
}

.edit-btn:hover {
    background-color: var(--el-color-warning-light-3);
    transform: translateY(-50%) scale(1.1);
}

/* 删除按钮样式 */
.delete-btn {
    position: absolute;
    right: 20px;
    top: 45%;
    transform: translateY(-50%);
    background-color: var(--el-color-danger);
    color: white;
    border: none;
    transition: all 0.2s;
}

.delete-btn:hover {
    background-color: var(--el-color-danger-light-3);
    transform: translateY(-50%) scale(1.1);
}

/* 操作按钮区域 */
.form-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

/* 对话框内容样式 */
.dialog-content {
    padding: 16px;
    background-color: var(--el-bg-color);
    border-radius: var(--el-border-radius-base);
}

/* 选项管理器容器 */
.options-manager-container {
    background-color: var(--el-fill-color-lighter);
    padding: 16px;
    border-radius: var(--el-border-radius-base);
    border: 1px solid var(--el-border-color-light);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .el-col {
        width: 100%;
    }

    .form-item-container {
        padding: 12px;
    }

    .form-actions {
        flex-direction: column;
        align-items: stretch;
    }
}

/* 表单标签增强样式 */
:deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--el-text-color-primary);
}

/* 输入框增强样式 */
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
    border-radius: var(--el-border-radius-base);
}

/* 选择器增强样式 */
:deep(.el-select) {
    width: 100%;
}

/* 日期选择器增强样式 */
:deep(.el-date-editor) {
    width: 100%;
}

/* 滑块增强样式 */
:deep(.el-slider) {
    margin-top: 12px;
    margin-bottom: 12px;
}

/* 开关增强样式 */
:deep(.el-switch) {
    margin-top: 8px;
}
</style>