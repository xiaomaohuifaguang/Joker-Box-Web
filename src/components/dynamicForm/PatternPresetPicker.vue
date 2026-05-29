<template>
  <el-dialog v-model="visible" title="选择常用正则" width="560px" :close-on-click-modal="false" destroy-on-close>
    <div class="preset-search">
      <el-input v-model="searchKeyword" placeholder="搜索正则名称..." clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="preset-categories">
      <el-radio-group v-model="activeCategory" size="small">
        <el-radio-button v-for="cat in PATTERN_PRESET_CATEGORIES" :key="cat" :label="cat">
          {{ cat }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="preset-list">
      <div
        v-for="preset in filteredPresets"
        :key="preset.id"
        class="preset-card"
        @click="onSelect(preset)"
      >
        <div class="preset-name">{{ preset.name }}</div>
        <div class="preset-meta">
          <code class="preset-pattern">{{ preset.pattern }}</code>
          <span class="preset-tips">{{ preset.patternTips }}</span>
        </div>
      </div>
      <el-empty v-if="filteredPresets.length === 0" description="未找到匹配的正则预设" />
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { PATTERN_PRESETS, PATTERN_PRESET_CATEGORIES, type PatternPreset } from './types/pattern-presets'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'select', preset: { pattern: string; patternTips: string }): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const searchKeyword = ref('')
const activeCategory = ref('全部')

watch(() => props.modelValue, open => {
  if (open) {
    searchKeyword.value = ''
    activeCategory.value = '全部'
  }
})

const filteredPresets = computed(() => {
  let list = PATTERN_PRESETS
  if (activeCategory.value !== '全部') {
    list = list.filter(p => p.category === activeCategory.value)
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.category.toLowerCase().includes(kw)
    )
  }
  return list
})

const onSelect = (preset: PatternPreset) => {
  emit('select', { pattern: preset.pattern, patternTips: preset.patternTips })
  visible.value = false
}
</script>

<style scoped>
.preset-search {
  margin-bottom: 12px;
}

.preset-categories {
  margin-bottom: 12px;
}

.preset-categories :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preset-categories :deep(.el-radio-button__inner) {
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
}

.preset-card {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--el-fill-color-blank);
}

.preset-card:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.preset-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
}

.preset-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preset-pattern {
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.preset-tips {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
