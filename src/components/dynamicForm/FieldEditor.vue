<template>
    <el-dialog v-model="visible" :title="isEdit ? '编辑字段' : '添加字段'" width="720px" :close-on-click-modal="false"
        destroy-on-close>
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
                            <el-option v-for="item in FIELD_TYPE_OPTIONS" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="布局宽度 (1-24)" prop="span">
                        <el-input-number v-model="form.span" :min="1" :max="24" style="width: 100%" />
                    </el-form-item>
                </el-col>

                <el-col :span="12" v-if="props.groups && props.groups.length > 0">
                    <el-form-item label="所属分组">
                        <el-select v-model="form.groupId" clearable placeholder="未分组" style="width: 100%">
                            <el-option label="未分组" value="" />
                            <el-option v-for="g in props.groups" :key="g.id" :label="g.name || g.id" :value="g.id" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-else>
                    <el-form-item label="所属分组">
                        <el-input v-model="form.groupId" placeholder="不填则未分组；填写则新建分组" clearable />
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
                    <el-form-item label="选项来源">
                        <el-radio-group v-model="form.optionSourceType" @change="onOptionSourceChange">
                            <el-radio-button label="STATIC">静态选项</el-radio-button>
                            <el-radio-button label="API">远程 API</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <template v-if="hasOptions && form.optionSourceType === 'API'">
                    <el-col :span="24">
                        <div class="remote-option-section-header">
                            <div class="section-header-left">
                                <el-icon class="section-header-icon"><Connection /></el-icon>
                                <span class="section-header-title">远程选项配置</span>
                            </div>
                            <el-button size="small" round @click="remoteOptionHelpDialog = true">
                                <el-icon style="margin-right: 4px"><QuestionFilled /></el-icon>
                                使用说明
                            </el-button>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="API 地址">
                            <el-input v-model="form.optionSource.url" placeholder="/api/common/options/users" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="请求方式">
                            <el-select v-model="form.optionSource.method" style="width: 100%">
                                <el-option label="GET" value="GET" />
                                <el-option label="POST" value="POST" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="请求参数">
                            <div class="param-builder">
                                <div v-for="(param, idx) in form.optionParams" :key="idx" class="param-row">
                                    <el-input v-model="param.key" placeholder="参数名" class="param-key" />
                                    <el-select v-model="param.valueType" class="param-type" @change="param.valueType === 'ref' && (param.staticValue = '')">
                                        <el-option label="静态值" value="static" />
                                        <el-option label="引用字段" value="ref" />
                                    </el-select>
                                    <el-select v-if="param.valueType === 'ref'" v-model="param.refFieldId"
                                        placeholder="选择字段" filterable clearable class="param-value">
                                        <el-option v-for="f in existingFieldIds" :key="f" :label="f" :value="f" />
                                    </el-select>
                                    <el-input v-else v-model="param.staticValue" placeholder="值" class="param-value" />
                                    <el-button type="danger" :icon="Delete" circle @click="form.optionParams.splice(idx, 1)" />
                                </div>
                                <el-button type="primary" plain size="small" @click="form.optionParams.push({ key: '', valueType: 'static', staticValue: '', refFieldId: '' })">
                                    + 添加参数
                                </el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="选项数组路径">
                            <el-input v-model="optionMapping.listPath" placeholder="例如 data，根数组填 $" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="显示文本路径">
                            <el-input v-model="optionMapping.labelPath" placeholder="例如 name" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="提交值路径">
                            <el-input v-model="optionMapping.valuePath" placeholder="例如 id" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="['CASCADER', 'MULTICASCADER'].includes(form.type)">
                        <el-form-item label="子选项路径">
                            <el-input v-model="optionMapping.childrenPath" placeholder="例如 children" />
                        </el-form-item>
                    </el-col>
                </template>
                <el-col :span="24" v-if="hasOptions && form.optionSourceType === 'STATIC'">
                    <el-form-item label="选项管理">
                        <el-button type="primary" plain @click="optionsDialog = true">
                            <el-icon>
                                <Setting />
                            </el-icon>
                            <span>打开选项管理器（已配置 {{ form.options?.length || 0 }} 项）</span>
                        </el-button>
                    </el-form-item>
                </el-col>

                <!-- 级联配置 -->
                <el-col :span="12" v-if="['CASCADER', 'MULTICASCADER'].includes(form.type)">
                    <el-form-item label="允许选择中间节点">
                        <el-switch :model-value="form.props?.checkStrictly ?? false"
                            @update:model-value="(v: boolean) => setProp('checkStrictly', v)" />
                    </el-form-item>
                </el-col>

                <!-- 动态表格列管理 -->
                <el-col :span="24" v-if="hasColumns">
                    <el-form-item label="列管理">
                        <el-button type="primary" plain @click="columnsDialog = true">
                            <el-icon>
                                <Setting />
                            </el-icon>
                            <span>配置表格列（已配置 {{ form.columns?.length || 0 }} 列）</span>
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
                        <el-input v-if="form.optionSourceType === 'API'" v-model="form.defaultValue" placeholder="远程选项默认值（可选）" />
                        <el-select v-else v-model="form.defaultValue" clearable style="width: 100%">
                            <el-option v-for="item in form.options || []" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'MULTISELECT' || form.type === 'CHECKBOX'">
                    <el-form-item label="默认值">
                        <el-select v-model="form.defaultValue" clearable multiple style="width: 100%">
                            <el-option v-for="item in form.options || []" :key="item.value" :label="item.label"
                                :value="item.value" />
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
                <el-col :span="24" v-if="form.type === 'DATE'">
                    <el-form-item label="默认值">
                        <el-date-picker v-model="form.defaultValue" type="date" value-format="YYYY-MM-DD" placeholder="选择默认日期" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'DATETIME'">
                    <el-form-item label="默认值">
                        <el-date-picker v-model="form.defaultValue" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择默认日期时间" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'TIME'">
                    <el-form-item label="默认值">
                        <el-time-picker v-model="form.defaultValue" value-format="HH:mm:ss" placeholder="选择默认时间" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'DATERANGE'">
                    <el-form-item label="默认值">
                        <el-date-picker v-model="form.defaultValue" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" />
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

                <!-- 文件上传数量限制 -->
                <el-col :span="12" v-if="form.type === 'UPLOAD'">
                    <el-form-item label="最少上传数量">
                        <el-input-number v-model="form.minLength" :min="0" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.type === 'UPLOAD'">
                    <el-form-item label="最多上传数量">
                        <el-input-number v-model="form.maxLength" :min="1" style="width: 100%" />
                    </el-form-item>
                </el-col>

                <!-- TABLE 行数约束 -->
                <el-col :span="12" v-if="form.type === 'TABLE'">
                    <el-form-item label="最少行数">
                        <el-input-number v-model="form.min" :min="0" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.type === 'TABLE'">
                    <el-form-item label="最多行数">
                        <el-input-number v-model="form.max" :min="1" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.type === 'TABLE'">
                    <el-form-item label="默认行数据">
                        <el-button type="primary" plain @click="defaultRowsDialog = true">
                            配置默认行（已配置 {{ Array.isArray(form.defaultValue) ? form.defaultValue.length : 0 }} 行）
                        </el-button>
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

                <el-col :span="12" v-if="hasPattern">
                    <el-form-item label="正则校验">
                        <el-input v-model="form.pattern" placeholder="例：^[一-龥]{2,4}$">
                            <template #append>
                                <el-button @click="patternPickerVisible = true" title="选择常用正则">
                                    <el-icon><Collection /></el-icon>
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12" v-if="hasPattern">
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

        <el-dialog v-model="columnsDialog" title="配置表格列" width="500px" append-to-body destroy-on-close>
            <div class="columns-editor">
                <div v-for="(col, idx) in form.columns" :key="idx" class="column-row">
                    <el-input v-model="col.key" placeholder="列标识（如 name）" style="flex: 1" />
                    <el-input v-model="col.title" placeholder="列标题（如 姓名）" style="flex: 1" />
                    <el-button type="danger" :icon="Delete" circle @click="form.columns.splice(idx, 1)" />
                </div>
                <el-button type="primary" plain @click="addColumn" style="width: 100%">添加列</el-button>
            </div>
            <template #footer>
                <el-button type="primary" @click="columnsDialog = false">完成</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="defaultRowsDialog" title="配置默认行数据" width="700px" append-to-body destroy-on-close>
            <div v-if="form.columns && form.columns.length > 0" class="default-rows-editor">
                <el-table :data="form.defaultValue || []" border style="width: 100%">
                    <el-table-column v-for="col in form.columns" :key="col.key" :label="col.title" :prop="col.key"
                        min-width="120">
                        <template #default="{ row }">
                            <el-input v-model="row[col.key]" placeholder="可选" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="60" fixed="right">
                        <template #default="{ $index }">
                            <el-button type="danger" :icon="Delete" circle @click="removeDefaultRow($index)" />
                        </template>
                    </el-table-column>
                </el-table>
                <el-button type="primary" plain @click="addDefaultRow" style="margin-top: 10px; width: 100%">
                    添加默认行
                </el-button>
            </div>
            <el-empty v-else description="请先配置表格列" />
            <template #footer>
                <el-button type="primary" @click="defaultRowsDialog = false">完成</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="remoteOptionHelpDialog" title="远程选项配置说明" width="680px" append-to-body>
            <div class="remote-option-help-content">
                <section>
                    <h4>1. 请求参数 JSON</h4>
                    <p>左侧 key 是发给后端的参数名，<code>{ "$field": "字段ID" }</code> 表示取表单内某个字段的当前值。</p>
                    <pre>{
  "departmentId": { "$field": "deptId" },
  "enabled": true
}</pre>
                    <p>如果表单当前值为 <code>{ "deptId": 1001 }</code>，实际请求参数就是 <code>{ "departmentId": 1001, "enabled": true }</code>。</p>
                </section>
                <section>
                    <h4>2. 返回数据路径</h4>
                    <p>“选项数组路径”表示从接口响应中哪里取选项数组；根响应就是数组时填 <code>$</code>。</p>
                    <pre>{
  "data": [
    { "id": 1, "name": "张三" },
    { "id": 2, "name": "李四" }
  ]
}</pre>
                    <p>对应配置：选项数组路径 <code>data</code>，显示文本路径 <code>name</code>，提交值路径 <code>id</code>。</p>
                </section>
                <section>
                    <h4>3. 级联选项</h4>
                    <p>级联字段需要配置“子选项路径”，通常填 <code>children</code>。</p>
                    <pre>{
  "listPath": "data",
  "labelPath": "name",
  "valuePath": "code",
  "childrenPath": "children"
}</pre>
                </section>
            </div>
            <template #footer>
                <el-button type="primary" @click="remoteOptionHelpDialog = false">知道了</el-button>
            </template>
        </el-dialog>

        <PatternPresetPicker
            v-model="patternPickerVisible"
            @select="({ pattern, patternTips }) => {
                form.pattern = pattern
                form.patternTips = patternTips
            }"
        />
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Setting, Connection, QuestionFilled, Collection } from '@element-plus/icons-vue'
import PatternPresetPicker from './PatternPresetPicker.vue'
import { alert, randomId } from '@/utils'
import OptionsMaker from './OptionsMaker.vue'
import {
    FIELD_TYPE_OPTIONS,
    type FormField,
    type FormFieldType,
    type FormOptionMapping,
    type FormOptionSource,
    type FormTableColumn,
    parseSwitchValue,
} from './types'

