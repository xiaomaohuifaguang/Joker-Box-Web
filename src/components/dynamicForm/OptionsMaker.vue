<template>
    <div class="dynamic-options">
        <!-- 根据类型渲染不同的表单组件 -->
        <el-select v-if="type === 'SELECT'" v-model="selectedValue" placeholder="请选择" class="preview-component"
            @change="handleChange" style="width: 100%;">
            <el-option v-for="item in localOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-select v-if="type === 'MULTISELECT'" v-model="selectedValues" multiple placeholder="请选择"
            class="preview-component" @change="handleChange" style="width: 100%;">
            <el-option v-for="item in localOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-cascader v-if="type === 'CASCADER'" v-model="cascaderValue" :options="localOptions" :props="cascaderProps"
            placeholder="请选择" class="preview-component" @change="handleChange" style="width: 100%;" />

        <el-cascader v-if="type === 'MULTICASCADER'" v-model="cascaderValues" :options="localOptions"
            :props="{ ...cascaderProps, multiple: true }" placeholder="请选择" class="preview-component"
            @change="handleChange" style="width: 100%;" />

        <!-- 选项管理区域 -->
        <div class="options-management">
            <div class="management-header">
                <span class="title">选项管理</span>
                <el-button type="primary" size="small" @click="addOption(null)">
                    <el-icon>
                        <Plus />
                    </el-icon> 添加选项
                </el-button>
            </div>

            <div class="options-list">
                <OptionItem v-for="(option, index) in localOptions" :key="index" :option="option" :index="index"
                    :is-cascader-type="isCascaderType" @add-option="addOption" @remove-option="removeOption"
                    @update-parent="updateParent" />
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref, watch, computed } from 'vue'
import OptionItem from './OptionItem.vue'
import { Plus } from '@element-plus/icons-vue'
import { randomId } from '@/utils'

export default defineComponent({
    name: 'OptionsMaker',
    components: { OptionItem, Plus },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ['SELECT', 'MULTISELECT', 'CASCADER', 'MULTICASCADER'].includes(value)
        },
        options: {
            type: [Array, null],
            default: () => []
        }
    },
    emits: ['update:options'],
    setup(props, { emit }) {
        // 本地状态
        const localOptions = ref(props.options || [])
        const selectedValue = ref('')
        const selectedValues = ref([])
        const cascaderValue = ref([])
        const cascaderValues = ref([])

        // 计算属性
        const isCascaderType = computed(() => ['CASCADER', 'MULTICASCADER'].includes(props.type))

        // 级联组件的props配置
        const cascaderProps = {
            multiple: false,
            checkStrictly: true,
            emitPath: false
        }

        // 监听props.options变化，更新本地状态
        watch(() => props.options, (newVal) => {
            localOptions.value = newVal || []
        }, { deep: true })

        // 添加新选项
        const addOption = (parentPath) => {
            let parent;
            let id = '';
            if (parentPath !== null) {
                // 获取子集父选项
                parent = localOptions.value
                for (let i = 0; i < parentPath.length; i++) {
                    id += parent[parentPath[i]].value
                    parent = parent[parentPath[i]].children
                }
                id += '_' + randomId('')
            } else {
                id = randomId('')
            }
            const newOption = {
                label: `选项${Date.now()}`,
                value: id,
            }

            if (isCascaderType.value) {
                newOption.children = []
            }

            if (parentPath === null) {
                // 添加顶级选项
                localOptions.value.push(newOption)
            } else {
                parent.push(newOption)
            }

            updateParent()
        }

        // 删除选项
        const removeOption = (path) => {
            if (path.length === 1) {
                // 删除顶级选项
                localOptions.value.splice(path[0], 1)
            } else {
                // 删除子选项
                let parent = localOptions.value
                for (let i = 0; i < path.length - 1; i++) {
                    parent = parent[path[i]].children
                }
                parent.splice(path[path.length - 1], 1)
            }
            updateParent()
        }

        // 更新父组件
        const updateParent = () => {
            emit('update:options', [...localOptions.value])
        }

        // 处理选择变化
        const handleChange = () => {
            // 这里可以处理选择变化后的逻辑
            console.log('Selection changed')
        }

        return {
            localOptions,
            selectedValue,
            selectedValues,
            cascaderValue,
            cascaderValues,
            cascaderProps,
            isCascaderType,
            addOption,
            removeOption,
            updateParent,
            handleChange
        }
    }
})
</script>

<style scoped>
.dynamic-options {
    width: 100%;
}

.preview-component {
    margin-bottom: 20px;
    width: 100%;
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    /* padding: 10px; */
    background-color: var(--el-fill-color-blank);
}

.options-management {
    margin-top: 20px;
    border-top: 1px solid var(--el-border-color-light);
    padding-top: 20px;
}

.management-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.title {
    font-size: var(--el-font-size-medium);
    color: var(--el-text-color-primary);
    font-weight: 500;
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>