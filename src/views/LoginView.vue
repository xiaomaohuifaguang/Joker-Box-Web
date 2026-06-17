<template>
    <div class="login-container">
        <!-- 印刷车间式背景:网格 + 对位标记 -->
        <div class="press-bg" aria-hidden="true">
            <div class="grid-lines"></div>
            <div class="reg-mark reg-tl"></div>
            <div class="reg-mark reg-tr"></div>
            <div class="reg-mark reg-bl"></div>
            <div class="reg-mark reg-br"></div>
            <span class="bg-meta bg-meta-tl">N°&nbsp;02&nbsp;·&nbsp;SIGN&nbsp;IN</span>
            <span class="bg-meta bg-meta-br">SHEET&nbsp;02/02</span>
        </div>

        <article class="login-card">
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
                    <span class="issue-label">VOL</span>
                    <span class="issue-divider">·</span>
                    <span class="issue-num">{{ visitNumber }}</span>
                </div>
            </header>

            <hr class="bar-rule" />

            <!-- 主标题 + 引言 -->
            <section class="title-block">
                <p class="eyebrow">登录 / Sign In</p>
                <h1 class="title-zh">欢迎<span class="title-mark">回来</span></h1>

                <figure class="quote-block">
                    <span class="quote-mark">&ldquo;</span>
                    <blockquote class="quote-text">救赎之道，就在其中。</blockquote>
                    <figcaption class="quote-en">Salvation lies within.</figcaption>
                </figure>
            </section>

            <form class="form" @submit.prevent="login" novalidate>
                <!-- 字段区 -->
                <div class="fields">
                    <!-- 账号 -->
                    <div class="field">
                        <div class="field-head">
                            <span class="field-num">01</span>
                            <label class="field-label" :class="{ 'is-focus': focused.username }">账号</label>
                            <span class="field-meta">USERNAME</span>
                        </div>
                        <el-input
                            v-model="loginInfo.username"
                            placeholder="请输入账号"
                            autocomplete="new-password"
                            class="line-input"
                            @focus="focused.username = true"
                            @blur="focused.username = false"
                            @keyup.enter="login" />
                    </div>

                    <!-- 密码 -->
                    <div class="field">
                        <div class="field-head">
                            <span class="field-num">02</span>
                            <label class="field-label" :class="{ 'is-focus': focused.password }">密码</label>
                            <span class="field-meta">PASSWORD</span>
                            <a href="#" class="forgot-link">忘记密码？</a>
                        </div>
                        <el-input
                            v-model="loginInfo.password"
                            type="password"
                            placeholder="请输入密码"
                            autocomplete="new-password"
                            show-password
                            class="line-input"
                            @focus="focused.password = true"
                            @blur="focused.password = false"
                            @keyup.enter="login" />
                    </div>
                </div>

                <!-- 记住我 -->
                <label class="remember">
                    <input type="checkbox" v-model="rememberMe" class="remember-box" />
                    <span class="remember-mark"></span>
                    <span class="remember-text">在此设备上保持登录</span>
                </label>

                <!-- 主提交按钮 -->
                <button
                    type="submit"
                    class="submit-btn"
                    :disabled="isLoading">
                    <span class="submit-label">{{ isLoading ? '登录中…' : '登 录' }}</span>
                    <span class="submit-arrow">
                        <el-icon><Right /></el-icon>
                    </span>
                </button>
            </form>

            <!-- 分隔线 + SSO -->
            <section class="sso-section">
                <div class="sso-divider">
                    <span class="sso-line"></span>
                    <span class="sso-text">OR · CONTINUE WITH</span>
                    <span class="sso-line"></span>
                </div>

                <div class="sso-grid">
                    <button class="sso-btn" @click="ssoPath('github')">
                        <svg class="sso-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        <span class="sso-name">GitHub</span>
                        <span class="sso-arrow">→</span>
                    </button>

                    <button class="sso-btn" @click="ssoPath('gitee')">
                        <svg class="sso-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.984 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 01-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.593.593.592h5.63c.982 0 1.778-.796 1.778-1.777v-.297a.593.593 0 00-.592-.593h-4.15a.592.592 0 01-.592-.592v-1.482a.593.593 0 01.593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 01-4 4H5.926a.593.593 0 01-.593-.593V9.778a4.444 4.444 0 014.445-4.444h8.296z"/>
                        </svg>
                        <span class="sso-name">Gitee</span>
                        <span class="sso-arrow">→</span>
                    </button>
                </div>
            </section>

            <!-- 底部:注册引导 -->
            <footer class="card-foot">
                <span class="foot-line"></span>
                <span class="foot-text">
                    第一次来？
                    <router-link to="/register" class="foot-link">创建一个账号 →</router-link>
                </span>
                <span class="foot-line"></span>
            </footer>
        </article>
    </div>
</template>

