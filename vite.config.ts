import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const base = loadEnv(mode, '.', 'APP_BASE_PATH').APP_BASE_PATH || '/';
  if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('APP_BASE_PATH debe comenzar y terminar con /.');
  return { base, plugins: [react(), tailwindcss()] };
});
