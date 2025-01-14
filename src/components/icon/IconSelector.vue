<template>
    <div style="text-align: center;margin-bottom: 2rem;">
        <el-icon size="50">
            <component :is="props.name" />
        </el-icon>
    </div>
    <el-scrollbar height="400px">
        <div style="margin-bottom: 1rem;">自定义图标</div>
        <el-row gutter="20">
            <el-col :span="4" v-for="item in diyIconList" :key="item">
                <el-button :type="item === localName ? 'primary' : 'default'" @click="() => { localName = item }"
                    size="mini" style="width: 100%;">
                    <el-icon size="30">
                        <component :is="item" />
                    </el-icon>
                    <!-- {{ item }} -->
                </el-button>
            </el-col>
        </el-row>
        <div style="margin-bottom: 1rem;">ElementPlus UI 图标</div>
        <el-row gutter="20">
            <el-col :span="4" v-for="item in elIconList" :key="item">
                <el-button :type="item === localName ? 'primary' : 'default'" @click="() => { localName = item }"
                    size="mini" style="width: 100%;">
                    <el-icon size="30">
                        <component :is="item" />
                    </el-icon>
                    <!-- {{ item }} -->
                </el-button>
            </el-col>
        </el-row>
    </el-scrollbar>
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
    name: String
})

const localName = ref('')

const emit = defineEmits(['update:name']);

// 监听 props 的变化，并更新本地状态
watch(() => props.name, (newName) => {
    localName.value = newName;
});

// 当 本地 发生变化时，通知父组件
watch(localName, (newName) => {
    if (newName !== props.name) {
        emit('update:name', newName);
    }
});

// 获取 ElementPlus 图标列表
const elIconList = ref(Object.keys(ElementPlusIconsVue))

// 自定义图标列表
const diyIconList = ref([
    "Api", "CloudDisk", "Console", "Document", "Folder", "Joker", "JokerMan", "JokerWoman", "Org", "RoleSettings", "SystemSettings", "UserSettings", "Website"
])

</script>

<style scoped>
.el-col {
    margin-bottom: 1rem;
}
</style>
