import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import devServer from '@hono/vite-dev-server';
import cloudflareAdapter from '@hono/vite-dev-server/cloudflare';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    devServer({
      entry: 'api/app.ts',
      adapter: cloudflareAdapter,
      injectClientScript: false
    })
  ],
  server: {
    watch: {
      ignored: ['**/.pnpm-store/**', '**/node_modules/**'],
    }
  },
})