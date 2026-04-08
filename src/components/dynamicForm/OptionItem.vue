<template>
    <div class="option-item">
        <div class="option-content">
            <el-input v-model="option.label" placeholder="标签" size="small" @change="$emit('update-parent')" />
            <el-input v-model="option.value" placeholder="值" size="small" @change="$emit('update-parent')" />
            <el-button type="danger" size="small" :icon="Delete" circle
                @click="$emit('remove-option', [...path, index])" />
            <el-button v-if="isCascaderType" type="primary" size="small" :icon="Plus" circle
                @click="$emit('add-option', [...path, index])" />
        </div>

        <!-- 递归渲染子选项 -->
        <div v-if="isCascaderType && option.children && option.children.length > 0" class="child-options">
            <OptionItem v-for="(child, childIndex) in option.children" :key="childIndex" :option="child"
                :index="childIndex" :path="[...path, index]" :is-cascader-type="isCascaderType"
                @add-option="(p) => $emit('add-option', p)" @remove-option="(p) => $emit('remove-option', p)"
                @update-parent="$emit('update-parent')" />
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

export default defineComponent({
    name: 'OptionItem',
    props: {
        option: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        path: {
            type: Array,
            default: () => []
        },
        isCascaderType: {
            type: Boolean,
            default: false
        }
    },
    emits: ['add-option', 'remove-option', 'update-parent'],
    setup() {
        return {
            Plus,
            Delete
        }
    }
})
</script>

<style scoped>
.option-item {
    margin-top: 8px;
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-light);
}

.option-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.option-content .el-input {
    flex: 1;
    /* max-width: 200px; */
}

.child-options {
    margin-top: 12px;
    padding-left: 24px;
    border-left: 2px solid var(--el-border-color);
}
</style>