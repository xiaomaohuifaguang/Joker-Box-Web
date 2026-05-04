<template>
    <div class="index-page">
        <!-- 顶部 Hero 欢迎区 -->
        <section class="hero">
            <div class="hero-bg">
                <span class="blob blob-1"></span>
                <span class="blob blob-2"></span>
                <span class="blob blob-3"></span>
            </div>
            <el-row>
                <el-col :span="18" :offset="3">
                    <div class="hero-content">
                        <div class="hero-text">
                            <div class="hero-greeting">
                                <el-icon class="greet-icon">
                                    <component :is="greeting.icon" />
                                </el-icon>
                                <span>{{ greeting.text }}，{{ userName }}</span>
                            </div>
                            <h1 class="hero-title">
                                欢迎回到 <span class="brand">Joker Box</span>
                            </h1>
                            <p class="hero-subtitle">
                                {{ now.dateText }} · 第 {{ now.weekOfYear }} 周 · {{ now.weekDay }}
                            </p>
                            <div class="hero-actions">
                                <el-button type="primary" size="large" round @click="$router.push('/ganDaShi')">
                                    <el-icon><ChatDotRound /></el-icon>
                                    <span>去逛逛论坛</span>
                                </el-button>
                                <el-button size="large" round @click="$router.push('/person-space')">
                                    <el-icon><User /></el-icon>
                                    <span>个人空间</span>
                                </el-button>
                            </div>
                        </div>
                        <div class="hero-clock">
                            <div class="clock-time">{{ now.timeText }}</div>
                            <div class="clock-date">{{ now.fullDate }}</div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </section>

        <!-- 轮播图 -->
        <section class="carousel-section">
            <el-row>
                <el-col :span="18" :offset="3">
                    <el-carousel :interval="4500" type="card" height="28vh" indicator-position="outside">
                        <el-carousel-item v-for="item in carouselList" :key="item.title"
                            :style="{ backgroundImage: `url(${item.img})` }">
                            <div class="carousel-mask"></div>
                            <div class="carousel-text">
                                <h3>{{ item.title }}</h3>
                                <p>{{ item.author }}</p>
                            </div>
                        </el-carousel-item>
                    </el-carousel>
                </el-col>
            </el-row>
        </section>

        <!-- 数据概览 -->
        <section class="stats-section">
            <el-row :gutter="20">
                <el-col :span="18" :offset="3">
                    <el-row :gutter="20">
                        <el-col :xs="12" :sm="6" v-for="(item, idx) in stats" :key="idx">
                            <div class="stat-card" :style="{ '--grad': item.grad }">
                                <div class="stat-icon">
                                    <el-icon><component :is="item.icon" /></el-icon>
                                </div>
                                <div class="stat-info">
                                    <div class="stat-value">{{ item.value }}</div>
                                    <div class="stat-label">{{ item.label }}</div>
                                </div>
                                <div class="stat-trend" :class="item.trend > 0 ? 'up' : 'down'">
                                    <el-icon>
                                        <CaretTop v-if="item.trend > 0" />
                                        <CaretBottom v-else />
                                    </el-icon>
                                    <span>{{ Math.abs(item.trend) }}%</span>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </section>

        <!-- 快捷功能入口 -->
        <section class="features-section">
            <el-row>
                <el-col :span="18" :offset="3">
                    <div class="section-header">
                        <div class="section-title">
                            <el-icon class="title-icon"><Grid /></el-icon>
                            <span>快捷入口</span>
                        </div>
                        <div class="section-tip">点击卡片，即刻前往</div>
                    </div>
                    <el-row :gutter="20">
                        <el-col :xs="12" :sm="8" :md="6" v-for="(f, idx) in features" :key="idx">
                            <div class="feature-card" :style="{ '--grad': f.bg }" @click="goTo(f.path)">
                                <div class="feature-bg"></div>
                                <div class="feature-icon">
                                    <el-icon><component :is="f.icon" /></el-icon>
                                </div>
                                <div class="feature-name">{{ f.name }}</div>
                                <div class="feature-desc">{{ f.desc }}</div>
                                <div class="feature-arrow">
                                    <el-icon><ArrowRight /></el-icon>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </section>

        <!-- 公告与动态 -->
        <section class="info-section">
            <el-row :gutter="20">
                <el-col :span="18" :offset="3">
                    <el-row :gutter="20">
                        <el-col :xs="24" :md="12">
                            <div class="info-card">
                                <div class="info-header">
                                    <div class="info-title">
                                        <el-icon class="info-icon notice"><Bell /></el-icon>
                                        <span>系统公告</span>
                                    </div>
                                    <span class="info-more">更多 ›</span>
                                </div>
                                <ul class="info-list">
                                    <li v-for="(n, i) in notices" :key="i">
                                        <el-tag :type="n.type" size="small" effect="light" round>{{ n.tag }}</el-tag>
                                        <span class="info-text">{{ n.title }}</span>
                                        <span class="info-date">{{ n.date }}</span>
                                    </li>
                                </ul>
                            </div>
                        </el-col>
                        <el-col :xs="24" :md="12">
                            <div class="info-card">
                                <div class="info-header">
                                    <div class="info-title">
                                        <el-icon class="info-icon dynamic"><DataLine /></el-icon>
                                        <span>最新动态</span>
                                    </div>
                                    <span class="info-more">更多 ›</span>
                                </div>
                                <ul class="info-timeline">
                                    <li v-for="(d, i) in dynamics" :key="i">
                                        <span class="dot" :style="{ background: d.color }"></span>
                                        <div class="line"></div>
                                        <div class="content">
                                            <div class="content-title">{{ d.title }}</div>
                                            <div class="content-meta">
                                                <span>{{ d.user }}</span>
                                                <span>{{ d.time }}</span>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </section>

        <!-- 底部诗句横幅 -->
        <section class="quote-section">
            <el-row>
                <el-col :span="18" :offset="3">
                    <div class="quote-banner">
                        <el-icon class="quote-mark left"><DocumentCopy /></el-icon>
                        <div class="quote-text">{{ quote.text }}</div>
                        <div class="quote-author">—— {{ quote.author }}</div>
                        <el-icon class="quote-mark right"><DocumentCopy /></el-icon>
                    </div>
                </el-col>
            </el-row>
        </section>
    </div>
