<template>
    <div class="register-container">
        <!-- 印刷车间式背景:网格 + 对位标记 -->
        <div class="press-bg" aria-hidden="true">
            <div class="grid-lines"></div>
            <div class="reg-mark reg-tl"></div>
            <div class="reg-mark reg-tr"></div>
            <div class="reg-mark reg-bl"></div>
            <div class="reg-mark reg-br"></div>
            <span class="bg-meta bg-meta-tl">N°&nbsp;01&nbsp;·&nbsp;REGISTER</span>
            <span class="bg-meta bg-meta-br">SHEET&nbsp;01/02</span>
        </div>

        <article class="register-card">
            <!-- 顶部工具栏 -->
            <header class="card-bar">
                <button class="home-btn" @click="toHome" aria-label="返回首页">
                    <el-icon><House /></el-icon>
                </button>
                <div class="brand-mark">
                    <LogoIcon :size="20" />
                    <span class="brand-name">JOKER&nbsp;BOX</span>
                </div>
                <div class="issue-stamp">
                    <span class="issue-label">EST</span>
                    <span class="issue-divider">·</span>
                    <span class="issue-num">MMXXVI</span>
                </div>
            </header>

            <hr class="bar-rule" />

            <!-- 主标题区 -->
            <section class="title-block">
                <p class="eyebrow">注册 / Register</p>
                <h1 class="title-zh">创建账号</h1>
                <p class="title-en">Begin your journey with a new identity.</p>
            </section>

            <form class="form" @submit.prevent="register" novalidate>
                <!-- 分组 01 —— 账号凭证 -->
                <section class="form-section">
                    <div class="section-head">
                        <span class="section-num">01</span>
                        <span class="section-name">账号凭证</span>
                        <span class="section-rule"></span>
                        <span class="section-meta">Credentials</span>
                    </div>

                    <div class="fields-grid">
                        <!-- 用户名 -->
                        <div class="field">
                            <div class="field-head">
                                <span class="field-num">01</span>
                                <label class="field-label" :class="{ 'is-focus': focused.username, 'is-error': !!errors.username }">用户名</label>
                            </div>
                            <el-input
                                v-model="ruleForm.username"
                                placeholder="4–18 位英文字符或数字"
                                autocomplete="new-password"
                                class="line-input"
                                :class="{ 'is-error': !!errors.username }"
                                @focus="focused.username = true"
                                @blur="onBlur('username')" />
                            <span class="field-error">{{ errors.username }}</span>
                        </div>

                        <!-- 昵称 -->
                        <div class="field">
                            <div class="field-head">
                                <span class="field-num">02</span>
                                <label class="field-label" :class="{ 'is-focus': focused.nickname, 'is-error': !!errors.nickname }">昵称</label>
                            </div>
                            <el-input
                                v-model="ruleForm.nickname"
                                placeholder="对外显示的名字"
                                autocomplete="new-password"
                                class="line-input"
                                :class="{ 'is-error': !!errors.nickname }"
                                @focus="focused.nickname = true"
                                @blur="onBlur('nickname')" />
                            <span class="field-error">{{ errors.nickname }}</span>
                        </div>

                        <!-- 密码 -->
                        <div class="field">
                            <div class="field-head">
                                <span class="field-num">03</span>
                                <label class="field-label" :class="{ 'is-focus': focused.password, 'is-error': !!errors.password }">密码</label>
                            </div>
                            <el-input
                                v-model="ruleForm.password"
                                type="password"
                                placeholder="至少 6 位"
                                autocomplete="new-password"
                                show-password
                                class="line-input"
                                :class="{ 'is-error': !!errors.password }"
                                @focus="focused.password = true"
                                @blur="onBlur('password')" />
                            <span class="field-error">{{ errors.password }}</span>
                        </div>

                        <!-- 确认密码 -->
                        <div class="field">
                            <div class="field-head">
                                <span class="field-num">04</span>
                                <label class="field-label" :class="{ 'is-focus': focused.passwordAgain, 'is-error': !!errors.passwordAgain }">确认密码</label>
                            </div>
                            <el-input
                                v-model="ruleForm.passwordAgain"
                                type="password"
                                placeholder="再次输入"
                                autocomplete="new-password"
                                show-password
                                class="line-input"
                                :class="{ 'is-error': !!errors.passwordAgain }"
                                @focus="focused.passwordAgain = true"
                                @blur="onBlur('passwordAgain')" />
                            <span class="field-error">{{ errors.passwordAgain }}</span>
                        </div>
                    </div>
                </section>

                <!-- 分组 02 —— 联系方式 -->
                <section class="form-section">
                    <div class="section-head">
                        <span class="section-num">02</span>
                        <span class="section-name">联系方式</span>
                        <span class="section-rule"></span>
                        <span class="section-meta">Contact</span>
                    </div>

                    <div class="fields-grid">
                        <!-- 邮箱 -->
                        <div class="field field-full">
                            <div class="field-head">
                                <span class="field-num">05</span>
                                <label class="field-label" :class="{ 'is-focus': focused.mail, 'is-error': !!errors.mail }">邮箱</label>
                            </div>
                            <el-input
                                v-model="ruleForm.mail"
                                type="email"
                                placeholder="you@example.com"
                                autocomplete="new-password"
                                class="line-input"
                                :class="{ 'is-error': !!errors.mail }"
                                @focus="focused.mail = true"
                                @blur="onBlur('mail')" />
                            <span class="field-error">{{ errors.mail }}</span>
                        </div>

                        <!-- 验证码 -->
                        <div class="field field-full">
                            <div class="field-head">
                                <span class="field-num">06</span>
                                <label class="field-label" :class="{ 'is-focus': focused.code, 'is-error': !!errors.code }">验证码</label>
                            </div>
                            <div class="code-row">
                                <el-input
                                    v-model="ruleForm.code"
                                    placeholder="6 位邮箱验证码"
                                    autocomplete="new-password"
                                    maxlength="6"
                                    class="line-input"
                                    :class="{ 'is-error': !!errors.code }"
                                    @focus="focused.code = true"
                                    @blur="onBlur('code')" />
                                <button
                                    type="button"
                                    class="code-btn"
                                    :disabled="sendButtonText !== '发送' || isSendingCode"
                                    @click="sndCode">
                                    <el-icon v-if="!isSendingCode"><Promotion /></el-icon>
                                    <span>{{ sendButtonText === '发送' ? '获取验证码' : sendButtonText + 's' }}</span>
                                </button>
                            </div>
                            <span class="field-error">{{ errors.code }}</span>
                        </div>
                    </div>
                </section>

                <!-- 协议 + 提交 -->
                <div class="form-foot">
                    <label class="agreement">
                        <input type="checkbox" v-model="agreedToTerms" class="agreement-box" />
                        <span class="agreement-mark"></span>
                        <span class="agreement-text">
                            我已阅读并同意
                            <a href="#" class="agreement-link">服务条款</a>
                            <span class="dot">·</span>
                            <a href="#" class="agreement-link">隐私政策</a>
                        </span>
                    </label>

                    <button
                        type="submit"
                        class="submit-btn"
                        :disabled="!agreedToTerms || isRegistering">
                        <span class="submit-label">{{ isRegistering ? '注册中…' : '立即注册' }}</span>
                        <span class="submit-arrow">
                            <el-icon><Right /></el-icon>
                        </span>
                    </button>
                </div>
            </form>

            <!-- 底部登录链接 -->
            <footer class="card-foot">
                <span class="foot-line"></span>
                <span class="foot-text">
                    已有账号？
                    <router-link to="/login" class="foot-link">立即登录 →</router-link>
                </span>
                <span class="foot-line"></span>
            </footer>
        </article>
    </div>
