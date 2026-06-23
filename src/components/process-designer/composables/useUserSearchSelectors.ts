import { computed, ref, watch, type ComputedRef, type WatchSource } from 'vue'
import { useSearchOptions } from '../components/PropertyPanels/shared'

/**
 * 候选人 / 角色 / 部门 三个远程搜索 select 的状态合并。
 *
 * 用户任务属性面板里：
 *  - 切换节点（watchSource 变化）时按已选 ID 批量预热选项，避免选择框只显示 ID；
 *  - 每个 select 暴露 displayOptions（合并未在服务端返回但已选中的项）；
 *  - selectKey 用于强制重渲染选择框，使预热到的 label 立刻生效。
 */
export const useUserSearchSelectors = (
    watchSource: WatchSource,
    candidateUsers: ComputedRef<string[]>,
    candidateRoles: ComputedRef<string[]>,
    candidateDepts: ComputedRef<string[]>
) => {
    const {
        userCache, roleCache, orgCache,
        userOptions, roleOptions, orgOptions,
        userLoading, roleLoading, orgLoading,
        mergeSelected,
        searchUsers, searchRoles, searchOrgs,
        initUsersByIds, initRolesByIds, initOrgsByIds,
    } = useSearchOptions()

    const userSelectKey = ref(0)
    const roleSelectKey = ref(0)
    const orgSelectKey = ref(0)

    const userDisplayOptions = computed(() =>
        mergeSelected(userOptions.value, candidateUsers.value, userCache.value)
    )
    const roleDisplayOptions = computed(() =>
        mergeSelected(roleOptions.value, candidateRoles.value, roleCache.value)
    )
    const orgDisplayOptions = computed(() =>
        mergeSelected(orgOptions.value, candidateDepts.value, orgCache.value)
    )

    watch(
        watchSource,
        async () => {
            if (candidateUsers.value.length > 0) {
                await initUsersByIds(candidateUsers.value)
                userSelectKey.value++
            }
            if (candidateRoles.value.length > 0) {
                await initRolesByIds(candidateRoles.value)
                roleSelectKey.value++
            }
            if (candidateDepts.value.length > 0) {
                await initOrgsByIds(candidateDepts.value)
                orgSelectKey.value++
            }
        },
        { immediate: true }
    )

    return {
        searchUsers, searchRoles, searchOrgs,
        userLoading, roleLoading, orgLoading,
        userSelectKey, roleSelectKey, orgSelectKey,
        userDisplayOptions, roleDisplayOptions, orgDisplayOptions,
    }
}
