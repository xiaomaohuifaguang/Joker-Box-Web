// ============================================================
// 动态表单 V2 —— 统一导出文件
// ============================================================

// 类型
export * from './types'

// 常量
export * from './constants'

// 工具函数
export * from './utils/helpers'
export * from './utils/linkage'
export * from './utils/validation'
export * from './utils/remoteOptions'

// Composables
export * from './composables/useFieldState'
export * from './composables/useRemoteOptions'
export * from './composables/useFormValidation'
export * from './composables/useLinkageEngine'

// 组件（default export）
export { default as FieldBadge } from './shared/FieldBadge.vue'
export { default as FormGroup } from './shared/FormGroup.vue'
export { default as OptionEditor } from './shared/OptionEditor.vue'
export { default as OptionNode } from './shared/OptionNode.vue'
export { default as UploadRenderer } from './core/UploadRenderer.vue'
export { default as TableRenderer } from './core/TableRenderer.vue'
export { default as FieldRenderer } from './core/FieldRenderer.vue'
export { default as FormRunner } from './core/FormRunner.vue'
export { default as FieldPalette } from './designer/FieldPalette.vue'
export { default as FieldConfigPanel } from './designer/FieldConfigPanel.vue'
export { default as ValueInput } from './designer/ValueInput.vue'
export { default as ConditionNode } from './designer/ConditionNode.vue'
export { default as ConditionBuilder } from './designer/ConditionBuilder.vue'
export { default as ActionParamInput } from './designer/ActionParamInput.vue'
export { default as LinkageDesigner } from './designer/LinkageDesigner.vue'
export { default as PreviewPanel } from './designer/PreviewPanel.vue'
export { default as FormDesigner } from './designer/FormDesigner.vue'
