import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/main.css'

import registerComponents from './registerComponents';

import Clipboard from 'v-clipboard';


const app = createApp(App)

app.use(router)

app.use(Clipboard)


app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 注册所有图标组件
registerComponents(app);

app.mount('#app')
