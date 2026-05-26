<template>
    <div class="form-selector">
        <el-select :model-value="modelValue" @update:model-value="onFormSelect" filterable
            :loading="loading" placeholder="请选择表单" style="flex: 1; min-width: 0"
            :disabled="disabled" clearable>
            <el-option v-for="item in formOptions" :key="item.formId" :label="item.formName"
                :value="item.formId" />
        </el-select>
        <el-select v-if="modelValue && versionOptions.length > 0"
            :model-value="modelVersion" @update:model-value="onVersionSelect"
            :loading="loading" placeholder="版本" style="width: 140px; flex-shrink: 0"
            :disabled="disabled">
            <el-option v-for="v in versionOptions" :key="v.version"
                :label="v.version === currentLatest ? `${v.version} (最新)` : v.version"
                :value="v.version" />
        </el-select>
    </div>
</template>

<script setup lang="ts">
import { http } from '@/utils';
import { computed, ref, watch } from 'vue'

interface PublishedForm {
    formId: string
    formName: string
    latestVersion: string
    versions: { version: string; publishTime: string }[]
}

const props = defineProps<{
    modelValue?: string
    modelVersion?: string
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'update:modelVersion', value: string): void
    (e: 'change', form: { id: string; name: string; version: string } | null): void
}>()

const loading = ref(false)
const formOptions = ref<PublishedForm[]>([])

const currentLatest = computed(() => {
    if (!props.modelValue) return ''
    const form = formOptions.value.find(f => f.formId === props.modelValue)
    return form?.latestVersion ?? ''
})

const versionOptions = computed(() => {
    if (!props.modelValue) return []
    const form = formOptions.value.find(f => f.formId === props.modelValue)
    return form?.versions ?? []
})

const loadForms = async () => {
    loading.value = true
    try {
        const result = await http.post('/dynamicForm/publishedForms')
        formOptions.value = result || []
    } finally {
        loading.value = false
    }
}

const onFormSelect = (formId: string) => {
    emit('update:modelValue', formId)
    if (!formId) {
        emit('update:modelVersion', '')
        emit('change', null)
        return
    }
    const form = formOptions.value.find(f => f.formId === formId)
    if (form) {
        emit('update:modelVersion', form.latestVersion)
        emit('change', { id: form.formId, name: form.formName, version: form.latestVersion })
    } else {
        emit('update:modelVersion', '')
        emit('change', null)
    }
}

const onVersionSelect = (version: string) => {
    emit('update:modelVersion', version)
    const form = formOptions.value.find(f => f.formId === props.modelValue)
    if (form) {
        emit('change', { id: form.formId, name: form.formName, version })
    }
}

// Load on mount; if modelValue exists, ensure it's in the list
watch(
    () => props.modelValue,
    async () => {
        if (formOptions.value.length === 0) {
            await loadForms()
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.form-selector {
    display: flex;
    gap: 8px;
    width: 100%;
}
</style>
