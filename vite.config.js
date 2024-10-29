import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  server: {
    host: '0.0.0.0',
    proxy: {
      // 代理配置
      '/joker-box': {
        // target: 'http://localhost:8100/', // 目标服务器地址
        target: 'http://localhost:8100/', // 目标服务器地址
        changeOrigin: true, // 改变请求头中的origin字段
        // rewrite: (path) => path.replace(/^\/joker-box/, '') // 重写路径
      }
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
