import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolve(dir) {
  return path.join(__dirname, dir)
}

// baseUrl 从环境变量读取，默认值为 localhost:8080

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载 .env 文件
  const env = loadEnv(mode, __dirname, '')

  // 构建 define，兼容 process.env.VUE_APP_* 旧模式
  const defines = {}
  for (const key in env) {
    if (key.startsWith('VUE_APP_') || key.startsWith('VITE_APP_')) {
      defines[`process.env.${key}`] = JSON.stringify(env[key])
    }
  }

  // 端口：继承旧版 vue.config.js 的环境变量/NPM 配置动态端口能力
  const devPort = (() => {
    const p = process.env.PORT || process.env.npm_config_port || 1024
    return Number(p)
  })()

  return {
    base: '/',
    define: defines,
    plugins: [
      vue(),
      vueJsx(),
      // SVG 图标
      createSvgIconsPlugin({
        iconDirs: [resolve('src/assets/icons/svg')],
        symbolId: 'icon-[name]',
      }),
      // 自动导入（Element Plus 已是全局注册，只导入 vue 相关 API）
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
      }),
      // Gzip 压缩（生产环境）
      viteCompression({
        verbose: false,
        disable: mode !== 'production',
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
    ],
    resolve: {
      alias: {
        '@': resolve('src'),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import'],
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: devPort,
      open: true,
      proxy: {
        '/dev-api': {
          target: env.VITE_APP_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, ''),
        },
        '/prod-api': {
          target: env.VITE_APP_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/prod-api/, ''),
        },
        '^/v3/api-docs/(.*)': {
          target: env.VITE_APP_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            element: ['element-plus', '@element-plus/icons-vue'],
            echarts: ['echarts'],
            quill: ['quill'],
          },
        },
      },
    },
  }
})
  
