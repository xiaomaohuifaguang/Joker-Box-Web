import { ref, watch } from 'vue'

export interface NodeConfig {
    globalFormBinding: any
    nodeFormBindings: any[]
    nodeFieldPermissions: any[]
}

export interface UseNodeFormBindingOptions {
    /** 当前节点 ID 的 getter（响应式） */
    getNodeId: () => string | number | undefined
    /** 当前 nodeConfig 的 getter（响应式） */
    getNodeConfig: () => NodeConfig | undefined
    /** 提交更新到外部 */
    emitUpdate: (config: NodeConfig) => void
}

/**
 * 节点表单绑定状态管理。
 * 在 StartEvent / UserTask 等节点属性面板间复用。
 *
 * 职责：
 *  - 从 nodeConfig.nodeFormBindings 读取当前节点的绑定到本地 ref；
 *  - 写入时合并/移除 nodeFormBindings，并在表单 id/version 变化时清理对应 nodeFieldPermissions；
 *  - 监听 nodeId / nodeConfig 变化自动同步。
 */
export const useNodeFormBinding = (options: UseNodeFormBindingOptions) => {
    const { getNodeId, getNodeConfig, emitUpdate } = options

    const nodeFormId = ref('')
    const nodeFormVersion = ref('')
    const inheritMainForm = ref(false)

    const readNodeBinding = () => {
        const nodeConfig = getNodeConfig()
        const nodeId = getNodeId()
        if (!nodeConfig || !nodeId) {
            nodeFormId.value = ''
            nodeFormVersion.value = ''
            inheritMainForm.value = false
            return
        }
        const binding = nodeConfig.nodeFormBindings.find(
            (b: any) => String(b.nodeId) === String(nodeId)
        )
        if (binding) {
            nodeFormId.value = binding.formId || ''
            nodeFormVersion.value = binding.formVersion || ''
            inheritMainForm.value = binding.inheritMainForm === '1'
        } else {
            nodeFormId.value = ''
            nodeFormVersion.value = ''
            inheritMainForm.value = false
        }
    }

    const updateNodeBinding = () => {
        const nodeConfig = getNodeConfig()
        const rawNodeId = getNodeId()
        if (!nodeConfig || !rawNodeId) return

        const nodeId = String(rawNodeId)
        const bindings = [...nodeConfig.nodeFormBindings]
        const idx = bindings.findIndex((b: any) => String(b.nodeId) === nodeId)
        const oldFormId = idx >= 0 ? bindings[idx].formId : ''
        const oldVersion = idx >= 0 ? bindings[idx].formVersion : ''
        const newFormId = nodeFormId.value

        // 表单或版本变更时，清空该节点已配置的字段权限
        let newPermissions = nodeConfig.nodeFieldPermissions
        if (oldFormId !== newFormId || oldVersion !== nodeFormVersion.value) {
            newPermissions = newPermissions.filter(
                (p: any) => String(p.nodeId) !== nodeId
            )
        }

        const hasBinding = newFormId || inheritMainForm.value
        if (hasBinding) {
            const item = {
                formId: newFormId,
                formVersion: nodeFormVersion.value,
                nodeId: rawNodeId,
                inheritMainForm: inheritMainForm.value ? '1' : '0',
            }
            if (idx >= 0) {
                bindings[idx] = item
            } else {
                bindings.push(item)
            }
        } else if (idx >= 0) {
            bindings.splice(idx, 1)
        }

        emitUpdate({
            ...nodeConfig,
            nodeFormBindings: bindings,
            nodeFieldPermissions: newPermissions,
        })
    }

    const onNodeFormChange = (
        form: { id: string; name: string; version: string } | null
    ) => {
        nodeFormVersion.value = form?.version ?? ''
        updateNodeBinding()
    }

    watch(getNodeId, readNodeBinding, { immediate: true })
    watch(getNodeConfig, readNodeBinding, { deep: true })

    return {
        nodeFormId,
        nodeFormVersion,
        inheritMainForm,
        onNodeFormChange,
        updateNodeBinding,
    }
}