</template>

<script setup lang='ts'>
import { ref, computed, onMounted, onBeforeUnmount, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import {
    Sunrise, Sunny, Moon, MoonNight,
    ChatDotRound, User, Grid, Bell, DataLine, DocumentCopy,
    ArrowRight, CaretTop, CaretBottom,
    Collection, Folder, Cpu, Promotion, Tickets, Tools, Star, View
} from '@element-plus/icons-vue';

const router = useRouter();

// ========== 时间 / 问候 ==========
const now = ref({
    timeText: '',
    dateText: '',
    fullDate: '',
    weekDay: '',
    weekOfYear: 0,
});

const greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 6) return { text: '夜深了', icon: markRaw(MoonNight) };
    if (h < 11) return { text: '早上好', icon: markRaw(Sunrise) };
    if (h < 14) return { text: '中午好', icon: markRaw(Sunny) };
    if (h < 18) return { text: '下午好', icon: markRaw(Sunny) };
    if (h < 22) return { text: '晚上好', icon: markRaw(Moon) };
    return { text: '夜深了', icon: markRaw(MoonNight) };
});

const userName = computed(() => {
    try {
        const u = localStorage.getItem('userInfo');
        if (u) return JSON.parse(u)?.nickname || JSON.parse(u)?.username || '朋友';
    } catch { /* ignore */ }
    return '朋友';
});

function pad(n: number) { return n < 10 ? '0' + n : '' + n; }
function getWeekOfYear(d: Date) {
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = (d.getTime() - start.getTime()) / 86400000;
    return Math.ceil((diff + start.getDay() + 1) / 7);
}
function refreshNow() {
    const d = new Date();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    now.value = {
        timeText: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
        dateText: `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`,
        fullDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        weekDay: weekDays[d.getDay()],
        weekOfYear: getWeekOfYear(d),
    };
}
let timer: any = null;
onMounted(() => {
    refreshNow();
    timer = setInterval(refreshNow, 1000);
});
onBeforeUnmount(() => timer && clearInterval(timer));

// ========== 轮播图 ==========
const carouselList = ref([
    {
        title: '欲买桂花同载酒，终不似，少年游',
        author: '刘过 · 唐多令',
        img: '/static/img/a02bb40cf193c8cd0b1abaa1940b9e4e538ce8b4136392c0e5e1c9d29bc1bc75.png',
    },
    {
        title: '休对故人思故国，且将新火试新茶。诗酒趁年华',
        author: '苏轼 · 望江南',
        img: '/static/img/pexels-mhmtork-31643834.jpg',
    },
    {
        title: '须知少时凌云志，曾许人间第一流',
        author: '吴庆坻 · 题三十计小象',
        img: '/static/img/pexels-damla-selen-demir-429137893-30818195.jpg',
    },
]);