</template>

<script setup lang='ts'>
import { http, setToken, toPath, saveUserInfo, alert } from '@/utils';
import { onMounted, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { House, Promotion, Right } from '@element-plus/icons-vue';
import LogoIcon from '@/components/icon/LogoIcon.vue';

const route = useRoute()
const path = ref('/')

interface RuleForm {
    username: string
    password: string
    passwordAgain: string
    nickname: string
    mail: string
    code: string
    inviteCode: string
    sex: string
    phone: number
}

type FieldKey = 'username' | 'nickname' | 'password' | 'passwordAgain' | 'mail' | 'code'

const ruleForm = reactive<RuleForm>({
    username: '',
    password: '',
    passwordAgain: '',
    nickname: '',
    mail: '',
    code: '',
    inviteCode: '',
    sex: '未知',
    phone: 0
})

const errors = reactive<Record<FieldKey, string>>({
    username: '', nickname: '', password: '', passwordAgain: '', mail: '', code: ''
})

const focused = reactive<Record<FieldKey, boolean>>({
    username: false, nickname: false, password: false, passwordAgain: false, mail: false, code: false
})

const agreedToTerms = ref(false)
const isRegistering = ref(false)
const isSendingCode = ref(false)
const sendButtonText = ref('发送')

const validateField = (key: FieldKey): boolean => {
    const v = (ruleForm as any)[key] as string
    switch (key) {
        case 'username':
            if (!v) { errors.username = '请填写用户名'; return false }
            if (v.length < 4 || v.length > 18) { errors.username = '长度需在 4–18 位'; return false }
            errors.username = ''; return true
        case 'nickname':
            if (!v) { errors.nickname = '请填写昵称'; return false }
            errors.nickname = ''; return true
        case 'password':
            if (!v) { errors.password = '请输入密码'; return false }
            if (v.length < 6) { errors.password = '密码至少 6 位'; return false }
            errors.password = ''; return true
        case 'passwordAgain':
            if (!v) { errors.passwordAgain = '请确认密码'; return false }
            if (v !== ruleForm.password) { errors.passwordAgain = '两次密码不一致'; return false }
            errors.passwordAgain = ''; return true
        case 'mail':
            if (!v) { errors.mail = '请输入邮箱'; return false }
            if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(v)) { errors.mail = '邮箱格式不正确'; return false }
            errors.mail = ''; return true
        case 'code':
            if (!v) { errors.code = '请输入验证码'; return false }
            if (v.length !== 6) { errors.code = '验证码为 6 位'; return false }
            errors.code = ''; return true
    }
}