const props = defineProps<{
    modelValue: boolean
    field?: FormField | null
    existingFieldIds: string[]
    groups?: { id: string; name: string }[]
    defaultGroupId?: string
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

interface ParamItem {
    key: string
    valueType: 'static' | 'ref'
    staticValue: string
    refFieldId: string
}

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
    groupId: string
    props: Record<string, any>
    columns: FormTableColumn[]
    optionSourceType: 'STATIC' | 'API'
    optionSource: FormOptionSource
    optionParams: ParamItem[]
}

const patternPickerVisible = ref(false)

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
    groupId: '',
    props: {},
    columns: [],
    optionSourceType: 'STATIC',
    optionSource: {
        type: 'STATIC',
        url: '/code-table/options',
        method: 'GET',
        mapping: {
            listPath: '$',
            labelPath: 'label',
            valuePath: 'value',
            childrenPath: 'children',
        },
    },
    optionParams: [{ key: 'code', valueType: 'static', staticValue: '', refFieldId: '' }],
})

const parseParamsToItems = (params: Record<string, any> | undefined): ParamItem[] => {
    if (!params || typeof params !== 'object') return []
    return Object.entries(params).map(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value) && typeof value.$field === 'string') {
            return { key, valueType: 'ref' as const, staticValue: '', refFieldId: value.$field }
        }
        return { key, valueType: 'static' as const, staticValue: value == null ? '' : String(value), refFieldId: '' }
    })
}

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
                defaultValue: f.type === 'SWITCH' ? parseSwitchValue(f.defaultValue) : (f.defaultValue ?? null),
                placeholder: f.placeholder ?? '',
                options: f.options ? JSON.parse(JSON.stringify(f.options)) : [],
                minLength: f.minLength,
                maxLength: f.maxLength,
                min: f.min,
                max: f.max,
                pattern: f.pattern ?? '',
                patternTips: f.patternTips ?? '',
                span: f.span ?? 24,
                groupId: f.groupId ?? '',
                props: f.props || {},
                columns: f.columns ? JSON.parse(JSON.stringify(f.columns)) : [],
                optionSourceType: f.optionSource?.type === 'API' ? 'API' : 'STATIC',
                optionSource: f.optionSource ? JSON.parse(JSON.stringify(f.optionSource)) : buildEmpty().optionSource,
                optionParams: parseParamsToItems(f.optionSource?.params),
            }
        } else {
            originalType.value = 'INPUT'
            form.value = buildEmpty()
            if (props.defaultGroupId) {
                form.value.groupId = props.defaultGroupId
            }
        }
    },
    { immediate: true },
)