// ========== 数据统计（grad 引用主题数据色梯度，随主题切换） ==========
const stats = ref([
    { label: '今日访问', value: '1,286', trend: 12, icon: markRaw(View), grad: 'var(--data-grad-1)' },
    { label: '论坛帖子', value: '342', trend: 8, icon: markRaw(ChatDotRound), grad: 'var(--data-grad-2)' },
    { label: '工具调用', value: '5,721', trend: 21, icon: markRaw(Tools), grad: 'var(--data-grad-3)' },
    { label: '在线用户', value: '78', trend: -3, icon: markRaw(User), grad: 'var(--data-grad-4)' },
]);

// ========== 快捷功能（bg 引用主题数据色梯度，随主题切换） ==========
const features = ref([
    { name: '网站收藏', desc: '常用网站，一键直达', icon: markRaw(Collection), bg: 'var(--data-grad-1)', path: '/website' },
    { name: '码头', desc: '文件存储与共享', icon: markRaw(Folder), bg: 'var(--data-grad-4)', path: '/file-server' },
    { name: '代码生成器', desc: '快速生成 CRUD', icon: markRaw(Cpu), bg: 'var(--data-grad-5)', path: '/code-maker' },
    { name: '流程审批', desc: '可视化流程引擎', icon: markRaw(Promotion), bg: 'var(--data-grad-3)', path: '/process' },
    { name: '干大事论坛', desc: '分享你的故事', icon: markRaw(ChatDotRound), bg: 'var(--data-grad-2)', path: '/ganDaShi' },
    { name: 'JSON 工具', desc: '格式化 & 校验', icon: markRaw(Tickets), bg: 'var(--data-grad-4)', path: '/tools/jsonFormat' },
    { name: '个人空间', desc: '管理你的主页', icon: markRaw(User), bg: 'var(--data-grad-6)', path: '/person-space' },
    { name: '签到打卡', desc: '坚持每一天', icon: markRaw(Star), bg: 'var(--data-grad-1)', path: '/tools/signInCard' },
]);

// ========== 公告 / 动态 ==========
const notices = ref([
    { tag: '更新', type: 'primary', title: '系统升级至 v2.0，全新首页上线', date: '05-02' },
    { tag: '通知', type: 'success', title: '论坛新增表情包功能，快来体验', date: '04-28' },
    { tag: '活动', type: 'warning', title: '春日打卡活动开启，奖品丰厚', date: '04-20' },
    { tag: '修复', type: 'info', title: '修复部分浏览器下样式错乱问题', date: '04-15' },
    { tag: '公告', type: 'danger', title: '5 月 5 日凌晨 2:00 例行维护', date: '04-10' },
]);

const dynamics = ref([
    { title: '发布了新的代码片段：Vue3 自定义指令', user: '@张三', time: '2 分钟前', color: 'var(--data-1)' },
    { title: '在论坛回复了《如何优雅地写文档》', user: '@李四', time: '15 分钟前', color: 'var(--data-2)' },
    { title: '上传了新文件到「码头」', user: '@王五', time: '1 小时前', color: 'var(--data-4)' },
    { title: '完成了一项流程审批', user: '@赵六', time: '3 小时前', color: 'var(--data-5)' },
    { title: '更新了个人主页的封面', user: '@小七', time: '昨天', color: 'var(--data-3)' },
]);

// ========== 底部诗句 ==========
const quotes = [
    { text: '人生若只如初见，何事秋风悲画扇', author: '纳兰性德' },
    { text: '海内存知己，天涯若比邻', author: '王勃' },
    { text: '长风破浪会有时，直挂云帆济沧海', author: '李白' },
    { text: '不畏浮云遮望眼，自缘身在最高层', author: '王安石' },
];
const quote = ref(quotes[Math.floor(Math.random() * quotes.length)]);

// ========== 跳转 ==========
function goTo(path: string) {
    router.push(path);
}
</script>

<style scoped>
.index-page {
    padding: 24px 0 48px;
    background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-page) 30%, var(--bg-page) 100%);
    min-height: 100%;
}

/* ========== Hero ========== */
.hero {
    position: relative;
    padding: 32px 0 40px;
    overflow: hidden;
    margin-bottom: 24px;
}

.hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

.blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.45;
    animation: float 12s ease-in-out infinite;
}

.blob-1 { width: 280px; height: 280px; background: var(--data-1); top: -60px; left: 8%; }
.blob-2 { width: 220px; height: 220px; background: var(--data-2); top: 30px; right: 12%; animation-delay: -4s; }
.blob-3 { width: 200px; height: 200px; background: var(--data-3); bottom: -80px; left: 35%; animation-delay: -8s; }

@keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, -25px) scale(1.05); }
}

.hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.hero-greeting {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: var(--bg-container);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-pill);
    font-size: var(--fs-sm);
    color: var(--text-secondary);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
}

.greet-icon { color: var(--warning); }

.hero-title {
    font-size: var(--fs-3xl);
    font-weight: var(--fw-bold);
    margin: 16px 0 8px;
    color: var(--text-primary);
    letter-spacing: var(--ls-wide);
}

.brand {
    background: var(--brand-gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    color: var(--text-secondary);
    font-size: var(--fs-md);
    margin: 0 0 18px;
}

.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.hero-clock {
    text-align: right;
    padding: 16px 24px;
    background: var(--bg-container);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-light);
}

.clock-time {
    font-size: 38px;
    font-weight: var(--fw-semibold);
    font-family: 'Consolas', 'Monaco', monospace;
    background: var(--brand-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 2px;
}

.clock-date {
    font-size: var(--fs-sm);
    color: var(--text-secondary);
    margin-top: 2px;
    letter-spacing: var(--ls-wide);
}

/* ========== 轮播 ========== */
.carousel-section { margin-bottom: 32px; }

:deep(.el-carousel__item) {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    color: var(--text-on-brand);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

:deep(.el-carousel__item:nth-child(2n)),
:deep(.el-carousel__item:nth-child(2n + 1)) {
    background-color: transparent;
}

.carousel-mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.55) 100%);
    transition: opacity var(--duration-normal) var(--ease-out);
}

.carousel-text {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 18px 24px 22px;
    color: #fff;
    text-align: center;
}

.carousel-text h3 {
    margin: 0 0 4px;
    font-size: var(--fs-lg);
    font-weight: var(--fw-medium);
    text-shadow: var(--shadow-lg);
    letter-spacing: var(--ls-wide);
}

.carousel-text p {
    margin: 0;
    font-size: var(--fs-xs);
    opacity: 0.85;
    letter-spacing: 2px;
}

/* ========== 数据卡片 ========== */
.stats-section { margin-bottom: 32px; }

.stat-card {
    position: relative;
    padding: 20px;
    background: var(--bg-container);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: transform var(--duration-normal) var(--ease-out),
        box-shadow var(--duration-normal) var(--ease-out);
    margin-bottom: 16px;
    border: 1px solid var(--border-light);
}

.stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--grad);
    opacity: 0.06;
    pointer-events: none;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: var(--grad);
    color: var(--text-on-brand);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: var(--shadow-md);
    flex-shrink: 0;
}

.stat-info { flex: 1; min-width: 0; }
.stat-value {
    font-size: var(--fs-2xl);
    font-weight: var(--fw-bold);
    color: var(--text-primary);
    line-height: var(--lh-tight);
    font-family: 'Consolas', 'Monaco', sans-serif;
}
.stat-label { font-size: var(--fs-xs); color: var(--text-secondary); margin-top: 2px; }

.stat-trend {
    font-size: var(--fs-xs);
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    font-weight: var(--fw-semibold);
}
.stat-trend.up { color: var(--success); background: var(--success-bg); }
.stat-trend.down { color: var(--danger); background: var(--danger-bg); }

/* ========== 通用 section header ========== */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--fs-lg);
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
}

.title-icon {
    color: var(--brand-primary);
    font-size: 20px;
}

.section-tip { font-size: var(--fs-xs); color: var(--text-placeholder); }

/* ========== 功能卡 ========== */
.features-section { margin-bottom: 32px; }

.feature-card {
    position: relative;
    padding: 22px 18px 20px;
    border-radius: var(--radius-lg);
    background: var(--bg-container);
    cursor: pointer;
    overflow: hidden;
    transition: transform var(--duration-normal) var(--ease-out),
        box-shadow var(--duration-normal) var(--ease-out);
    box-shadow: var(--shadow-sm);
    margin-bottom: 16px;
    min-height: 130px;
    border: 1px solid var(--border-light);
}

.feature-bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: var(--grad);
    transition: opacity var(--duration-normal) var(--ease-out);
}

.feature-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
}

.feature-card:hover .feature-bg { opacity: 1; }
.feature-card:hover .feature-name,
.feature-card:hover .feature-desc,
.feature-card:hover .feature-arrow { color: var(--text-on-brand); }
.feature-card:hover .feature-icon {
    color: var(--text-on-brand);
    background: rgba(255, 255, 255, 0.18);
    transform: scale(1.1) rotate(-6deg);
}

