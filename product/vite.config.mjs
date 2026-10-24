import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  build: { rollupOptions: { output: { manualChunks: id => id.includes('node_modules/three/') ? 'three' : undefined }, input: { screen: resolve(import.meta.dirname, 'index.html'), admin: resolve(import.meta.dirname, 'admin.html') } } },
  server: { host: '0.0.0.0', proxy: Object.fromEntries(['users-template.xlsx','theme','getTempData','getUsers','draw','redraw','reset','saveData','errorData','export','settings','importUsers','reloadUsers','health'].map(p => ['/'+p, 'http://127.0.0.1:8888'])) }
});
