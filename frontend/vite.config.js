import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  css: {
    postcss: './postcss.config.cjs',
    preprocessorOptions: {
      css: {
        additionalData: `@import './styles/auth-lists.css';`
      }
    }
  },
  server: {
    port: 5173,
  },
});
