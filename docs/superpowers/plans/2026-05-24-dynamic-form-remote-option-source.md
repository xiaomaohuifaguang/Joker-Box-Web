# Dynamic Form Remote Option Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add API-backed option sources for dynamic form option fields while preserving existing static options and OPTION linkage behavior.

**Architecture:** Add `optionSource` types to field metadata, a focused remote-option utility for URL validation, API loading, point-path mapping, and tree conversion, then let `FormMaker` own runtime/preview option caches so loaded options do not mutate template field configuration. `FieldRenderer` remains a presentational component that receives effective options and loading/error status.

**Tech Stack:** Vue 3 Composition API, Element Plus, existing `http` client, TypeScript.

---

### Task 1: Type System and Template Validation

**Files:**
- Modify: `src/components/dynamicForm/types/index.ts`
- Modify: `src/components/dynamicForm/linkage.ts`

- [ ] Add `FormOptionSourceType`, `FormOptionMapping`, `FormOptionSource` interfaces.
- [ ] Add `optionSource?: FormOptionSource` to `FormField`.
- [ ] Add helpers for option-source-capable fields and API option source detection.
- [ ] Update template validation so API mode allows empty `options`, validates `url`, `method`, and mapping fields, and rejects API source on unsupported field types.
- [ ] In API mode, validate default value shape only; do not require existence in `options`.

### Task 2: Remote Option Loading Utility

**Files:**
- Create: `src/components/dynamicForm/remoteOptions.ts`

- [ ] Validate URL is a same-origin relative path and does not start with `http://`, `https://`, or `//`.
- [ ] Support GET query params and POST JSON body params.
- [ ] Support point-path lookup plus `$` for root arrays.
- [ ] Map remote response nodes to `{ label, value, visible, children }`.
- [ ] Reject mapped values that are not string or number.
- [ ] Omit `children` for leaf nodes.

### Task 3: Renderer Loading/Error Presentation

**Files:**
- Modify: `src/components/dynamicForm/FieldRenderer.vue`

- [ ] Add props for remote option loading, error message, and retry callback.
- [ ] Disable option fields while remote options are loading or failed.
- [ ] Show a small loading hint and failure retry UI for option fields.
- [ ] Keep all non-option field rendering unchanged.

### Task 4: FormMaker Remote Option Cache and Linkage Integration

**Files:**
- Modify: `src/components/dynamicForm/FormMaker.vue`

- [ ] Load remote options for design preview and runtime modes.
- [ ] Store loaded options in field-id keyed runtime caches; do not write back to field definitions.
- [ ] Build effective field lists by replacing `options` with loaded API options before computing linkage states.
- [ ] Recompute linkage after remote options load.
- [ ] Pass loading/error/retry state to `FieldRenderer`.
- [ ] Apply OPTION linkage filtering after remote options are loaded.

### Task 5: FieldEditor API Option Source UI

**Files:**
- Modify: `src/components/dynamicForm/FieldEditor.vue`

- [ ] Add source selector for option fields: static or API.
- [ ] Preserve existing option editor for static mode.
- [ ] Add API mode fields: url, method, params JSON, listPath, labelPath, valuePath, childrenPath.
- [ ] In API mode, allow static options to be empty.
- [ ] Validate params JSON before emitting field.
- [ ] Emit `optionSource` in camelCase.

### Task 6: Verification

**Files:**
- Existing project files only.

- [ ] Run `npm run build` and record result.
- [ ] If build is blocked by existing `registerComponents.js` path issue, report that separately.