const hasOptions = computed(() =>
    ['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'CASCADER', 'MULTICASCADER'].includes(form.value.type),
)

const hasPattern = computed(() =>
    ['INPUT', 'TEXTAREA'].includes(form.value.type),
)

const hasColumns = computed(() => form.value.type === 'TABLE')
const optionMapping = computed<FormOptionMapping>(() => {
    if (!form.value.optionSource.mapping) {
        form.value.optionSource.mapping = {
            listPath: 'data',
            labelPath: 'label',
            valuePath: 'value',
            childrenPath: 'children',
        }
    }
    return form.value.optionSource.mapping
})

const optionsDialog = ref(false)
const columnsDialog = ref(false)
const defaultRowsDialog = ref(false)
const remoteOptionHelpDialog = ref(false)

const onOptionSourceChange = (val: 'STATIC' | 'API') => {
    if (val === 'STATIC') {
        form.value.optionSource = { ...buildEmpty().optionSource }
        form.value.optionParams = []
    } else {
        form.value.options = []
        form.value.optionSource = { ...buildEmpty().optionSource, type: 'API' }
        form.value.optionParams = [{ key: 'code', valueType: 'static', staticValue: '', refFieldId: '' }]
        form.value.defaultValue = null
    }
}

const onTypeChange = () => {
    // 切换类型时清空与类型强相关的属性
    form.value.defaultValue = null
    form.value.options = []
    form.value.min = undefined
    form.value.max = undefined
    form.value.props = {}
    form.value.columns = []
    form.value.optionSourceType = 'STATIC'
    form.value.optionSource = buildEmpty().optionSource
    form.value.optionParams = [{ key: 'code', valueType: 'static', staticValue: '', refFieldId: '' }]
    if (form.value.type === 'UPLOAD') {
        form.value.maxLength = 1
    } else {
        form.value.minLength = undefined
        form.value.maxLength = undefined
    }
    if (!hasPattern.value) {
        form.value.pattern = ''
        form.value.patternTips = ''
    }
}

const setProp = (key: string, value: any) => {
    form.value.props = { ...form.value.props, [key]: value }
}

const addColumn = () => {
    form.value.columns.push({ key: `col_${Date.now()}`, title: '' })
}

const addDefaultRow = () => {
    if (!form.value.columns || form.value.columns.length === 0) return
    if (!Array.isArray(form.value.defaultValue)) {
        form.value.defaultValue = []
    }
    const row: Record<string, string> = {}
    form.value.columns.forEach(col => {
        row[col.key] = ''
    })
    form.value.defaultValue.push(row)
}

const removeDefaultRow = (index: number) => {
    if (!Array.isArray(form.value.defaultValue)) return
    form.value.defaultValue.splice(index, 1)
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
    if (hasOptions.value && form.value.optionSourceType === 'STATIC' && (!form.value.options || form.value.options.length === 0)) {
        alert('请添加至少一个选项', 'warning')
        return
    }
    let optionParams: Record<string, any> | undefined
    if (hasOptions.value && form.value.optionSourceType === 'API') {
        const items = form.value.optionParams
        if (items.length > 0) {
            optionParams = {}
            for (const item of items) {
                if (!item.key.trim()) {
                    alert('请求参数名不能为空', 'warning')
                    return
                }
                if (item.valueType === 'ref') {
                    if (!item.refFieldId.trim()) {
                        alert(`参数「${item.key}」引用的字段 ID 不能为空`, 'warning')
                        return
                    }
                    optionParams[item.key.trim()] = { $field: item.refFieldId.trim() }
                } else {
                    let val: any = item.staticValue
                    if (val === 'true') val = true
                    else if (val === 'false') val = false
                    else if (val !== '' && !isNaN(Number(val))) val = Number(val)
                    optionParams[item.key.trim()] = val
                }
            }
        }
    }
    if (hasColumns.value && (!form.value.columns || form.value.columns.length === 0)) {
        alert('请添加至少一列', 'warning')
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
        groupId: form.value.groupId || undefined,
        props: Object.keys(form.value.props).length > 0 ? form.value.props : undefined,
        columns: hasColumns.value ? form.value.columns : undefined,
        optionSource: hasOptions.value && form.value.optionSourceType === 'API'
            ? {
                type: 'API',
                url: form.value.optionSource.url,
                method: form.value.optionSource.method || 'GET',
                params: optionParams,
                mapping: form.value.optionSource.mapping,
            }
            : undefined,
    }
    emit('submit', f)
    visible.value = false
}
</script>

<style scoped>
.param-builder {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.param-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.param-key {
    width: 140px;
    flex-shrink: 0;
}

.param-type {
    width: 110px;
    flex-shrink: 0;
}

.param-value {
    flex: 1;
    min-width: 0;
}

.columns-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.column-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.default-rows-editor {
    width: 100%;
}

.remote-option-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 6px 0 10px;
    padding: 12px 16px;
    border-left: 4px solid var(--el-color-primary);
    border-radius: 8px;
    background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-fill-color-blank));
}

.section-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-header-icon {
    font-size: 18px;
    color: var(--el-color-primary);
}

.section-header-title {
    color: var(--el-text-color-primary);
    font-size: 14px;
    font-weight: 700;
}

.remote-option-help-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.remote-option-help-content section {
    padding: 12px 14px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    background: var(--el-fill-color-lighter);
}

.remote-option-help-content h4 {
    margin: 0 0 8px;
    color: var(--el-text-color-primary);
    font-size: 14px;
}

.remote-option-help-content p {
    margin: 6px 0;
    color: var(--el-text-color-regular);
    font-size: 13px;
    line-height: 1.7;
}

.remote-option-help-content code {
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--el-fill-color-darker);
    color: var(--el-color-primary);
}

.remote-option-help-content pre {
    margin: 8px 0;
    padding: 10px 12px;
    overflow-x: auto;
    border-radius: 8px;
    background: #1f2937;
    color: #e5e7eb;
    font-size: 12px;
    line-height: 1.6;
}
</style>