<script setup lang='ts'>
import { http, setToken, toPath, saveUserInfo, alert, CONSTANTS } from '@/utils';
import { House, Right } from '@element-plus/icons-vue';
import { onMounted, reactive, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import LogoIcon from '@/components/icon/LogoIcon.vue';

const route = useRoute();
const path = ref('/');
const loginInfo = ref({ username: 'admin', password: '12345678' });
const ssoInfo = ref({ clientName: '', id: '' });
const rememberMe = ref(false);
const isLoading = ref(false);

const focused = reactive({ username: false, password: false });

// 装饰性"期数" — 给页面一点会员卡的细节
const visitNumber = computed(() => {
    const seed = (loginInfo.value.username || 'guest').length * 137 + 2026;
    return '#' + String(seed).padStart(4, '0').slice(-4);
});

onMounted(() => {
    loginVerify();
    path.value = route.query.redirect?.toString() || '/';
    if (route.query.clientName && route.query.id) {
        ssoInfo.value.clientName = route.query.clientName.toString();
        ssoInfo.value.id = route.query.id.toString();
        loginSSO();
    }
});

const loginVerify = () => {
    const token = localStorage.getItem(CONSTANTS.SYSTEM.TOKEN);
    if (token) toPath('/');
};

const login = async () => {
    if (!loginInfo.value.username || !loginInfo.value.password) {
        alert('请输入账号和密码', 'warning');
        return;
    }
    isLoading.value = true;
    loginVerify();
    try {
        const token = await http.post('/auth/getToken', loginInfo.value);
        setToken(token);
        await getUserInfo();
    } finally {
        isLoading.value = false;
    }
};

const loginSSO = async () => {
    loginVerify();
    const token = await http.post('/auth/getTokenSSO', undefined, { params: ssoInfo.value });
    setToken(token);
    await getUserInfo();
};

async function getUserInfo() {
    const data = await http.post('/auth/userInfo');
    saveUserInfo(data);
    toPath(path.value);
}

const ssoPath = (sys: string) => {
    window.location.href = `/joker-box/sso/oauth2/authorization/${sys}`;
};

const toHome = () => { toPath('/'); };
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,700;9..144,900&family=JetBrains+Mono:wght@400;500;600&family=Noto+Serif+SC:wght@500;700;900&display=swap');

/* ============================================================
   容器与背景 —— 印刷车间网格
   ============================================================ */
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--auth-bg);
    position: relative;
    overflow: hidden;
    padding: 24px;
}

.press-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

/* 细网格线 —— 模拟印刷模板 */
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

/* 印刷对位十字标 —— 四角 */
.reg-mark {
    position: absolute;
    width: 28px; height: 28px;
    opacity: 0.35;
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
.reg-mark {
    border: 1px solid var(--brand-primary);
    border-radius: 50%;
}
.reg-tl { top: 40px; left: 40px; }
.reg-tr { top: 40px; right: 40px; }
.reg-bl { bottom: 40px; left: 40px; }
.reg-br { bottom: 40px; right: 40px; }

/* 背景元数据 */
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
   主卡片
   ============================================================ */
.login-card {
    width: 100%;
    max-width: 540px;
    position: relative;
    background: var(--bg-container);
    border: 1px solid var(--border-base);
    border-radius: 4px;
    padding: 22px 48px 28px;
    box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.04) inset,
        0 30px 60px -20px rgba(0, 0, 0, 0.55);
    animation: card-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1;
}

@keyframes card-rise {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
}

.login-card::before,
.login-card::after {
    content: '';
    position: absolute;
    width: 14px; height: 14px;
    border: 1px solid var(--brand-primary);
    opacity: 0.5;
}
.login-card::before {
    top: 8px; left: 8px;
    border-right: none; border-bottom: none;
}
.login-card::after {
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
    margin: 0 0 22px;
}

/* ============================================================
   标题区
   ============================================================ */
.title-block {
    text-align: left;
    margin-bottom: 28px;
    animation: fade-up 0.7s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.eyebrow {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--brand-primary);
    text-transform: uppercase;
    margin: 0 0 10px;
    font-weight: 500;
}

.title-zh {
    font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
    font-weight: 900;
    font-size: 52px;
    line-height: 1.05;
    letter-spacing: 6px;
    color: var(--text-primary);
    margin: 0 0 18px;
    display: inline-block;
}

.title-mark {
    position: relative;
    display: inline-block;
}
.title-mark::after {
    content: '';
    position: absolute;
    left: -2px; right: -2px;
    bottom: 6px;
    height: 12px;
    background: var(--brand-primary);
    opacity: 0.18;
    z-index: -1;
    transform: skewX(-6deg);
}

/* —— 引言 —— */
.quote-block {
    position: relative;
    padding-left: 22px;
    margin: 0;
    border-left: 2px solid var(--brand-primary);
}

.quote-mark {
    position: absolute;
    left: -6px;
    top: -22px;
    font-family: 'Fraunces', 'Cormorant Garamond', serif;
    font-size: 76px;
    font-weight: 900;
    line-height: 1;
    color: var(--brand-primary);
    opacity: 0.3;
    pointer-events: none;
}

.quote-text {
    font-family: 'Noto Serif SC', serif;
    font-size: 17px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 4px;
    letter-spacing: 3px;
    line-height: 1.5;
}

.quote-en {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-secondary);
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
    gap: 18px;
    animation: fade-up 0.7s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.field { display: flex; flex-direction: column; }

