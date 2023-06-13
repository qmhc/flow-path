import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FlowPath',
      formats: ['cjs', 'es', 'iife'],
      fileName: format => `flow-path.${format === 'es' ? 'mjs' : format === 'cjs' ? 'cjs' : 'js'}`
    },
    rollupOptions: {
      external: ['@vue', 'vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  plugins: [
    vue(),
    dts({ rollupTypes: true })
  ]
})