const onBlur = (key: FieldKey) => {
    focused[key] = false
    validateField(key)
}

const validateAll = (): boolean => {
    const keys: FieldKey[] = ['username', 'nickname', 'password', 'passwordAgain', 'mail', 'code']
    return keys.map(validateField).every(Boolean)
}

onMounted(() => {
    path.value = route.query.redirect?.toString() || '/'
})

const sndCode = async () => {
    if (!validateField('mail')) {
        alert('请填写正确的邮箱', 'warning'); return
    }
    isSendingCode.value = true
    try {
        await http.post('/auth/mailCode', undefined, { params: { mail: ruleForm.mail } })
        alert('验证码已发送', 'success')
        startCountdown()
    } finally {
        isSendingCode.value = false
    }
}

const startCountdown = () => {
    let countdown = 60
    sendButtonText.value = countdown.toString()
    const timerId = setInterval(() => {
        countdown--
        sendButtonText.value = countdown.toString()
        if (countdown <= 0) {
            sendButtonText.value = '发送'
            clearInterval(timerId)
        }
    }, 1000)
}

const register = async () => {
    if (!agreedToTerms.value) { alert('请先同意服务条款', 'warning'); return }
    if (!validateAll()) { alert('请按要求填写表单', 'warning'); return }
    isRegistering.value = true
    try {
        const token = await http.post('/auth/register', ruleForm)
        setToken(token)
        await login()
    } finally {
        isRegistering.value = false
    }
}

const login = async () => {
    const token = await http.post('/auth/getToken', {
        username: ruleForm.username,
        password: ruleForm.password
    })
    setToken(token)
    await getUserInfo()
}

async function getUserInfo() {
    const data = await http.post('/auth/userInfo')
    saveUserInfo(data)
    toPath(path.value)
}

const toHome = () => { toPath('/') }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,700;9..144,900&family=JetBrains+Mono:wght@400;500;600&family=Noto+Serif+SC:wght@500;700;900&display=swap');

/* ============================================================
   容器与背景 —— 印刷车间网格
   ============================================================ */
.register-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--auth-bg);
    position: relative;
    overflow: hidden;
    padding: 16px 24px;
}

.press-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

