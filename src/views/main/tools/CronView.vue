<template>
    <div class="cron-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <div class="title-icon">
                        <el-icon>
                            <Clock />
                        </el-icon>
                    </div>
                    <div class="title-text">
                        <h1>Cron 表达式工具</h1>
                        <p>可视化生成、解析、预览 Cron 时间表达式（Quartz 风格 / 7 位）</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="cron-container">
            <el-row :gutter="20">
                <!-- 构造器 -->
                <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
                    <div class="builder-section card-section">
                        <div class="section-header">
                            <div class="section-title">
                                <div class="title-icon small input">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                </div>
                                <h3>表达式构造</h3>
                            </div>
                            <div class="header-actions">
                                <el-tooltip content="解析当前表达式回填" placement="top">
                                    <el-button size="small" circle @click="parseToBuilder" class="action-btn format">
                                        <el-icon>
                                            <MagicStick />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="重置构造器" placement="top">
                                    <el-button size="small" circle @click="resetBuilder" class="action-btn delete">
                                        <el-icon>
                                            <RefreshLeft />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </div>

                        <el-tabs v-model="activeTab" class="cron-tabs">
                            <el-tab-pane v-for="def in fieldDefs" :key="def.key" :name="def.key">
                                <template #label>
                                    <span class="tab-label">
                                        {{ def.label }}
                                        <span class="tab-expr">{{ fieldExprs[def.key] }}</span>
                                    </span>
                                </template>

                                <div class="rule-panel">
                                    <el-radio-group v-model="builder[def.key].type" class="rule-radio">
                                        <el-radio value="every">任意值（每{{ def.label }}）</el-radio>
                                        <el-radio v-if="def.hasAny" value="any">不指定（?）</el-radio>
                                        <el-radio value="range">周期范围</el-radio>
                                        <el-radio value="step">间隔（每 N {{ def.label }}）</el-radio>
                                        <el-radio value="specific">指定特定值</el-radio>
                                    </el-radio-group>

                                    <div class="rule-detail" v-if="builder[def.key].type === 'range'">
                                        <span class="rule-text">从</span>
                                        <el-input-number v-model="builder[def.key].rangeFrom" :min="def.min"
                                            :max="def.max" size="default" controls-position="right" />
                                        <span class="rule-text">到</span>
                                        <el-input-number v-model="builder[def.key].rangeTo" :min="def.min" :max="def.max"
                                            size="default" controls-position="right" />
                                        <span class="rule-text">{{ def.label }}</span>
                                    </div>

                                    <div class="rule-detail" v-if="builder[def.key].type === 'step'">
                                        <span class="rule-text">从第</span>
                                        <el-input-number v-model="builder[def.key].stepStart" :min="def.min"
                                            :max="def.max" size="default" controls-position="right" />
                                        <span class="rule-text">{{ def.label }}开始，每</span>
                                        <el-input-number v-model="builder[def.key].stepEvery" :min="1"
                                            :max="def.max - def.min + 1" size="default" controls-position="right" />
                                        <span class="rule-text">{{ def.label }}执行一次</span>
                                    </div>

                                    <div class="rule-detail specific" v-if="builder[def.key].type === 'specific'">
                                        <div class="specific-grid">
                                            <el-check-tag v-for="v in valueRange(def)" :key="v"
                                                :checked="builder[def.key].specific.includes(v)"
                                                @change="toggleSpecific(def.key, v)">
                                                {{ formatTagLabel(def.key, v) }}
                                            </el-check-tag>
                                        </div>
                                    </div>

                                    <div class="rule-tip" v-if="def.key === 'dom' || def.key === 'dow'">
                                        <el-icon>
                                            <InfoFilled />
                                        </el-icon>
                                        <span>「日」与「周」必须有且仅有一个为 ?，修改其中一个会自动同步另一个。</span>
                                    </div>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-col>

                <!-- 结果展示 -->
                <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
                    <div class="result-section card-section">
                        <div class="section-header">
                            <div class="section-title">
                                <div class="title-icon small output">
                                    <el-icon>
                                        <Document />
                                    </el-icon>
                                </div>
                                <h3>表达式结果</h3>
                            </div>
                            <div class="header-actions">
                                <el-tooltip content="复制表达式" placement="top">
                                    <el-button size="small" circle @click="copyCron" class="action-btn copy">
                                        <el-icon>
                                            <DocumentCopy />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </div>

                        <el-input v-model="cronExpr" placeholder="秒 分 时 日 月 周 年" class="cron-input" size="large">
                            <template #prepend>Cron</template>
                        </el-input>

                        <div class="cron-fields">
                            <div v-for="(def, i) in fieldDefs" :key="def.key" class="field-chip"
                                :class="{ active: parsedTokens[i] }">
                                <span class="chip-label">{{ def.label }}</span>
                                <span class="chip-value">{{ parsedTokens[i] || '-' }}</span>
                            </div>
                        </div>

                        <div class="description-block">
                            <div class="block-label">
                                <el-icon>
                                    <ChatLineRound />
                                </el-icon>
                                <span>语义说明</span>
                            </div>
                            <div class="block-content" :class="{ error: !valid }">
                                {{ description }}
                            </div>
                        </div>

                        <div class="next-times">
                            <div class="block-label">
                                <el-icon>
                                    <Timer />
                                </el-icon>
                                <span>最近 {{ previewCount }} 次执行时间</span>
                                <el-input-number v-model="previewCount" :min="1" :max="20" size="small"
                                    controls-position="right" class="count-input" />
                            </div>
                            <div class="times-list" v-if="valid && nextExecTimes.length">
                                <div v-for="(t, i) in nextExecTimes" :key="i" class="time-item">
                                    <span class="time-no">{{ i + 1 }}</span>
                                    <span class="time-value">{{ t }}</span>
                                </div>
                            </div>
                            <div v-else class="times-empty">
                                <el-icon>
                                    <Warning />
                                </el-icon>
                                <span>{{ valid ? '当前表达式在未来一段时间内无匹配时间' : '表达式不合法，无法计算' }}</span>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <!-- 常用预设 -->
            <div class="preset-section card-section">
                <div class="section-header">
                    <div class="section-title">
                        <div class="title-icon small preset">
                            <el-icon>
                                <CollectionTag />
                            </el-icon>
                        </div>
                        <h3>常用 Cron 表达式</h3>
                    </div>
                </div>
                <div class="preset-grid">
                    <div v-for="p in presets" :key="p.expr" class="preset-card" @click="applyPreset(p.expr)">
                        <div class="preset-expr">{{ p.expr }}</div>
                        <div class="preset-desc">{{ p.desc }}</div>
                    </div>
                </div>
            </div>

            <!-- 语法说明 -->
            <div class="syntax-section card-section">
                <div class="section-header">
                    <div class="section-title">
                        <div class="title-icon small syntax">
                            <el-icon>
                                <Reading />
                            </el-icon>
                        </div>
                        <h3>语法速查</h3>
                    </div>
                </div>
                <el-table :data="syntaxRows" stripe class="syntax-table">
                    <el-table-column prop="symbol" label="符号" width="120" />
                    <el-table-column prop="meaning" label="含义" width="180" />
                    <el-table-column prop="example" label="示例" />
                </el-table>
                <el-table :data="fieldRangeRows" stripe class="syntax-table">
                    <el-table-column prop="field" label="字段" width="120" />
                    <el-table-column prop="range" label="取值范围" width="180" />
                    <el-table-column prop="symbols" label="允许符号" />
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, reactive, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import {
    Clock,
    Edit,
    Document,
    DocumentCopy,
    RefreshLeft,
    MagicStick,
    InfoFilled,
    ChatLineRound,
    Timer,
    Warning,
    CollectionTag,
    Reading,
} from '@element-plus/icons-vue'