.field-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 6px;
}

.field-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-secondary);
    letter-spacing: 0.1em;
    font-weight: 500;
}

.field-label {
    font-family: 'Noto Serif SC', serif;
    font-size: 15px;
    color: var(--text-primary);
    font-weight: 500;
    letter-spacing: 3px;
    transition: color 0.2s var(--ease-out, ease-out);
}
.field-label.is-focus { color: var(--brand-primary); }

.field-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    opacity: 0.6;
    text-transform: uppercase;
}

.forgot-link {
    margin-left: auto;
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 13px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;
    border-bottom: 1px dashed transparent;
}
.forgot-link:hover {
    color: var(--brand-primary);
    border-bottom-color: var(--brand-primary);
}

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
.line-input :deep(.el-input__wrapper.is-focus)::after { right: 0; }

.line-input :deep(.el-input__wrapper:hover) {
    border-bottom-color: var(--text-secondary);
}

.line-input :deep(.el-input__inner) {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
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
    font-size: 15px;
}

.line-input :deep(.el-input__suffix) { color: var(--text-secondary); }

/* ---------- 记住我 ---------- */
.remember {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    align-self: flex-start;
}

.remember-box {
    position: absolute;
    opacity: 0;
    width: 0; height: 0;
}

.remember-mark {
    width: 16px; height: 16px;
    border: 1px solid var(--border-base);
    border-radius: 2px;
    background: transparent;
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s var(--ease-out, ease-out);
}
.remember-mark::after {
    content: '';
    position: absolute;
    inset: 3px;
    background: var(--brand-primary);
    border-radius: 1px;
    opacity: 0;
    transform: scale(0.4);
    transition: all 0.2s var(--ease-out, ease-out);
}
.remember-box:checked ~ .remember-mark { border-color: var(--brand-primary); }
.remember-box:checked ~ .remember-mark::after { opacity: 1; transform: scale(1); }

.remember-text {
    font-family: 'Noto Serif SC', serif;
    font-size: 13px;
    color: var(--text-secondary);
    letter-spacing: 1px;
}

/* ---------- 主提交按钮 ---------- */
.submit-btn {
    --bg: var(--text-primary);
    --fg: var(--bg-container);
    width: 100%;
    height: 52px;
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
    letter-spacing: 8px;
    border-radius: 2px;
    transition: all 0.3s var(--ease-out, ease-out);
    margin-top: 2px;
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
   SSO 区块
   ============================================================ */
.sso-section {
    margin-top: 24px;
    animation: fade-up 0.7s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.sso-divider {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
}

.sso-line {
    height: 1px;
    background: var(--border-base);
}

.sso-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.3em;
    color: var(--text-secondary);
    opacity: 0.7;
}

.sso-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.sso-btn {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    height: 46px;
    padding: 0 16px;
    border: 1px solid var(--border-base);
    background: transparent;
    color: var(--text-primary);
    border-radius: 2px;
    cursor: pointer;
    text-align: left;
    transition: all 0.25s var(--ease-out, ease-out);
    position: relative;
    overflow: hidden;
}

.sso-btn::before {
    content: '';
    position: absolute;
    left: 0; top: 0;
    width: 3px; height: 100%;
    background: var(--brand-primary);
    transform: translateX(-100%);
    transition: transform 0.25s ease;
}

.sso-btn:hover {
    border-color: var(--text-primary);
    transform: translateY(-1px);
}
.sso-btn:hover::before { transform: translateX(0); }

.sso-icon {
    width: 18px; height: 18px;
    color: var(--text-primary);
    transition: color 0.25s ease;
}

.sso-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--text-primary);
}

.sso-arrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: var(--text-secondary);
    transition: transform 0.25s ease;
}
.sso-btn:hover .sso-arrow {
    color: var(--brand-primary);
    transform: translateX(4px);
}

/* ============================================================
   底部脚注
   ============================================================ */
.card-foot {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 18px;
    margin-top: 22px;
    animation: fade-up 0.7s 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
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
@media (max-width: 600px) {
    .login-container { height: auto; min-height: 100vh; padding: 24px 16px; overflow-y: auto; }
    .login-card { padding: 22px 24px 28px; }
    .title-zh { font-size: 42px; letter-spacing: 4px; }
    .quote-text { font-size: 16px; letter-spacing: 2px; }
    .sso-grid { grid-template-columns: 1fr; }
    .card-bar { gap: 10px; }
    .issue-stamp { padding: 3px 8px; font-size: 10px; }
    .field-meta { display: none; }
    .reg-mark { display: none; }
    .bg-meta { display: none; }
}

@media (max-width: 480px) {
    .login-container { padding: 0; height: auto; }
    .login-card {
        border-radius: 0;
        border-left: none;
        border-right: none;
        padding: 22px 20px 28px;
        min-height: 100vh;
    }
    .title-zh { font-size: 36px; letter-spacing: 3px; }
    .submit-btn { letter-spacing: 6px; padding: 0 18px; }
    .brand-name { letter-spacing: 0.2em; }
    .card-foot { grid-template-columns: 1fr; }
    .foot-line { display: none; }
}
</style>
