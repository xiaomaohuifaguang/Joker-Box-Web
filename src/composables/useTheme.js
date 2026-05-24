import { ref, watch } from 'vue'

/**
 * 主题切换 composable
 * 五套去 AI 化主题：水墨丹青、午夜嘉年华、黑曜镜面、浅海潮汐、深渊萤光
 * - 通过 :root[data-theme] 控制 CSS 变量
 * - localStorage 持久化
 */

export const THEME_KEY = 'jokerbox-theme'
export const THEMES = {
    INK: 'ink',
    JOKER: 'joker',
    OBSIDIAN: 'obsidian',
    CYAN: 'cyan',
    DEEPBLUE: 'deepblue',
    DAWN: 'dawn',
    DUSK: 'dusk',
    MATRIX: 'matrix',
}

export const THEME_LIST = [
    { key: THEMES.INK, label: '水墨丹青', icon: 'Sunny' },
    { key: THEMES.JOKER, label: '午夜嘉年华', icon: 'Moon' },
    { key: THEMES.OBSIDIAN, label: '黑曜镜面', icon: 'MoonNight' },
    { key: THEMES.CYAN, label: '碧波', icon: 'PartlyCloudy' },
    { key: THEMES.DEEPBLUE, label: '深渊萤光', icon: 'MostlyCloudy' },
    { key: THEMES.DAWN, label: '晨曦白', icon: 'Sunny' },
    { key: THEMES.DUSK, label: '暮夜黑', icon: 'MoonNight' },
    { key: THEMES.MATRIX, label: '黑客矩阵', icon: 'Monitor' },
]

const DEFAULT_THEME = THEMES.JOKER
const VALID_THEMES = new Set([THEMES.INK, THEMES.JOKER, THEMES.OBSIDIAN, THEMES.CYAN, THEMES.DEEPBLUE, THEMES.DAWN, THEMES.DUSK, THEMES.MATRIX])
const DARK_THEMES = new Set([THEMES.JOKER, THEMES.OBSIDIAN, THEMES.DEEPBLUE, THEMES.DUSK, THEMES.MATRIX])

const isDarkTheme = (theme) => DARK_THEMES.has(theme)

/**
 * 应用主题到 html 元素
 * - 写 data-theme 属性供我们的 CSS 变量切换
 */
export function applyTheme(theme) {
    const t = VALID_THEMES.has(theme) ? theme : DEFAULT_THEME
    const root = document.documentElement
    root.setAttribute('data-theme', t)
    return t
}

/**
 * 从 localStorage 读取保存的主题（无则返回默认）
 */
export function readSavedTheme() {
    try {
        const v = localStorage.getItem(THEME_KEY)
        if (VALID_THEMES.has(v)) return v
    } catch (e) { /* SSR / 隐私模式兜底 */ }
    return DEFAULT_THEME
}

/**
 * 在 createApp 之前调用，避免 FOUC
 * 一般 main.js 顶部和 index.html 内联脚本各调一次
 */
export function initThemeEarly() {
    applyTheme(readSavedTheme())
}

// 单例响应式状态
const _theme = ref(readSavedTheme())

watch(_theme, (val) => {
    applyTheme(val)
    try {
        localStorage.setItem(THEME_KEY, val)
    } catch (e) { /* ignore */ }
}, { immediate: true })

export function useTheme() {
    const theme = _theme

    function setTheme(t) {
        if (VALID_THEMES.has(t)) {
            if (t === THEMES.MATRIX) {
                const root = document.documentElement
                root.classList.add('theme-transitioning')
                setTimeout(() => root.classList.remove('theme-transitioning'), 300)
            }
            _theme.value = t
        }
    }

    function toggleTheme() {
        _theme.value = _theme.value === THEMES.INK ? THEMES.JOKER : THEMES.INK
    }

    function isDark() {
        return isDarkTheme(_theme.value)
    }

    return {
        theme,
        setTheme,
        toggleTheme,
        isDark,
        THEMES,
        THEME_LIST,
    }
}
