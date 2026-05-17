const extraProps =
{
    excludeFields: {
        in: [],
        out: [
            "properties.width",
            "properties.height",
            "properties.expressionType",
            "properties.condition",
            "properties.approvalType",
            "properties.candidateUsers",
            "properties.candidateRoles",
            "properties.candidateGroups",
            "properties.candidateDepts",
            "properties.passRate",
            "properties.actionButtons",
            "properties.backType",
            "properties.backNodeId",
            "properties.backAssigneePolicy",
            "properties.form",
            "properties.isDefault"
        ]
    },
    // 指定 bpmn:sequenceFlow 类型元素的转换规则
    transformer: {
        'bpmn:userTask': {
            out(data: any) {
                const { properties: { approvalType, candidateUsers, candidateRoles, candidateGroups, candidateDepts, passRate, actionButtons, backType, backNodeId, backAssigneePolicy } } = data;
                let extensionElements = '';
                if (approvalType) {
                    extensionElements += `<flowable:approvalType desc="处理类型">${approvalType}</flowable:approvalType>`;
                }
                if (candidateUsers) {
                    extensionElements += `<flowable:candidateUsers desc="候选人">${candidateUsers}</flowable:candidateUsers>`;
                }
                if (candidateRoles) {
                    extensionElements += `<flowable:candidateRoles desc="候选角色">${candidateRoles}</flowable:candidateRoles>`;
                }
                if (candidateGroups) {
                    extensionElements += `<flowable:candidateGroups desc="候选组">${candidateGroups}</flowable:candidateGroups>`;
                }
                if (candidateDepts) {
                    extensionElements += `<flowable:candidateDepts desc="候选部门">${candidateDepts}</flowable:candidateDepts>`;
                }
                if (passRate) {
                    extensionElements += `<flowable:passRate desc="通过率">${passRate}</flowable:passRate>`;
                }
                if (actionButtons) {
                    extensionElements += `<flowable:actionButtons desc="处理按钮">${actionButtons}</flowable:actionButtons>`;
                }
                if (backType) {
                    extensionElements += `<flowable:backType desc="驳回方式">${backType}</flowable:backType>`;
                }
                if (backNodeId) {
                    extensionElements += `<flowable:backNodeId desc="驳回节点">${backNodeId}</flowable:backNodeId>`;
                }
                if (backAssigneePolicy) {
                    extensionElements += `<flowable:backAssigneePolicy desc="回退后任务分配策略">${backAssigneePolicy}</flowable:backAssigneePolicy>`;
                }
                if (extensionElements) {
                    return {
                        json: `  <bpmn:extensionElements>\n\t\t\t${extensionElements.replace(/></g, '>\n\t\t\t<')}\n\t\t  </bpmn:extensionElements>`,
                    };
                }
                return {
                    json: '',
                }
            }
        },
        'bpmn:sequenceFlow': {
            out(data: any) { // 这里的data是LogicFlow中bpmn:sequenceFlow元素的数据
                const { properties: { condition, isDefault } } = data;
                let extensionElements = '';
                if (condition) {
                    extensionElements += `<flowable:conditionExpression desc="条件表达式">${condition}</flowable:conditionExpression>`;
                }
                if (isDefault === true) {
                    extensionElements += `<flowable:isDefault desc="默认路径">true</flowable:isDefault>`;
                }
                if (extensionElements) {
                    return {
                        json: `  <bpmn:extensionElements>\n\t\t\t${extensionElements.replace(/></g, '>\n\t\t\t<')}\n\t\t  </bpmn:extensionElements>`,
                    };
                }
                return {
                    json: '',
                };
            },
        },
    },
}


export default extraProps