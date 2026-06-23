import { computed } from 'vue'

export interface GraphNode {
    id: string
    type: string
    text?: any
}

export interface GraphEdge {
    sourceNodeId: string
    targetNodeId: string
}

/**
 * 从 LogicFlow 实例读取图快照。
 * 优先级：graphModel（实时） → getGraphData → getGraphRawData。
 */
export const readGraphSnapshot = (lf: any): { nodes: GraphNode[]; edges: GraphEdge[] } => {
    let nodes: GraphNode[] = []
    let edges: GraphEdge[] = []
    if (!lf) return { nodes, edges }

    if (lf.graphModel) {
        const { nodes: nodeMap, edges: edgeMap } = lf.graphModel
        if (nodeMap && typeof nodeMap.values === 'function') {
            try {
                nodes = Array.from(nodeMap.values() as Iterable<any>).map((n: any) => ({
                    id: n.id,
                    type: n.type,
                    text: n.text,
                }))
            } catch { /* ignore */ }
        }
        if (edgeMap && typeof edgeMap.values === 'function') {
            try {
                edges = Array.from(edgeMap.values() as Iterable<any>).map((e: any) => ({
                    sourceNodeId: e.sourceNodeId,
                    targetNodeId: e.targetNodeId,
                }))
            } catch { /* ignore */ }
        }
    }

    if (nodes.length === 0 && lf.getGraphData) {
        try {
            const data = lf.getGraphData()
            nodes = (data?.nodes || []).map((n: any) => ({ id: n.id, type: n.type, text: n.text }))
            edges = data?.edges || []
        } catch (e) {
            console.warn('getGraphData failed', e)
        }
    }

    if (nodes.length === 0 && lf.getGraphRawData) {
        try {
            const data = lf.getGraphRawData()
            nodes = (data?.nodes || []).map((n: any) => ({ id: n.id, type: n.type, text: n.text }))
            edges = data?.edges || []
        } catch (e) {
            console.warn('getGraphRawData failed', e)
        }
    }

    return { nodes, edges }
}

const nodeLabel = (n: GraphNode) =>
    typeof n.text === 'string' ? n.text : (n.text?.value || n.id)

/**
 * 围绕「以当前节点为终点的入边」做的图遍历工具。
 * 返回响应式的：
 *  - directPrevNodes：直接前驱节点
 *  - allPrevNodes：可达的所有前置节点（BFS 反向遍历）
 *  - isPrevNodeStart：直接前驱是否包含开始节点
 *  - prevUserTaskOptions：所有前置中的用户任务（用于「驳回到指定节点」下拉）
 */
export const useGraphTraversal = (
    getLf: () => any,
    getCurrentNodeId: () => string | number | undefined
) => {
    const snapshot = computed(() => readGraphSnapshot(getLf()))

    const directPrevNodes = computed<GraphNode[]>(() => {
        const currentId = getCurrentNodeId()
        if (!currentId) return []
        const { nodes, edges } = snapshot.value
        const directIds = new Set<string>()
        for (const edge of edges) {
            if (String(edge.targetNodeId) === String(currentId) && edge.sourceNodeId) {
                directIds.add(String(edge.sourceNodeId))
            }
        }
        return nodes.filter((n) => directIds.has(String(n.id)))
    })

    const allPrevNodes = computed<GraphNode[]>(() => {
        const currentId = getCurrentNodeId()
        if (!currentId) return []
        const { nodes, edges } = snapshot.value

        const prevMap = new Map<string, string[]>()
        for (const edge of edges) {
            const { sourceNodeId, targetNodeId } = edge
            if (!sourceNodeId || !targetNodeId) continue
            const key = String(targetNodeId)
            if (!prevMap.has(key)) prevMap.set(key, [])
            prevMap.get(key)!.push(String(sourceNodeId))
        }

        const visited = new Set<string>()
        const queue = [String(currentId)]
        while (queue.length > 0) {
            const curr = queue.shift()!
            if (visited.has(curr)) continue
            visited.add(curr)
            for (const prev of prevMap.get(curr) || []) {
                if (!visited.has(prev)) queue.push(prev)
            }
        }
        visited.delete(String(currentId))

        return nodes.filter((n) => visited.has(String(n.id)))
    })

    const isPrevNodeStart = computed(() =>
        directPrevNodes.value.some((n) => n.type === 'bpmn:startEvent')
    )

    const prevUserTaskOptions = computed(() =>
        allPrevNodes.value
            .filter((n) => n.type === 'bpmn:userTask')
            .map((n) => ({ id: n.id, label: nodeLabel(n), type: n.type }))
    )

    return {
        directPrevNodes,
        allPrevNodes,
        isPrevNodeStart,
        prevUserTaskOptions,
    }
}
