import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        // 자주 바뀌지 않는 라이브러리를 앱 코드와 분리해 배포 후에도 브라우저 캐시를 재사용한다
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          motion: ['motion'],
          stomp: ['@stomp/stompjs'],
        },
      },
    },
  },

  server: {
    port: 35173,
    proxy: {
      '/api': 'http://localhost:38080',
      '/ws': {
        target: 'http://localhost:38080',
        ws: true,
      },
    },
  },
})
