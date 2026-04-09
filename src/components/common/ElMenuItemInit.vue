<template>
    <el-menu-item v-if="props.children.length === 0" :index="path" class="custom-menu-item">
        <el-icon class="menu-icon">
            <component :is="props.icon" />
        </el-icon>
        <span class="menu-text">{{ props.name }}</span>
    </el-menu-item>
    <el-sub-menu v-if="props.children.length > 0" :index="path" class="custom-submenu">
        <template #title>
            <el-icon class="menu-icon">
                <component :is="props.icon" />
            </el-icon>
            <span class="menu-text">{{ props.name }}</span>
        </template>
        <div class="submenu-wrapper">
            <ElMenuItemInit v-for="item in props.children" :name="item['name']" :path="item['path']" :icon="item['icon']"
                :children="item['children']" />
        </div>
    </el-sub-menu>
</template>

<script setup lang='ts'>
const props = defineProps({
    path: String,
    name: String,
    children: Array,
    icon: String
});
</script>

<style scoped lang="scss">
.custom-menu-item {
    height: 48px !important;
    line-height: 48px !important;
    margin: 4px 0 !important;
    border-radius: 10px !important;
    color: var(--el-text-color-regular) !important;
    transition: all 0.3s ease !important;

    &:hover {
        background-color: var(--el-fill-color-light) !important;
        color: #667eea !important;

        .menu-icon {
            color: #667eea !important;
        }
    }

    &.is-active {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
        color: #667eea !important;
        font-weight: 600 !important;

        .menu-icon {
            color: #667eea !important;
        }
    }

    .menu-icon {
        font-size: 18px !important;
        margin-right: 8px !important;
        color: var(--el-text-color-secondary) !important;
        transition: all 0.3s ease !important;
    }

    .menu-text {
        font-size: 14px !important;
    }
}

.custom-submenu {
    :deep(.el-sub-menu__title) {
        height: 48px !important;
        line-height: 48px !important;
        margin: 4px 0 !important;
        border-radius: 10px !important;
        color: var(--el-text-color-regular) !important;
        transition: all 0.3s ease !important;

        &:hover {
            background-color: var(--el-fill-color-light) !important;
            color: #667eea !important;

            .menu-icon {
                color: #667eea !important;
            }
        }

        .menu-icon {
            font-size: 18px !important;
            margin-right: 8px !important;
            color: var(--el-text-color-secondary) !important;
            transition: all 0.3s ease !important;
        }

        .menu-text {
            font-size: 14px !important;
        }
    }

    :deep(.el-sub-menu__icon-arrow) {
        color: var(--el-text-color-secondary) !important;
        transition: all 0.3s ease !important;
    }

    &:hover :deep(.el-sub-menu__icon-arrow) {
        color: #667eea !important;
    }
}

.submenu-wrapper {
    padding-left: 12px !important;
}
</style>