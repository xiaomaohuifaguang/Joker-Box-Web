import { computed, watch, type Ref } from 'vue'

const BACK_RELATED_PROPS = ['backType', 'backNodeId', 'backAssigneePolicy'] as const

export interface UseActionButtonsOptions {
    /** 当前 actionButtons 字段的字符串值（逗号分隔） */
    getRaw: () => string | undefined
    /** 更新属性回调（写回 actionButtons 与清理 back 相关字段） */
    setProperty: (key: string, value: any) => void
    /** 直接前驱是否包含开始节点（true 时强制移除 back） */
    isPrevNodeStart: Ref<boolean>
}

/**
 * 用户任务的「处理按钮」状态机：
 *  - getActiveButtons：当前已激活按钮（actionButtons 字段为空时默认 ['pass']）；
 *  - toggleButton：切换某个按钮；切除 back 时同步清空驳回配置；
 *  - showBackConfig：是否展示驳回相关表单项；
 *  - 监听 isPrevNodeStart：当变为 true 且当前激活了 back，则自动撤销。
 */
export const useActionButtons = (options: UseActionButtonsOptions) => {
    const { getRaw, setProperty, isPrevNodeStart } = options

    const getActiveButtons = (): string[] => {
        const v = getRaw()
        return typeof v === 'string' && v ? v.split(',').filter(Boolean) : ['pass']
    }

    const isActive = (value: string): boolean => getActiveButtons().includes(value)

    const clearBackConfig = () => {
        BACK_RELATED_PROPS.forEach((key) => setProperty(key, ''))
    }

    const toggleButton = (value: string) => {
        const arr = getActiveButtons()
        const next = arr.includes(value)
            ? arr.filter((item) => item !== value)
            : [...arr, value]
        setProperty('actionButtons', next.join(','))
        if (!next.includes('back')) clearBackConfig()
    }

    const showBackConfig = computed(() => isActive('back'))

    // 直接前驱变为开始节点时，自动撤销 back
    watch(isPrevNodeStart, (isStart) => {
        if (isStart && isActive('back')) {
            const next = getActiveButtons().filter((item) => item !== 'back')
            setProperty('actionButtons', next.join(','))
            clearBackConfig()
        }
    })

    return {
        isActive,
        toggleButton,
        showBackConfig,
    }
}
