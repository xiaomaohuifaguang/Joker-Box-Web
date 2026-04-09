<template>
    <div class="icon-selector">
        <!-- 当前选中图标预览 -->
        <div class="selected-icon-preview">
            <div class="preview-card">
                <div class="preview-icon-wrapper">
                    <el-icon size="56" class="preview-icon">
                        <component :is="props.name" />
                    </el-icon>
                </div>
                <div class="preview-label">当前图标</div>
            </div>
        </div>

        <div class="icon-sections">
            <!-- 自定义图标区域 -->
            <div class="icon-section">
                <div class="section-header">
                    <div class="header-icon">
                        <el-icon><Star /></el-icon>
                    </div>
                    <span class="section-title">自定义图标</span>
                </div>
                <div class="icon-grid">
                    <div 
                        v-for="item in diyIconList" 
                        :key="item"
                        class="icon-item"
                        :class="{ active: item === localName }"
                        @click="() => { localName = item }"
                    >
                        <el-icon size="32" class="item-icon">
                            <component :is="item" />
                        </el-icon>
                    </div>
                </div>
            </div>

            <!-- Element Plus 图标区域 -->
            <div class="icon-section">
                <div class="section-header">
                    <div class="header-icon element">
                        <el-icon><Grid /></el-icon>
                    </div>
                    <span class="section-title">ElementPlus 图标</span>
                </div>
                <el-scrollbar height="320px" class="icon-scrollbar">
                    <div class="icon-grid">
                        <div 
                            v-for="item in elIconList" 
                            :key="item"
                            class="icon-item"
                            :class="{ active: item === localName }"
                            @click="() => { localName = item }"
                        >
                            <el-icon size="28" class="item-icon">
                                <component :is="item" />
                            </el-icon>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Star, Grid } from '@element-plus/icons-vue'

const props = defineProps({
    name: String
})

const localName = ref('')

const emit = defineEmits(['update:name']);

watch(() => props.name, (newName) => {
    localName.value = newName;
});

watch(localName, (newName) => {
    if (newName !== props.name) {
        emit('update:name', newName);
    }
});

const elIconList = ref(Object.keys(ElementPlusIconsVue))

const diyIconList = ref([
    "Api", "CloudDisk", "Console", "Document", "Folder", "Joker", "JokerMan", "JokerWoman", "Org", "RoleSettings", "SystemSettings", "UserSettings", "Website", 'Process'
])
</script>

<style scoped lang="scss">
.icon-selector {
    padding: 24px;
}

.selected-icon-preview {
    text-align: center;
    margin-bottom: 32px;
}

.preview-card {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 48px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    border-radius: 20px;
    border: 2px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s ease;
}

.preview-card:hover {
    border-color: rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.preview-icon-wrapper {
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    animation: iconPulse 3s infinite ease-in-out;
}

@keyframes iconPulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
    }
}

.preview-icon {
    color: white;
}

.preview-label {
    font-size: 14px;
    font-weight: 600;
    color: #667eea;
    letter-spacing: 1px;
}

.icon-sections {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.icon-section {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f0f0f0;
}

.header-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transition: all 0.3s ease;
}

.header-icon.element {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.header-icon .el-icon {
    font-size: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #303133;
}

.icon-scrollbar {
    padding-right: 8px;
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 12px;
}

.icon-item {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.icon-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    opacity: 0;
    transition: all 0.3s ease;
}

.icon-item:hover {
    background: white;
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.2);
}

.icon-item:hover::before {
    opacity: 1;
}

.icon-item.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.icon-item.active::before {
    opacity: 1;
}

.icon-item.active::after {
    content: '';
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-icon {
    color: #606266;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
}

.icon-item:hover .item-icon {
    color: #667eea;
    transform: scale(1.1);
}

.icon-item.active .item-icon {
    color: #667eea;
    transform: scale(1.15);
}

.el-col {
    margin-bottom: 1rem;
}
</style>
