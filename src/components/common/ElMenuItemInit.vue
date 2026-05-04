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
    border-radius: var(--radius-md) !important;
    color: var(--text-regular) !important;
    transition: background-color var(--duration-normal) var(--ease-out),
        color var(--duration-normal) var(--ease-out) !important;

    &:hover {
        background-color: var(--bg-overlay) !important;
        color: var(--brand-primary) !important;

        .menu-icon {
            color: var(--brand-primary) !important;
        }
    }

    &.is-active {
        background: var(--brand-gradient-soft) !important;
        color: var(--brand-primary) !important;
        font-weight: var(--fw-semibold) !important;

        .menu-icon {
            color: var(--brand-primary) !important;
        }
    }

    .menu-icon {
        font-size: 18px !important;
        margin-right: 8px !important;
        color: var(--text-secondary) !important;
        transition: color var(--duration-normal) var(--ease-out) !important;
    }

    .menu-text {
        font-size: var(--fs-md) !important;
    }
}

.custom-submenu {
    :deep(.el-sub-menu__title) {
        height: 48px !important;
        line-height: 48px !important;
        margin: 4px 0 !important;
        border-radius: var(--radius-md) !important;
        color: var(--text-regular) !important;
        transition: background-color var(--duration-normal) var(--ease-out),
            color var(--duration-normal) var(--ease-out) !important;

        &:hover {
            background-color: var(--bg-overlay) !important;
            color: var(--brand-primary) !important;

            .menu-icon {
                color: var(--brand-primary) !important;
            }
        }

        .menu-icon {
            font-size: 18px !important;
            margin-right: 8px !important;
            color: var(--text-secondary) !important;
            transition: color var(--duration-normal) var(--ease-out) !important;
        }

        .menu-text {
            font-size: var(--fs-md) !important;
        }
    }

    :deep(.el-sub-menu__icon-arrow) {
        color: var(--text-secondary) !important;
        transition: color var(--duration-normal) var(--ease-out) !important;
    }

    &:hover :deep(.el-sub-menu__icon-arrow) {
        color: var(--brand-primary) !important;
    }
}

.submenu-wrapper {
    padding-left: 12px !important;
}
</style>