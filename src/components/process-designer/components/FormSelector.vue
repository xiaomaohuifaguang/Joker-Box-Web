<template>
    <el-select :model-value="modelValue" @update:model-value="onSelect" filterable remote reserve-keyword
        :remote-method="searchForms" :loading="loading" placeholder="请选择表单" style="width: 100%"
        :disabled="disabled" clearable>
        <el-option v-for="item in formOptions" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
</template>

<script setup lang="ts">
import { http } from '@/utils';
import { ref, watch } from 'vue'

const props = defineProps<{
    modelValue?: string
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', form: { id: string; name: string; version: string } | null): void
}>()

const loading = ref(false)
const formOptions = ref<any[]>([])
const allForms = ref<any[]>([])

const queryForms = async (keyword = '') => {
    loading.value = true
    try {
        const result = await http.post('/dynamicForm/queryPage', {
            current: 1,
            size: 100,
            search: keyword,
        })
        const records = (result?.records || []).filter((f: any) => f.status === '1')
        return records
    } finally {
        loading.value = false
    }
}

const searchForms = async (keyword: string) => {
    const records = await queryForms(keyword)
    formOptions.value = records
}

const loadInitialForms = async () => {
    const records = await queryForms()
    allForms.value = records
    formOptions.value = records
    return records
}

const queryFormById = async (id: string) => {
    try {
        return await http.post('/dynamicForm/info', { id })
    } catch {
        return null
    }
}

const onSelect = (id: string) => {
    emit('update:modelValue', id)
    const form = allForms.value.find((f) => f.id === id)
    if (form) {
        emit('change', { id: form.id, name: form.name, version: form.version })
    } else if (id) {
        // 不在缓存中，异步查询后 emit
        queryFormById(id).then((data) => {
            if (data) {
                emit('change', { id: data.id, name: data.name, version: data.version })
            }
        })
    } else {
        emit('change', null)
    }
}

// 初始加载 + 处理外部传入的 modelValue
watch(
    () => props.modelValue,
    async (id) => {
        if (!id) {
            if (formOptions.value.length === 0) {
                await loadInitialForms()
            }
            return
        }
        const records = await loadInitialForms()
        const found = records.find((f: any) => f.id === id)
        if (!found) {
            // 不在列表中，单独查询补充
            const data = await queryFormById(id)
            if (data && data.status === '1') {
                allForms.value.push(data)
                formOptions.value = [...allForms.value]
            }
        }
    },
    { immediate: true }
)
</script>
