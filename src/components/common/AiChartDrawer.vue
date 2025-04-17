<template>
    <el-drawer v-model="props.dialog" title="我是你的AI助手" direction="rtl" size="400" @close="close">
    </el-drawer>
</template>

<script setup lang='ts'>
import { ref } from 'vue';

const props = defineProps({
    dialog: {
        type: Boolean,
        required: false
    }
});

const emit = defineEmits(['update:dialog']);

const close = () => {
    emit('update:dialog', false);
}

</script>

<style></style>