const { copy: copyToClipboard } = useClipboard()

type FieldKey = 'second' | 'minute' | 'hour' | 'dom' | 'month' | 'dow' | 'year'
type RuleType = 'every' | 'any' | 'range' | 'step' | 'specific'

interface FieldDef {
    key: FieldKey
    label: string
    min: number
    max: number
    hasAny: boolean
}

interface RuleState {
    type: RuleType
    rangeFrom: number
    rangeTo: number
    stepStart: number
    stepEvery: number
    specific: number[]
}

const fieldDefs: FieldDef[] = [
    { key: 'second', label: '秒', min: 0, max: 59, hasAny: false },
    { key: 'minute', label: '分', min: 0, max: 59, hasAny: false },
    { key: 'hour', label: '时', min: 0, max: 23, hasAny: false },
    { key: 'dom', label: '日', min: 1, max: 31, hasAny: true },
    { key: 'month', label: '月', min: 1, max: 12, hasAny: false },
    { key: 'dow', label: '周', min: 1, max: 7, hasAny: true },
    { key: 'year', label: '年', min: 1970, max: 2099, hasAny: false },
]

const dowLabels = ['', '日', '一', '二', '三', '四', '五', '六']

const activeTab = ref<FieldKey>('second')
const previewCount = ref(5)

