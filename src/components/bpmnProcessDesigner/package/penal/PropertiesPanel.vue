<template>
  <div class="properties-panel" :style="{ width: `${width}px`, maxHeight: '75vh' }">
    <el-scrollbar class="panel-scrollbar">
      <el-collapse v-model="activeTab" v-if="isReady" class="panel-collapse" accordion>
        <el-collapse-item name="base" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <InfoFilled />
              </el-icon>
              <span>常规</span>
            </div>
          </template>
          <ElementBaseInfo :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject"
            :type="elementType" :editType="props.type" />
        </el-collapse-item>

        <el-collapse-item name="condition" v-if="elementType === 'Process'" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <ChatDotRound />
              </el-icon>
              <span>消息与信号</span>
            </div>
          </template>
          <SignalAndMassage />
        </el-collapse-item>

        <el-collapse-item name="condition" v-if="conditionFormVisible" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <Connection />
              </el-icon>
              <span>流转条件</span>
            </div>
          </template>
          <FlowCondition :business-object="elementBusinessObject" :type="elementType" />
        </el-collapse-item>

        <el-collapse-item name="task" v-if="isTaskCollapseItemShow(elementType)" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <Checked />
              </el-icon>
              <span>{{ getTaskCollapseItemName(elementType) }}</span>
            </div>
          </template>
          <ElementTask :id="elementId" :type="elementType" />
        </el-collapse-item>

        <el-collapse-item name="multiInstance" v-if="elementType.indexOf('Task') !== -1" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <User />
              </el-icon>
              <span>多人审批方式</span>
            </div>
          </template>
          <ElementMultiInstance :id="elementId" :business-object="elementBusinessObject" :type="elementType" />
        </el-collapse-item>

        <el-collapse-item name="listeners" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <Bell />
              </el-icon>
              <span>执行监听器</span>
            </div>
          </template>
          <ElementListeners :id="elementId" :type="elementType" />
        </el-collapse-item>

        <el-collapse-item name="taskListeners" v-if="elementType === 'UserTask'" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <BellFilled />
              </el-icon>
              <span>任务监听器</span>
            </div>
          </template>
          <UserTaskListeners :id="elementId" :type="elementType" />
        </el-collapse-item>

        <el-collapse-item name="extensions" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <Setting />
              </el-icon>
              <span>扩展属性</span>
            </div>
          </template>
          <ElementProperties :id="elementId" :type="elementType" />
        </el-collapse-item>

        <el-collapse-item name="other" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <Document />
              </el-icon>
              <span>备注</span>
            </div>
          </template>
          <ElementOtherConfig :id="elementId" />
        </el-collapse-item>

        <el-collapse-item name="customConfig" class="panel-item">
          <template #title>
            <div class="panel-header">
              <el-icon>
                <Tools />
              </el-icon>
              <span>自定义配置</span>
            </div>
          </template>
          <ElementCustomConfig :id="elementId" :type="elementType" :business-object="elementBusinessObject" />
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
  </div>
</template>
<script lang="ts" setup>
import ElementBaseInfo from './base/ElementBaseInfo.vue'
import ElementOtherConfig from './other/ElementOtherConfig.vue'
import ElementTask from './task/ElementTask.vue'
import ElementMultiInstance from './multi-instance/ElementMultiInstance.vue'
import FlowCondition from './flow-condition/FlowCondition.vue'
import SignalAndMassage from './signal-message/SignalAndMessage.vue'
import ElementListeners from './listeners/ElementListeners.vue'
import ElementProperties from './properties/ElementProperties.vue'
// import ElementForm from './form/ElementForm.vue'
import ElementCustomConfig from './custom-config/ElementCustomConfig.vue'
// import ElementForm from './form/ElementForm.vue'
import UserTaskListeners from './listeners/UserTaskListeners.vue'
import { getTaskCollapseItemName, isTaskCollapseItemShow } from './task/data'
import { ref, provide, watch, nextTick, onBeforeUnmount } from 'vue'

import {
  InfoFilled, ChatDotRound, Connection, Checked,
  User, Bell, BellFilled, Setting, Document, Tools
} from '@element-plus/icons-vue'

defineOptions({ name: 'MyPropertiesPanel' })

/**
 * 侧边栏
 * @Author MiyueFE
 * @Home https://github.com/miyuesc
 * @Date 2021年3月31日18:57:51
 */
const props = defineProps({
  type: {
    type: String,
    default: ''
  },
  bpmnModeler: {
    type: Object,
    default: () => { }
  },
  prefix: {
    type: String,
    default: 'camunda'
  },
  width: {
    type: Number,
    default: 480
  },
  idEditDisabled: {
    type: Boolean,
    default: false
  },
  model: Object // 流程模型的数据
})

const activeTab = ref('base')
const elementId = ref('')
const elementType = ref('')
const elementBusinessObject = ref<any>({}) // 元素 businessObject 镜像，提供给需要做判断的组件使用
const conditionFormVisible = ref(false) // 流转条件设置
// const formVisible = ref(false) // 表单配置
const bpmnElement = ref()
const isReady = ref(false)

provide('prefix', props.prefix)
provide('width', props.width)

