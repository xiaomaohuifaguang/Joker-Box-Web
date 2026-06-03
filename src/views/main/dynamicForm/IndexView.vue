<template>
    <div class="dynamic-form-page">
        <!-- 页面头部 -->
        <PageHeader :icon="Document" :title="info.name || '动态表单'" :description="info.description || '请填写以下信息'" />

        <div class="page-container">
            <div class="form-wrapper">
                <div class="form-card">
                    <FormMaker v-model="formData" :fields="info.fields" :linkage-rules="info.linkageRules"
                        :groups="info.groups" type="edit" ref="formMakerRef" />
                </div>
                <div class="action-bar">
                    <el-button type="primary" size="large" @click="submit" class="submit-button" :loading="loading">
                        <el-icon>
                            <Check />
                        </el-icon>
                        <span>提交表单</span>
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { http, toPath, alert } from '@/utils'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Check } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import FormMaker from '@/components/dynamicForm/FormMaker.vue'
import type { FormField, FormFieldGroup, FormLinkageRule, FieldRuntimeState } from '@/components/dynamicForm/types'
import { flattenGroups } from '@/components/dynamicForm/types'

const route = useRoute()
const loading = ref(false)

interface FormInfoState {
    id: number | string
    name: string
    description: string
    version: string
    status: string
    deleted: string
    createBy: string
    createTime: string
    updateTime: string
    fields: FormField[]
    linkageRules: FormLinkageRule[]
    groups?: FormFieldGroup[]
}

const info = ref<FormInfoState>({
    id: -1,
    name: '',
    description: '',
    version: '',
    status: '',
    deleted: '',
    createBy: '',
    createTime: '',
    updateTime: '',
    fields: [],
    linkageRules: []
})
const formData = ref<Record<string, any>>({})
const formMakerRef = ref<InstanceType<typeof FormMaker> | null>(null)

const queryFields = async () => {
    loading.value = true
    try {
        const data = await http.post('/dynamicForm/info', {
            id: route.params.id,
            version: route.params.version
        })
        const groups = data.groups || []
        const fields = data.fields || []
        const hasGroups = groups.length > 0
        info.value = {
            ...data,
            fields: hasGroups
                ? flattenGroups(groups).concat(fields)
                : fields,
            linkageRules: data.linkageRules || [],
            groups: hasGroups ? groups : undefined,
        }
        if (info.value.fields.length == 0) {
            toPath('/404')
        }
    } catch (e: any) {
        // error handled by interceptor
    } finally {
        loading.value = false
    }
}

/** 按字段类型转换提交数据，与后端值类型保持一致；过滤隐藏字段 */
const convertSubmitData = (data: Record<string, any>, fields: FormField[], states?: Record<string, FieldRuntimeState>): Record<string, any> => {
    const result: Record<string, any> = {}
    fields.forEach(field => {
        // 过滤隐藏字段
        if (states && states[field.fieldId]?.visible === false) {
            return
        }
        const val = data[field.fieldId]
        if (val === undefined || val === null) {
            result[field.fieldId] = null
            return
        }
        switch (field.type) {
            case 'NUMBER':
            case 'RATE':
            case 'SLIDER':
                result[field.fieldId] = String(val)
                break
            case 'SWITCH':
                result[field.fieldId] = val === true || val === 'true' ? 'true' : 'false'
                break
            case 'CHECKBOX':
            case 'MULTISELECT':
            case 'CASCADER':
            case 'MULTICASCADER':
            case 'UPLOAD':
            case 'DATERANGE':
            case 'TABLE':
                result[field.fieldId] = val
                break
            default:
                result[field.fieldId] = String(val)
        }
    })
    return result
}

const submit = async () => {
    const verifyFlag = await formMakerRef.value?.verify();
    if (!verifyFlag) {
        return
    }

    loading.value = true
    try {
        const states = formMakerRef.value?.runtimeStates
        await http.post("/dynamicForm/submit", {
            formId: info.value.id,
            version: route.params.version,
            formInstanceId: null,
            data: convertSubmitData(formData.value, info.value.fields, states)
        })
        alert('提交成功', 'success')
    } catch (e: any) {
        // error handled by interceptor
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    queryFields()
})
</script>

<style scoped lang="scss">
.dynamic-form-page {
    min-height: calc(100vh - 60px);
    background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);

    .page-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 24px 40px;
    }

    .form-wrapper {
        .form-card {
            background: var(--bg-container);
            border-radius: 16px;
            padding: 32px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-light);
            margin-bottom: 24px;
        }

        .action-bar {
            display: flex;
            justify-content: center;

            .submit-button {
                min-width: 200px;
                height: 48px;
                font-size: 16px;
                font-weight: 500;
                border-radius: 12px;
                background: var(--brand-gradient);
                border: none;
                transition: all 0.3s;

                &:hover {
                    transform: scale(1.01);
                    box-shadow: var(--shadow-glow-strong);
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .dynamic-form-page {
        .page-container {
            padding: 0 16px 24px;
        }

        .form-wrapper {
            .form-card {
                padding: 20px;
            }

            .action-bar {
                .submit-button {
                    width: 100%;
                }
            }
        }
    }
}
</style>
