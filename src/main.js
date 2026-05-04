import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 主题：先初始化（覆盖 EP 默认色），再加载我们自己的样式入口
import { initThemeEarly } from './composables/useTheme'
initThemeEarly()
import './assets/font.css'
import './assets/styles/main.scss'
import './assets/logicFlow/custom/icon/iconClass.css'

import registerComponents from './registerComponents';

import Clipboard from 'v-clipboard';

import zhCn from 'element-plus/dist/locale/zh-cn.mjs' // 引入中文语言包




const app = createApp(App)

app.use(router)

app.use(Clipboard)


app.use(ElementPlus, {
    locale: zhCn,
})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 注册所有图标组件
registerComponents(app);

app.mount('#app')
