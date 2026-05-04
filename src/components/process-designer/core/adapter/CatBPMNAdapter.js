import { BPMNAdapter } from "@logicflow/extension";

// 模块级可变配置，导出供外部随时修改
export const processMeta = {
    '-isExecutable': 'true',
    '-id': 'Process_' + Math.random().toString(36).substring(2, 16),
    '-name': '流程名称'
};

/**
 * 设置 process 元数据
 * - 以 '-' 开头的键会作为 XML 属性输出（如 '-id'、'-name'）
 * - 不带前缀的键会作为子节点输出（如 'bpmn:documentation'）
 * - 当值为空时移除该键，避免导出 <bpmn:documentation /> 这类空标签
 */
export function setProcessMeta(attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            delete processMeta[key];
        } else {
            processMeta[key] = value;
        }
    });
}

class CatBPMNAdapter extends BPMNAdapter {
    constructor(data) {
        super(data);
        // 指向同一个引用对象，外部修改后下次导出自动生效
        this.processAttributes = processMeta;
        // 添加 flowable 命名空间
        this.definitionAttributes = {
            ...this.definitionAttributes,
            '-xmlns:flowable': 'http://flowable.org/bpmn',
        };
    }
}

export default CatBPMNAdapter;
