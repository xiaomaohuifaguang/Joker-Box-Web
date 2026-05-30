// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///c:/Users/six6/todo/projects/Joker-Box-Web/node_modules/vite/dist/node/index.js";
import vue from "file:///c:/Users/six6/todo/projects/Joker-Box-Web/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueDevTools from "file:///c:/Users/six6/todo/projects/Joker-Box-Web/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///c:/Users/six6/todo/projects/Joker-Box-Web/vite.config.js";
var vite_config_default = defineConfig({
  base: "",
  server: {
    host: "0.0.0.0",
    port: 5199,
    proxy: {
      // 代理配置
      "/joker-box": {
        // target: 'http://localhost:8100/', // 目标服务器地址
        target: "http://localhost:8100/",
        // 目标服务器地址
        changeOrigin: true
        // 改变请求头中的origin字段
        // rewrite: (path) => path.replace(/^\/joker-box/, '') // 重写路径
      }
    }
  },
  plugins: [
    vue(),
    vueDevTools()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        javascriptEnabled: true,
        silenceDeprecations: ["legacy-js-api"]
        // 参考自 https://stackoverflow.com/questions/78997907/the-legacy-js-api-is-deprecated-and-will-be-removed-in-dart-sass-2-0-0
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJjOlxcXFxVc2Vyc1xcXFxzaXg2XFxcXHRvZG9cXFxccHJvamVjdHNcXFxcSm9rZXItQm94LVdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiYzpcXFxcVXNlcnNcXFxcc2l4NlxcXFx0b2RvXFxcXHByb2plY3RzXFxcXEpva2VyLUJveC1XZWJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2M6L1VzZXJzL3NpeDYvdG9kby9wcm9qZWN0cy9Kb2tlci1Cb3gtV2ViL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiBcIlwiLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogNTE5OSxcbiAgICBwcm94eToge1xuICAgICAgLy8gXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXG4gICAgICAnL2pva2VyLWJveCc6IHtcbiAgICAgICAgLy8gdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MTAwLycsIC8vIFx1NzZFRVx1NjgwN1x1NjcwRFx1NTJBMVx1NTY2OFx1NTczMFx1NTc0MFxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgxMDAvJywgLy8gXHU3NkVFXHU2ODA3XHU2NzBEXHU1MkExXHU1NjY4XHU1NzMwXHU1NzQwXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSwgLy8gXHU2NTM5XHU1M0Q4XHU4QkY3XHU2QzQyXHU1OTM0XHU0RTJEXHU3Njg0b3JpZ2luXHU1QjU3XHU2QkI1XG4gICAgICAgIC8vIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9qb2tlci1ib3gvLCAnJykgLy8gXHU5MUNEXHU1MTk5XHU4REVGXHU1Rjg0XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgdnVlRGV2VG9vbHMoKSxcbiAgXSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogW1wibGVnYWN5LWpzLWFwaVwiXSwgLy8gXHU1M0MyXHU4MDAzXHU4MUVBIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc4OTk3OTA3L3RoZS1sZWdhY3ktanMtYXBpLWlzLWRlcHJlY2F0ZWQtYW5kLXdpbGwtYmUtcmVtb3ZlZC1pbi1kYXJ0LXNhc3MtMi0wLTBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlULFNBQVMsZUFBZSxXQUFXO0FBRTVWLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLGlCQUFpQjtBQUo2SyxJQUFNLDJDQUEyQztBQU90UCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQSxNQUVMLGNBQWM7QUFBQTtBQUFBLFFBRVosUUFBUTtBQUFBO0FBQUEsUUFDUixjQUFjO0FBQUE7QUFBQTtBQUFBLE1BRWhCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixtQkFBbUI7QUFBQSxRQUNuQixxQkFBcUIsQ0FBQyxlQUFlO0FBQUE7QUFBQSxNQUN2QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