// 初始化 bpmnInstances
const initBpmnInstances = () => {
  if (!props.bpmnModeler) return false
  try {
    const instances = {
      modeler: props.bpmnModeler,
      modeling: props.bpmnModeler.get('modeling'),
      moddle: props.bpmnModeler.get('moddle'),
      eventBus: props.bpmnModeler.get('eventBus'),
      bpmnFactory: props.bpmnModeler.get('bpmnFactory'),
      elementFactory: props.bpmnModeler.get('elementFactory'),
      elementRegistry: props.bpmnModeler.get('elementRegistry'),
      replace: props.bpmnModeler.get('replace'),
      selection: props.bpmnModeler.get('selection')
    }

    // 检查所有实例是否都存在
    const allInstancesExist = Object.values(instances).every(instance => instance)
    if (allInstancesExist) {
      const w = window as any
      w.bpmnInstances = instances
      return true
    }
    return false
  } catch (error) {
    console.error('初始化 bpmnInstances 失败:', error)
    return false
  }
}

const bpmnInstances = () => (window as any)?.bpmnInstances

// 监听 props.bpmnModeler 然后 initModels
const unwatchBpmn = watch(
  () => props.bpmnModeler,
  async () => {
    // 避免加载时 流程图 并未加载完成
    if (!props.bpmnModeler) {
      console.log('缺少props.bpmnModeler')
      return
    }

    try {
      // 等待 modeler 初始化完成
      await nextTick()
      if (initBpmnInstances()) {
        isReady.value = true
        await nextTick()
        getActiveElement()
      } else {
        console.error('modeler 实例未完全初始化')
      }
    } catch (error) {
      console.error('初始化失败:', error)
    }
  },
  {
    immediate: true
  }
)

const getActiveElement = () => {
  if (!isReady.value || !props.bpmnModeler) return

  // 初始第一个选中元素 bpmn:Process
  initFormOnChanged(null)
  props.bpmnModeler.on('import.done', (e) => {
    console.log(e, 'eeeee')
    initFormOnChanged(null)
  })
  // 监听选择事件，修改当前激活的元素以及表单
  props.bpmnModeler.on('selection.changed', ({ newSelection }) => {
    initFormOnChanged(newSelection[0] || null)
  })
  props.bpmnModeler.on('element.changed', ({ element }) => {
    // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
    if (element && element.id === elementId.value) {
      initFormOnChanged(element)
    }
  })
}

// 初始化数据
const initFormOnChanged = (element) => {
  if (!isReady.value || !bpmnInstances()) return

  let activatedElement = element
  if (!activatedElement) {
    activatedElement =
      bpmnInstances().elementRegistry.find((el) => el.type === 'bpmn:Process') ??
      bpmnInstances().elementRegistry.find((el) => el.type === 'bpmn:Collaboration')
  }
  if (!activatedElement) return

  try {
    console.log(`
                ----------
        select element changed:
                  id:  ${activatedElement.id}
                type:  ${activatedElement.businessObject.$type}
                ----------
                `)
    console.log('businessObject: ', activatedElement.businessObject)
    bpmnInstances().bpmnElement = activatedElement
    bpmnElement.value = activatedElement
    elementId.value = activatedElement.id
    elementType.value = activatedElement.type.split(':')[1] || ''
    console.log('elementType', elementType.value)
    elementBusinessObject.value = JSON.parse(JSON.stringify(activatedElement.businessObject))
    console.log('elementBusinessObject: ', elementBusinessObject.value)
    conditionFormVisible.value = !!(
      elementType.value === 'SequenceFlow' &&
      activatedElement.source &&
      activatedElement.source.type.indexOf('StartEvent') === -1
    )
    // formVisible.value = elementType.value === 'UserTask' || elementType.value === 'StartEvent'
  } catch (error) {
    console.error('初始化表单数据失败:', error)
  }
}

onBeforeUnmount(() => {
  const w = window as any
  w.bpmnInstances = null
  isReady.value = false
})

watch(
  () => elementId.value,
  () => {
    activeTab.value = 'base'
  }
)
</script>

<style scoped lang="scss">
.properties-panel {
  height: 100%;
  background-color: var(--el-bg-color-overlay);
  border-left: 1px solid var(--el-border-color-light);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.panel-scrollbar {
  flex: 1;

  :deep(.el-scrollbar__view) {
    padding: 10px;
  }
}

.panel-collapse {
  border: none;

  :deep(.el-collapse-item__header) {
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    background-color: transparent;
    border-bottom: none;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }

  :deep(.el-collapse-item__wrap) {
    background-color: transparent;
    border-bottom: none;
  }

  :deep(.el-collapse-item__content) {
    padding: 10px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;
    margin-top: 5px;
  }
}

.panel-header {
  display: flex;
  align-items: center;

  .el-icon {
    margin-right: 8px;
    font-size: 16px;
    color: var(--el-color-primary);
  }

  span {
    flex: 1;
  }
}

.panel-item {
  margin-bottom: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--el-bg-color-overlay);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  &:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .properties-panel {
    width: 100% !important;
    max-height: 40vh;
    border-left: none;
    border-top: 1px solid var(--el-border-color-light);
  }
}
</style>