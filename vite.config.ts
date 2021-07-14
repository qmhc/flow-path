import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FlowPath',
      fileName: 'flow-path'
    }
  },
  plugins: [
    vue(),
    dts({ staticImport: true })
  ]
})