const defaultBuilder = (): Record<FieldKey, RuleState> => ({
    second: { type: 'specific', rangeFrom: 0, rangeTo: 0, stepStart: 0, stepEvery: 1, specific: [0] },
    minute: { type: 'specific', rangeFrom: 0, rangeTo: 0, stepStart: 0, stepEvery: 1, specific: [0] },
    hour: { type: 'specific', rangeFrom: 0, rangeTo: 0, stepStart: 0, stepEvery: 1, specific: [0] },
    dom: { type: 'every', rangeFrom: 1, rangeTo: 1, stepStart: 1, stepEvery: 1, specific: [] },
    month: { type: 'every', rangeFrom: 1, rangeTo: 1, stepStart: 1, stepEvery: 1, specific: [] },
    dow: { type: 'any', rangeFrom: 1, rangeTo: 1, stepStart: 1, stepEvery: 1, specific: [] },
    year: { type: 'every', rangeFrom: 2025, rangeTo: 2025, stepStart: 2025, stepEvery: 1, specific: [] },
})

const builder = reactive(defaultBuilder())

// 构建单个字段表达式
const buildField = (rule: RuleState, def: FieldDef): string => {
    switch (rule.type) {
        case 'every':
            return '*'
        case 'any':
            return def.hasAny ? '?' : '*'
        case 'range': {
            const from = Math.max(def.min, Math.min(def.max, rule.rangeFrom))
            const to = Math.max(def.min, Math.min(def.max, rule.rangeTo))
            return from === to ? String(from) : `${from}-${to}`
        }
        case 'step': {
            const start = Math.max(def.min, Math.min(def.max, rule.stepStart))
            const every = Math.max(1, rule.stepEvery)
            return `${start}/${every}`
        }
        case 'specific': {
            if (!rule.specific.length) return '*'
            return [...rule.specific].sort((a, b) => a - b).join(',')
        }
    }
}

const fieldExprs = computed(() => {
    const r: Record<FieldKey, string> = {} as any
    for (const d of fieldDefs) r[d.key] = buildField(builder[d.key], d)
    return r
})

const cronExpr = ref('')

watch(
    fieldExprs,
    (vals) => {
        cronExpr.value = fieldDefs.map((d) => vals[d.key]).join(' ')
    },
    { immediate: true }
)

// 同步 day-of-month 与 day-of-week 互斥
let syncing = false
watch(
    () => builder.dom.type,
    (t) => {
        if (syncing) return
        syncing = true
        if (t === 'any') {
            if (builder.dow.type === 'any') builder.dow.type = 'every'
        } else {
            if (builder.dow.type !== 'any') builder.dow.type = 'any'
        }
        syncing = false
    }
)
watch(
    () => builder.dow.type,
    (t) => {
        if (syncing) return
        syncing = true
        if (t === 'any') {
            if (builder.dom.type === 'any') builder.dom.type = 'every'
        } else {
            if (builder.dom.type !== 'any') builder.dom.type = 'any'
        }
        syncing = false
    }
)