.grid-lines {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(to right, var(--border-base) 1px, transparent 1px),
        linear-gradient(to bottom, var(--border-base) 1px, transparent 1px);
    background-size: 80px 80px;
    background-position: -1px -1px;
    opacity: 0.18;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 90%);
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 90%);
}

.reg-mark {
    position: absolute;
    width: 28px; height: 28px;
    opacity: 0.35;
    border: 1px solid var(--brand-primary);
    border-radius: 50%;
}
.reg-mark::before,
.reg-mark::after {
    content: '';
    position: absolute;
    background: var(--brand-primary);
}
.reg-mark::before {
    left: 50%; top: 0;
    width: 1px; height: 100%;
    transform: translateX(-0.5px);
}
.reg-mark::after {
    top: 50%; left: 0;
    height: 1px; width: 100%;
    transform: translateY(-0.5px);
}
.reg-tl { top: 40px; left: 40px; }
.reg-tr { top: 40px; right: 40px; }
.reg-bl { bottom: 40px; left: 40px; }
.reg-br { bottom: 40px; right: 40px; }

.bg-meta {
    position: absolute;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.3em;
    color: var(--text-secondary);
    opacity: 0.5;
    text-transform: uppercase;
}
.bg-meta-tl { top: 44px; left: 80px; }
.bg-meta-br {
    bottom: 44px; right: 80px;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    letter-spacing: 0.4em;
}

/* ============================================================
   主卡片 —— 单栏编辑部布局
   ============================================================ */
.register-card {
    width: 100%;
    max-width: 760px;
    position: relative;
    background: var(--bg-container);
    border: 1px solid var(--border-base);
    border-radius: 4px;
    padding: 20px 56px 26px;
    box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.04) inset,
        0 30px 60px -20px rgba(0, 0, 0, 0.55),
        0 0 0 1px rgba(255, 255, 255, 0.02);
    animation: card-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    scrollbar-width: thin;
}

.register-card::-webkit-scrollbar { width: 6px; }
.register-card::-webkit-scrollbar-track { background: transparent; }
.register-card::-webkit-scrollbar-thumb {
    background: var(--border-base);
    border-radius: 3px;
}

@keyframes card-rise {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
}

/* 卡片左上、右上的小装饰角 —— 杂志切角感 */
.register-card::before,
.register-card::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    border: 1px solid var(--brand-primary);
    opacity: 0.5;
}
.register-card::before {
    top: 8px; left: 8px;
    border-right: none; border-bottom: none;
}
.register-card::after {
    bottom: 8px; right: 8px;
    border-left: none; border-top: none;
}

/* ============================================================
   顶部工具栏
   ============================================================ */
.card-bar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 16px;
    padding-bottom: 14px;
}

.home-btn {
    width: 36px; height: 36px;
    border: 1px solid var(--border-base);
    background: transparent;
    color: var(--text-secondary);
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s var(--ease-out, ease-out);
}
.home-btn:hover {
    color: var(--brand-primary);
    border-color: var(--brand-primary);
    transform: translateX(-2px);
}

.brand-mark {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    justify-self: center;
}
.brand-name {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px;
    letter-spacing: 0.32em;
    color: var(--text-primary);
    font-weight: 600;
}

.issue-stamp {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--text-secondary);
    letter-spacing: 0.18em;
    padding: 4px 10px;
    border: 1px solid var(--border-base);
    border-radius: 2px;
}
.issue-label { font-weight: 600; color: var(--brand-primary); }
.issue-divider { opacity: 0.4; }

.bar-rule {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-base) 12%, var(--border-base) 88%, transparent);
    margin: 0 0 20px;
}

/* ============================================================
   标题区
   ============================================================ */
.title-block {
    text-align: left;
    margin-bottom: 22px;
    animation: fade-up 0.7s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.eyebrow {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--brand-primary);
    text-transform: uppercase;
    margin: 0 0 8px;
    font-weight: 500;
}

.title-zh {
    font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
    font-weight: 900;
    font-size: 44px;
    line-height: 1.05;
    letter-spacing: 5px;
    color: var(--text-primary);
    margin: 0 0 8px;
}

