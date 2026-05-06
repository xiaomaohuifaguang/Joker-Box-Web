<template>
    <el-dropdown trigger="click" placement="bottom-end" popper-class="theme-dropdown" @command="handleCommand">
        <button class="theme-trigger" :class="`is-${theme}`" :aria-label="`当前主题：${currentLabel}，点击切换`">
            <el-icon :size="18">
                <component :is="currentIcon" />
            </el-icon>
        </button>
        <template #dropdown>
            <el-dropdown-menu class="theme-menu">
                <el-dropdown-item v-for="item in THEME_LIST" :key="item.key" :command="item.key"
                    :class="{ active: theme === item.key }">
                    <span class="theme-item__icon">
                        <el-icon :size="16">
                            <component :is="resolveIcon(item.icon)" />
                        </el-icon>
                    </span>
                    <span class="theme-item__label">{{ item.label }}</span>
                    <span v-if="theme === item.key" class="theme-item__check">
                        <el-icon :size="14">
                            <Check />
                        </el-icon>
                    </span>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { Sunny, Moon, MoonNight, PartlyCloudy, MostlyCloudy, Check } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'

const ICON_MAP = { Sunny, Moon, MoonNight, PartlyCloudy, MostlyCloudy }

const { theme, setTheme, THEME_LIST } = useTheme()

const currentLabel = computed(() =>
    THEME_LIST.find((t) => t.key === theme.value)?.label ?? ''
)

const currentIcon = computed(() => {
    const name = THEME_LIST.find((t) => t.key === theme.value)?.icon ?? 'Moon'
    return ICON_MAP[name] ?? Moon
})

const resolveIcon = (name) => ICON_MAP[name] ?? Moon

const handleCommand = (cmd) => {
    setTheme(cmd)
}
</script>

<style scoped>
.theme-trigger {
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    color: var(--text-regular);
    transition: background-color var(--duration-normal) var(--ease-out),
        color var(--duration-normal) var(--ease-out),
        box-shadow var(--duration-normal) var(--ease-out);
}

.theme-trigger:hover {
    background: var(--bg-overlay);
    color: var(--brand-primary);
}

.theme-trigger:focus-visible {
    outline: none;
    box-shadow: var(--shadow-glow);
}
</style>

<style>
/* 下拉菜单全局样式（unscoped，作用于 popper） */
.theme-dropdown .el-dropdown__popper {
    padding: 6px !important;
    border-radius: var(--radius-lg) !important;
    background: var(--bg-container) !important;
    border: 1px solid var(--border-light) !important;
    box-shadow: var(--shadow-lg) !important;
}

.theme-menu {
    padding: 4px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.theme-menu .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    font-size: var(--fs-sm);
    color: var(--text-regular);
    transition: background-color var(--duration-fast) var(--ease-out),
        color var(--duration-fast) var(--ease-out);
    min-width: 140px;
}

.theme-menu .el-dropdown-menu__item:hover {
    background: var(--bg-overlay) !important;
    color: var(--brand-primary) !important;
}

.theme-menu .el-dropdown-menu__item.active {
    background: var(--brand-gradient-soft);
    color: var(--brand-primary);
    font-weight: var(--fw-semibold);
}

.theme-item__icon {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-overlay);
    color: var(--text-secondary);
    flex-shrink: 0;
}

.theme-menu .el-dropdown-menu__item:hover .theme-item__icon,
.theme-menu .el-dropdown-menu__item.active .theme-item__icon {
    background: var(--brand-gradient);
    color: var(--text-on-brand);
}

.theme-item__label {
    flex: 1;
}

.theme-item__check {
    color: var(--brand-primary);
    display: flex;
    align-items: center;
}
</style>
