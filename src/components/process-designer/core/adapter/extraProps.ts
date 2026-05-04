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
            "properties.form"
        ]
    },
    // 指定 bpmn:sequenceFlow 类型元素的转换规则
    transformer: {
        'bpmn:userTask': {
            out(data: any) {
                const { properties: { approvalType, candidateUsers, candidateRoles, candidateGroups, candidateDepts, passRate } } = data;
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
                const { properties: { expressionType, condition } } = data;
                // 先判断是否有condition属性
                if (condition) {
                    // 再判断是否是cdata格式
                    if (expressionType === 'cdata') {
                        // 如果是cdata格式，需要用CDATA包裹
                        return {
                            json:
                                `<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${${condition
                                }}]]></bpmn:conditionExpression>`,
                        };
                    }
                    // 如果不是cdata格式，直接用普通字符串包裹
                    return {
                        json: `<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${condition}</bpmn:conditionExpression>`,
                    };
                }
                // 如果没有condition属性，直接返回空字符串
                return {
                    json: '',
                };
            },
        },
    },
}


export default extraProps