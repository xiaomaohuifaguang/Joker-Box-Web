# 表单版本选择 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace FormSelector's API with `/dynamicForm/publishedForms`, add version selector, and clear field permissions on version change.

**Architecture:** Refactor `FormSelector.vue` to load published forms once with version lists, add a version dropdown next to the form dropdown, and propagate version changes to all consumers. Version/form changes that affect field structure will clear the relevant `nodeFieldPermissions`.

**Tech Stack:** Vue 3, Element Plus, existing http utility

---

### Task 1: Refactor FormSelector.vue — API and version dropdown

**Files:**
- Modify: `src/components/process-designer/components/FormSelector.vue`

- [ ] **Step 1: Rewrite FormSelector.vue**

Replace the entire file with the new implementation using `/dynamicForm/publishedForms` API, adding version selector and new props/emit.

```vue
<template>
    <div class="form-selector">
        <el-select :model-value="modelValue" @update:model-value="onFormSelect" filterable
            :loading="loading" placeholder="请选择表单" style="flex: 1; min-width: 0"
            :disabled="disabled" clearable>
            <el-option v-for="item in formOptions" :key="item.formId" :label="item.formName"
                :value="item.formId" />
        </el-select>
        <el-select v-if="modelValue && versionOptions.length > 0"
            :model-value="modelVersion" @update:model-value="onVersionSelect"
            :loading="loading" placeholder="版本" style="width: 140px; flex-shrink: 0"
            :disabled="disabled">
            <el-option v-for="v in versionOptions" :key="v.version"
                :label="v.version === currentLatest ? `${v.version} (最新)` : v.version"
                :value="v.version" />
        </el-select>
    </div>
</template>

<script setup lang="ts">
import { http } from '@/utils';
import { computed, ref, watch } from 'vue'

interface PublishedForm {
    formId: string
    formName: string
    latestVersion: string
    versions: { version: string; publishTime: string }[]
}

const props = defineProps<{
    modelValue?: string
    modelVersion?: string
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'update:modelVersion', value: string): void
    (e: 'change', form: { id: string; name: string; version: string } | null): void
}>()

const loading = ref(false)
const formOptions = ref<PublishedForm[]>([])

const currentLatest = computed(() => {
    if (!props.modelValue) return ''
    const form = formOptions.value.find(f => f.formId === props.modelValue)
    return form?.latestVersion ?? ''
})

const versionOptions = computed(() => {
    if (!props.modelValue) return []
    const form = formOptions.value.find(f => f.formId === props.modelValue)
    return form?.versions ?? []
})

const loadForms = async () => {
    loading.value = true
    try {
        const result = await http.post('/dynamicForm/publishedForms')
        formOptions.value = result || []
    } finally {
        loading.value = false
    }
}

const onFormSelect = (formId: string) => {
    emit('update:modelValue', formId)
    if (!formId) {
        emit('update:modelVersion', '')
        emit('change', null)
        return
    }
    const form = formOptions.value.find(f => f.formId === formId)
    if (form) {
        emit('update:modelVersion', form.latestVersion)
        emit('change', { id: form.formId, name: form.formName, version: form.latestVersion })
    } else {
        emit('update:modelVersion', '')
        emit('change', null)
    }
}

const onVersionSelect = (version: string) => {
    emit('update:modelVersion', version)
    const form = formOptions.value.find(f => f.formId === props.modelValue)
    if (form) {
        emit('change', { id: form.formId, name: form.formName, version })
    }
}

// Load on mount; if modelValue exists, ensure it's in the list
watch(
    () => props.modelValue,
    async () => {
        if (formOptions.value.length === 0) {
            await loadForms()
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.form-selector {
    display: flex;
    gap: 8px;
    width: 100%;
}
</style>
```

- [ ] **Step 2: Verify no TypeScript errors**

Check that the IDE shows no errors for FormSelector.vue.

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/FormSelector.vue
git commit -m "refactor: replace FormSelector API with publishedForms, add version selector"
```

---

### Task 2: Update ProcessPropertyPanel.vue — global form version binding + permission clearing

**Files:**
- Modify: `src/components/process-designer/components/PropertyPanels/ProcessPropertyPanel.vue`

- [ ] **Step 1: Update template — add v-model:model-version**

Change the FormSelector line from:

```html
<FormSelector v-model="globalFormId" :disabled="readonly" @change="onFormChange" />
```

to:

```html
<FormSelector v-model="globalFormId" v-model:model-version="globalFormVersion" :disabled="readonly" @change="onFormChange" />
```

- [ ] **Step 2: Update onFormChange and updateGlobalFormBinding**

Replace the current `onFormChange` and `updateGlobalFormBinding` functions with version-change-aware logic that clears inherited node permissions:

```ts
const onFormChange = (form: { id: string; name: string; version: string } | null) => {
    const oldVersion = globalFormVersion.value
    globalFormVersion.value = form?.version ?? ''
    const versionChanged = oldVersion && oldVersion !== globalFormVersion.value
    updateGlobalFormBinding(versionChanged)
}