const valueRange = (def: FieldDef): number[] => {
    const arr: number[] = []
    for (let i = def.min; i <= def.max; i++) arr.push(i)
    return arr
}

const formatTagLabel = (key: FieldKey, v: number): string => {
    if (key === 'dow') return `${v} (周${dowLabels[v]})`
    return String(v)
}

const toggleSpecific = (key: FieldKey, v: number) => {
    const list = builder[key].specific
    const idx = list.indexOf(v)
    if (idx >= 0) list.splice(idx, 1)
    else list.push(v)
}

const resetBuilder = () => {
    Object.assign(builder, defaultBuilder())
    ElMessage.info('已重置为默认（每日 0:00:00）')
}

// ============ 解析 cron 表达式 ============
interface ParsedField {
    values: number[]
    isAny: boolean
    isAll: boolean
}

const parseField = (spec: string, def: FieldDef): ParsedField | null => {
    if (!spec) return null
    spec = spec.trim()
    if (spec === '?') {
        if (!def.hasAny) return null
        return { values: valueRange(def), isAny: true, isAll: false }
    }
    if (spec === '*') {
        return { values: valueRange(def), isAny: false, isAll: true }
    }
    const set = new Set<number>()
    for (const part of spec.split(',')) {
        const m = part.match(/^([^/]+)(?:\/(\d+))?$/)
        if (!m) return null
        const base = m[1]
        const step = m[2] ? parseInt(m[2], 10) : 1
        if (step <= 0) return null
        let from: number, to: number
        if (base === '*') {
            from = def.min
            to = def.max
        } else if (base.includes('-')) {
            const [a, b] = base.split('-')
            from = parseInt(a, 10)
            to = parseInt(b, 10)
            if (isNaN(from) || isNaN(to)) return null
        } else {
            from = parseInt(base, 10)
            if (isNaN(from)) return null
            to = m[2] ? def.max : from
        }
        if (from < def.min || to > def.max || from > to) return null
        for (let v = from; v <= to; v += step) set.add(v)
    }
    return { values: [...set].sort((a, b) => a - b), isAny: false, isAll: false }
}

interface ParsedCron {
    fields: Record<FieldKey, ParsedField>
    tokens: string[]
}

const parseCron = (expr: string): ParsedCron | null => {
    if (!expr || !expr.trim()) return null
    const tokens = expr.trim().split(/\s+/)
    if (tokens.length < 6 || tokens.length > 7) return null
    if (tokens.length === 6) tokens.push('*')
    const fields: any = {}
    for (let i = 0; i < fieldDefs.length; i++) {
        const def = fieldDefs[i]
        const parsed = parseField(tokens[i], def)
        if (!parsed) return null
        fields[def.key] = parsed
    }
    // 校验日/周互斥
    const domSpec = tokens[3]
    const dowSpec = tokens[5]
    const domIsAny = domSpec === '?'
    const dowIsAny = dowSpec === '?'
    if (domIsAny === dowIsAny) {
        // 都是 ? 或都不是 ?，宽松处理：只要其中一个是 ? 即可
        if (!domIsAny && !dowIsAny) {
            // 严格 Quartz 不允许，这里我们仍尝试解析（按两者都生效处理）
        }
    }
    return { fields, tokens }
}

const parsedCron = computed<ParsedCron | null>(() => parseCron(cronExpr.value))
const valid = computed(() => parsedCron.value !== null)
const parsedTokens = computed(() => {
    const t = parsedCron.value?.tokens
    if (!t) {
        const raw = cronExpr.value.trim().split(/\s+/)
        return raw.concat(Array(7 - raw.length).fill(''))
    }
    return t
})

