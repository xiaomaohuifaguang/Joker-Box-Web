<template>
    <el-select v-model="value" multiple filterable remote reserve-keyword placeholder="选择用户"
        :remote-method="remoteMethod" :loading="loading" style="width: 100%;">
        <el-option v-for="item in options" :key="item.id" :label="item.username + '/' + item.nickname"
            :value="item.id" />
    </el-select>
</template>

<script setup lang='ts'>
import { http } from '@/utils';
import { onMounted, ref, watch } from 'vue';

const options = ref([])
const value = ref([])
const loading = ref(false)

const props = defineProps<{
    ids: any[]
}>()
const emit = defineEmits(['update:ids']);

// 当 id 发生变化时，通知父组件
watch(value, (newValue) => {
    emit('update:ids', newValue);
});

onMounted(() => {
    value.value = props.ids;
    init();
})


const init = () => {
    if (value.value.length > 0 || true) {
        loading.value = true;
        http.result({
            url: '/user/selectorInitByIds',
            method: 'POST',
            data: value.value,
            success(result) {
                options.value = result.data;
                loading.value = false
            }
        })
    }
}

const remoteMethod = (query: string) => {
    if (query) {
        loading.value = true

        http.result({
            url: '/user/selectorUserWithInfo',
            method: 'POST',
            params: {
                search: query
            },
            success(result) {
                loading.value = false
                options.value = result.data
            }
        })


    } else {
        options.value = []
    }
}


</script>

<style></style>