<template>
    <el-input placeholder="id" v-model="localId" :disabled="localType != 'edit'" />
    <el-input placeholder="类型" v-model="localType" :disabled="localType != 'edit'" />
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue';

const props = defineProps({
    id: String,
    type: String
})

const emit = defineEmits(['update:id', 'update:type']);

// 定义响应式的 id 和 type
const localId = ref(props.id);
const localType = ref(props.type);

// 监听 props 的变化，并更新本地状态
watch(() => props.id, (newId) => {
    localId.value = newId;
});
watch(() => props.type, (newType) => {
    localType.value = newType;
});

// 当 id 发生变化时，通知父组件
watch(localId, (newId) => {
    if (newId !== props.id) {
        emit('update:id', newId);
    }
});

// 当 type 发生变化时，通知父组件
watch(localType, (newType) => {
    if (newType !== props.type) {
        emit('update:type', newType);
    }
});

</script>

<style></style>