.feature-icon {
    position: relative;
    z-index: 1;
    font-size: 28px;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: var(--brand-gradient-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    transition: background var(--duration-normal) var(--ease-out),
        color var(--duration-normal) var(--ease-out),
        transform var(--duration-normal) var(--ease-out);
    color: var(--brand-primary);
}

.feature-name {
    position: relative;
    z-index: 1;
    font-size: var(--fs-md);
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
    margin-bottom: 4px;
    transition: color var(--duration-normal) var(--ease-out);
}

.feature-desc {
    position: relative;
    z-index: 1;
    font-size: var(--fs-xs);
    color: var(--text-secondary);
    transition: color var(--duration-normal) var(--ease-out);
}

.feature-arrow {
    position: absolute;
    z-index: 1;
    top: 18px;
    right: 18px;
    color: var(--text-placeholder);
    transition: transform var(--duration-normal) var(--ease-out),
        color var(--duration-normal) var(--ease-out);
}

.feature-card:hover .feature-arrow {
    transform: translateX(4px);
}

/* ========== 公告 / 动态 ========== */
.info-section { margin-bottom: 32px; }

.info-card {
    background: var(--bg-container);
    border-radius: var(--radius-lg);
    padding: 18px 20px 8px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 16px;
    border: 1px solid var(--border-light);
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--border-divider);
}

.info-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--fs-md);
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
}

.info-icon {
    font-size: 18px;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-icon.notice { background: var(--warning-bg); color: var(--warning); }
.info-icon.dynamic { background: var(--bg-overlay); color: var(--brand-primary); }

.info-more {
    font-size: var(--fs-xs);
    color: var(--text-placeholder);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);
}
.info-more:hover { color: var(--brand-primary); }

.info-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.info-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px dashed var(--border-divider);
    font-size: var(--fs-sm);
}
.info-list li:last-child { border-bottom: none; }

.info-list .info-text {
    flex: 1;
    color: var(--text-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color var(--duration-fast) var(--ease-out);
    cursor: pointer;
}

.info-list li:hover .info-text { color: var(--brand-primary); }

.info-list .info-date {
    font-size: var(--fs-xs);
    color: var(--text-placeholder);
    flex-shrink: 0;
}

.info-timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
}

.info-timeline li {
    position: relative;
    padding: 0 0 16px 20px;
}

.info-timeline .dot {
    position: absolute;
    left: 0;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 0 3px var(--bg-overlay);
    z-index: 1;
}

.info-timeline .line {
    position: absolute;
    left: 4.5px;
    top: 16px;
    bottom: -4px;
    width: 1px;
    background: var(--border-divider);
}

.info-timeline li:last-child .line { display: none; }

.info-timeline .content-title {
    font-size: var(--fs-sm);
    color: var(--text-regular);
    line-height: var(--lh-normal);
}

.info-timeline .content-meta {
    font-size: var(--fs-xs);
    color: var(--text-placeholder);
    margin-top: 2px;
    display: flex;
    gap: 12px;
}

/* ========== 底部诗句 ========== */
.quote-section { margin-top: 8px; }

.quote-banner {
    position: relative;
    padding: 36px 60px;
    background: var(--auth-bg);
    border-radius: var(--radius-lg);
    text-align: center;
    color: var(--text-on-dark);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.quote-banner::before,
.quote-banner::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}

.quote-banner::before { top: -80px; left: -60px; }
.quote-banner::after { bottom: -100px; right: -80px; }

.quote-text {
    position: relative;
    font-size: var(--fs-xl);
    letter-spacing: 4px;
    font-weight: var(--fw-light);
    line-height: var(--lh-loose);
    margin-bottom: 8px;
    text-shadow: var(--shadow-md);
}

.quote-author {
    position: relative;
    font-size: var(--fs-sm);
    opacity: 0.7;
    letter-spacing: 2px;
}

.quote-mark {
    position: absolute;
    font-size: 32px;
    opacity: 0.15;
}

.quote-mark.left { top: 16px; left: 24px; }
.quote-mark.right { bottom: 16px; right: 24px; transform: rotate(180deg); }

/* ========== 响应式 ========== */
@media (max-width: 768px) {
    .hero-title { font-size: 26px; }
    .clock-time { font-size: 28px; }
    .quote-text { font-size: 16px; letter-spacing: 2px; }
    .quote-banner { padding: 24px 20px; }
}
</style>
