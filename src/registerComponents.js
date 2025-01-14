// registerComponents.js
// import { createApp } from 'vue';

// 使用 import.meta.glob 导入所有图标组件
const components = import.meta.glob('@/components/icon/*.vue', { eager: true });

const registerComponents = (app) => {
    Object.keys(components).forEach((path) => {
        const component = components[path].default;
        const name = path.split('/').pop().split('.')[0]; // 获取组件名称
        app.component(name, component);
    });
};

export default registerComponents;