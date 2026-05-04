// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/six6/todo/projects/Joker-Box-Web/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/six6/todo/projects/Joker-Box-Web/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueDevTools from "file:///C:/Users/six6/todo/projects/Joker-Box-Web/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/six6/todo/projects/Joker-Box-Web/vite.config.js";
var vite_config_default = defineConfig({
  base: "",
  server: {
    host: "0.0.0.0",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzaXg2XFxcXHRvZG9cXFxccHJvamVjdHNcXFxcSm9rZXItQm94LVdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcc2l4NlxcXFx0b2RvXFxcXHByb2plY3RzXFxcXEpva2VyLUJveC1XZWJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3NpeDYvdG9kby9wcm9qZWN0cy9Kb2tlci1Cb3gtV2ViL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiBcIlwiLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcHJveHk6IHtcbiAgICAgIC8vIFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RVxuICAgICAgJy9qb2tlci1ib3gnOiB7XG4gICAgICAgIC8vIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODEwMC8nLCAvLyBcdTc2RUVcdTY4MDdcdTY3MERcdTUyQTFcdTU2NjhcdTU3MzBcdTU3NDBcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MTAwLycsIC8vIFx1NzZFRVx1NjgwN1x1NjcwRFx1NTJBMVx1NTY2OFx1NTczMFx1NTc0MFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsIC8vIFx1NjUzOVx1NTNEOFx1OEJGN1x1NkM0Mlx1NTkzNFx1NEUyRFx1NzY4NG9yaWdpblx1NUI1N1x1NkJCNVxuICAgICAgICAvLyByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvam9rZXItYm94LywgJycpIC8vIFx1OTFDRFx1NTE5OVx1OERFRlx1NUY4NFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHZ1ZSgpLFxuICAgIHZ1ZURldlRvb2xzKCksXG4gIF0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFtcImxlZ2FjeS1qcy1hcGlcIl0sIC8vIFx1NTNDMlx1ODAwM1x1ODFFQSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODk5NzkwNy90aGUtbGVnYWN5LWpzLWFwaS1pcy1kZXByZWNhdGVkLWFuZC13aWxsLWJlLXJlbW92ZWQtaW4tZGFydC1zYXNzLTItMC0wXG4gICAgICB9XG4gICAgfVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VCxTQUFTLGVBQWUsV0FBVztBQUU1VixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxpQkFBaUI7QUFKNkssSUFBTSwyQ0FBMkM7QUFPdFAsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsTUFFTCxjQUFjO0FBQUE7QUFBQSxRQUVaLFFBQVE7QUFBQTtBQUFBLFFBQ1IsY0FBYztBQUFBO0FBQUE7QUFBQSxNQUVoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osbUJBQW1CO0FBQUEsUUFDbkIscUJBQXFCLENBQUMsZUFBZTtBQUFBO0FBQUEsTUFDdkM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