const updateGlobalFormBinding = (clearInheritedPermissions = false) => {
    if (!props.nodeConfig) return
    const binding = globalFormId.value
        ? { formId: globalFormId.value, formVersion: globalFormVersion.value }
        : null
    let newPermissions = props.nodeConfig.nodeFieldPermissions
    if (clearInheritedPermissions && binding) {
        const inheritedNodeIds = props.nodeConfig.nodeFormBindings
            .filter((b: any) => b.inheritMainForm === '1')
            .map((b: any) => String(b.nodeId))
        newPermissions = newPermissions.filter(
            (p: any) => !inheritedNodeIds.includes(String(p.nodeId))
        )
    }
    emit('update:nodeConfig', {
        ...props.nodeConfig,
        globalFormBinding: binding,
        nodeFieldPermissions: newPermissions,
    })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/PropertyPanels/ProcessPropertyPanel.vue
git commit -m "feat: add version binding to global form, clear inherited permissions on version change"
```

---

### Task 3: Update UserTaskProperty.vue — node form version binding + permission clearing on version change

**Files:**
- Modify: `src/components/process-designer/components/PropertyPanels/UserTaskProperty.vue`

- [ ] **Step 1: Update template — add v-model:model-version**

Change line 90 from:

```html
<FormSelector v-model="nodeFormId" :disabled="readonly" @change="onNodeFormChange" />
```

to:

```html
<FormSelector v-model="nodeFormId" v-model:model-version="nodeFormVersion" :disabled="readonly" @change="onNodeFormChange" />
```

- [ ] **Step 2: Update updateNodeBinding — clear permissions on version change**

Replace the permission-clearing check in `updateNodeBinding`. Find this block (around line 429-440):

```ts
const updateNodeBinding = () => {
    if (!props.nodeConfig || !props.data?.id) return
    const nodeId = String(props.data.id)
    const bindings = [...props.nodeConfig.nodeFormBindings]
    const idx = bindings.findIndex((b: any) => String(b.nodeId) === nodeId)
    const oldFormId = idx >= 0 ? bindings[idx].formId : ''
    const newFormId = nodeFormId.value

    let newPermissions = props.nodeConfig.nodeFieldPermissions
    if (oldFormId !== newFormId) {
        newPermissions = newPermissions.filter((p: any) => String(p.nodeId) !== nodeId)
    }
```

Replace with:

```ts
const updateNodeBinding = () => {
    if (!props.nodeConfig || !props.data?.id) return
    const nodeId = String(props.data.id)
    const bindings = [...props.nodeConfig.nodeFormBindings]
    const idx = bindings.findIndex((b: any) => String(b.nodeId) === nodeId)
    const oldFormId = idx >= 0 ? bindings[idx].formId : ''
    const oldVersion = idx >= 0 ? bindings[idx].formVersion : ''
    const newFormId = nodeFormId.value

    let newPermissions = props.nodeConfig.nodeFieldPermissions
    if (oldFormId !== newFormId || oldVersion !== nodeFormVersion.value) {
        newPermissions = newPermissions.filter((p: any) => String(p.nodeId) !== nodeId)
    }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/PropertyPanels/UserTaskProperty.vue
git commit -m "feat: add version binding to user task form, clear permissions on version change"
```

---

### Task 4: Update StartEventProperty.vue — same as UserTaskProperty

**Files:**
- Modify: `src/components/process-designer/components/PropertyPanels/StartEventProperty.vue`

- [ ] **Step 1: Update template — add v-model:model-version**

Change line 15 from:

```html
<FormSelector v-model="nodeFormId" :disabled="readonly" @change="onNodeFormChange" />
```

to:

```html
<FormSelector v-model="nodeFormId" v-model:model-version="nodeFormVersion" :disabled="readonly" @change="onNodeFormChange" />
```

- [ ] **Step 2: Update updateNodeBinding — clear permissions on version change**

Find this block (around line 74-85):

```ts
const updateNodeBinding = () => {
    if (!props.nodeConfig || !props.data?.id) return
    const nodeId = String(props.data.id)
    const bindings = [...props.nodeConfig.nodeFormBindings]
    const idx = bindings.findIndex((b: any) => String(b.nodeId) === nodeId)
    const oldFormId = idx >= 0 ? bindings[idx].formId : ''
    const newFormId = nodeFormId.value

    let newPermissions = props.nodeConfig.nodeFieldPermissions
    if (oldFormId !== newFormId) {
        newPermissions = newPermissions.filter((p: any) => String(p.nodeId) !== nodeId)
    }
```

Replace with:

```ts
const updateNodeBinding = () => {
    if (!props.nodeConfig || !props.data?.id) return
    const nodeId = String(props.data.id)
    const bindings = [...props.nodeConfig.nodeFormBindings]
    const idx = bindings.findIndex((b: any) => String(b.nodeId) === nodeId)
    const oldFormId = idx >= 0 ? bindings[idx].formId : ''
    const oldVersion = idx >= 0 ? bindings[idx].formVersion : ''
    const newFormId = nodeFormId.value

    let newPermissions = props.nodeConfig.nodeFieldPermissions
    if (oldFormId !== newFormId || oldVersion !== nodeFormVersion.value) {
        newPermissions = newPermissions.filter((p: any) => String(p.nodeId) !== nodeId)
    }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/PropertyPanels/StartEventProperty.vue
git commit -m "feat: add version binding to start event form, clear permissions on version change"
```

---

### Task 5: Update FieldPermissionDialog.vue — pass version to /dynamicForm/info

**Files:**
- Modify: `src/components/process-designer/components/FieldPermissionDialog.vue`

- [ ] **Step 1: Add formVersion and globalFormVersion props**

Update the props definition from:

```ts
const props = defineProps<{
    modelValue: boolean
    nodeConfig?: {
        globalFormBinding: any
        nodeFormBindings: any[]
        nodeFieldPermissions: any[]
    }
    nodeId?: string
    formId?: string
    inheritMainForm?: string
    readonly?: boolean
}>()
```

to:

```ts
const props = defineProps<{
    modelValue: boolean
    nodeConfig?: {
        globalFormBinding: any
        nodeFormBindings: any[]
        nodeFieldPermissions: any[]
    }
    nodeId?: string
    formId?: string
    formVersion?: string
    inheritMainForm?: string
    readonly?: boolean
}>()
```

- [ ] **Step 2: Pass version in /dynamicForm/info calls**

In `loadPermissions`, find the node form info call (around line 193):

```ts
const data = await http.post('/dynamicForm/info', { id: props.formId })
```

Replace with:

```ts
const data = await http.post('/dynamicForm/info', { id: props.formId, version: props.formVersion })
```

Find the global form info call (around line 206):

```ts
const data = await http.post('/dynamicForm/info', { id: globalFormId })
```

Replace with:

```ts
const globalFormVersion = props.nodeConfig?.globalFormBinding?.formVersion
const data = await http.post('/dynamicForm/info', { id: globalFormId, version: globalFormVersion })
```

- [ ] **Step 3: Add formVersion to the watch dependency**

Find the watch (around line 263-265):

```ts
watch(
    () => [props.modelValue, props.formId, props.nodeId, props.inheritMainForm, props.nodeConfig?.globalFormBinding?.formId],
```

Replace with:

```ts
watch(
    () => [props.modelValue, props.formId, props.formVersion, props.nodeId, props.inheritMainForm, props.nodeConfig?.globalFormBinding?.formId, props.nodeConfig?.globalFormBinding?.formVersion],
```

- [ ] **Step 4: Commit**

```bash
git add src/components/process-designer/components/FieldPermissionDialog.vue
git commit -m "feat: pass version to dynamicForm/info in FieldPermissionDialog"
```

---

### Task 6: Pass formVersion to FieldPermissionDialog from consumers

**Files:**
- Modify: `src/components/process-designer/components/PropertyPanels/UserTaskProperty.vue`
- Modify: `src/components/process-designer/components/PropertyPanels/StartEventProperty.vue`

- [ ] **Step 1: Update UserTaskProperty.vue FieldPermissionDialog usage**

Find (around line 108-110):

```html
<FieldPermissionDialog v-model="showPermissionDialog" :node-config="nodeConfig" :node-id="data?.id"
    :form-id="nodeFormId" :inherit-main-form="inheritMainForm ? '1' : '0'" :readonly="readonly"
    @update:node-config="onPermissionUpdate" />
```

Replace with:

```html
<FieldPermissionDialog v-model="showPermissionDialog" :node-config="nodeConfig" :node-id="data?.id"
    :form-id="nodeFormId" :form-version="nodeFormVersion" :inherit-main-form="inheritMainForm ? '1' : '0'" :readonly="readonly"
    @update:node-config="onPermissionUpdate" />
```

- [ ] **Step 2: Update StartEventProperty.vue FieldPermissionDialog usage**

Find (around line 33-35):

```html
<FieldPermissionDialog v-model="showPermissionDialog" :node-config="nodeConfig" :node-id="data?.id"
    :form-id="nodeFormId" :inherit-main-form="inheritMainForm ? '1' : '0'" :readonly="readonly"
    @update:node-config="onPermissionUpdate" />
```

Replace with:

```html
<FieldPermissionDialog v-model="showPermissionDialog" :node-config="nodeConfig" :node-id="data?.id"
    :form-id="nodeFormId" :form-version="nodeFormVersion" :inherit-main-form="inheritMainForm ? '1' : '0'" :readonly="readonly"
    @update:node-config="onPermissionUpdate" />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/process-designer/components/PropertyPanels/UserTaskProperty.vue src/components/process-designer/components/PropertyPanels/StartEventProperty.vue
git commit -m "feat: pass formVersion to FieldPermissionDialog from property panels"
```