.title-en {
    font-family: 'Fraunces', 'Cormorant Garamond', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 15px;
    color: var(--text-secondary);
    margin: 0;
    letter-spacing: 0.02em;
}

@keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ============================================================
   表单
   ============================================================ */
.form {
    display: flex;
    flex-direction: column;
    gap: 22px;
    animation: fade-up 0.7s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.form-section { display: flex; flex-direction: column; gap: 12px; }

/* —— 分组小标题 —— */
.section-head {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: 12px;
}

.section-num {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-weight: 500;
    font-size: 22px;
    color: var(--brand-primary);
    line-height: 1;
}

.section-name {
    font-family: 'Noto Serif SC', serif;
    font-weight: 700;
    font-size: 14px;
    color: var(--text-primary);
    letter-spacing: 3px;
}

.section-rule {
    height: 1px;
    background: var(--border-base);
    align-self: center;
}

.section-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--text-secondary);
    text-transform: uppercase;
    opacity: 0.7;
}

/* —— 字段网格 —— */
.fields-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 32px;
    row-gap: 2px;
}

.field {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding-bottom: 2px;
}

.field-full { grid-column: 1 / -1; }

.field-head {
    display: inline-flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 4px;
}

.field-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-secondary);
    letter-spacing: 0.1em;
    font-weight: 500;
    min-width: 22px;
}

.field-label {
    font-family: 'Noto Serif SC', serif;
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
    letter-spacing: 2px;
    transition: color 0.2s var(--ease-out, ease-out);
}
.field-label.is-focus { color: var(--brand-primary); }
.field-label.is-error { color: var(--danger); }

/* ---------- 下划线式输入框 ---------- */
.line-input :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    border-bottom: 1px solid var(--border-base);
    border-radius: 0;
    padding: 4px 0;
    transition: border-color 0.25s var(--ease-out, ease-out);
    position: relative;
}

