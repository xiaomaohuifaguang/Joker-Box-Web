import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


/**
 * 自定义组件注册
 */
import CatRow from './components/cat/CatRow.vue'
import CatCol from './components/cat/CatCol.vue'
import CatCard from './components/cat/CatCard.vue'
import CatTable from './components/cat/CatTable.vue'
import CatPage from './components/cat/CatPage.vue'
import CatModal from './components/cat/CatModal.vue'
import CatSelect from './components/cat/CatSelect.vue'

const app = createApp(App)

/**
 * 自定义组件注册
 */
app.component('cat-row', CatRow);
app.component('cat-col', CatCol);
app.component('cat-card', CatCard);
app.component('cat-table', CatTable);
app.component('cat-page', CatPage);
app.component('cat-modal', CatModal);
app.component('cat-select', CatSelect);




app.use(router)

app.use(ElementPlus);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')