// ============ 计算下一次执行时间 ============
const pad = (n: number, w = 2) => String(n).padStart(w, '0')
const fmt = (d: Date) => {
    const jsDow = d.getDay()
    const qDow = jsDow === 0 ? 1 : jsDow + 1
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} 周${dowLabels[qDow]}`
}

const nextOrSame = (values: number[], cur: number): number | null => {
    for (const v of values) if (v >= cur) return v
    return null
}

const computeNext = (start: Date, parsed: ParsedCron): Date | null => {
    const f = parsed.fields
    const sec = f.second.values
    const min = f.minute.values
    const hr = f.hour.values
    const dom = f.dom.values
    const mon = f.month.values
    const dow = f.dow.values
    const yr = f.year.values

    const domIsAny = f.dom.isAny
    const dowIsAny = f.dow.isAny

    const date = new Date(start.getTime())
    date.setMilliseconds(0)

    const safety = 366 * 8 * 24 * 60 // 上限循环次数
    for (let i = 0; i < safety; i++) {
        const y = date.getFullYear()
        if (!yr.includes(y)) {
            const ny = nextOrSame(yr, y)
            if (ny === null) return null
            date.setFullYear(ny, 0, 1)
            date.setHours(0, 0, 0, 0)
            continue
        }
        const mo = date.getMonth() + 1
        if (!mon.includes(mo)) {
            const nm = nextOrSame(mon, mo)
            if (nm === null) {
                date.setFullYear(y + 1, 0, 1)
                date.setHours(0, 0, 0, 0)
            } else {
                date.setMonth(nm - 1, 1)
                date.setHours(0, 0, 0, 0)
            }
            continue
        }
        const day = date.getDate()
        const jsDow = date.getDay()
        const quartzDow = jsDow === 0 ? 1 : jsDow + 1 // Quartz: 1=SUN..7=SAT
        const domOk = domIsAny || dom.includes(day)
        const dowOk = dowIsAny || dow.includes(quartzDow)
        const dayOk = (domIsAny ? dowOk : dowIsAny ? domOk : domOk && dowOk)
        if (!dayOk) {
            // 移到下一天
            date.setDate(day + 1)
            date.setHours(0, 0, 0, 0)
            continue
        }
        const h = date.getHours()
        if (!hr.includes(h)) {
            const nh = nextOrSame(hr, h)
            if (nh === null) {
                date.setDate(day + 1)
                date.setHours(0, 0, 0, 0)
            } else {
                date.setHours(nh, 0, 0, 0)
            }
            continue
        }
        const m = date.getMinutes()
        if (!min.includes(m)) {
            const nm2 = nextOrSame(min, m)
            if (nm2 === null) {
                date.setHours(h + 1, 0, 0, 0)
            } else {
                date.setMinutes(nm2, 0, 0)
            }
            continue
        }
        const s = date.getSeconds()
        if (!sec.includes(s)) {
            const ns = nextOrSame(sec, s)
            if (ns === null) {
                date.setMinutes(m + 1, 0, 0)
            } else {
                date.setSeconds(ns, 0)
            }
            continue
        }
        return new Date(date.getTime())
    }
    return null
}

const nextExecTimes = computed<string[]>(() => {
    if (!parsedCron.value) return []
    const result: string[] = []
    let cursor = new Date()
    cursor.setMilliseconds(0)
    cursor = new Date(cursor.getTime() + 1000)
    for (let i = 0; i < previewCount.value; i++) {
        const next = computeNext(cursor, parsedCron.value)
        if (!next) break
        result.push(fmt(next))
        cursor = new Date(next.getTime() + 1000)
    }
    return result
})

// ============ 语义说明 ============
const describeField = (parsed: ParsedField, def: FieldDef): string => {
    if (parsed.isAny) return `不指定${def.label}`
    if (parsed.isAll) return `每${def.label}`
    if (parsed.values.length === 1) {
        const v = parsed.values[0]
        return def.key === 'dow' ? `周${dowLabels[v]}` : `第 ${v} ${def.label}`
    }
    if (parsed.values.length <= 5) {
        if (def.key === 'dow') {
            return parsed.values.map((v) => `周${dowLabels[v]}`).join('、')
        }
        return parsed.values.map((v) => `第 ${v} ${def.label}`).join('、')
    }
    return `${parsed.values.length} 个${def.label}值`
}

const description = computed(() => {
    if (!parsedCron.value) return '表达式不合法：应为 6-7 段，使用空格分隔'
    const f = parsedCron.value.fields
    const parts: string[] = []
    parts.push(`年: ${describeField(f.year, fieldDefs[6])}`)
    parts.push(`月: ${describeField(f.month, fieldDefs[4])}`)
    if (f.dom.isAny) {
        parts.push(`星期: ${describeField(f.dow, fieldDefs[5])}`)
    } else if (f.dow.isAny) {
        parts.push(`日: ${describeField(f.dom, fieldDefs[3])}`)
    } else {
        parts.push(`日: ${describeField(f.dom, fieldDefs[3])} 且 星期: ${describeField(f.dow, fieldDefs[5])}`)
    }
    parts.push(`时: ${describeField(f.hour, fieldDefs[2])}`)
    parts.push(`分: ${describeField(f.minute, fieldDefs[1])}`)
    parts.push(`秒: ${describeField(f.second, fieldDefs[0])}`)
    return parts.join(' / ')
})

// ============ 反向回填构造器 ============
const fieldToRule = (token: string, def: FieldDef): RuleState | null => {
    const tk = token.trim()
    const base: RuleState = {
        type: 'every',
        rangeFrom: def.min,
        rangeTo: def.max,
        stepStart: def.min,
        stepEvery: 1,
        specific: [],
    }
    if (tk === '*') return { ...base, type: 'every' }
    if (tk === '?' && def.hasAny) return { ...base, type: 'any' }
    // 范围
    let m = tk.match(/^(\d+)-(\d+)$/)
    if (m) {
        return { ...base, type: 'range', rangeFrom: parseInt(m[1], 10), rangeTo: parseInt(m[2], 10) }
    }
    // 步长
    m = tk.match(/^(\d+|\*)\/(\d+)$/)
    if (m) {
        const start = m[1] === '*' ? def.min : parseInt(m[1], 10)
        return { ...base, type: 'step', stepStart: start, stepEvery: parseInt(m[2], 10) }
    }
    // 列表 / 单值
    if (/^\d+(?:,\d+)*$/.test(tk)) {
        return { ...base, type: 'specific', specific: tk.split(',').map((s) => parseInt(s, 10)) }
    }
    return null
}

const parseToBuilder = () => {
    const parsed = parseCron(cronExpr.value)
    if (!parsed) {
        ElMessage.error('表达式不合法，无法回填到构造器')
        return
    }
    syncing = true
    for (let i = 0; i < fieldDefs.length; i++) {
        const def = fieldDefs[i]
        const rule = fieldToRule(parsed.tokens[i], def)
        if (rule) Object.assign(builder[def.key], rule)
    }
    syncing = false
    ElMessage.success('已回填至构造器')
}

// ============ 复制 ============
const copyCron = async () => {
    if (!cronExpr.value) {
        ElMessage.warning('当前没有可复制的表达式')
        return
    }
    await copyToClipboard(cronExpr.value)
    ElMessage.success('已复制 Cron 表达式')
}

// ============ 预设 ============
const presets = [
    { expr: '0 0 0 * * ?', desc: '每天 00:00:00' },
    { expr: '0 0 12 * * ?', desc: '每天中午 12:00' },
    { expr: '0 */5 * * * ?', desc: '每 5 分钟' },
    { expr: '0 0 */1 * * ?', desc: '每 1 小时' },
    { expr: '0 0 9-18 * * ?', desc: '工作时段每小时（9-18 时）' },
    { expr: '0 0 0 1 * ?', desc: '每月 1 号 00:00' },
    { expr: '0 0 10 ? * 2-6', desc: '工作日（周一至周五）10:00' },
    { expr: '0 0 10 ? * 1', desc: '每周日 10:00' },
    { expr: '0 30 8 * * ?', desc: '每天 08:30:00' },
    { expr: '0 0 0 1 1 ?', desc: '每年 1 月 1 日 00:00' },
    { expr: '*/30 * * * * ?', desc: '每 30 秒' },
]

const applyPreset = (expr: string) => {
    cronExpr.value = expr
    parseToBuilder()
}

// 用户手动编辑表达式时不强制回填构造器，仅由 parsedCron 计算结果

// 语法表
const syntaxRows = [
    { symbol: '*', meaning: '任意值', example: '* (秒) 表示每一秒' },
    { symbol: '?', meaning: '不指定（仅日/周）', example: '日为 ? 时使用 周；周为 ? 时使用 日' },
    { symbol: ',', meaning: '列表枚举', example: '1,3,5 表示第 1、3、5' },
    { symbol: '-', meaning: '区间范围', example: '9-17 表示 9 到 17（含）' },
    { symbol: '/', meaning: '步长间隔', example: '0/5 或 */5 表示从 0 起每 5' },
]

const fieldRangeRows = [
    { field: '秒 / 分', range: '0-59', symbols: ', - * /' },
    { field: '时', range: '0-23', symbols: ', - * /' },
    { field: '日', range: '1-31', symbols: ', - * / ?' },
    { field: '月', range: '1-12', symbols: ', - * /' },
    { field: '周', range: '1-7（1=日，7=六）', symbols: ', - * / ?' },
    { field: '年（可选）', range: '1970-2099', symbols: ', - * /' },
]
</script>

<style scoped lang="scss">
.cron-page {
    min-height: calc(100vh - 60px);
    background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-elevated) 100%);
    padding-bottom: 40px;

    // 页面头部
    .page-header {
        background: var(--brand-gradient);
        padding: 32px 0;
        margin-bottom: 32px;

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 20px;

            .title-icon {
                width: 64px;
                height: 64px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);

                .el-icon {
                    font-size: 32px;
                    color: var(--text-on-brand);
                }
            }

            .title-text {
                h1 {
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: 600;
                    color: var(--text-on-brand);
                }

                p {
                    margin: 0;
                    font-size: 15px;
                    color: rgba(255, 255, 255, 0.85);
                }
            }
        }
    }
}

.cron-container {
    padding: 0 24px;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .el-row {
        margin-bottom: 0 !important;
    }
}

.card-section {
    background: var(--bg-container);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    height: 100%;
    display: flex;
    flex-direction: column;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-light);

    .section-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .title-icon {
            &.small {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;

                &.input {
                    background: var(--brand-gradient);
                    color: var(--text-on-brand);
                }

                &.output {
                    background: var(--data-grad-3);
                    color: var(--text-on-brand);
                }

                &.preset {
                    background: var(--data-grad-2, var(--brand-gradient));
                    color: var(--text-on-brand);
                }

                &.syntax {
                    background: var(--data-grad-1, var(--brand-gradient));
                    color: var(--text-on-brand);
                }

                .el-icon {
                    font-size: 18px;
                }
            }
        }

        h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 18px;
            font-weight: 600;
        }
    }

    .header-actions {
        display: flex;
        gap: 8px;

        .action-btn {
            width: 36px;
            height: 36px;
            transition: all 0.3s ease;

            &:hover {
                transform: scale(1.1);
            }

            &.format {
                background: var(--bg-overlay);
                color: var(--brand-primary);
            }

            &.delete {
                background: var(--danger-bg);
                color: var(--danger);
            }

            &.copy {
                background: var(--success-bg);
                color: var(--success);
            }
        }
    }
}

// 构造器
.cron-tabs {
    flex: 1;

    :deep(.el-tabs__nav-wrap) {
        padding-left: 4px;
    }

    :deep(.el-tabs__item) {
        height: 56px;
        line-height: 1.2;
        padding: 0 18px !important;

        .tab-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;

            .tab-expr {
                font-size: 12px;
                color: var(--text-secondary);
                font-family: 'Consolas', 'Monaco', monospace;
                background: var(--bg-overlay);
                padding: 1px 6px;
                border-radius: 4px;
                max-width: 110px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        &.is-active .tab-expr {
            color: var(--brand-primary);
            background: var(--bg-container);
        }
    }
}

.rule-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 4px 4px;

    .rule-radio {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 18px;

        :deep(.el-radio) {
            margin-right: 0;
        }
    }

    .rule-detail {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        padding: 16px;
        background: var(--bg-overlay);
        border-radius: 10px;
        border: 1px solid var(--border-light);

        .rule-text {
            color: var(--text-regular);
            font-size: 14px;
        }

        &.specific {
            display: block;
        }

        .specific-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            :deep(.el-check-tag) {
                cursor: pointer;
                padding: 6px 12px;
                font-size: 13px;
                border-radius: 8px;
                transition: all 0.2s ease;
            }
        }
    }

    .rule-tip {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-secondary);
        padding: 10px 14px;
        background: var(--info-bg, var(--bg-overlay));
        border-radius: 8px;
        border-left: 3px solid var(--info, var(--brand-primary));

        .el-icon {
            color: var(--info, var(--brand-primary));
        }
    }
}

// 结果区
.cron-input {
    margin-bottom: 16px;

    :deep(.el-input__inner),
    :deep(.el-input__wrapper) {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 1px;
    }

    :deep(.el-input-group__prepend) {
        background: var(--brand-gradient);
        color: var(--text-on-brand);
        font-weight: 600;
        border: none;
    }
}

.cron-fields {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    margin-bottom: 16px;

    .field-chip {
        background: var(--bg-overlay);
        border: 1px solid var(--border-light);
        border-radius: 10px;
        padding: 8px 6px;
        text-align: center;
        transition: all 0.2s ease;

        &.active {
            border-color: var(--brand-primary);
        }

        .chip-label {
            display: block;
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }

        .chip-value {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--brand-primary);
            font-family: 'Consolas', 'Monaco', monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

.description-block,
.next-times {
    background: var(--bg-overlay);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 16px;

    .block-label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);

        .el-icon {
            color: var(--brand-primary);
        }

        .count-input {
            margin-left: auto;
        }
    }

    .block-content {
        font-size: 14px;
        line-height: 1.7;
        color: var(--text-regular);

        &.error {
            color: var(--danger);
        }
    }
}

.next-times {
    flex: 1;
    margin-bottom: 0;

    .times-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 280px;
        overflow-y: auto;

        .time-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            background: var(--bg-container);
            border: 1px solid var(--border-light);
            border-radius: 8px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;

            .time-no {
                width: 22px;
                height: 22px;
                line-height: 22px;
                text-align: center;
                background: var(--brand-gradient);
                color: var(--text-on-brand);
                border-radius: 50%;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }

            .time-value {
                color: var(--text-regular);
            }
        }
    }

    .times-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 20px;
        color: var(--text-secondary);
        font-size: 13px;

        .el-icon {
            color: var(--warning);
        }
    }
}

// 预设
.preset-section {
    .preset-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;

        .preset-card {
            padding: 14px 16px;
            background: var(--bg-overlay);
            border: 1px solid var(--border-light);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.25s ease;

            &:hover {
                transform: translateY(-2px);
                border-color: var(--brand-primary);
                box-shadow: var(--shadow-glow-strong, var(--shadow-sm));
            }

            .preset-expr {
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 14px;
                font-weight: 600;
                color: var(--brand-primary);
                margin-bottom: 6px;
            }

            .preset-desc {
                font-size: 13px;
                color: var(--text-secondary);
                line-height: 1.5;
            }
        }
    }
}

// 语法表
.syntax-section {
    .syntax-table {
        margin-bottom: 16px;
        background: transparent;

        &:last-child {
            margin-bottom: 0;
        }

        :deep(.el-table__inner-wrapper) {
            border-radius: 10px;
            overflow: hidden;
        }
    }
}

// 响应式
@media (max-width: 992px) {
    .cron-fields {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (max-width: 768px) {
    .cron-page {
        padding-bottom: 24px;

        .page-header {
            padding: 24px 0;
            margin-bottom: 24px;

            .header-content {
                padding: 0 16px;
            }

            .header-title {
                flex-direction: column;
                text-align: center;

                .title-text h1 {
                    font-size: 22px;
                }
            }
        }
    }

    .cron-container {
        padding: 0 16px;
    }

    .card-section {
        padding: 16px;
    }

    .cron-fields {
        grid-template-columns: repeat(3, 1fr);
    }

    .preset-grid {
        grid-template-columns: 1fr 1fr !important;
    }
}
</style>