.line-input :deep(.el-input__wrapper)::after {
    content: '';
    position: absolute;
    left: 0; right: 100%;
    bottom: -1px;
    height: 1.5px;
    background: var(--brand-primary);
    transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.line-input :deep(.el-input__wrapper.is-focus)::after {
    right: 0;
}

.line-input :deep(.el-input__wrapper:hover) {
    border-bottom-color: var(--text-secondary);
}

.line-input :deep(.el-input__inner) {
    height: 38px;
    line-height: 38px;
    font-size: 15px;
    font-family: 'Fraunces', 'Noto Serif SC', serif;
    color: var(--text-primary);
    background: transparent;
    padding: 0;
    letter-spacing: 0.02em;
}

.line-input :deep(.el-input__inner::placeholder) {
    color: var(--text-disabled, var(--text-secondary));
    opacity: 0.55;
    font-style: italic;
    font-size: 13px;
    letter-spacing: 0.02em;
}

.line-input.is-error :deep(.el-input__wrapper) {
    border-bottom-color: var(--danger);
}

.line-input :deep(.el-input__suffix) {
    color: var(--text-secondary);
}

/* —— 错误信息 —— */
.field-error {
    display: block;
    min-height: 14px;
    margin-top: 3px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    color: var(--danger);
    line-height: 1.3;
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.field-error::before {
    content: attr(data-empty);
}
.field-error:not(:empty)::before {
    content: '— ';
    opacity: 0.6;
}

/* —— 验证码行 —— */
.code-row {
    display: flex;
    gap: 14px;
    align-items: flex-end;
}

.code-row .line-input { flex: 1; min-width: 0; }

.code-btn {
    flex-shrink: 0;
    height: 38px;
    padding: 0 16px;
    border: 1px solid var(--brand-primary);
    background: transparent;
    color: var(--brand-primary);
    border-radius: 2px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.25s var(--ease-out, ease-out);
}
.code-btn:not(:disabled):hover {
    background: var(--brand-primary);
    color: var(--text-on-brand, #fff);
    transform: translateY(-1px);
}
.code-btn:disabled {
    border-color: var(--border-base);
    color: var(--text-disabled, var(--text-secondary));
    cursor: not-allowed;
    opacity: 0.7;
}

/* ============================================================
   底部:协议 + 提交
   ============================================================ */
.form-foot {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 4px;
}

/* —— 自定义复选框 —— */
.agreement {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-family: 'Noto Serif SC', serif;
    user-select: none;
}

.agreement-box {
    position: absolute;
    opacity: 0;
    width: 0; height: 0;
}

.agreement-mark {
    width: 16px; height: 16px;
    border: 1px solid var(--border-base);
    border-radius: 2px;
    background: transparent;
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s var(--ease-out, ease-out);
}
.agreement-mark::after {
    content: '';
    position: absolute;
    inset: 3px;
    background: var(--brand-primary);
    border-radius: 1px;
    opacity: 0;
    transform: scale(0.4);
    transition: all 0.2s var(--ease-out, ease-out);
}
.agreement-box:checked ~ .agreement-mark {
    border-color: var(--brand-primary);
}
.agreement-box:checked ~ .agreement-mark::after {
    opacity: 1;
    transform: scale(1);
}

.agreement-text {
    font-size: 13px;
    color: var(--text-secondary);
    letter-spacing: 1px;
}
.agreement-link {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px solid var(--brand-primary);
    padding-bottom: 1px;
    transition: color 0.2s ease;
}
.agreement-link:hover { color: var(--brand-primary); }
.dot { margin: 0 4px; opacity: 0.5; }

/* —— 提交按钮 —— */
.submit-btn {
    --bg: var(--text-primary);
    --fg: var(--bg-container);
    width: 100%;
    height: 50px;
    border: none;
    background: var(--bg);
    color: var(--fg);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    font-family: 'Noto Serif SC', serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 6px;
    border-radius: 2px;
    transition: all 0.3s var(--ease-out, ease-out);
}

.submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--brand-gradient);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
}

.submit-btn > * { position: relative; z-index: 1; }

.submit-btn:not(:disabled):hover {
    color: var(--text-on-brand, #fff);
    transform: translateY(-2px);
    box-shadow: 0 18px 40px -16px var(--brand-primary);
}
.submit-btn:not(:disabled):hover::before { opacity: 1; }

.submit-btn:disabled {
    background: var(--bg-input);
    color: var(--text-disabled, var(--text-secondary));
    cursor: not-allowed;
}

.submit-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transition: transform 0.3s var(--ease-out, ease-out);
    font-size: 13px;
}
.submit-btn:not(:disabled):hover .submit-arrow {
    transform: translateX(4px);
    background: rgba(255, 255, 255, 0.2);
}

/* ============================================================
   底部脚注
   ============================================================ */
.card-foot {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    margin-top: 20px;
}

.foot-line {
    height: 1px;
    background: var(--border-base);
}

.foot-text {
    font-family: 'Noto Serif SC', serif;
    font-size: 13px;
    color: var(--text-secondary);
    letter-spacing: 1px;
}

.foot-link {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 600;
    margin-left: 8px;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
}
.foot-link:hover {
    color: var(--brand-primary);
    border-bottom-color: var(--brand-primary);
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 760px) {
    .register-container { height: auto; min-height: 100vh; padding: 24px 16px; overflow-y: auto; }
    .register-card { padding: 22px 28px 28px; max-height: none; overflow: visible; }
    .title-zh { font-size: 36px; letter-spacing: 4px; }
    .fields-grid {
        grid-template-columns: 1fr;
        column-gap: 0;
        row-gap: 2px;
    }
    .card-bar { gap: 10px; }
    .issue-stamp { padding: 3px 8px; font-size: 10px; }
    .reg-mark { display: none; }
    .bg-meta { display: none; }
}

@media (max-width: 480px) {
    .register-container { padding: 0; height: auto; }
    .register-card {
        border-radius: 0;
        border-left: none;
        border-right: none;
        padding: 20px 18px 28px;
        min-height: 100vh;
    }
    .title-zh { font-size: 32px; letter-spacing: 3px; }
    .code-row { flex-direction: column; align-items: stretch; gap: 10px; }
    .code-btn { height: 40px; }
    .submit-btn { letter-spacing: 4px; padding: 0 18px; }
    .brand-name { letter-spacing: 0.2em; }
    .card-foot { grid-template-columns: 1fr; }
    .foot-line { display: none; }
}
</style>
