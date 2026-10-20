import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({ plugins: [react()], base: './', resolve: { alias: { '@forge/bridge': path.resolve(__dirname, '../../shots/mock-bridge.js') } }, build: { outDir: '../../shots/build-viewer', chunkSizeWarningLimit: 4000, emptyOutDir: true } });
